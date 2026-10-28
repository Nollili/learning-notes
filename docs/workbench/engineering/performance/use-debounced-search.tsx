// use-debounced-search.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { createSearchOwner, type SearchApi, type SearchState } from './search-owner.js';
export function useDebouncedSearch(api: SearchApi) {
  const owner = useRef<ReturnType<typeof createSearchOwner> | null>(null);
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  useEffect(() => {
    const current = createSearchOwner(api, setState);
    owner.current = current;
    setState({ status: 'idle' });
    return () => {
      current.dispose();
      if (owner.current === current) owner.current = null;
    };
  }, [api]);
  const change = useCallback((query: string) => owner.current?.change(query), []);
  return { state, change };
}
