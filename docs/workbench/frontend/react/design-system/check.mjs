import assert from 'node:assert/strict';
import {buildTokens,palette,themes} from './tokens.mjs';
assert.deepEqual(buildTokens(palette,themes),buildTokens(palette,themes));
const missing=structuredClone(themes);delete missing.dark.text;assert.throws(()=>buildTokens(palette,missing));
const unknown=structuredClone(themes);unknown.light.text='missing';assert.throws(()=>buildTokens(palette,unknown));
assert.throws(()=>buildTokens({...palette,ink:'not-a-color'},themes));
const result=buildTokens(palette,themes);assert.ok(result.css.includes('--action-bg: #173d70'));assert.ok(result.ts.includes('as const'));
console.log('Token determinism, missing key, unknown alias and invalid color passed; no contrast or rendered-theme claim.');
