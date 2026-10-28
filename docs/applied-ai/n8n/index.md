# n8n: workflow data and bounded automation

n8n connects triggers, transformations and integrations in a visual workflow. It fits alongside application code: the workflow coordinates, while a custom service can own source authorization, typed business rules, index lifecycle, durable idempotency and approval receipts. A workflow that calls a model is not automatically an autonomous agent.

**Reference baseline:** n8n 2.44.7, with official documentation checked on 2026-10-27. The [tagged release](https://github.com/n8n-io/n8n/releases/tag/n8n%402.44.7) exists; this is a study baseline, not a claim that it is the newest secure patch when you deploy. UI/node versions, editions and feature availability must be recorded for a real run. No n8n instance or workflow was published during this review.

## Introductory-to-practical order

1. Understand the item envelope and expressions below using synthetic manual input.
2. Trace a condition and a subworkflow without credentials or side effects.
3. Follow [webhook and custom-service integration](./integration.md).
4. Apply [errors, testing and deployment ownership](./operations.md).
5. Perform the separate [N8N-P01 practice](../../practice/applied-ai/n8n-integration.md), reusing the notes domain from P-334/P-335.

## Items are the unit of data flow

A typical node receives and emits a list of items. Each item has a `json` object; binary data uses a separate `binary` field. A nested array inside one `json` object is **not** several items. Many nodes process each item, while some aggregate or run once for the whole collection; inspect the node's mode rather than assume a universal loop.

```json
[
  {"json":{"event_id":"evt_1","source_id":"public","action":"refresh"}},
  {"json":{"event_id":"evt_2","source_id":"other","action":"refresh"}}
]
```

Here there are two items. An HTTP node may therefore make two requests; limits/retries multiply that work. A batch body `{events:[...]}` would instead require explicit splitting. The [official data-structure explanation](https://docs.n8n.io/data/data-structure/) defines the envelope; it is not permission to trust the content.

## Expressions and transformations

An expression such as <code v-pre>{{ $json.source_id }}</code> reads the current item's field. Use the expression editor rather than treating user text as executable expression source. `$('Normalize').item.json.source_id` refers through item linking; `.first()` deliberately chooses one item and is not interchangeable with the matching item. Missing, split or aggregated links can make a previous-item reference ambiguous. Prefer explicit correlation IDs and current-item fields across integration boundaries. [Expressions](https://docs.n8n.io/code/expressions/), [item linking](https://docs.n8n.io/data/data-mapping/data-item-linking/item-linking-concepts/).

Use Edit Fields for simple projections, visual data nodes for common operations, and the Code node for a bounded transformation. Code has all-items and per-item modes. In all-items mode `$input.all()` supplies the collection; outputs that preserve one-to-one correspondence can carry `pairedItem: { item: index }`. Aggregation needs its own linking/correlation policy. Code-node availability of libraries/runtime features depends on hosting and runner configuration. Keep credentials and network calls out of the pure transform. [Code node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/).

## Triggers and control flow

| Mechanism | Role / boundary |
|---|---|
| Manual Trigger | Synthetic development execution; not a public endpoint |
| Schedule Trigger | Time-based automation; record workflow/instance timezone and overlapping-run policy |
| Webhook | HTTP entry point with explicit method/auth/body/response contract |
| If / Switch | Choose branches from validated data, not permission from a source string |
| Merge | Combine streams under an explicit matching/append policy; matching by position can associate the wrong records |
| Execute Sub-workflow | Reuse a bounded contract with declared inputs/outputs and caller policy |

Branches do not imply parallel execution. Current workflow settings describe v1 branch ordering; do not rely on canvas geometry as a business transaction policy. A subworkflow must validate scope/inputs and define whether the parent waits for completion. Fire-and-forget changes receipt/error ownership; it is not a way to hide a failed critical step. Use an ID-based join when ordering may change. [If](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/), [Merge](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.merge/), [subworkflows](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/), [settings](https://docs.n8n.io/workflows/settings/).

[Runnable transform/reference adapter](../../workbench/applied-ai/n8n/index.md) · [Next: integration](./integration.md)
