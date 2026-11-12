/**
 * Central Game Engine - Single Source of Truth
 * Coordinates all game mechanics, AI turns, audio, and all 8 live Data Structure instances.
 */

import {
  BOARD_CELLS,
  CHALLENGE_CELL_IDS,
  FINISH_CELL_ID,
  GAME_TOKENS,
  PENALTY_CELL_IDS,
  POWERUP_CELL_IDS,
  POWERUP_DEFINITIONS,
  TOKEN_CELL_IDS,
  validateCellMapping,
} from '../data/boardConfig';
import { getRandomChallenge } from '../data/challenges';
import { ChallengeQueue, ChallengeQueueItem } from '../data-structures/ChallengeQueue';
import { CircularQueue } from '../data-structures/CircularQueue';
import { DoublyLinkedList } from '../data-structures/DoublyLinkedList';
import { EventHistory, ReplayEngine } from '../data-structures/EventHistory';
import { PowerUpManager } from '../data-structures/PowerUpManager';
import { ScoreHashMap } from '../data-structures/ScoreHashMap';
import { Stack } from '../data-structures/Stack';
import { PlayerTokenManager } from '../data-structures/TokenCollection';
import {
  ActiveChallenge,
  CellInfo,
  GameActionType,
  GameEvent,
  GameSnapshot,
  OperationLog,
  Player,
  PowerUpType,
  TokenItem,
} from '../types/game';
import { soundFx } from '../utils/audio';

export type GameListener = () => void;

export class GameEngine {
  // 1. Data Structures (Real instances)
  public movementLists: Map<string, DoublyLinkedList>; // PlayerId -> DoublyLinkedList
  public turnQueue: CircularQueue<string>; // CircularQueue of player IDs
  public tokenManagers: Map<string, PlayerTokenManager>; // PlayerId -> (LinkedList + HashSet)
  public undoStack: Stack<GameSnapshot>; // Stack of full game snapshots
  public powerUpManager: PowerUpManager; // HashMap + Queue + Set
  public challengeQueue: ChallengeQueue; // FIFO Queue for challenges
  public eventHistory: EventHistory; // Event List + Replay
  public scoreMap: ScoreHashMap; // HashMap for scores

  // 2. State variables
  public players: Player[] = [];
  public isGameOver: boolean = false;
  public winner: Player | null = null;
  public isMoving: boolean = false;
  public lastDiceRoll: number | null = null;
  public pendingPowerUpClaim: { playerId: string; options: PowerUpType[] } | null = null;
  public activeChallenge: ActiveChallenge | null = null;
  public latestOperation: OperationLog | null = null;

  // 3. Observers / listeners
  private listeners: Set<GameListener> = new Set();
  private aiTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly STORAGE_KEY = 'TECH_QUEST_GAME_STATE_V1';

  constructor() {
    this.movementLists = new Map();
    this.turnQueue = new CircularQueue(8);
    this.tokenManagers = new Map();
    this.undoStack = new Stack(50);
    this.powerUpManager = new PowerUpManager();
    this.challengeQueue = new ChallengeQueue();
    this.eventHistory = new EventHistory();
    this.scoreMap = new ScoreHashMap();

    // Validate board mapping on initialization
    const check = validateCellMapping();
    if (!check.isValid) {
      console.error('Board mapping validation error:', check.errors);
    }
  }

