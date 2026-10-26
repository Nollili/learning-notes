# Browser CSP: Nonces, Reports and Deployment Evidence

Continue Node24.18.0/Express5/TypeScript5.9.3. CSP constrains browser resource/script execution according to a response policy. It supplements escaping, authentication, authorization and safe DOM use; it does not make arbitrary HTML injection safe. A JSON API's header needs differ from an HTML document's policy. Start with the application's actual document/resource graph and supported browsers, not a copied list of every CDN.

## A per-response nonce in an owned HTML template

Generate a cryptographically random nonce for each HTML response and put that same value in its policy and intended inline script. Do not accept it from query/header/cookie/source data or reuse a static build-time nonce. Keep the script's code application-owned; adding a nonce to attacker-controlled script content would authorize that content. This fixture has one HTML route, a status element and one fixed script; no client text becomes markup.

```ts
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
```

The trusted publicOrigin config names the real HTTPS document/report origin in deployment; do not derive it blindly from Host/forwarded headers. For a loopback HTTP test use a reviewed synthetic HTTPS origin in the header and manually post to the local report route; that does not test browser reporting. The app is importable without listening; the test/server owner binds and closes it. Apply the policy consistently to every real HTML/template/error document, not just this one route. Shared/CDN caching must never mix a policy nonce from one response with another document; no-store is the deliberate fixture choice, not a complete CDN deployment configuration.

strict-dynamic trusts script-loading behavior initiated by an already trusted script in supporting browsers. It can simplify script host lists but expands the importance of that script/loader; a compromised trusted third party can still execute. Nonce support/fallback behavior varies by supported browser. This fixture includes no unsafe-inline or unsafe-eval escape hatch and no blanket script host list. Do not “fix” a broken library by enabling everything. Review third-party loaders, tag managers, dynamic imports, workers, style/CSS-in-JS injection and legitimate fetch/image/font endpoints under the actual policy. CSP violations from browser extensions/noisy clients are not automatically product regressions or evidence of an attack.

## Reports are untrusted telemetry, not proof of enforcement

Reporting-Endpoints with report-to is the modern reporting path; report-uri remains a deprecated compatibility fallback. Browser support and report timing/delivery differ, so validate the actual supported clients/ingress. Report-Only observes the proposed policy without enforcing it; it cannot protect the page merely because reports arrive. Start a controlled report-only rollout, review legitimate blocked resource cases, then switch the reviewed policy to enforcement with a rollback plan. Other defenses remain active throughout.

The endpoint caps parser bytes/report count and projects only known directive/disposition enums. It intentionally discards document/blocked/source URLs, samples, referrers and arbitrary report fields, which can contain secrets/private paths. Reports can be forged; they do not authenticate a user, show that a browser really blocked anything or grant permission. Add gateway/body/rate/concurrency protection, bounded low-cardinality storage/counters and explicit telemetry retention/access before public deployment. A burst of valid small reports can still exhaust resources. A failed record sink yields a fixed503 without raw payload/error; partial telemetry recording is possible across a batch and is not a business transaction.

## Static hash alternative

For immutable inline script bytes, compute SHA256 over exactly bootstrap and use script-src 'sha256-BASE64' with the corresponding bytes in HTML. Whitespace, minification and deployment transforms change the hash; compute it from the emitted artifact and test it again after packaging. A hash authorizes that exact script, not arbitrary code or its dependencies by default. Review strict-dynamic semantics when combining it with hashes. External script integrity/cross-origin loading has a separate SRI/CORS/deployment contract; do not assume CSP replaces dependency integrity.

A nonce is convenient for server-generated per-response HTML. A hash suits stable static output and can permit shared caching when the content/policy pair is versioned correctly. Neither solves unsafe DOM sinks or a nonce-bearing trusted loader executing attacker-controlled strings. Avoid introducing a second CSP through Helmet/reverse-proxy defaults without reviewing the effective combined restrictions: multiple enforced policies all apply and can unexpectedly break legitimate resources.

## Practice and acceptance

Extract csp-app.ts into the isolated Express5 lab. Strict-typecheck and start on an ephemeral loopback port: require fresh nonce per response, exact HTML/header nonce match, no client-supplied nonce influence, correct report-only versus enforcement header, no-store and exact configured Reporting-Endpoints. Compute the static script hash from exact emitted bytes and show a whitespace mutation changes it. Post legacy/modern reports and require only projected fields; malformed JSON, unsupported content, unknown directive, too many reports and oversized body reject without echoing synthetic secrets. A recording-sink failure must not leak its exception. Close all servers/connections.

**Browser/deployment acceptance still to perform:** intended nonce/hash script executes; a script missing/wrong nonce and inline event handler does not; permitted third-party loader/style/fetch/font routes work under the reviewed policy; forbidden resource/script stays blocked; report-only versus enforcement differs; reports reach the controlled collector without private URL/sample retention. Test actual supported browsers, proxy/CDN transformations and rollback. Static header/HTML/report-handler tests do not establish native CSP enforcement or third-party compatibility. No browser run or hosted deployment is implied by the supplied local tests; learner practice remains required.

References checked2026-10-25: [MDN CSP guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [OWASP CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [report-to and Reporting-Endpoints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to), [Node24 crypto](https://nodejs.org/download/release/v24.18.0/docs/api/crypto.html). The example is a scoped security learning fixture, not a claim that a production CSP has been deployed.
