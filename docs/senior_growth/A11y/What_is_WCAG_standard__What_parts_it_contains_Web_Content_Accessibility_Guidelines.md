# What is WCAG standard? What parts it contains? Web Content Accessibility Guidelines

## 🔹 WCAG: Web Content Accessibility Guidelines

**WCAG** (Web Content Accessibility Guidelines) is a set of **international standards** that define how to make web content **accessible to people with disabilities**. It is maintained by the **W3C Web Accessibility Initiative (WAI)**.

---

## 1️⃣ Purpose of WCAG

- Provides **guidelines and success criteria** for making web content:
  - **Perceivable** – users can see or hear content.
  - **Operable** – users can interact with content.
  - **Understandable** – users can understand the content and interface.
  - **Robust** – content works across devices and assistive technologies.

- Supplies a technical accessibility baseline; applicable contractual/legal scope and version are separate from this study lesson.

---

## 2️⃣ Structure of WCAG

WCAG is organized into **4 principles (POUR)**, **guidelines**, and **success criteria**.

| Principle     | Meaning                                                                                  |
|---------------|------------------------------------------------------------------------------------------|
| **Perceivable** | Users must be able to **perceive content** with at least one sense. (Text alternatives, captions, adaptable layouts) |
| **Operable**   | Users must be able to **interact with the interface**. (Keyboard navigation, enough time, clear focus) |
| **Understandable** | Users must be able to **comprehend information and UI**. (Readable text, predictable navigation, error suggestions) |
| **Robust**     | Content must be **compatible with current and future assistive technologies**. (Proper HTML, ARIA, standard APIs) |

---

## 3️⃣ WCAG Versions & Levels

### 3.1 Versions
- **WCAG 2.0** (2008) – widely adopted, stable  
- **WCAG 2.1** (2018) – added mobile, low vision, and cognitive accessibility criteria  
- **WCAG 2.2** is a W3C Recommendation; the linked published Recommendation is dated12December2024. It adds criteria addressing focus, dragging, target size, redundant entry and accessible authentication.  

### 3.2 Conformance Levels
| Level | Meaning                                    |
|-------|--------------------------------------------|
| **A** | Minimum accessibility; basic issues fixed |
| **AA** | All applicable A and AA criteria in the declared scope; not an issue-severity category |
| **AAA** | Highest level; very strict, often impractical for all content |

> This learning path targets WCAG2.2AA material. Legal/contract obligations can refer to different versions and require a separate applicable assessment; a tool score does not establish legal compliance.

---

## 4️⃣ Examples of Success Criteria

| Principle     | Example Criterion                                                                 |
|---------------|----------------------------------------------------------------------------------|
| Perceivable   | Provide text alternatives for images (`alt` text).                                |
| Operable      | All functionality accessible via keyboard.                                        |
| Understandable| Instructions and error messages are clear and understandable.                    |
| Robust        | Proper semantic HTML and ARIA usage for assistive technologies.                   |

---

## 5️⃣ Tools for WCAG Testing

- **Automated:** Lighthouse, axe DevTools, WAVE, Pa11y  
- **Manual:** Keyboard navigation, screen readers, color contrast checkers  

---

### ✅ Summary

- **WCAG** = international standard for web accessibility.  
- Organized by **4 principles (POUR)**: Perceivable, Operable, Understandable, Robust.  
- Contains **guidelines and success criteria** with 3 conformance levels (A, AA, AAA).  
- Provides testable criteria; meeting them does not address every user need or establish every legal obligation.

> 💡 Senior Tip:  
> Use **WCAG2.2AA** as this study baseline, and state the actual assessment scope and supported technologies. Choose semantic HTML and necessary ARIA, then assess every applicable criterion and conformance requirement in the declared scope.

## Criteria mapped to implementation decisions

