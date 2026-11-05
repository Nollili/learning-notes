---
outline: [2, 3]
---

# Advanced APIs and framework decisions

This page extends the [framework chapter](./16-frameworks.md) with failure and measurement depth for the supplied ladder's Level 4 API/framework categories. It retains the original owners for process, filesystem, crypto, cluster and streams; it is not a new numbered topic group. Express5.1.0/Node24 is primary, with a NestJS companion. Performance and security decisions depend on a stated workload and threat model.

## How do process and cluster owners handle failure beyond a happy-path reply? {#t16-q14}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Define admission, readiness, protocol completion, drain, forced-stop and recovery separately. **A result message, IPC disconnect and actual process closure are different events.** Scaling processes also multiplies resource pools and failure owners.

</div>

The [completed concurrency chapter](./09-concurrency.md#t09-q05) owns the runnable cluster service and [bounded fork session](./09-concurrency.md#t09-q07). Reuse those implementations rather than creating another process wrapper here. Their real checks include shared listening endpoint, separate process memory, repeated correlated messages, wrong/duplicate reply, deadline, graceful stop and fail-closed worker loss.

For an application review, state which contract each wrapper promises: validated result plus natural exit, or validated result plus awaited forced termination. A reply can arrive before a later crash; resolve early only if that is the documented business contract. Forced termination cannot roll back a database commit or guarantee every child finally block ran. A lost IPC response can leave an effect uncertain and require a durable operation receipt.

Do not accept executable paths, environment, Node flags or shell snippets from a request. Use fixed modules/arguments, minimal inherited authority and owned stdio. `execFile`/`spawn` without a shell avoids one interpretation layer; argument injection into the target program can still matter. Fork/cluster processes are not hostile-code sandboxes. See [isolation limits](./14-security.md#t14-q08).

A restart policy needs bounded backoff, a crash budget and an operational owner. Repeatedly replacing a worker that deterministically fails the same job creates a crash loop. Readiness belongs to the required capability, not merely the worker's online event. During shutdown, stop admission before draining accepted tasks and allow an external supervisor to enforce the final process-tree deadline. A platform replica with its own CPU pool/DB pool needs an aggregate capacity budget.

<span class="notes-section-label">**Practice and acceptance**</span>

Run the existing cluster/fork fixtures and add an API-level scenario: lose a worker after an operation commits but before its reply. Accept with a pending/reconciled operation contract, no blind duplicate mutation, bounded restart/drain and proof of actual owned-process closure. Windows/process-tree behavior needs its own platform evidence. References: [Node24 child processes](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html), [cluster lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/cluster.html).

---

## How do you publish a file without exposing partial content or overwriting an existing result? {#t16-q15}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Write a private temporary file, finish/sync/close it, then publish through an operation matching the filesystem contract. Track ownership and whether publication already happened. **Atomic visibility, overwrite policy and crash durability are separate properties.**

</div>

An `exists` check followed by writing races another caller. `open(...,'wx')` prevents replacing an existing name, but writing directly to that final path can expose partial content. A temporary-file rename can publish atomically on supported same-filesystem paths but normally replaces an existing target. The fixture below instead uses a same-filesystem hard link for no-replace publication in an owned private directory.

```js [publish-owned-file.mjs]
import assert from 'node:assert/strict';
import { mkdtemp, open, link, unlink, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

async function publish(directory, name, bytes) {
  if (
    typeof name !== 'string' ||
    !/^[a-z0-9-]{1,40}\.txt$/.test(name) ||
    !Buffer.isBuffer(bytes) ||
    bytes.length > 1024 * 1024
  )
    throw new TypeError('invalid output');
  const content = Buffer.from(bytes); // own the accepted bytes before asynchronous work
  const temporary = join(directory, `.owned-${randomUUID()}`),
    target = join(directory, name);
  let handle,
    ownedTemporary = false,
    published = false;
  const errors = [];
  try {
    handle = await open(temporary, 'wx', 0o600);
    ownedTemporary = true;
    await handle.writeFile(content);
    await handle.sync();
    await handle.close();
    handle = undefined;
    await link(temporary, target);
    published = true;
  } catch (error) {
    errors.push(error);
  }
  if (handle) {
    try {
      await handle.close();
    } catch (error) {
      errors.push(error);
    }
  }
  if (ownedTemporary) {
    try {
      await unlink(temporary);
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length) {
    const error = new AggregateError(
      errors,
      published ? 'published; cleanup failed' : 'publication failed',
    );
    error.published = published;
    throw error;
  }
  return target;
}
const directory = await mkdtemp(join(tmpdir(), 'notes-publish-'));
try {
  const target = await publish(directory, 'report.txt', Buffer.from('complete\n'));
  assert.equal(await readFile(target, 'utf8'), 'complete\n');
  await assert.rejects(
    publish(directory, 'report.txt', Buffer.from('replacement')),
    (error) =>
      error.published === false && error.errors.some((e) => e.code === 'EEXIST'),
  );
  assert.equal(await readFile(target, 'utf8'), 'complete\n');
  await assert.rejects(publish(directory, '../escape.txt', Buffer.from('bad')));
  const input = Buffer.from('snapshot');
  const pending = publish(directory, 'copy.txt', input);
  input.fill(120);
  assert.equal(await readFile(await pending, 'utf8'), 'snapshot');
  const races = await Promise.allSettled([
    publish(directory, 'race.txt', Buffer.from('a')),
    publish(directory, 'race.txt', Buffer.from('b')),
  ]);
  assert.equal(races.filter((r) => r.status === 'fulfilled').length, 1);
  assert(['a', 'b'].includes(await readFile(join(directory, 'race.txt'), 'utf8')));
} finally {
  await rm(directory, { recursive: true, force: true });
}
```

Only use this helper with a trusted private directory owned by the application and no attacker-controlled symlink/directory mutation. Name validation alone cannot make an arbitrary shared directory safe. The fixture does not provide cross-filesystem, network-filesystem or Windows guarantees; hard-link support/permissions must be verified. It syncs file data but not the directory entry, so it does not claim full power-loss durability. Production may need directory sync, a platform-specific protocol or an object-store conditional operation.

Cleanup failure after publication is a committed-but-cleanup-failed outcome. Do not tell a retrying caller that no file exists or delete a previously existing target. Retention/reconciliation should remove only owned temporary files under a defined policy. For sensitive uploads, size/type/content validation, malware handling and access control are additional boundaries.

<span class="notes-section-label">**Practice and acceptance**</span>

Test competing publication, pre-existing target, invalid name, write/sync/link/cleanup failures and process crash at phase boundaries in a disposable directory. Accept when partial bytes never appear under the final name, prior output survives, no unowned file is deleted and durability limits are explicit. Reference: [Node24 file APIs](https://nodejs.org/download/release/v24.18.0/docs/api/fs.html), [security boundary review](./14-security.md).

---

## How do you stream bounded results while owning errors and cancellation? {#t16-q16}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Connect owned stages through `pipeline`, respect backpressure and bound bytes/work in the relevant representation. Validate before publishing a response whose headers cannot be retracted. **Stopping a caller's wait is not cancellation of the source or sink.**

</div>

This fixture streams bounded JSON Lines through a deliberately asynchronous sink and returns data only after successful completion. It collects a maximum of a few KiB for the demonstration; a real large export writes to an authorized response/file/object destination without buffering the entire result.

```js [bounded-export.mjs]
import assert from 'node:assert/strict';
import { Readable, Transform, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
async function exportRows(rows, { signal, maxBytes = 4096 } = {}) {
  if (
    !Array.isArray(rows) ||
    rows.length > 1000 ||
    !Number.isSafeInteger(maxBytes) ||
    maxBytes < 1 ||
    maxBytes > 65536
  ) {
    throw new TypeError('invalid export budget');
  }
  const snapshot = rows.map((row) => {
    if (
      !row ||
      !Number.isSafeInteger(row.id) ||
      row.id < 1 ||
      typeof row.name !== 'string' ||
      row.name.length > 80
    ) {
      throw new TypeError('invalid row');
    }
    return { id: row.id, name: row.name };
  });
  const output = [];
  let bytes = 0;
  async function* source() {
    for (const row of snapshot) {
      signal?.throwIfAborted();
      yield Buffer.from(JSON.stringify(row) + '\n');
    }
  }
  const limit = new Transform({
    transform(chunk, encoding, done) {
      bytes += chunk.length;
      done(bytes > maxBytes ? new Error('export byte limit') : null, chunk);
    },
  });
  const sink = new Writable({
    highWaterMark: 1,
    write(chunk, encoding, done) {
      setImmediate(() => {
        if (!sink.destroyed) output.push(Buffer.from(chunk));
        done();
      });
    },
  });
  await pipeline(Readable.from(source(), { objectMode: false }), limit, sink, {
    signal,
  });
  return Buffer.concat(output).toString('utf8');
}
assert.equal(await exportRows([{ id: 1, name: 'Pen' }]), '{"id":1,"name":"Pen"}\n');
await assert.rejects(
  exportRows([{ id: 1, name: 'Pen' }], { maxBytes: 2 }),
  /byte limit/,
);
await assert.rejects(exportRows([{ id: 1, name: null }]), /invalid row/);
const stopped = new AbortController();
stopped.abort();
await assert.rejects(
  exportRows([{ id: 1, name: 'Pen' }], { signal: stopped.signal }),
);
```

A real adapter must stop its database cursor/request when destroyed, not merely expose a generic iterator that ignores cancellation while awaiting remote work. Memory bounds include per-stage high-water marks, one current chunk, source/driver prefetch and pending external work. A high-water mark is a flow-control threshold, not a universal hard heap limit; one oversized chunk can exceed it. Bound encoded/decompressed representations separately.

For HTTP streaming, once headers/body are sent, an error cannot become a fresh JSON500 response. Terminate the connection or use a documented framed terminal error/status channel. Define client disconnect handling and close only resources owned by that response. For resumable exports, persist a job/status/object and publish completion atomically under a durable operation ID.

<span class="notes-section-label">**Practice and acceptance**</span>

Test slow sink, source/transform/destination errors, oversize chunk, active abort and client disconnect with the real adapter. Accept with observed cursor/socket closure, bounded prefetch and no success or partial file publication after failure. The local fixture proves byte/validation/pre-abort behavior, not remote cancellation. References: [Node pipeline/backpressure](https://nodejs.org/download/release/v24.18.0/docs/api/stream.html), [existing stream failure cases](./07-core-apis.md#t07-q09).

---

## How do cryptographic and streaming boundaries affect a service design? {#t16-q17}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Choose the primitive for the goal and authenticate all required context before trusting output. **Do not release unauthenticated decrypted chunks merely because update() produced bytes.** Key management and external-effect ownership remain part of the protocol.

</div>

Use the [worked AES-GCM envelope](./14-security.md#t14-q04) for confidentiality/integrity and the [existing HMAC lesson](./07-core-apis.md#t07-q11) for message authenticity. A plain SHA-256 digest detects changes only when its expected value comes from a trusted channel; it does not prove sender identity. Passwords require a password-hashing design, not either of those APIs.

With GCM, `decipher.update()` may yield plaintext before `final()` verifies the tag. A downstream database/file consumer must not act on those bytes early. For bounded messages, withhold the entire result until verification. For large objects, stage privately and publish only after successful authentication, or use a reviewed chunk-authenticated format with sequence/context/truncation protection. Do not invent a homegrown “tag per chunk” protocol without addressing replay, ordering, finality and nonce uniqueness.

Bind tenant/resource/version as authenticated context where the envelope contract requires it, but still perform current authorization. A legitimate ciphertext for tenant A does not grant tenant B permission to read it. Rotate keys with stored key IDs and an explicit decrypt/retention/re-encryption window. An unknown key ID must not trigger arbitrary file/network lookup.

Crypto APIs can also consume native worker-pool capacity. Bound password hashing/key derivation concurrency independently from HTTP admission and observe contention with other pool-backed work. Moving a call into another Promise does not remove its CPU/memory cost. Compare streaming transform choices with the [performance ownership notes](./12-performance-and-v8.md#t12-q04), keeping secrecy and failure semantics unchanged.

<span class="notes-section-label">**Practice and acceptance**</span>

Corrupt ciphertext/tag/AAD and truncate an owned encrypted object. Accept when authentication fails before any business consumer/publication, old/new key handling follows policy and every owned stage closes. Document that plaintext may exist in private staging and protect its lifecycle; unlink is not a guaranteed secure erase on every storage medium. References: [Node authenticated encryption](https://nodejs.org/download/release/v24.18.0/docs/api/crypto.html), [OWASP cryptographic storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).

---

## How do you measure a framework optimization without removing correctness? {#t16-q18}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Keep routing, validation, authorization and response contracts fixed; isolate one changed cost and compare repeated realistic requests. **Moving invariant work out of a request can help, but a service-work improvement is not proof that one framework is faster.**

</div>

The following Express5.1.0/Node24 experiment compares recomputing a fixed public metadata digest with computing it once. It uses an intentionally trivial loopback-only credential to check that both routes still pass the same guard; this is not a production authentication implementation. The client and server share one machine/process, so timings include client competition and are illustrative only.

```js [framework-experiment.mjs]
import assert from 'node:assert/strict';
import express from 'express';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
const app = express();
function metadata() {
  let digest = 'public-build-metadata';
  for (let i = 0; i < 1000; i++)
    digest = createHash('sha256').update(digest).digest('hex');
  return digest;
}
const cached = metadata();
app.use((req, res, next) => {
  if (req.headers.authorization !== 'Bearer owned-fixture')
    return res.sendStatus(401);
  next();
});
app.get('/baseline', (req, res) => res.json({ digest: metadata() }));
app.get('/candidate', (req, res) => res.json({ digest: cached }));
const server = app.listen(0, '127.0.0.1');
await new Promise((resolve, reject) => {
  server.once('listening', resolve);
  server.once('error', reject);
});
const base = 'http://127.0.0.1:' + server.address().port;
const samples = { baseline: [], candidate: [] };
async function request(mode, authorized = true) {
  const start = performance.now();
  const response = await fetch(`${base}/${mode}`, {
    headers: authorized ? { authorization: 'Bearer owned-fixture' } : {},
    signal: AbortSignal.timeout(3000),
  });
  if (!authorized) {
    assert.equal(response.status, 401);
    await response.text();
    return;
  }
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { digest: cached });
  return performance.now() - start;
}
try {
  for (const mode of ['baseline', 'candidate']) {
    await request(mode, false);
    for (let i = 0; i < 3; i++) await request(mode);
  }
  for (let round = 0; round < 12; round++) {
    for (const mode of round % 2
      ? ['candidate', 'baseline']
      : ['baseline', 'candidate']) {
      samples[mode].push(await request(mode));
    }
  }
  console.log({ samples });
} finally {
  await new Promise((resolve, reject) =>
    server.close((e) => (e ? reject(e) : resolve())),
  );
}
```

There is deliberately no “candidate must be faster” assertion. The fixed response and denial checks are deterministic; timing is observational. A real candidate must retain dependency/configuration invalidation, current permission checks and error handling. Cache only invariant metadata, not a permission-dependent response under one global key.

For Nest, keep the same experiment boundary through a service and guard. Singleton providers can hold immutable metadata; request-scoped dependencies incur per-request construction and need justification. Interceptors/pipes can repeat serialization/validation; profile them before removing them. Switching to a Fastify adapter can change middleware/plugins and lifecycle behavior; run contract/integration/negative tests before considering any benchmark win. You do not need mastery of every named framework.

A useful production comparison includes request mix, concurrency/arrival model, payload/dataset, warm-up, p50/p95/p99, errors, CPU/memory/loop delay, query count and repeated runs. Profile before/after and record the same artifact/runtime settings. Tie a rollout to business/health metrics and a compatible rollback, not just one average latency.

<span class="notes-section-label">**Practice and acceptance**</span>

Run the local experiment, then replace the synthetic work with one real measured application bottleneck. Accept with preserved guards/contracts, repeated evidence, resource/variance analysis and a documented cache/config lifetime. Keep an unfavorable result; an optimization attempt can be rejected. References: [Express performance](https://expressjs.com/en/advanced/best-practice-performance/), [Nest provider scopes](https://docs.nestjs.com/fundamentals/injection-scopes), [Nest performance](https://docs.nestjs.com/techniques/performance).

## Revision and mixed practice

1. A decrypting stream starts updating application records before the GCM tag is checked. Can pipeline error handling undo it?
2. A faster candidate skips the authorization guard and uses a global user-response cache. Is the performance comparison valid?

<span class="notes-section-label">**Answer guide — attempt both cases first**</span>

1. No. Withhold/stage untrusted plaintext and commit/publish only after authentication; prior irreversible effects need their own recovery and should not have happened.
2. No. The candidate changed security/correctness semantics. Restore equivalent behavior before comparing work and use appropriately scoped bounded caching.

These are learning-material extensions to existing source IDs and ladder checkpoints. Actual process/DB/cloud integration and independent performance/security practice remain separate evidence.
