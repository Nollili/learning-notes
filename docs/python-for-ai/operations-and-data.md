# Operating model applications, ETL and a small review UI

These are introductory, role-dependent topics. Keep the primary Python/uv/FastAPI and React/TypeScript application stack. The examples extend the existing extraction, evaluation and deployment notes; they do not require a second production framework or a paid training/observability platform. Python3.13.11, Streamlit1.66.0 and pytest9.0.2 were checked2026-10-26. An isolated reproducible project is retained in `docs/workbench/applied-ai/secondary-lab` with pyproject.toml and uv.lock. Copy it to a practice directory, run `uv sync --locked`, then `uv run --locked pytest check.py`; do not install these dependencies into an Autocode template.

## MLOps and LLMOps: release the whole behavior

MLOps covers the lifecycle of data/model artifacts: reproducible data preparation, training/evaluation, registration, deployment, monitoring and retirement. LLMOps applies similar ownership to generative applications, including prompt/tool/retrieval versions, provider changes, output support, safety, latency and cost. It is an operating discipline, not the purchase of a dashboard. A prompt-only change can be a behavioral release even when application source hardly changes.

For the document assistant, a release identity should bind source revision, environment lock, model snapshot/runtime, prompt/schema/validator hashes, extractor/chunker/embedding space, corpus/index generation, tool/approval policy and evaluation labels. Keep permissions current rather than treating a corpus snapshot as authorization. A reproducible configuration does not make sampling perfectly deterministic, nor does an old alias identify immutable model behavior. Retain the actual supported provider version and requalify retirement/alias changes.

A run record could contain this **synthetic** configuration, with real artifact hashes substituted in your practice:

```json
{
  "release": "assistant-study-v2",
  "source_revision": "local-reviewed-revision",
  "model": "reviewed-supported-snapshot",
  "prompt_revision": "answer-v3",
  "embedding_space": "study-space-v1",
  "corpus_generation": "approved-generation-4",
  "evaluation_dataset": "questions-v2",
  "permission_policy": "current-authority-v1",
  "prior_release": "assistant-study-v1",
  "state": "candidate"
}
```

Use the existing [evaluation measurements](./evaluation-measurements.md) for denominators, timeouts, unknown usage and held-out comparison. The small gate below accepts application-owned synthetic measurements. External evaluation JSON needs its own bounded runtime schema before construction. Here “ok” means the case satisfied its authored task rubric; “miss” is a task failure and “unsafe” violates a hard invariant. Real reports need richer failure labels and per-slice/human-supported evaluation.

<<< ../workbench/applied-ai/secondary-lab/ops.py

A candidate with the same dataset/case IDs, at least the baseline's successes, no observed unsafe case, p95≤1500ms and known cost≤10 fixture units is eligible. These are illustrative study thresholds, not universal production standards. A candidate with one unsafe disclosure fails even if faster or more accurate overall. Unknown cost fails the gate instead of becoming zero. Comparable IDs alone do not prove comparable corpus, labels, workload or permissions: bind those identities in the real release record too. A tiny passing fixture does not establish an unseen safety rate.

**Promotion:** run deterministic/schema/security tests, paired task evaluation and a held-out confirmation; review differences and retain the prior artifact. Shadow/canary only under approved data export and current authorization. Monitor end-to-end success/error/support, latency, queue/admission, costs including failed attempts, source freshness and permission-denied outcomes. Feature/input distribution drift is a signal to inspect; it is not proof of quality regression. Label/concept drift, extraction failure, stale retrieval and model changes require different responses. Do not automatically retrain on unreviewed production answers or exported private traces.

A model registry stores versions/metadata and promotion state; an experiment tracker such as MLflow can record parameters, metrics and artifacts. That tool is optional here: the local versioned ledger establishes the contract without another service. Restrict access to artifacts/traces, redact credentials/source bodies, define retention/deletion, and remember a dashboard can become another data-export boundary. Rolling back model/prompt artifacts does not rewind database effects, source deletion or newly revoked access.

**Worked failure:** releasev2 lowers latency but includes a cross-tenant answer. The gate rejects it; retain the case and classify whether filtering, stale cache or context assembly introduced it. Restore the complete prior eligible configuration while still honoring current ACLs. Do not solve this by raising the quality average threshold or hiding the denied slice. Verify the fix on the same regression plus new held-out cases.

[Related learner criteria](../practice/applied-ai/chapters/operations-and-data.md).

## ETL: commit data and its progress together

ETL means extract from an authorized source, transform under a versioned contract, then load a destination. ELT loads a controlled raw/staging representation first and transforms inside the destination. ELT can preserve reprocessing flexibility but increases raw-data exposure/retention. Neither acronym guarantees correctness. Choose from source rate/schema, destination capacity, privacy and recovery needs.

