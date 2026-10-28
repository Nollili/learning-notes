# Browser CSP: Nonces, Reports and Deployment Evidence — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/browser-csp.md) · [Node.js practice map](./index.md)

## Practice and acceptance

Extract csp-app.ts into the isolated Express5 lab. Strict-typecheck and start on an ephemeral loopback port: require fresh nonce per response, exact HTML/header nonce match, no client-supplied nonce influence, correct report-only versus enforcement header, no-store and exact configured Reporting-Endpoints. Compute the static script hash from exact emitted bytes and show a whitespace mutation changes it. Post legacy/modern reports and require only projected fields; malformed JSON, unsupported content, unknown directive, too many reports and oversized body reject without echoing synthetic secrets. A recording-sink failure must not leak its exception. Close all servers/connections.

**Browser/deployment acceptance still to perform:** intended nonce/hash script executes; a script missing/wrong nonce and inline event handler does not; permitted third-party loader/style/fetch/font routes work under the reviewed policy; forbidden resource/script stays blocked; report-only versus enforcement differs; reports reach the controlled collector without private URL/sample retention. Test actual supported browsers, proxy/CDN transformations and rollback. Static header/HTML/report-handler tests do not establish native CSP enforcement or third-party compatibility. No browser run or hosted deployment is implied by the supplied local tests; learner practice remains required.

References checked2026-10-25: [MDN CSP guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [OWASP CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [report-to and Reporting-Endpoints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to), [Node24 crypto](https://nodejs.org/download/release/v24.18.0/docs/api/crypto.html). The example is a scoped security learning fixture, not a claim that a production CSP has been deployed.
