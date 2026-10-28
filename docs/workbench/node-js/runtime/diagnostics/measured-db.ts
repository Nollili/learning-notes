// measured-db.ts — application port; adapt the real driver's acquisition/release API.
import { performance } from 'node:perf_hooks';
export type DbConnection<T> = {
  query(statement: string, parameters: readonly unknown[]): Promise<T>;
  release(): void;
};
export function createMeasuredDb<T>(pool: { acquire(): Promise<DbConnection<T>> },
  observe: (phase: 'acquire' | 'query', outcome: 'ok' | 'error', milliseconds: number) => undefined) {
  let droppedObservations = 0;
  async function phase<R>(name: 'acquire' | 'query', task: () => Promise<R>): Promise<R> {
    const started = performance.now();
    let outcome: 'ok' | 'error' = 'error';
    try { const result = await task(); outcome = 'ok'; return result; }
    finally {
      try { observe(name, outcome, performance.now() - started); }
      catch { droppedObservations++; } // Instrumentation cannot mask DB outcome/ownership.
    }
  }
  return {
    get droppedObservations() { return droppedObservations; },
    async query(statement: string, parameters: readonly unknown[]): Promise<T> {
      const connection = await phase('acquire', () => pool.acquire());
      let failed = false;
      let primary: unknown;
      try { return await phase('query', () => connection.query(statement, parameters)); }
      catch (error) { failed = true; primary = error; throw error; }
      finally {
        try { connection.release(); }
        catch (releaseError) {
          if (failed) throw new AggregateError([primary, releaseError], 'Query and release failed');
          throw releaseError;
        }
      }
    },
  };
}
