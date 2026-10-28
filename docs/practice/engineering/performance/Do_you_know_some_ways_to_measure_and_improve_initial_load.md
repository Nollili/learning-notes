# Practice: Do you know some ways to measure and improve initial load?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/Do_you_know_some_ways_to_measure_and_improve_initial_load.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise:** supply real font/image assets, create a typography specimen and measure cold/warm initial load. Acceptance: fallback is readable with failed font requests; supported accents/scripts remain correct; no clipped text with200% zoom and relevant text-spacing overrides; capture font-request discovery/bytes, line wrapping and layout-shift attribution before/after calibration; explain swap versus optional/system decisions; critical image is discoverable/eager with reserved geometry; baseline CSS works without script. Repeat identical conditions and record field-monitoring plan separately. No font binaries, browser measurements or learner results are supplied here.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
