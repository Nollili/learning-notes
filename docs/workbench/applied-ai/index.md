# Applied-AI workbench

These are reference implementations and controlled checks, separate from [textbook explanations](../../applied-ai/index.md) and [independent practice](../../practice/applied-ai/index.md). No pass here completes learner work or establishes live model quality.

| Collection | What runs / what remains separate |
|---|---|
| [Python components](./python/index.md) | Locked extraction/retrieval/evidence/state/approval/budget/security/evaluation modules and tests; mock provider transport and owned loopback services |
| [n8n transform/adapter](./n8n/index.md) | Plain transformation and temporary HTTP fixture; installed n8n engine, expressions/webhooks/credentials are not tested by it |
| `ui/generation-panel.tsx` | Retained React API-port example displayed in the streaming lesson; not a complete browser/backend/provider integration |
| `mcp-lab/` | Existing pinned MCP fixture; [MCP lesson](../../python-for-ai/mcp-primitives.md) owns setup and boundaries |
| `secondary-lab/` | Existing optional ETL/Streamlit fixture; [operations lesson](../../python-for-ai/operations-and-data.md) owns its separate lock/setup |
| `adaptation-lab/` | Existing optional graph/data-split helpers; [extension lesson](../../python-for-ai/graphs-and-adaptation.md) states unimplemented graph/training services |

The three optional directories were moved with their dependency/configuration files. Moving them does not imply their integrations were rerun. `AI_ROUND_2_MIGRATION.json` is repository tracking, outside the published lesson pages; inspect it locally rather than expect a site download.
