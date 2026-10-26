# Attention and Probabilistic Generation

This lesson gives an intermediate conceptual model and a tiny Python3.13 worked calculation. It implements no pretrained model and downloads no weights. Its purpose is to make masking, normalization and generation assumptions testable before using the SDK output as application data.

## Where attention sits

A transformer combines attention with other learned transformations. Tokens become vectors with positional information; repeated blocks mix context and transform representations. Attention alone is not the whole model: feed-forward layers, residual paths and normalization also matter. A final language-model head produces vocabulary scores. Encoder-style, decoder-style and encoder-decoder architectures use different information-flow patterns; do not assume every model is the original translation architecture.

In scaled dot-product attention, a query is compared with keys, scores are normalized and the corresponding values are mixed. Queries/keys/values normally come from learned projections. Multiple heads perform different projections before their outputs are combined. A causal mask prevents a position from using future positions. That mask is a mathematical dependency restriction, not application authorization or a rule saying which document is trustworthy.

For one query, write `score[j] = dot(query, key[j]) / sqrt(key_dimension)`. After masking disallowed positions, softmax converts visible scores into weights summing to1, and the output is their weighted sum of value vectors. The worked implementation uses supplied vectors rather than learned projections, so every number can be inspected independently. It demonstrates one operation, not a trained transformer's quality.

## Worked bounded softmax and masked attention

Subtracting the largest scaled score before exponentiating keeps softmax numerically stable for large finite inputs. It does not change the resulting ratios. Mask before normalization: zeroing an already-normalized future weight without renormalizing visible weights gives the wrong result. Reject an all-masked query rather than divide by zero.

```python
# study_ai/attention_math.py
from __future__ import annotations

import math
from collections.abc import Sequence


def vector(values: Sequence[float]) -> tuple[float, ...]:
    if not 1 <= len(values) <= 8:
        raise ValueError("Invalid vector dimension")
    result: list[float] = []
    for value in values:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("Invalid numeric component")
        number = float(value)
        if not math.isfinite(number) or abs(number) > 10000:
            raise ValueError("Invalid numeric component")
        result.append(number)
    return tuple(result)


def softmax(logits: Sequence[float], *, temperature: float = 1.0) -> tuple[float, ...]:
    values = vector(logits)
    if isinstance(temperature, bool) or not isinstance(temperature, (int, float)):
        raise ValueError("Invalid temperature")
    if not math.isfinite(temperature) or not 0.1 <= temperature <= 10:
        raise ValueError("Invalid temperature")
    shifted = [(value - max(values)) / temperature for value in values]
    exponentials = [math.exp(value) for value in shifted]
    total = math.fsum(exponentials)
    return tuple(value / total for value in exponentials)


def attend(query: Sequence[float], keys: Sequence[Sequence[float]],
           values: Sequence[Sequence[float]], *, visible: int
           ) -> tuple[tuple[float, ...], tuple[float, ...]]:
    q = vector(query)
    if not 1 <= len(keys) == len(values) <= 8:
        raise ValueError("Invalid key/value count")
    if type(visible) is not int or not 1 <= visible <= len(keys):
        raise ValueError("Invalid visible prefix")
    k, v = [vector(row) for row in keys], [vector(row) for row in values]
    if any(len(row) != len(q) for row in k) or any(len(row) != len(v[0]) for row in v):
        raise ValueError("Mismatched vector dimensions")
    # Bounded components still produce scores above the softmax helper's input cap,
    # so shift scores first. All values remain finite under this tiny fixture's bounds.
    scores = [math.fsum(a * b for a, b in zip(q, key, strict=True)) / math.sqrt(len(q))
              for key in k[:visible]]
    maximum = max(scores)
    # Equivalent stable softmax; no arbitrary rejection of a large score difference.
    exponents = [math.exp(score - maximum) for score in scores]
    total = math.fsum(exponents)
    weights = tuple(value / total for value in exponents) + (0.0,) * (len(keys) - visible)
    mixed = tuple(math.fsum(weight * row[column] for weight, row in zip(weights, v, strict=True))
                  for column in range(len(v[0])))
    return weights, mixed
```

For query[1,0], keys[1,0] and[0,1], scores are approximately0.7071 and0. Their weights are approximately0.6698 and0.3302. With values[10,0] and[0,10], the mixed vector is approximately[6.6976,3.3024]. A third future key can have a much larger dot product and still receive weight0 when visible=2. Changing its content must not change the visible output.

The8-dimension/8-position and numeric bounds are teaching limits. This is deliberately eager Python arithmetic rather than a fast tensor kernel. Full dense attention across n positions considers n² pair relationships in the basic formulation; optimized kernels and alternative attention patterns change implementation costs. Do not derive a modern serving system's total memory/latency from this tiny loop. KV caching, batch/context lengths and model/runtime details need measurements.

## Next-token scores are a distribution, not factual confidence

A generative decoder scores possible next token IDs conditional on the current context. Normalization gives a next-token distribution; a decoding rule selects a token and repeats with the updated sequence. High probability means likely under this model/context/decoding setup. It does not mean an answer is factually verified, authorized or well calibrated for your application's label.

Greedy decoding selects a maximum-score token; it does not search all complete sequences or guarantee the best factual answer. Sampling can choose different tokens from the same distribution. Small early differences change subsequent context and can produce large later differences. A model can produce fluent unsupported claims even when every token follows its learned distribution. Source verification/evaluation stays outside the sampler.

