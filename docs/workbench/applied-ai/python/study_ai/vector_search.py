# study_ai/vector_search.py
from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass


def unit_vector(values: Sequence[float]) -> tuple[float, ...]:
    if not 1 <= len(values) <= 4096:
        raise ValueError("Invalid embedding dimension")
    numbers: list[float] = []
    for value in values:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("Invalid embedding component")
        number = float(value)
        if not math.isfinite(number) or abs(number) > 10000:
            raise ValueError("Invalid embedding component")
        numbers.append(number)
    norm = math.hypot(*numbers)
    if norm == 0:
        raise ValueError("Zero embedding has no direction")
    return tuple(value / norm for value in numbers)


def cosine(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) != len(right):
        raise ValueError("Embedding dimension mismatch")
    a, b = unit_vector(left), unit_vector(right)
    # Normalize separately: multiplying tiny norms first can underflow to zero.
    score = math.fsum(x * y for x, y in zip(a, b, strict=True))
    return max(-1.0, min(1.0, score))  # Only contain floating-point roundoff.


@dataclass(frozen=True, slots=True)
class VectorSpace:
    model_revision: str
    dimensions: int
    preprocessing_version: str


@dataclass(frozen=True, slots=True)
class Principal:
    tenant: str
    subject: str


@dataclass(frozen=True, slots=True)
class IndexedChunk:
    chunk_id: str
    tenant: str
    allowed_subjects: frozenset[str]
    source_version: str
    space: VectorSpace
    vector: tuple[float, ...]


def search(query: Sequence[float], *, space: VectorSpace, principal: Principal,
           records: Sequence[IndexedChunk], top_k: int = 3, threshold: float = 0.0
           ) -> tuple[tuple[str, float], ...]:
    if type(top_k) is not int or not 1 <= top_k <= 20 or len(records) > 500:
        raise ValueError("Invalid search budget")
    if isinstance(threshold, bool) or not isinstance(threshold, (int, float)) or not -1 <= threshold <= 1:
        raise ValueError("Invalid similarity threshold")
    if type(space.dimensions) is not int or len(query) != space.dimensions:
        raise ValueError("Query space mismatch")
    unit_vector(query)
    seen: set[str] = set()
    ranked: list[tuple[str, float]] = []
    for record in records:
        # principal and stored ACLs come from trusted authentication/storage adapters.
        # Filter before ranking/top-k; never let an inaccessible best match consume k.
        if (record.tenant != principal.tenant or principal.subject not in record.allowed_subjects
                or record.space != space):
            continue
        if record.chunk_id in seen or len(record.vector) != space.dimensions:
            raise ValueError("Invalid indexed record")
        seen.add(record.chunk_id)
        score = cosine(query, record.vector)
        if score >= threshold:
            ranked.append((record.chunk_id, score))
    ranked.sort(key=lambda item: (-item[1], item[0]))
    return tuple(ranked[:top_k])
