# PostgreSQL Backup, Restore and Recovery

A successful backup command is not proof of recoverability. A recovery plan needs a protected artifact, all required dependencies/keys/WAL, a known target, a tested restore procedure and application-level checks. Replication improves availability but also replicates accidental deletes; it is not an independent historical backup.

The executable baseline here is PostgreSQL16.13. The primary application remains Express/MikroORM; recovery is an operational boundary outside the request path. Related prerequisites are [transactions and migrations](./module-08-postgresql-mikroorm.md) and [production lifecycle](./module-10-production-ready-applications.md).

## Choose what is being recovered

| Approach | Useful for | Important limit |
|---|---|---|
| Logical pg_dump archive | Selected database/object recovery, inspected data portability | Represents a logical snapshot; not arbitrary later point-in-time recovery |
| Physical base backup plus continuous WAL | Whole-cluster recovery to a selected point | Requires compatible server/physical environment and an unbroken required WAL chain |
| Replica/failover | Rapid service continuity after a node failure | Can contain the same bad writes as the primary |
| Storage snapshot | Fast volume-level capture where supported | Requires a PostgreSQL-consistent coordinated procedure and all relevant volumes/WAL |

Do not copy a running data directory with an ordinary file-copy command and call it a valid backup. Use PostgreSQL's backup facilities or an explicitly supported snapshot protocol. A physical backup is not an upgrade mechanism across arbitrary major versions; plan pg_upgrade/logical migration separately.

**RPO (Recovery Point Objective)** is the maximum acceptable loss of committed work measured backward from the incident. **RTO (Recovery Time Objective)** is the allowed time until the required service is restored. Define the start/end points: detection, decision, provisioning, download/decrypt, replay, validation, application deployment and traffic switch all consume time. A five-second SQL restore on a laptop does not establish a five-second service RTO.

## Logical dump and clean restore

The following commands require deliberately configured libpq services: notes_source points at the disposable source, notes_restore_admin at the isolated target's maintenance database, and notes_restored at the fresh notes_restored database on that target. Review resolved host/port/database identities before executing. Keep credentials in authorized secret/passfile configuration with restrictive permissions, not command arguments or copied URLs in logs. Do not substitute an existing production target.

```bash
# Run in a shell configured to stop on command failures.
set -eu
umask 077
task_backup_dir=$(mktemp -d /tmp/notes-backup.XXXXXX)
pg_dump --dbname='service=notes_source' --format=custom \
  --file="$task_backup_dir/database.dump"
pg_restore --list "$task_backup_dir/database.dump" > "$task_backup_dir/contents.txt"
createdb --maintenance-db='service=notes_restore_admin' --template=template0 notes_restored
pg_restore --dbname='service=notes_restored' --exit-on-error \
  --no-owner --no-privileges "$task_backup_dir/database.dump"
psql -X -v ON_ERROR_STOP=1 --dbname='service=notes_restored' \
  -c 'SELECT id, label FROM recovery_markers ORDER BY id'
```

The fixture table is shown below. Creation fails if the destination database already exists; investigate rather than add a broad destructive clean option. --no-owner/--no-privileges simplify the isolated exercise by avoiding source ownership/ACL replay. They are not a production permission policy: recreate reviewed application/migration roles and grants, then verify least privilege. Database-level dumps do not include every cluster-global role/tablespace definition; manage those as separately protected configuration. pg_dumpall --globals-only can expose sensitive role definitions and must be handled accordingly.

A custom archive is restored with pg_restore; a plain SQL dump is executed with psql. Review the tool/server version matrix for an upgrade. A dump can contain executable functions/schema code: restore only trusted, reviewed sources in an appropriately isolated environment. A listable archive and a nonzero file size are useful checks but do not replace an actual restore and domain verification.

Validate schema versions, constraints/indexes, representative counts, known markers, sequence behavior, required extensions, grants and application reads/writes using the intended app role. Row counts alone can miss wrong values. Never enable restored webhooks/payment/email workers during a rehearsal: a restored outbox can replay real external effects unless isolated.

## Physical backup and a named recovery target

PITR requires setup before the incident. On the owned disposable PostgreSQL16 source, configure wal_level=replica or higher, archive_mode=on, suitable replication permissions/pg_hba and enough WAL senders. The local demonstration archive policy is:

```text
# Example only: /tmp/notes-recovery/archive is an owned private test directory.
archive_command = 'test ! -f /tmp/notes-recovery/archive/%f && cp %p /tmp/notes-recovery/archive/%f'
```

