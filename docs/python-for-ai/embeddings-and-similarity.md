# Embeddings, Similarity and Compatible Search Spaces

An embedding maps input into a numeric vector using a learned model. Nearby vectors can represent related content under that model's training objective. Coordinates are not a list of human-readable facts, and a cosine score is not the probability that a passage answers a question. Negation, exact identifiers, rare terminology, language shifts and domain mismatch can defeat a plausible-looking similarity match.

## Keep the representation contract

Use the same reviewed model/revision, dimension configuration and preprocessing contract for queries and indexed documents. Equal vector length alone does not establish compatibility. A different model can rotate/rearrange the space; comparing its coordinates with an old index is meaningless even when both have1536 numbers. Store model/requested revision, actual provider model metadata, dimensions, preprocessing/chunk version and source version. A migration needs a new namespace/index plus re-embedding/relevance checks before cutover, not a silent overwrite of one metadata field.

A vector store accelerates matching and stores metadata; it does not establish access rights or freshness. Keep source/chunk IDs and provenance from the [extraction lesson](./document-processing.md). Embeddings are derived potentially sensitive data, not encrypted copies of text. Apply the same tenant/retention/deletion policy to vectors, caches, logs and source content. Do not expose a similarity score or source title from an unauthorized candidate.

## Cosine geometry

For nonzero vectors, cosine similarity is the dot product of their unit-normalized directions. Identical directions score1, orthogonal directions0 and opposite directions-1. Cosine distance is commonly1 minus similarity, so lower distance corresponds to higher similarity. A database operator may negate an inner product for ordering; check its actual convention before choosing descending/ascending or applying a threshold.

Dot product additionally depends on magnitude. It ranks the same as cosine when all compared vectors are unit length. Euclidean distance ranks equivalently on unit vectors because squared distance equals2 minus2 times the dot product. Do not assume normalization for every provider/model/postprocessing step. The checked OpenAI embedding guide documents unit normalization for its embeddings; the general function below does not rely on it.

```python
# study_ai/vector_search.py
from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass


def unit_vector(values: Sequence[float]) -> tuple[float, ...]:
    if not 1 <= len(values) <= 4096:
        raise ValueError("Invalid embedding dimension")
    numbers: list[float] = []
    for value in values:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("Invalid embedding component")
        number = float(value)
        if not math.isfinite(number) or abs(number) > 10000:
            raise ValueError("Invalid embedding component")
        numbers.append(number)
    norm = math.hypot(*numbers)
    if norm == 0:
        raise ValueError("Zero embedding has no direction")
    return tuple(value / norm for value in numbers)


def cosine(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) != len(right):
        raise ValueError("Embedding dimension mismatch")
    a, b = unit_vector(left), unit_vector(right)
    # Normalize separately: multiplying tiny norms first can underflow to zero.
    score = math.fsum(x * y for x, y in zip(a, b, strict=True))
    return max(-1.0, min(1.0, score))  # Only contain floating-point roundoff.


@dataclass(frozen=True, slots=True)
class VectorSpace:
    model_revision: str
    dimensions: int
    preprocessing_version: str


@dataclass(frozen=True, slots=True)
class Principal:
    tenant: str
    subject: str


@dataclass(frozen=True, slots=True)
class IndexedChunk:
    chunk_id: str
    tenant: str
    allowed_subjects: frozenset[str]
    source_version: str
    space: VectorSpace
    vector: tuple[float, ...]


def search(query: Sequence[float], *, space: VectorSpace, principal: Principal,
           records: Sequence[IndexedChunk], top_k: int = 3, threshold: float = 0.0
           ) -> tuple[tuple[str, float], ...]:
    if type(top_k) is not int or not 1 <= top_k <= 20 or len(records) > 500:
        raise ValueError("Invalid search budget")
    if isinstance(threshold, bool) or not isinstance(threshold, (int, float)) or not -1 <= threshold <= 1:
        raise ValueError("Invalid similarity threshold")
    if type(space.dimensions) is not int or len(query) != space.dimensions:
        raise ValueError("Query space mismatch")
    unit_vector(query)
    seen: set[str] = set()
    ranked: list[tuple[str, float]] = []
    for record in records:
        # principal and stored ACLs come from trusted authentication/storage adapters.
        # Filter before ranking/top-k; never let an inaccessible best match consume k.
        if (record.tenant != principal.tenant or principal.subject not in record.allowed_subjects
                or record.space != space):
            continue
        if record.chunk_id in seen or len(record.vector) != space.dimensions:
            raise ValueError("Invalid indexed record")
        seen.add(record.chunk_id)
        score = cosine(query, record.vector)
        if score >= threshold:
            ranked.append((record.chunk_id, score))
    ranked.sort(key=lambda item: (-item[1], item[0]))
    return tuple(ranked[:top_k])
```

