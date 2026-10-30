# What do you think, who is responsible for write unit tests?

## Responsibility for Writing Unit Tests {#%F0%9F%A7%AA-responsibility-for-writing-unit-tests}

**Unit tests** are a fundamental part of software quality, and **responsibility should be shared across the team**, but primarily it falls on **developers writing the code**.

---

## Primary Responsibility: Developers {#_1%EF%B8%8F%E2%83%A3-primary-responsibility-developers}

- **Who:** The engineer who writes the feature or module
- **Why:**
  - They know the **implementation details and expected behavior**
  - Writing tests alongside the code ensures **immediate feedback**
  - Aligns with **TDD / FIRST principles**
- **Benefits:**
  - Fewer bugs in production
  - Faster debugging and refactoring
  - Encourages clean, modular code design

---

## Secondary Responsibility: Team / Code Review {#_2%EF%B8%8F%E2%83%A3-secondary-responsibility-team-code-review}

- **Code reviewers / peers** should ensure:
  - Tests exist for new features
  - Tests are meaningful and follow best practices
  - Coverage of edge cases and critical paths
- **Pair programming / mob programming** can also help maintain test quality

---

## Other Stakeholders {#_3%EF%B8%8F%E2%83%A3-other-stakeholders}

- **QA / Test Engineers:**
  - Typically focus on **integration and E2E tests**, but may contribute unit tests in some teams
- **Tech Leads / Architects:**
  - Ensure **testing culture is enforced**
  - Set coverage standards and guidelines

---

## Best Practices {#_4%EF%B8%8F%E2%83%A3-best-practices}

1. **Write tests as you code** (TDD or alongside feature development)
2. **Test critical paths first**
3. **Review unit tests in PRs** like production code
4. **Maintain ownership**: developers investigate regressions and fix production behavior or obsolete expectations according to the requirement; do not weaken tests merely to get green

---

### Key Takeaways {#%E2%9C%85-key-takeaways}

- **Developers are primarily responsible** for unit tests.
- **QA and team leads** support and enforce quality and coverage.
- **Ownership matters:** the author supplies behavior evidence and reviewers challenge assumptions; proximity alone does not guarantee quality.

> Senior Tip:
> Unit tests are **part of the definition of done (DoD)** for a feature. No code should be merged without meaningful tests.


## Worked review responsibility

The [configuration-limit TDD fixture](./TDD_-_pros_and_cons(red,_green,_refactor).md#config-tdd) records an authored review finding: a first passing parser suite needed a trailing-newline case because JavaScript `$` can match before a final terminator. The author owns the input contract and repair; a reviewer asks whether “no whitespace” includes newline, requests an observable negative case, and checks the actual implementation/diff rather than accepting the pass count. This is a constructed study record with actual local checks, not a claim that another person performed a review.

The [AI-assisted engineering evidence route](../../ai-assisted-engineering/traceability-and-evaluation.md) adds requirement-to-test mapping and detected defect variants. Independent human review and learner practice remain separate; a model's self-review is not evidence that a peer approved a change. QA can contribute unit, integration or exploratory tests according to expertise; ownership is collaborative rather than a prohibition on who may write a test.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/testing/What_do_you_think%2C_who_is_responsible_for_write_unit_tests.md). All learner practice remains outstanding.
