/**
 * Real Doubly Linked List Implementation
 * Tracks step-by-step movement positions with forward (next) and backward (prev) pointers.
 */

export interface DoublyNodeData {
  position: number;
  stepIndex: number;
  actionDescription: string;
  timestamp: number;
}

export class DoublyNode<T = DoublyNodeData> {
  public id: string;
  public data: T;
  public prev: DoublyNode<T> | null = null;
  public next: DoublyNode<T> | null = null;

  constructor(data: T, id?: string) {
    this.data = data;
    this.id = id || `node_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
}

export class DoublyLinkedList<T = DoublyNodeData> {
  private head: DoublyNode<T> | null = null;
  private tail: DoublyNode<T> | null = null;
  private length: number = 0;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  /**
   * Append a new node to the end (TAIL) of the doubly linked list.
   * O(1) time complexity.
   */
  public append(data: T): DoublyNode<T> {
    const newNode = new DoublyNode<T>(data);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      if (this.tail) {
        this.tail.next = newNode;
      }
      this.tail = newNode;
    }
    this.length++;
    return newNode;
  }

  /**
   * Remove the last node from the TAIL.
   * Used when an undo action reverses a movement.
   * O(1) time complexity.
   */
  public removeLast(): DoublyNode<T> | null {
    if (!this.tail) {
      return null;
    }
    const removedNode = this.tail;
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else {
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      }
    }
    removedNode.prev = null;
    removedNode.next = null;
    this.length = Math.max(0, this.length - 1);
    return removedNode;
  }

  /**
   * Search for a node matching the predicate function.
   * O(n) time complexity.
   */
  public search(predicate: (data: T, index: number) => boolean): DoublyNode<T> | null {
    let current = this.head;
    let index = 0;
    while (current) {
      if (predicate(current.data, index)) {
        return current;
      }
      current = current.next;
      index++;
    }
    return null;
  }

  /**
   * Display all elements in order from HEAD to TAIL as an array of items.
   */
  public display(): T[] {
    const items: T[] = [];
    let current = this.head;
    while (current) {
      items.push(current.data);
      current = current.next;
    }
    return items;
  }

  /**
   * Return visual node representations including pointer indicators.
   */
  public displayDetailed(): {
    id: string;
    data: T;
    hasPrev: boolean;
    hasNext: boolean;
    prevId: string | null;
    nextId: string | null;
    isHead: boolean;
    isTail: boolean;
  }[] {
    const nodes = [];
    let current = this.head;
    while (current) {
      nodes.push({
        id: current.id,
        data: current.data,
        hasPrev: current.prev !== null,
        hasNext: current.next !== null,
        prevId: current.prev ? current.prev.id : null,
        nextId: current.next ? current.next.id : null,
        isHead: current === this.head,
        isTail: current === this.tail,
      });
      current = current.next;
    }
    return nodes;
  }

  /**
   * Returns current count of nodes.
   */
  public count(): number {
    return this.length;
  }

  /**
   * Access the HEAD node.
   */
  public getHead(): DoublyNode<T> | null {
    return this.head;
  }

  /**
   * Access the TAIL node.
   */
  public getTail(): DoublyNode<T> | null {
    return this.tail;
  }

  /**
   * Clear all nodes.
   */
  public clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  /**
   * Clones the entire doubly linked list.
   */
  public clone(): DoublyLinkedList<T> {
    const newList = new DoublyLinkedList<T>();
    let current = this.head;
    while (current) {
      newList.append({ ...current.data });
      current = current.next;
    }
    return newList;
  }
}
