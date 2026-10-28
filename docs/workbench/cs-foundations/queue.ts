export class BoundedQueue<T> {
  readonly #items: (T | undefined)[];
  #head = 0;
  #size = 0;
  constructor(readonly capacity: number) {
    if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > 10_000) throw new RangeError('Queue capacity 1..10000');
    this.#items = new Array<T | undefined>(capacity);
  }
  get size(): number { return this.#size; }
  enqueue(value: T): void {
    if (this.#size === this.capacity) throw new RangeError('Queue full');
    this.#items[(this.#head + this.#size) % this.capacity] = value;
    this.#size++;
  }
  dequeue(): T {
    if (this.#size === 0) throw new RangeError('Queue empty');
    const value = this.#items[this.#head] as T; // Occupancy is tracked separately; T may include undefined.
    this.#items[this.#head] = undefined;
    this.#head = (this.#head + 1) % this.capacity;
    this.#size--;
    return value;
  }
}
