// nonce-document.mjs
import { randomBytes } from 'node:crypto';
export function nonceDocument(reportOnly = true) {
  const nonce = randomBytes(24).toString('base64');
  const policy = `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`;
  return {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
      [reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy']: policy,
    },
    body: `<!doctype html><html lang="en"><meta charset="utf-8"><title>Nonce lab</title><body><p id="message"></p><script nonce="${nonce}">document.getElementById('message').textContent = 'Ready';</script></body></html>`,
  };
}
