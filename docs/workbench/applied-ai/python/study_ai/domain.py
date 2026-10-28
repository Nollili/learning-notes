# study_ai/domain.py
from __future__ import annotations

from dataclasses import dataclass
from typing import NewType, Protocol, TypedDict

from basics import normalize_document

DocumentId = NewType("DocumentId", str)


class InvalidDocument(ValueError):
    """Known input failure; public transport may map this to a safe400."""


class DuplicateDocument(Exception):
    """Known domain conflict; transport may map this to409."""


class StoreUnavailable(Exception):
    """Operational storage failure; transport must not call this invalid input."""


class DocumentPayload(TypedDict):
    id: str
    body: str
    tags: list[str]


@dataclass(frozen=True, slots=True)
class Document:
    id: DocumentId
    body: str
    tags: tuple[str, ...]


class DocumentRepository(Protocol):
    def save(self, document: Document) -> None: ...


def parse_document(raw: object) -> Document:
    try:
        normalized = normalize_document(raw)
    except ValueError:
        # Known normalizer validation boundary; do not expose raw content in the error.
        raise InvalidDocument("Invalid document") from None
    identity, body, tags = normalized["id"], normalized["body"], normalized["tags"]
    if not isinstance(identity, str) or not isinstance(body, str) or not isinstance(tags, tuple):
        raise RuntimeError("Normalizer contract changed")
    if not all(isinstance(tag, str) for tag in tags):
        raise RuntimeError("Normalizer tag contract changed")
    narrowed_tags = tuple(tag for tag in tags if isinstance(tag, str))
    return Document(DocumentId(identity), body, narrowed_tags)
