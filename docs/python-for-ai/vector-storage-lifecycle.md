# Persistent Vectors, Current Access and Index Lifecycles

Continue the primary Python/uv path with [similarity spaces](./embeddings-and-similarity.md) and [verified evidence](./retrieval-context.md). This intermediate implementation uses Python3.13.11's SQLite driver and the existing `study_ai.vector_search` functions. SQLite stores normalized vectors as JSON and performs an exact cosine scan in Python. It is a deliberately small persistent baseline, not a specialized ANN index. Its input vectors are authored two-dimensional test fixtures, not real model embeddings or measured semantic relevance.

## Choose storage by the retrieval contract

A vector store needs more than a float array: stable tenant/source identity, source version, embedding model revision, dimension, preprocessing/chunk policy, metric, current access policy and an update/delete/rebuild protocol. Two vectors with the same dimension are not necessarily comparable. This lab fixes cosine as its metric and binds the other space fields to a named generation. A model or preprocessing change creates a new space; re-embed the corpus **and queries** before switching. Do not query an old corpus with the new model merely because the API accepts the dimension.

For a small local corpus, an exact scan is transparent and provides a correctness baseline. At larger scale, compare a PostgreSQL vector extension or a managed/vector-specific service using measured recall, latency, memory, update cost, operational ownership and authorized filtering. Approximate HNSW/IVF-style search trades recall for speed and has build/tuning costs; adding an ANN index does not preserve exact top-k by definition. Do not require several vector platforms for this course. Keep the baseline and one production adapter behind the same tested access/version contract when the workload justifies one.

## Current authority before ranking

The database below has authoritative current sources and ACLs plus derived vector generations. The trusted ingestion/admin boundary owns `publish_source`, `index`, `activate` and `delete_source`; these are not public HTTP methods. The authenticated search principal comes from a server-owned identity adapter. Never let a tool/model choose tenant, ACL or active generation through prompt text.

Each source is one nonempty text chunk of at most2000 code points here. The content hash is its exact UTF-8 version; a changed extraction/chunk policy belongs in the space metadata. The real extraction lesson's multi-chunk locator/span identities need a richer adapter. Do not erase them in a production migration: index each chunk with its stable identity and immutable source/extractor version. This fixture focuses on lifecycle atomicity, not a second generic chunker.

SQL filters current tenant, ACL and source version **before** the500-candidate scan budget and ranking. Otherwise an inaccessible best match could consume k or leak text through reranking. An ACL revocation takes effect without re-embedding. A source edit immediately hides its old vector until a current embedding is indexed. This intentionally favors freshness/privacy over availability; expose a safe “indexing/incomplete evidence” state rather than generate from stale cached text.

