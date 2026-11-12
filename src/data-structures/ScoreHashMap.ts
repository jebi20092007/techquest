/**
 * Real Score HashMap Implementation
 * Manages player scores, rankings, score delta arithmetic, and direct hash mapping.
 */

import { Player } from '../types/game';

export interface ScoreEntry {
  playerId: string;
  playerName: string;
  score: number;
  lastUpdated: number;
}

export class ScoreHashMap {
  private map: Map<string, number>;
  private history: { playerId: string; oldScore: number; newScore: number; reason: string; timestamp: number }[];

  constructor() {
    this.map = new Map<string, number>();
    this.history = [];
  }

  /**
   * Set or initialize a player's score.
   */
  public setScore(playerId: string, score: number): void {
    this.map.set(playerId, score);
  }

  /**
   * Add points to a player.
   */
  public addScore(playerId: string, amount: number, reason: string = 'Points earned'): number {
    const current = this.getScore(playerId);
    const updated = current + amount;
    this.map.set(playerId, updated);
    this.history.push({
      playerId,
      oldScore: current,
      newScore: updated,
      reason,
      timestamp: Date.now(),
    });
    return updated;
  }

  /**
   * Deduct points from a player (can go below zero if penalized).
   */
  public deductScore(playerId: string, amount: number, reason: string = 'Penalty applied'): number {
    const current = this.getScore(playerId);
    const updated = current - amount;
    this.map.set(playerId, updated);
    this.history.push({
      playerId,
      oldScore: current,
      newScore: updated,
      reason,
      timestamp: Date.now(),
    });
    return updated;
  }

  /**
   * O(1) lookup of score.
   */
  public getScore(playerId: string): number {
    return this.map.get(playerId) || 0;
  }

  /**
   * Compare scores between two players.
   * Returns positive if p1 > p2, negative if p1 < p2, 0 if equal.
   */
  public compareScores(player1Id: string, player2Id: string): number {
    return this.getScore(player1Id) - this.getScore(player2Id);
  }

  /**
   * Calculate complete sorted ranking list based on:
   * 1. Highest score
   * 2. Earliest finish timestamp (if finished)
   * 3. Furthest board position
   */
  public displayRanking(players: Player[]): { rank: number; player: Player; score: number }[] {
    const sorted = [...players].sort((a, b) => {
      const scoreDiff = this.getScore(b.id) - this.getScore(a.id);
      if (scoreDiff !== 0) return scoreDiff;

      // Both finished? Compare finish timestamps
      if (a.isFinished && b.isFinished) {
        return (a.finishTimestamp || 0) - (b.finishTimestamp || 0);
      }
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;

      // Furthest position
      return b.position - a.position;
    });

    return sorted.map((player, idx) => ({
      rank: idx + 1,
      player,
      score: this.getScore(player.id),
    }));
  }

  /**
   * Return all key-value entries in the HashMap.
   */
  public entries(): [string, number][] {
    return Array.from(this.map.entries());
  }

  /**
   * Return structured entries for visual dashboard.
   */
  public getVisualEntries(): { playerId: string; score: number }[] {
    return Array.from(this.map.entries()).map(([playerId, score]) => ({
      playerId,
      score,
    }));
  }

  /**
   * Snapshot for undo restoration.
   */
  public snapshot(): Record<string, number> {
    const res: Record<string, number> = {};
    this.map.forEach((v, k) => {
      res[k] = v;
    });
    return res;
  }

  public restoreFromSnapshot(scores: Record<string, number>): void {
    this.map.clear();
    Object.entries(scores).forEach(([k, v]) => {
      this.map.set(k, v);
    });
  }
}