| Criterion / level | Concrete design and verification |
|---|---|
| 1.1.1 A | Meaningful text alternatives; decorative images use empty alt |
| 1.3.1 A | Labels, headings, fieldsets/legends, table header relationships |
| 1.4.3 AA | Text contrast at least4.5:1; qualifying large text3:1; check stated exceptions |
| 1.4.10 AA | Reflow at320CSS-px width without two-dimensional scrolling except permitted content such as data tables |
| 1.4.11 AA | Necessary control/state and meaningful graphic contrast3:1, subject to criterion exceptions |
| 2.1.1 A / 2.1.2 A | Keyboard operation and no keyboard trap; modal containment has an operable exit |
| 2.4.3 A / 2.4.7 AA | Logical focus order and visible focus |
| 2.4.11 AA (new2.2) | Focused component not entirely hidden by author-created content, e.g. sticky banner |
| 2.5.7 AA (new2.2) | Dragging has a single-pointer alternative unless an exception applies |
| 2.5.8 AA (new2.2) | Pointer targets meet24×24CSS-px size or the defined spacing/other exceptions |
| 3.3.1 A / 3.3.2 A / 3.3.3 AA | Identify errors, provide labels/instructions and useful correction suggestions |
| 3.3.7 A (new2.2) | Avoid requiring repeated information within a process unless an exception applies |
| 3.3.8 AA (new2.2) | Authentication does not require a cognitive-function test without a permitted alternative/mechanism; support password managers and paste |
| 4.1.2 A / 4.1.3 AA | Expose names/roles/states; announce appropriate status changes without moving focus |

AAA Focus Appearance2.4.13 is distinct from AA Focus Visible2.4.7; a project can adopt stronger focus styling without mislabelling levels. WCAG2.2 removes4.1.1Parsing, but invalid markup can still break relationships and other criteria. Consult each criterion's exact wording and exceptions rather than reducing conformance to this table.

**Worked decision:** a draggable priority list gains Move up/Move down buttons with clear item names. The buttons provide the nondrag pointer path (2.5.7), also support keyboard operation (2.1.1), preserve focus on the moved item and announce the new position (4.1.3). A screen-reader and pointer test must confirm the result; adding button markup alone is insufficient.

**Exercise:** map the form/dialog workflow to these criteria. Acceptance: define page/process scope, target level, technologies and states; write a test for each applicable row, justify exceptions and log unresolved failures. Include contrast/reflow/target-size measurements and auth paste/password-manager checks. Learner testing remains required.

