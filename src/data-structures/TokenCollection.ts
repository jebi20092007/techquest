/**
 * Real Token Collection Implementation
 * Combines a Singly Linked List (for ordered sequence preservation)
 * and an explicit Custom HashSet (with real hash function & bucket chains) for O(1) duplicate prevention.
 */

import { TokenItem } from '../types/game';

export class TokenNode {
  public token: TokenItem;
  public next: TokenNode | null = null;
  public id: string;

  constructor(token: TokenItem) {
    this.token = token;
    this.next = null;
    this.id = `t_node_${token.id}_${Date.now()}`;
  }
}

/**
 * Singly Linked List for ordered token storage.
 */
export class TokenLinkedList {
  private head: TokenNode | null = null;
  private tail: TokenNode | null = null;
  private length: number = 0;

  public add(token: TokenItem): TokenNode {
    const newNode = new TokenNode(token);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
      }
      this.tail = newNode;
    }
    this.length++;
    return newNode;
  }

  public remove(tokenId: string): TokenItem | null {
    if (!this.head) return null;

    if (this.head.token.id === tokenId) {
      const removed = this.head.token;
      this.head = this.head.next;
      if (!this.head) {
        this.tail = null;
      }
      this.length--;
      return removed;
    }

    let current = this.head;
    while (current.next && current.next.token.id !== tokenId) {
      current = current.next;
    }

    if (current.next) {
      const removed = current.next.token;
      current.next = current.next.next;
      if (!current.next) {
        this.tail = current;
      }
      this.length--;
      return removed;
    }

    return null;
  }

  public search(tokenId: string): TokenItem | null {
    let current = this.head;
    while (current) {
      if (current.token.id === tokenId) {
        return current.token;
      }
      current = current.next;
    }
    return null;
  }

  public display(): TokenItem[] {
    const list: TokenItem[] = [];
    let current = this.head;
    while (current) {
      list.push(current.token);
      current = current.next;
    }
    return list;
  }

  public count(): number {
    return this.length;
  }

  public getHead(): TokenNode | null {
    return this.head;
  }
}

/**
 * Real Custom HashSet using separate chaining across buckets.
 * Demonstrates real hash calculation: (sum of char codes) % bucketCount.
 */
export class TokenHashSet {
  private bucketCount: number;
  private buckets: string[][];
  private totalElements: number = 0;

  constructor(bucketCount: number = 8) {
    this.bucketCount = bucketCount;
    this.buckets = Array.from({ length: bucketCount }, () => []);
    this.totalElements = 0;
  }

  /**
   * Deterministic hash function for token IDs.
   */
  public hash(key: string): number {
    let hashVal = 0;
    for (let i = 0; i < key.length; i++) {
      hashVal = (hashVal << 5) - hashVal + key.charCodeAt(i);
      hashVal |= 0; // Convert to 32bit integer
    }
    return Math.abs(hashVal) % this.bucketCount;
  }

  /**
   * Add key to HashSet. Returns false if already exists (duplicate prevention).
   */
  public add(key: string): boolean {
    if (this.contains(key)) {
      return false; // Duplicate rejected
    }
    const bucketIdx = this.hash(key);
    this.buckets[bucketIdx].push(key);
    this.totalElements++;
    return true;
  }

  /**
   * Remove key from HashSet.
   */
  public remove(key: string): boolean {
    const bucketIdx = this.hash(key);
    const bucket = this.buckets[bucketIdx];
    const index = bucket.indexOf(key);
    if (index !== -1) {
      bucket.splice(index, 1);
      this.totalElements--;
      return true;
    }
    return false;
  }

  /**
   * Check membership in O(1) average time.
   */
  public contains(key: string): boolean {
    const bucketIdx = this.hash(key);
    return this.buckets[bucketIdx].includes(key);
  }

  /**
   * Return total elements count.
   */
  public count(): number {
    return this.totalElements;
  }

  /**
   * Returns all keys stored.
   */
  public display(): string[] {
    const all: string[] = [];
    for (const b of this.buckets) {
      all.push(...b);
    }
    return all;
  }

  /**
   * Detailed bucket inspection for visual learning.
   */
  public getBucketMap(): { index: number; keys: string[]; count: number }[] {
    return this.buckets.map((b, idx) => ({
      index: idx,
      keys: [...b],
      count: b.length,
    }));
  }
}

/**
 * Composite Manager uniting the Linked List and HashSet for a single Player.
 */
export class PlayerTokenManager {
  public linkedList: TokenLinkedList;
  public hashSet: TokenHashSet;

  constructor() {
    this.linkedList = new TokenLinkedList();
    this.hashSet = new TokenHashSet(8);
  }

  /**
   * Attempt to collect a token.
   * Uses HashSet for O(1) duplicate check. If absent, adds to both list and set.
   */
  public collectToken(token: TokenItem): { success: boolean; isDuplicate: boolean } {
    if (this.hashSet.contains(token.id)) {
      return { success: false, isDuplicate: true };
    }
    this.hashSet.add(token.id);
    this.linkedList.add(token);
    return { success: true, isDuplicate: false };
  }

  /**
   * Revert a token collection (for Undo).
   */
  public removeToken(tokenId: string): TokenItem | null {
    this.hashSet.remove(tokenId);
    return this.linkedList.remove(tokenId);
  }

  public hasToken(tokenId: string): boolean {
    return this.hashSet.contains(tokenId);
  }

  public getTokens(): TokenItem[] {
    return this.linkedList.display();
  }

  public count(): number {
    return this.linkedList.count();
  }
}
