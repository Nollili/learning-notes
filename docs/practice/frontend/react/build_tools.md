# Practice: Build tools for React, Vite, CRA, Webpack

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/build_tools.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** document the framework/build-tool choice and alternatives; reproduce a clean dependency install, typecheck and production build/preview; test a deep link, dynamic chunk, environment value and asset under the real base path; ensure secrets do not enter client assets. Keep migration/benchmark evidence separate from learning-material completion. No CRA/Vite application migration was executed here.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.


## Acceptance and failure drill

Retain compiler/tool versions, locked install and commands. Acceptance: browser alias typecheck passes; injected type error fails; missing alias produces the expected host-specific failure; NodeNext emits and runs with `.js` imports; deliberate failure maps to the original TS line; staging excludes nested maps and refuses an existing output; map inventory is associated with exactly one release/hash. Demonstrate the private upload/retention policy against a chosen provider in learner practice, and prove public map URLs are unavailable after deployment.

Check an actual supported browser and production base path separately. Documentation/example checks do not establish that the learner has completed this lab.

Official references checked 2026-10-21: [TypeScript host resolution](https://www.typescriptlang.org/docs/handbook/modules/reference), [moduleResolution](https://www.typescriptlang.org/tsconfig/moduleResolution), [Vite8 build options](https://vite.dev/config/build-options), [Node source-map support](https://nodejs.org/docs/latest-v24.x/api/cli.html#--enable-source-maps), [Node file copying](https://nodejs.org/docs/latest-v24.x/api/fs.html#fspromisescpsrc-dest-options).
