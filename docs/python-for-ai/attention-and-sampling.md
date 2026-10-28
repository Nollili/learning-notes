# Attention and Probabilistic Generation

This lesson gives an intermediate conceptual model and a tiny Python3.13 worked calculation. It implements no pretrained model and downloads no weights. Its purpose is to make masking, normalization and generation assumptions testable before using the SDK output as application data.

## Where attention sits

A transformer combines attention with other learned transformations. Tokens become vectors with positional information; repeated blocks mix context and transform representations. Attention alone is not the whole model: feed-forward layers, residual paths and normalization also matter. A final language-model head produces vocabulary scores. Encoder-style, decoder-style and encoder-decoder architectures use different information-flow patterns; do not assume every model is the original translation architecture.

In scaled dot-product attention, a query is compared with keys, scores are normalized and the corresponding values are mixed. Queries/keys/values normally come from learned projections. Multiple heads perform different projections before their outputs are combined. A causal mask prevents a position from using future positions. That mask is a mathematical dependency restriction, not application authorization or a rule saying which document is trustworthy.

For one query, write `score[j] = dot(query, key[j]) / sqrt(key_dimension)`. After masking disallowed positions, softmax converts visible scores into weights summing to1, and the output is their weighted sum of value vectors. The worked implementation uses supplied vectors rather than learned projections, so every number can be inspected independently. It demonstrates one operation, not a trained transformer's quality.

## Worked bounded softmax and masked attention

Subtracting the largest scaled score before exponentiating keeps softmax numerically stable for large finite inputs. It does not change the resulting ratios. Mask before normalization: zeroing an already-normalized future weight without renormalizing visible weights gives the wrong result. Reject an all-masked query rather than divide by zero.

<<< ../workbench/applied-ai/python/study_ai/attention_math.py


For query[1,0], keys[1,0] and[0,1], scores are approximately0.7071 and0. Their weights are approximately0.6698 and0.3302. With values[10,0] and[0,10], the mixed vector is approximately[6.6976,3.3024]. A third future key can have a much larger dot product and still receive weight0 when visible=2. Changing its content must not change the visible output.

The8-dimension/8-position and numeric bounds are teaching limits. This is deliberately eager Python arithmetic rather than a fast tensor kernel. Full dense attention across n positions considers n² pair relationships in the basic formulation; optimized kernels and alternative attention patterns change implementation costs. Do not derive a modern serving system's total memory/latency from this tiny loop. KV caching, batch/context lengths and model/runtime details need measurements.

## Next-token scores are a distribution, not factual confidence

A generative decoder scores possible next token IDs conditional on the current context. Normalization gives a next-token distribution; a decoding rule selects a token and repeats with the updated sequence. High probability means likely under this model/context/decoding setup. It does not mean an answer is factually verified, authorized or well calibrated for your application's label.

Greedy decoding selects a maximum-score token; it does not search all complete sequences or guarantee the best factual answer. Sampling can choose different tokens from the same distribution. Small early differences change subsequent context and can produce large later differences. A model can produce fluent unsupported claims even when every token follows its learned distribution. Source verification/evaluation stays outside the sampler.

Temperature rescales logits before normalization: lower positive values concentrate mass on high-scoring choices; higher values flatten it. This toy accepts0.1–10 and rejects0 because dividing by0 is undefined. A provider's accepted parameter range and its treatment of a zero/omitted value are API/model-specific; this helper is not a substitute for that contract.

Example normalized probabilities[0.60,0.25,0.15] support three possible tokens. A draw in[0,0.60) picks the first; a draw in[0.60,0.85) picks the second. Nucleus/top-p filtering with threshold0.80 keeps the smallest descending prefix reaching that mass: the first two entries total0.85, then renormalize to approximately[0.7059,0.2941]. Top-k instead keeps a fixed number of candidates. Neither sampling control prevents unsupported statements.

A fixed local random seed can reproduce a particular toy sampler/runtime sequence. It is not a guarantee of repeatability across hosted services, hardware kernels, parallel batching, model aliases or future versions. Temperature0 is likewise not a universal reproducibility or correctness guarantee. Record model/prompt/schema/runtime versions and compare repeated task-level results; do not replace evaluation with an assertion that the model "should be deterministic".

## Execute the invariants

<<< ../workbench/applied-ai/python/lab_tests/test_attention_math.py


## Use the concepts when debugging

If generated classification differs between runs, preserve the exact authorized input/prompt/schema/model settings and compare the final typed decisions. Separate parser failures from semantic disagreement. A wrong category with a valid supporting quote passes schema checks but can still fail the labeled task. A decoder adjustment cannot restore evidence that extraction/retrieval/context selection omitted.

Do not show attention weights as an explanation of why an application action was authorized. They are intermediate numeric coefficients, not a permission check, citation validator or trustworthy account of internal reasoning. Keep model-proposed actions behind typed validation and application policy regardless of an apparently high score or an articulate explanation.

The current Responses reference documents temperature/top_p controls, but support and interactions depend on the selected model. The SDK adapter intentionally omits both instead of assuming every model accepts the same settings. When experimenting on a supported model, vary one factor at a time and retain a repeated-run task metric alongside cost/latency. This lesson makes no live sampling calls or current-model benchmark claims.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/attention-and-sampling.md).

References checked2026-10-21: [Vaswani et al., Attention Is All You Need, attention/architecture sections](https://arxiv.org/html/1706.03762v7), [Responses sampling parameters](https://developers.openai.com/api/reference/python/resources/responses/methods/create), [model families and training/inference](./model-foundations.md), [typed output validation](./model-sdk.md). The supplied vectors and tests are original tiny arithmetic fixtures, not values extracted from a pretrained model.
