import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { InputError, history, nextHistory, question } from './core.mjs';
import { answer, settings } from './model.mjs';

const assets = new Map([
  ['/', ['public/index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['public/app.js', 'text/javascript; charset=utf-8']],
  ['/app.css', ['public/app.css', 'text/css; charset=utf-8']]
]);

async function jsonBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 49152) throw new InputError('Request too large.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new InputError('Invalid JSON.'); }
}

export function createApp({ config = settings(), generate = answer } = {}) {
  let busy = false;
  const server = createServer(async (req, res) => {
    const reply = (status, value) => {
      if (!res.destroyed) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); }
    };
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if (req.method === 'GET' && assets.has(req.url)) {
      const [file, type] = assets.get(req.url);
      try { res.writeHead(200, { 'Content-Type': type }); res.end(await readFile(new URL(file, import.meta.url))); }
      catch { reply(500, { error: 'Asset unavailable.' }); }
      return;
    }
    if (req.method !== 'POST' || req.url !== '/api/chat') { reply(404, { error: 'Not found.' }); return; }
    // Local study server: exact loopback host/origin, no permissive CORS or remote binding.
    const port = server.address()?.port;
    if (req.headers.host !== `127.0.0.1:${port}` ||
        (req.headers.origin && req.headers.origin !== `http://127.0.0.1:${port}`)) {
      reply(403, { error: 'Local origin required.' }); return;
    }
    if (req.headers['content-type']?.split(';')[0] !== 'application/json') {
      reply(415, { error: 'Use application/json.' }); return;
    }
    if (busy) { reply(429, { error: 'One request at a time in this study server.' }); return; }
    busy = true;
    const controller = new AbortController();
    const cancel = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', cancel);
    try {
      const data = await jsonBody(req);
      if (!data || typeof data !== 'object' || Object.keys(data).some(key => !['question', 'history'].includes(key))) {
        throw new InputError('Expected question and history.');
      }
      const input = question(data.question);
      const previous = history(data.history);
      const text = await generate(input, previous, { config, signal: controller.signal });
      if (typeof text !== 'string' || !text.trim() || text.length > 4000) throw new Error('Invalid answer.');
      reply(200, { answer: text, history: nextHistory(previous, input, text), mode: config.mode });
    } catch (error) {
      reply(error instanceof InputError ? 400 : 502, { error: error instanceof InputError ? error.message : 'Model unavailable, refused or incomplete. Try again deliberately.' });
    } finally { res.off('close', cancel); busy = false; }
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  server.timeout = 30000;
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const config = settings();
  const server = createApp({ config });
  server.listen(3000, '127.0.0.1', () => console.log(`Study chatbot: http://127.0.0.1:3000 — ${config.mode}`));
  for (const event of ['SIGINT', 'SIGTERM']) process.once(event, () => {
    server.close();
    server.closeAllConnections();
  });
}
