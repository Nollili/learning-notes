// local-signal.ts — one topic; synchronous, fail-fast subscribers.
export class LocalSignal {
  private readonly listeners = new Map<symbol, (value: unknown) => undefined>();
  constructor(private readonly limit = 100) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 1000) throw new RangeError('Invalid limit');
  }
  subscribe(listener: (value: unknown) => undefined): () => void {
    if (this.listeners.size >= this.limit) throw new RangeError('Listener budget exceeded');
    const id = Symbol(); this.listeners.set(id, listener);
    return () => { this.listeners.delete(id); };
  }
  emit(value: unknown): void { for (const listener of [...this.listeners.values()]) listener(value); }
  clear(): void { this.listeners.clear(); }
  get size(): number { return this.listeners.size; }
}
