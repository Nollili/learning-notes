# A Bounded Text Upload and Its Threat Model — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/safe-text-uploads.md) · [Node.js practice map](./index.md)

## Practice and acceptance

Run strict TS and actual PostgreSQL16/HTTP/private-directory tests. Supply a test guard through the port, clearly separate from the real session/CSRF implementation. Require authenticated allowed text upload/download/status, two actors with foreign IDs returning404, expired and pending metadata withheld, and denied/absent credentials rejected before parsing/storage. Attempt traversal/filename headers, HTML-like text, malformed UTF-8, forbidden controls, blank/unsupported/gzip/oversize body, corrupted/truncated/extra stored bytes, reservation failure and finalize failure. Verify controlled pending reconciliation, safe fixed responses, file permissions/exclusive creation and no bytes served before digest validation.

Retain actual metadata/file observations and close server/pools/handles. Then connect the runnable application session/CSRF guard, quotas, owned cleanup and production storage adapter in independent practice. Revisit the threat model for each new format/processor or sharing role. Native browser attachment behavior, real cookie-CSRF middleware wiring, concurrent quota races, complex-format scanning, hard file/DB deadlines, crash-injected process recovery and learner implementation remain required. Material tests can establish this narrow storage/access contract; they do not establish a general secure upload service or professional readiness.

References checked2026-10-25: [OWASP uploads](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [OWASP threat modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html), [Express raw/body limits](https://expressjs.com/en/api.html#express.raw), [Node24 file ownership APIs](https://nodejs.org/download/release/v24.18.0/docs/api/fs.html), [PostgreSQL conditional writes](https://www.postgresql.org/docs/16/sql-update.html). Guard and SQL ports require real owned adapters; no request directly supplies either dependency.

**Practice acceptance:** use FormData with the `note` field and two real session jars. Prove CSRF/permission rejection before persistence, rejected compressed/multiple/field-containing input, client-abort and slow-body timeout without rows, bounded concurrent admission, and current-owner downloads. Run two sweepers concurrently, lose the POST response deliberately, and document the chosen duplicate/recovery policy. Verify expired rows cannot be downloaded before cleanup. Retain real observations separately from these material checks.
