# Python Setup, Syntax, Collections and Functions — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/setup-and-basics.md)

## Practice and acceptance

**Acceptance:** build the learner project with the pinned interpreter and lockfile, then recreate its environment with uv sync --locked and run the tests. Explain how the lock differs from the interpreter pin and why .venv is disposable. Change the Python requirement or dev dependency without updating the lock and prove --locked rejects the mismatch; restore the intended declaration afterward. Do not “repair” a failed locked check by silently resolving inside CI.

Implement an independent extension that filters normalized documents by a required tag and produces counts by tag. Preserve first-seen ordering, handle an empty batch, reject duplicate identities and leave input unchanged. Add tests for exact body/tag/count limits, non-text/bytes values, Unicode case folding and a keyword-only misuse. Demonstrate the shallow-copy aliasing and mutable-default bugs separately, then repair them without introducing a hidden global cache. Explain len(text) versus bytes/tokens before estimating any AI context budget. No model, provider account or paid request is needed for this batch. Learner practice remains required.
