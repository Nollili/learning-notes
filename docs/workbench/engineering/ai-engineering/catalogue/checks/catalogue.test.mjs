import test from 'node:test';
import assert from 'node:assert/strict';
import { listNotes, sortNotes } from '../build/catalogue.js';

const notes = Object.freeze([
  Object.freeze({ id: 'z', title: 'Zebra' }),
  Object.freeze({ id: 'b', title: 'API' }),
  Object.freeze({ id: 'a', title: 'API' })
]);
test('sorting preserves the caller and has an explicit ID tie break', () => {
  assert.deepEqual(sortNotes(notes).map(note => note.id), ['a', 'b', 'z']);
  assert.deepEqual(notes.map(note => note.id), ['z', 'b', 'a']);
});
test('feature trims and case-normalizes the query, then sorts before limiting', () => {
  assert.deepEqual(listNotes(notes, { query: ' api ', limit: 1 }).map(note => note.id), ['a']);
  assert.deepEqual(listNotes(notes, { query: 'missing' }), []);
});
test('zero is preserved and invalid runtime options fail', () => {
  assert.deepEqual(listNotes(notes, { limit: 0 }), []);
  for (const limit of [-1, 1.5, NaN, 51, null, '1']) assert.throws(() => listNotes(notes, { limit }));
  assert.throws(() => listNotes(notes, { query: 3 }));
});
test('empty input and default ten-item bound are predictable', () => {
  assert.deepEqual(listNotes([]), []);
  assert.equal(listNotes(Array.from({ length: 12 }, (_, i) => ({ id: String(i), title: 'Note' }))).length, 10);
});
