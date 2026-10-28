# Persistent Vectors, Current Access and Index Lifecycles

Continue the primary Python/uv path with [similarity spaces](./embeddings-and-similarity.md) and [verified evidence](./retrieval-context.md). This intermediate implementation uses Python3.13.11's SQLite driver and the existing `study_ai.vector_search` functions. SQLite stores normalized vectors as JSON and performs an exact cosine scan in Python. It is a deliberately small persistent baseline, not a specialized ANN index. Its input vectors are authored two-dimensional test fixtures, not real model embeddings or measured semantic relevance.

## Choose storage by the retrieval contract

A vector store needs more than a float array: stable tenant/source identity, source version, embedding model revision, dimension, preprocessing/chunk policy, metric, current access policy and an update/delete/rebuild protocol. Two vectors with the same dimension are not necessarily comparable. This lab fixes cosine as its metric and binds the other space fields to a named generation. A model or preprocessing change creates a new space; re-embed the corpus **and queries** before switching. Do not query an old corpus with the new model merely because the API accepts the dimension.

For a small local corpus, an exact scan is transparent and provides a correctness baseline. At larger scale, compare a PostgreSQL vector extension or a managed/vector-specific service using measured recall, latency, memory, update cost, operational ownership and authorized filtering. Approximate HNSW/IVF-style search trades recall for speed and has build/tuning costs; adding an ANN index does not preserve exact top-k by definition. Do not require several vector platforms for this course. Keep the baseline and one production adapter behind the same tested access/version contract when the workload justifies one.

## Current authority before ranking

The database below has authoritative current sources and ACLs plus derived vector generations. The trusted ingestion/admin boundary owns `publish_source`, `index`, `activate` and `delete_source`; these are not public HTTP methods. The authenticated search principal comes from a server-owned identity adapter. Never let a tool/model choose tenant, ACL or active generation through prompt text.

Each source is one nonempty text chunk of at most2000 code points here. The content hash is its exact UTF-8 version; a changed extraction/chunk policy belongs in the space metadata. The real extraction lesson's multi-chunk locator/span identities need a richer adapter. Do not erase them in a production migration: index each chunk with its stable identity and immutable source/extractor version. This fixture focuses on lifecycle atomicity, not a second generic chunker.

SQL filters current tenant, ACL and source version **before** the500-candidate scan budget and ranking. Otherwise an inaccessible best match could consume k or leak text through reranking. An ACL revocation takes effect without re-embedding. A source edit immediately hides its old vector until a current embedding is indexed. This intentionally favors freshness/privacy over availability; expose a safe “indexing/incomplete evidence” state rather than generate from stale cached text.

<<< ../workbench/applied-ai/python/study_ai/vector_store.py


Use one serialized owner per connection and explicitly close it in `finally`. Do not share this default SQLite connection across arbitrary ASGI threads or run synchronous scans on an async event loop. A service adapter must own execution, admission and deadlines; the0.2-second SQLite lock timeout is not a full request budget. Keep the database and parent directory private to the application. The public `db` attribute exists for test fault injection, not an untrusted query interface. Treat schema-initialization or rollback failure as an owner failure: close/discard the connection and stop serving from it.

Apply schema migrations for existing databases; CREATE IF NOT EXISTS does not migrate an old schema.

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

<<< ../workbench/applied-ai/python/lab_tests/test_vector_store.py


Run in the isolated Python lab:

```sh
uv run --locked mypy --strict study_ai/vector_store.py study_ai/vector_search.py
uv run --locked python -m pytest lab_tests/test_vector_store.py lab_tests/test_evidence.py -q
```

**Observed fixture:** source a is Alice's weaker cosine match; private b and another tenant's c are stronger. Alice's top1 is a. Revoking a removes it immediately. Editing a hides its old vector; indexing the new hash restores it. Incomplete/raced g2 cannot activate; complete g2 switches, old-space queries fail; stale g1 cannot be blindly reactivated. File reopen preserves the corpus. Deletion removes ACLs and derived vectors. These are deterministic lifecycle checks, not model relevance results.

[Related learner criteria](../practice/applied-ai/chapters/vector-storage-lifecycle.md).

**Validation performed:** exact store and shared similarity module passed strict mypy. Sixteen offline tests passed:11 real-file SQLite lifecycle cases plus5 existing evidence/citation cases. They include reopen, two-connection writer contention, source/ACL rollback, current permission/version filtering before top-k, update, cascade deletion, staged/raced generation activation, mismatched spaces, invalid vectors, deterministic ties/upsert and scan-budget rejection. No model embeddings, ANN service, ASGI adapter, multi-chunk storage adapter, crash/power-loss durability, physical erasure or backup restore was tested. The fixture is local study material, not a complete deployed RAG service.

Official references checked2026-10-25: [Python3.13 sqlite3 ownership/transactions](https://docs.python.org/3.13/library/sqlite3.html), [SQLite isolation](https://www.sqlite.org/isolation.html), [foreign keys and cascade configuration](https://www.sqlite.org/foreignkeys.html). The repository's [evidence contract](./retrieval-context.md) remains the publication boundary.
