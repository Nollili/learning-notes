// Disposable loopback fixture. In-memory receipts; NOT durable across restart.
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
const transform = new Function('$input', readFileSync(new URL('./normalize-code.js', import.meta.url), 'utf8'));
export const fixtureToken = 'synthetic-local-only-token';
export function createFixture({ failFirst = false } = {}) {
  const receipts = new Map();
  let attempts = 0, effects = 0;
  const server = createServer(async (request, response) => {
    const send = (status, value) => {
      response.writeHead(status, { 'content-type': 'application/json' });
      response.end(JSON.stringify(value));
    };
    if (request.method !== 'POST' || request.url !== '/refresh') return send(404, {code:'not_found'});
    if (request.headers.authorization !== `Bearer ${fixtureToken}`) return send(401, {code:'unauthorized'});
    const chunks = []; let bytes = 0, oversized = false;
    try {
      for await (const chunk of request) {
        bytes += chunk.length;
        if (bytes > 2048) { oversized = true; chunks.length = 0; }
        if (!oversized) chunks.push(chunk);
      }
      if (oversized) return send(413, {code:'too_large'});
      const body = JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(Buffer.concat(chunks)));
      const result = transform({ all: () => [{json:{body}}] })[0].json;
      if (!result.accepted) return send(400, {code:'invalid_event'});
      const event = result.event;
      // This credential maps to two fixed synthetic sources at revision 1, never request tenant claims.
      if (!['public','public_copy'].includes(event.source_id) || event.revision !== 1) return send(403, {code:'unavailable'});
      const digest = JSON.stringify(event);
      const old = receipts.get(event.event_id);
      if (old) return old.digest === digest ? send(200, old.receipt) : send(409, {code:'conflict'});
      attempts++;
      if (failFirst && attempts === 1) return send(503, {code:'temporary_failure'});
      if (receipts.size >= 100) return send(429, {code:'capacity'});
      const receipt = {status:'recorded', event_id:event.event_id, sequence:++effects};
      receipts.set(event.event_id, {digest,receipt});
      return send(200, receipt);
    } catch { if (!response.headersSent) send(400, {code:'invalid_event'}); }
  });
  server.requestTimeout = 1000;
  server.headersTimeout = 1000;
  server.setTimeout(1500, socket => socket.destroy());
  return {server, get effects(){return effects;}};
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {server} = createFixture();
  server.listen(43813, '127.0.0.1', () => console.log('Synthetic adapter listening on loopback port 43813'));
  const stop=()=>{server.close();server.closeAllConnections();};
  process.once('SIGTERM',stop);process.once('SIGINT',stop);
}
