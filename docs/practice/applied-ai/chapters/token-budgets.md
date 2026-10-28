# Tokens, Context and Explicit Budget Rejection — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/token-budgets.md)

## Practice and acceptance

Use the fictional2048/1024/128 budget to show exact acceptance896 and rejection897. Compare a small plain-text sample in a model-appropriate tokenizer with its full structured-request count; include Hungarian text, emoji, code, repeated whitespace, a schema and history. Record actual token counts and model/payload versions; do not substitute estimated character ratios as measurements. No provider count or generation request has been made by the supplied offline tests.

**Acceptance:** strict checking and all tests pass; count/generation payload fields match; one-over input and preflight failure cause zero generation calls; output cap matches the reserved value; private content stays out of errors. Add alternate output-cap assertions, negative provider counts, count-time cancellation/deadline and generated incomplete-result tests. Design a UI/state transition for input-too-large versus output-incomplete and retain user-controlled recovery evidence. Live tokenizer/provider comparison, shared monetary admission, long-context quality measurements, UI implementation and learner practice remain required.