```python
# study_ai/vector_store.py
from __future__ import annotations

import hashlib
import json
import sqlite3
from collections.abc import Iterator, Sequence
from contextlib import contextmanager
from pathlib import Path

from .vector_search import Principal, VectorSpace, cosine, unit_vector


def identifier(value: str) -> None:
    if not value or len(value) > 128 or not value.isascii() or not all(c.isalnum() or c in '_-.' for c in value):
        raise ValueError('Invalid identifier')


def space_key(space: VectorSpace) -> str:
    identifier(space.model_revision)
    identifier(space.preprocessing_version)
    if type(space.dimensions) is not int or not 1 <= space.dimensions <= 4096:
        raise ValueError('Invalid dimension')
    return json.dumps([space.model_revision, space.dimensions, space.preprocessing_version], separators=(',', ':'))


class VectorStore:
    """One serialized owner/connection; one text chunk per source in this lab."""
    def __init__(self, path: Path):
        self.db = sqlite3.connect(path, timeout=0.2, isolation_level=None)
        self.db.execute('PRAGMA foreign_keys=ON')
        self.db.executescript('''
        CREATE TABLE IF NOT EXISTS sources(tenant TEXT NOT NULL, source TEXT NOT NULL, version TEXT NOT NULL,
          text TEXT NOT NULL, PRIMARY KEY(tenant,source));
        CREATE TABLE IF NOT EXISTS acl(tenant TEXT NOT NULL, source TEXT NOT NULL, subject TEXT NOT NULL,
          PRIMARY KEY(tenant,source,subject), FOREIGN KEY(tenant,source) REFERENCES sources ON DELETE CASCADE);
        CREATE TABLE IF NOT EXISTS generations(id TEXT NOT NULL PRIMARY KEY, space TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS vectors(generation TEXT NOT NULL, tenant TEXT NOT NULL, source TEXT NOT NULL,
          version TEXT NOT NULL, vector TEXT NOT NULL, PRIMARY KEY(generation,tenant,source),
          FOREIGN KEY(generation) REFERENCES generations(id) ON DELETE CASCADE,
          FOREIGN KEY(tenant,source) REFERENCES sources ON DELETE CASCADE);
        CREATE TABLE IF NOT EXISTS active(singleton INTEGER PRIMARY KEY CHECK(singleton=1),
          generation TEXT NOT NULL REFERENCES generations(id));
        ''')

    def close(self) -> None:
        self.db.close()

    @contextmanager
    def write(self) -> Iterator[None]:
        self.db.execute('BEGIN IMMEDIATE')
        try:
            yield
            self.db.execute('COMMIT')
        except BaseException:
            self.db.execute('ROLLBACK')
            raise

    def publish_source(self, tenant: str, source: str, text: str, subjects: Sequence[str]) -> str:
        # Trusted ingestion/admin port: callers must already have write authority.
        identifier(tenant)
        identifier(source)
        if not text.strip() or len(text) > 2000 or len(subjects) > 100 or len(set(subjects)) != len(subjects):
            raise ValueError('Invalid source')
        for subject in subjects:
            identifier(subject)
        version = hashlib.sha256(text.encode('utf-8', errors='strict')).hexdigest()
        with self.write():
            self.db.execute('INSERT INTO sources VALUES(?,?,?,?) ON CONFLICT(tenant,source) '
                            'DO UPDATE SET version=excluded.version,text=excluded.text', (tenant, source, version, text))
            self.db.execute('DELETE FROM acl WHERE tenant=? AND source=?', (tenant, source))
            self.db.executemany('INSERT INTO acl VALUES(?,?,?)', [(tenant, source, s) for s in subjects])
        return version

    def generation(self, name: str, space: VectorSpace) -> None:
        identifier(name)
        self.db.execute('INSERT INTO generations VALUES(?,?)', (name, space_key(space)))

    def index(self, generation: str, tenant: str, source: str, version: str,
              vector: Sequence[float], *, space: VectorSpace) -> None:
        expected = space_key(space)
        if len(vector) != space.dimensions:
            raise ValueError('Dimension mismatch')
        normalized = unit_vector(vector)
        with self.write():
            if self.db.execute('SELECT space FROM generations WHERE id=?', (generation,)).fetchone() != (expected,):
                raise ValueError('Space mismatch')
            if self.db.execute('SELECT version FROM sources WHERE tenant=? AND source=?',
                               (tenant, source)).fetchone() != (version,):
                raise ValueError('Source changed or unavailable')
            self.db.execute('INSERT INTO vectors VALUES(?,?,?,?,?) ON CONFLICT(generation,tenant,source) '
                            'DO UPDATE SET version=excluded.version,vector=excluded.vector',
                            (generation, tenant, source, version, json.dumps(normalized, allow_nan=False)))

    def activate(self, generation: str) -> None:
        # All current sources must have exactly one current vector, checked under the writer lock.
        with self.write():
            if not self.db.execute('SELECT 1 FROM generations WHERE id=?', (generation,)).fetchone():
                raise ValueError('Unknown generation')
            missing = self.db.execute('''SELECT 1 FROM sources s WHERE NOT EXISTS(
              SELECT 1 FROM vectors v WHERE v.generation=? AND v.tenant=s.tenant
              AND v.source=s.source AND v.version=s.version) LIMIT 1''', (generation,)).fetchone()
            if missing:
                raise ValueError('Incomplete generation')
            self.db.execute('INSERT INTO active VALUES(1,?) ON CONFLICT(singleton) '
                            'DO UPDATE SET generation=excluded.generation', (generation,))

    def delete_source(self, tenant: str, source: str) -> None:
        with self.write():
            self.db.execute('DELETE FROM sources WHERE tenant=? AND source=?', (tenant, source))

    def search(self, vector: Sequence[float], *, principal: Principal, space: VectorSpace,
               top_k: int = 3) -> tuple[tuple[str, str, float], ...]:
        identifier(principal.tenant)
        identifier(principal.subject)
        if type(top_k) is not int or not 1 <= top_k <= 20 or len(vector) != space.dimensions:
            raise ValueError('Invalid search budget')
        unit_vector(vector)
        expected = space_key(space)
        # One SQL statement gives a consistent active-space/ACL/source-version snapshot.
        rows = self.db.execute('''SELECT g.space, v.source, v.version, v.vector FROM active a
          JOIN generations g ON g.id=a.generation
          LEFT JOIN vectors v ON v.generation=g.id AND v.tenant=?
          AND EXISTS(SELECT 1 FROM sources s WHERE s.tenant=v.tenant AND s.source=v.source AND s.version=v.version)
          AND EXISTS(SELECT 1 FROM acl x WHERE x.tenant=v.tenant AND x.source=v.source AND x.subject=?)
          WHERE a.singleton=1 LIMIT 501''', (principal.tenant, principal.subject)).fetchall()
        if not rows or any(row[0] != expected for row in rows):
            raise ValueError('Active space unavailable')
        if len(rows) > 500:
            raise ValueError('Exact scan budget exceeded')
        scored: list[tuple[str, str, float]] = []
        for _space, source, version, encoded in rows:
            if source is None:
                continue
            raw: object = json.loads(encoded)
            if not isinstance(raw, list) or len(raw) != space.dimensions:
                raise ValueError('Corrupt vector')
            components: list[float] = []
            for value in raw:
                if isinstance(value, bool) or not isinstance(value, (int, float)):
                    raise ValueError('Corrupt vector')
                components.append(float(value))
            scored.append((str(source), str(version), cosine(vector, components)))
        scored.sort(key=lambda row: (-row[2], row[0]))
        return tuple(scored[:top_k])
```

