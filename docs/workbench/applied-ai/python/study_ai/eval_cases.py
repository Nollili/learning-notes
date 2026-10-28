# study_ai/eval_cases.py
from __future__ import annotations

import hashlib
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationError

Slice = Literal["ordinary", "missing", "foreign", "injection", "unicode", "outage"]


class Case(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    id: str = Field(pattern=r"^[a-z0-9-]{1,64}$")
    slice: Slice
    question: str = Field(min_length=1, max_length=500)
    expected: Literal["answer", "abstain", "denied", "operational_failure"]
    source_fixture: str = Field(pattern=r"^[a-z0-9-]{1,64}$")
    expected_text: str = Field(max_length=500)


class Dataset(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    version: int = Field(ge=1, le=1)
    corpus_version: str = Field(pattern=r"^[a-z0-9-]{1,64}$")
    label_policy: str = Field(pattern=r"^[a-z0-9-]{1,64}$")
    cases: tuple[Case, ...] = Field(min_length=1, max_length=1000)


def load_dataset(raw: bytes) -> Dataset:
    if len(raw) > 65536:
        raise ValueError("Dataset byte limit")
    try:
        dataset = Dataset.model_validate_json(raw)
    except ValidationError:
        raise ValueError("Invalid evaluation dataset") from None
    if len({case.id for case in dataset.cases}) != len(dataset.cases):
        raise ValueError("Duplicate evaluation ID")
    if {case.slice for case in dataset.cases} != {
            "ordinary", "missing", "foreign", "injection", "unicode", "outage"}:
        raise ValueError("Required evaluation slice missing")
    for case in dataset.cases:
        if (not case.question.strip()
                or (case.expected == "answer") != bool(case.expected_text.strip())):
            raise ValueError("Invalid case expectation")
        try:
            case.question.encode("utf-8", errors="strict")
            case.expected_text.encode("utf-8", errors="strict")
        except UnicodeEncodeError:
            raise ValueError("Invalid case encoding") from None
    return dataset


def dataset_digest(raw: bytes) -> str:
    # Identifies the exact manifest bytes, not authenticity or label quality.
    return hashlib.sha256(raw).hexdigest()
