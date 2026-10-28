// bounded-observable-promises.ts
import { firstValueFrom, lastValueFrom, take, timeout, type Observable } from 'rxjs';
function checkedWait(waitMs: number): void {
  if (!Number.isSafeInteger(waitMs) || waitMs < 1 || waitMs > 5000) throw new Error('Invalid wait budget');
}
export function firstNumber(source: Observable<number>, waitMs = 1000): Promise<number> {
  checkedWait(waitMs);
  return firstValueFrom(source.pipe(timeout({ first: waitMs })));
}
export function lastOfThree(source: Observable<number>, waitMs = 1000): Promise<number> {
  checkedWait(waitMs);
  return lastValueFrom(source.pipe(take(3), timeout({ first: waitMs, each: waitMs })));
}
