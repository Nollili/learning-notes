# Practice: What is semantic HTML?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/A11y/What_is_semantic_HTML.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Form exercise:** implement the endpoint and optional fetch enhancement. Acceptance: no-JS search returns server-rendered results; invalid native fields prevent normal submit; server rejects bypassed invalid input; Enter and submit button work; name/value encoding is correct; repeated/disabled controls are tested; error summary links to fields; timeout/error preserves data and offers the native path. Keep server/interactive verification separate from documentation completion.

**Table exercise:** render initial rows on the server, add sort enhancement and test with keyboard/reader. Acceptance: headers/caption announced; button toggles sort and aria-sort; equal-price order stable; focus not lost; empty/error/data-loading states remain understandable; no-JS baseline and narrow/zoomed layout are usable. A visual arrangement alone does not establish the table relationships.

**Names/widget exercise:** predict role/name/description/state for the markup before inspection, then compare the rendered tree and actual reader output. Break one ID reference, override visible text, hide a focused descendant and stale an expanded state; explain each failure and fix it. Run the disclosure with/without JS, Tab/Shift+Tab/Enter/Space/Escape and teardown; run two independent tabs instances and table sorting. Acceptance: correct native behavior, visible label included in spoken name where applicable, coherent IDs/states, no hidden focus target or trap, useful no-JS path and retained test evidence. Actual browser/reader behavior remains learner practice; code parsing is not a conformance result.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
