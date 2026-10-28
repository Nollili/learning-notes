# Build tools for React, Vite, CRA, Webpack


### **1. CRA (Create React App)**

* **Overview:**

  * Historical zero-configuration setup; deprecated for new apps by the React team on2025-02-14.
  * Uses **Webpack** under the hood, along with Babel and ESLint.
  * Provides scripts for **start, build, test, eject**.
* **Pros:**

  * Easy to get started — no config needed.
  * Existing projects have a large legacy knowledge base.
* **Cons:**

  * Slow build and development start times for large apps.
  * Harder to customize Webpack without ejecting.
  * Ejected projects can be complex to maintain.
* **Use case:** Maintaining/migrating an existing CRA project; choose a supported framework/build tool for new work.

---

### **2. Webpack**

* **Overview:**

  * A **module bundler** for JavaScript and assets.
  * Highly configurable — you control loaders, plugins, and optimizations.
* **Pros:**

  * Extremely powerful and flexible.
  * Can handle advanced optimizations like **code splitting, tree shaking, asset optimization**.
* **Cons:**

  * Configuration-heavy, steep learning curve.
  * Slower builds compared to modern alternatives for large projects.
* **Use case:** Large, complex apps where fine-grained control over bundling is needed.

---

### **3. Vite**

* **Overview:**

  * Modern build tool designed for **fast development**.
  * Uses browser ESM/HMR in development; Vite8 uses Rolldown for production (older Vite releases used Rollup). Check the installed major and plugin compatibility.
  * Supports **React, TypeScript, and modern frontend frameworks** out-of-the-box.
* **Pros:**

  * Lightning-fast dev server startup and hot module replacement (HMR).
  * Native ESM support reduces bundling overhead during development.
  * Works well with modern tooling like **Vitest, PostCSS, Tailwind, and SSR frameworks**.
* **Cons:**

  * Some older plugins or libraries may require configuration.
  * Smaller ecosystem than Webpack (though growing fast).
* **Use case:** Modern React apps, especially large projects where fast HMR and build times are critical.

---

### **4. Best Practices / Modern Approach**

* **New projects:** Prefer **Vite** for speed, developer experience, and modern features.
* **Legacy or enterprise projects:** Webpack may still be relevant for **complex custom builds**.
* **CRA:** Legacy migration context; not the recommended new-project scaffold.
* **Common optimizations:**

  * Code splitting for faster load.
  * Tree shaking to remove unused code.
  * Minification, caching, and bundle analysis for production builds.

---

**Interview summary line:**

> “Choose a framework such as Next.js for integrated routing/server rendering, or Vite for a client application with deliberate routing/data choices. CRA is deprecated for new apps. Bundler choice depends on requirements and installed versions.”

---


### **1. CRA Status 2025**

* **Create React App (CRA)** was officially deprecated for new apps on2025-02-14.
* React’s official team has **shifted focus to modern tools like Vite and Next.js**.
* Existing installations can still run, but official deprecation is not a promise of indefinite maintenance/security support; plan dependency review and migration.

---

### **2. CRA is officially deprecated for new apps**

* Slow dev server and HMR compared to Vite.
* Ejecting to customize Webpack is cumbersome.
* Server Components need framework/bundler integration; ordinary concurrent React client APIs are not exclusive to Next/Vite.
* The React team recommends **Vite, Next.js, or Remix** for new projects instead of CRA.

---

### **3. Modern alternatives**

* **Vite:** Fast dev server, modern ES modules, TypeScript support.
* **Next.js:** For React apps needing SSR, SSG, routing, and full-stack features.
* **Remix:** Full-stack framework with advanced routing and loader-based data fetching.

---

**Interview summary line:**

> “The React team deprecated CRA for new apps on2025-02-14. Plan an incremental migration for existing projects rather than promising permanent patch support.”


## Coherent study stack and migration exercise

Use Vite+React+TypeScript for client-only labs and Next.js16 App Router when routing/server boundaries are the topic. They serve different project needs; do not add both build systems to one lab without a reason. Learn the [App Router boundary and route-state lesson](./next-app-router.md) before copying Pages Router fetching APIs. A transpiler can emit JavaScript without typechecking; retain a separate typecheck/lint/test/build contract.

