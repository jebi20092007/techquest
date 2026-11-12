/**
 * Real Game History Data Structure (Event List + Stack)
 * Chronologically records all verified game transactions with search, filtering,
 * and an isolated, non-mutating Replay State Machine.
 */

import { GameActionType, GameEvent } from '../types/game';

export interface HistoryFilterOptions {
  playerId?: string;
  actionType?: GameActionType | 'ALL';
  searchQuery?: string;
  sortOrder?: 'asc' | 'desc'; // Chronological vs reverse
}

export class EventHistory {
  private events: GameEvent[] = [];
  private eventCounter: number = 0;

  constructor() {
    this.events = [];
    this.eventCounter = 0;
  }

  /**
   * Append a game event to chronological history.
   */
  public logEvent(
    playerId: string,
    playerName: string,
    playerColor: string,
    action: GameActionType,
    title: string,
    description: string,
    options?: {
      previousPosition?: number;
      newPosition?: number;
      scoreChange?: number;
      dataStructureInvolved?: string;
    }
  ): GameEvent {
    this.eventCounter++;
    const event: GameEvent = {
      id: `evt_${this.eventCounter}_${Date.now()}`,
      timestamp: Date.now(),
      eventNumber: this.eventCounter,
      playerId,
      playerName,
      playerColor,
      action,
      title,
      description,
      previousPosition: options?.previousPosition,
      newPosition: options?.newPosition,
      scoreChange: options?.scoreChange,
      dataStructureInvolved: options?.dataStructureInvolved,
    };
    this.events.push(event);
    return event;
  }

  /**
   * Remove last logged event (used during Undo to maintain strict synchronization).
   */
  public removeLastEvent(): GameEvent | null {
    if (this.events.length === 0) return null;
    return this.events.pop() || null;
  }

  /**
   * Retrieve all events.
   */
  public getAllEvents(): GameEvent[] {
    return [...this.events];
  }

  /**
   * Total count of events.
   */
  public count(): number {
    return this.events.length;
  }

  /**
   * Filter and search events.
   */
  public query(options: HistoryFilterOptions): GameEvent[] {
    let result = [...this.events];

    if (options.playerId && options.playerId !== 'ALL') {
      result = result.filter((e) => e.playerId === options.playerId);
    }

    if (options.actionType && options.actionType !== 'ALL') {
      result = result.filter((e) => e.action === options.actionType);
    }

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.playerName.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          (e.dataStructureInvolved && e.dataStructureInvolved.toLowerCase().includes(q))
      );
    }

    if (options.sortOrder === 'desc') {
      result.reverse();
    }

    return result;
  }

  public clear(): void {
    this.events = [];
    this.eventCounter = 0;
  }

  public snapshot(): GameEvent[] {
    return JSON.parse(JSON.stringify(this.events));
  }

  public restoreFromSnapshot(events: GameEvent[]): void {
    this.events = JSON.parse(JSON.stringify(events));
    this.eventCounter = this.events.length;
  }
}

/**
 * Isolated Replay State Machine:
 * Steps forward / backward through the recorded event sequence WITHOUT mutating live game state.
 */
export class ReplayEngine {
  private events: GameEvent[];
  private currentStepIndex: number = 0;

  constructor(events: GameEvent[]) {
    this.events = [...events];
    this.currentStepIndex = 0;
  }

  public get totalSteps(): number {
    return this.events.length;
  }

  public get currentIndex(): number {
    return this.currentStepIndex;
  }

  public getCurrentEvent(): GameEvent | null {
    if (this.events.length === 0) return null;
    return this.events[this.currentStepIndex] || null;
  }

  public next(): GameEvent | null {
    if (this.currentStepIndex < this.events.length - 1) {
      this.currentStepIndex++;
      return this.events[this.currentStepIndex];
    }
    return null;
  }

  public prev(): GameEvent | null {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      return this.events[this.currentStepIndex];
    }
    return null;
  }

  public jumpTo(step: number): GameEvent | null {
    if (step >= 0 && step < this.events.length) {
      this.currentStepIndex = step;
      return this.events[this.currentStepIndex];
    }
    return null;
  }

  public reset(): void {
    this.currentStepIndex = 0;
  }
}
