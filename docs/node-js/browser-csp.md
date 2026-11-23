# Browser CSP: Nonces, Reports and Deployment Evidence

This lab continues with Node 24.18.0, Express 5 and TypeScript 5.9.3. CSP is a response policy that limits which resources and scripts a browser may run. **CSP supplements escaping and access controls; it does not make arbitrary HTML injection safe.** An HTML document and a JSON API need different policies. Start from the application's actual resources and supported browsers rather than copying a list of CDNs.

## A per-response nonce in an owned HTML template

Generate a cryptographically random nonce for each HTML response. Put that same value in the policy and the intended inline script. Do not take it from a query, header, cookie or source record, or reuse a build-time value. **A nonce authorizes the script carrying it**, so the script content must remain application-controlled. This example has one HTML route, one status element and one fixed script; it never turns client text into markup.

<<< ../workbench/node-js/security/csp/csp-app.ts

The trusted publicOrigin config names the real HTTPS document/report origin in deployment; do not derive it blindly from Host/forwarded headers. For a loopback HTTP test use a reviewed synthetic HTTPS origin in the header and manually post to the local report route; that does not test browser reporting. The app is importable without listening; the test/server owner binds and closes it. Apply the policy consistently to every real HTML/template/error document, not just this one route.

Shared/CDN caching must never mix a policy nonce from one response with another document; no-store is the deliberate fixture choice, not a complete CDN deployment configuration.

strict-dynamic trusts script-loading behavior initiated by an already trusted script in supporting browsers. It can simplify script host lists but expands the importance of that script/loader; a compromised trusted third party can still execute. Nonce support/fallback behavior varies by supported browser. This fixture includes no unsafe-inline or unsafe-eval escape hatch and no blanket script host list. Do not “fix” a broken library by enabling everything.

Review third-party loaders, tag managers, dynamic imports, workers, style/CSS-in-JS injection and legitimate fetch/image/font endpoints under the actual policy. CSP violations from browser extensions/noisy clients are not automatically product regressions or evidence of an attack.

## Reports are untrusted telemetry, not proof of enforcement

`Reporting-Endpoints` with `report-to` is the modern reporting path; deprecated `report-uri` remains a compatibility fallback. Test actual browser support, timing and delivery through the deployed ingress. **Report-Only observes a policy without enforcing it.** Receiving reports does not mean the page is protected by that policy. Roll out report-only deliberately, investigate legitimate resources that would be blocked, then enable the reviewed policy with a rollback plan. Keep other defenses active throughout.

The endpoint caps parser bytes/report count and projects only known directive/disposition enums. It intentionally discards document/blocked/source URLs, samples, referrers and arbitrary report fields, which can contain secrets/private paths. Reports can be forged; they do not authenticate a user, show that a browser really blocked anything or grant permission. Add gateway/body/rate/concurrency protection, bounded low-cardinality storage/counters and explicit telemetry retention/access before public deployment. A burst of valid small reports can still exhaust resources. A failed record sink yields a fixed503 without raw payload/error; partial telemetry recording is possible across a batch and is not a business transaction.

## Static hash alternative

For immutable inline script bytes, compute SHA256 over exactly bootstrap and use script-src 'sha256-BASE64' with the corresponding bytes in HTML. Whitespace, minification and deployment transforms change the hash; compute it from the emitted artifact and test it again after packaging. A hash authorizes that exact script, not arbitrary code or its dependencies by default. Review strict-dynamic semantics when combining it with hashes. External script integrity/cross-origin loading has a separate SRI/CORS/deployment contract; do not assume CSP replaces dependency integrity.

Use a nonce for server-generated HTML that changes per response. A hash can suit stable static output and shared caching when content and policy are versioned together. **Neither approach fixes unsafe DOM insertion or a trusted loader executing attacker-controlled text.** Check any additional policy from Helmet or a reverse proxy: all enforced policies apply together and can block legitimate resources unexpectedly.

## Practice and acceptance

[Exercises and learner checklist](../practice/node-js/browser-csp.md).
