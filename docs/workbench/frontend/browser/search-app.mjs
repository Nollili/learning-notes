// search-app.mjs
import express from 'express';
import { readFileSync } from 'node:fs';
const items = [{ id: 'cancel', title: 'Request cancellation' }, { id: 'css', title: 'CSS layers' }];
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function query(value) {
  return typeof value === 'string' && value.trim().length >= 1 && value.length <= 80 ? value.trim() : null;
}
function results(q) { return items.filter(item => item.title.toLowerCase().includes(q.toLowerCase())); }
export function page(q = '', found = [], error = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1"><title>Study note search</title>
    <link rel="stylesheet" href="/search.css"><script type="module" src="/search-ui.mjs"></script></head>
    <body><a href="#main">Skip to main content</a><main id="main"><h1>Find a study note</h1>
    <form action="/search" method="get"><label for="q">Search notes</label>
    <input id="q" name="q" value="${escape(q)}" maxlength="80" required><button type="submit">Search</button></form>
    <p id="status" role="status">${escape(error || (q ? `${found.length} result${found.length === 1 ? '' : 's'}` : 'Enter a topic.'))}</p>
    <ul id="results">${found.map(item => `<li><a href="/notes/${item.id}">${escape(item.title)}</a></li>`).join('')}</ul>
    <a id="regular" hidden href="/search">Open regular results</a></main></body></html>`;
}
export function createSearchApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('Content-Security-Policy', "default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    next();
  });
  app.get('/', (_req, res) => res.type('html').send(page()));
  app.get('/search', (req, res) => {
    const q = query(req.query.q);
    res.status(q ? 200 : 400).type('html').send(q ? page(q, results(q)) : page('', [], 'Enter 1–80 characters.'));
  });
  app.get('/api/search', (req, res) => {
    const q = query(req.query.q);
    if (!q) { res.status(400).json({ code: 'INVALID_QUERY' }); return; }
    res.json({ items: results(q) });
  });
  app.get('/search-ui.mjs', (_req, res) => res.type('text/javascript').send(readFileSync(new URL('./search-ui.mjs', import.meta.url), 'utf8')));
  app.get('/search.css', (_req, res) => res.type('css').send(readFileSync(new URL('./search.css', import.meta.url), 'utf8')));
  app.get('/notes/:id', (req, res) => {
    const item = items.find(item => item.id === req.params.id);
    if (!item) { res.status(404).type('text').send('Not found'); return; }
    res.type('html').send(`<!doctype html><html lang="en"><title>${escape(item.title)}</title><h1>${escape(item.title)}</h1><a href="/">Search</a></html>`);
  });
  app.use((_req, res) => res.status(404).type('text').send('Not found'));
  return app;
}
