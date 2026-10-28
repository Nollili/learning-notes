# study_ai/hybrid_search.py
from __future__ import annotations

import math
import re
import unicodedata
from collections.abc import Mapping, Sequence


def _top_k(value: int) -> None:
    if type(value) is not int or not 1 <= value <= 20:
        raise ValueError("Invalid top-k")


def _terms(text: str, *, maximum: int) -> frozenset[str]:
    if len(text) > maximum:
        raise ValueError("Search text budget exceeded")
    return frozenset(re.findall(r"\w+", unicodedata.normalize("NFC", text).casefold()))


def lexical_search(query: str, *, texts: Mapping[str, str], authorized_ids: frozenset[str],
                   top_k: int = 3, threshold: float = 0.0) -> tuple[tuple[str, float], ...]:
    _top_k(top_k)
    if (len(texts) > 500 or isinstance(threshold, bool) or not isinstance(threshold, (int, float))
            or not math.isfinite(threshold) or not 0 <= threshold <= 1):
        raise ValueError("Invalid lexical search policy")
    wanted = _terms(query, maximum=512)
    if not wanted:
        return ()
    ranked: list[tuple[str, float]] = []
    for identity, text in texts.items():
        if identity not in authorized_ids:
            continue
        terms = _terms(text, maximum=2000)
        overlap = len(wanted & terms)
        if overlap:
            score = overlap / len(wanted | terms)
            if score >= threshold:
                ranked.append((identity, score))
    ranked.sort(key=lambda item: (-item[1], item[0]))
    return tuple(ranked[:top_k])


def fuse_ranks(lexical: Sequence[str], semantic: Sequence[str], *, authorized_ids: frozenset[str],
               lexical_weight: float = 1.0, semantic_weight: float = 1.0,
               rank_constant: int = 60, top_k: int = 3) -> tuple[tuple[str, float], ...]:
    _top_k(top_k)
    weights = (lexical_weight, semantic_weight)
    if any(isinstance(w, bool) or not isinstance(w, (int, float)) or not math.isfinite(w)
           or not 0 <= w <= 10 for w in weights) or sum(weights) == 0:
        raise ValueError("Invalid fusion weights")
    if type(rank_constant) is not int or not 1 <= rank_constant <= 1000:
        raise ValueError("Invalid rank constant")
    scores: dict[str, float] = {}
    for ranking, weight in zip((lexical, semantic), weights, strict=True):
        if len(ranking) > 100 or len(set(ranking)) != len(ranking):
            raise ValueError("Invalid branch ranking")
        # Branches must already retrieve under this scope; this is a second check.
        visible = [identity for identity in ranking if identity in authorized_ids]
        if weight == 0:
            continue
        for rank, identity in enumerate(visible, start=1):
            scores[identity] = scores.get(identity, 0.0) + weight / (rank_constant + rank)
    return tuple(sorted(scores.items(), key=lambda item: (-item[1], item[0]))[:top_k])
