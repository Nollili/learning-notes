# study_ai/eval_measurements.py
from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass
from decimal import Decimal
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator


class Usage(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    input_tokens: int = Field(ge=0, le=10000000)
    cached_input_tokens: int = Field(ge=0, le=10000000)
    output_tokens: int = Field(ge=0, le=10000000)
    reasoning_tokens: int = Field(ge=0, le=10000000)

    @model_validator(mode="after")
    def subsets(self) -> Self:
        if self.cached_input_tokens > self.input_tokens or self.reasoning_tokens > self.output_tokens:
            raise ValueError("Invalid usage subsets")
        return self


@dataclass(frozen=True, slots=True)
class Rates:
    input_micro_usd_per_million: int
    cached_micro_usd_per_million: int
    output_micro_usd_per_million: int

    def __post_init__(self) -> None:
        if any(type(v) is not int or not 0 <= v <= 1000000000 for v in (
            self.input_micro_usd_per_million, self.cached_micro_usd_per_million,
            self.output_micro_usd_per_million)):
            raise ValueError("Invalid fixture rate")


def token_micro_usd(usage: Usage, rates: Rates) -> Decimal:
    units = ((usage.input_tokens - usage.cached_input_tokens) * rates.input_micro_usd_per_million
             + usage.cached_input_tokens * rates.cached_micro_usd_per_million
             + usage.output_tokens * rates.output_micro_usd_per_million)
    return Decimal(units) / Decimal(1000000)


def nearest_rank_ms(samples: Sequence[float], percentile: float) -> float:
    if (not 1 <= len(samples) <= 10000 or isinstance(percentile, bool)
            or not math.isfinite(percentile) or not 0 < percentile <= 1
            or any(isinstance(v, bool) or not math.isfinite(v) or not 0 <= v <= 86400000
                   for v in samples)):
        raise ValueError("Invalid latency sample")
    return sorted(samples)[math.ceil(percentile * len(samples)) - 1]


def known_token_cost(usages: Sequence[Usage | None], rates: Rates) -> tuple[Decimal, int]:
    if not 1 <= len(usages) <= 1000:
        raise ValueError("Invalid attempt count")
    known = sum((token_micro_usd(u, rates) for u in usages if u is not None), Decimal(0))
    return known, sum(u is None for u in usages)
