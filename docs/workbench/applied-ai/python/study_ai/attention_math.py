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
