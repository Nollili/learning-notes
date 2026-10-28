# lab_tests/test_basics.py — learner-project tests; never Autocode src/tests
from copy import deepcopy

import pytest

from basics import add_tag, clean_tags, normalize_documents


def test_normalization_preserves_source_and_order():
    raw = [{"id": "doc-1", "body": "  First\n\nSecond  ", "tags": [" AI ", "ai", "Python"]}]
    before = deepcopy(raw)
    result = normalize_documents(raw, max_records=2)
    assert result == [{"id": "doc-1", "body": "First\n\nSecond", "tags": ("ai", "python")}]
    assert raw == before
    assert normalize_documents([]) == []


@pytest.mark.parametrize("record", [
    None,
    {"id": "../file", "body": "text"},
    {"id": "doc", "body": "  "},
    {"id": "doc", "body": "text", "role": "admin"},
    {"id": "doc", "body": "text", "tags": [1]},
    {"id": "doc", "body": "text", "tags": [""]},
])
def test_untrusted_record_rejected(record):
    with pytest.raises(ValueError):
        normalize_documents([record])


def test_duplicate_and_budget_are_explicit():
    record = {"id": "same", "body": "text"}
    with pytest.raises(ValueError, match="duplicate"):
        normalize_documents([record, record])
    with pytest.raises(ValueError, match="budget"):
        normalize_documents([record, {"id": "other", "body": "text"}], max_records=1)
    with pytest.raises(ValueError):
        normalize_documents([], max_records=True)


def test_defaults_and_identity():
    assert add_tag("first") == ["first"]
    assert add_tag("second") == ["second"]
    source = ["existing"]
    assert add_tag("new", source) == ["existing", "new"]
    assert source == ["existing"]
    assert clean_tags(["Straße", "STRASSE"]) == ("strasse",)
    with pytest.raises(TypeError):
        clean_tags(raw=["ai"])
