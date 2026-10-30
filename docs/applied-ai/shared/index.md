# Shared model and application foundations

New to AI development? Begin with [the JavaScript route](../javascript/orientation.md). This shared engineering reference is deeper study when your project reaches these boundaries; the linked Python implementation is optional.

A model proposes output; the application owns the task, identity, validated boundary and effects. The same rule applies to an answering model, a planner, a reranker and an n8n AI node. Inputs from sources, tool results, history and previous model responses remain **untrusted data**.

## One coherent prerequisite chain

| Teaching owner | Worked boundary |
|---|---|
| [Model integration](../../python-for-ai/model-sdk.md) | Owned client, explicit one-attempt policy, structured classifier result and safe error vocabulary |
| [Tokens](../../python-for-ai/token-budgets.md), [streaming](../../python-for-ai/model-streaming.md) | Count final payload; reserve output; distinguish pending draft, terminal result, refusal, incomplete and outage |
| [Tools](../../python-for-ai/tool-boundaries.md), [history/state](../../python-for-ai/history-and-workflows.md) | Exact tool names/complete arguments/call identity; validated results; history is no authority |
| [Task-scoped injection boundary](../../python-for-ai/prompt-injection-boundaries.md), [source/output sinks](../../python-for-ai/source-and-output-security.md) | Current tenant/subject scope, purpose-limited reads, fixed safe rendering and no arbitrary URL/shell fallback |
| [Admission/retries](../../python-for-ai/model-work-budgets.md), [task economics](../../python-for-ai/model-economics.md) | Calls/bytes/time/spend are separate; reserve before work; unknown usage is not zero |
| [Evaluation](../../python-for-ai/evaluation-lab.md), [measurements](../../python-for-ai/evaluation-measurements.md), [diagnostics](../../python-for-ai/workflow-diagnostics.md) | Independent deterministic gates and semantic rubric; versioned cases, safe events and whole-task denominators |
| [Provenance/oversight](../../python-for-ai/provenance-and-oversight.md), [provider data lifecycle](../../python-for-ai/provider-data-lifecycle.md) | Approval versus receipt versus trace; minimize export and inventory derivatives |

The [Python workbench](../../workbench/applied-ai/python/index.md) contains the source displayed in these lessons. The pinned study environment is Python 3.13.11, OpenAI SDK 3.35.1, Pydantic 2.14.1 and LangGraph 1.2.17 where selected. These are reproducible fixture versions, not claims that they are the latest or account-enabled. Network behavior is tested through mock transports or owned loopback services; no real model quality follows from those tests.

## Structured output and tools have different jobs

Use a typed response schema when the output is application data, such as an answer/citation record. Use tool calling when a model proposes an application operation. In both cases validate complete output locally, check semantics/current authority and handle refusal/incomplete/transport failures before acceptance. Do not execute streamed argument fragments or “repair” incomplete JSON into a claimed success.

The existing Responses tool definition uses `strict: true`, required fields and `additionalProperties: false`. Provider-supported schema subsets differ from arbitrary application validators. On 2026-10-27 the [official function-calling contract](https://developers.openai.com/api/docs/guides/function-calling) and [structured-output guidance](https://developers.openai.com/api/docs/guides/structured-outputs) were rechecked. The retained pinned SDK is still tested locally; this round does not migrate models or depend on a named hosted model being available.

## Keep observations and authority separate

A trace says that a step was attempted or returned a projected outcome. A receipt answers what committed in its transaction domain. An approval records an authenticated decision for one exact command. A source hash identifies bytes. None substitutes for the others.

Example: a rename commits but its response is lost. The UI records an uncertain outcome, the trace records a timeout, and the authoritative receipt still records the mutation. Retrying with a new operation ID can cause a second effect. Recovery must inspect the original operation under current authority.

For evaluation, schema validity, citation validity, claim support, task completion and safe action are distinct measures. Reject a cheaper/faster candidate that violates a required safety invariant. Include failed/cancelled attempts, queue time and unknown usage; do not hide them by reporting only successful requests.

[Shared practice and evidence](../../practice/applied-ai/index.md) · [Next: RAG](../rag/index.md)