For a CRA migration, inventory environment prefixes/public values, asset paths, routing fallback, test setup, CSS preprocessing, browser targets, service workers and deployment base paths. Move one working route/build at a time; compare emitted assets and real user behavior. Vite development success does not prove production chunk paths, polyfills or HTTP compression. Read the installed Vite major's migration guide; do not transplant Webpack splitChunks configuration into Vite.


Official references checked2026-10-20: [CRA deprecation](https://react.dev/blog/2025/02/14/sunsetting-create-react-app), [current Vite guide](https://vite.dev/guide/), [Vite8 migration](https://vite.dev/guide/migration).

## Worked lab: typechecking, host resolution and private source maps

Applicable baseline: TypeScript **5.9** compiler options (locally checked with 5.9.3), Vite **8** configuration, Node **24** for the separate server lab. These are explicit learning baselines, not a claim that all installed tools use those versions. Keep the practice project's compatible package versions and lockfile. The notes site uses its own VitePress toolchain.

### Browser host: the bundler resolves imports

Create a separate client fixture containing `index.html`, `src/main.ts`, `src/price.ts`, `tsconfig.json`, `vite.config.ts` and an ESM `package.json`. No React dependency is needed to isolate module resolution. Add React/JSX only after this small fixture works.

```json
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext", "moduleResolution": "Bundler",
    "strict": true, "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true, "isolatedModules": true,
    "noEmit": true, "types": [],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src/**/*.ts"]
}
```

```ts
// vite.config.ts — separate from the browser tsconfig's include
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { sourcemap: 'hidden', target: 'es2022' }
});
```

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc -p tsconfig.json",
    "build": "npm run typecheck && vite build",
    "preview": "vite preview"
  }
}
```

This package fragment intentionally omits dependency versions: install the explicitly chosen compatible Vite8/TypeScript5.9 tooling in the practice workspace and commit its resolved lockfile. It is not a replacement for this repository's package.json. A CI pipeline runs a clean locked install before these scripts. To check the Node-based Vite config too, use a separate NodeNext tsconfig with matching Node/Vite types; do not expose server ambient globals to browser code just to silence errors.

```html
<!-- index.html -->
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Resolution lab</title></head>
<body><output id="total"></output><script type="module" src="/src/main.ts"></script></body></html>
```

```ts
// src/price.ts
export function priceLabel(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new Error('Invalid cents');
  return `EUR ${(cents / 100).toFixed(2)}`;
}
```

```ts
// src/main.ts
import { priceLabel } from '@/price';
const output = document.querySelector<HTMLOutputElement>('#total');
if (!output) throw new Error('Missing total output');
output.textContent = priceLabel(1250);
```

The alias has **two owners**: `paths` tells TypeScript how to locate types; Vite's alias tells the bundler what to load. TypeScript does not rewrite an emitted alias into a runtime path. Here tsc emits nothing and Vite owns emitted imports/chunks. Temporarily remove the Vite alias: the typecheck can still succeed while the bundle fails. Remove the TS mapping: the bundler may still work but the typecheck fails. Test runners need the same resolution contract or shared configuration, not a third divergent alias table.

Introduce `const cents: number = '1250'` in main: an isolated transpiler may emit it, but the required typecheck must fail and block build. `target` controls syntax generation; `lib` supplies compile-time API declarations. Neither installs missing browser APIs. ES2022 is the lab support decision; choose/test actual supported browsers and polyfills separately. `isolatedModules` flags constructs that cannot safely be handled one file at a time; it is not a typechecker replacement.

### Node host: emitted ESM must run without a bundler

Use a separate `node-lab/` with `package.json` containing `"type":"module"`, source files and this tsconfig. Keep browser and server compilation environments separate.

```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "NodeNext", "moduleResolution": "NodeNext",
    "strict": true, "verbatimModuleSyntax": true, "types": [],
    "rootDir": "src", "outDir": "dist", "sourceMap": true,
    "inlineSources": true, "noEmitOnError": true
  },
  "include": ["src/**/*.ts"]
}
```

```ts
// node-lab/src/price.ts — reuse the browser price implementation
export function priceLabel(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new Error('Invalid cents');
  return `EUR ${(cents / 100).toFixed(2)}`;
}
```

```ts
// node-lab/src/main.ts
import { priceLabel } from './price.js';
console.log(priceLabel(1250));
priceLabel(-1); // deliberate diagnostic failure, not application success
```

TypeScript resolves `./price.js` to the TS source for checking; emitted ESM keeps the `.js` specifier that Node can load from dist. Run `tsc -p node-lab`, then `node --enable-source-maps node-lab/dist/main.js`: the deliberate error must produce a nonzero exit and a source-level `price.ts` location. Compare the stack without the flag. An extensionless relative ESM import that Bundler mode accepts is not a valid assumption for NodeNext output. `.mjs`/`.mts` force ESM; `.cjs`/`.cts` force CommonJS.

In a type-module package, a CommonJS config using `require` should use `.cjs`, not an accidentally ESM `.js` filename. Do not mix arbitrary `require`/named imports to paper over a package's `exports` conditions; inspect that package's supported entry points and type definitions.

`NodeNext` follows Node module conventions as TypeScript evolves; pin the compiler when reproducing diagnostics. The tiny lab avoids Node-specific APIs, hence `types:[]`; a real server using Node APIs needs compatible `@types/node` and a deliberate `lib` set. Native Node TS execution is a different workflow from running emitted JS and does not make this compilation exercise unnecessary.

### Source maps: generate privately, then verify an actual mapped failure

A source map connects a generated line/column to the original file/location; a minified stack alone often lacks enough context. Vite8 `build.sourcemap:'hidden'` emits maps without advertising them in a sourceMappingURL comment. **Hidden does not mean private:** copying all of dist to a public bucket can still expose `*.map`. Inline maps expose source through the JS itself. Minification is not a secret-protection mechanism; anything shipped to a browser is inspectable.

Use this release contract:

1. Build once with a unique release ID (for example immutable commit/build identifier). Retain bundle hashes, exact maps and source revision together. Scan generated assets and map `sourcesContent` for credential/private-fixture leakage. A secret detected here requires removal/rotation as appropriate, not merely deletion of the map.
2. Upload maps **and the matching generated asset identity/URLs** to an access-controlled error service or artifact store using CI-only credentials. The provider-specific API must be implemented/tested for the chosen service. Client bundles receive only a public release identifier; never upload credentials.
3. Require upload success and a deliberate error-symbolication check before promoting the release. A failed upload fails promotion; do not generate a different bundle afterward. Match release, base path and bundle filename/hash exactly. Source-map generated columns are zero-based; many runtime stacks report one-based columns.
4. Produce a separate public artifact without maps. Verify no inline map/comment and no credential/source leak; publish that artifact only. Confirm the deployed CDN does not serve map paths, including old cached paths. Merely removing a listing is insufficient.
5. Restrict map access, log access and configure retention covering the supported release/rollback window. Expire maps and sources according to data policy after that window; do not keep every release forever by accident. A rollback reuses the original bundle/maps pair and release ID.

```js
// stage-public.mjs — run only on a dedicated build output, after private upload
import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
export async function stagePublic(input, output) {
  // Caller must use a fresh output path; never overlay a prior public artifact.
  await mkdir(output); // fails if it already exists
  await cp(input, output, { recursive: true,
    filter: source => !source.endsWith('.map') });
  async function verify(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('Unexpected build symlink');
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await verify(full);
      else if (entry.name.endsWith('.map')) throw new Error('Public map leaked');
    }
  }
  await verify(output);
}
```

The staging helper demonstrates artifact separation, not a complete secret scanner or uploader. Dedicated trusted build inputs are required; reject symlinks in the build inventory before uploading too. Add a text-asset check for inline maps/sourceMappingURL and a real secret-scanning policy. If staging/verification fails, discard the partial output; do not deploy it. Keep private maps outside the public artifact. Backend maps can remain beside server bundles under deployment access controls; they are not automatically public unless served/copied.

**Worked debugging procedure:** in a scratch build, compile a function that throws on invalid cents with minification and an external map. Trigger it, capture generated file/line/column, load the matching map using a source-map library and look up `(line, column-1)`. Assert the result identifies the original validation throw, not merely a filename. Repeat with a mismatched build map and verify release/hash checks reject it before trusting a location. The Node source-map flag example validates the runtime mapping path; a browser error-service upload still needs its own integration check.

### Acceptance and failure drill

Use the [separate practice requirements and observation ledger](../../practice/frontend/react/build_tools.md). All learner work remains outstanding.

## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/build_tools.md). All learner practice remains outstanding; the worked examples above are explanatory material.
