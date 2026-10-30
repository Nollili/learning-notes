# Performance source mapping and merge decisions

Merged **2026-10-28**. This learning path combines existing frontend/senior-growth explanations with the user-supplied EPAM **Web Performance** self-study extracts, tools homework, six additional task descriptions and accompanying figures. The EPAM category pages were inaccessible through browsing during the initial review; the supplied text is the evidence for their contents. The private template repository was not cloned or executed.

## Where each module now belongs

| Supplied material | Merged teaching owner | Practice |
|---|---|---|
| Module 1: metrics | [Measurement](./measurement.md), with current INP and complete CLS coverage | H1 investigation and H3 regression report |
| Module 2: tools and food-card audit | [Measurement](./measurement.md); compression and resource diagnosis in [delivery](./delivery.md) / [caching](./caching.md) | H1 baseline, H2 isolated changes |
| Module 3: link/script attributes and browser targets | [Delivery](./delivery.md), existing script trace lab | H2 discovery; optional browser-target comparison |
| Module 4: images | [Images](./images.md) | H2 asset option; optional exact course compatibility exercise |
| Critical CSS and font optimization | [CSS/fonts](./css-fonts.md), existing font calibration | H2 asset option; optional extraction and two-family comparison |
| Module 6: PRPL, splitting, Lodash and analyzer | [Delivery](./delivery.md), existing production module-graph fixture | H2 delivery option; optional two-entry Webpack comparison |
| Module 7: loading, CDN, caching, service workers | [Caching](./caching.md) and [runtime](./runtime.md) | H2 interaction, H3 delivery plan; optional worker/offline labs |

The [existing senior-growth catalogue](../../senior_growth/Web_Performance/) continues to own its worked debounce/search, layout, animation, memory, script-order, bundle and SSR examples. The new path supplies ordering, missing asset/cache explanations and explicit modern corrections. [Homework](../../practice/frontend/performance/) refines E02 and P-328/P-329; it does not require another unrelated product.

## Corrections preserved in the teaching

- Current Core Web Vitals are LCP, INP and CLS. FID/FMP/TTI are historical context; load events do not establish readiness.
- Async network requests do not normally occupy the page thread while awaiting bytes. Parsing, execution, style/layout and data processing have different costs.
- `defer` changes parser timing, not the execution cost; a display's refresh rate changes its available frame time.
- Use `fetchpriority`, current script/module semantics, feature detection and an explicit support policy. Old compatibility grids and fixed global browser-share thresholds are not current support evidence.
- Valid `picture`/`img` markup, `sizes`, DPR, reserved dimensions and eager LCP content replace the invalid alternative image example and indiscriminate lazy-loading advice.
- Font subsets are generated assets; `unicode-range` alone does not shrink binaries. Neither `local()` nor two formats nor a particular plugin is universally required.
- Styles/polyfills can be side-effectful. Correctly distinguish `usedExports` from `providedExports`, shared chunks, deep imports and ESM tree shaking.
- Dedicated Web Workers are the default computation exercise; service workers teach request/offline lifecycle. Old storage APIs and incomplete cache snippets are not copied as working solutions.
- HTTP validation and application Cache Storage policies differ. A CDN or service worker is not an automatic speed guarantee.
- Coursework penalties, grade bands, mentor access and “change only under comments” restrictions remain original-course context. They do not direct repository actions or become rules for these local learning exercises.

If submitting the original EPAM assignment, use its actual template, support requirements and rubric. A modernized local exercise does not claim equivalence to its grader. No private-repository access, hosting setup, publication or remote push is part of this merge.

## Visual provenance

Two figures were copied from the user's supplied course attachments into the repository so lessons do not depend on temporary clipboard paths:

| Local asset | Supplied figure | How it is used |
|---|---|---|
| `images/performance/first-contentful-paint.png` | Image #7, first paint versus contentful paint | Conceptual stages; illustrative times explicitly marked |
| `images/performance/eager-lazy.png` | Image #29, eager versus lazy loading | Conceptual offscreen savings; eager hero exception explained |

Original authorship/license was not established from the pasted extracts; retain this provenance and verify redistribution rights before republishing these supplied figures beyond the learning repository. Mermaid diagrams are newly authored simplified teaching models: investigation loop, LCP phases, resource graph, responsive selection, CSS delivery, rendering pipeline, worker messaging, HTTP validation and service-worker lifecycle. Historical TTI/FID dashboards and provider-console images are omitted from the current teaching to avoid presenting them as up-to-date procedures.

## Supplementary official reading

Use references beside each lesson for exact contracts. Broader reinforcement: [Learn Performance](https://web.dev/learn/performance), [Chrome Performance panel](https://developer.chrome.com/docs/devtools/performance/overview), [Core Web Vitals](https://web.dev/articles/vitals), [Webpack tree shaking](https://webpack.js.org/guides/tree-shaking/), [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching).

## Verification boundary

Documentation author checks are recorded in [performance verification](./verification.md). Code blocks with example asset paths and deployment headers are teaching fragments, not an installed application or measured improvement. Real assets, learner traces, RUM collection, browser compatibility and service-worker lifecycle results remain separate practice evidence.
