/**
 * Real Stack Implementation
 * Implements Last-In-First-Out (LIFO) protocol for granular undo snapshots.
 */

export interface StackFrame<T> {
  id: string;
  data: T;
  actionName: string;
  timestamp: number;
}

export class Stack<T = unknown> {
  private items: StackFrame<T>[] = [];
  private maxCapacity: number;

  constructor(maxCapacity: number = 50) {
    this.items = [];
    this.maxCapacity = maxCapacity;
  }

  /**
   * PUSH: Add an element to the TOP of the stack.
   * O(1) time complexity.
   */
  public push(data: T, actionName: string = 'GAME_ACTION'): boolean {
    if (this.items.length >= this.maxCapacity) {
      // Evict oldest base item to prevent unbounded memory growth while keeping recent undoable frames
      this.items.shift();
    }
    const frame: StackFrame<T> = {
      id: `frame_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      data,
      actionName,
      timestamp: Date.now(),
    };
    this.items.push(frame);
    return true;
  }

  /**
   * POP: Remove and return the element at the TOP of the stack.
   * O(1) time complexity.
   */
  public pop(): StackFrame<T> | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.pop() || null;
  }

  /**
   * PEEK: Inspect the TOP element without removing it.
   */
  public peek(): StackFrame<T> | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.items.length - 1];
  }

  /**
   * Check if stack is empty.
   */
  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Number of frames in stack.
   */
  public size(): number {
    return this.items.length;
  }

  /**
   * Returns items ordered from TOP down to BOTTOM for visualization.
   */
  public display(): StackFrame<T>[] {
    // Return shallow copy reversed so index 0 is TOP
    return [...this.items].reverse();
  }

  /**
   * Returns internal items array from BOTTOM to TOP.
   */
  public getInternalFrames(): StackFrame<T>[] {
    return [...this.items];
  }

  /**
   * Clear all frames from the stack.
   */
  public clear(): void {
    this.items = [];
  }
}
