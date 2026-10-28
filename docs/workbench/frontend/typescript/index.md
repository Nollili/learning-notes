# TypeScript contract reference

`keyed-contract.ts` preserves key/value relationships with expected-negative compile cases. Compile with TypeScript 5.9.3, strict, noUncheckedIndexedAccess and exactOptionalPropertyTypes; do not treat expected-invalid calls as application runtime code.

The retained two-file [P-330 starter](./boundary.md#runtime-contracts) and [check](./boundary.md#companion-check) remain at their existing URLs. They need Zod 4.6.7 and matching Node/TypeScript types in an isolated ESM copy. [F04](../../../practice/frontend/f04-typescript.md) requires independent compile diagnostics and runtime evidence.
