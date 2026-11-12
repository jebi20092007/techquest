/**
 * Real Circular Queue Implementation
 * Manages player turn rotations in a cyclic ring buffer with FRONT and REAR pointers.
 */

export class CircularQueue<T = string> {
  private buffer: (T | null)[];
  private capacity: number;
  private front: number = 0;
  private rear: number = 0;
  private count: number = 0;

  constructor(capacity: number = 8) {
    this.capacity = capacity;
    this.buffer = new Array(capacity).fill(null);
    this.front = 0;
    this.rear = 0;
    this.count = 0;
  }

  /**
   * Enqueue an element into the circular queue.
   * Advances REAR using modulo arithmetic: (rear + 1) % capacity.
   */
  public enqueue(item: T): boolean {
    if (this.isFull()) {
      // Dynamically double buffer capacity if full
      this.resize(this.capacity * 2);
    }

    if (this.isEmpty()) {
      this.front = 0;
      this.rear = 0;
      this.buffer[0] = item;
      this.count = 1;
      return true;
    }

    this.rear = (this.rear + 1) % this.capacity;
    this.buffer[this.rear] = item;
    this.count++;
    return true;
  }

  /**
   * Dequeue an element from FRONT of the circular queue.
   * Advances FRONT using modulo arithmetic: (front + 1) % capacity.
   */
  public dequeue(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    const item = this.buffer[this.front];
    this.buffer[this.front] = null;

    if (this.count === 1) {
      this.front = 0;
      this.rear = 0;
      this.count = 0;
    } else {
      this.front = (this.front + 1) % this.capacity;
      this.count--;
    }

    return item;
  }

  /**
   * Rotate turn: dequeues the current front player and enqueues them back at rear.
   * Returns the new front player.
   */
  public stepTurn(): T | null {
    if (this.isEmpty()) return null;
    if (this.count === 1) return this.buffer[this.front];

    const current = this.dequeue();
    if (current !== null) {
      this.enqueue(current);
    }
    return this.peek();
  }

  /**
   * Inspect the element at the FRONT of the queue without removing it.
   */
  public peek(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.buffer[this.front];
  }

  /**
   * Check if queue is empty.
   */
  public isEmpty(): boolean {
    return this.count === 0;
  }

  /**
   * Check if queue buffer is currently full.
   */
  public isFull(): boolean {
    return this.count === this.capacity;
  }

  /**
   * Returns number of active elements.
   */
  public size(): number {
    return this.count;
  }

  /**
   * Returns current buffer capacity.
   */
  public getCapacity(): number {
    return this.capacity;
  }

  /**
   * Inspect indices.
   */
  public getPointers(): { front: number; rear: number; count: number; capacity: number } {
    return {
      front: this.front,
      rear: this.rear,
      count: this.count,
      capacity: this.capacity,
    };
  }

  /**
   * Display all elements in active logical order (from FRONT to REAR).
   */
  public display(): T[] {
    if (this.isEmpty()) return [];
    const result: T[] = [];
    let idx = this.front;
    for (let i = 0; i < this.count; i++) {
      const val = this.buffer[idx];
      if (val !== null) {
        result.push(val);
      }
      idx = (idx + 1) % this.capacity;
    }
    return result;
  }

  /**
   * Returns the underlying fixed buffer array with pointers mapped for live visualization.
   */
  public getBufferSlots(): {
    index: number;
    value: T | null;
    isFront: boolean;
    isRear: boolean;
    isActive: boolean;
  }[] {
    return this.buffer.map((val, idx) => ({
      index: idx,
      value: val,
      isFront: !this.isEmpty() && idx === this.front,
      isRear: !this.isEmpty() && idx === this.rear,
      isActive: this.isIndexActive(idx),
    }));
  }

  private isIndexActive(idx: number): boolean {
    if (this.isEmpty()) return false;
    if (this.front <= this.rear) {
      return idx >= this.front && idx <= this.rear;
    }
    return idx >= this.front || idx <= this.rear;
  }

  /**
   * Remove a specific player item from the queue (e.g. when a player finishes the game).
   */
  public remove(item: T): boolean {
    if (this.isEmpty()) return false;
    const currentItems = this.display();
    const filtered = currentItems.filter((i) => i !== item);
    if (filtered.length === currentItems.length) return false;

    // Reset buffer and reload
    this.buffer = new Array(this.capacity).fill(null);
    this.front = 0;
    this.rear = 0;
    this.count = 0;
    for (const el of filtered) {
      this.enqueue(el);
    }
    return true;
  }

  private resize(newCapacity: number): void {
    const items = this.display();
    this.capacity = newCapacity;
    this.buffer = new Array(newCapacity).fill(null);
    this.front = 0;
    this.rear = 0;
    this.count = 0;
    for (const item of items) {
      this.enqueue(item);
    }
  }

  public clone(): CircularQueue<T> {
    const cloned = new CircularQueue<T>(this.capacity);
    const items = this.display();
    for (const item of items) {
      cloned.enqueue(item);
    }
    return cloned;
  }
}
