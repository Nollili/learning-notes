# n8n transformation and custom-service workbench

The [textbook recipe](../../../applied-ai/n8n/integration.md) describes n8n 2.44.7 node configuration. These files exercise a **plain Code-node transformation body and disposable loopback adapter**, without installing/publishing n8n or contacting a provider. They are not an exported/import-verified workflow.

## Normalize the webhook envelope

For the recipe's Code node select JavaScript / Run Once for All Items and use the body below. The If condition reads <code v-pre>{{ $json.accepted }}</code>. The HTTP Request JSON body is <code v-pre>{{ $json.event }}</code> on the true branch; the false branch returns only a fixed validation category. In the expression editor select the appropriate field mode; JSON export syntax can include an additional leading `=` and is not supplied here.

<<< ./normalize-code.js

The runner supplies `$input.all()` as a test seam. This verifies the transformation logic, not n8n's expression engine or paired-item resolution. One invalid item projects a fixed rejection without copying the raw payload; more than 20 items fails the whole transform. Earlier ingress byte limits are still required before these objects exist.

## Disposable service and checks

<<< ./service.mjs

`node docs/workbench/applied-ai/n8n/check.mjs` runs the pure fixture and a temporary loopback HTTP listener, then closes it. It checks item correlation/rejection, fake bearer auth, fixed source scope, controlled 503 with no effect, same-key replay/changed-command conflict and byte limits. No notification or external refresh occurs: the only “effect” is an in-memory synthetic receipt.

For a separate manual local practice session, `node docs/workbench/applied-ai/n8n/service.mjs` listens only on 127.0.0.1:43813 until stopped. The printed address contains no token; the exported token is deliberately fake and valid only for this disposable fixture. Container networking needs an explicitly reviewed service address—`localhost` inside an n8n container refers to that container, not the host service. Do not bind this fixture publicly or mistake it for a production authentication service.

Receipts disappear on restart and entry capacity is 100. The service grants two synthetic source IDs (`public`, `public_copy`) at revision 1 and rejects changes before replay; it does not prove durable idempotency, source reindexing, user authorization or raw-body duplicate-key rejection. The actual application must supply those contracts. P-335's SQLite executor is the durable local-effect reference; [N8N-P01](../../../practice/applied-ai/n8n-integration.md) requires real test-webhook/credential/history observations separately.
