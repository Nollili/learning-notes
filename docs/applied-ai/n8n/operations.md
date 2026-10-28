# n8n errors, tests and deployment ownership

An execution record shows what n8n observed, not necessarily what a remote service committed. Test the boundary that failed and retain the original event identity before choosing retry or replay.

## Errors and retries

An error workflow starts from Error Trigger and is selected in workflow settings. Stop And Error can deliberately fail a run on a policy condition. Manual test executions and automatic/production error workflows have different behavior; do not assume a manual failure proves the production error handler ran. Trigger failures can also provide a different error-data shape. Keep missing execution/reference fields optional in diagnostic projection. [Official error handling](https://docs.n8n.io/flow-logic/error-handling/).

Node Retry On Fail is a bounded attempt mechanism, not business idempotency. Configure attempts and delay deliberately, and account for service/client retries below it. A 401/403, malformed input or conflict is not repaired by repeating it. A 429/503 may permit backoff/defer under the service's retry hint and total deadline. An ambiguous write timeout needs status reconciliation. “Continue on error” changes the workflow outcome; route its error result explicitly rather than treating it as a normal receipt. Inspect the installed node's available error/retry settings. [Node settings](https://docs.n8n.io/workflows/components/nodes/), [HTTP node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/).

For the reference integration, leave automatic write retries off initially. Test same-key replay at the service boundary first, then allow a small declared retry policy. Rate/admission, per-request timeout, workflow timeout and total elapsed/retry budget are different limits. A timeout cannot forcibly undo an already completed external action.

## Testing and execution history

Use a synthetic manual input first. Pin/mock safe data for repeatable transformations; production executions do not use development pinning. Inspect zero/one/multiple items and every branch, then use a test webhook with separate test credentials. Pinned success data can conceal a failing downstream service, so unpin it for the actual integration test. [Pinning/mocking](https://docs.n8n.io/data/data-pinning/).

Execution history helps locate the first failed node and compare projected inputs/outputs. Saved payloads may include private excerpts, headers or tokens: minimize fields, restrict readers and define saving/pruning/deletion/backup policy. Re-running old execution data can repeat effects; reauthorize the event and use its original business operation ID. Debug/copy-to-editor features depend on edition/registration; use sanitized fixtures if unavailable. [Execution debugging](https://docs.n8n.io/workflows/executions/debug/).

Test the custom service independently of n8n, then the installed nodes and credentials, then the complete test-only workflow. A plain JavaScript transform check does not validate n8n expression evaluation, item linking, node versions, webhook registration or credential delivery. Those remain separate learner observations in N8N-P01.

## Deployment basics without a hosted side effect

For an owned deployment, pin an exact supported image/release and record its digest/platform/configuration. Separate development/test from production credentials and data. Protect the editor, use appropriate TLS/proxy/webhook URL configuration, a least-privilege service identity and restricted outbound destinations. Do not expose a local editor through a tunnel just to make a synthetic test convenient.

Persist the n8n database/configuration and retain the credential encryption key securely alongside the recovery plan. Losing the key can make restored credentials unusable; in queue mode workers require consistent key configuration. Test a restore into an isolated environment before reconnecting triggers or destinations. A backup file or a workflow JSON export alone is not a tested recovery. [Encryption-key ownership](https://docs.n8n.io/hosting/configuration/configuration-examples/encryption-key/).

The current official Compose documentation also describes optional Assistant/sandbox services. They are not prerequisites for this small automation; do not enable AI-generated code execution, cloud assistants or additional paid features by copying an unrelated full stack. Review the [current installation guidance](https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose.md) against the exact selected version, resources and permitted features. This course supplies a deployment decision contract, not an executed hosting recipe.

Queue mode, distributed workers, external secrets, SSO, enterprise governance and AI agent/vector nodes are optional later extensions. Evaluate their edition/version requirements separately. The material completion gate is a bounded useful explanation and ready practice; no n8n production activation, paid service or external notification was performed here.
