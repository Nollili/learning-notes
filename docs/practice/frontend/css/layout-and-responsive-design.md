# Practice: Layout and Responsive Design: Reasoning and Debugging

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/CSS/layout-and-responsive-design.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** reproduce the200/244/156box calculations, parent-child margin collapse and a float escaping its parent. Acceptance: computed measurements match; border-box includes padding/border; flow-root fixes the intended containment without clipping focus/menus. Test text zoom/RTL before deciding that a fixed size is appropriate.

**Exercise:** remove the minimum/wrap fix and reproduce overflow with a long identifier, then restore it. Acceptance: controls wrap instead of disappearing; text remains available; no page-wide horizontal scroll at the supported narrow width; tab order follows meaningful DOM order; a nested column scroller does not force the whole shell taller. Record the failing and corrected computed-style evidence.

**Exercise:** build a sidebar/results layout plus cards with empty/one/many items, long translations and a table. Acceptance: track inspector explains each width; one intrinsic item does not widen the viewport; card columns adapt without device-name breakpoints; logical source order remains intact. Compare auto-fit/auto-fill with fewer items than possible tracks.

**Exercise:** reproduce transformed-ancestor fixed positioning, sticky under an accidental overflow ancestor, and the tooltip context failure. Acceptance: identify the exact containing/scroll/stacking ancestor; fix the root cause; no focus outline or essential content is clipped; zoom/sticky headers do not entirely hide the focused control. Record before/after screenshots in each supported engine; this is unperformed practice here.

**Exercise:** use delayed images/fonts/results to reproduce a shift. Acceptance: capture the entry/trace and identify the causal resource; add reserved dimensions/fallback metrics; repeat the same cold-cache/device conditions; record before/after lab evidence and a plan for field collection. Do not invent measurements, and do not call a local score a p75 improvement.

**Batch lab acceptance:** retain the five fixtures (box/flow, flex/grid overflow, sticky/stacking, container fallback, CLS) with expected behavior, actual per-browser results, screenshots/traces, chosen fix and residual limitations. Keep this practical evidence separate from completed learning material. No test result is supplied by this lesson.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
