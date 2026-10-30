# H2 — Improve loading and interaction

**Learner status: outstanding.** Second required performance hometask. Prerequisites: H1 evidence and the applicable [reading lessons](../../../frontend/performance/). Use the same artifact lineage, dataset and user journeys.

## Goal

Evaluate **one loading intervention and one interaction intervention independently**. Do not combine several fixes before measuring: you need to know which change caused the result. Keep a baseline variant and compare each intervention against it; then evaluate the combined accepted version in H3.

## Part A: choose the loading cause from H1

| Observed cause | Candidate intervention | Required observations |
|---|---|---|
| Hero discovered after JS/API | Declare appropriate image in HTML, or justify a matching preload | Initiator/start, LCP subparts and contention; no lazy hero |
| Oversized card/hero images | Generate responsive variants with correct `sizes`, formats and dimensions | `currentSrc`, displayed/intrinsic size, DPR, bytes, quality and shifts |
| Font/CSS delays text | Reduce actual CSS/face/subset cost, improve discovery or compare display strategy | Readability, font bytes/requests, wrapping, CLS and no-JS/CSP behavior |
| Initial JS contains optional feature | Split at a feature/route boundary; correct excessive imports | Production graph, initial bytes, first feature-open cost, loading/error behavior |
| Repeated public asset fetch | Correct compression or explicit cache policy | Response headers, transferred/decoded size, cold and warm paths, freshness correctness |

Select one row justified by the trace. Use a bounded, targeted change. For images, verify fresh navigations at 320/768/1024/1920 CSS-pixel widths and at least one high-DPR condition. For fonts, test real supported accents and failed/delayed loading. For bundles, preserve required CSS/polyfills/registration; explain whether the saving came from deduplication, deep imports or ESM tree shaking.

A critical-CSS plugin, differential builds, a CDN deployment and a service worker are not mandatory. They are optional specialist exercises when they solve the chosen problem.

## Part B: choose the interaction cause from H1

Use an equivalent computation and output for the comparison. Choose one of these approaches based on the trace:

- Reduce algorithm/data work or bound/render fewer records when filtering or DOM volume dominates.
- Yield between small tasks when a modest calculation can be divided safely.
- Use a dedicated worker when expensive independent CPU work justifies startup/message costs.
- Reduce forced synchronous layouts by changing read/write ordering.
- Address demonstrated React component work with narrower state ownership or justified memoization after confirming correct identity.

Keep controlled input updates immediate. Debounce may reduce requests but intentionally delays result start; it does not cancel in-flight work or remove stale-response races. A worker cannot manipulate DOM, and a service worker is not the default calculation abstraction. Compare input-to-feedback and total result completion; responsive feedback does not prove fast completion.

## Verification for each intervention

Repeat at least three matching before/after trials, adding more if noise makes the comparison uncertain. Save traces, raw data and a small diff for each experiment. Record what worsened as well as what improved: e.g. first feature-open latency or total compute time.

Keep the user-visible output equivalent. Check keyboard action/focus, no clipped or missing content, delayed/failed resources and navigation during pending work. For async/worker changes, replace queries rapidly so late work cannot overwrite current results; clean up owners on disposal. For code splitting, deliberately fail a chunk and observe bounded recovery. For images/fonts, retain readable content and reserved geometry while requests fail.

## Acceptance and decision

The report contains both categories, each with a causal explanation and reproducible comparison. Explain whether the measured change is large enough relative to run variation to support the conclusion. A plausible but ineffective intervention can be rejected and reverted; retain its report and explain the next hypothesis. Do not claim a saving from the source material as your measured result.

For accepted changes, summarize the user benefit, implementation cost, support limitations and remaining risks. Keep the working version ready for [H3 — Verify and prevent regressions](./03-verify.md).
