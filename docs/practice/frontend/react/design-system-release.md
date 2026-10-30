# Practice: Design Systems: Stories, Visual Review and Consumer Migrations {#practice-design-system-release}

**Status: outstanding learner practice.**

Prerequisite: [the worked lesson](../../../senior_growth/React/design-system-release.md) and [the staged sequence](../index.md).


## Practice and acceptance

Create Button stories in the separate consumer and configure its supported runner. Acceptance: Primary interaction runs, Disabled is checked, long label/narrow viewport render, both theme sets have approved baselines, a deliberately broken padding/focus change produces a rejected diff. Keep the runner output and human review evidence; do not claim a snapshot proves accessibility.

For migration, test direct and aliased imports, both literal values, unrelated library imports, mixed props, unknown literal, spread, dynamic value and unsupported wrapper. Acceptance: safe fixtures transform exactly, manual cases preserve bytes and report a reason, a second run is idempotent, consumer typecheck and behavior tests pass. Add one real consumer migration record and rollback rehearsal using local artifacts. Publishing/pushing is not part of the exercise. All learner practice remains required.

References checked 2026-10-21: [Storybook React/Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite), [stories](https://storybook.js.org/docs/writing-stories/index), [interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing), [visual tests](https://storybook.js.org/docs/writing-tests/visual-testing), [SemVer 2.0.0](https://semver.org/), [Babel parser](https://babeljs.io/docs/babel-parser).
