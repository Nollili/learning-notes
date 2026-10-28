# MCP authentication, authorization and tool trust — practice

**Learner status: still required.** Use the [integrated sequence](../index.md).

[Textbook](../../../python-for-ai/mcp-security.md)


## Practice acceptance

Reproduce the middleware/ACL checks, then replace only the verifier with your owned issuer integration and retain bad-signature, wrong-issuer/audience, expired, absent-scope and revoked-access results. Add a denied resource/prompt path if they expose private data, not just a tool. Demonstrate that server descriptions, resource text and model arguments cannot widen the current grant or authorize a write. Trace a request without recording credentials/private fields and perform a secret-canary leakage check. Record untested issuer/TLS/consent/revocation-propagation boundaries explicitly. Learner implementation remains **still required**; the worked fixture does not establish secure production operation or professional readiness.


For long-running operations, continue with [MCP cancellation and compatibility](./mcp-lifecycle.md). The JSON-response auth fixture above does not establish client-to-handler cancellation; its transport-mode limitation is documented there.
