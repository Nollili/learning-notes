# Level-up reading theme and coloring guide

## Purpose

Implement a calm dark reading theme for frequent study on a 13-inch Mac and a smaller tablet. Use warm charcoal, soft ivory text, and purposeful background highlights for revision. These are design preferences to evaluate on the actual devices, not a guarantee of reduced eye strain.

This is the approved default authoring and styling policy for all new learning content in this repository, across every subject. Codex must read and apply it when creating a page, adding a section, or substantially revising an existing section. Apply it as part of the content work without asking for separate styling approval. Keep unrelated existing content outside the requested scope.

Use the Node.js Foundations pages in `docs/node-js/tech-check/` as the approved visual reference, starting with `01-runtime-fundamentals.md`. Follow the principles rather than copying the number or placement of highlighted phrases.

For question-based notes, include a Core answer panel and separate complete questions with horizontal rules. For narrative lessons, use a Core answer panel for each major teaching section's central explanation where appropriate; retain a natural heading hierarchy rather than turning every paragraph into a question or panel. Index pages, navigation lists, references and exercise-only pages do not need artificial Core answer blocks. The emphasis and heading rules still apply everywhere.

## Repository integration

- Extend the existing VitePress theme; do not replace it or add a styling plugin.
- Inspect `docs/.vitepress/theme/index.mjs`, `docs/.vitepress/theme/styles.css`, and `docs/.vitepress/config.mjs` before editing. Preserve existing Mermaid behavior, section numbering, navigation, and content policy.
- Put shared colors and emphasis styles in the theme stylesheet. Use CSS custom properties, with dark values scoped to `.dark`.
- Set `appearance: 'dark'` in the VitePress config when implementing this brief. Retain the appearance toggle and respect an existing saved preference. Do not force dark mode on every navigation.
- Give any new emphasis classes readable light-mode values as well. Do not apply dark-theme foreground colors unconditionally.
- Keep content wording, filenames, heading IDs, and heading hierarchy intact when adding emphasis.
- Never edit generated `dist` files by hand. Preserve unrelated work. Never push changes to a remote.

## Base palette

Use these exact starting values. Adjust a pair only if contrast or device review identifies a problem; record the reason.

| Role | Dark color | Suggested token / mapping |
| --- | --- | --- |
| Page background | `#202020` | `--vp-c-bg` |
| Sidebar and code surface | `#191919` | `--vp-c-bg-alt`; inspect code-specific tokens |
| Elevated surface / callout | `#292929` | `--vp-c-bg-soft`, `--vp-c-bg-elv` |
| Main reading text | `#D8D5CE` | `--vp-c-text-1` |
| Headings | `#ECE8DF` | `--notes-heading` |
| Bold emphasis text / background | `#F0CB91` / `#443B28` | `--notes-bold` / `--notes-bold-bg` |
| Secondary readable text | `#AAA69D` | `--vp-c-text-2` |
| Muted labels | `#AAA69D` | `--vp-c-text-3`; keep meaningful labels readable |
| Decorative divider | `#3D3B38` | `--vp-c-divider` |
| Link / active navigation | `#9DBBDD` | `--vp-c-brand-1` |
| Hovered link | `#B8D1EB` | `--vp-c-brand-2` |
| Key term text / background | `#BED4AE` / `#303D32` | `--notes-highlight-term-text` / `--notes-highlight-term-bg` |
| Positive outcome | `#ABC49A` | `--notes-success` |
| Caution text | `#DEC38C` | `--notes-caution` |
| Error / destructive consequence | `#E5A0A0` | `--notes-danger` |

Inspect the installed VitePress variables before mapping brand, button, selection, and code colors. A link foreground is not automatically an appropriate button background. Define and check their foreground/background pairs separately. Decorative divider colors are not suitable for focus rings or essential control boundaries.

Use solid text colors rather than lowering paragraph opacity. Avoid pure white body text, neon accents, gradients behind prose, and large saturated panels.

## Inline emphasis

Emphasis is a revision aid. After a full reading, the reader should be able to read only the headings and bold phrases and recover the topic's main argument, rather than a list of technical terms.

1. Read the complete question section, including its examples, conditions, failure paths, exceptions and takeaway, before choosing emphasis.
2. Bold short, meaningful phrases with Markdown `**...**`. Keep surrounding explanations mostly plain. The shared theme supplies colored text and a tinted background; do not nest a mark inside bold.
3. Prioritize distinctions, conditions, consequences and exceptions. Keep the subject, negation and necessary qualifier inside the bold phrase. For example, prefer **exports takes precedence over main** to **takes precedence**.
4. Do not automatically bold every technical term, its first occurrence, or every repetition. Use a few connected claims that explain what matters and why. There is no density or highlight-count target.
5. Make the **Core answer** block the strongest visual anchor in each question. Keep the answer complete, with selected bold claims; leave detailed explanations visually quieter.
6. Read back just the question heading and bold claims in order. They must preserve the main distinction and its important limit. Revise fragments that depend on unmarked words to reveal what is true, false or conditional.

