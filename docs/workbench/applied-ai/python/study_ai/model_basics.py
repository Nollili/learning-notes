# study_ai/model_basics.py
from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass


def _number(value: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError("Invalid numeric value")
    result = float(value)
    if not math.isfinite(result) or abs(result) > 10000:
        raise ValueError("Invalid numeric value")
    return result


@dataclass(frozen=True, slots=True)
class LinearModel:
    slope: float
    intercept: float

    def predict(self, value: float) -> float:
        return self.slope * _number(value) + self.intercept


def fit_linear(examples: Sequence[tuple[float, float]]) -> LinearModel:
    if not 2 <= len(examples) <= 10000:
        raise ValueError("Invalid training set size")
    pairs = [(_number(x), _number(y)) for x, y in examples]
    mean_x = math.fsum(x for x, y in pairs) / len(pairs)
    mean_y = math.fsum(y for x, y in pairs) / len(pairs)
    variance = math.fsum((x - mean_x) ** 2 for x, y in pairs)
    if variance == 0:
        raise ValueError("Training inputs must vary")
    covariance = math.fsum((x - mean_x) * (y - mean_y) for x, y in pairs)
    slope = covariance / variance
    return LinearModel(slope, mean_y - slope * mean_x)
