# study_ai/selection_eval.py
from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True, slots=True)
class EvalCase:
    id: str
    acceptable: frozenset[str]  # Empty means the permitted corpus cannot answer.
    allowed_citations: frozenset[str]


@dataclass(frozen=True, slots=True)
class Prediction:
    status: Literal["answer", "insufficient_evidence"]
    text: str
    citations: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class Metrics:
    total: int
    answered: int
    correct: int
    unsupported: int

    @property
    def coverage(self) -> float:
        return self.answered / self.total

    @property
    def selective_accuracy(self) -> float | None:
        return self.correct / self.answered if self.answered else None


def evaluate(cases: Sequence[EvalCase], predictions: Mapping[str, Prediction]) -> Metrics:
    if not 1 <= len(cases) <= 10000:
        raise ValueError("Invalid evaluation size")
    ids = {case.id for case in cases}
    if len(ids) != len(cases) or set(predictions) != ids:
        raise ValueError("Case/output ID mismatch")
    answered = correct = unsupported = 0
    for case in cases:
        prediction = predictions[case.id]
        if prediction.status == "insufficient_evidence":
            if prediction.text or prediction.citations:
                raise ValueError("Abstention must not carry an answer")
            continue
        if prediction.status != "answer" or not prediction.text or len(prediction.text) > 2000:
            raise ValueError("Invalid prediction")
        answered += 1
        cited = set(prediction.citations)
        valid_citations = bool(cited) and len(cited) == len(prediction.citations) and cited <= case.allowed_citations
        exact_answer = prediction.text in case.acceptable
        if exact_answer and valid_citations:
            correct += 1
        else:
            unsupported += 1  # Conservative classroom failure bucket, not a semantic diagnosis.
    return Metrics(len(cases), answered, correct, unsupported)


@dataclass(frozen=True, slots=True)
class Candidate:
    id: str  # Versioned model+prompt+retriever+settings configuration, not just a brand.
    metrics: Metrics
    p95_ms: float
    cost_units: float  # Same declared unit/workload for all candidates.


def select_candidate(candidates: Sequence[Candidate]) -> str | None:
    if not 1 <= len(candidates) <= 100 or len({item.id for item in candidates}) != len(candidates):
        raise ValueError("Invalid candidates")
    eligible: list[Candidate] = []
    for item in candidates:
        m = item.metrics
        if (any(isinstance(value, bool) or not isinstance(value, int)
                for value in (m.total, m.answered, m.correct, m.unsupported))
            or not 1 <= m.total <= 10000 or not 0 <= m.correct <= m.answered <= m.total
            or m.unsupported != m.answered - m.correct):
            raise ValueError("Invalid metrics")
        if any(isinstance(value, bool) or not math.isfinite(value) or value < 0
               for value in (item.p95_ms, item.cost_units)):
            raise ValueError("Invalid measurement")
        if (m.coverage >= 0.5 and m.selective_accuracy is not None
            and m.selective_accuracy >= 0.95 and m.unsupported == 0
            and item.p95_ms <= 1500 and item.cost_units <= 10):
            eligible.append(item)
    return min(eligible, key=lambda item: (item.cost_units, item.p95_ms, item.id)).id if eligible else None
