// search-ui.mjs
export function installSearch(doc, fetcher, Controller = globalThis.AbortController) {
  const form = doc.querySelector('form'), input = doc.querySelector('#q');
  const list = doc.querySelector('#results'), status = doc.querySelector('#status'), regular = doc.querySelector('#regular');
  if (!form || !input || !list || !status || !regular || typeof fetcher !== 'function' || !Controller) return () => {};
  let version = 0, active = null, activeTimer = null, stopped = false;
  const submit = async event => {
    const q = input.value.trim();
    if (!q || q.length > 80) return; // Keep ordinary form/server validation available.
    event.preventDefault();
    const current = ++version;
    active?.abort(); clearTimeout(activeTimer);
    const controller = new Controller(); active = controller;
    const timer = setTimeout(() => controller.abort(), 5000); activeTimer = timer;
    regular.href = '/search?' + new URLSearchParams({ q }); regular.hidden = true;
    status.textContent = 'Searching…'; list.replaceChildren();
    try {
      const response = await fetcher('/api/search?' + new URLSearchParams({ q }), { signal: controller.signal, credentials: 'same-origin', redirect: 'error' });
      if (!response.ok || response.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json') {
        await response.body?.cancel(); throw new Error('Unavailable');
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.items) || data.items.length > 2 || data.items.some(item => !item ||
        typeof item.id !== 'string' || !['cancel', 'css'].includes(item.id) || typeof item.title !== 'string' || item.title.length > 80)) throw new Error('Invalid result');
      controller.signal.throwIfAborted();
      if (stopped || version !== current) return;
      const rows = data.items.map(item => {
        const row = doc.createElement('li'), link = doc.createElement('a');
        link.href = '/notes/' + item.id; link.textContent = item.title; row.append(link); return row;
      });
      list.replaceChildren(...rows); status.textContent = `${rows.length} result${rows.length === 1 ? '' : 's'}`;
    } catch {
      if (!stopped && version === current) { status.textContent = 'Search unavailable. Open regular results or try again.'; regular.hidden = false; }
    } finally { clearTimeout(timer); if (activeTimer === timer) activeTimer = null; if (active === controller) active = null; }
  };
  form.addEventListener('submit', submit);
  return () => { if (stopped) return; stopped = true; ++version; active?.abort(); clearTimeout(activeTimer); activeTimer = null; form.removeEventListener('submit', submit); };
}
if (typeof document !== 'undefined') {
  const dispose = installSearch(document, globalThis.fetch?.bind(globalThis));
  globalThis.addEventListener('pagehide', dispose, { once: true });
}
