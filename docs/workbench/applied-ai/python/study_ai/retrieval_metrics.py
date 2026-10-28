# study_ai/retrieval_metrics.py
from __future__ import annotations

import math
import re
from collections.abc import Mapping, Sequence
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class RetrievalMetrics:
    recall_at_k: float | None
    reciprocal_rank_at_k: float | None
    ndcg_at_k: float | None


def score_retrieval(ranked: Sequence[str], grades: Mapping[str, int], *, k: int) -> RetrievalMetrics:
    if (type(k) is not int or not 1 <= k <= 20 or len(ranked) > 20 or len(grades) > 1000
            or len(set(ranked)) != len(ranked)):
        raise ValueError("Invalid ranking contract")
    for identity in set(ranked) | set(grades):
        if re.fullmatch(r"[A-Za-z0-9_-]{1,64}", identity) is None:
            raise ValueError("Invalid ranking ID")
    if any(type(value) is not int or not 0 <= value <= 3 for value in grades.values()):
        raise ValueError("Invalid relevance grade")
    relevant = {identity for identity, grade in grades.items() if grade > 0}
    if not relevant:
        return RetrievalMetrics(None, None, None)
    top = ranked[:k]
    hits = [rank for rank, identity in enumerate(top, start=1) if identity in relevant]
    recall = len(hits) / len(relevant)
    reciprocal = 1 / hits[0] if hits else 0.0
    dcg = sum((2 ** grades.get(identity, 0) - 1) / math.log2(rank + 1)
              for rank, identity in enumerate(top, start=1))
    ideal = sorted(grades.values(), reverse=True)[:k]
    idcg = sum((2 ** grade - 1) / math.log2(rank + 1)
               for rank, grade in enumerate(ideal, start=1))
    return RetrievalMetrics(recall, reciprocal, dcg / idcg)
