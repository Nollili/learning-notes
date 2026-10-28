# Module boundaries and interoperability reference

Use a dedicated scratch project under Node24.18.0 with explicit extensions/type markers. These small files complement the live counter example in section4. A cycle itself is not automatically forbidden: the failure depends on which bindings/exports are observed before initialization. Keep import-time effects and per-request data out of shared module singletons.

```js
// cycle-a.mjs
import { observed } from './cycle-b.mjs';
export const value = 1;
console.log(observed);
```

```js
// cycle-b.mjs
import { value } from './cycle-a.mjs';
export const observed = value; // ReferenceError while value is still uninitialized.
```

```js
// cycle-a.cjs
exports.ready = false;
const peer = require('./cycle-b.cjs');
exports.observed = peer.observed;
exports.ready = true;
```

```js
// cycle-b.cjs
const peer = require('./cycle-a.cjs');
exports.observed = peer.ready; // false: partially initialized but already assigned export.
```

Refactor an unwanted cycle by moving a shared value/contract to a third independent module or by injecting a dependency after construction. Do not fix a temporal-dead-zone error by blindly turning every binding into var and accepting undefined. A CJS primitive copied by destructuring is not a live ESM binding; mutating the exported object can be observed through that object, while replacing it later does not rewrite references already retained by consumers.

Create a tiny local package at `node_modules/fixture-boundary/` in the scratch project; no registry installation is required:

```json
// node_modules/fixture-boundary/package.json
{ "name": "fixture-boundary", "version": "1.0.0", "type": "module", "exports": { ".": "./public.js" } }
```

```js
// node_modules/fixture-boundary/public.js
export const publicValue = 42;
```

```js
// node_modules/fixture-boundary/private.js
export const privateValue = 99;
```

`import('fixture-boundary')` exposes42; `import('fixture-boundary/private.js')` rejects ERR_PACKAGE_PATH_NOT_EXPORTED even though the file exists. This is a public module-interface boundary, not a sandbox that makes files unreadable through filesystem authority. A relative ESM import missing its extension can reject ERR_MODULE_NOT_FOUND; fix the actual specifier/package contract rather than suppress type errors or add arbitrary compiler flags.

```js
// legacy-counter.cjs
exports.count = 0;
exports.increment = () => { exports.count += 1; };
```

```js
// legacy-consumer.mjs
import legacy from './legacy-counter.cjs';
const { count: snapshot } = legacy;
legacy.increment();
console.log(snapshot, legacy.count); // 0,1; default import observes the CJS exported object.
```

Named CJS exports detected by Node use static analysis and are not a universal substitute for this explicit object interface. For a CJS caller, dynamic import can load an asynchronous ESM graph. Node24 can synchronously require suitable ESM graphs without top-level await; adding await to that graph can produce ERR_REQUIRE_ASYNC_MODULE. Treat that as a versioned compatibility condition, not permission to assume every package is require-compatible. createRequire(import.meta.url) provides an intentional CJS resolution bridge from ESM. Do not mix module-cache resets with per-request isolation; create a request-owned object instead.

[Independent reproduction criteria](../../../practice/node-js/module-01-nodejs-foundations.md).

References rechecked2026-10-22: [Node packages/exports/type detection](https://nodejs.org/api/packages.html), [ESM interoperability](https://nodejs.org/api/esm.html), [event loop and timer-version qualification](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick). The chapter's22.7+baseline does not imply every24-only interop behavior is identical on an older patch; pin/test the deployed version.