### Structural labels and headings

Headings never receive a text-highlight background, even when their Markdown contains bold. This includes page headings, question headings, subsection labels such as “Detailed explanation,” example labels and examiner follow-up questions. Use spacing, weight and hierarchy to distinguish them. Links remain blue and underlined, including bold links. No lilac or purple editorial emphasis.

Where an existing standalone bold label acts as a subsection heading, wrap it in an inline `notes-section-label` span to preserve its wording and Markdown rendering without a background:

```md
<span class="notes-section-label">**Detailed explanation**</span>
```

Apply the same wrapper to a bold examiner question that serves as a label before its explanation. Do not suppress highlighting on every paragraph with a single strong element: surrounding text can be plain text nodes, so such a selector also removes valid inline emphasis.

### Core answer blocks and question separation

Write the central explanation in a shared `notes-core-answer` container titled “Core answer.” When updating existing notes, use the original short-answer content and rename “Short exam answer” to “Core answer.” Do not rewrite the technical answer merely to fit the styling.

```md
<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A promise expresses completion; **it does not create a worker thread**.

</div>
```

Use a muted green panel, a clear sage border with a thicker leading edge, comfortable padding and an ivory title in dark mode. The title is a label, not a highlighted phrase. Keep the body at the normal reading size. Use readable light and print fallbacks. This panel should be more prominent than the existing Key takeaway callout or subsection labels.

Insert a Markdown horizontal rule (`---`, surrounded by blank lines) between question sections, after the preceding section's entire content, including practice and references. Keep generous spacing around the divider. Preserve existing heading IDs, outline behavior and code examples. Do not insert a divider into frontmatter, code or a question's own answer.

### Color and authoring rules

| Role | Treatment |
| --- | --- |
| Main-argument emphasis | Markdown bold; amber `#F0CB91` on `#443B28` in dark mode |
| Structural heading or label | Ivory, no text-highlight background |
| Core answer | Green panel `#283027`, sage border `#ABC49A`; title remains plain ivory |
| Optional marked definition | Sage text on a muted green background; only when the phrase explains a useful distinction |
| Link | Blue, underlined; preserve link styling inside bold |
| Inline code | Code background with sage text in dark mode |
| Code block | Preserve syntax highlighting; do not add editorial wrappers inside examples |

All editorial text emphasis pairs colored text with a tinted background. Use semantic bold as the primary authoring method so the skimmed argument is also visible in source. The optional mark classes below remain available, but do not use them to mechanically color terminology. Avoid nested wrappers and inline style attributes. Explicit warning wording still conveys risk when colors are unavailable.

## Highlight palette and rendering

Use amber bold for the main argument; reserve optional sage marks for a useful defining claim. Bold uses warm amber text on the yellow highlight background. Do not use colored text alone for emphasis. Additional variants are available for a specific editorial purpose, not to make a page more colorful. Do not invent a second meaning for the same color on another page.

| Class | Background | Text | Intended use |
| --- | --- | --- | --- |
| `notes-highlight` | `#443B28` | `#E7CF99` | Core rule or takeaway |
| `notes-highlight-term` | `#303D32` | `#BED4AE` | Definition or key mechanism |
| `notes-highlight-success` | `#303D32` | `#BED4AE` | Important successful outcome |
| `notes-highlight-info` | `#2C3948` | `#B8D1EB` | Short contextual clarification |

Implement each as a paired foreground/background token. Use approximately `0.12em` inline padding, `0.15em` corner radius, and no vertical padding that changes line spacing. Keep the element inline, allow ordinary wrapping, and use `box-decoration-break: clone` plus its WebKit form so wrapped highlights remain legible in Safari. Do not set `white-space: nowrap` or turn phrases into inline blocks.

Text selection must remain readable over highlights and code. Print styles should use dark text on a light background and retain understandable emphasis.

## Reading layout for both devices

Physical screen size does not determine CSS viewport size. Do not halve font sizes or assume that the smaller tablet has half the viewport width. Use available width, orientation, and browser zoom to govern layout.

