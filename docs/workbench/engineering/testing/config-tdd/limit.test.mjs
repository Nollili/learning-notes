import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parseLimit,readPageLimit} from './limit.mjs';
test('missing limit uses documented default', () => assert.equal(parseLimit(undefined), 20));
test('accepts both inclusive boundaries', () => {
  assert.equal(parseLimit('1'), 1); assert.equal(parseLimit('50'), 50);
});
test('rejects invalid range and wrong types without coercion', () => {
  for (const raw of ['0', '51', '-1', 20, null, [], {}]) assert.throws(() => parseLimit(raw), RangeError);
});
test('rejects partial numbers, whitespace, decimals and leading zeros', () => {
  for (const raw of ['20junk', ' 20', '20 ', '20\n', '2.0', '01', '']) assert.throws(() => parseLimit(raw), RangeError);
});
test('reads an owned config file and awaits cleanup', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'limit-fixture-'));
  t.after(() => rm(directory, {recursive: true, force: true}));
  const file = join(directory, 'config.json');
  await writeFile(file, JSON.stringify({limit: '7'}));
  assert.equal(await readPageLimit(file), 7);
});
test('awaits the injected loader and rejects invalid config shapes', async () => {
  let resolve;
  const pending = new Promise(r => {resolve = r;});
  let called = false;
  const result = readPageLimit('owned.json', async (file, encoding) => {
    assert.equal(file, 'owned.json'); assert.equal(encoding, 'utf8'); called = true;
    return pending;
  });
  assert.equal(called, true); resolve('{"limit":"3"}'); assert.equal(await result, 3);
  for (const text of ['null', '[]', '"text"']) await assert.rejects(() => readPageLimit('x', async () => text), TypeError);
});
test('preserves a storage failure without pretending a default succeeded', async () => {
  const failure = new Error('owned fixture error');
  await assert.rejects(() => readPageLimit('x', async () => {throw failure;}), error => error === failure);
});
test('rejects malformed JSON', async () => {
  await assert.rejects(() => readPageLimit('x', async () => '{'), SyntaxError);
});
