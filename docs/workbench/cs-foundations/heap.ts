type Entry<T> = { value: T; priority: number; sequence: number };
export class MinPriorityQueue<T> {
  readonly #items: Entry<T>[] = [];
  #sequence = 0;
  constructor(readonly capacity = 200) {
    if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > 10_000) throw new RangeError('Heap capacity 1..10000');
  }
  get size(): number { return this.#items.length; }
  #before(a: Entry<T>, b: Entry<T>): boolean {
    return a.priority < b.priority || (a.priority === b.priority && a.sequence < b.sequence);
  }
  push(value: T, priority: number): void {
    if (!Number.isFinite(priority)) throw new RangeError('Expected finite priority');
    if (this.size >= this.capacity || this.#sequence >= Number.MAX_SAFE_INTEGER) throw new RangeError('Heap budget exceeded');
    this.#items.push({ value, priority, sequence: this.#sequence++ });
    let index = this.size - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (!this.#before(this.#items[index]!, this.#items[parent]!)) break;
      [this.#items[index], this.#items[parent]] = [this.#items[parent]!, this.#items[index]!];
      index = parent;
    }
  }
  peek(): T {
    if (!this.size) throw new RangeError('Heap empty');
    return this.#items[0]!.value;
  }
  pop(): T {
    if (!this.size) throw new RangeError('Heap empty');
    const first = this.#items[0]!;
    const last = this.#items.pop()!;
    if (this.size) {
      this.#items[0] = last;
      let index = 0;
      while (2 * index + 1 < this.size) {
        let child = 2 * index + 1;
        if (child + 1 < this.size && this.#before(this.#items[child + 1]!, this.#items[child]!)) child++;
        if (!this.#before(this.#items[child]!, this.#items[index]!)) break;
        [this.#items[index], this.#items[child]] = [this.#items[child]!, this.#items[index]!];
        index = child;
      }
    }
    return first.value;
  }
  // A copied diagnostic projection, not mutable access to the backing heap.
  snapshot(): readonly { priority: number; sequence: number }[] {
    return this.#items.map(({ priority, sequence }) => ({ priority, sequence }));
  }
}