Use one serialized owner per connection and explicitly close it in `finally`. Do not share this default SQLite connection across arbitrary ASGI threads or run synchronous scans on an async event loop. A service adapter must own execution, admission and deadlines; the0.2-second SQLite lock timeout is not a full request budget. Keep the database and parent directory private to the application. The public `db` attribute exists for test fault injection, not an untrusted query interface. Treat schema-initialization or rollback failure as an owner failure: close/discard the connection and stop serving from it. Apply schema migrations for existing databases; CREATE IF NOT EXISTS does not migrate an old schema.

This bounded search rejects501 authorized candidates rather than silently searching the first500. Raising the limit is a workload decision, not a way to claim ANN scalability. Storage itself needs corpus/generation quotas and a cleanup policy; the query cap does not bound accumulated disk usage. Failures must retain operational categories at the service boundary; lock errors/corruption/space mismatch are not factual empty results. Never convert a database outage into “no document exists.”

## Update and reindex in stages

1. Publish an authorized source revision and current ACL in one transaction. The old derived vector remains stored but is filtered out immediately when its version differs. A failed ACL insert rolls back the content update too.
2. Compute its embedding outside the writer transaction using the generation's pinned space. Record actual embedding model/settings and source version. If the source changed during computation, `index` rejects the stale result; obtain the new revision and requeue under a bounded policy.
3. For a new model/chunk policy, create generation g2 and populate it without changing the active g1 pointer. Repeated indexing upserts the same generation/tenant/source key rather than append another copy. Partial g2 cannot become active.
4. `activate` obtains the writer lock, verifies every current source has a current vector in g2, then changes one active pointer atomically. A source added/edited during staging makes that check fail until refreshed. Queries see one generation per SQL statement. This fixture uses a **global** generation; a slow tenant can delay the whole switch. Tenant-scoped generations are a possible later design, requiring their own isolation tests.
5. Start query embedding with g2's exact space. A request holding the old space at the switch is rejected and must restart with current configuration under a bounded policy. For seamless in-flight requests, design a generation-pinned snapshot/read contract; do not silently mix spaces.
6. Rollback is also a checked activation, not an unconditional pointer write. Old g1 may no longer cover current source revisions. Refresh it or keep the current generation and repair; measure which recovery is safe. Remove unreferenced retired generations only after the declared in-flight/rollback horizon. Do not delete the active generation.

Completeness of stored vectors is only a mechanical activation gate. Before a real model rollout, also compare held-out retrieval metrics, unauthorized/stale leakage, answer support, latency and cost against the labeled baseline. An embedding can be structurally valid and semantically poor. See [evaluation measurements](./evaluation-measurements.md) and the [evaluation lab](./evaluation-lab.md).

## Deletion across derived artifacts

`delete_source` removes the source, current ACL and all its vectors across generations in one transaction. Repeating it is safe. Search after the commit cannot return the deleted source from this database. A search already holding a prior snapshot might have an old candidate; the evidence resolver must re-fetch current authorized source/version before publishing text. There is still a permission/delete race after any check; stronger “no in-flight publication after revocation” requirements need coordinated request cancellation/version fencing and a documented publication boundary.

