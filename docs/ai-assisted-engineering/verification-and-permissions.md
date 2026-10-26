# Verify Generated Changes and Limit Their Authority

Continue the [actual retry issue fixture](./issue-to-reviewed-change.md). The engineer reviews what changed and what ran, not whether the assistant sounds certain. This lesson covers secrets, generated-code review, invented APIs, scope control and independent verification dimensions. It does not represent a separate human review or a second independently reasoning agent.

## Review against the contract before style

Start with the issue's observable behavior, invariants and failure cases. Read the full actual diff and relevant surrounding code/callers. For LN-DEMO-001, inspect undefined/zero/null distinctions, additional-versus-total attempts, classifier behavior, original error identity, abort ordering, API/config/dependency changes and unbounded work. Ask whether the tests would fail if the defect returned. A suggested elegant patch can be wrong: ?? preserves0 but also defaults null, which the explicit issue forbids.

Review generated tests too. A test expecting3 attempts for maxRetries0 would enshrine the original bug while looking precise. Derive expected results from the agreed contract, not from the candidate implementation's output. Avoid snapshots that merely bless generated text or tests importing a copied function. The fixture imports the emitted module and checks call counts, exact rejection identity and no work on invalid/preaborted input. A passing suite can still omit an important caller or business requirement.

Read configuration and dependency diffs with the same care as source. A patch that weakens strictness, changes a test command to skip failures or deletes a failing test has not repaired the contract. Existing template/Autocode tests must remain untouched. Scope expansion is a separate decision: new backoff, jitter, framework, telemetry and API changes are outside this fixture even if they could be useful later. Record them as follow-up ideas rather than silently introduce them into the fix.

## Check APIs against the actual version

Generated names such as signal.throwIfAbortedNow() can resemble real APIs. Verify the installed declaration/signature, runtime version, official documentation and an actual invocation where useful. The real method is throwIfAborted(). A type assertion, any, ts-ignore or transpile-only mode could hide the mistake from the compiler; do not add those to make generated code pass. For external dependencies, inspect the installed/pinned version rather than assume the current website matches a historical project. Compiler success does not establish endpoint availability or runtime permission.

In this fixture TypeScript5.9.3 strict checking rejects the invented method with exit2. Three semantically wrong alternatives compile but fail runtime acceptance tests. This separation is useful evidence: declarations and executable behavior catch different failure classes. Official docs and local output must agree on the claim being made; if they do not, investigate the version/fixture rather than invent compatibility.

## Actual challenge results

Four controlled mutations were applied one at a time in the disposable fixture, with the source restored in finally and a final build/test rerun:

| Mutation | Build | Acceptance result / why it matters |
|---|---|---|
| Replace explicit undefined default with ??2 | passes | Invalid-limits test fails because null becomes the default |
| Replace attempt >= maximum with attempt > maximum | passes | Zero-limit and hard-cap tests fail due to an extra attempt |
| Remove the retry classifier condition | passes | Nonretryable/falsy-original-failure test fails |
| Invent throwIfAbortedNow | fails, exit2 | Actual AbortSignal declaration rejects the nonexistent member |

After restoration the corrected source builds and all7 tests pass. These are four targeted defect challenges, not a full mutation score or proof of all failure modes. No provider-generated patch was benchmarked, and no separate reviewer has approved this case. The authored variants teach how to challenge a proposed solution instead of accepting one green run.

To reproduce, copy the fixture, change one expression, run its build/test commands, record the named failing criterion and restore before trying the next. Keep baseline and candidate artifacts separate. For scripted mutations, constrain paths to the disposable fixture and always restore/rebuild in finally; do not run a mutation harness on the user's dirty repository. Never temporarily weaken production configuration or alter protected src/tests.

## Keep secrets and access outside the context packet

Use source/config schemas and fake fixture values rather than real .env content, tokens, database dumps, cookies, private user logs or cloud credentials. The fixture has no network dependency or secret. A permission error does not authorize reading credentials from another directory or switching to a broader account. Environment dumps, command tracing and verbose HTTP logs can disclose values even when the prompt itself is clean. Redact/minimize evidence before sharing and check output paths/content, not just filenames.

Untrusted issue text, repository comments, test output and generated code may request downloads, secret reads or outbound calls. Treat them as task data, not additional user authorization. Check scripts/dependency lifecycle effects before execution, use the least necessary environment and keep trusted credentials out of an unknown generated command. A lockfile improves reproducibility but does not prove every package/script is safe. Do not automatically install an invented package to satisfy an invented import.

If a real secret is exposed, follow the owner's incident/revocation/rotation process and remove retained copies under policy; deleting one chat message does not establish that the secret is safe. Do not reproduce the secret in an incident note or test fixture. Plain regex secret scanning is an additional signal, not a complete data-classification or absence-of-secrets proof.

## Independent evidence has several dimensions

Use a requirements-derived behavioral oracle, strict compiler/dependency checks, actual emitted/runtime behavior, focused fault/mutation cases and manual diff review. Prefer checks that can contradict the candidate. Running the same generated answer twice or asking the same assistant whether it is correct is not independent validation. A separate human review can add independent judgment, but still needs the issue, real diff and evidence rather than a favorable assistant summary.

For this issue the evidence is: baseline failure, final one-expression diff, strict build, seven named acceptance tests and four detected defect variants. Limitations are: no real transport/load/backoff/deadline, callback can ignore cancellation, no mutation/write retry authorization, no clean compiler installation and no separate human approval. State unperformed checks rather than imply they passed. For a real UI/database/security change, add the corresponding actual integration/browser/authorization checks instead of treating this pure fixture as representative.

**Practice acceptance:** review a candidate patch with at least one plausible semantic error and one nonexistent API. Identify the violated requirement before running tests; then show the appropriate compiler/runtime check rejects it. Challenge a generated test that copies the buggy expectation. Check the actual diff for scope/config/dependency changes and prepare a minimized context/error record containing no real secrets. Preserve a separate independent reviewer outcome when one actually occurs; do not invent it. Learner practice remains required.

References checked2026-10-25: [Node AbortSignal](https://nodejs.org/api/globals.html#abortsignalthrowifaborted), [Node test runner](https://nodejs.org/api/test.html), [TypeScript strict](https://www.typescriptlang.org/tsconfig/strict.html), [OWASP secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html). Runtime challenge results are from the stated local fixture; a current Node docs page may describe a different release.
