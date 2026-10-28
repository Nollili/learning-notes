# What are some general practices and techniques to optimize in the area? Explain tree shaking, code splitting and bundling, minimizing, data caching.

## General Practices for Frontend Performance Optimization

Senior engineers optimize frontend performance by focusing on how code is delivered, executed, and reused. Optimization should be considered at build time, runtime, and network levels.

---

### ⚙️ Build and Delivery Pipeline
- Use production builds for configured minification/dead-code elimination. Configure and verify HTTP compression separately; a bundler does not automatically configure the CDN.
- Generate source maps for production diagnosis when required; retain them privately with the exact release and exclude them from public artifacts. Hidden maps still need access control. Follow the [worked source-map lifecycle and resolution lab](../React/build_tools.md#source-maps-generate-privately-then-verify-an-actual-mapped-failure).
- Monitor bundle size with tools like Webpack Bundle Analyzer or Vite Visualizer.
- Set and enforce performance budgets for bundle sizes.

### ⚡ JavaScript Execution
- Split code by routes or components to avoid large bundles.
- Use lazy loading for non-critical code.
- Prefer lightweight libraries and native browser APIs.
- Apply debounce/throttle for frequently triggered events.

### 🖼️ Rendering Optimization
- Prevent unnecessary component re-renders with memoization and stable props.
- Use profiling tools to find performance bottlenecks.
- Batch state updates and minimize re-renders from global context changes.
- Virtualize long lists for better rendering performance.

### 🌐 Network & Asset Optimization
- Serve compressed assets (gzip or Brotli).
- Use HTTP caching headers like ETag and Cache-Control.
- Host static assets on CDNs.
- Inline critical CSS and defer non-essential scripts.

---

## 🌳 Tree Shaking

Tree shaking eliminates unused code from the final JavaScript bundle during build. It works with ES Modules (`import`/`export`) and bundlers like Webpack, Rollup, or Vite. Statically provable unused exports may be removed; dynamic access, side effects, CommonJS boundaries and configuration can retain code. Inspect the emitted result instead of assuming every unused feature disappears.

**Requirements:**
- Use ESM syntax.
- Avoid side effects in modules.
- Import only what you need.

---

## 📦 Code Splitting

Code splitting breaks your app into smaller chunks loaded as needed. This can be done by route, component, or vendor splitting. It can reduce initial code demand while adding later discovery/request/parse cost; verify both initial and feature-open outcomes.

**Example (React):**
```js
import { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

---

## 📚 Bundling

Bundling combines modules (JS, CSS, images) into files that browsers can load efficiently. Tools include Webpack, Rollup, ESBuild, and Vite. Bundling reduces HTTP requests and enables optimizations like minification and tree shaking.

**Note:** Too much bundling can slow initial load—combine with code splitting for balance.

---

## ✂️ Minification

Minification rewrites code and removes unnecessary characters (whitespace, comments, long local names) while aiming to preserve specified behavior. Code that depends on function names, eval or accidental timing may expose assumptions; configure and test the actual build. Tools include Terser for JS, CSSNano/PostCSS for CSS, and HTMLMinifier for HTML.

**Result:** Often fewer emitted bytes; transfer/parse/interaction outcomes still need measurement.

---

## 💾 Data Caching

Caching stores data (API responses, assets, computed values) for reuse, reducing network requests and improving performance.

**Types:**
- HTTP caching (Cache-Control, ETag)
- Service Workers (Workbox, custom strategies)
- TanStack Query5 is the existing primary server-cache path; RTK Query is an alternative. A generic state store still needs freshness/eviction contracts
- IndexedDB/LocalStorage for persistent/offline data

**Strategies:** Cache First, Network First, Stale While Revalidate.

---

## 🚀 Summary Table

| Technique      | Purpose              | Key Benefit                  |
|----------------|---------------------|------------------------------|
| Tree Shaking   | Remove unused code  | Smaller JS bundles           |
| Code Splitting | Load code on demand | Faster initial load          |
| Bundling       | Combine modules     | Fewer HTTP requests          |
| Minification   | Compress code       | Faster downloads             |
| Data Caching   | Reuse data          | Less network load, faster UX |

**Senior-level takeaway:**  
Performance optimization is about controlling when and how the browser loads and executes code. Use bundling, tree shaking, and caching together with runtime profiling for real user performance improvements.


## Worked production analysis: module contracts before chunk tuning

### 1. Side effects and conditional exports

A module's import-time side effects include CSS application, polyfill installation and global registration. They differ from a component's later click handler or React effect. Marking an entire library `sideEffects:false` asserts that unused modules may be skipped; it can delete required CSS/registration. For a hypothetical library whose emitted files match the following paths:

```json
{
  "name": "@acme/ui",
  "type": "module",
  "sideEffects": ["**/*.css", "./dist/register.js"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./register": "./dist/register.js"
  }
}
```

The package must actually build every declared artifact. Consumers import `@acme/ui/register` explicitly when registration is needed; the sideEffects metadata preserves a side-effect-only import but does not cause the file to load automatically. Test both ESM and CJS consumers and CSS retention in production. Keep the declaration condition compatible with the actual dual-package type design; this small fragment is not a complete dual ESM/CJS publication recipe.

Separate instances of package state across entry points can also surprise consumers. A single ESM package is simpler when CJS support is unnecessary.

Conditional exports are selected by the host's active conditions and their ordered matching keys; `types` is for tooling, `import`/`require` select different runtime entry points, and browser conditions require bundler support/configuration. Inspect the resolved file in the build output; importing a named function is not proof an ESM entry was chosen. Export maps also define allowed public subpaths—do not bypass them with a private `dist` path.

Do not disable side-effect handling globally or add a PURE annotation to an effectful call just to reduce bytes. Regression tests should verify styling/registration still occur, not only that a bundle became smaller.

### 2. Eager versus on-demand code: a reproducible fixture

The fixture below uses **installed esbuild** for a controlled bundle experiment, separate from the primary Vite8 app configuration. It generates 1,000 deterministic report rows, compares equivalent eager/lazy click behavior and records a metafile. It is a synthetic build measurement, not a user-performance benchmark. Run it as `measure.cjs` in a scratch workspace with esbuild installed; it creates a fresh temporary folder. Keep its version and JSON output with the evidence.

```js
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const esbuild=require('esbuild');const {gzipSync}=require('node:zlib');
const root=fs.mkdtempSync('/tmp/b33-');fs.mkdirSync(path.join(root,'src'));fs.writeFileSync(path.join(root,'package.json'),'{"type":"module"}');
fs.writeFileSync(path.join(root,'src/math.js'),'export const add=(a,b)=>a+b; export function unused(){return "UNUSED_SENTINEL";}');
fs.writeFileSync(path.join(root,'src/report.js'),`const rows=${JSON.stringify(Array.from({length:1000},(_,i)=>'row-'+i.toString(36)+'-'+((i*7919)%104729).toString(36)))};export function renderReport(target){target.textContent=rows.length+' rows: '+rows[0];}`);
const common=`import {add} from './math.js'; console.log(add(2,3)); const target=document.querySelector('#report'); const button=document.querySelector('#open-report');`;
fs.writeFileSync(path.join(root,'src/eager.js'),`import {renderReport} from './report.js';${common}button.addEventListener('click',()=>renderReport(target));`);
fs.writeFileSync(path.join(root,'src/lazy.js'),`${common}button.addEventListener('click',async()=>{const {renderReport}=await import('./report.js');renderReport(target);});`);
(async()=>{
 const metrics={};
 for(const kind of ['eager','lazy']){
  const outdir=path.join(root,kind);const result=await esbuild.build({entryPoints:[path.join(root,'src',kind+'.js')],outdir,bundle:true,format:'esm',splitting:true,minify:true,metafile:true,platform:'browser'});
  const outputs=Object.keys(result.metafile.outputs);const entry=outputs.find(x=>result.metafile.outputs[x].entryPoint?.endsWith(kind+'.js'));
  const bytes=fs.readFileSync(entry);assert(!bytes.includes('UNUSED_SENTINEL'));
  metrics[kind]={initialRaw:bytes.length,initialGzip:gzipSync(bytes).length,totalRaw:outputs.reduce((n,x)=>n+fs.statSync(x).size,0),files:outputs.length,metafile:result.metafile};
  const target={textContent:''};let handler;global.document={querySelector:s=>s==='#report'?target:{addEventListener:(event,fn)=>{handler=fn;}}};
  await import('file://'+path.resolve(entry));assert.equal(target.textContent,'');await handler();assert.equal(target.textContent,'1000 rows: row-0-0');
 }
 assert(metrics.lazy.initialRaw<metrics.eager.initialRaw);assert.equal(metrics.lazy.files,2);assert.equal(metrics.eager.files,1);
 fs.writeFileSync(path.join(root,'results.json'),JSON.stringify({root,metrics},null,2));
 console.log(JSON.stringify({root,eager:{...metrics.eager,metafile:undefined},lazy:{...metrics.lazy,metafile:undefined}},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
```

Local fixture run, 2026-10-21 (Node24.18.0, esbuild0.25.12; gzip is a local size calculation):

| Build | Initial raw JS | Initial gzip bytes | Total raw JS | JS files |
|---|---:|---:|---:|---:|
| Eager report | 13,718 | 5,164 | 13,718 | 1 |
| Lazy report | 220 | 184 | 13,809 | 2 |

The lazy entry is smaller while total raw bytes increase by91 and a later request is introduced. Both fixtures leave the report empty until activation, then produce the same expected output. The unused sentinel export is absent. These checks establish the fixture's graph/behavior, not real DOM rendering or transfer timing. The DOM port only supplies querySelector, click subscription and textContent. Compression values depend on emitted output/tool versions; rerun rather than treating these bytes as a budget for your application.

Read `results.json` output edges: the eager entry statically owns report code, while the lazy entry has a dynamic import edge to a report chunk. Track route entry, shared modules, JS/CSS assets and imported dependencies; a vendor chunk can still be required on the initial route. For the real app, compare initial route raw/compressed bytes, parse/evaluate time, main-thread tasks and feature-open latency under identical cold/warm conditions. Capture at least several repeated runs and retain variability; do not invent a performance improvement percentage from this size table.

### 3. Primary Vite8 configuration and request waterfalls

<<< ../../workbench/engineering/performance/vite.config.ts{ts}

A source-level `import()` is sufficient to request an async boundary; begin with automatic chunking and inspect the manifest/generated import graph. Vite8's advanced output controls live under `build.rolldownOptions.output.codeSplitting`; Webpack's `optimization.splitChunks` belongs only in Webpack configuration. Older Vite used Rollup and its manualChunks interface; migrate by installed major rather than copying names between tools. This note intentionally does not force a vendor group without evidence. Reuse the [typecheck/resolution/private-map lab](../React/build_tools.md#worked-lab-typechecking-host-resolution-and-private-source-maps).

A small entry can still produce a slow chain: HTML → entry → lazy route → route data → nested widget. Identify which dependency becomes discoverable only after the previous stage executes. Move independent fetching/discovery earlier, flatten avoidable sequential awaits, or preload an actually likely next resource using the framework's supported mechanism. Preloading all chunks defeats on-demand delivery and competes with critical resources.

Dynamic import promises are not automatically canceled by navigation; ensure late results do not update an obsolete view. A failed import needs an error/retry/reload policy; deleting old immutable chunks immediately can strand open tabs after deployment. Retain compatible assets across the supported release window and test the framework's stale-chunk recovery.


References checked 2026-10-21: [Webpack tree shaking/sideEffects](https://webpack.js.org/guides/tree-shaking/), [Node package exports](https://nodejs.org/docs/latest-v24.x/api/packages.html#conditional-exports), [Vite8 production builds](https://vite.dev/guide/build), [Vite build options](https://vite.dev/config/build-options), [esbuild analysis/metafile](https://esbuild.github.io/api/#metafile).


### Reconcile the checklist with actual evidence

The worked fixture, not a bundler name or named import alone, establishes sentinel removal and an eager/lazy graph for its pinned version. Source maps, compression, cache scope and module side effects remain independent contracts. Reuse the [bounded cache and retention lesson](./What_are_the_usual_source_of_problems_with_memory.md#bounded-cache-identity-eviction-and-limitations): storing state is not automatically a correct freshness or memory policy. Do not adopt competing query stores just to cover a list of tools. A production acceptance record still needs scoped private/public cache behavior and actual route/feature-open traces.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/performance/What_are_some_general_practices_and_techniques_to_optimize_in_the_area_Explain_tree_shaking%2C_code_splitting_and_bundling%2C_minimizing%2C_data_caching..md). All learner practice remains outstanding.
