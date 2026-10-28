// SaveButton.tsx
import { useEffect, useRef, useState } from 'react';

export function SaveButton({ save }: { save: () => Promise<void> }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'saved' | 'failed'>('idle');
  const inFlight = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus('pending');
    try { await save(); if (mounted.current) setStatus('saved'); }
    catch { if (mounted.current) setStatus('failed'); }
    finally { inFlight.current = false; }
  }
  return <div>
    <button type="button" disabled={status === 'pending'} onClick={() => { void submit(); }}>
      {status === 'pending' ? 'Saving…' : status === 'failed' ? 'Retry save' : status === 'saved' ? 'Save again' : 'Save'}
    </button>
    {status === 'saved' && <p role="status">Saved successfully.</p>}
    {status === 'failed' && <p role="alert">Save failed. Retry when ready.</p>}
  </div>;
}
