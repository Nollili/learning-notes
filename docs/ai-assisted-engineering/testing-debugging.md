# Test and debug with an assistant {#_4-test-and-debug-with-an-assistant}

An assistant can write a plausible test that passes while checking the wrong thing. Begin with expected behavior from the task, then use generated checks as proposals to inspect.

For the catalogue, input immutability, stable ordering and preserving zero are separate requirements. One “returns an array” test does not cover them.

## Classify a failure before changing code

| Failure | First investigation |
|---|---|
| Compiler cannot find a module | Working directory, imports, lockfile and build output |
| Assertion differs | Expected contract, actual input and observed result |
| Local HTTP listen is denied | Environment permission; do not rewrite correct request logic |
| Timeout/open handle | Unclosed server, connection, timer or pending async work |
| Provider unavailable | Configuration, model/endpoint access and transport limits |
| Flaky generated text | Task rubric and model variability; avoid exact prose snapshots |

Give the assistant the command, exit result and relevant error. Ask for a cause supported by the evidence and one check that distinguishes alternatives. Do not send secret-bearing environment dumps or full private logs.

## Challenge the tests

In a disposable learner copy, deliberately replace the undefined-only default with `limit || 10`. The zero-limit check should fail. Replace a copied sort with an in-place sort on mutable input: the ownership regression should fail. Restore only your owned experiment after recording results.

These fault challenges ask whether checks detect the important behavior. They do not require exhaustively mutating every line or testing implementation details. Do not alter protected Autocode `src/tests`; add permitted independent checks elsewhere when the template allows it.

## Verify in layers

Start with a pure function check, then strict build, then relevant integration/UI behavior. A function test does not verify a browser, an API route or permissions. A mock model test verifies the request/response boundary, not model intelligence. For a real RAG assistant, evaluate retrieval and answer support separately.

When checks pass, inspect the diff rather than repeatedly running broader unrelated suites. Repeat checks when a change or unresolved concern justifies them. Record what actually ran and what was not exercised.

**Your exercise:** keep a short diagnostic record for one failing feature candidate: symptom, two plausible causes, evidence that chooses one, correction and rerun result. Include a deliberate fault that a meaningful test catches.

**Done:** explain why each important check exists, show one detected defect and close owned resources so commands terminate. [Next: review and PR preparation](./review-pr.md). Deeper examples: [verification and permissions](./verification-and-permissions.md).
