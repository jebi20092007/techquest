/**
 * Real Challenge Queue Implementation
 * FIFO Queue managing algorithmic challenge generation, pending requests, retry state, and outcomes.
 */

import { ActiveChallenge, ChallengeQuestion } from '../types/game';

export interface ChallengeQueueItem {
  id: string;
  question: ChallengeQuestion;
  playerId: string;
  playerName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  timestamp: number;
  scoreAwarded?: number;
}

export class ChallengeQueue {
  private queue: ChallengeQueueItem[] = [];
  private history: ChallengeQueueItem[] = [];

  constructor() {
    this.queue = [];
    this.history = [];
  }

  /**
   * ENQUEUE: Add a newly triggered challenge to the rear of the queue.
   */
  public enqueue(
    question: ChallengeQuestion,
    playerId: string,
    playerName: string
  ): ChallengeQueueItem {
    const item: ChallengeQueueItem = {
      id: `chal_task_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      question,
      playerId,
      playerName,
      status: 'pending',
      attempts: 0,
      maxAttempts: 2,
      timestamp: Date.now(),
    };
    this.queue.push(item);
    return item;
  }

  /**
   * DEQUEUE: Remove and archive the challenge at FRONT of the queue.
   */
  public dequeue(): ChallengeQueueItem | null {
    if (this.isEmpty()) {
      return null;
    }
    const item = this.queue.shift() || null;
    if (item) {
      this.history.push(item);
    }
    return item;
  }

  /**
   * PEEK: Inspect current challenge at FRONT of queue.
   */
  public peek(): ChallengeQueueItem | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.queue[0];
  }

  /**
   * Register a retry attempt on the current FRONT challenge.
   */
  public retry(): boolean {
    const current = this.peek();
    if (!current) return false;
    current.attempts++;
    return current.attempts < current.maxAttempts;
  }

  /**
   * Mark current front challenge as completed or failed with score.
   */
  public resolveCurrent(status: 'completed' | 'failed', scoreDelta: number): ChallengeQueueItem | null {
    const current = this.peek();
    if (!current) return null;
    current.status = status;
    current.scoreAwarded = scoreDelta;
    return this.dequeue();
  }

  /**
   * Check if queue is empty.
   */
  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Return active queue size.
   */
  public size(): number {
    return this.queue.length;
  }

  /**
   * Display all pending items in FIFO order (FRONT to REAR).
   */
  public display(): ChallengeQueueItem[] {
    return [...this.queue];
  }

  /**
   * Display past resolved challenges.
   */
  public getHistory(): ChallengeQueueItem[] {
    return [...this.history];
  }

  /**
   * Snapshot for undo/restoration.
   */
  public snapshot(): { queue: ChallengeQueueItem[]; history: ChallengeQueueItem[] } {
    return {
      queue: JSON.parse(JSON.stringify(this.queue)),
      history: JSON.parse(JSON.stringify(this.history)),
    };
  }

  public restoreFromSnapshot(snapshot: { queue: ChallengeQueueItem[]; history: ChallengeQueueItem[] }): void {
    this.queue = JSON.parse(JSON.stringify(snapshot.queue));
    this.history = JSON.parse(JSON.stringify(snapshot.history));
  }
}
