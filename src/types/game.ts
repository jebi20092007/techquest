/**
 * Core type definitions for Tech Quest: The Data Structures Adventure
 */

export type CellType = 'safe' | 'token' | 'powerup' | 'challenge' | 'penalty' | 'finish';

export interface CellInfo {
  id: number; // 1 to 40
  type: CellType;
  name: string;
  description: string;
  gridRow: number; // 1 to 11
  gridCol: number; // 1 to 11
}

export type PowerUpType =
  | 'extra_move'
  | 'shield'
  | 'skip_turn'
  | 'double_score'
  | 'reverse_move'
  | 'bonus_token';

export interface PowerUpDefinition {
  type: PowerUpType;
  name: string;
  description: string;
  iconName: string;
  color: string;
}

export interface Player {
  id: string; // e.g., 'p1', 'p2'
  name: string;
  color: string; // Hex color
  tokenSymbol: string; // e.g. ⚡, 💎, 🚀, 🛡️
  isAI: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  position: number; // 0 (start outside board) to 40 (finish)
  score: number;
  tokens: string[]; // Token IDs collected
  powerUps: PowerUpType[]; // Inventory
  hasShield: boolean;
  hasDoubleScore: boolean;
  isFinished: boolean;
  finishRank?: number;
  finishTimestamp?: number;
  movementHistory: number[]; // All positions visited
}

export interface TokenItem {
  id: string; // e.g. "TOK_02"
  cellId: number;
  name: string;
  category: string;
  description: string;
  symbol: string;
}

export type ChallengeCategory =
  | 'Mathematics'
  | 'Prime numbers'
  | 'Logical reasoning'
  | 'Number sequences'
  | 'Data Structures'
  | 'Basic programming logic';

export interface ChallengeQuestion {
  id: string;
  category: ChallengeCategory;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ActiveChallenge {
  question: ChallengeQuestion;
  playerId: string;
  attemptsMade: number; // 0, 1, or 2
  maxAttempts: number; // 2
  status: 'pending' | 'completed' | 'failed';
}

export type GameActionType =
  | 'DICE_ROLL'
  | 'MOVE'
  | 'BOUNCE'
  | 'TOKEN_COLLECT'
  | 'TOKEN_ALREADY_OWNED'
  | 'POWERUP_COLLECT'
  | 'POWERUP_SUPPLY_EMPTY'
  | 'POWERUP_USE'
  | 'CHALLENGE_GENERATE'
  | 'CHALLENGE_ANSWER_CORRECT'
  | 'CHALLENGE_ANSWER_INCORRECT'
  | 'CHALLENGE_RETRY'
  | 'PENALTY_APPLIED'
  | 'PENALTY_SHIELDED'
  | 'PLAYER_FINISH'
  | 'TURN_CHANGE'
  | 'TURN_SKIPPED'
  | 'UNDO'
  | 'GAME_START'
  | 'GAME_OVER';

export interface GameEvent {
  id: string;
  timestamp: number;
  eventNumber: number;
  playerId: string;
  playerName: string;
  playerColor: string;
  action: GameActionType;
  title: string;
  description: string;
  previousPosition?: number;
  newPosition?: number;
  scoreChange?: number;
  dataStructureInvolved?: string;
}

export interface OperationLog {
  id: string;
  timestamp: number;
  operationName: string;
  dataStructureName: string;
  beforeState: string;
  action: string;
  afterState: string;
  elementCount: number;
  explanation: string;
}

export interface GameSnapshot {
  players: Player[];
  currentTurnIndex: number;
  powerUpSupply: Record<PowerUpType, number>;
  usedPowerUps: { playerId: string; type: PowerUpType; timestamp: number }[];
  activeChallenge: ActiveChallenge | null;
  pendingChallenges: ChallengeQuestion[];
  completedChallengesCount: number;
  turnOrder: string[];
  skippedPlayerIds: string[];
  isGameOver: boolean;
  winnerId: string | null;
  eventCount: number;
  lastActionDescription: string;
}
