/**
 * Real Power-up Management Data Structures
 * Combines:
 * 1. Supply HashMap (PowerUpType -> remaining count)
 * 2. Player Inventory Sets/Maps (PlayerId -> available items)
 * 3. Used Power-ups Queue (FIFO chronological log of activated powerups)
 */

import { INITIAL_POWERUP_SUPPLY_PER_TYPE, POWERUP_DEFINITIONS } from '../data/boardConfig';
import { PowerUpType } from '../types/game';

export interface UsedPowerUpRecord {
  id: string;
  playerId: string;
  playerName: string;
  type: PowerUpType;
  timestamp: number;
}

export class PowerUpManager {
  // 1. Shared supply HashMap: Type -> quantity
  private supplyMap: Map<PowerUpType, number>;

  // 2. Player inventories: PlayerId -> Array of PowerUpType
  private playerInventories: Map<string, PowerUpType[]>;

  // 3. Used power-ups Queue (chronological record)
  private usedQueue: UsedPowerUpRecord[];

  constructor() {
    this.supplyMap = new Map<PowerUpType, number>();
    this.playerInventories = new Map<string, PowerUpType[]>();
    this.usedQueue = [];
    this.resetSupply();
  }

  public resetSupply(): void {
    const types = Object.keys(POWERUP_DEFINITIONS) as PowerUpType[];
    for (const type of types) {
      this.supplyMap.set(type, INITIAL_POWERUP_SUPPLY_PER_TYPE);
    }
    this.playerInventories.clear();
    this.usedQueue = [];
  }

  /**
   * Search available quantity for a power-up type.
   */
  public search(type: PowerUpType): number {
    return this.supplyMap.get(type) || 0;
  }

  /**
   * Check if a powerup type is available in shared supply.
   */
  public isAvailable(type: PowerUpType): boolean {
    return (this.supplyMap.get(type) || 0) > 0;
  }

  /**
   * Claim a powerup from shared supply to player inventory.
   */
  public claim(playerId: string, type: PowerUpType): { success: boolean; reason?: string } {
    const currentQty = this.supplyMap.get(type) || 0;
    if (currentQty <= 0) {
      return { success: false, reason: 'Power-up supply exhausted.' };
    }

    // Decrement shared supply HashMap
    this.supplyMap.set(type, currentQty - 1);

    // Add to player inventory
    const playerItems = this.playerInventories.get(playerId) || [];
    playerItems.push(type);
    this.playerInventories.set(playerId, playerItems);

    return { success: true };
  }

  /**
   * Use / consume a powerup from player's inventory.
   */
  public use(
    playerId: string,
    playerName: string,
    type: PowerUpType
  ): { success: boolean; reason?: string } {
    const playerItems = this.playerInventories.get(playerId) || [];
    const index = playerItems.indexOf(type);
    if (index === -1) {
      return { success: false, reason: 'Player does not possess this power-up.' };
    }

    // Remove from player inventory
    playerItems.splice(index, 1);
    this.playerInventories.set(playerId, playerItems);

    // Enqueue to used powerups Queue
    const record: UsedPowerUpRecord = {
      id: `used_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      playerId,
      playerName,
      type,
      timestamp: Date.now(),
    };
    this.usedQueue.push(record);

    return { success: true };
  }

  /**
   * Restores a power-up back to player or supply (for Undo).
   */
  public restoreToPlayer(playerId: string, type: PowerUpType): void {
    const playerItems = this.playerInventories.get(playerId) || [];
    playerItems.push(type);
    this.playerInventories.set(playerId, playerItems);

    // Remove the most recent matching record from usedQueue
    for (let i = this.usedQueue.length - 1; i >= 0; i--) {
      if (this.usedQueue[i].playerId === playerId && this.usedQueue[i].type === type) {
        this.usedQueue.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Returns a claimed powerup back to the shared supply (for Undo of a claim).
   */
  public returnToSupply(playerId: string, type: PowerUpType): void {
    const playerItems = this.playerInventories.get(playerId) || [];
    const idx = playerItems.indexOf(type);
    if (idx !== -1) {
      playerItems.splice(idx, 1);
      this.playerInventories.set(playerId, playerItems);
    }
    const currentQty = this.supplyMap.get(type) || 0;
    this.supplyMap.set(type, currentQty + 1);
  }

  /**
   * Get complete supply map entries.
   */
  public getSupplyEntries(): { type: PowerUpType; count: number; name: string }[] {
    const result: { type: PowerUpType; count: number; name: string }[] = [];
    this.supplyMap.forEach((count, type) => {
      result.push({
        type,
        count,
        name: POWERUP_DEFINITIONS[type]?.name || type,
      });
    });
    return result;
  }

  /**
   * Get player inventory.
   */
  public getPlayerInventory(playerId: string): PowerUpType[] {
    return [...(this.playerInventories.get(playerId) || [])];
  }

  /**
   * Get used powerups queue.
   */
  public getUsedQueue(): UsedPowerUpRecord[] {
    return [...this.usedQueue];
  }

  /**
   * Clone state snapshot.
   */
  public snapshot(): {
    supply: Record<string, number>;
    inventories: Record<string, PowerUpType[]>;
    used: UsedPowerUpRecord[];
  } {
    const supply: Record<string, number> = {};
    this.supplyMap.forEach((v, k) => {
      supply[k] = v;
    });
    const inventories: Record<string, PowerUpType[]> = {};
    this.playerInventories.forEach((v, k) => {
      inventories[k] = [...v];
    });
    return {
      supply,
      inventories,
      used: [...this.usedQueue],
    };
  }

  /**
   * Restore from snapshot.
   */
  public restoreFromSnapshot(snapshot: {
    supply: Record<string, number>;
    inventories: Record<string, PowerUpType[]>;
    used: UsedPowerUpRecord[];
  }): void {
    this.supplyMap.clear();
    Object.entries(snapshot.supply).forEach(([k, v]) => {
      this.supplyMap.set(k as PowerUpType, v);
    });
    this.playerInventories.clear();
    Object.entries(snapshot.inventories).forEach(([k, v]) => {
      this.playerInventories.set(k, [...v]);
    });
    this.usedQueue = [...snapshot.used];
  }
}
