# Browser CSP: Nonces, Reports and Deployment Evidence

Continue Node24.18.0/Express5/TypeScript5.9.3. CSP constrains browser resource/script execution according to a response policy. It supplements escaping, authentication, authorization and safe DOM use; it does not make arbitrary HTML injection safe. A JSON API's header needs differ from an HTML document's policy. Start with the application's actual document/resource graph and supported browsers, not a copied list of every CDN.

## A per-response nonce in an owned HTML template

Generate a cryptographically random nonce for each HTML response and put that same value in its policy and intended inline script. Do not accept it from query/header/cookie/source data or reuse a static build-time nonce. Keep the script's code application-owned; adding a nonce to attacker-controlled script content would authorize that content. This fixture has one HTML route, a status element and one fixed script; no client text becomes markup.

<<< ../workbench/node-js/security/csp/csp-app.ts

The trusted publicOrigin config names the real HTTPS document/report origin in deployment; do not derive it blindly from Host/forwarded headers. For a loopback HTTP test use a reviewed synthetic HTTPS origin in the header and manually post to the local report route; that does not test browser reporting. The app is importable without listening; the test/server owner binds and closes it. Apply the policy consistently to every real HTML/template/error document, not just this one route.

Shared/CDN caching must never mix a policy nonce from one response with another document; no-store is the deliberate fixture choice, not a complete CDN deployment configuration.

strict-dynamic trusts script-loading behavior initiated by an already trusted script in supporting browsers. It can simplify script host lists but expands the importance of that script/loader; a compromised trusted third party can still execute. Nonce support/fallback behavior varies by supported browser. This fixture includes no unsafe-inline or unsafe-eval escape hatch and no blanket script host list. Do not “fix” a broken library by enabling everything.

Review third-party loaders, tag managers, dynamic imports, workers, style/CSS-in-JS injection and legitimate fetch/image/font endpoints under the actual policy. CSP violations from browser extensions/noisy clients are not automatically product regressions or evidence of an attack.

## Reports are untrusted telemetry, not proof of enforcement

Reporting-Endpoints with report-to is the modern reporting path; report-uri remains a deprecated compatibility fallback. Browser support and report timing/delivery differ, so validate the actual supported clients/ingress. Report-Only observes the proposed policy without enforcing it; it cannot protect the page merely because reports arrive. Start a controlled report-only rollout, review legitimate blocked resource cases, then switch the reviewed policy to enforcement with a rollback plan. Other defenses remain active throughout.

The endpoint caps parser bytes/report count and projects only known directive/disposition enums. It intentionally discards document/blocked/source URLs, samples, referrers and arbitrary report fields, which can contain secrets/private paths. Reports can be forged; they do not authenticate a user, show that a browser really blocked anything or grant permission. Add gateway/body/rate/concurrency protection, bounded low-cardinality storage/counters and explicit telemetry retention/access before public deployment. A burst of valid small reports can still exhaust resources. A failed record sink yields a fixed503 without raw payload/error; partial telemetry recording is possible across a batch and is not a business transaction.

## Static hash alternative

For immutable inline script bytes, compute SHA256 over exactly bootstrap and use script-src 'sha256-BASE64' with the corresponding bytes in HTML. Whitespace, minification and deployment transforms change the hash; compute it from the emitted artifact and test it again after packaging. A hash authorizes that exact script, not arbitrary code or its dependencies by default. Review strict-dynamic semantics when combining it with hashes. External script integrity/cross-origin loading has a separate SRI/CORS/deployment contract; do not assume CSP replaces dependency integrity.

A nonce is convenient for server-generated per-response HTML. A hash suits stable static output and can permit shared caching when the content/policy pair is versioned correctly. Neither solves unsafe DOM sinks or a nonce-bearing trusted loader executing attacker-controlled strings. Avoid introducing a second CSP through Helmet/reverse-proxy defaults without reviewing the effective combined restrictions: multiple enforced policies all apply and can unexpectedly break legitimate resources.

## Practice and acceptance

[Exercises and learner checklist](../practice/node-js/browser-csp.md).
