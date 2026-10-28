// latest-results.ts
import { catchError, map, of, startWith, switchMap, timeout, type Observable } from 'rxjs';
import { fromAbortable } from '../../design/observables/owned-observable.js';
export type ReadResult = { kind: 'loading' } | { kind: 'ready'; value: number } | { kind: 'failed' };
export function latestResults(keys: Observable<string>, load: (key: string, signal: AbortSignal) => Promise<unknown>
                              ): Observable<ReadResult> {
  return keys.pipe(switchMap(key => fromAbortable(signal => load(key, signal)).pipe(
    timeout({ first: 1000 }),
    map((value): ReadResult => {
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Invalid value');
      return { kind: 'ready', value };
    }),
    catchError(() => of<ReadResult>({ kind: 'failed' })),
    startWith({ kind: 'loading' } as const),
  )));
}