Logical deletion is not physical erasure from SQLite free pages, journals, backups, extracted files, caches, response histories or provider systems. Maintain an inventory and policy for those derivatives; record deletion requests/tombstones so restore/reingestion cannot resurrect deleted content. Enforce deletion/ACL rules on citation-open and cache reads too. The sample's cascade is one local step, not a full regulatory erasure guarantee. If a source is deliberately recreated later, its lifecycle/authorization decision must be explicit; `publish_source` alone is not a tombstone service.

## Worked checks with real files

```python
# lab_tests/test_vector_store.py — outside any Autocode src/tests directory
from pathlib import Path
import sqlite3
from dataclasses import replace
import pytest
from study_ai.vector_store import VectorStore
from study_ai.vector_search import Principal, VectorSpace

SPACE = VectorSpace('fixture-v1', 2, 'whole-text-v1')
ALICE = Principal('t', 'alice')

@pytest.fixture
def store(tmp_path: Path):
    owner = VectorStore(tmp_path / 'index.sqlite')
    yield owner
    owner.close()

def seed(store: VectorStore):
    a = store.publish_source('t', 'a', 'Allowed evidence', ['alice'])
    b = store.publish_source('t', 'b', 'Private best match', ['bob'])
    c = store.publish_source('other', 'c', 'Other tenant', ['alice'])
    store.generation('g1', SPACE)
    for t, s, v, vector in [('t','a',a,[0.8,0.2]),('t','b',b,[1.0,0.0]),('other','c',c,[1.0,0.0])]:
        store.index('g1',t,s,v,vector,space=SPACE)
    store.activate('g1')
    return a,b,c

def test_authorization_before_topk_and_current_revocation(store: VectorStore):
    seed(store)
    assert [r[0] for r in store.search([1,0],principal=ALICE,space=SPACE,top_k=1)] == ['a']
    assert [r[0] for r in store.search([1,0],principal=Principal('t','bob'),space=SPACE)] == ['b']
    store.publish_source('t','a','Allowed evidence',[])
    assert store.search([1,0],principal=ALICE,space=SPACE) == ()

def test_update_hides_stale_then_reindex_restores(store: VectorStore):
    old,_,_ = seed(store)
    current=store.publish_source('t','a','Updated evidence',['alice'])
    assert store.search([1,0],principal=ALICE,space=SPACE) == ()
    with pytest.raises(ValueError):store.index('g1','t','a',old,[1,0],space=SPACE)
    store.index('g1','t','a',current,[1,0],space=SPACE)
    assert store.search([1,0],principal=ALICE,space=SPACE)[0][:2] == ('a',current)

def test_reopen_and_delete_all_generations(tmp_path: Path):
    path=tmp_path/'durable.sqlite';store=VectorStore(path);seed(store);store.close()
    store=VectorStore(path)
    try:
        assert len(store.search([1,0],principal=ALICE,space=SPACE)) == 1
        store.delete_source('t','a');store.delete_source('t','a')
        assert store.search([1,0],principal=ALICE,space=SPACE) == ()
        assert store.db.execute("SELECT count(*) FROM vectors WHERE tenant='t' AND source='a'").fetchone() == (0,)
        assert store.db.execute("SELECT count(*) FROM acl WHERE tenant='t' AND source='a'").fetchone() == (0,)
    finally:store.close()

def test_staged_generation_complete_and_space_switch(store: VectorStore):
    a,b,c=seed(store);new=replace(SPACE,model_revision='fixture-v2')
    store.generation('g2',new)
    store.index('g2','t','a',a,[1,0],space=new)
    with pytest.raises(ValueError):store.activate('g2')
    assert store.search([1,0],principal=ALICE,space=SPACE)
    store.index('g2','t','b',b,[1,0],space=new)
    store.index('g2','other','c',c,[1,0],space=new)
    # A source update after staging invalidates activation; refresh exactly that row.
    a2=store.publish_source('t','a','Raced update',['alice'])
    with pytest.raises(ValueError):store.activate('g2')
    store.index('g2','t','a',a2,[1,0],space=new);store.activate('g2')
    with pytest.raises(ValueError):store.search([1,0],principal=ALICE,space=SPACE)
    assert store.search([1,0],principal=ALICE,space=new)[0][1] == a2
    with pytest.raises(ValueError):store.activate('g1')  # old generation is stale, rollback is not blind

@pytest.mark.parametrize('vector', [[0,0],[float('nan'),1],[True,0],[1,2,3]])
def test_invalid_vectors(store: VectorStore,vector):
    a,_,_=seed(store)
    with pytest.raises(ValueError):store.index('g1','t','a',a,vector,space=SPACE)

def test_space_duplicates_and_ties(store: VectorStore):
    a,b,_=seed(store)
    with pytest.raises(sqlite3.IntegrityError):store.generation('g1',SPACE)
    with pytest.raises(ValueError):store.index('g1','t','a',a,[1,0],space=replace(SPACE,model_revision='wrong'))
    store.publish_source('t','b','Private best match',['alice'])
    store.index('g1','t','a',a,[1,0],space=SPACE);store.index('g1','t','b',b,[1,0],space=SPACE)
    assert [r[0] for r in store.search([1,0],principal=ALICE,space=SPACE)] == ['a','b']
    assert store.db.execute("SELECT count(*) FROM vectors WHERE generation='g1' AND tenant='t' AND source='a'").fetchone() == (1,)

def test_atomic_acl_rollback_and_lock(tmp_path: Path):
    path=tmp_path/'locks.sqlite';store=VectorStore(path);seed(store);other=VectorStore(path)
    try:
        store.db.execute("CREATE TRIGGER reject_acl BEFORE INSERT ON acl WHEN NEW.subject='reject' BEGIN SELECT RAISE(ABORT,'fixture'); END")
        with pytest.raises(sqlite3.IntegrityError):store.publish_source('t','a','Do not commit',['reject'])
        assert store.search([1,0],principal=ALICE,space=SPACE)
        store.db.execute('BEGIN IMMEDIATE')
        try:
            with pytest.raises(sqlite3.OperationalError):other.delete_source('t','a')
        finally:store.db.execute('ROLLBACK')
        other.delete_source('t','a');assert store.search([1,0],principal=ALICE,space=SPACE) == ()
    finally:other.close();store.close()

def test_scan_budget_fails_without_partial_topk(store: VectorStore):
    store.generation('g',SPACE)
    for n in range(501):
        name=f's{n}';v=store.publish_source('t',name,'x',['alice']);store.index('g','t',name,v,[1,0],space=SPACE)
    store.activate('g')
    with pytest.raises(ValueError,match='budget'):store.search([1,0],principal=ALICE,space=SPACE)
```

