// owned-observable.ts
import { Observable } from 'rxjs';
export function eventValues(target: EventTarget, type: string): Observable<Event> {
  return new Observable(subscriber => {
    const listener = (event: Event) => subscriber.next(event);
    target.addEventListener(type, listener);
    return () => target.removeEventListener(type, listener);
  });
}
export function fromAbortable<T>(work: (signal: AbortSignal) => Promise<T>): Observable<T> {
  return new Observable(subscriber => {
    const controller = new AbortController();
    try {
      void work(controller.signal).then(value => {
        if (!subscriber.closed) { subscriber.next(value); subscriber.complete(); }
      }, () => { if (!subscriber.closed) subscriber.error(new Error('Resource unavailable')); });
    } catch {
      subscriber.error(new Error('Resource unavailable'));
    }
    return () => controller.abort();
  });
}
