# React reference collections

React 19.3.0 and TypeScript 5.9.3. Copy this folder to an isolated directory, install its pinned package.json, and run `npm run build`; serve `output/` on loopback. `REFERENCE_MODE=production npm run build` produces the production variant. The root notes build does not bundle this application.

- `composition/`: canonical slots/tabs, typed action adapter and negative type fixtures, included by the composition lesson.
- `forms/`: canonical date/reducer/wizard and note-query/mutation components. The browser demo uses the dependency-free wizard subset. The pinned manifest also permits strict checks of the React Hook Form/Query/Zod integrations; their real API/provider behavior remains separate practice.
- `design-system/`: Button/CSS Modules and token-generator references; CSS Modules need a compatible consumer bundler. The demo uses the native action adapter instead.
- `component-testing/`: a separate pinned three-test DOM/promise lab.
- `demo/`: state queues, keyed drafts, controlled ignored-abort race, tabs, native action and a local fake-save wizard under StrictMode.

The fake save resolves locally and **does not persist anything**. The race adapter is a manually settled teaching port; production requests need finite deadlines. Never use this demo as an authenticated management screen.

See [author verification](../../../frontend/verification.md) for executed subsets. Apply [F05](../../../practice/frontend/f05-react.md) and the extracted lesson requirements yourself; all learner practice remains outstanding.

`npm run typecheck` checks represented source/type fixtures; `npm run check:reference` checks pure/date/projection/mocked-response cases. `node design-system/check.mjs` checks token generation, not contrast or visual compatibility.
