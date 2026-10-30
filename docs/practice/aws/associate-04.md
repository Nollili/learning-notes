# A04 — S3 management, hosting and SDK access

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [storage and frontend](../../aws/storage-and-frontend.md).

## A04.1 — Buckets, objects, versions and replication — repeating P02/P05

- [ ] Create the course's personalized bucket name with a random suffix; inspect configuration. Use compliant lowercase naming.
- [ ] Create and delete a second disposable bucket through CLI.
- [ ] Upload sample files through both console and CLI and list buckets through CLI.
- [ ] Demonstrate public-read access at bucket/object scope with synthetic disposable files and supported policy/ownership settings. Restore private access afterward; do not expose real data or assume ACLs are enabled.
- [ ] Enable versioning, upload revisions, delete and restore objects/versions, then suspend versioning and compare deletion behavior. Use CLI to remove and download/synchronize objects as specified.
- [ ] Configure cross-Region replication; upload new objects and observe replicas and relevant options. Record and clean both Regions.
- [ ] Inspect/configure the supplied guide's bucket encryption settings and explain the chosen key-management boundary.
- [ ] Complete the supplied S3 guide's static website-hosting exercise and verify its endpoint; this supplies the explicit prerequisite used in A05. **Repeating P02 with a different public website mechanism.**

## A04.2 — EC2 role-based S3 access — repeating A02/A03 integration

- [ ] Attach the read-only S3 role to EC2, connect through restricted SSH and compare bucket/object operations.
- [ ] Switch to `S3FullAccessRole`, repeat operations and explain the difference. The source's `S3ReadOnlyRole` refers to the corresponding `S3ReadOnlyAccessRole` from A02.
- [ ] Create and verify presigned object URLs. Investigate SDK v3 bucket/object operations.
- [ ] **Promoted from optional:** repeat permitted/denied local operations with full-access and read-only named profiles.
- [ ] Complete guide bonuses: change the instance role/profile through CLI, and empty/delete a disposable versioned bucket through CLI, including versions/delete markers where applicable.

## A04.3 — SDK script — promoted from optional; repeating CLI operations through code

- [ ] Compare the v2/v3 SDK interfaces as historical versus current references; implement the script using SDK v3.
- [ ] Initialize an npm project, upload a file using multipart upload and generate a presigned URL printed only to private local output.
- [ ] Verify access before and after expiry and inspect other relevant SDK operations. Clean unfinished multipart uploads and disposable objects.


## Completion evidence

- [ ] Record observed results for every section, including all promoted extensions.
- [ ] Retain configuration/code, successful and denied/failing cases where specified, and actual cleanup state.
- [ ] Link earlier evidence for repeating work and add the new interface/behavior comparison.

Use the [shared evidence rules](./index.md#evidence-for-every-required-module); never claim screenshots or sample code complete independent work.
