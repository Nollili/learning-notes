// test/add.test.js — scratch lab only; never add to an Autocode src/tests directory
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { add } from '../src/add.js';
test('adds zero, positive and negative inputs', () => {
  assert.equal(add(0, 0), 0);
  assert.equal(add(2, 3), 5);
  assert.equal(add(-2, 1), -1);
});
