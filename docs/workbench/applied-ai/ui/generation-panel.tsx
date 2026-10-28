// generation-panel.tsx
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
export type Decision = {
  category: 'frontend' | 'backend' | 'ai' | 'other';
  evidence_quote: string; needs_review: boolean;
};
export type FailureCode = 'timeout' | 'incomplete' | 'unavailable' | 'refused' | 'invalid_output';
export class ApiFailure extends Error {
  constructor(readonly code: FailureCode) { super(code); }
}
export type ClassifyApi = (source: string, signal: AbortSignal) => Promise<Decision>;
type View = { status: 'idle' } | { status: 'pending' }
  | { status: 'ready'; decision: Decision } | { status: 'failed'; code: FailureCode };
const messages: Record<FailureCode, string> = {
  timeout: 'The request timed out. You can retry.',
  incomplete: 'The result was incomplete. Reduce the excerpt or retry.',
  unavailable: 'The service is unavailable. Retry when it recovers.',
  refused: 'The service declined this request. Review the excerpt.',
  invalid_output: 'The result could not be validated. No proposal was accepted.',
};
export function GenerationPanel({ api }: { api: ClassifyApi }) {
  const [source, setSource] = useState('');
  const [view, setView] = useState<View>({ status: 'idle' });
  const active = useRef<AbortController | null>(null);
  const epoch = useRef(0);
  const invalidate = () => { epoch.current++; active.current?.abort(); active.current = null; };
  useEffect(() => {
    setView({ status: 'idle' });
    return () => { epoch.current++; active.current?.abort(); active.current = null; };
  }, [api]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active.current !== null || !source.trim()) return;
    const controller = new AbortController();
    active.current = controller;
    const request = ++epoch.current;
    const submitted = source;
    setView({ status: 'pending' });
    try {
      const decision = await api(submitted, controller.signal);
      if (epoch.current === request && !controller.signal.aborted)
        setView({ status: 'ready', decision });
    } catch (error) {
      if (epoch.current === request && !controller.signal.aborted)
        setView({ status: 'failed', code: error instanceof ApiFailure ? error.code : 'unavailable' });
    } finally {
      if (active.current === controller) active.current = null;
    }
  }
  return <form onSubmit={submit}>
    <label>Study excerpt<textarea value={source} maxLength={4000} onChange={event => {
      invalidate(); setSource(event.currentTarget.value); setView({ status: 'idle' });
    }} /></label>
    <button type="submit" disabled={view.status === 'pending' || !source.trim()}>
      {view.status === 'failed' ? 'Retry classification' : 'Classify excerpt'}
    </button>
    {view.status === 'pending' && <button type="button" onClick={() => {
      invalidate(); setView({ status: 'idle' });
    }}>Cancel request</button>}
    <p role="status">{view.status === 'pending' ? 'Classifying; no result accepted yet.' :
      view.status === 'idle' ? 'Ready for an excerpt.' : ''}</p>
    {view.status === 'failed' && <p role="alert">{messages[view.code]}</p>}
    {view.status === 'ready' && <section aria-label="Classification proposal">
      <p>{view.decision.category}</p><blockquote>{view.decision.evidence_quote}</blockquote>
      <p>{view.decision.needs_review ? 'Review required' : 'Proposal ready for your review'}</p>
    </section>}
  </form>;
}