- Start article prose at `1.125rem` (18px with a default 16px root), with line height `1.7`. Keep the root size at the browser default and allow user scaling.
- Apply reading typography to paragraphs, lists, and related prose. Preserve separate sizes for navigation, controls, headings, and code. Check existing explicit VitePress paragraph line heights rather than relying only on inheritance.
- On the Mac, aim for a prose measure of roughly 65–75 characters, starting with a maximum width of `68ch`. This is a maximum, never a minimum. Center the article within its available content area.
- On the tablet, let prose use the available width with approximately 20–24px side padding. Permit shorter lines; retain the same readable body size. At very narrow widths, 16px padding is acceptable.
- Keep the existing responsive sidebar and outline behavior where it works. Collapse side panels before they squeeze the reading column; do not force desktop navigation onto a tablet.
- Let paragraphs and highlights wrap naturally. Long URLs must not widen the page.
- Keep code at approximately `0.9em` of body size, preferably no smaller than 15px at default scaling. Preserve code indentation and provide local horizontal scrolling for long lines.
- Keep wide tables and diagrams in their own scroll containers; the page itself must not scroll sideways. Preserve Mermaid sizing controls and their keyboard focus states.
- Keep paragraph spacing around `1em`. Use left-aligned text and avoid justified paragraphs.
- Keep headings ivory and distinguish hierarchy through size, weight, and spacing. Preserve automatic section numbers.

## Code, callouts, and controls

Preserve the existing dual-mode syntax highlighting unless a change is necessary. Check comments and punctuation as carefully as keywords. Do not use an unscoped rule that changes every `span`, `code`, or SVG text element.

Use subdued backgrounds for informational, tip, warning, and danger callouts. Retain explicit titles, readable content, and semantic distinctions. Avoid converting ordinary highlighted phrases into large callout boxes.

Links must have a visible hover state and keyboard focus state. Article links should remain identifiable without color through underlining. Active navigation should have an additional indicator, such as weight or a marker. Keep a visible focus outline with sufficient contrast and ensure controls work by touch without hover.

## Contrast requirements

Measure actual rendered pairs, including backgrounds inherited from tables, callouts, inline code, search, and elevated panels.

- Normal text, meaningful secondary labels, inline colors, highlighted text, and code: at least 4.5:1.
- Main prose: target at least 7:1 on its reading background.
- Large text: at least 3:1; ordinary headings should still use the high-contrast ivory.
- Essential control boundaries and state indicators: at least 3:1 against adjacent colors where required.
- Check hover, active, focus, selection, light-mode fallback, and disabled presentation separately. Do not dim meaningful explanatory content as if it were disabled.

Contrast is an accessibility check, not a measure of personal reading comfort. Test the final presentation on the actual devices at normal brightness.

## Implementation and acceptance checklist for Codex

1. Inspect the working tree and existing theme. Make focused source changes and preserve unrelated edits.
2. Reuse the existing shared theme tokens, dark-default configuration, responsive reading typography, and reusable emphasis classes. Change theme implementation only when the task requires it; do not duplicate styles in individual pages. Verify light-mode fallbacks when changing styles.
3. Read each complete section, select meaningful bold claims, then check the headings-and-bold-only reading. Frame every Core answer and separate questions with horizontal rules. Exclude headings and structural labels from highlighting. For visual verification, include a long paragraph, a wrapped highlight, a link, a code block, a table, a callout, and a Mermaid diagram. Do not bulk-highlight notes by keyword matching.
4. Check representative viewport widths of 1280 and 1440 CSS pixels for the Mac, and 600, 768, and 820 for smaller tablet layouts. Also check 390px as a narrow-width stress case. These are test sizes, not claims about either device's actual resolution.
5. Check portrait and landscape, Safari on the Mac and the tablet's actual browser when available, keyboard navigation, touch menus, and 200% browser zoom. Report any device/browser checks that could not be performed.
6. Confirm there is no page-wide horizontal overflow, clipped text, overlapping navigation, broken highlight wrapping, unreadable code, or focus indicator hidden by sticky elements.
7. Measure text/background contrast and record results for main prose, secondary text, all inline accents and highlights, links, and essential focus/control states.
8. For this documentation repository, run `node --test scripts/content-policy.test.mjs` and `npm run docs:build`. Its root package currently has no `build`, `test`, or `coverage` scripts; do not invent or rename scripts. For any separately scoped Autocode implementation, follow its applicable build/test/Module 4 coverage requirements and never modify `src/tests`.
9. The configured build output is `dist`, which may contain existing local changes. Use a temporary output directory if necessary to preserve them, and report the exact build command. Do not clean or revert someone else's generated files.
10. Report changed source files, sample pages, checks performed, contrast results, and remaining visual uncertainties. Never push.

Acceptance means readable prose on both screen sizes, meaningful bold phrases that reveal each section's argument, accessible color pairs, preserved functionality, and passing applicable checks. The reader's review on the actual devices determines whether the starting font size and brightness need adjustment.

## References

- [VitePress: extending the default theme](https://vitepress.dev/guide/extending-default-theme)
- [VitePress: appearance configuration](https://vitepress.dev/reference/site-config#appearance)
- [VitePress: Vue and HTML in Markdown](https://vitepress.dev/guide/using-vue)
- [W3C: minimum text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [W3C: enhanced text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)
- [W3C: non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
