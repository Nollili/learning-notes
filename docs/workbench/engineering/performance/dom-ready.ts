// dom-ready.ts
export function onDomReady(doc: Document, run: () => void): () => void {
  let disposed = false;
  const start = () => { if (!disposed) run(); };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  return () => { disposed = true; doc.removeEventListener('DOMContentLoaded', start); };
}