This exact scan is bounded to500 records, with deterministic chunk-ID tie breaking and explicit zero/mismatch/nonfinite rejection. math.hypot avoids a naive sum-of-squares norm overflow/underflow; dividing components separately also avoids multiplying tiny norms. It is a readable reference implementation, not a scalable approximate-nearest-neighbor index.

Principal/ACL records are server-owned inputs. Do not construct them directly from a client's claimed tenant/subject or permit a model to choose the scope. This fixture filters before scoring; an external approximate index must demonstrate its own filtered-search semantics and recheck authorization at source fetch/citation time. Permission revocation, membership changes and caches still need a complete application policy. That broader authorization workflow is a later retrieval task.

The stored source_version is available for provenance but this scan has no authoritative source lifecycle store. A later pipeline must reject stale/deleted records during fetch and retire old index generations. Namespacing compatible vector spaces does not solve stale permissions or deleted source text by itself.

## Real SDK serialization with fake embedding output

The following test calls the installed SDK through its offline HTTPX2 transport. The dimension3 response is deliberately hand-written, not evidence that a model placed these words at these coordinates. In a live adapter, validate batch response indices/counts, numeric values and dimensions before storage; do not assume response order alone maps every vector to its input. The requested model must support the selected dimensions, and source token limits require a model-appropriate counter rather than character length.

```python
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
```

## Relevance and implementation trade-offs

A nearest-neighbor method usually returns a nearest available item even when nothing is useful. Thresholds and an explicit no-evidence path matter. A threshold0.8 is not universally "80% relevant"; calibrate it against labeled queries, languages, document types and false-positive costs for that embedding/index version. Hand-selected vectors prove arithmetic and authorization order, not semantic quality.

Lexical search can retain exact error codes/identifiers that semantic similarity misses. The hybrid reference below combines bounded branch rankings; learned reranking remains a separate extension. Neither requires mastery of several vector products. Begin with this bounded exact reference to validate a real index's ordering/filtering behavior on a small corpus. Approximate search can trade recall for speed; measure recall/latency under your actual metadata filters and update workload.

Do not arbitrarily truncate a vector and assume its coordinates remain meaningful. Use supported dimension reduction/model configuration and then verify normalization/index migration/relevance. A model-specific supported shortening method does not grant that property to every embedding family. Do not concatenate unrelated models' coordinates and apply an old threshold without evaluation.

## Lexical, semantic and hybrid ranking

Lexical retrieval compares terms and can preserve exact identifiers such as ERR_TIMEOUT. Semantic retrieval compares learned representations and can match paraphrases without shared words, but can miss exact distinctions or negation. Neither is universally better. Start with separately observable branch results and labeled relevant IDs so a missed candidate can be traced to extraction, authorization, candidate generation, ranking or final context selection.

The following lexical baseline uses NFC, Unicode casefold and Python word tokens, then Jaccard overlap of unique terms. It is deliberately not BM25: it has no term-frequency saturation, inverse-document-frequency weighting, phrase/proximity logic, stemming or language-aware segmentation. Underscores stay inside word tokens; hyphens split. Casefold can change identifiers, so a real code-search system may need an additional exact-case field. Keep query/document normalization versioned; do not rewrite original citation text.

Do not add a raw cosine score to a lexical score merely because both are numbers. Their distributions and calibration differ. Reciprocal rank fusion combines rank positions: each branch contributes `weight / (rank_constant + one_based_rank)`. A candidate appearing near the top in both branches can outrank a single-branch winner. The rank_constant is a smoothing parameter, not top-k or a relevance threshold. The default60 below is a teaching choice to tune, not a claim about any provider's implementation constant.

