# Performance hometasks

**All learner work is outstanding.** These three core hometasks apply the [performance learning path](../../../frontend/performance/) to one course catalogue or the existing P-328/P-329 product. They refine [E02 — Measured performance](../../engineering/e02.md), rather than adding another mandatory application.

## Required sequence

| Hometask | Prerequisites | Deliverable |
|---|---|---|
| [H1 — Investigate a slow journey](./01-investigate.md) | Working browser application; measurement and loading lessons | Reproducible baseline, causal trace and prioritized hypotheses |
| [H2 — Improve loading and interaction](./02-improve.md) | H1; image/CSS/bundle and runtime lessons as applicable | One loading intervention and one interaction intervention, evaluated independently |
| [H3 — Verify and prevent regressions](./03-verify.md) | H2; cache/delivery lesson | Comparable final evidence, a working regression check and a monitoring/release plan |

H1 can begin after HTML/CSS/JavaScript foundations. The interaction intervention can use native DOM or React after F05; Next/SSR comparisons follow F06. Keep the same dataset and user journeys across stages. Expand a tiny fixture with deterministic public/generated records when necessary; record the generator seed and data volume. Do not introduce private customer data or deliberately expensive work into a real product.

You do not need to implement every optimization. Choose a cause observed in the trace. If a plausible experiment fails to improve the outcome, retain that evidence, explain the result and revert the ineffective change. H2 still requires trying both intervention categories; a well-supported rejection is acceptable evidence, not an invitation to invent gains.

## Shared hand-in structure

```text
performance-evidence/
  README.md              # revision, setup, journeys, environment and reproduction
  baseline/              # raw runs, reports, trace or sanitized HAR
  experiments/           # one folder per intervention and its measured runs
  final/                 # comparable final runs and behavior checks
  report.md              # causal explanation, trade-offs, limits and decision
```

Keep source changes small and reviewable in the existing app. Link the exact revision or local diff in the report. The folder layout is suggested; the evidence and reproducibility are required. Do not commit secrets, personal data or authenticated HAR bodies. Use a public lab or sanitize exports.

Each report follows **before → hypothesis → change → evidence → trade-off**. Label measured values, illustrative values, unperformed checks and planned production observations distinctly. All raw trials count; do not present only the best score.

## Completion criteria

- Another learner can reproduce the baseline and experiment from recorded setup and steps.
- A trace connects the selected cause to the user-visible delay; file-size or render-count evidence alone is insufficient.
- The page remains correct, readable and keyboard usable under the declared failure cases.
- Results distinguish cold/warm runs, local/synthetic evidence and field data; no field p75 is inferred from a handful of lab trials.
- A regression check demonstrably catches an intentional local regression and passes after restoration.
- Remaining device, accessibility, browser and production gaps are stated honestly.

There is no universal Lighthouse-score pass mark or imported lateness penalty. H1–H3 are required practice checkpoints for this learning path; reading or copying a worked example does not complete them.

## Optional extensions

| Extension | Exercise | Additional evidence |
|---|---|---|
| Browser-target / differential build | Adapt EPAM's Babel/Webpack task; record resolved modern/legacy targets and syntax/API policy | Three comparable bundle variants, equivalent behavior and both supported target paths; explain `module`/`nomodule` limits |
| Responsive compatibility | Generate 320/768/1024/1920 candidates; supply WebP/JPEG, optionally AVIF; conditionally handle missing native lazy loading | Fresh navigations at multiple DPRs, `currentSrc`, no blank images without enhancement, eager LCP |
| Critical-CSS automation and fonts | Extract initial rules for narrow/tablet/wide views; compare Roboto/Raleway with a smaller/system alternative using licensed assets | Dialog/error/focus states, no-JS/CSP behavior, fonts delayed/failed, supported accents, 200% text |
| Webpack dependency analysis | Two entries using Lodash; analyze full, deep-import and ESM variants, shared chunks and production output | Equivalent results, actual dependency graph, initial/feature bytes, required side effects retained |
| Dedicated Web Worker | Move a bounded calculation off the page thread; compare against main-thread/chunked alternatives | Equal output, input remains usable, message/startup costs, stale reply/error/termination cases |
| Offline service worker | Cache public versioned assets with an explicit update policy | Install/control/update, failed precache, old tab/new deployment, eviction/offline recovery, no private-response caching |
| SSR/streaming or large-list architecture | Compare an observed CSR/hydration or DOM-volume bottleneck | Server and browser costs, meaningful HTML, first interaction, focus/selection and failure recovery |

These are modernized local exercises. The original EPAM template's exact plugin names, output filenames and marked-comment rules apply only when undertaking that original assignment. Completing a local extension does not claim a passing EPAM submission. Infrastructure setup and original private-repository access are not required for H1–H3.

[Start H1](./01-investigate.md) · [Reading path](../../../frontend/performance/) · [Existing focused performance cases](../../engineering/performance/)
