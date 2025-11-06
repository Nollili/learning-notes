# How would you introduce TS on a project?

# 🚀 Introducing TypeScript into an Existing Project

Introducing TypeScript into a JavaScript project should be **gradual and strategic**, especially for medium-to-large applications, to avoid breaking existing functionality and to ease developer adoption.

---

## 1️⃣ Assess the Project

- Identify **critical/shared code** and modules where type safety would bring the most benefit.
- Determine which parts of the codebase are **actively maintained** versus legacy code.
- Decide on **strictness level** (`strict: true` recommended for new code).

---

## 2️⃣ Install TypeScript

```bash
npm install --save-dev typescript @types/node @types/react
````

* Install type definitions for **React, Node, and any libraries** you use.

---

## 3️⃣ Initialize TypeScript Configuration

```bash
npx tsc --init
```

Key `tsconfig.json` settings:

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext",
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

## 4️⃣ Gradual Migration

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
* Use `any` temporarily if migration is blocking, then **refactor to strict types**.

---

## 5️⃣ Integrate into Build and Tooling

* **Webpack/Vite**: Ensure `.ts` and `.tsx` are handled by `ts-loader` or `esbuild`.
* **ESLint**: Add `@typescript-eslint/parser` for linting.
* **Prettier**: Ensure consistent code formatting with TS support.
* **Jest / Vitest**: Add TypeScript support for tests using `ts-jest` or native Vitest TS support.

---

## 6️⃣ Team Guidelines

* Enforce **strict type usage** in new modules.
* Encourage **gradual refactoring** of existing code.
* Use **interfaces and types** for public APIs and shared components.
* Document migration rules for the team.

---

## ✅ Best Practices for Smooth Migration

1. **Start small**: Migrate a single feature/module first.
2. **Use allowJs**: Gradually adopt TS without breaking JS code.
3. **Enable strict mode early**: Catch type issues as you migrate.
4. **Leverage tooling**: ESLint, Prettier, and IDE support speed up migration.
5. **Test thoroughly**: Run existing tests to ensure TS migration doesn’t break functionality.

---

> 💡 Senior Tip:
> TypeScript adoption is **incremental**. Start with **shared logic and key components**, then expand gradually. Avoid “big bang” migration, which is risky and slows development.
