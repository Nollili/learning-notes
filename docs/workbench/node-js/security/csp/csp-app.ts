// csp-app.ts
import express from 'express';
import type { ErrorRequestHandler } from 'express';
import { randomBytes } from 'node:crypto';
export const bootstrap = "document.getElementById('status').textContent = 'Ready';";
const directives = ['script-src', 'script-src-elem', 'style-src', 'style-src-elem',
  'img-src', 'connect-src', 'base-uri', 'object-src', 'frame-ancestors', 'form-action'] as const;
type Directive = typeof directives[number];
export type Violation = { directive: Directive; disposition: 'report' | 'enforce' };
function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function projectReports(value: unknown): Violation[] | undefined {
  const reports: unknown[] = Array.isArray(value) ? value : [value];
  if (reports.length < 1 || reports.length > 10) return undefined;
  const safe: Violation[] = [];
  for (const report of reports) {
    if (!object(report)) return undefined;
    const legacy = report['csp-report'];
    const body = object(legacy) ? legacy : report.type === 'csp-violation' ? report.body : undefined;
    if (!object(body)) return undefined;
    const directive = object(legacy) ? body['effective-directive'] : body.effectiveDirective;
    const disposition = body.disposition;
    if (typeof directive !== 'string' || !directives.some(d => d === directive)
        || (disposition !== 'report' && disposition !== 'enforce')) return undefined;
    safe.push({ directive: directive as Directive, disposition });
  }
  return safe;
}
export function createCspApp(mode: 'report-only' | 'enforce', publicOrigin: string,
  record: (violation: Violation) => undefined) {
  const origin = new URL(publicOrigin);
  if (origin.protocol !== 'https:' || origin.username || origin.password
      || origin.pathname !== '/' || origin.search || origin.hash) throw new TypeError('Invalid public origin');
  if (mode !== 'report-only' && mode !== 'enforce') throw new TypeError('Invalid CSP mode');
  const app = express();
  app.disable('x-powered-by');
  app.get('/', (_req, res) => {
    const nonce = randomBytes(18).toString('base64');
    const policy = ["default-src 'none'", "base-uri 'none'", "object-src 'none'",
      "frame-ancestors 'none'", `script-src 'nonce-${nonce}' 'strict-dynamic'`,
      "style-src 'self'", "img-src 'self'", "connect-src 'self'", "form-action 'self'",
      'report-to csp', 'report-uri /csp-report'].join('; ');
    res.set(mode === 'enforce' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only', policy);
    res.set('Reporting-Endpoints', `csp="${new URL('/csp-report', origin).href}"`);
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'no-referrer');
    res.type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CSP lab</title></head>
<body><p id="status">Loading</p><script nonce="${nonce}">${bootstrap}</script></body></html>`);
  });
  app.post('/csp-report', express.json({
    type: ['application/csp-report', 'application/reports+json'], limit: '2kb', strict: true,
  }), (req, res) => {
    const events = projectReports(req.body as unknown);
    if (!events) { res.status(400).json({ error: 'INVALID_REPORT' }); return; }
    for (const event of events) record(event);
    res.status(204).end();
  });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    const kind = object(error) ? error.type : undefined;
    res.status(kind === 'entity.too.large' ? 413 : kind === 'entity.parse.failed' ? 400 : 503)
      .json({ error: 'REPORT_REJECTED' });
  };
  app.use(errors);
  return app;
}
