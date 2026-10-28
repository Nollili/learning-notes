# study_ai/provider_export.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Literal
from pydantic import BaseModel,ConfigDict,Field
from .note_tool import StoredNote
from .vector_search import Principal

@dataclass(frozen=True,slots=True)
class ExportPolicy:
    tenant: str
    provider: Literal['openai-api']
    purpose: Literal['study-classification']
    expires_at: int
    allowed_classes: frozenset[str]

class OutboundExcerpt(BaseModel):
    model_config=ConfigDict(strict=True,frozen=True,extra='forbid')
    ref: str=Field(pattern=r'^e[1-8]$',max_length=2)
    text: str=Field(min_length=1,max_length=500)


def prepare_export(note: StoredNote, *, principal: Principal, policy: ExportPolicy,
                   classification: str, now: int, ref: str) -> OutboundExcerpt:
    # Classification/policy/current note and clock are trusted service inputs, never model fields.
    if (type(now) is not int or now<0 or type(policy.expires_at) is not int or policy.expires_at<=now
            or policy.provider!='openai-api' or policy.purpose!='study-classification'
            or policy.tenant!=principal.tenant or note.tenant!=principal.tenant
            or principal.subject not in note.subjects or classification not in policy.allowed_classes):
        raise ValueError('Export unavailable')
    if len(note.text)>500 or len(note.text.encode('utf-8',errors='strict'))>2000:
        raise ValueError('Export unavailable')
    return OutboundExcerpt(ref=ref,text=note.text)
