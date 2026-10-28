# lab_tests/test_chunk_identity.py
from dataclasses import replace
import unicodedata

import pytest

from study_ai.extraction import ExtractionError, chunk, chunk_identity, extract


def test_identity_is_stable_scoped_and_versioned():
    item = chunk(extract(b"First\r\nSecond", source_id="source1", kind="text"))[0]
    identity = chunk_identity(item, tenant_id="tenant1")
    assert len(identity) == 64 and identity == chunk_identity(item, tenant_id="tenant1")
    assert identity != chunk_identity(item, tenant_id="tenant2")
    for changed in [replace(item, source_id="source2"), replace(item, source_sha256="0" * 64),
                    replace(item, extractor_version="text-csv-v2"), replace(item, locator="line:2"),
                    replace(item, start=1), replace(item, end=2), replace(item, text="Changed")]:
        assert chunk_identity(changed, tenant_id="tenant1") != identity
    lf = chunk(extract(b"First\nSecond", source_id="source1", kind="text"))[0]
    assert lf.text == item.text
    assert chunk_identity(lf, tenant_id="tenant1") != identity  # Raw source version differs.
    with pytest.raises(ExtractionError, match="tenant namespace"):
        chunk_identity(item, tenant_id="../PRIVATE_NAMESPACE")


def test_normalization_preserves_meaning_and_records_composition():
    raw = "  Name = 'e\u0301'\r\n    return Name\r\n".encode("utf-8")
    source = extract(raw, source_id="code", kind="text")
    assert source.segments[0].text == "  Name = 'e\u0301'"
    assert source.segments[1].text == "    return Name"
    nfc = unicodedata.normalize("NFC", source.segments[0].text)
    assert nfc != source.segments[0].text
    assert len(nfc) + 1 == len(source.segments[0].text)
