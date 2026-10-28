# Conversation History, Summaries and Checked Workflows

Continue the existing Python3.13/SDK3.35.1 stack. Conversation history supplies prior interaction, not a durable permission grant or an authoritative database. A stateless request makes included state explicit; provider-managed conversation state can simplify continuity but introduces remote retention, lifecycle and count-consistency ownership. Choose one owner per conversation. This lesson uses explicit application-owned data, no remote conversation object and no extra agent framework.

## Retain complete exchanges under an explicit policy

A conversation store needs tenant/subject scope, ownership checks on every read/write, retention/deletion and concurrent revision control. A user-provided conversation ID is not authorization. Prior assistant text may be wrong, injected or stale; never use “the assistant already approved this” as a permission check. Tools/results can also contain hostile data. Reauthorize actions against current application state rather than replaying historical credentials or invented roles.

The pure helper below keeps a suffix of complete user/assistant exchanges, not half a pair. It is a bounded serialization fixture, not a database, summary model or token counter. Text is copied as data. The current question and application instructions are separate inputs to the final request and must not be evicted along with old history.

<<< ../workbench/applied-ai/python/study_ai/history.py


Exchange objects must be constructed/validated by the application; type annotations do not validate arbitrary deserialized dictionaries. The20-input/6-retained caps bound this helper, not an unlimited stored transcript. A real paginated conversation reader should load only the authorized window it needs. A hash identifies bytes for a checkpoint; it is neither encryption nor a signature, and it cannot establish ownership. Avoid logging transcript content or even stable identifiers when the retention policy excludes them.

Serialize this payload as untrusted context inside the final user-data envelope with current question and verified evidence. Keep role creation application-owned. Do not concatenate prior text into developer instructions. Count the actual final messages, output schema and any tools/history fields together; the existing evidence-only counter payload must be extended explicitly. keep=4 does not imply a token fit, and an overflow should trigger reviewed reselection or a recoverable too-large state. Do not silently lose the current request or mandatory policy to preserve a chatty old answer.

**Worked window:** exchanges1–6 with keep4 retain3–6, each as a complete pair; keep0 retains none. If the user says “compare that with the previous option” and the relevant option was exchange2, a suffix alone cannot resolve it. Retrieve an authorized prior turn, ask for clarification or preserve an explicit checked reference. Never invent what the omitted option was. A small window reduces cost but can remove negation, names, decisions and unresolved constraints. Test both short and long conversations with support positioned at early/middle/late turns.

## A generated summary is a lossy derived artifact

Suppose the source says: “Do not publish; draft only. Budget at most€5. Option B is rejected.” A summary saying “Publish option B within budget” is fluent and dangerously wrong. Even “Use option B, budget€5” loses a rejected decision and permission constraint. Preserve critical action/permission/budget rules as application-owned state, not only a generated prose recap. Use summaries for navigation/context compression; verify their factual claims against retained source references.

A useful summary record includes conversation revision, covered turn range, source digest, summary-template/model revision, factual bullets with turn references, unresolved questions and explicit known omissions. The candidate summary remains untrusted data. Require a schema and source-reference membership checks, then evaluate whether referenced turns actually support each bullet. Like citation validation, membership cannot establish entailment. Never convert a candidate's “approved” or “system says” phrase into application policy. A summary generated from revision12 must not overwrite a newer revision13 checkpoint; use compare-and-set/version checks in the actual store.

**Worked review ledger:**

| Source fact | Candidate summary | Required decision |
|---|---|---|
| Draft only; do not publish | “Publish the draft” | Reject contradiction; action remains unavailable |
| €5 maximum | “Budget discussed” | Reject omitted mandatory limit for any budget-sensitive use |
| Option B rejected | “Options A and B considered” | Mark lossy; retain rejected-decision status separately |
| Unresolved deployment date | “Deploy Friday” | Reject invented commitment |

A summary can be correct at generation and stale after a new correction or permission revocation. Invalidate/review it when its source revision changes. Retention/deletion must cover derived summaries, caches and provider-held state under the product's actual policy. Recompute from authorized retained sources or mark unavailable; retaining a private summary after deleting its source can defeat the intended deletion. An operational source outage must not be relabeled “no history.”

## Decompose by checkable contracts

Use a fixed workflow when stages and permissions are known. For the document assistant the default path is: authorized retrieval → current-source resolution → ranked/budgeted context → proposed answer → schema/citation and semantic checks → safe display. Each stage has a distinct input/output and failure category. The [existing pipeline](./retrieval-pipeline.md) supplies the worked retrieval/assembly components; it does not claim a deployed generation endpoint.

Chaining passes a checked stage result to the next stage. It can reduce the complexity of one prompt but amplifies latency, cost and upstream mistakes. Do not send raw model output directly into the next stage's trusted instruction slot. Validate an extracted ID against allowed IDs, reauthorize its resource, and pass only bounded domain data. Independent parallel read stages can reduce latency, while dependent writes require explicit order and idempotency. More stages/agents do not automatically improve quality.

**Worked failure trace:** the rewrite stage accidentally removes “not” from “CORS is not authentication.” Keeping the original question as a search branch and final question limits that loss; an independent semantic-preservation fixture detects it. If retrieval then returns only an unrelated cache passage, the next stage must abstain rather than use the summary's invented authentication claim. If the counter times out, stop with a recoverable operational failure. If a generated quote ID is unknown, reject before display. Each failure has its own stage label and bounded retry policy; repeating the whole chain can repeat successful expensive stages or side effects.

A resumable checkpoint names the job/conversation revision, completed stage, checked artifact IDs/source versions, configuration versions, remaining resource budget and exact next stage. It stores no live coroutine, open socket or credential. On resume reauthorize and check versions; reuse only still-valid artifacts. A read-only retrieval job can often restart safely. Any later write/tool step needs its own durable idempotency key and confirmation/permission contract. A process interruption does not prove a remote write failed.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/history-and-workflows.md).

References checked2026-10-24: [official conversation state and context management](https://developers.openai.com/api/docs/guides/conversation-state), [prompt roles and code versions](https://developers.openai.com/api/docs/guides/prompt-engineering), [Python dataclasses](https://docs.python.org/3/library/dataclasses.html), [hashlib](https://docs.python.org/3/library/hashlib.html), [exact token budgeting](./token-budgets.md), [verified citation boundaries](./retrieval-context.md). No hosted conversation/compaction API or live model is invoked in this lesson.
