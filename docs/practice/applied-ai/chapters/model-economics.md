# Model Task Economics and Shared Reservations — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/model-economics.md)

**Practice:** implement a bounded job that reserves before its first call, persists stage/results and reconciles known/unknown usage after injected failures. Acceptance: competing jobs cannot exceed the local allocation; replay cannot run a settled job again; ambiguous outcomes never refund automatically; settlement replay is exact; estimate overrun blocks promotion and records an operational incident. Build a versioned per-task cost ledger including all calls/unknowns and compare the three routing policies on a learner-authored labeled workload. Reject a cheaper policy with a required slice regression. Learner implementation, current price verification, actual provider bills and routing evaluation remain required.
