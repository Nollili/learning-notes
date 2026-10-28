# Data Minimization, Retention and Provider Boundaries

Continue [source/output security](./source-and-output-security.md), [provenance/audit](./provenance-and-oversight.md), [SDK ownership](./model-sdk.md) and [vector deletion](./vector-storage-lifecycle.md). This intermediate lesson uses the existing Python3.13/Pydantic2/OpenAI SDK3.35.1 study path. All export policies below are fixture decisions. No real provider account, contract, retention setting or deletion request was inspected or changed.

## Decide what is necessary before assembling a request

For a study-note classification, the model needs a short permitted excerpt, not the user's email, ACL membership, database record, credentials, all conversation history or raw incident logs. A smaller payload reduces exposure and work but must still preserve the task's evidence/qualifications. Do not silently cut off a negation or important exception to meet a size limit; select/review a bounded source span or reject/defer. Redaction and pseudonymization can change meaning and still leave identifying combinations; they require their own evaluation.

The following gate requires current tenant/subject access and a trusted unexpired export policy for one provider/purpose/classification. It rejects an oversized note instead of truncating it. The outbound DTO contains a job-local alias and text; actual source identity/version stay in the authorized job's private provenance map. The application's fixed settings select the provider and endpoint, never model text.

<<< ../workbench/applied-ai/python/study_ai/provider_export.py


This is an in-process boundary, not a policy-administration/authentication/DLP service. The source classification, current note/ACL, export policy and clock come from trusted server adapters. A model deciding that its own input is “public” cannot supply that authority. Validate and version those records when loading them; the dataclass does not validate untrusted JSON. The predicate checks a fixture policy, not a real account's provider settings. Policies must be scoped to tenant, purpose, approved service/region/features and review date, with revocation and an owner. Extend the typed contract deliberately before adding another purpose/provider; do not reuse a classification approval for unrelated analysis.

Assign aliases e1–e8 in one request and retain their source/version/span mapping privately for current citation resolution. Send only the outbound DTO or its text, not the complete StoredNote/policy/principal/map. An alias hides source names from this projection, not from information contained in the text. The source may still contain sensitive facts or instructions: apply data classification, task scope, safe tools and output review separately. No regex-based “secret removal” guarantee is made.

## One flag is not a data-handling contract

Official OpenAI API data-controls documentation checked2026-10-25 distinguishes training use, abuse-monitoring logs and feature/application state. API data is not used for model training by default unless opted in. Default abuse monitoring can retain content for up to30 days with stated exceptions. `store:false` controls relevant response storage; it does not independently establish Zero Data Retention or erase all feature state. Approved retention controls have eligibility, endpoint/model/feature limitations. Files, background work, caches and third-party tools need their own current checks. Do not apply these API facts to every consumer product, provider or third-party service.

Before a real integration, record the approved provider/account/project, endpoint/model/features, opt-in/training policy, abuse/application-state retention, region/transfer requirements, subprocessors/tool destinations, deletion capabilities and operational contacts. Verify the actual account configuration and governing agreements with its authorized owner. Official general documentation cannot prove your project's configuration. Select only features consistent with the data's permitted handling; otherwise use a different approved design or decline the export.

The existing SDK fixture explicitly uses the configured API origin, bounded owned transport, no automatic retries and `store=False`; its offline request test verifies serialization. This is good request hygiene, not certification of provider retention or a complete raw-body byte bound. Do not put source/secret values into metadata, filenames, tracing tags or error logs. A safe main request plus a verbose debug logger still leaks data. Remote tools and tracing/analytics services create additional outbound boundaries.

The official data-controls page was rechecked on 2026-10-27 for this review. Its endpoint/feature exceptions still require actual account-owner verification; no retention setting was changed.

## Inventory derivatives and define lifecycle owners