```python
# study_ai/hybrid_search.py
from __future__ import annotations

import math
import re
import unicodedata
from collections.abc import Mapping, Sequence


def _top_k(value: int) -> None:
    if type(value) is not int or not 1 <= value <= 20:
        raise ValueError("Invalid top-k")


def _terms(text: str, *, maximum: int) -> frozenset[str]:
    if len(text) > maximum:
        raise ValueError("Search text budget exceeded")
    return frozenset(re.findall(r"\w+", unicodedata.normalize("NFC", text).casefold()))


def lexical_search(query: str, *, texts: Mapping[str, str], authorized_ids: frozenset[str],
                   top_k: int = 3, threshold: float = 0.0) -> tuple[tuple[str, float], ...]:
    _top_k(top_k)
    if (len(texts) > 500 or isinstance(threshold, bool) or not isinstance(threshold, (int, float))
            or not math.isfinite(threshold) or not 0 <= threshold <= 1):
        raise ValueError("Invalid lexical search policy")
    wanted = _terms(query, maximum=512)
    if not wanted:
        return ()
    ranked: list[tuple[str, float]] = []
    for identity, text in texts.items():
        if identity not in authorized_ids:
            continue
        terms = _terms(text, maximum=2000)
        overlap = len(wanted & terms)
        if overlap:
            score = overlap / len(wanted | terms)
            if score >= threshold:
                ranked.append((identity, score))
    ranked.sort(key=lambda item: (-item[1], item[0]))
    return tuple(ranked[:top_k])


def fuse_ranks(lexical: Sequence[str], semantic: Sequence[str], *, authorized_ids: frozenset[str],
               lexical_weight: float = 1.0, semantic_weight: float = 1.0,
               rank_constant: int = 60, top_k: int = 3) -> tuple[tuple[str, float], ...]:
    _top_k(top_k)
    weights = (lexical_weight, semantic_weight)
    if any(isinstance(w, bool) or not isinstance(w, (int, float)) or not math.isfinite(w)
           or not 0 <= w <= 10 for w in weights) or sum(weights) == 0:
        raise ValueError("Invalid fusion weights")
    if type(rank_constant) is not int or not 1 <= rank_constant <= 1000:
        raise ValueError("Invalid rank constant")
    scores: dict[str, float] = {}
    for ranking, weight in zip((lexical, semantic), weights, strict=True):
        if len(ranking) > 100 or len(set(ranking)) != len(ranking):
            raise ValueError("Invalid branch ranking")
        # Branches must already retrieve under this scope; this is a second check.
        visible = [identity for identity in ranking if identity in authorized_ids]
        if weight == 0:
            continue
        for rank, identity in enumerate(visible, start=1):
            scores[identity] = scores.get(identity, 0.0) + weight / (rank_constant + rank)
    return tuple(sorted(scores.items(), key=lambda item: (-item[1], item[0]))[:top_k])
```

The server-owned authorized_ids set comes from the authoritative permission policy, not request JSON or a model. Apply the same scope before each branch's retrieval/top-k; filtering only after an unfiltered approximate top-k can lose all authorized results and leak information through intermediate results. Fusion cannot recover a relevant candidate neither branch returned. A second allowlist check contains stale/incompatible branch results, but current source authorization still happens again in the evidence resolver.

Branch candidate depth, fused top-k and final context budget are different knobs. Retrieve enough candidates to measure recall, fuse/rerank a bounded union, then choose a prompt-sized set. Increasing top-k can improve recall while adding noise and latency. A higher branch threshold can suppress misleading matches but exclude relevant low-scoring passages. Calibrate these choices on held-out query slices; do not tune on your final test questions until every failure disappears and call that generalization.

The lexical threshold lies in[0,1], the vector reference uses cosine in[-1,1], and fused scores have a third scale determined by ranks/weights/constants. A vector threshold of0.8 must not be copied into the RRF result. Prefer separate branch policies plus an explicit evidence sufficiency check; a nonempty fused list alone does not establish that an answer exists.

```python
# lab_tests/test_hybrid_search.py
import pytest

from study_ai.hybrid_search import fuse_ranks, lexical_search


def test_lexical_identifiers_unicode_and_empty_hits():
    texts = {"a": "ERR_TIMEOUT closes client", "b": "Client cancellation releases resources",
             "private": "ERR_TIMEOUT", "unicode": "café"}
    allowed = frozenset({"a", "b", "unicode"})
    assert lexical_search("err_timeout", texts=texts, authorized_ids=allowed, top_k=1) == (("a", 1 / 3),)
    assert lexical_search("cafe\u0301", texts=texts, authorized_ids=allowed) == (("unicode", 1.0),)
    assert lexical_search("unknownword", texts=texts, authorized_ids=allowed) == ()
    assert lexical_search("!!!", texts=texts, authorized_ids=allowed) == ()
    assert lexical_search("err_timeout", texts=texts, authorized_ids=allowed, threshold=0.5) == ()


def test_rank_fusion_shared_support_exact_scores_and_empty_branch():
    allowed = frozenset({"a", "b", "c"})
    ranked = fuse_ranks(["a", "b"], ["b", "c"], authorized_ids=allowed)
    assert [identity for identity, score in ranked] == ["b", "a", "c"]
    assert ranked[0][1] == pytest.approx(1 / 62 + 1 / 61)
    assert fuse_ranks([], ["b", "a"], authorized_ids=allowed, top_k=1)[0][0] == "b"
    assert fuse_ranks(["a"], ["b"], authorized_ids=allowed, semantic_weight=0)[0][0] == "a"
    assert fuse_ranks(["private", "a"], ["b"], authorized_ids=allowed) == (
        ("a", 1 / 61), ("b", 1 / 61))
    assert fuse_ranks([], [], authorized_ids=allowed) == ()


def test_invalid_fusion_and_lexical_policies():
    allowed = frozenset({"a"})
    for options in [dict(lexical_weight=0, semantic_weight=0), dict(lexical_weight=float("nan")),
                    dict(rank_constant=True), dict(top_k=0)]:
        with pytest.raises(ValueError):
            fuse_ranks(["a"], [], authorized_ids=allowed, **options)
    with pytest.raises(ValueError, match="branch ranking"):
        fuse_ranks(["a", "a"], [], authorized_ids=allowed)
    with pytest.raises(ValueError):
        lexical_search("x", texts={"a": "x"}, authorized_ids=allowed, threshold=float("nan"))
```

