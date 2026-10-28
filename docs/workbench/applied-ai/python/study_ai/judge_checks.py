# study_ai/judge_checks.py
from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class JudgeComparison:
    total: int
    true_accepts: int
    true_rejects: int
    false_accepts: int
    false_rejects: int

    @property
    def agreement(self) -> float:
        return (self.true_accepts + self.true_rejects) / self.total


def compare_judge(human: Mapping[str, bool], judge: Mapping[str, bool]) -> JudgeComparison:
    if (not 1 <= len(human) <= 1000 or set(human) != set(judge)
            or any(type(value) is not bool for value in [*human.values(), *judge.values()])):
        raise ValueError("Invalid judge comparison")
    ta = tr = fa = fr = 0
    for identity, reviewed in human.items():
        proposed = judge[identity]
        if reviewed and proposed: ta += 1
        elif not reviewed and not proposed: tr += 1
        elif proposed: fa += 1
        else: fr += 1
    return JudgeComparison(len(human), ta, tr, fa, fr)


def repeated_success(outcomes: Sequence[bool]) -> tuple[float, bool]:
    if not 1 <= len(outcomes) <= 100 or any(type(value) is not bool for value in outcomes):
        raise ValueError("Invalid repeated outcomes")
    return sum(outcomes) / len(outcomes), all(outcomes)
