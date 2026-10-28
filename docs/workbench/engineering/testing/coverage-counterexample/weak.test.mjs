// weak.test.mjs
import {test} from 'node:test';
import {add} from './arithmetic.mjs';
test('only executes the function', () => { add(2, 3); });
