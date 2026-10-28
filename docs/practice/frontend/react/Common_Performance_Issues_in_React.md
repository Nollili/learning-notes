# Practice: Common Performance Issues in React

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/Common_Performance_Issues_in_React.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** profile one slow management-screen interaction, change exactly one hypothesis-driven bottleneck, then repeat. Acceptance: attach trace/config/data/version and a before/after table; verify behavior/a11y unchanged; record regressions and uncertainty; remove a memo that costs more than it saves. Include same-id field changes, stale callback behavior and unmount-time timer cancellation in correctness tests. Material does not supply measured results.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.


## **Performance Checklist**

| **Issue** | **Optimization** |
| --- | --- |
| Unnecessary re-renders | Use `React.memo`, `useCallback`, `useMemo`. |
| State updates | Minimize state updates; avoid deeply nested state. |
| Large lists | Use virtualization (`react-window`). |
| Heavy initial load | Implement lazy loading and code-splitting. |
| Context overuse | Memoize context values and avoid excessive usage. |
| Frequent event updates | Throttle or debounce event handlers. |
| Deep component trees | Split into smaller components to isolate updates. |

---
