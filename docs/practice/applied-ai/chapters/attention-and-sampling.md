# Attention and Probabilistic Generation — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/attention-and-sampling.md)

## Practice and acceptance

Compute the two-key weights/mixed vector by hand and verify the test. Change a future key/value and prove causal output invariance; then deliberately unmask it and observe the difference. Demonstrate why masking after softmax without renormalization is incorrect. Compare low/high positive temperature on fixed logits, and implement a bounded toy categorical sampler/top-p filter with explicit boundary/tie tests.

**Acceptance:** strict checking/tests pass; finite outputs/normalization/dimensions/masks are verified; you can identify which parts of a transformer this code omits and explain next-token probability versus factual validity. Run a separately authorized representative repeated-generation experiment only after selecting a supported model and budget; report disagreement and unsupported-output rates. Full transformer training, tensor/GPU implementation, live quality/reproducibility measurements and learner practice remain unperformed.
