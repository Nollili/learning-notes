# Learning notes

All new learning content follows the [approved reading and styling guide](guides/reading-theme-guide.md). The authoring instructions in [docs/AGENTS.md](docs/AGENTS.md) make this the default for Codex across all subjects: meaningful bold claims, plain headings, prominent Core answer panels, and dividers between questions.

The hub uses one presentation policy in `docs/.vitepress/content-policy.mjs`.

- Page titles and sidebar labels are unnumbered. Article sections receive automatic hierarchical numbers, such as `1`, `1.1` and `1.2`; the page outline uses the same numbers.
- Write headings without manual numbers or decorative emoji. Keep exercise identifiers, technical versions and numbered instructions when they carry meaning.
- Use full, readable titles instead of exported filenames. Senior Growth category names and generated catalogues share the same title formatter.
- Keep existing filenames and legacy heading IDs so links remain usable. Percent-encoded legacy IDs are decoded by the Markdown plugin; they are not visible labels.

Run `node --test scripts/content-policy.test.mjs` and `npm run docs:build` to verify presentation changes.
