// Basic Priority Queue implementation
// Note: This is a simple implementation. For large mazes, a more optimized heap-based queue would be better.

export class PriorityQueue<T> {
  private items: T[] = [];
  private comparator: (a: T, b: T) => boolean; // Returns true if a should come before b

  constructor(comparator: (a: T, b: T) => boolean) {
    this.comparator = comparator;
  }

  enqueue(item: T): void {
    this.items.push(item);
    this.items.sort((a, b) => {
        if (this.comparator(a, b)) return -1; // a comes first
        if (this.comparator(b, a)) return 1;  // b comes first
        return 0; // Equal priority
    });
  }

  dequeue(): T | undefined {
    return this.items.shift(); // Removes the highest priority item (at the front after sort)
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // Helper to check if an item exists (useful for A*)
  has(predicate: (item: T) => boolean): boolean {
    return this.items.some(predicate);
  }

  get size(): number {
    return this.items.length;
  }
}
```