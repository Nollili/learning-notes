# Learning content authoring

Before creating or substantially revising learning content, read and follow [the approved reading and styling guide](../guides/reading-theme-guide.md). It applies to all subjects and new sections, not only Node.js Foundations. Apply it during the requested content work without separate styling approval.

- Read the complete section before choosing emphasis.
- Use short, meaningful bold phrases that express distinctions, conditions, consequences and exceptions. Reading only headings and bold phrases should reveal the main argument. Keep surrounding explanations mostly plain; do not automatically emphasize technical terms or every occurrence.
- Reuse the shared amber text and tinted background for bold prose. Do not introduce lilac emphasis, inline color styles, nested emphasis wrappers or page-specific styling.
- Never highlight headings or structural labels, even when represented by bold Markdown. Use `notes-section-label` for bold subsection labels and examiner question labels.
- Make `notes-core-answer` panels titled “Core answer” the strongest visual anchor in question-based teaching sections. Reuse the guide's exact markup. Do not invent panels for navigation, reference lists or exercise-only pages.
- Separate complete question sections with Markdown horizontal rules and blank lines. Keep the preceding question's examples, practice and references before its divider.
- Preserve technical meaning, runnable code, stable heading IDs, navigation and the existing presentation policy. Keep unrelated existing content outside the task scope.
- Use `node-js/tech-check/01-runtime-fundamentals.md` as the approved visual reference. Verify the headings-and-bold-only reading before considering new content complete.

Run `node --test scripts/content-policy.test.mjs` and `npm run docs:build` from the repository root for content changes. Follow the guide's temporary output-directory option when preserving existing generated files. These documentation checks do not replace any applicable Autocode build, test or coverage requirements. Never modify `src/tests` or push to a remote.
