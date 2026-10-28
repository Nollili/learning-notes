# F02 — Layout, cascade and themes

**Learner status: outstanding.**

## Prerequisites

F01; box model, intrinsic sizing, specificity and units.

## Scope

Style the same form/table plus one card with a long identifier. Use flex/grid, a wrapping strategy, a semantic token and two themes; choose CSS Modules, BEM or another explicit ownership policy.

## Observable acceptance

At 320 CSS px and a declared wide width, labels/actions remain readable and keyboard reachable without page overflow. A genuinely two-dimensional table may scroll in a named keyboard-accessible container. Predict a layered/unlayered computed style and confirm it. Focus is visible and not clipped.

## Failure cases

Remove min-inline-size:0, add a global override, use long translated text, change default font size and simulate failed media. Explain the root cause of each failure rather than hiding overflow.

## Evidence to record

Capture dimensions/computed styles and screenshots before/after. Measure contrast for actual token/state pairs. Record zoom, forced colors, reduced motion where relevant, and supported-engine gaps.

Return to [the sequence](./index.md) and [original P-328–P-330 specification](../frontend-project.md). Author verification never completes this stage.
