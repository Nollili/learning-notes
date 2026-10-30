# Testing Node.js Applications — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-04-testing.md) · [Node.js practice map](./index.md)

### Diagnostic exercise

Take a deliberately flaky API suite and fix it without adding sleeps.

Include these defects:

- fixed port collisions;
- shared database records;
- a spy that is not restored;
- dependence on the current timezone;
- an unclosed server;
- a missing `await` on a rejected promise.

Document the evidence that identified each cause.

---

## Final review checklist {#_17-final-review-checklist}

You should be able to explain and demonstrate each item:

### Advanced confidence

- Reuse contract tests across compatible implementations.
- Describe when a property expresses behavior better than selected examples.
- Test shared-state invariants under concurrent operations.
- Diagnose order, parallelism, time, environment, and open-handle flakiness.
- Replace sleeps with deterministic completion signals.
- Use mutation testing selectively to assess assertion strength.

### Strategy

- The Testing Pyramid emphasizes unit tests; the Testing Trophy emphasizes integration tests and static analysis.
- Both are heuristics, not fixed test ratios.
- Unit tests isolate small behaviors; integration tests connect selected real components; E2E tests use the external system boundary.
- The smallest test boundary that detects the target failure usually gives the best feedback.
- Static analysis complements runtime tests.

### Jest

- `test()` and `it()` define tests; `describe()` groups behavior and hook scope.
- `beforeAll()`/`afterAll()` run once per scope; `beforeEach()`/`afterEach()` surround each test.
- Every asynchronous test and hook must return or await its work.
- `toBe()` checks primitive equality/object identity; `toEqual()` checks structural values.
- Synchronous exceptions use `expect(() => action()).toThrow()`.
- Promise failures use `await expect(action()).rejects.toThrow()`.
- Parameterized tests reduce duplication when cases share one behavior.

### Test doubles

- `jest.fn()` creates a controllable, inspectable function.
- `jest.spyOn()` observes a real object method and calls it by default until mocked.
- `jest.mock()` replaces a module according to the project's module system.
- `clearAllMocks()` clears history, `resetAllMocks()` also removes implementations, and `restoreAllMocks()` restores supported replaced properties/spies.
- Unit tests replace external boundaries but should not mock the behavior under test.
- Over-mocking can let incompatible real components pass independently.

### Test levels

- Unit tests cover happy paths, errors, boundaries, and collaborator outcomes deterministically.
- Integration tests explicitly define which components are real.
- Integration infrastructure and data must be isolated and cleaned up.
- Supertest can test a Node.js app without binding a fixed public port.
- API tests assert status, body contract, headers, authorization, and important side effects.
- Nock mocks outbound HTTP; it is not itself an E2E runner.
- Uncontrolled public services should not be a normal CI dependency.

### Coverage and reliability

- Coverage measures execution, not correctness or assertion quality.
- Statement, branch, function, and line coverage answer different questions.
- `collectCoverageFrom` ensures never-imported source appears in reports.
- Coverage thresholds can fail CI but should reflect meaningful risk.
- Coverage reporters serve different consumers: text/HTML for people and LCOV/Cobertura for tooling.
- Tests must control time, randomness, environment, files, network, database state, and identifiers when those affect results.
- Open handles must be closed so Jest terminates.
- Sleeps should be replaced with completion signals or fake timers.
- Tests must pass alone, together, in different orders, and under expected parallelism.

**Practice acceptance:** implement the registration change in a separate practice project, map every requirement to at least one meaningful test, deliberately remove the stored hash and observe REG-2 fail, then remove the unique constraint and observe the concurrency protection fail. Restore the implementation and run the real applicable Autocode commands without altering src/tests. Record a short review with one genuine finding and its corrected verification. Writing this matrix does not complete learner practice.
