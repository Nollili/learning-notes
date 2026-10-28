# One Graph Framework, Scoped Memory and Coordination Trade-offs — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/graph-memory.md)

## Practice and acceptance

Run the actual pinned graph with a fake application-owned NoteStore: require one store read per invocation, projected success, fixed unavailable result for another tenant and invalid arguments causing zero reads. Inspect stored state, reuse the same job ID under two principal owners and require independent snapshots; revoke permission between runs and require the later read to fail closed. Verify repeated-run/job caps, input bounds, forget, a new-owner empty checkpoint and explicit store outage behavior. Keep tracing off and verify no model/provider request is involved.

Then introduce a real durable checkpointer in a separate approved practice setup only after access/retention/deletion and execution-context tests. Do not call RAM snapshots durable recovery. Write a single-versus-multi decision record with one proposed measurable benefit, permission/handoff contract, aggregate budget and evidence that would reject the added coordination. Primary framework material is the working graph above; a distributed multi-agent deployment is optional advanced practice. Learner durable-memory/service integration and any model-quality comparison remain required.
