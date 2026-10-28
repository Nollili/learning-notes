# Validated boundary starter

Retained P-330 starter files are included from their original source locations. This rendered page makes the examples accessible on the built site; it does not relocate or complete the practice.

## Runtime contracts

<<< ../../../practice/frontend-lab/contracts.ts{ts}

## Companion check

<<< ../../../practice/frontend-lab/check.ts{ts}

Copy both into an isolated ESM package with Zod 4.6.7, TypeScript 5.9.3 and Node types. Enable strict, noUncheckedIndexedAccess and exactOptionalPropertyTypes, compile, then run emitted check.js. These checks validate URL/JSON/type contracts, not a real authenticated HTTP application. Apply [F04](../../../practice/frontend/f04-typescript.md).