Official normative source: [WCAG2.2](https://www.w3.org/TR/WCAG22/); explanatory guidance: [Understanding WCAG2.2](https://www.w3.org/WAI/WCAG22/Understanding/). Checked2026-10-20.

## Criterion-specific visual/input regression plan

Conformance considers complete pages/processes at the claimed level, accessibility-supported technologies and other requirements; a selected component checklist is not a complete claim. Document the product scope, relevant exclusions/alternatives and actual evidence. A/AA/AAA describe cumulative criterion levels, not “minor/major/critical bug” labels. Keep defects by user impact independently.

| Scenario | Procedure and design reasoning | Criterion connection / boundary |
|---|---|---|
| Text enlargement | Enlarge text up to200%, including labels/errors/buttons; inspect clipping, overlap and hidden actions | 1.4.4AA; don't disable zoom or assume rem guarantees success |
| Reflow | Test vertical content at320CSS-px equivalent (e.g.1280wide at400% zoom); preserve information/functions without two-direction scrolling | 1.4.10AA; permitted two-dimensional content exceptions are local, not a waiver for surrounding controls/cells |
| Text spacing | Apply line height1.5×, paragraph spacing2× font size, letter spacing.12× and word spacing.16× without loss | 1.4.12AA; these are override tolerances, not mandatory default typography |
| Text/UI contrast | Measure actual foreground/background including transparency, gradients, themes, states and focus context | 1.4.3AA text4.5:1 / qualifying large text3:1;1.4.11AA necessary non-text3:1 with exact exceptions |
| Focus/obscuration | Keyboard every action under sticky headers/banners, opened panels and zoom; inspect visible focus and order | 2.4.3A,2.4.7AA,2.4.11AA; AAA focus appearance2.4.13 has additional specifics |
| Motion | Change reduced-motion preference during an animation, verify static meaning and pause/stop for relevant automatic motion | 2.2.2A and flashing criteria have specific applicability; interaction motion2.3.3AAA is not an AA-only label |
| Forced colors | Use real OS/browser forced-color mode and inspect control boundaries/focus/meaning beyond shadows/color | Useful compatibility/usability check; do not label the media query itself a standalone WCAG pass |
| Targets/dragging | Measure targets and permitted spacing, operate nondrag alternatives and preserve moved-item focus/status | 2.5.7AA /2.5.8AA; consult defined exceptions rather than universal pixel slogans |
| Authentication | Test paste/password manager, errors/session recovery and relevant cognitive alternatives | 3.3.8AA and related input/error criteria; secure auth still needs server controls |

Qualifying large text for the contrast criterion is at least18pt regular or14pt bold (equivalent CSS sizing must be understood); do not simply call any h1 “large” or judge contrast by antialiasing screenshots. Inactive controls have criterion exceptions, but low-contrast explanatory text is not automatically inactive. Color-only status needs another visual/semantic cue. Focus styling needs contrast against the actual adjacent background, not a palette token tested in isolation.

For a wide data table, the table may require horizontal navigation, but search, pagination and row action controls should still reflow/operate. Fixed-height cards/dialogs often fail enlarged text even when font size uses rem. Test long/error/translated content rather than only a short happy-path screenshot. Prefer responsive layout/content fixes over hiding essential text or disabling enlargement.

**Acceptance exercise:** apply this matrix to the course list, native dialog and async profile flow. Record environment/settings/state, expected criterion outcome, actual observation/measurement, defect/fix/retest and any justified exception. Include text-only enlargement, narrow reflow, spacing overrides, both themes/interactive states, sticky overlays, reduced motion and forced colors. Every unexecuted row stays unperformed; a before/after CSS edit is not evidence of the measured result. Criteria applicability needs the complete scoped content/process, beyond these examples.

Normative source checked2026-10-21: [WCAG2.2](https://www.w3.org/TR/WCAG22/). Explanatory sources: [resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), [contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). These are study/test procedures, not a completed audit or readiness assessment.

## A scoped evidence record, not a percentage score

For the [worked HTML-first search](../Other/Cross_Browser_Progressive_Enhancement.md), a small component review can begin with the record below. It is a template with **unperformed** rows, not an audit result or a complete list of applicable criteria. Define the entire page/process, versions, input methods, states and accessibility-supported technology combinations before deciding whether a conformance claim is justified.

| Criterion / state | Procedure / expected outcome | Evidence and result |
|---|---|---|
| 1.3.1 / 4.1.2 input | Inspect label association and name/role in the actual accessibility tree; confirm reader identification | Unperformed; record environment/observation/trace |
| 2.1.1 / 2.4.7 keyboard | Tab to input/button, submit with Enter, activate fallback; visible focus throughout | Unperformed; retain task steps and actual result |
| 3.3.1 / 3.3.2 invalid query | Try missing/invalid data and bypass client validation; understandable identification and correction | Unperformed; retain client/server state and recovery |
| 4.1.3 asynchronous results | Submit enhancement; verify appropriate announcement without forced focus movement | Unperformed; actual reader/browser evidence required |
| 1.4.10 / 1.4.4 narrow/enlarged | Run specified reflow and text-resize checks; no clipped required action | Unperformed; measurements/screenshots plus task result |

Use pass/fail/not-applicable with a reason only after the procedure is executed; unknown/unperformed stays explicit. If a label is removed, first document the observed name/task failure, then restore it and retest the same combination. Do not fill a “pass” cell because source markup looks plausible. Capture defect impact, scope, fix and retest date separately from severity and criterion level. Other criteria, complete-process coverage, non-interference and accessibility-supported usage still need assessment. Native browser/reader/visual checks in this study environment remain unperformed.