### Worked branch disagreement

For query ERR_TIMEOUT, the lexical fixture retrieves a by the exact code token. A synthetic semantic branch could rank b first because it represents related cancellation language; without real embeddings that branch order is only a supplied test input. Fusion makes both candidates inspectable rather than pretending the semantic score proves an exact code match. The tests assert arithmetic/order/scope, not that the combined system has better relevance.

A production sparse retriever such as PostgreSQL full-text search/BM25-capable search infrastructure is an alternative when language/tokenization/ranking requirements exceed this baseline. Choose one implementation based on the existing primary backend and corpus needs; do not introduce several search products as prerequisites. Keep analyzers, stop words, stemming, exact identifier fields and update/deletion behavior under versioned tests. Reranking a bounded candidate union is a separate stage with its own model/budget/evaluation policy.

### Practice for hybrid search

Create a labeled set containing an exact error-code query, a paraphrase, a negation, a multilingual query and a no-answer query. Compare lexical-only, semantic-only and hybrid rankings while retaining per-branch candidate IDs. Vary candidate depth, top-k, branch thresholds and fusion weights one factor at a time. Measure relevant-item recall and misleading retrieved items under the actual permission filters, then evaluate the final cited answer separately.

**Acceptance:** baseline/fusion tests and strict checks pass; empty branches, ties, duplicate IDs, forbidden candidates, invalid policies and nonfinite thresholds are explicit; exact identifiers/Unicode normalization behave as documented; you can explain why raw score addition and copying thresholds between stages are invalid. Real embedding relevance, production sparse/ANN adapters, learned reranking and learner measurements remain unperformed. The current official hosted Retrieval guide also describes hybrid weighting, but this local formula is an independent reference, not a claim to reproduce its internals. [Official retrieval ranking guidance](https://developers.openai.com/api/docs/guides/retrieval).

## Practice and acceptance

Compute cosine for identical, orthogonal and opposite vectors; explain why scaling one vector changes dot product but not cosine. Run the tiny search tests, then add zero/nonfinite/wrong-dimension store records, empty authorized results, invalid thresholds/top_k, dimension-equivalent incompatible model versions and permission revocation fixtures. No unauthorized ID/title/content should leave the retrieval boundary or consume the top-k limit.

Build a small reviewed set of real queries and relevant source/chunk IDs. Generate embeddings only in a separately authorized, budgeted integration with non-sensitive fixtures; record model/preprocessing/dimension/source versions. Compare lexical and semantic results by relevant-item recall and misleading matches, including negation, Hungarian/English variants and exact code identifiers. Keep quality measurements separate from these hand-vector tests.

**Acceptance:** strict checks/tests pass; normalization/finite/dimension/zero handling is explicit; compatible namespaces and permission-before-top-k behavior match the reference; the real SDK emits the embedding request through a fake transport and closes. Real provider embeddings/token limits, semantic relevance, durable/approximate vector storage, live permission changes/deletion/caching and learner practice remain required. Those later lessons complete the retrieval system; this note supplies its intermediate representation/similarity boundary.

Official references checked2026-10-21: [embedding representation, normalization and supported dimensions](https://developers.openai.com/api/docs/guides/embeddings), [Python embedding endpoint](https://developers.openai.com/api/reference/python/resources/embeddings), [bounded extraction and source provenance](./document-processing.md), [owned provider client and error policy](./model-sdk.md). No synthetic vector score here is a model-quality result.
