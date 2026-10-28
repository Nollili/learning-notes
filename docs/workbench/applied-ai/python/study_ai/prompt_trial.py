# study_ai/prompt_trial.py
from __future__ import annotations

from .selection_eval import EvalCase, Metrics, Prediction, evaluate


def synthetic_prompt_trial() -> dict[str, Metrics]:
    cases = [
        EvalCase("delay", frozenset({"300 ms"}), frozenset({"notes-v1"})),
        EvalCase("dispose", frozenset({"cancel"}), frozenset({"notes-v1"})),
        EvalCase("unknown-date", frozenset(), frozenset()),
        EvalCase("foreign-document", frozenset(), frozenset()),
    ]
    supported = {
        "delay": Prediction("answer", "300 ms", ("notes-v1",)),
        "dispose": Prediction("answer", "cancel", ("notes-v1",)),
    }
    abstain = Prediction("insufficient_evidence", "", ())
    guesser = {**supported,
        "unknown-date": Prediction("answer", "Friday", ("notes-v1",)),
        "foreign-document": Prediction("answer", "Private answer", ("foreign",)),
    }
    careful = {**supported, "unknown-date": abstain, "foreign-document": abstain}
    silent = {case.id: abstain for case in cases}
    return {name: evaluate(cases, outputs) for name, outputs in [
        ("synthetic-guesser", guesser), ("synthetic-careful", careful),
        ("synthetic-silent", silent),
    ]}