The archive command must acknowledge success only after the file is durably stored under the real backup policy. This local cp is a teaching fixture on the same machine, not independent disaster protection. It refuses to overwrite an existing file; duplicate/existing-file handling needs an explicitly verified policy rather than silent overwrite. Monitor pg_stat_archiver failures, archive lag and disk growth. A broken archive command can fill the source disk. Do not delete needed WAL to hide that symptom.

Use unique private absolute directories for every rehearsal. The examples below assume task_recovery_dir contains this run's base and recovered directories and task_archive_dir names its existing protected archive. For readability, the recovery configuration block shows a concrete example path; substitute the exact run-owned path when preparing the clone.

```bash
set -eu
umask 077
task_recovery_dir=$(mktemp -d /tmp/notes-recovery.XXXXXX)
pg_basebackup --dbname='service=notes_source_replication' \
  --pgdata="$task_recovery_dir/base" --format=plain --wal-method=stream
pg_verifybackup "$task_recovery_dir/base"
```

pg_basebackup covers the whole cluster. The replication service must refer to this same source cluster, with an authorized replication role. WAL streaming normally needs two replication connections. --checkpoint=fast was used only to keep the tiny local rehearsal short; it can add I/O pressure and is not a universal production default. Protect the base backup manifest along with its data. pg_verifybackup checks many file/WAL integrity problems but cannot prove every server/application recovery invariant. Still start a clone and inspect data.

Create markers in the source to distinguish base-only recovery from successful WAL replay. Run each statement with error stopping; the accepted insert must commit before creating the restore point. The destructive statements below belong only to the isolated fixture.

```sql
-- Before taking the base backup:
CREATE TABLE recovery_markers(id integer PRIMARY KEY, label text NOT NULL);
INSERT INTO recovery_markers VALUES (1, 'before_basebackup');
-- Take and verify the base backup, then commit this later change:
INSERT INTO recovery_markers VALUES (2, 'accepted_after_backup');
SELECT pg_create_restore_point('before_accidental_delete');
-- Simulate the incident only in this disposable source:
DELETE FROM recovery_markers;
INSERT INTO recovery_markers VALUES (3, 'corrupt_after_point');
SELECT pg_walfile_name(pg_current_wal_lsn()) AS segment_to_confirm_archived;
SELECT pg_switch_wal();
```

Before recovery, confirm the required segment and all preceding required WAL are archived and readable. pg_switch_wal requests a switch, not confirmation that remote archiving has finished. Poll archive status with a deadline; do not sleep an arbitrary second and assume success. Keep the unmodified base backup, copy it to a new empty recovery directory and preserve ownership/modes. Do not overlay a live data directory. Review inherited connection/archive settings so the clone cannot contact or archive into a production topology.

```bash
test ! -e "$task_recovery_dir/recovered"
cp -R "$task_recovery_dir/base" "$task_recovery_dir/recovered"
mkdir -m 700 "$task_recovery_dir/socket"
```

For the PostgreSQL16 clone, create recovery.signal and set these reviewed recovery options in postgresql.auto.conf or the appropriate clone configuration:

```text
restore_command = 'cp /tmp/notes-recovery/archive/%f %p'
recovery_target_name = 'before_accidental_delete'
recovery_target_action = 'promote'
```

Use the actual archive path. restore_command must return failure for an unavailable file and must not manufacture an empty “successful” WAL segment. Missing optional timeline-history requests can appear during normal recovery; distinguish them from a missing required WAL segment by the recovery logs and actual target reachability. Never remove backup_label or fake success just to make startup continue.

```bash
# These paths/port belong to this run and its private socket directory.
# The recovered directory is a new copy of base, not the base artifact itself.
touch "$task_recovery_dir/recovered/recovery.signal"
pg_ctl -D "$task_recovery_dir/recovered" \
  -l "$task_recovery_dir/recovered.log" \
  -o "-k $task_recovery_dir/socket -h '' -p 55493 -c archive_mode=off" -w start
```

The clone has no TCP listener in this local fixture. Its private socket directory must already exist and be accessible only to the owner; use a distinct port/path from the source. The recovery options must already have been installed before starting. archive_mode=off prevents this promoted demonstration clone from writing into the source's archive; real cutover needs an explicit new timeline/archive strategy.

Do not treat pg_ctl -w returning as proof that the recovery target was reached. The server may first accept read-only connections during recovery. With the deliberately selected promote action, poll pg_is_in_recovery until false with a bounded deadline, inspect logs for the named target, and verify the data before permitting writes or traffic. In production a pause action can support inspection before a separately authorized promotion; define that decision in the incident runbook. If a target cannot be reached, fail the rehearsal rather than silently restore to some other time.

