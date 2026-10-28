# study_ai/service.py
from __future__ import annotations

from .domain import Document, DocumentId, DocumentRepository, DuplicateDocument, parse_document


class InMemoryDocuments:
    """Bounded teaching adapter; not durable or shared across processes."""

    def __init__(self, *, capacity: int = 100) -> None:
        if type(capacity) is not int or not 1 <= capacity <= 1000:
            raise ValueError("Invalid repository capacity")
        self._capacity = capacity
        self._documents: dict[DocumentId, Document] = {}

    def save(self, document: Document) -> None:
        if document.id in self._documents:
            raise DuplicateDocument("Document already exists")
        if len(self._documents) >= self._capacity:
            raise RuntimeError("Teaching repository capacity exhausted")
        self._documents[document.id] = document

    def get(self, identity: DocumentId) -> Document | None:
        return self._documents.get(identity)


def prepare_and_save(raw: object, repository: DocumentRepository) -> Document:
    document = parse_document(raw)
    repository.save(document)
    return document
