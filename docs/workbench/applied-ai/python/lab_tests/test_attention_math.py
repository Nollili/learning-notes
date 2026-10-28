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
