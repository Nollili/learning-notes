// search-owner.ts
import { debounce } from './debounce.js';
export type SearchApi = (query: string, signal: AbortSignal) => Promise<readonly string[]>;
export type SearchState =
  | { status: 'idle' }
  | { status: 'waiting'; query: string }
  | { status: 'ready'; query: string; items: readonly string[] }
  | { status: 'error'; query: string; code: 'SEARCH_FAILED' };
export function createSearchOwner(api: SearchApi, publish: (state: SearchState) => void) {
  let epoch = 0;
  let stopped = false;
  let active: AbortController | undefined;
  const work = debounce((query: string, version: number) => {
    const controller = new AbortController();
    active = controller;
    void (async () => {
      try {
        const items = await api(query, controller.signal);
        if (!stopped && epoch === version) publish({ status: 'ready', query, items });
      } catch {
        if (!stopped && epoch === version && !controller.signal.aborted) publish({ status: 'error', query, code: 'SEARCH_FAILED' });
      } finally {
        if (active === controller) active = undefined;
      }
    })();
  }, 300, { maxWait: 1000 });
  return {
    change(query: string) {
      if (stopped) return;
      const version = ++epoch;
      active?.abort(); active = undefined;
      if (!query.trim()) { work.cancel(); publish({ status: 'idle' }); return; }
      publish({ status: 'waiting', query });
      work.run(query, version);
    },
    dispose() {
      if (stopped) return;
      stopped = true; ++epoch; work.cancel(); active?.abort(); active = undefined;
    }
  };
}
