import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const build = process.env.NODE_RUNTIME_BUILD;
if (!build || !path.isAbsolute(build)) throw new Error('Set NODE_RUNTIME_BUILD to the absolute compiled directory');
const load = name => import(pathToFileURL(path.join(build, name)));
const { mapWithConcurrency } = await load('limiter.js');
const { runWorker } = await load('worker.js');
const { jsonLines } = await load('json-lines.js');
const { runChild } = await load('child.js');
const gate = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

// A falsy rejection must stop queued work and wait for the already active mapper.
const fail = gate(); const drain = gate(); const aborted = gate();
const started = []; let settled = false;
const batch = mapWithConcurrency([0, 1, 2, 3], 2, async (item, signal) => {
  started.push(item);
  if (item === 0) { await fail.promise; throw undefined; }
  signal.addEventListener('abort', () => aborted.resolve(), { once: true });
  await drain.promise;
  return item;
});
const outcome = batch.then(() => ({ ok: true }), error => ({ ok: false, error }));
void outcome.then(() => { settled = true; });
fail.resolve(); await aborted.promise;
assert.deepEqual(started, [0, 1]); assert.equal(settled, false);
drain.resolve(); assert.deepEqual(await outcome, { ok: false, error: undefined });
assert.deepEqual(await mapWithConcurrency([], 1, async x => x), []);
await assert.rejects(mapWithConcurrency(new Array(2), 1, async x => x), /Dense/);
let calls = 0;
await assert.rejects(mapWithConcurrency([1, 2], 1, async () => { calls++; }, undefined, 1), /budget/);
assert.equal(calls, 0);
const pre = new AbortController(); pre.abort(new Error('preabort'));
await assert.rejects(mapWithConcurrency([1], 1, async () => { calls++; }, pre.signal), /preabort/);
assert.equal(calls, 0);

// The parser must preserve byte framing across every split in a multibyte record.
async function parse(chunks, options = {}) {
  const rows = [];
  const source = Readable.from(chunks);
  const sink = new Writable({ objectMode: true, highWaterMark: 1,
    write(value, _encoding, callback) { rows.push(value); setImmediate(callback); } });
  await pipeline(source, jsonLines(options), sink);
  return rows;
}
const bytes = Buffer.from('{"text":"€"}\r\n{"ok":true}');
for (let i = 1; i < bytes.length; i++) {
  assert.deepEqual(await parse([bytes.subarray(0, i), bytes.subarray(i)]), [{ text: '€' }, { ok: true }]);
}
await assert.rejects(parse([Buffer.from('null\n{"ok":true}\n')]), /object record/);
await assert.rejects(parse([Buffer.from([0xff, 10])]), /UTF-8/);
await assert.rejects(parse([Buffer.from('{}\n{}\n')], { maxRecords: 1 }), /count/);
await assert.rejects(parse([Buffer.from('{"long":1}\n')], { maxRecordBytes: 4 }), /too large/);
await assert.rejects(parse([Buffer.from('{}\n')], { maxChunkBytes: 2 }), /chunk/);
let released = false;
async function* source() { try { yield Buffer.from('{}\n{}\n'); } finally { released = true; } }
await assert.rejects(pipeline(source(), jsonLines(), new Writable({ objectMode: true,
  write(_value, _enc, cb) { cb(new Error('destination failed')); } })), /destination failed/);
assert.equal(released, true);

// Real worker protocols: exit without a result, bad result and a live post-result timer.
const script = code => new URL('data:text/javascript,' + encodeURIComponent(code));
const number = value => { if (typeof value !== 'number') throw new TypeError('bad result'); return value; };
assert.equal(await runWorker(script("import {parentPort} from 'node:worker_threads'; parentPort.postMessage(42); setInterval(()=>{},1000)"), null, number), 42);
await assert.rejects(runWorker(script(''), null, number), /without a result/);
await assert.rejects(runWorker(script("import {parentPort} from 'node:worker_threads'; parentPort.postMessage('bad')"), null, number), /bad result/);
await assert.rejects(runWorker(script('setInterval(()=>{},1000)'), null, number, { timeoutMs: 50 }), /deadline/);
await assert.rejects(runWorker(script(''), null, number, { signal: pre.signal }), /preabort/);

await runChild(process.execPath, ['-e', ''], AbortSignal.timeout(2000));
await assert.rejects(runChild(process.execPath, ['-e', 'process.exitCode=7'], AbortSignal.timeout(2000)), /code=7/);
await assert.rejects(runChild('/definitely-missing-node-workbench-executable', [], AbortSignal.timeout(2000)), /ENOENT/);
await assert.rejects(runChild(process.execPath, ['-e', 'setInterval(()=>{},1000)'], AbortSignal.timeout(100)), { name: 'AbortError' });
await assert.rejects(runChild('/must-not-start', [], pre.signal), /preabort/);
console.log('Runtime reference checks passed: limiter failure/drain, framed UTF-8, worker lifecycle, child closure.');
