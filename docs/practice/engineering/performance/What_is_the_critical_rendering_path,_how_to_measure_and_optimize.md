# Practice: What is the Critical Rendering Path, How to Measure and Optimize?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/What_is_the_critical_rendering_path%2C_how_to_measure_and_optimize.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** deliberately delay a CSS-imported font or JS-discovered hero, inspect initiators/waterfall and identify resource load delay, transfer and render delay. Compare one targeted discovery change. Acceptance: critical styles remain applied with JavaScript disabled/CSP enforced; no lazy LCP hero; no duplicate mismatched preload fetch; meaningful HTML/alt/dimensions survive failure; repeated same-condition traces substantiate the chosen trade-off. Record browser/tool versions and actual results; no measurement is supplied here. See the initial-load note for the typography/hero fixture.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
