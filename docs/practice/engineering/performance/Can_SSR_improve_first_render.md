# Practice: Can SSR (Server-Side Rendering) Improve First Render?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/Can_SSR_improve_first_render.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** implement the article route with validated data, loading/error boundaries and one small client filter. Acceptance: useful initial HTML and correct status/error behavior; native links work without JS; no mismatch/secret leakage; stale/private cache behavior is explained; slow/failing upstream requests terminate; filter state/keyboard behavior survives hydration. Compare cold/warm CSR and SSR/SSG alternatives under the same device/network/data; retain waterfall, LCP and interaction traces plus server timings. No installed Next runtime, executed app or learner measurements are claimed here.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