Temperature rescales logits before normalization: lower positive values concentrate mass on high-scoring choices; higher values flatten it. This toy accepts0.1–10 and rejects0 because dividing by0 is undefined. A provider's accepted parameter range and its treatment of a zero/omitted value are API/model-specific; this helper is not a substitute for that contract.

Example normalized probabilities[0.60,0.25,0.15] support three possible tokens. A draw in[0,0.60) picks the first; a draw in[0.60,0.85) picks the second. Nucleus/top-p filtering with threshold0.80 keeps the smallest descending prefix reaching that mass: the first two entries total0.85, then renormalize to approximately[0.7059,0.2941]. Top-k instead keeps a fixed number of candidates. Neither sampling control prevents unsupported statements.

A fixed local random seed can reproduce a particular toy sampler/runtime sequence. It is not a guarantee of repeatability across hosted services, hardware kernels, parallel batching, model aliases or future versions. Temperature0 is likewise not a universal reproducibility or correctness guarantee. Record model/prompt/schema/runtime versions and compare repeated task-level results; do not replace evaluation with an assertion that the model "should be deterministic".

## Execute the invariants

```python
# lab_tests/test_attention_math.py
import math

import pytest

from study_ai.attention_math import attend, softmax


def test_softmax_stability_temperature_and_shift():
    base = softmax([0.0, 1.0])
    assert softmax([1000.0, 1001.0]) == pytest.approx(base)
    assert math.fsum(base) == pytest.approx(1.0)
    assert softmax([0.0, 1.0], temperature=0.5)[1] > base[1]
    assert softmax([0.0, 1.0], temperature=2.0)[1] < base[1]
    assert softmax([10000.0, -10000.0]) == (1.0, 0.0)


def test_known_attention_values_and_future_mask():
    keys = [[1.0, 0.0], [0.0, 1.0], [10.0, 0.0]]
    values = [[10.0, 0.0], [0.0, 10.0], [999.0, 999.0]]
    weights, mixed = attend([1.0, 0.0], keys, values, visible=2)
    expected = math.exp(1 / math.sqrt(2)) / (math.exp(1 / math.sqrt(2)) + 1)
    assert weights == pytest.approx([expected, 1 - expected, 0.0])
    assert mixed == pytest.approx([10 * expected, 10 * (1 - expected)])
    changed = attend([1.0, 0.0], [*keys[:2], [-10000.0, 10000.0]],
                     [*values[:2], [-999.0, -999.0]], visible=2)
    assert changed == (weights, mixed)
    assert attend([1.0, 0.0], keys, values, visible=1) == ((1.0, 0.0, 0.0), (10.0, 0.0))


@pytest.mark.parametrize("logits,temperature", [([], 1.0), ([float("nan")], 1.0),
                                              ([True], 1.0), ([1.0], 0.0), ([1.0], float("inf"))])
def test_invalid_distribution_inputs(logits, temperature):
    with pytest.raises(ValueError):
        softmax(logits, temperature=temperature)


def test_invalid_attention_shapes_and_masks():
    for keys, values, visible in [([[1.0]], [[1.0]], 0), ([[1.0]], [[1.0]], True),
                                  ([[1.0]], [], 1), ([[1.0, 2.0]], [[1.0]], 1),
                                  ([[1.0], [1.0]], [[1.0], [1.0, 2.0]], 2)]:
        with pytest.raises(ValueError):
            attend([1.0], keys, values, visible=visible)
```

## Use the concepts when debugging

If generated classification differs between runs, preserve the exact authorized input/prompt/schema/model settings and compare the final typed decisions. Separate parser failures from semantic disagreement. A wrong category with a valid supporting quote passes schema checks but can still fail the labeled task. A decoder adjustment cannot restore evidence that extraction/retrieval/context selection omitted.

Do not show attention weights as an explanation of why an application action was authorized. They are intermediate numeric coefficients, not a permission check, citation validator or trustworthy account of internal reasoning. Keep model-proposed actions behind typed validation and application policy regardless of an apparently high score or an articulate explanation.

The current Responses reference documents temperature/top_p controls, but support and interactions depend on the selected model. The SDK adapter intentionally omits both instead of assuming every model accepts the same settings. When experimenting on a supported model, vary one factor at a time and retain a repeated-run task metric alongside cost/latency. This lesson makes no live sampling calls or current-model benchmark claims.

## Practice and acceptance

Compute the two-key weights/mixed vector by hand and verify the test. Change a future key/value and prove causal output invariance; then deliberately unmask it and observe the difference. Demonstrate why masking after softmax without renormalization is incorrect. Compare low/high positive temperature on fixed logits, and implement a bounded toy categorical sampler/top-p filter with explicit boundary/tie tests.

**Acceptance:** strict checking/tests pass; finite outputs/normalization/dimensions/masks are verified; you can identify which parts of a transformer this code omits and explain next-token probability versus factual validity. Run a separately authorized representative repeated-generation experiment only after selecting a supported model and budget; report disagreement and unsupported-output rates. Full transformer training, tensor/GPU implementation, live quality/reproducibility measurements and learner practice remain unperformed.

References checked2026-10-21: [Vaswani et al., Attention Is All You Need, attention/architecture sections](https://arxiv.org/html/1706.03762v7), [Responses sampling parameters](https://developers.openai.com/api/reference/python/resources/responses/methods/create), [model families and training/inference](./model-foundations.md), [typed output validation](./model-sdk.md). The supplied vectors and tests are original tiny arithmetic fixtures, not values extracted from a pretrained model.
