// strong.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {add} from './arithmetic.mjs';
test('adds the two operands', () => { assert.equal(add(2, 3), 5); });
