# Practice: How do you start a REACT project from scratch?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/How_do_you_start_a_REACT_project_from_scratch.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** create a pinned client app, render an accessible labeled form and one lazy route, then run typecheck/lint/tests/build/preview as configured. Test deep-link refresh, invalid route, missing root, asset base path, chunk loading, failed API and no-JS behavior; map one production stack trace through the chosen source-map policy. Record versions/lockfile/commands/results and keep the app buildable in small increments. No React/Webpack application install/build was performed in this notes repository. Its docs build only checks the study material.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.


## Reproducible setup and production acceptance

Applicable React19 client root API: createRoot; hydrateRoot for existing server-rendered React HTML. ReactDOM.render was removed in React19. The automatic JSX transform is required by current React; explicit Babel runtime configuration above avoids relying on a changing preset default. These instructions are a setup lesson, not changes to this repository's VitePress scripts.

The manual Webpack/Babel path is an alternative learning lab. Pin compatible Webpack5/Babel/plugin versions and lockfile; choose consistent module config extensions. Babel transpilation does not typecheck TypeScript. If adding TS, configure parser/loader plus a separate tsc --noEmit check and correct TS/browser/module targets. Resolve extension/alias settings consistently across bundler, typechecker and tests; an editor alias alone does not change runtime resolution. Source maps improve debugging but must not expose secrets/private source unintentionally in a public deployment.

Use the scaffold's current scripts/config rather than installing unrelated tools blindly. Add accessible base HTML, CSS ownership, one meaningful route, error/loading behavior and a server boundary for secrets. A client environment prefix is public configuration, not secret storage. Avoid installing every store/form/styling library in a starter: local state, CSS Modules, native fetch and an explicit router/query requirement are enough to begin.


Official references checked2026-10-21: [CRA deprecation](https://react.dev/blog/2025/02/14/sunsetting-create-react-app), [React19 removed APIs/JSX](https://react.dev/blog/2024/04/25/react-19-upgrade-guide), [Vite scaffold](https://vite.dev/guide/), [Babel React preset](https://babeljs.io/docs/babel-preset-react), [Webpack TypeScript](https://webpack.js.org/guides/typescript/).

For executable compiler configuration, alias failure drills, NodeNext output and production source-map handling, complete the [worked build and resolution lab](../../../senior_growth/React/build_tools.md#worked-lab-typechecking-host-resolution-and-private-source-maps). This supplies the concrete configuration beyond the setup checklist above.
