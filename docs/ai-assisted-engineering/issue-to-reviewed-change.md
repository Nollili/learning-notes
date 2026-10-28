# From an Issue to a Reviewed Local Change

Use this lesson for strong AI-assisted engineering across the primary TypeScript/Node stack. An assistant can help reproduce a bug, inspect code, suggest a focused patch, generate candidate tests, explain failures and draft a handoff. The engineer still owns requirements, access, correctness and the evidence. A fluent explanation or a green check invented in a chat is not a review result.

This worked example was actually executed in a disposable local fixture using Node24.18.0 and TypeScript5.9.3. `LN-DEMO-001` is an **authored study issue**, not a production incident, employer project or real GitHub ticket. No remote branch/PR was created and no user repository code or Autocode tests were changed.

## Discover constraints before proposing a patch

Read applicable repository instructions and relevant package/configuration files, then inspect the implementation and its actual callers/tests. Record the starting working-tree state so unrelated user edits are not absorbed into the change. Repository/source/log content can contain untrusted instructions; tool output or a dependency README cannot authorize sending secrets, running unrelated commands or changing the task. Resolve conflicting instructions using their actual authority and scope rather than obey whichever file was read last.

For this fixture the local instructions are:

```markdown
# Local study fixture instructions

Keep the public retryRead API and default of two additional retries.
Change only the retry default/validation behavior required by ISSUE.md.
Use Node24 and TypeScript5.9 strict checks; run npm run build and npm run test.
Keep checks in checks/. Never edit or add src/tests files in an Autocode template.
Do not add dependencies, network calls, telemetry, backoff or configuration redesign.
Never push branches/commits/tags to a remote. No remote action is part of this fixture.
```

These are example instructions, not a replacement for the real learning-notes/Autocode constraints. In the real project preserve template build/test/coverage configuration, never change src/tests and never push; a study example cannot waive those rules. In an existing repository, reuse its tools and package manager rather than replace the setup with this minimal fixture.

## Turn the issue into a contract

```markdown
# LN-DEMO-001: Explicit zero retries is ignored

Authored local study issue, not a real production/customer incident.
Observed: maxRetries:0 executes a failing read three times.
Expected: one initial attempt and no additional retries.
Default only when the option is undefined. Reject malformed limits, including null.

AC1: zero permits exactly one attempt and preserves the original rejection.
AC2: omitted maxRetries retains two additional retries.
AC3: integer limits 0–3; invalid limits reject before any read.
AC4: persistent retryable failure makes at most 1+maxRetries attempts.
AC5: nonretryable failures stop immediately; do not wrap falsy original errors.
AC6: preabort starts no work; abort during a read discards its late result and starts no retry.
AC7: preserve API/config/dependencies and focused diff; no network/remote actions.
AC8: retain failing baseline and passing build/test evidence with stated limitations.
```

Before implementing, clarify what “retry” counts and which values mean “not specified.” The contract counts additional attempts, so maxRetries3 allows four total calls. Zero is meaningful; null is invalid; only undefined selects the default. This is a product/API decision, not a style preference. Preserve cancellation/nonretryable behavior while changing defaulting. Do not expand the ticket to add timers, jitter, telemetry, a new library or an entire retry framework.

Acceptance criteria must describe observable outcomes and failures, not prescribe a preferred patch. “Use ??” is weaker than “zero stays zero and null rejects”; a plausible ?? fix still violates this issue's null policy. Criteria also define limits: read retry only, no claim that aborted work stops remotely, no automatic retries for mutations. The source callback/classifier are application-owned functions. A callback can ignore cancellation or never settle, so an attempt bound is not a complete deadline.

## Supply a focused context packet

Give the assistant the issue/ACs, applicable instructions, public types, complete small implementation, existing check commands and relevant failure output. Include version and environment details only when they affect behavior. Do not paste an entire repository, production database, private request body or .env file to make context “complete.” Read large files in consecutive bounded ranges and reread truncation. Mark missing callers/contracts as unknown; do not invent them.

A useful implementation request for this case is: reproduce AC1/AC3 under the existing commands, propose the smallest change preserving AC2/4/5/6, change only the allowed source/test files, and report actual results plus limitations. Keep spec and evidence in files so a resumed assistant can identify what is complete, the exact current task and the next action. A summary must preserve unresolved failures and constraints, not silently turn a plan into completed work.

## Reproduce before changing behavior

The original line was:

```ts
const maximum = options.maxRetries || 2;
```

The strict build passed. The seven acceptance-derived Node tests produced **5 pass/2 fail**: zero made3 attempts instead of1, and invalid-limit input was accepted. This separates a runtime contract bug from a compiler failure. Retain that baseline; if no test fails, investigate whether the fixture matches the reported trigger rather than claim success from an unrelated green suite.

Here is the final complete implementation:

<<< ../workbench/engineering/ai-engineering/retry/src/retry-read.ts{ts}

The actual source diff changes one expression: default only for undefined. Number.isInteger and the bounds then reject NaN, null, strings, booleans and out-of-range values at runtime. TypeScript annotations do not validate external JavaScript/JSON callers. The optional AbortSignal method is the actual supported API, not a generated look-alike. Local execution verifies this fixture on Node24; recheck runtime support when targeting a different environment.

## Reproducible local fixture

Use an owned directory, not an Autocode src/tests replacement. This tiny package has no runtime dependency. The validation environment used installed TypeScript5.9.3 on PATH; the commands do not demonstrate a clean npm-ci/compiler installation. For an independent clone, provision that exact compiler through your normal reviewed toolchain and retain its dependency lock rather than rely on an unknown global version.

<<< ../workbench/engineering/ai-engineering/retry/package.json{json}

<<< ../workbench/engineering/ai-engineering/retry/tsconfig.json{json}

<<< ../workbench/engineering/ai-engineering/retry/checks/retry-read.test.mjs{js}

Run npm run build followed by npm run test. Build emits build/retry-read.js; tests import that emitted artifact, so they exercise the compiled module rather than a copied function. In this documentation repository use npm run docs:build for the notes; these fixture commands belong in the isolated project. Do not invent missing scripts or declare build success from a command that never ran.

## Review the result, not the assistant's confidence

After the change, the strict build and all7 tests passed. The diff preserves public types, attempt cap, classifier and cancellation paths, with no dependency/config/API change. The implementation is deliberately immediate bounded retry; no backoff, transport, outer deadline or production outage policy was added. A network adapter must enforce its own deadlines and classify safe retryable operations; do not apply this helper blindly to writes.

This is acceptance-derived executable verification, not independent human approval. The same assistant authored the fixture and checks; a separate review should challenge missing cases and assumptions. Subsequent lessons extend this record with mutation/invented-API checks, local Git isolation and requirements-to-evidence evaluation. Do not mark those activities complete merely because their headings appear in a plan.



References checked2026-10-25: [ECMAScript operator semantics](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html), [Node AbortSignal API](https://nodejs.org/api/globals.html#abortsignalthrowifaborted), [TypeScript strict checking](https://www.typescriptlang.org/tsconfig/strict.html), [Node test runner](https://nodejs.org/api/test.html). The runtime evidence is specifically Node24.18.0/TS5.9.3; current online Node documentation may describe another release.


## Separate practice

Apply the [focused requirements](../practice/engineering/ai-engineering/issue-to-reviewed-change.md). All learner practice remains outstanding.