Run in the isolated Python lab:

```sh
uv run --locked mypy --strict study_ai/vector_store.py study_ai/vector_search.py
uv run --locked python -m pytest lab_tests/test_vector_store.py lab_tests/test_evidence.py -q
```

**Observed fixture:** source a is Alice's weaker cosine match; private b and another tenant's c are stronger. Alice's top1 is a. Revoking a removes it immediately. Editing a hides its old vector; indexing the new hash restores it. Incomplete/raced g2 cannot activate; complete g2 switches, old-space queries fail; stale g1 cannot be blindly reactivated. File reopen preserves the corpus. Deletion removes ACLs and derived vectors. These are deterministic lifecycle checks, not model relevance results.

**Practice acceptance:** reproduce the tests, then extend the store to the existing multi-chunk provenance DTO. Index/update/delete two versions of a source and demonstrate that every retrieved citation resolves to the current authorized exact span. Add a source during g2 build, revoke a user after retrieval, delete a source before answer assembly and inject a storage failure: no stale/private fallback may become evidence. Record active/pending source coverage and failure categories without content-bearing logs. Measure an exact-scan baseline on a labeled corpus before selecting an ANN adapter; retain recall/latency/ACL comparisons and explain the query-at-cutover policy. Exercise backup restore with deletion tombstones as a separate operational task. Learner practice remains required.

**Validation performed:** exact store and shared similarity module passed strict mypy. Sixteen offline tests passed:11 real-file SQLite lifecycle cases plus5 existing evidence/citation cases. They include reopen, two-connection writer contention, source/ACL rollback, current permission/version filtering before top-k, update, cascade deletion, staged/raced generation activation, mismatched spaces, invalid vectors, deterministic ties/upsert and scan-budget rejection. No model embeddings, ANN service, ASGI adapter, multi-chunk storage adapter, crash/power-loss durability, physical erasure or backup restore was tested. The fixture is local study material, not a complete deployed RAG service.

Official references checked2026-10-25: [Python3.13 sqlite3 ownership/transactions](https://docs.python.org/3.13/library/sqlite3.html), [SQLite isolation](https://www.sqlite.org/isolation.html), [foreign keys and cascade configuration](https://www.sqlite.org/foreignkeys.html). The repository's [evidence contract](./retrieval-context.md) remains the publication boundary.
