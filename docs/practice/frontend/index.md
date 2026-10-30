# Frontend practice sequence

**Every stage is outstanding learner practice.** Reuse [P-328, P-329 and P-330](../frontend-project.md); these smaller increments make the existing management-screen specification achievable. A public two-course corpus reduces setup in F01–F05. F06 introduces two users and server authority deliberately; a public fixture cannot establish authorization.

## Staged sequence

| Stage | Prerequisites and scope | Observable result |
|---|---|---|
| [F01 — document and interaction](./f01-document.md) | Basic HTML; native public search and one dialog | No-JS task, names, keyboard/focus and recovery work |
| [F02 — responsive CSS](./f02-layout.md) | F01; layout/cascade/theme | Long content and focus remain usable at narrow/wide widths |
| [F03 — JavaScript lifetime](./f03-javascript.md) | Functions, closures, promises; owned search | Late work cannot overwrite current intent; cleanup releases owners |
| [F04 — typed boundary](./f04-typescript.md) | F03; strict TS and runtime parsing | Invalid payloads reject; impossible states fail compile |
| [F05 — React ownership](./f05-react.md) | F01–F04; P-329 | Stable drafts, truthful forms, races and effect cleanup |
| [F06 — Next and contracts](./f06-next.md) | F05 plus HTTP and server authorization; P-328/P-330 | Narrow client boundary, defined freshness, authorized mutation |

Each stage records source revision, environment, expected/actual outcomes, one failure→correction→retest and explicit unperformed checks. Do not duplicate the full application per topic. Keep smaller counterexamples isolated from the working version.

## Performance hometasks

After the relevant browser/JavaScript foundations (and F05/F06 for framework-specific choices), complete [H1 — investigate, H2 — improve, H3 — verify](./performance/). Reuse this app and the existing E02 performance increment. The core sequence is required practice in the performance path; Webpack compatibility, critical-CSS automation, workers and offline service workers are optional extensions.

## Extracted lesson requirements

The linked topic indexes list the original exercises moved out of textbook paragraphs. They refine the same projects; they do not require a new application per page.

- [HTML/accessibility cases](./a11y/)
- [CSS cases](./css/)
- [JavaScript cases](./general_es6/)
- [TypeScript cases](./typescript/)
- [React and Next cases](./react/)

[Reference workbench](../../workbench/frontend/) supplies examples, not completed learner deliverables. [Author verification](../../frontend/verification.md) is a separate evidence ledger.
