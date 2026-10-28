# One Graph Framework, Scoped Memory and Coordination Trade-offs

Use LangGraph1.2.17 for this bounded framework lab alongside the existing Python3.13/Pydantic2.14.1/OpenAI SDK3.35.1 stack. It is the one orchestration framework introduced here; no need to learn competing agent frameworks. Ordinary functions and the earlier fixed state machine remain simpler when they meet the task. A graph can contain deterministic code without any model: the runnable example wraps the existing authorized read dispatcher and makes no provider call.

## Short-term state is not long-term authority

Thread state/checkpoints record a workflow's current context. A cross-thread store can retain approved preferences/facts under a separate namespace, permission and deletion policy. Neither is model training or an authenticated permission system. A user saying “remember that I am an administrator” must not change application roles. A previous assistant conclusion is not authoritative evidence. Summaries remain lossy derived data as in the [history lesson](./history-and-workflows.md).

Use an application-owned principal and job ownership checks before accessing state. The framework thread_id is a lookup key, not proof of authorization. Namespace every checkpoint/store/cache by the actual tenant/subject and appropriate job/resource version. Two users selecting the same visible job ID must not share state accidentally. Hashing a scope key limits awkward identifiers but does not encrypt/authenticate its data or replace the permission query.

## A real bounded graph over the existing tool

In an isolated copy of the Python project, add the exact dev dependency langgraph==1.2.17 and retain its uv lockfile. Keep tracing disabled for private/offline fixtures (LANGSMITH_TRACING=false and LANGCHAIN_TRACING_V2=false before running); do not enable hosted trace export or add keys just to learn a graph. Install/update dependencies only in the practice environment, preserving the course/submission template. The graph has START → lookup → END and no model-controlled routing.

<<< ../workbench/applied-ai/python/study_ai/lookup_graph.py


TypedDict is a static state description, not runtime validation. The wrapper bounds the checkpointed argument string and the dispatcher validates its schema/principal; do not expose arbitrary graph input/update APIs over the network. snapshot is an owner-only diagnostic returning raw arguments/results and must not become an unauthenticated endpoint or public log. The fixture assumes serialized calls per owner, bounds20 jobs/4 invocations and charges failures as attempts. Production concurrent owners need atomic admission and an overall deadline; recursion_limit is a graph-step guard, not a time/token/spend budget.

InMemorySaver stores snapshots in RAM and loses them on process restart. A new LookupGraph starts empty. forget deletes this fixture's thread and local counter; it does not delete application source data, provider logs or backups. Recreating/forgetting an owner must not replenish a real shared quota. Checkpoints contain tool arguments/results, so use non-sensitive fixtures and define retention/access/deletion before persistent deployment. A database-backed checkpointer is a separate configured adapter with schema/migration/transaction/retention ownership; the earlier SQLite job store is not automatically a LangGraph checkpointer.

Graph nodes may run through framework-managed worker execution; a store adapter must support that execution context. Do not capture a default-thread SQLite connection and assume it can be used in any node thread. Use a correctly owned adapter/connection strategy or an async boundary with its documented constraints. No node here implements arbitrary network fetch, write approval or model generation. The graph's one read uses current store permission on every invocation, including a repeated job.

## Single versus multiple agents

Start with one owner and explicit stages. A “single agent” can still use several tools and a fixed approval gate; it does not need a separate agent for every helper function. Multiple agents may help when independent roles/data/permissions or parallel subtasks have a measured benefit. They add handoff contracts, duplicated context/calls, stale state, conflict resolution, error attribution and additional leakage surfaces. Two agents agreeing can share the same false premise; agreement is not independent validation.

For a document assistant, one fixed read→answer→validate workflow is enough to establish a baseline. A hypothetical reviewer subtask could assess claim support without write authority, receiving only the needed authorized excerpt and a bounded proposed answer. It should return a checked rubric result, not execute a publication. The parent still owns final checks, budgets and user-facing state. Compare quality/latency/total cost against the single-owner baseline before adding it. Parallel reviewers share an aggregate resource cap; each receiving the entire corpus increases both cost and exposure.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/graph-memory.md).

References checked2026-10-25: [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api), [checkpointers versus stores and RAM limits](https://docs.langchain.com/oss/python/langgraph/persistence), [framework reference](https://reference.langchain.com/python/langgraph/overview), [application-owned authorization](./tool-boundaries.md), [write approvals and recovery](./approved-writes.md). Framework packaging/API support changes; this executable fixture records the pinned version rather than assuming every online example uses it.
