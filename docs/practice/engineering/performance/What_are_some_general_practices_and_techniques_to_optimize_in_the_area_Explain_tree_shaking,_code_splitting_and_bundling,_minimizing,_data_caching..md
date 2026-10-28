# Practice: What are some general practices and techniques to optimize in the area? Explain tree shaking, code splitting and bundling, minimizing, data caching.

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/What_are_some_general_practices_and_techniques_to_optimize_in_the_area_Explain_tree_shaking%2C_code_splitting_and_bundling%2C_minimizing%2C_data_caching..md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** reproduce the fixture and inspect output edges; verify sentinel removal and equivalent click output. In a real Vite8 consumer, retain the production manifest/bundle analysis before/after one route split, confirm CSS and registration survive, check both supported export conditions, and measure initial plus feature-open cold/warm traces under recorded conditions. Deliberately break sideEffects metadata and observe the regression; restore it before acceptance. Confirm a failed chunk and an old open tab have a recovery path. Set a project-specific regression budget after collecting a baseline; a single >500kB warning is a diagnostic, not a universal readiness threshold. Real browser/network/consumer evidence remains learner practice.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
