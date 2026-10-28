# Conversation History, Summaries and Checked Workflows — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/history-and-workflows.md)

## Practice and acceptance

Run strict typing and deterministic history tests:0/1/4/6 retained turns, complete pair/order preservation, excessive input, invalid keep/bool, blank/oversize/invalid-Unicode text, fake role delimiters staying data and stable/changing digests. These establish bounded serialization only, not authorization, summarization quality or tokens.

Build an application-owned checkpoint fixture for the document assistant. Interrupt after source resolution and again after answer validation. Resume against the same revision, then against a changed source/permission/conversation revision; require reuse only for still-valid artifacts and no unauthorized disclosure. Retain stage inputs/outputs as approved fixture data, not raw private production logs. Measure stage and total latency/cost plus errors; compare the fixed workflow with one larger prompt under the same held-out task rather than assuming decomposition wins.

Create a labeled summary set containing negation, rejected options, explicit budgets, changed decisions, unresolved questions and embedded commands. For each candidate check factual support, constraint retention and source references with a human rubric. Acceptance: no permission is granted from summary text, contradictions are caught before use, omission is explicit and stale revision cannot overwrite current state. Test a final request's count/generation equality after adding history. Native UI recovery, durable store/CAS/deletion, actual provider summary quality and independent learner implementation remain required.
