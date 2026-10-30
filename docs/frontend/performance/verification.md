# Performance material verification

Merge date: **2026-10-28**. **All H1–H3 learner practice remains outstanding.** This ledger covers the performance documentation merge only; earlier frontend checks remain in [frontend author verification](../verification.md).

## Scope

Added an ordered performance path, seven subject/source pages, three core hometasks and optional specialist extensions. Existing senior-growth/workbench references remain canonical. Two supplied conceptual figures are stored locally with provenance, and nine new Mermaid diagrams explain mechanisms. No submission templates, package scripts or `src/tests` were changed.

## Author checks

- `node --check docs/.vitepress/config.mjs` passed.
- `npm run docs:build -- --outDir /private/tmp/performance-merge-site` passed using VitePress 2.0.0-alpha.12. Output was isolated to preserve the existing generated `dist` changes. The existing warning about chunks larger than 500 kB remains; no chunk tuning or package configuration changes were made.
- Source destination checks passed for all 13 new pages. Rendered HTML checks across those pages and seven connected entry/map pages found **zero missing local destinations or anchors in 985 links**.
- In the Codex in-app browser at **709 × 853 CSS pixels**, the path and six subject pages rendered all **nine Mermaid diagrams** with no diagram error blocks. Both supplied figures loaded with alternative text. These pages and the homework overview/H1/H2/H3 showed no document-width horizontal overflow at that viewport.
- Screenshots of the course entry, homework overview and responsive-selection diagram were visually inspected for legible headings, table wrapping and diagram labels. The homework pages displayed the expected headings and sidebar links. This is a desktop embedded-browser observation, not a mobile-device or browser-matrix result.
- This documentation repository supplies `docs:build`, not root `build`, `test` or Module 4 coverage scripts. No submission implementation was added; those Autocode commands remain requirements when implementing a task in its actual template.

No learner measurements or performance improvements were fabricated. The browser preview was local only.

## Limits

No course homework submission, private EPAM template execution, production optimization, image/font asset generation, live RUM ingestion, synthetic CI service, worker integration or service-worker install/update test is implied. Example asset URLs require real binaries supplied by the learner. Homework byte/timing budgets must be derived in the target application. Documentation generation is separate from browser performance measurement, learner mastery and production readiness.
