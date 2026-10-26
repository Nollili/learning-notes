# Regression Baselines, Latency, Usage and Cost

Keep the [versioned task/case/rubric lab](./evaluation-lab.md) and measure the complete policy under the same task. A faster/cheaper configuration is not eligible if it breaks permissions, correctness, support or required capabilities. A baseline is a frozen reference configuration with retained outcomes, not a brand name or the best result from yesterday's chat.

## Baseline and regression protocol

Version dataset/corpus/label policy, source permissions, prompt/schema/validator, model/settings, retriever/index and retry/tool policy. Keep a simple deterministic/lexical baseline where relevant and the existing capable configuration as quality reference. Compare candidates on identical cases and conditions, with repeated runs and a declared workload. Use a held-out confirmation set after selection; repeatedly tuning on it turns it into development data.

A regression is a meaningful worsening under the agreed task/policy, not every random output difference. Define hard invariants (no unauthorized action/disclosure, valid accepted output/receipt) and task/slice utility/error thresholds before a candidate run. Inspect paired case differences: fixing one slice can damage another. Preserve the prior configuration and rollback path. A changed model alias, corpus, parser or permission policy needs requalification; do not label a new system the old baseline merely because its UI is unchanged.

For the synthetic guesser/careful/silent examples, careful improves unsupported outputs while reducing coverage. That trade-off must be judged against answerable cases, not celebrated from one metric. A new prompt that emits a valid quote but loses “not” is a semantic regression even if schema pass rate and average length improve. Retain the counterexample and the specific expected support rule in the regression set without leaking a real private incident.

## Measure time and usage at the actual boundary

End-to-end latency includes admission/queue time, retrieval, source/permission resolution, counting, generation, tools, validation and UI delivery. A provider request duration alone is not task completion time. Streaming time-to-first-visible-draft and time-to-validated-final-answer are different; a quick unsafe draft is not successful task latency. Record p50/p95 and failure/timeouts under representative warm/cold/concurrency conditions. The client/load generator must keep the intended arrival policy; comparing idle sequential runs with saturated parallel runs is misleading.

Token usage is model/API-specific. Input tokens can include instructions, schemas/tools, history and multimodal representations; output accounting can include non-visible reasoning. Cached input tokens are a subset of input, not extra input to add twice. Reasoning tokens can be a subset of output, not another output charge to add blindly. Check the selected endpoint's actual usage/pricing semantics. A failed/incomplete stream may lack final usage and still incur provider work; do not record missing usage as zero.

The local fixture below uses **hypothetical USD micro-unit rates per million tokens**, not current provider prices. It supports one declared rate version and excludes tool/image/audio/storage/network/other fees. Use verified current pricing for a real reviewed workload and retain the applicable date/model/region/tier/currency assumptions separately. Estimated task cost and a provider invoice can differ; reconcile actual billing rather than claim this function is a financial reservation.

```python
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
```

Example:1000 input tokens with200 cached,100 output with20 reasoning and hypothetical rates2,000,000/500,000/8,000,000 micro-USD per million gives2,500micro-USD (USD0.0025). Reasoning is already inside the100 output; cached200 is already inside the1000 input. Three such attempts cost7,500micro-USD under this **synthetic** schedule. Two known attempts plus one missing usage yield5,000known micro-USD and1unknown attempt, not a complete5,000total. Monetary precision and additional fee dimensions need the real contract; this arithmetic intentionally uses exact Decimal rather than binary floating money.

nearest_rank_ms defines one explicit percentile convention. With four samples, p95 is the maximum, not a robust estimate of the service tail. Other histogram/interpolation conventions are valid if declared and comparable; do not average per-instance p95 values to reconstruct a global p95. Keep timeout durations/failures visible rather than deleting their rows. These functions accept application-owned validated fixture data; parse external records with bounds/types/version/currency checks before scoring. Missing total time/usage is an explicit unknown outcome.

## Total cost and promotion evidence

Aggregate every attempted provider/tool/retrieval call under the task/job identity, including failed/retried/cancelled work and judge/grader calls. Track caching, batching and routing as policy versions; a low token unit price can still lose if quality requires many retries. Report task success cost under a declared denominator and total resource use separately. Never hide failure cost by dividing only successful calls or assume closing a stream guarantees zero remote charge.

A real admission policy needs an atomic shared reservation across concurrent jobs, maximum possible per-call/workflow cost and reconciliation after actual usage. The local sum is post-hoc accounting, not a budget lock, account quota or exact invoice. Stop/defer on missing resource reservation according to product policy; do not replenish a ledger from model text or a resumed checkpoint. For bounded runner design use [workflow budgets](./tool-workflow-state.md#whole-run-limits-and-a-serializable-checkpoint).

**Acceptance for25.16–25.19/25.22:** strict-typecheck/test exact cached/reasoning subset arithmetic, zero/fractional micro-unit totals, missing usage, multiple attempts, invalid/bool/subset/rate bounds and named percentile conventions. Compare one frozen baseline/candidate result ledger with paired case/slice outcomes, p50/p95, scheduled/completed/failed counts, total/unknown usage and declared synthetic costs. Show a candidate that fails the quality gate despite lower cost. Retain the baseline artifact and a rollback decision. Live provider prices/billing, real latency/load, shared reservations and learner regression measurement remain required; synthetic amounts above are not observed costs or purchasing advice.

References checked2026-10-25: [official task-specific evaluation](https://developers.openai.com/api/docs/guides/evaluation-best-practices), [token/context accounting](./token-budgets.md), [latency distributions and workload diagnosis](../node-js/module-11-performance-diagnostics.md), [Python Decimal arithmetic](https://docs.python.org/3/library/decimal.html). Verify the actual model/endpoint usage and pricing documentation before live budgeting; this lesson makes no current price claim.
