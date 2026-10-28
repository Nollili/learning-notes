# F04 — Strict types and runtime validation

**Learner status: outstanding.**

## Prerequisites

F03; JS objects/functions. Reuse P-330 and the existing frontend-lab contracts.

## Scope

Compile a strict discriminated-state boundary from unknown JSON; use a generic key/value relation for an internal helper. Choose an explicit module/target/lib policy.

## Observable acceptance

Malformed/null/extra/duplicate/oversized/foreign-scope data never reaches ready state. All union cases are handled. Expected-invalid programs fail without broad casts or suppressions. Valid empty results remain distinct from failure.

## Failure cases

Add a new union variant, remove a guard, pass an incompatible key/value pair, omit an optional field and provide explicit undefined. Test actual runtime payloads independently of compile checks.

## Evidence to record

Retain compiler version/options/diagnostics and runtime assertions. A @ts-expect-error must be justified; remove it once to show the specific error. Compile target is not API polyfill evidence.

Return to [the sequence](./index.md) and [original P-328–P-330 specification](../frontend-project.md). Author verification never completes this stage.
