# Learning notes

All new learning content follows the [approved reading and styling guide](guides/reading-theme-guide.md). The authoring instructions in [docs/AGENTS.md](docs/AGENTS.md) make this the default for Codex across all subjects: meaningful bold claims, plain headings, prominent Core answer panels, and dividers between questions.

The hub uses one presentation policy in `docs/.vitepress/content-policy.mjs`.

- Page titles and sidebar labels are unnumbered. Article sections receive automatic hierarchical numbers, such as `1`, `1.1` and `1.2`; the page outline uses the same numbers.
- Write headings without manual numbers or decorative emoji. Keep exercise identifiers, technical versions and numbered instructions when they carry meaning.
- Use full, readable titles instead of exported filenames. Senior Growth category names and generated catalogues share the same title formatter.
- Keep existing filenames and legacy heading IDs so links remain usable. Percent-encoded legacy IDs are decoded by the Markdown plugin; they are not visible labels.

Run `node --test scripts/content-policy.test.mjs` and `npm run docs:build` to verify presentation changes.

## GitHub Pages

This site is built with VitePress. In the repository's **Settings → Pages → Build and deployment → Source**, select **GitHub Actions**. The workflow in `.github/workflows/pages.yml` installs the locked dependencies, checks the content policy, builds with VitePress and uploads only `dist`. It uses the Pages base path so project-site URLs and custom domains receive the appropriate asset paths; local development remains at `/`.

After you push these changes to `main`, the workflow publishes the built site. You can also start it from the Actions tab. Codex must never push repository changes.

Do not use the automatic Jekyll branch build or run `actions/jekyll-build-pages` against this repository. JSX and n8n examples legitimately contain double braces, and Liquid processes them even inside Markdown code fences. `docs/public/.nojekyll` is copied to the generated site; keep it in the published artifact. Publishing raw Markdown or adding a marker alone does not build the VitePress application.

To verify the project-site build without changing existing generated output:

```sh
node --test scripts/content-policy.test.mjs
npm run docs:build -- --base /learning-notes/ --outDir /tmp/learning-notes-pages-check
```