  // --- Subscription system ---
  public subscribe(listener: GameListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify(): void {
    this.saveToStorage();
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error in game listener:', err);
      }
    });
  }

  // --- Operation Explanation Logger ---
  public logOperation(
    operationName: string,
    dataStructureName: string,
    beforeState: string,
    action: string,
    afterState: string,
    elementCount: number,
    explanation: string
  ): void {
    this.latestOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: Date.now(),
      operationName,
      dataStructureName,
      beforeState,
      action,
      afterState,
      elementCount,
      explanation,
    };
  }

  // --- Game Initialization ---
  public initGame(configuredPlayers: Omit<Player, 'position' | 'score' | 'tokens' | 'powerUps' | 'hasShield' | 'hasDoubleScore' | 'isFinished' | 'movementHistory'>[]): void {
    if (this.aiTimer) {
      clearTimeout(this.aiTimer);
      this.aiTimer = null;
    }

    this.movementLists.clear();
    this.turnQueue = new CircularQueue(Math.max(8, configuredPlayers.length * 2));
    this.tokenManagers.clear();
    this.undoStack.clear();
    this.powerUpManager.resetSupply();
    this.challengeQueue = new ChallengeQueue();
    this.eventHistory.clear();
    this.scoreMap = new ScoreHashMap();
    this.isGameOver = false;
    this.winner = null;
    this.isMoving = false;
    this.lastDiceRoll = null;
    this.pendingPowerUpClaim = null;
    this.activeChallenge = null;

    this.players = configuredPlayers.map((p) => {
      const player: Player = {
        ...p,
        position: 0,
        score: 0,
        tokens: [],
        powerUps: [],
        hasShield: false,
        hasDoubleScore: false,
        isFinished: false,
        movementHistory: [0],
      };

      // Initialize player DoublyLinkedList
      const dll = new DoublyLinkedList();
      dll.append({
        position: 0,
        stepIndex: 0,
        actionDescription: 'Start (Origin)',
        timestamp: Date.now(),
      });
      this.movementLists.set(player.id, dll);

      // Initialize player TokenManager
      this.tokenManagers.set(player.id, new PlayerTokenManager());

      // Initialize score in HashMap
      this.scoreMap.setScore(player.id, 0);

      // Enqueue player in CircularQueue
      this.turnQueue.enqueue(player.id);

      return player;
    });

    this.eventHistory.logEvent(
      'SYSTEM',
      'Game Arbiter',
      '#6366f1',
      'GAME_START',
      'Quest Began',
      `Game started with ${this.players.length} players. Circular turn queue initialized.`,
      { dataStructureInvolved: 'CircularQueue' }
    );

    this.logOperation(
      'ENQUEUE_ALL',
      'Circular Queue',
      'EMPTY [ ]',
      `Enqueued ${this.players.length} players into circular turn queue`,
      `FRONT -> [ ${this.players.map((p) => p.name).join(' -> ')} ] <- REAR`,
      this.players.length,
      'Initialized round-robin player turns with FRONT pointing to player 1 and REAR pointing to the last player.'
    );

    this.notify();
    this.checkAITurn();
  }

  // --- Current Player Access ---
  public getCurrentPlayer(): Player | null {
    if (this.players.length === 0 || this.isGameOver) return null;
    const currentId = this.turnQueue.peek();
    if (!currentId) return null;
    return this.players.find((p) => p.id === currentId) || null;
  }

  // --- Snapshot Creation for Undo Stack ---
  public createSnapshot(actionName: string): GameSnapshot {
    return {
      players: JSON.parse(JSON.stringify(this.players)),
      currentTurnIndex: 0,
      powerUpSupply: Object.fromEntries(
        (Object.keys(POWERUP_DEFINITIONS) as PowerUpType[]).map((t) => [
          t,
          this.powerUpManager.search(t),
        ])
      ) as Record<PowerUpType, number>,
      usedPowerUps: this.powerUpManager.getUsedQueue().map((u) => ({
        playerId: u.playerId,
        type: u.type,
        timestamp: u.timestamp,
      })),
      activeChallenge: this.activeChallenge ? JSON.parse(JSON.stringify(this.activeChallenge)) : null,
      pendingChallenges: this.challengeQueue.display().map((c) => c.question),
      completedChallengesCount: this.challengeQueue.getHistory().length,
      turnOrder: this.turnQueue.display(),
      skippedPlayerIds: [],
      isGameOver: this.isGameOver,
      winnerId: this.winner ? this.winner.id : null,
      eventCount: this.eventHistory.count(),
      lastActionDescription: actionName,
    };
  }

  // --- Dice Rolling & Step-By-Step Movement ---
  public async rollDice(): Promise<number | null> {
    const player = this.getCurrentPlayer();
    if (!player || this.isMoving || this.isGameOver || this.activeChallenge || this.pendingPowerUpClaim) {
      return null;
    }

    if (player.isFinished) {
      this.advanceTurn();
      return null;
    }

    // Capture snapshot for Undo Stack BEFORE movement
    const snapshot = this.createSnapshot(`Move by Player ${player.name}`);
    this.undoStack.push(snapshot, `Roll & Move: ${player.name}`);
    this.logOperation(
      'PUSH',
      'Stack',
      `Stack size: ${this.undoStack.size() - 1}`,
      `Pushed game state snapshot before ${player.name}'s roll`,
      `TOP -> Snapshot (${player.name} at cell ${player.position})`,
      this.undoStack.size(),
      'Recorded an atomic snapshot of all player positions, scores, and inventories onto the LIFO undo stack.'
    );

    // Roll standard 6-sided dice (1-6)
    const roll = Math.floor(Math.random() * 6) + 1;
    this.lastDiceRoll = roll;
    soundFx.playDiceRoll();

    this.eventHistory.logEvent(
      player.id,
      player.name,
      player.color,
      'DICE_ROLL',
      'Dice Rolled',
      `${player.name} rolled a ${roll}!`,
      { scoreChange: 0 }
    );

    this.isMoving = true;
    this.notify();

    // Calculate clockwise path with bounce-back logic
    const path = this.calculatePath(player.position, roll);

    // Step-by-step movement animation
    for (let i = 0; i < path.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      player.position = path[i];
      soundFx.playMoveStep();

      // Append to DoublyLinkedList
      const dll = this.movementLists.get(player.id);
      if (dll) {
        dll.append({
          position: path[i],
          stepIndex: dll.count(),
          actionDescription: `Step to cell ${path[i]}`,
          timestamp: Date.now(),
        });
      }
      player.movementHistory.push(path[i]);
      this.notify();
    }

    this.isMoving = false;

    // Movement completed: log DLL operation
    const dll = this.movementLists.get(player.id);
    const beforePositions = dll ? dll.display().slice(-4, -1).map((d) => d.position).join(' ⇄ ') : '0';
    this.logOperation(
      'APPEND_NODES',
      'Doubly Linked List',
      `... ⇄ ${beforePositions}`,
      `${player.name} moved by ${roll} steps to cell ${player.position}`,
      `... ⇄ ${player.position} (TAIL)`,
      dll ? dll.count() : 0,
      `Appended ${path.length} new node(s) with previous and next pointers. The tail pointer now points to cell ${player.position}.`
    );

    // Process landing cell effects
    await this.handleCellLanding(player);
    return roll;
  }

  /**
   * Calculates path clockwise from current position with bounce-back logic.
   * Example: pos = 38, roll = 5: 39 -> 40 -> 39 -> 38 -> 37.
   */
  public calculatePath(currentPos: number, roll: number): number[] {
    const path: number[] = [];
    let pos = currentPos;
    let forward = true;

    for (let step = 0; step < roll; step++) {
      if (forward) {
        pos++;
        if (pos === FINISH_CELL_ID && step < roll - 1) {
          // Hit 40 with steps remaining -> bounce backward
          path.push(pos);
          forward = false;
        } else {
          path.push(pos);
        }
      } else {
        pos--;
        path.push(pos);
      }
    }
    return path;
  }

  // --- Landing Cell Handler ---
  private async handleCellLanding(player: Player): Promise<void> {
    const cellId = player.position;

    // 1. Finish Cell Check (cell 40)
    if (cellId === FINISH_CELL_ID) {
      player.isFinished = true;
      player.finishTimestamp = Date.now();
      const finishedCount = this.players.filter((p) => p.isFinished).length;
      player.finishRank = finishedCount;

      soundFx.playVictory();
      this.eventHistory.logEvent(
        player.id,
        player.name,
        player.color,
        'PLAYER_FINISH',
        'Finish Reached!',
        `${player.name} landed exactly on cell 40 and finished the quest! (Rank #${finishedCount})`,
        { dataStructureInvolved: 'CircularQueue' }
      );

      // Dequeue from CircularQueue
      this.turnQueue.remove(player.id);
      this.logOperation(
        'DEQUEUE',
        'Circular Queue',
        `Queue size: ${this.turnQueue.size() + 1}`,
        `Removed finished player ${player.name} from active turn rotation`,
        `Remaining in queue: [ ${this.turnQueue.display().join(', ')} ]`,
        this.turnQueue.size(),
        'Finished players are safely dequeued from the circular queue so they take no further turns.'
      );

      // Check if all players finished
      if (this.players.every((p) => p.isFinished)) {
        this.completeGame();
        return;
      }

      this.notify();
      this.checkAITurn();
      return;
    }

    // 2. Token Cells
    if (TOKEN_CELL_IDS.includes(cellId)) {
      const token = GAME_TOKENS[cellId];
      if (token) {
        const tokenMgr = this.tokenManagers.get(player.id);
        if (tokenMgr) {
          const beforeTokens = tokenMgr.getTokens().map((t) => t.id).join(' -> ') || 'EMPTY';
          const { success, isDuplicate } = tokenMgr.collectToken(token);

          if (success) {
            let pts = 5;
            if (player.hasDoubleScore) {
              pts = 10;
              player.hasDoubleScore = false;
              this.eventHistory.logEvent(
                player.id,
                player.name,
                player.color,
                'POWERUP_USE',
                'Double Score Applied',
                `Double Score amplified the token reward to +10 points!`,
                { scoreChange: 5 }
              );
            }

            player.tokens.push(token.id);
            this.scoreMap.addScore(player.id, pts, `Collected token ${token.name}`);
            player.score = this.scoreMap.getScore(player.id);
            soundFx.playTokenCollect();

            this.eventHistory.logEvent(
              player.id,
              player.name,
              player.color,
              'TOKEN_COLLECT',
              'Data Token Collected',
              `Collected ${token.name} (${token.id})! +${pts} points awarded.`,
              { scoreChange: pts, dataStructureInvolved: 'TokenHashSet & TokenLinkedList' }
            );

            this.logOperation(
              'INSERT & HASH',
              'Linked List + HashSet',
              `List: [ ${beforeTokens} ] | HashSet: contains("${token.id}") === false`,
              `Added ${token.name} to Linked List and inserted "${token.id}" into HashSet bucket`,
              `List: [ ${tokenMgr.getTokens().map((t) => t.id).join(' -> ')} ] | Set count: ${tokenMgr.count()}`,
              tokenMgr.count(),
              `Token was inserted into the player's ordered linked list, and its ID was hashed into the HashSet bucket for O(1) duplicate checks.`
            );
          } else if (isDuplicate) {
            this.eventHistory.logEvent(
              player.id,
              player.name,
              player.color,
              'TOKEN_ALREADY_OWNED',
              'Duplicate Token',
              `${player.name} already owns ${token.name} (${token.id}). HashSet prevented duplicate collection.`,
              { scoreChange: 0, dataStructureInvolved: 'TokenHashSet' }
            );

            this.logOperation(
              'LOOKUP',
              'Token HashSet',
              `HashSet contains: [ ${tokenMgr.getTokens().map((t) => t.id).join(', ')} ]`,
              `Evaluated HashSet.contains("${token.id}") -> true`,
              'Collection aborted (No points)',
              tokenMgr.count(),
              `The HashSet verified in O(1) time that token ${token.id} has already been collected by this player, rejecting duplicate points.`
            );
          }
        }
      }
      this.advanceTurn();
      return;
    }

    // 3. Power-Up Cells
    if (POWERUP_CELL_IDS.includes(cellId)) {
      soundFx.playPowerUpGet();
      // Present options or claim an available powerup
      const available = (Object.keys(POWERUP_DEFINITIONS) as PowerUpType[]).filter((t) =>
        this.powerUpManager.isAvailable(t)
      );

      if (available.length === 0) {
        this.eventHistory.logEvent(
          player.id,
          player.name,
          player.color,
          'POWERUP_SUPPLY_EMPTY',
          'Supply Depleted',
          `Shared power-up supply is completely exhausted!`,
          { scoreChange: 0, dataStructureInvolved: 'PowerUpManager' }
        );
        this.advanceTurn();
        return;
      }

      if (player.isAI) {
        // AI picks first or best available powerup
        const chosen = available[Math.floor(Math.random() * available.length)];
        this.claimPowerUp(player.id, chosen);
        this.advanceTurn();
      } else {
        // Human player selection modal
        this.pendingPowerUpClaim = {
          playerId: player.id,
          options: available,
        };
        this.notify();
      }
      return;
    }

    // 4. Challenge Cells
    if (CHALLENGE_CELL_IDS.includes(cellId)) {
      const excludedIds = this.challengeQueue.getHistory().map((c) => c.question.id);
      const question = getRandomChallenge(excludedIds);

      this.challengeQueue.enqueue(question, player.id, player.name);

      this.activeChallenge = {
        question,
        playerId: player.id,
        attemptsMade: 0,
        maxAttempts: 2,
        status: 'pending',
      };

      this.eventHistory.logEvent(
        player.id,
        player.name,
        player.color,
        'CHALLENGE_GENERATE',
        'Algorithm Gate Engaged',
        `Challenged by: ${question.category} - "${question.question.substring(0, 50)}..."`,
        { dataStructureInvolved: 'ChallengeQueue' }
      );

      this.logOperation(
        'ENQUEUE',
        'Challenge Queue',
        `Pending queue size: ${this.challengeQueue.size() - 1}`,
        `Enqueued question "${question.id}" (${question.category}) to the rear of Challenge Queue`,
        `FRONT -> [ ${this.challengeQueue.display().map((c) => c.question.id).join(' -> ')} ] <- REAR`,
        this.challengeQueue.size(),
        'New algorithmic challenge entered the FIFO processing queue for evaluation.'
      );

      this.notify();

      if (player.isAI) {
        this.processAIChallenge(player);
      }
      return;
    }

    // 5. Penalty Cells
    if (PENALTY_CELL_IDS.includes(cellId)) {
      if (player.hasShield) {
        // Firewall Shield protects!
        player.hasShield = false;
        soundFx.playPowerUpUse();

        this.eventHistory.logEvent(
          player.id,
          player.name,
          player.color,
          'PENALTY_SHIELDED',
          'Penalty Blocked!',
          `Firewall Shield deflected the memory leak penalty on cell ${cellId}! (0 pts lost)`,
          { scoreChange: 0, dataStructureInvolved: 'ScoreHashMap' }
        );

        this.logOperation(
          'INTERCEPT',
          'PowerUpManager + ScoreHashMap',
          `Shield: ACTIVE | Score: ${player.score}`,
          'Firewall Shield consumed upon landing on penalty cell',
          `Shield: EXHAUSTED | Score: ${player.score} (Unchanged)`,
          1,
          'Shield protected the player from the -5 penalty; shield status was consumed.'
        );
      } else {
        // Apply -5 penalty
        soundFx.playPenalty();
        this.scoreMap.deductScore(player.id, 5, `Penalty cell #${cellId}`);
        player.score = this.scoreMap.getScore(player.id);

        this.eventHistory.logEvent(
          player.id,
          player.name,
          player.color,
          'PENALTY_APPLIED',
          'Memory Corruption Penalty',
          `Landed on Penalty Cell #${cellId}. 5 points deducted!`,
          { scoreChange: -5, dataStructureInvolved: 'ScoreHashMap' }
        );

        this.logOperation(
          'DEDUCT',
          'Score HashMap',
          `ScoreMap("${player.id}"): ${player.score + 5}`,
          `Deducted 5 points from player ${player.name}`,
          `ScoreMap("${player.id}"): ${player.score}`,
          this.scoreMap.entries().length,
          'Updated score mapping directly in the Score HashMap in O(1) time.'
        );
      }
      this.advanceTurn();
      return;
    }

    // 6. Safe Cells: Advance turn directly
    this.advanceTurn();
  }

  // --- Power-Up Acquisition ---
  public claimPowerUp(playerId: string, type: PowerUpType): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return false;

    const result = this.powerUpManager.claim(playerId, type);
    if (!result.success) {
      return false;
    }

    player.powerUps = this.powerUpManager.getPlayerInventory(playerId);
    const def = POWERUP_DEFINITIONS[type];

    this.eventHistory.logEvent(
      player.id,
      player.name,
      player.color,
      'POWERUP_COLLECT',
      'Power-up Acquired',
      `Acquired "${def.name}". (Supply remaining: ${this.powerUpManager.search(type)})`,
      { dataStructureInvolved: 'PowerUpManager (HashMap)' }
    );

    this.logOperation(
      'DECREMENT & MAP',
      'Power-Up Supply HashMap',
      `SupplyMap("${type}"): ${this.powerUpManager.search(type) + 1}`,
      `Player ${player.name} claimed 1 unit of ${def.name}`,
      `SupplyMap("${type}"): ${this.powerUpManager.search(type)} | Inventory count: ${player.powerUps.length}`,
      this.powerUpManager.getSupplyEntries().reduce((a, b) => a + b.count, 0),
      `Updated shared supply HashMap and registered the item into ${player.name}'s inventory list.`
    );

    this.pendingPowerUpClaim = null;
    this.notify();
    return true;
  }

  // --- Power-Up Usage ---
  public usePowerUp(playerId: string, type: PowerUpType, targetBonusTokenId?: string): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || this.isMoving || this.isGameOver || this.activeChallenge) return false;

    // Snapshot before power-up for Undo
    const snapshot = this.createSnapshot(`Use Power-up: ${type}`);
    this.undoStack.push(snapshot, `Power-up: ${type}`);

    const result = this.powerUpManager.use(playerId, player.name, type);
    if (!result.success) {
      this.undoStack.pop();
      return false;
    }

    player.powerUps = this.powerUpManager.getPlayerInventory(playerId);
    soundFx.playPowerUpUse();
    const def = POWERUP_DEFINITIONS[type];

    // Execute power-up effect
    switch (type) {
      case 'extra_move': {
        // Player rolls again without advancing turn
        this.eventHistory.logEvent(
          player.id,
          player.name,
          player.color,
          'POWERUP_USE',
          'Extra Move Activated',
          `${player.name} activated Extra Move! Roll again immediately.`,
          { dataStructureInvolved: 'CircularQueue' }
        );
        this.notify();
        return true;
      }

      case 'shield': {
        player.hasShield = true;
        this.eventHistory.logEvent(
          player.id,
          player.name,
          player.color,
          'POWERUP_USE',
          'Firewall Shield Raised',
          `${player.name} activated Firewall Shield! Next penalty is blocked.`,
          { dataStructureInvolved: 'PowerUpManager' }
        );
        this.notify();
        return true;
      }

      case 'skip_turn': {
        // Skip the next player in the circular queue
        const order = this.turnQueue.display();
        if (order.length > 1) {
          const nextPlayerId = order[1];
          const nextPlayer = this.players.find((p) => p.id === nextPlayerId);
          // Advance turnQueue past nextPlayer
          this.turnQueue.dequeue(); // remove current
          this.turnQueue.dequeue(); // remove next (skipped)
          if (nextPlayerId) this.turnQueue.enqueue(nextPlayerId); // re-enqueue skipped at rear
          this.turnQueue.enqueue(player.id); // re-enqueue current at rear

          this.eventHistory.logEvent(
            player.id,
            player.name,
            player.color,
            'TURN_SKIPPED',
            'Opponent Turn Skipped',
            `${player.name} skipped ${nextPlayer?.name || 'opponent'}'s turn via CircularQueue reordering!`,
            { dataStructureInvolved: 'CircularQueue' }
          );

          this.logOperation(
            'CYCLE_ROTATE',
            'Circular Queue',
            `Turn queue: [ ${order.join(', ')} ]`,
            `Skipped ${nextPlayer?.name} and updated front/rear queue positions`,
            `New order: [ ${this.turnQueue.display().join(', ')} ]`,
            this.turnQueue.size(),
            'Rotated circular queue pointers to bypass the skipped player without dropping them permanently.'
          );
        }
        this.notify();
        return true;
      }

      case 'double_score': {
        player.hasDoubleScore = true;
        this.eventHistory.logEvent(
          player.id,
          player.name,
          player.color,
          'POWERUP_USE',
          'Double Score Activated',
          `Next collected Data Token will award +10 points instead of +5!`,
          { dataStructureInvolved: 'ScoreHashMap' }
        );
        this.notify();
        return true;
      }

      case 'reverse_move': {
        // Move backward by 3 cells
        const newPos = Math.max(0, player.position - 3);
        const oldPos = player.position;
        player.position = newPos;

        const dll = this.movementLists.get(player.id);
        if (dll) {
          dll.append({
            position: newPos,
            stepIndex: dll.count(),
            actionDescription: 'Reverse Move (-3 cells)',
            timestamp: Date.now(),
          });
        }
        player.movementHistory.push(newPos);

        this.eventHistory.logEvent(
          player.id,
          player.name,
          player.color,
          'POWERUP_USE',
          'Reverse Move Executed',
          `${player.name} moved backwards from cell ${oldPos} to ${newPos}.`,
          { previousPosition: oldPos, newPosition: newPos, dataStructureInvolved: 'DoublyLinkedList' }
        );
        this.notify();
        return true;
      }

      case 'bonus_token': {
        // Select uncollected token
        const tokenMgr = this.tokenManagers.get(player.id);
        if (tokenMgr) {
          const targetToken = targetBonusTokenId
            ? Object.values(GAME_TOKENS).find((t) => t.id === targetBonusTokenId)
            : Object.values(GAME_TOKENS).find((t) => !tokenMgr.hasToken(t.id));

          if (targetToken) {
            tokenMgr.collectToken(targetToken);
            player.tokens.push(targetToken.id);
            this.scoreMap.addScore(player.id, 5, `Bonus token: ${targetToken.name}`);
            player.score = this.scoreMap.getScore(player.id);

            this.eventHistory.logEvent(
              player.id,
              player.name,
              player.color,
              'TOKEN_COLLECT',
              'Bonus Token Granted',
              `Selected bonus token ${targetToken.name} (${targetToken.id})! +5 points.`,
              { scoreChange: 5, dataStructureInvolved: 'TokenHashSet & TokenLinkedList' }
            );
          }
        }
        this.notify();
        return true;
      }
    }

    return true;
  }

  // --- Challenge Resolution ---
  public answerChallenge(selectedIndex: number): { isCorrect: boolean; retryAllowed: boolean } {
    if (!this.activeChallenge) return { isCorrect: false, retryAllowed: false };

    const { question, playerId } = this.activeChallenge;
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return { isCorrect: false, retryAllowed: false };

    this.activeChallenge.attemptsMade++;
    const isCorrect = selectedIndex === question.correctAnswerIndex;

    if (isCorrect) {
      soundFx.playChallengeCorrect();
      this.scoreMap.addScore(player.id, 8, `Solved challenge: ${question.id}`);
      player.score = this.scoreMap.getScore(player.id);
      this.challengeQueue.resolveCurrent('completed', 8);

      this.eventHistory.logEvent(
        player.id,
        player.name,
        player.color,
        'CHALLENGE_ANSWER_CORRECT',
        'Algorithm Mastered!',
        `Answered correctly! +8 points awarded. (${question.explanation})`,
        { scoreChange: 8, dataStructureInvolved: 'ChallengeQueue' }
      );

      this.logOperation(
        'DEQUEUE',
        'Challenge Queue',
        `Queue size: ${this.challengeQueue.size() + 1}`,
        `Dequeued resolved challenge ${question.id} (Status: COMPLETED)`,
        `Remaining pending challenges: ${this.challengeQueue.size()}`,
        this.challengeQueue.size(),
        'Task completed successfully; front challenge dequeued and archived into history.'
      );

      this.activeChallenge = null;
      this.advanceTurn();
      return { isCorrect: true, retryAllowed: false };
    } else {
      soundFx.playChallengeWrong();
      if (this.activeChallenge.attemptsMade === 1) {
        // First incorrect answer: -5 points and allow ONE retry!
        this.scoreMap.deductScore(player.id, 5, `Challenge attempt 1 failed`);
        player.score = this.scoreMap.getScore(player.id);
        this.challengeQueue.retry();

        this.eventHistory.logEvent(
          player.id,
          player.name,
          player.color,
          'CHALLENGE_ANSWER_INCORRECT',
          'First Attempt Incorrect',
          `Incorrect answer. -5 points deducted. 1 retry remaining!`,
          { scoreChange: -5, dataStructureInvolved: 'ChallengeQueue' }
        );

        this.logOperation(
          'RETRY_ATTEMPT',
          'Challenge Queue',
          'Attempts: 0/2',
          `Registered attempt 1 on FRONT question ${question.id}`,
          'Attempts: 1/2 (One retry permitted)',
          this.challengeQueue.size(),
          'First attempt failed; retry state updated in challenge queue while maintaining FRONT position.'
        );

        this.notify();
        return { isCorrect: false, retryAllowed: true };
      } else {
        // Second incorrect answer: no additional penalty, close challenge
        this.challengeQueue.resolveCurrent('failed', 0);

        this.eventHistory.logEvent(
          player.id,
          player.name,
          player.color,
          'CHALLENGE_ANSWER_INCORRECT',
          'Second Attempt Failed',
          `Second attempt incorrect. No further penalty. (${question.explanation})`,
          { scoreChange: 0, dataStructureInvolved: 'ChallengeQueue' }
        );

        this.logOperation(
          'DEQUEUE',
          'Challenge Queue',
          `Queue size: ${this.challengeQueue.size() + 1}`,
          `Dequeued failed challenge ${question.id} after 2 attempts`,
          `Remaining pending challenges: ${this.challengeQueue.size()}`,
          this.challengeQueue.size(),
          'Max attempts reached; dequeued from active queue.'
        );

        this.activeChallenge = null;
        this.advanceTurn();
        return { isCorrect: false, retryAllowed: false };
      }
    }
  }

  // --- AI Decision Logic ---
  private checkAITurn(): void {
    if (this.isGameOver) return;
    const current = this.getCurrentPlayer();
    if (!current || !current.isAI) return;

    if (this.aiTimer) {
      clearTimeout(this.aiTimer);
    }

    this.aiTimer = (typeof window !== 'undefined' ? window.setTimeout : setTimeout)(async () => {
      if (this.isGameOver) return;
      const player = this.getCurrentPlayer();
      if (!player || !player.isAI) return;

      // Check if AI possesses useful power-ups (Medium / Hard difficulty)
      if (player.aiDifficulty !== 'easy' && player.powerUps.length > 0) {
        if (player.powerUps.includes('shield') && !player.hasShield) {
          this.usePowerUp(player.id, 'shield');
        } else if (player.powerUps.includes('double_score') && !player.hasDoubleScore) {
          this.usePowerUp(player.id, 'double_score');
        }
      }

      // Roll dice
      await this.rollDice();
    }, 900);
  }

  private processAIChallenge(player: Player): void {
    setTimeout(() => {
      if (!this.activeChallenge || this.activeChallenge.playerId !== player.id) return;
      const question = this.activeChallenge.question;
      const diff = player.aiDifficulty || 'medium';

      let correctProb = 0.5; // easy
      if (diff === 'medium') correctProb = 0.75;
      if (diff === 'hard') correctProb = 0.95;

      const pickCorrect = Math.random() < correctProb;
      const answerIndex = pickCorrect
        ? question.correctAnswerIndex
        : (question.correctAnswerIndex + 1) % question.options.length;

      const res = this.answerChallenge(answerIndex);
      if (!res.isCorrect && res.retryAllowed) {
        // AI retry
        setTimeout(() => {
          this.answerChallenge(question.correctAnswerIndex);
        }, 1000);
      }
    }, 1200);
  }

  // --- Turn Management ---
  public advanceTurn(): void {
    if (this.isGameOver) return;

    // Filter out finished players
    const activeRemaining = this.players.filter((p) => !p.isFinished);
    if (activeRemaining.length === 0) {
      this.completeGame();
      return;
    }

    // Step the circular queue
    const oldFront = this.turnQueue.peek();
    const newFront = this.turnQueue.stepTurn();

    this.logOperation(
      'STEP_TURN',
      'Circular Queue',
      `FRONT -> Player (${oldFront})`,
      'Dequeued current player from FRONT and enqueued at REAR',
      `FRONT -> Player (${newFront})`,
      this.turnQueue.size(),
      'Circular rotation advanced the next eligible player to the FRONT of the queue.'
    );

    this.notify();
    this.checkAITurn();
  }

  // --- Complete Game ---
  private completeGame(): void {
    this.isGameOver = true;
    const rankings = this.scoreMap.displayRanking(this.players);
    this.winner = rankings[0]?.player || null;

    soundFx.playVictory();
    this.eventHistory.logEvent(
      'SYSTEM',
      'Game Arbiter',
      '#eab308',
      'GAME_OVER',
      'Quest Completed!',
      `All players reached the finish! Victor: ${this.winner?.name} with ${this.winner?.score} points.`,
      { dataStructureInvolved: 'ScoreHashMap' }
    );

    this.logOperation(
      'SORT_RANKINGS',
      'Score HashMap',
      'Unordered score map',
      'Evaluated final rankings by highest score and finish times',
      `Rank 1: ${this.winner?.name} (${this.winner?.score} pts)`,
      this.players.length,
      'Final tournament rankings computed from the Score HashMap.'
    );

    this.notify();
  }

  // --- Undo System (Complete State Restoration via Stack) ---
  public undo(): boolean {
    if (this.undoStack.isEmpty() || this.isMoving) {
      return false;
    }

    const frame = this.undoStack.pop();
    if (!frame) return false;

    const snapshot = frame.data;

    // Restore players
    this.players = JSON.parse(JSON.stringify(snapshot.players));

    // Restore DLL movements
    this.players.forEach((p) => {
      const dll = new DoublyLinkedList();
      p.movementHistory.forEach((pos, idx) => {
        dll.append({
          position: pos,
          stepIndex: idx,
          actionDescription: `Position ${pos}`,
          timestamp: Date.now(),
        });
      });
      this.movementLists.set(p.id, dll);
    });

    // Restore Token collections
    this.tokenManagers.clear();
    this.players.forEach((p) => {
      const tm = new PlayerTokenManager();
      p.tokens.forEach((tid) => {
        const item = Object.values(GAME_TOKENS).find((t) => t.id === tid);
        if (item) tm.collectToken(item);
      });
      this.tokenManagers.set(p.id, tm);
    });

    // Restore Score HashMap
    this.scoreMap = new ScoreHashMap();
    this.players.forEach((p) => {
      this.scoreMap.setScore(p.id, p.score);
    });

    // Restore Power-Up supply and inventories
    this.powerUpManager.restoreFromSnapshot({
      supply: snapshot.powerUpSupply,
      inventories: Object.fromEntries(this.players.map((p) => [p.id, p.powerUps])),
      used: snapshot.usedPowerUps.map((u) => ({
        id: `used_${u.timestamp}`,
        playerId: u.playerId,
        playerName: this.players.find((p) => p.id === u.playerId)?.name || 'Player',
        type: u.type,
        timestamp: u.timestamp,
      })),
    });

    // Restore CircularQueue
    this.turnQueue = new CircularQueue(Math.max(8, snapshot.turnOrder.length * 2));
    snapshot.turnOrder.forEach((pid) => this.turnQueue.enqueue(pid));

    // Restore Challenge state
    this.activeChallenge = snapshot.activeChallenge
      ? JSON.parse(JSON.stringify(snapshot.activeChallenge))
      : null;
    this.pendingPowerUpClaim = null;
    this.isGameOver = snapshot.isGameOver;
    this.winner = snapshot.winnerId ? this.players.find((p) => p.id === snapshot.winnerId) || null : null;

    // Roll back event history to sync
    while (this.eventHistory.count() > snapshot.eventCount) {
      this.eventHistory.removeLastEvent();
    }

    soundFx.playUndo();

    this.eventHistory.logEvent(
      'SYSTEM',
      'Game Arbiter',
      '#a855f7',
      'UNDO',
      'Undo Executed',
      `Reverted action: ${frame.actionName}. Full state restored from Stack.`,
      { dataStructureInvolved: 'Stack' }
    );

    this.logOperation(
      'POP',
      'Stack',
      `Stack size: ${this.undoStack.size() + 1}`,
      `Popped state snapshot "${frame.actionName}" from TOP of Undo Stack`,
      `New TOP: ${this.undoStack.peek() ? this.undoStack.peek()?.actionName : 'BASE'} (Size: ${this.undoStack.size()})`,
      this.undoStack.size(),
      'Reverted all player positions, scores, token sets, and power-up inventories to the exact pre-action snapshot.'
    );

    this.notify();
    return true;
  }

  // --- LocalStorage Persistence (with safe isomorphic fallback) ---
  public saveToStorage(): void {
    try {
      if (this.players.length === 0) return;
      const serialized = {
        players: this.players,
        turnOrder: this.turnQueue.display(),
        scores: this.scoreMap.snapshot(),
        powerUps: this.powerUpManager.snapshot(),
        events: this.eventHistory.snapshot(),
        isGameOver: this.isGameOver,
        winnerId: this.winner?.id || null,
        activeChallenge: this.activeChallenge,
      };
      setSafeStorage(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  public loadFromStorage(): boolean {
    try {
      const data = getSafeStorage(this.STORAGE_KEY);
      if (!data) return false;
      const parsed = JSON.parse(data);
      if (!parsed.players || !Array.isArray(parsed.players) || parsed.players.length === 0) {
        return false;
      }

      this.players = parsed.players;
      this.turnQueue = new CircularQueue(Math.max(8, parsed.turnOrder.length * 2));
      parsed.turnOrder.forEach((pid: string) => this.turnQueue.enqueue(pid));

      this.scoreMap = new ScoreHashMap();
      this.scoreMap.restoreFromSnapshot(parsed.scores || {});

      this.movementLists.clear();
      this.players.forEach((p) => {
        const dll = new DoublyLinkedList();
        p.movementHistory.forEach((pos, idx) => {
          dll.append({
            position: pos,
            stepIndex: idx,
            actionDescription: `Position ${pos}`,
            timestamp: Date.now(),
          });
        });
        this.movementLists.set(p.id, dll);
      });

      this.tokenManagers.clear();
      this.players.forEach((p) => {
        const tm = new PlayerTokenManager();
        p.tokens.forEach((tid) => {
          const item = Object.values(GAME_TOKENS).find((t) => t.id === tid);
          if (item) tm.collectToken(item);
        });
        this.tokenManagers.set(p.id, tm);
      });

      if (parsed.powerUps) {
        this.powerUpManager.restoreFromSnapshot(parsed.powerUps);
      }

      if (parsed.events) {
        this.eventHistory.restoreFromSnapshot(parsed.events);
      }

      this.isGameOver = !!parsed.isGameOver;
      this.winner = parsed.winnerId ? this.players.find((p) => p.id === parsed.winnerId) || null : null;
      this.activeChallenge = parsed.activeChallenge || null;

      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to restore saved game:', e);
      return false;
    }
  }

  public clearSavedGame(): void {
    removeSafeStorage(this.STORAGE_KEY);
  }
}

// Memory fallback store for headless testing environments
const memoryFallbackStore = new Map<string, string>();

function getSafeStorage(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return memoryFallbackStore.get(key) || null;
}

function setSafeStorage(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // ignore
  }
  memoryFallbackStore.set(key, value);
}

function removeSafeStorage(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // ignore
  }
  memoryFallbackStore.delete(key);
}

// Global Singleton Game Engine instance
export const gameEngine = new GameEngine();
