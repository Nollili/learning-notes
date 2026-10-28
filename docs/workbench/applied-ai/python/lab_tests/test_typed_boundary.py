# lab_tests/test_typed_boundary.py
from dataclasses import FrozenInstanceError

import pytest

from study_ai.domain import Document, DuplicateDocument, InvalidDocument, StoreUnavailable, parse_document
from study_ai.service import InMemoryDocuments, prepare_and_save


def test_domain_construction_and_duplicate():
    repository = InMemoryDocuments()
    document = prepare_and_save({"id": "d1", "body": " body ", "tags": ["AI"]}, repository)
    assert document.body == "body"
    assert document.tags == ("ai",)
    assert repository.get(document.id) is document
    with pytest.raises(DuplicateDocument):
        repository.save(document)
    with pytest.raises(FrozenInstanceError):
        setattr(document, "body", "changed")


def test_input_and_operational_failures_stay_distinct():
    with pytest.raises(InvalidDocument, match="Invalid document"):
        parse_document({"id": "bad/path", "body": "private payload"})

    class Unavailable:
        def save(self, document: Document) -> None:
            raise StoreUnavailable("Storage unavailable")

    with pytest.raises(StoreUnavailable):
        prepare_and_save({"id": "d1", "body": "text"}, Unavailable())
