# Practice: What is the best, most efficient way of performing animations in webpages?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/What_is_the_best%2C_most_efficient_way_of_performing_animations_in_webpages.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** add a nonessential feedback effect using the helper, then implement a timestamp-based rAF alternative with cancel/dispose. Acceptance: rapid replacement has one active animation; cancellation produces no unhandled rejection; changing reduced motion stops the effect; repeated disposal is harmless; no effect starts after disposal; semantic confirmation remains in static mode. Record traces at60/120Hz where available, normal/throttled CPU, paint flashing and layer memory before/after. Explain observed layout/paint and frame misses; do not invent FPS/GPU results. Browser checks remain required; mocked lifecycle checks alone cannot prove smoothness.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
