# TypeScript: proofs inside validated boundaries

Prerequisites: JavaScript values, functions, objects, modules and promises. Worked compiler baseline: **TypeScript 5.9.3**, not a claim to cover every later release. Runtime validation and server authorization remain separate obligations.

## Reading order

1. [Erased types and execution](../senior_growth/TypeScript/What_is_TS.md).
2. [Structural types, unknown and readonly](../senior_growth/TypeScript/What_are_the_different_types_of_TypeScript_%28Built-in_%26_User-defined%29.md).
3. [Strict null and property presence](../senior_growth/TypeScript/What_%22Strict_NULL_check_mode%22_means.md).
4. [Discriminated unions and never](../senior_growth/TypeScript/Explain_the_purpose_of_the_%22never%22_type_in_TypeScript_How_it's_different_from_%22void%22.md).
5. [Generics and related key/value contracts](../senior_growth/TypeScript/Generics.md); conditional/distributive typing is optional after the core examples.
6. [Migration and truthful declarations](../senior_growth/TypeScript/How_would_you_introduce_TS_on_a_project.md), then [target, APIs and older browsers](../senior_growth/TypeScript/Can_we_write_code_in_TS_if_we_would_like_to_support_older_browsers.md).

## Narrow from evidence

Start external data at unknown. Narrow using discriminants and checks that establish the actual shape; a user-written type predicate is a promise the compiler trusts, so an incomplete guard can lie. A cast and the non-null assertion emit no validator. Parsing must also enforce domain limits, duplicate IDs, ownership/scope and allowed fields where relevant.

Use a state union such as idle/loading/ready/failed instead of optional fields plus unrelated booleans. An exhaustive switch assigns the remaining value to never; adding a variant should fail until every consumer handles it. An empty ready list is valid data, not a transport error.

| Option or type | Benefit | Boundary |
|---|---|---|
| strict | Includes null, function and implicit-any checks | Does not include every stricter compiler flag |
| noUncheckedIndexedAccess | Indexed lookup may be undefined | Runtime index/array still needs validation |
| exactOptionalPropertyTypes | Absence differs from explicit undefined | JSON drops undefined object properties |
| readonly / Readonly | Restricts writes through this reference | Shallow and erased; aliases may mutate |
| unknown | Requires narrowing before use | Does not itself validate input |

A generic preserves a relationship: `getField<T, K extends keyof T>(value: T, key: K): T[K]`. It does not manufacture arbitrary T from JSON. Prefer a parser argument that returns the type it actually validates. Keep a simple union when a generic/overload adds no useful relation.

## Compiler, bundler and runtime are separate

Choose module resolution to match the actual host: bundler mode for a bundler-owned browser app; NodeNext for a Node ESM package with its package.json and emitted import rules. target changes emitted syntax; lib describes assumed APIs; neither installs a Promise/fetch polyfill. Type-only imports erase; a runtime import can still add a client dependency or cross a server-only boundary.

The retained [P-330 boundary starter](../workbench/frontend/typescript/boundary.md#runtime-contracts) and [companion check](../workbench/frontend/typescript/boundary.md#companion-check) remain at their existing URLs. They are small starter assets, not a complete HTTP application. Substantial new reference collections belong in [the workbench](../workbench/frontend/).

Official references checked 2026-10-27: [narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html), [strict options](https://www.typescriptlang.org/tsconfig/strict.html), [module-resolution guidance](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html). Apply [F04](../practice/frontend/f04-typescript.md), separately recording compile and runtime evidence.
