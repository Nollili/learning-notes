# How would you introduce TS on a project?

## Introducing TypeScript into an Existing Project {#%F0%9F%9A%80-introducing-typescript-into-an-existing-project}

Introducing TypeScript into a JavaScript project should be **gradual and strategic**, especially for medium-to-large applications, to avoid breaking existing functionality and to ease developer adoption.

---

## Assess the Project {#_1%EF%B8%8F%E2%83%A3-assess-the-project}

- Identify **critical/shared code** and modules where type safety would bring the most benefit.
- Determine which parts of the codebase are **actively maintained** versus legacy code.
- Decide on **strictness level** (`strict: true` recommended for new code).

---

## Install TypeScript {#_2%EF%B8%8F%E2%83%A3-install-typescript}

```bash
npm install --save-dev typescript @types/node @types/react
```

* Install type definitions for **React, Node, and any libraries** you use.

---

## Initialize TypeScript Configuration {#_3%EF%B8%8F%E2%83%A3-initialize-typescript-configuration}

```bash
npx tsc --init
```

Key `tsconfig.json` settings:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,              // enable all strict checks
    "allowJs": true,             // allow gradual migration
    "checkJs": false,
    "noEmit": true,              // prevent JS output during migration
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

---

## Gradual Migration {#_4%EF%B8%8F%E2%83%A3-gradual-migration}

### 4.1 Enable JS + TS Coexistence

* Rename files **incrementally**:

  * `.js` → `.ts` for logic files
  * `.jsx` → `.tsx` for React components
* Keep existing JS code working while migrating parts of the codebase.

### 4.2 Add Type Definitions

* Install **types for libraries** if needed:

```bash
npm install --save-dev @types/lodash
```

### 4.3 Add Type Annotations Gradually

* Start with **key modules** or **shared components**.
* Prefer unknown plus narrowing at external boundaries. Track any unavoidable temporary any with an owner and removal criterion; it disables checks rather than proving a contract.

---

## Integrate into Build and Tooling {#_5%EF%B8%8F%E2%83%A3-integrate-into-build-and-tooling}

* **Webpack/Vite**: Use the project's supported TypeScript transformation. Vite8 uses Rolldown/Oxc; older Vite versions used esbuild. Transformation is separate from typechecking: run tsc --noEmit in CI. A Node-executed package instead needs a matching NodeNext module/resolution configuration.
* **ESLint**: Add `@typescript-eslint/parser` for linting.
* **Prettier**: Ensure consistent code formatting with TS support.
* **Jest / Vitest**: Add TypeScript support for tests using `ts-jest` or native Vitest TS support.

---

## Team Guidelines {#_6%EF%B8%8F%E2%83%A3-team-guidelines}

* Enforce **strict type usage** in new modules.
* Encourage **gradual refactoring** of existing code.
* Use **interfaces and types** for public APIs and shared components.
* Document migration rules for the team.

---

## Best Practices for Smooth Migration {#%E2%9C%85-best-practices-for-smooth-migration}

1. **Start small**: Migrate a single feature/module first.
2. **Use allowJs**: Gradually adopt TS without breaking JS code.
3. **Enable strict mode early**: Catch type issues as you migrate.
4. **Leverage tooling**: ESLint, Prettier, and IDE support speed up migration.
5. **Test thoroughly**: Run existing tests to ensure TS migration doesn’t break functionality.

---

> Senior Tip:
> TypeScript adoption is **incremental**. Start with **shared logic and key components**, then expand gradually. Avoid “big bang” migration, which is risky and slows development.


## A declaration must match the actual JavaScript

Prefer the package's bundled declarations, then a compatible maintained @types package. A local declaration is a maintained compatibility promise, not a runtime implementation. Check the installed package version, actual named/default exports, ESM/CommonJS entry points and null/error behavior. Do not silence an untyped dependency with a blanket declare module: that turns its API into any. Module augmentation adds to an existing module; it cannot invent an implementation that the runtime lacks.

This small vendor stand-in lets you inspect both sides. In a standalone package with type:module, put these files beside each other. The .js import resolves to the adjacent .d.ts for TypeScript and the real .js for Node. An explicitly .mjs runtime instead uses .d.mts; CommonJS .cjs uses .d.cts. Respect a real package's exports/types conditions instead of assuming every deep import is public.

```js
// legacy-label.js
export function parseLabel(input) {
  if (typeof input !== 'string') return null;
  const value = input.trim();
  return value.length >= 1 && value.length <= 40 ? { value } : null;
}
```

```ts
// legacy-label.d.ts
export type Label = { value: string };
export function parseLabel(input: unknown): Label | null;
```

```ts
// declaration-contract.ts
import { parseLabel } from './legacy-label.js';
import type { Label } from './legacy-label.js';
const result: Label | null = parseLabel('  Study  ');
if (result !== null) result.value.toUpperCase();
// @ts-expect-error The result can be null.
const guaranteed: Label = parseLabel('');
// @ts-expect-error value is a string, not a number.
const wrong: number = parseLabel('Study')!.value;
// @ts-expect-error No such runtime export exists.
import { formatLabel } from './legacy-label.js';
```

```js
// declaration-runtime.mjs
import assert from 'node:assert/strict';
import * as vendor from './legacy-label.js';
assert.deepEqual(Object.keys(vendor), ['parseLabel']);
assert.deepEqual(vendor.parseLabel('  Study  '), { value: 'Study' });
for (const input of ['', '   ', 'x'.repeat(41), null, 4, {}]) {
  assert.equal(vendor.parseLabel(input), null);
}
assert.deepEqual(vendor.parseLabel('x'.repeat(40)), { value: 'x'.repeat(40) });
```

Validated with Node24.18.0 and TypeScript5.9.3. Run tsc --noEmit --strict --module NodeNext --moduleResolution NodeNext declaration-contract.ts (without skipLibCheck for this declaration lab), then node declaration-runtime.mjs. Never execute the negative type fixture as application code. The compiler trusts the declaration; it does not establish that the JavaScript returns the promised value. Runtime checks expose that separate boundary. A dependency upgrade can keep typechecking while changing behavior, so rerun both checks and inspect release notes.


Official references checked2026-10-22: [module declarations](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html), [extension substitution and module resolution](https://www.typescriptlang.org/docs/handbook/modules/reference), [Vite TypeScript transformation](https://vite.dev/guide/features.html#typescript). Learner practice remains required.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/typescript/How_would_you_introduce_TS_on_a_project.md). All learner practice remains outstanding; the worked examples above are explanatory material.
