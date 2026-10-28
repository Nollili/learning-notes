# lab_tests/test_vector_search.py
from __future__ import annotations

import asyncio
import json

import httpx2
import pytest

from study_ai.model_sdk import open_model_client
from study_ai.vector_search import IndexedChunk, Principal, VectorSpace, cosine, search, unit_vector


def test_geometry_and_invalid_vectors():
    assert cosine([3.0, 4.0], [6.0, 8.0]) == pytest.approx(1.0)
    assert cosine([1.0, 0.0], [0.0, 1.0]) == 0
    assert cosine([1.0, 0.0], [-1.0, 0.0]) == -1
    assert cosine([1e-300, 0.0], [1e-300, 0.0]) == 1
    for left, right in [([], []), ([0.0], [1.0]), ([1.0], [1.0, 2.0]),
                        ([float("nan")], [1.0]), ([True], [1.0])]:
        with pytest.raises(ValueError):
            cosine(left, right)


def test_permission_namespace_and_top_k_before_projection():
    space = VectorSpace("synthetic-v1", 2, "prep-v1")
    other = VectorSpace("synthetic-v2", 2, "prep-v1")
    records = [
        IndexedChunk("private", "tenant-a", frozenset({"other-user"}), "v1", space, (1.0, 0.0)),
        IndexedChunk("other-tenant", "tenant-b", frozenset({"user"}), "v1", space, (1.0, 0.0)),
        IndexedChunk("wrong-space", "tenant-a", frozenset({"user"}), "v1", other, (1.0, 0.0)),
        IndexedChunk("b", "tenant-a", frozenset({"user"}), "v1", space, (0.8, 0.6)),
        IndexedChunk("a", "tenant-a", frozenset({"user"}), "v1", space, (0.8, 0.6)),
    ]
    principal = Principal("tenant-a", "user")
    assert search([1.0, 0.0], space=space, principal=principal, records=records, top_k=1) == (("a", 0.8),)
    assert search([1.0, 0.0], space=space, principal=principal, records=records, threshold=0.9) == ()
    assert [identity for identity, score in search([1.0, 0.0], space=space, principal=principal,
                                                 records=list(reversed(records)))] == ["a", "b"]
    with pytest.raises(ValueError, match="indexed record"):
        search([1.0, 0.0], space=space, principal=principal, records=[records[-1], records[-1]])


def test_embedding_sdk_request_and_numeric_validation():
    def handler(request):
        assert str(request.url) == "https://api.openai.com/v1/embeddings"
        body = json.loads(request.content)
        assert body == {"model": "text-embedding-3-small", "input": ["fixture text"],
                        "dimensions": 3, "encoding_format": "float"}
        return httpx2.Response(200, json={"object": "list", "model": "text-embedding-3-small",
                                         "data": [{"object": "embedding", "index": 0,
                                                   "embedding": [1.0, 2.0, 2.0]}],
                                         "usage": {"prompt_tokens": 2, "total_tokens": 2}})
    async def run():
        async with open_model_client("fake_offline_key", transport=httpx2.MockTransport(handler)) as client:
            response = await client.embeddings.create(model="text-embedding-3-small", input=["fixture text"],
                                                      dimensions=3, encoding_format="float")
            assert len(response.data) == 1 and response.data[0].index == 0
            vector = response.data[0].embedding
            assert len(vector) == 3
            assert unit_vector(vector) == pytest.approx([1 / 3, 2 / 3, 2 / 3])
        assert client.is_closed()
    asyncio.run(run())
