# Pinned runtime verification and boundary practice

The version22 setup demonstrates a compatibility baseline, not the newest release. The local checks below use Node24.18.0; official version24 documentation may display a later patch. Retain the actual runtime in evidence and test the deployment version rather than assuming every patch has identical interoperability behavior.

**Historical author verification, 2026-10-25:** exact current limiter source strict-compiles; the existing module lab passes live ESM bindings, CJS snapshot/object behavior, ESM temporal-dead-zone and CJS partial cycles, public exports/private-subpath denial, missing relative extension, synchronous require(ESM), TLA rejection, and CJS/ESM queue prefixes. A separate fresh ambiguous-package fixture confirms syntax detection, explicit commonjs rejection of ESM syntax and dynamic import inside CJS. Timer/immediate relative order is deliberately unconstrained. Promise adoption remains pending until the adopted promise settles; later rejection cannot override it. These local fixture checks are distinct from learner practice.

When debugging, first record the nearest package type, extension, runtime, call context and exact thrown error. Then reduce the failing case. Do not change module settings merely to silence a symptom. For callbacks, catch parsing errors in the callback and propagate once; for promise handlers, return the promise so rejection stays in the chain. A passing import/scheduling fixture does not prove application authorization, bounded input or network cancellation.

[Related practice](../../../practice/node-js/module-01-nodejs-foundations.md).

Official references checked2026-10-25: [Node package syntax detection](https://nodejs.org/api/packages.html#syntax-detection), [nextTick versus microtask context](https://nodejs.org/docs/latest-v24.x/api/process.html#when-to-use-queuemicrotask-vs-processnexttick), [HTML event-loop/rendering model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops). Browser rendering opportunities are not Node event-loop phases.