The existing [document extractor](./document-processing.md) owns format/byte/provenance rules. This new incremental loader owns cursor/revision/transaction semantics. Its source contract is a trusted monotonically increasing sequence per tenant, with stable logical IDs and revisions. The tenant is supplied by authenticated application context, not a row. A source record is strict NDJSON `{seq,id,revision,body,deleted}`. A deletion carries an empty body and a newer revision; the destination retains a tombstone revision while excluding its body from reads. That prevents a delayed older update from resurrecting deleted content.

<<< ../workbench/applied-ai/secondary-lab/etl.py

Create a **new** local SQLite database with the exported SCHEMA and use one default-transaction-mode connection per serialized owner. This is a small local companion fixture; PostgreSQL remains the primary shared service store. It validates the entire≤100record/256KiB batch before loading. Within one transaction it checks the source cursor, rejects revision conflicts, upserts current state and commits the new cursor. A failure halfway through rolls back both data and checkpoint. A retry at/before the cursor is a source redelivery and is skipped; this assumes a trustworthy append-only sequence.

A reused sequence with altered upstream meaning violates the source contract and needs source auditing/reconciliation, not silent cursor reset.

The raw batch is bounded eagerly; this is not constant-memory streaming. The existing bounded-stream notes supply larger-input ownership. `with db` depends on the stated SQLite transaction mode; it is not a transaction for an autocommit connection. The example's empty deleted body is an intentional schema rule. Tombstones/checkpoints are durable in the same file; back up/restore them consistently. Hard-delete private body derivatives, indexes/caches and exported artifacts through their respective owners; retaining a minimal revision tombstone does not justify retaining deleted source text.

**Worked failure:** record2 updates a document to revision2; record3 tries to set revision1 under a newer sequence. The loader raises and leaves the old document plus old checkpoint intact. Correct the source batch or quarantine its safe ID/reason, then retry; do not advance the cursor past a rejected event and call the data current. Quarantine may itself contain sensitive data and needs a restricted retention policy. Schema changes require versioned migrations/reprocessing, not a broad `except: continue`.

For a shared PostgreSQL loader, lock the tenant's checkpoint row, bind parameters, and put receipts/upserts/checkpoint in the same transaction. Use an outbox/staging generation for external indexing: a database commit and vector-store write are not atomic. Measure source lag, rejected rows, load duration, duplicates and destination reconciliation. Backfills need an isolated generation/high-watermark handoff so they cannot overwrite newer incremental updates. A timestamp cursor alone can miss ties/backdated records; use a source-supported stable sequence or composite cursor and define late-arrival handling.

[Related learner criteria](../practice/applied-ai/chapters/operations-and-data.md).

## Streamlit: a useful internal review prototype

Streamlit reruns a Python script in response to interactions. A widget value is input to that run; session_state can retain selected UI state between reruns. It is not a durable database, authentication authority or cross-user job store. Forms batch edits until submit and avoid triggering expensive work for every intermediate widget change. Use it for an internal evaluation/data-review prototype when Python-side iteration matters. Keep React for the primary polished application requiring complex routing, fine interaction control and its existing design system.

<<< ../workbench/applied-ai/secondary-lab/app.py

Run `uv run --locked streamlit run app.py --server.address 127.0.0.1` from the copied fixture. The two candidates are public synthetic data, not real model outcomes. The form remembers the last submitted choice, renders JSON as structured text and shows an explicit rejection for an unsafe fixture. Changing a select before submission should not launch model work; that is why network calls do not live at module top level. Long jobs should be durable backend jobs with status/cancel behavior, not a blocking loop in a rerun.

A normal Python global or cached resource can be shared across sessions. Do not cache an authenticated user's private results under only the query string; scope by current tenant/subject, source version and policy, and recheck authority before display. st.cache_data serializes/caches results and st.cache_resource can share a live object; both require explicit bounds, invalidation and thread/resource ownership. This fixture deliberately uses neither. UI hiding is not authorization; put permission checks in the source/service. Keep secrets server-side, render untrusted text safely and never enable unsafe HTML merely to improve appearance.

**AppTest validation:** the real Streamlit testing API loaded the app without exceptions, submitted Unsafe and observed one error, then submitted Conservative and observed success. This is simulated app execution, not a browser, accessibility, deployment, concurrency or authentication test. The persisted `check.py` also tested the release gate and real SQLite rollback/cursor/tombstone cases; all3 tests passed. No provider request, MLflow service or external ETL connector ran.

[Related learner criteria](../practice/applied-ai/chapters/operations-and-data.md).

Official references checked2026-10-26: [MLflow tracking concepts](https://mlflow.org/docs/latest/ml/tracking/), [SQLite transactions](https://docs.python.org/3.13/library/sqlite3.html#transaction-control), [Streamlit execution flow](https://docs.streamlit.io/develop/concepts/architecture/caching), [forms](https://docs.streamlit.io/develop/concepts/architecture/forms), [AppTest](https://docs.streamlit.io/develop/api-reference/app-testing/st.testing.v1.apptest). MLflow is conceptual here; no untested SDK version/API is prescribed.
