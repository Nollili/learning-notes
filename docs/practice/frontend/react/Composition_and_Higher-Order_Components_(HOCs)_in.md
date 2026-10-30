# Practice: Composition and higher-order components in React {#practice-composition-and-hocs-advantages-and-disadvantages-why-composition-is-recommended-against-inheritance-in-react}

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/Composition_and_Higher-Order_Components_%28HOCs%29_in.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** reorder/remove/disable tabs while retaining ID-based selection, test duplicate IDs/empty items, verify one selected/tabbable tab, keyboard wrap/Home/End/Enter/Space and matching tab/panel references. Confirm hidden versus unmounted draft/resource behavior and focused-tab removal recovery. Test slots with translated/long content and a button inside the header. Run the actual component under React StrictMode and browser/assistive-technology checks; server-render/static contract checks do not establish keyboard or focus behavior. Learner practice remains required.

**Exercise acceptance:** run under StrictMode and assert forwarded ref points to the actual button, name/class/type are retained, caller handler precedes telemetry, preventDefault suppresses telemetry, telemetry failure is contained and pending/disabled prevents activation. Rerender the same enhanced type and retain the same DOM/ref owner; contrast a newly created type in a disposable stateful fixture. Reject an async telemetry sink and invalid native prop types at compile time. Test keyboard/focus/native accessibility in an allowed browser separately; DOM simulation does not establish those results. Learner implementation remains required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
