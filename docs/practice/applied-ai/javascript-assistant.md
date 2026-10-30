# JavaScript learning-notes assistant: independent milestones

This is the beginner project for [Build AI Apps](../../applied-ai/). **Every learner milestone remains outstanding.** The [workbench](../../workbench/applied-ai/javascript/) is a worked reference; running it is not the same as implementing your own project.

Use a separate owned learner directory, synthetic notes and a small evidence ledger. Preserve any Autocode task's original scripts, exports, dependency configuration and supplied database settings. Never edit or add to `src/tests`. For a real submission run `npm run build`, `npm run test` and, for Module 4, its required Cobertura coverage script; this hub's JS IDs are not Autocode module numbers.

## Build in small increments

| ID | Deliverable | Checks and evidence |
|---|---|---|
| JS-00 | Explain request flow and set up a JS project | Draw browser/server/provider boundaries; keep a key out of frontend code; record actual runtime |
| JS-01 | Console helper with injected fake, then optional provider | Valid/empty input, rejected request, clean exit; label mock versus live observations |
| JS-02 | Chatbot inside an app | Completed-turn history, reset, failure, duplicate submit, delayed cancellation; demonstrate actual browser behavior |
| JS-03 | Streaming extension after JS-02 | Split network events, terminal success, partial failure, Stop, stale response after reset/unmount; do not call animated mock text provider streaming |
| JS-04 | Structured note classifier | Exact allowed fields, invalid shape, fabricated/genuine-but-misleading quote, ambiguous review; separate semantic rubric |
| JS-05 | Fixed read workflow, then a bounded model-selected tool loop | Allowed/unknown tool, invalid/extra args, call IDs/results, denied access, exhausted call/time limits; no unintended I/O |
| JS-06 | Cited RAG integrated with the chatbot | Load/version/chunk notes; lexical baseline; no-evidence answer; source/citation checks; labeled exact/paraphrase/unsupported cases |
| JS-06B | Optional embedding/hosted-store comparison | Compatible model/dimensions/metric, ranks on the same frozen question set, update/delete and access cases; real adapter observations separate from hand vectors |
| JS-07 | Your own MCP server and host connection | SDK discovery, allowed/bad tool calls, resource/prompt, child cleanup; record actual host setup separately from SDK-only checks |
| JS-08 | Stateful graph and interruption | Conditional route, approve/reject, RAM restart loss; optionally reopen a durable checkpointer and test current ownership |
| JS-09 | One chosen extension | Python processing, n8n, A2A or multimedia; scope, actual result, failure and remaining limits |

JS-03 may be deferred until a non-streaming RAG baseline works. JS-06B and JS-09 are optional. No paid model or hosted vector store is necessary to begin. By JS-06, actual generated answer quality needs a real authorized model experiment or an explicitly unmeasured outcome; a fake does not establish it.

## Keep one evidence record per increment

Record the requirement, code/lock/config version, expected outcome, actual command or interaction, observed result and unresolved gaps. Keep one meaningful failure/correction. For model work include prompt/model/corpus versions, allowed data and usage/unknown-cost notes. Never store credentials in the ledger.

At JS-02, explain local versus persisted history. At JS-05, distinguish a proposed call from actual execution. At JS-06, distinguish retrieval relevance, citation membership and claim support. At JS-08, distinguish a synthetic review value from trusted write approval. These are completion checks, not vocabulary-only questions.

## Continue into deeper engineering when useful

JS-06 can grow into [P-334/RAG-1–4](./rag-assistant.md); JS-05/08 can grow into [P-335/WF-1–4](./resumable-workflow.md). Those projects require stronger access, lifecycle and recovery evidence than this beginner route. The [Python companion](../../python-for-ai/) is optional; implement its version only for a concrete need. Existing IDs and historical observations remain intact.
