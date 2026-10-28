# Practice: design-system-contracts

**Status: outstanding learner practice.**

Prerequisite: [the worked lesson](../../../senior_growth/React/design-system-contracts.md) and [the staged sequence](../index.md).


## Contract lab and acceptance evidence

Build Button in a small consumer form and toolbar. Add a controlled/uncontrolled disclosure API with mutually exclusive props and an explicit reset decision. Acceptance: type fixtures reject unsupported variants and contradictory state props; native submit/default-button behavior is observed; keyboard activation fires once; disabled blocks activation; ref focus works; custom class/native handler survive; server/client initial theme agrees. Try long translated text, 200% text zoom, forced colors and both themes. Do not infer those results from source inspection.

Run the generator twice and compare byte-identical output. Delete one key, add an unknown alias and inject an invalid color: each must fail. Compile generated TS and consume a token from a chart fixture. Review every foreground/background/focus pairing with measured evidence and record browser/version. Learner implementation and browser evidence remain required.

References checked 2026-10-21: [React DOM common props](https://react.dev/reference/react-dom/components/common), [React refs](https://react.dev/learn/manipulating-the-dom-with-refs), [DTCG Format 2025.10](https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
