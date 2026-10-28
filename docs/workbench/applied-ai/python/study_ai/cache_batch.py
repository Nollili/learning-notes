# study_ai/cache_batch.py
from __future__ import annotations
import hashlib
import json
import re
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Literal


def cache_identity(*, tenant: str, subject: str, permission_revision: str, model_revision: str,
                   prompt_revision: str, schema_revision: str, settings_revision: str,
                   sources: Sequence[tuple[str,str]], question: str) -> str:
    fields=[tenant,subject,permission_revision,model_revision,prompt_revision,schema_revision,settings_revision]
    if any(not value or len(value)>128 for value in fields) or not question.strip() or len(question)>512:
        raise ValueError('Invalid cache identity')
    if len(sources)>8 or len({name for name,_version in sources})!=len(sources):
        raise ValueError('Invalid source snapshot')
    for name,version in sources:
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,64}',name) or not re.fullmatch(r'[a-f0-9]{64}',version):
            raise ValueError('Invalid source snapshot')
    payload=json.dumps(['answer-cache:v1',fields,list(sources),question],ensure_ascii=False,
                       separators=(',',':')).encode('utf-8',errors='strict')
    return hashlib.sha256(payload).hexdigest()


@dataclass(frozen=True, slots=True)
class BatchOutcome:
    custom_id: str
    status: Literal['accepted','failed']
    text: str


def correlate(expected: Sequence[str], outcomes: Sequence[BatchOutcome]) -> tuple[BatchOutcome | None,...]:
    if not 1<=len(expected)<=100 or len(set(expected))!=len(expected) or len(outcomes)>100:
        raise ValueError('Invalid batch budget')
    if any(not re.fullmatch(r'[A-Za-z0-9_-]{1,64}',identity) for identity in expected):
        raise ValueError('Invalid manifest')
    by_id: dict[str,BatchOutcome]={}
    for outcome in outcomes:
        if (outcome.custom_id not in expected or outcome.custom_id in by_id
                or outcome.status not in ('accepted','failed') or len(outcome.text)>1200
                or (outcome.status=='failed' and outcome.text)):
            raise ValueError('Invalid batch outcome')
        outcome.text.encode('utf-8',errors='strict')
        by_id[outcome.custom_id]=outcome
    return tuple(by_id.get(identity) for identity in expected)
