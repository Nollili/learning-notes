# Practice: Could you compare gulp with webpack?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Other/Could_you_compare_gulp_with_webpack.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** create a small ESM fixture with one unused export and one effectful registration/CSS file; compare the emitted graph/size and observable behavior under correct/incorrect side-effect metadata. Capture a generated stack, map it using the exact matching release map and reject a mismatched map. Reproduce an alias that typechecks but fails bundling, then fix the actual host configuration. Retain versions/commands/diff and measure rather than asserting automatic speed gains. Learner practice remains required. References: [webpack tree shaking/sideEffects](https://webpack.js.org/guides/tree-shaking/), [webpack source-map choices](https://webpack.js.org/configuration/devtool/), [Vite build options](https://vite.dev/config/build-options).

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