| Artifact | Necessary purpose / access | Retention/deletion decision and verification |
|---|---|---|
| Original source and extracted bytes | Authorized source owner and ingestion service | Source policy; explicit delete/quarantine; version fence prevents delayed reingest resurrection |
| Chunks/embeddings/index generations | Current retrieval under tenant/ACL | Delete/update across generations, verify current-source filter and retired-generation cleanup |
| Cache/summary/history/checkpoints | Scoped job/session continuity | Bounded TTL/bytes, current permission before read, invalidate derived private text; replay cannot replenish budget |
| Provider request/response/application state | Approved task only | Verify exact endpoint/feature/account settings, objects/IDs and available deletion/expiry controls |
| Uploaded files/batch manifests/results | Approved background task | Own object IDs, retry/reconciliation and file lifecycle; deleting local files does not delete remote objects |
| Trace/debug/error data | Minimal safe diagnostics | Projection/admission/short documented lifetime; no raw body/credential logging |
| Approval/receipt/audit | Accountability/recovery | Separate access and reviewed retention; pseudonymous IDs can still be personal/sensitive |
| Backups/replicas/exported fixtures | Recovery or approved testing | Expiry and restore/tombstone policy; test that deleted sources do not reappear after restoration |

Choose periods from actual purpose/requirements and an approved policy, not a universal number copied from an example. A retention hold must be explicit and authorized; it must not silently grant normal query access. Data can be inaccessible for normal use while retained for a separately controlled purpose. The append-only audit fixture prevents ordinary row deletion but supplies no lifecycle administration: production retention may rotate/expire whole protected segments through a privileged audited process. Do not silently disable its triggers in the application to “clean up.”

## Worked deletion and reconciliation

For source s/version v, the trusted workflow records a delete/tombstone decision, immediately denies new authorized publication, removes current source/ACL and derived vectors, invalidates caches/history according to policy, and inventories any provider/file/backup copies. Use stable deletion-operation IDs and track each derivative as pending/completed/blocked with safe references and reason. A remote deletion timeout is an unknown outcome to reconcile, not proof the copy is gone. A partial failure must not restore the source or fall back to a cached private excerpt.

The existing VectorStore.delete_source transaction physically removes rows from its active local tables and cascades across vector generations/ACLs; its real-file test checks the result and idempotent replay. That does not wipe free pages, journals, remote services or backups. A previously retrieved candidate is revalidated against the current source before evidence publication. Stronger in-flight revocation guarantees require coordinated publication fencing. A restore process applies tombstones/current permissions before serving recovered data. Do not claim complete erasure from a successful SQL DELETE alone.

Maintain a reconciled artifact inventory: source/job/provider object references, owner, purpose, policy version and last verified state. Record minimal completion evidence, not the deleted text itself. Test scheduled expiry and manual deletion separately. A tombstone may need to outlive the deleted artifact to prevent resurrection; minimize its fields and define its own lifecycle rather than keep a hidden permanent copy of content.

## Offline checks and learner acceptance

<<< ../workbench/applied-ai/python/lab_tests/test_provider_export.py


Run strict mypy for provider_export.py and pytest with test_provider_export.py plus the existing test_model_sdk.py. The SDK tests use a fake credential and HTTPX2 MockTransport; they verify store:false, configured origin/body, one-attempt failure handling and safe error categories without external requests.

[Related learner criteria](../practice/applied-ai/chapters/provider-data-lifecycle.md).

**Validation performed:** exact export gate passed strict mypy. Twenty offline tests passed:9 projection/policy cases and11 existing real-SDK mock-transport cases. Existing local vector deletion/reopen tests provide the narrower row-lifecycle evidence documented in that lesson. No real sensitive data, provider configuration/deletion, legal compliance assessment, remote object inventory or backup erasure was performed.

References checked2026-10-25: [official OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data), [logging exclusions and access](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [local vector lifecycle](./vector-storage-lifecycle.md), [private cache/batch boundaries](./cache-and-batch.md). Recheck official endpoint/features and actual approved settings before live use.