Expected recovered rows are IDs1 and2, with their original labels; ID3 must be absent. This proves replay recovered a committed post-base-backup insert and stopped before the bad change. Merely seeing ID1 would only prove a base backup could start. A timestamp/LSN/transaction target is an alternative to a named restore point, with its own inclusivity/timeline selection rules. Choose it from incident evidence and verify business effects, not from an approximate wall-clock guess.

## Protect and retain the recovery chain

Store encrypted backups and WAL in a separate failure/security boundary, with integrity verification, tightly scoped access, tested key recovery and suitable immutability/versioning. Separate backup administration from ordinary app write permissions. Protect database configuration, extension binaries, TLS material and deployment metadata needed to rebuild the service; do not assume the database archive contains the whole application.

Define base-backup cadence, WAL archival lag target, retention periods, restore-test frequency and alert ownership. Retention must preserve every base backup plus the continuous WAL needed for the supported recovery window and desired timelines. A recent successful base does not justify deleting all older WAL while an older retained base is still part of the policy. Monitor actual restore tests and missing/corrupt artifacts, not only the last successful upload time. Managed database PITR can own much of the machinery, but you still own target selection, permissions, application validation and rehearsed cutover.

Example product policy, to negotiate rather than assume: RPO at most5 minutes; service RTO at most60 minutes; encrypted daily bases plus continuous archived WAL;30-day recovery window; monthly isolated restore and quarterly timed incident rehearsal. These are illustrative goals, not measured guarantees or legal retention advice. Compare measured archive lag and full service recovery with them. If the recovery window or staffing cannot meet the targets, record that gap and change the system/policy deliberately.

## Incident runbook and learner exercise

1. Stop/contain harmful writers and detached consumers; preserve incident evidence. Identify the last known correct business state and source system/timeline.
2. Select a verified base and the required WAL/keys/config. Provision an isolated compatible target with sufficient disk and connection limits.
3. Restore/replay to the chosen target. Confirm target completion, data invariants, schema/app compatibility, grants and sanitized app smoke tests.
4. Reconcile accepted operations after the selected target: payments/messages/object storage may have advanced independently. Do not blindly replay non-idempotent side effects.
5. Decide cutover, write ownership, connection-string/secrets changes and worker release. Fence the old writer to prevent split-brain. Observe errors/latency and retain an explicit rollback/fallback plan.
6. Record actual lost accepted work and elapsed full recovery time. Retain the safe evidence, then stop/remove only owned rehearsal resources under the retention policy.

**Acceptance:** perform both logical restore into a fresh database and physical PITR into a separate clone. Verify marker values, not only counts; keep a safe command/version/target/timing record. Prove manifest verification rejects a deliberately corrupted copied artifact, and a missing required WAL file makes the intended recovery fail rather than count as success. Use fresh disposable copies for negative tests; preserve the original good artifact. Restore with intended app permissions and verify constraints, sequence-backed inserts and a representative API read/write. Keep production external effects disabled. Stop both owned clusters in finally/trap cleanup even on failure; never use broad path deletion or stop an existing server by guessed port.

Teacher validation on2026-10-21 used PostgreSQL16.13, private Unix sockets, two fresh local clusters and synthetic markers. Base backup plus verification took0.491s, logical restore plus marker check0.034s, and PITR startup/promotion plus marker check0.487s in that tiny fixture. Both expected markers survived, the corrupt marker was excluded, and both clusters stopped. This excludes provisioning, remote transfer, encryption, production volume, application traffic and human response; it is not a production RPO/RTO measurement or learner completion. A second teacher run also rejected a corrupted copied PG_VERSION file during manifest verification and failed recovery when the required WAL segment was omitted from a separate archive copy; the intended target was not reported as reached. Full app-role/API rehearsal, remote artifact/key recovery and learner execution remain required.

References checked2026-10-21: [PostgreSQL16 SQL dumps](https://www.postgresql.org/docs/16/backup-dump.html), [pg_restore and trust/ownership](https://www.postgresql.org/docs/16/app-pgrestore.html), [continuous archiving/PITR](https://www.postgresql.org/docs/16/continuous-archiving.html), [pg_basebackup](https://www.postgresql.org/docs/16/app-pgbasebackup.html), [pg_verifybackup limits](https://www.postgresql.org/docs/16/app-pgverifybackup.html), [recovery targets/actions](https://www.postgresql.org/docs/16/runtime-config-wal.html#RUNTIME-CONFIG-WAL-RECOVERY-TARGET).
