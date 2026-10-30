# Practice: React testing with Jest, Vite and React Testing Library {#practice-jest-vite-and-react-testing-library-rtl}

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/React_testing.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** run the exact tests and strict typecheck; change the button's accessible name, remove pending protection, suppress the error or report success before resolution and confirm the relevant behavior test fails. Separately inspect keyboard focus, long translations, zoom, contrast, mobile touch and real screen-reader output in a browser. Pin versions/environment and retain results. Browser visual/accessibility and learner practice remain required; jsdom tests are explicitly not those checks.

**Combined exercise acceptance:** run the SaveButton pending/error/retry tests, then run the browser fixture in an allowed environment. Remove its input label and confirm the accessible-name locator fails; break the ordinary form action and confirm the JavaScript-disabled test fails; reject the JSON request and retain input plus a working fallback. Record which layer catches each mutation. Complete the specified manual keyboard/reader/zoom cases separately. Current material includes executable component tests and browser test definitions; native browser, screenshot and assistive-technology results remain unperformed here.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
