# Can we test/measure a11y somehow?

## 🔹 Testing and Measuring Accessibility (a11y)

Accessibility (a11y) can and should be **tested and measured** to ensure that websites and applications are usable by everyone, including users with disabilities.

---

## 1️⃣ Automated Testing Tools

Automated tools can **quickly catch common accessibility issues**, though they cannot cover everything.

| Tool                     | Description |
|---------------------------|-------------|
| **Lighthouse (Chrome DevTools)** | Built-in audit tool; provides accessibility score and highlights issues like color contrast, missing alt text, and ARIA roles. |
| **axe DevTools**          | Browser extension or CI/CD integration; scans for accessibility violations and provides guidance for fixes. |
| **WAVE (Web Accessibility Evaluation Tool)** | Visualizes accessibility errors and alerts directly on the page. |
| **Pa11y**                 | CLI tool for automated testing of multiple pages. |
| **eslint-plugin-jsx-a11y** | For React; enforces accessibility rules in JSX at development time. |

> Automated rules cover only some accessibility requirements. There is no universal percentage of issues caught: results depend on the rules, content, states and definition of an issue. A perfect score is not proof of WCAG conformance.

---

## 2️⃣ Manual Testing Techniques

### 2.1 Keyboard Navigation

- Test your site **without a mouse**.
- Use the keyboard model of each control: Tab/Shift+Tab traverse focus stops, Enter activates links, Enter/Space activate buttons; composite widgets may use arrow keys internally. Do not make every control respond to every key. Avoid positive tabindex values.

### 2.2 Screen Readers

- Use screen readers such as **NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android)**.
- Check whether content is **read in a logical order** and ARIA roles are announced properly.

### 2.3 Color Contrast and Visual Checks

- Use **contrast checkers** (e.g., WebAIM Contrast Checker) to ensure sufficient contrast ratios (≥4.5:1 for normal text).
- Grayscale is one diagnostic; verify that text, symbols or patterns convey meaning without color and test relevant real user settings.

### 2.4 Focus Management

- Contain focus in an active modal dialog and make the background inert. Nonmodal disclosures and ordinary dynamic content must allow users to leave; trapping them creates a keyboard barrier.
- Return focus to the triggering element after closing modals.

---

## 3️⃣ Metrics & Scoring

- **Accessibility Score (0–100)**: Provided by tools like Lighthouse.  
- **Number of Violations**: Count of failed rules (missing alt, ARIA errors, contrast issues).  
- **Workflow coverage**: Named user tasks/states tested with keyboard, including recovery; a denominator must be defined before reporting any coverage percentage.  
- **Screen-reader task evidence**: Record actual names/roles/announcements/focus and task completion with stated reader/browser versions; usability findings supplement criterion checks.  

---

## 4️⃣ Integrating Accessibility Testing in Development

1. **During Development**
   - Use **eslint-plugin-jsx-a11y** in React or similar linters.
   - Run **axe DevTools** in the browser while developing components.

2. **During CI/CD**
   - Add **automated accessibility tests** (Pa11y, axe CLI, Lighthouse CI).
   - Fail builds if critical accessibility issues exist.

3. **Manual QA**
   - Test key workflows with **keyboard and screen readers**.
   - Test **responsive layouts and contrast**.

---

### ✅ Summary

- Accessibility can be measured using **automated tools** (Lighthouse, axe, WAVE) and **manual testing** (keyboard, screen readers, contrast checks).  
- **Metrics** include accessibility score, number of violations, keyboard coverage, and screen reader usability.  
- **Best practice:** Combine **automated testing + manual testing** early and throughout development.

> 💡 Senior Tip:  
> Treat accessibility as **part of the definition of done** for every feature. Continuous checks expose regressions; conformance needs scoped evidence and human evaluation, not a score alone.

## Reproducible audit workflow

Start from complete user processes, not only URLs: load, search, empty/error results, open/edit/cancel a dialog, invalid submission, successful submission and recovery. Automated scans must run after each relevant state is rendered; a closed dialog cannot expose its hidden-state defects to a scan.

| Check | Procedure / evidence |
|---|---|
| Keyboard | Tab forward/back; activate controls; Escape modal; verify no lost/invisible focus and logical return target |
| Accessible tree | Inspect role, name, state and described-by relationships, including hidden/disabled controls |
| Screen reader | Record browser/OS/reader versions; navigate landmarks/headings; submit errors; confirm status announcements without duplicates |
| Reflow | Test a320CSS-px viewport and400% page zoom at an appropriate desktop width; inspect clipping/sticky overlays |
| Vision/motion | Measure text/UI contrast in every theme, visible focus, forced-colors behavior and reduced-motion setting |
| Automated rules | Store rule/version, state/URL, impact, element, relevant criterion and human disposition |

Do not claim a test was run because a tool is listed. An issue can fail multiple criteria, while several rule hits may describe one root cause. Prioritize user impact and repeatable reproduction over violation counts. Accessibility-tree inspection does not replace listening to a screen reader. Automated checks cannot decide whether alternative text communicates the correct meaning.

**Exercise:** audit the worked form/dialog in the examples note. Acceptance: retain a state-by-state table with keyboard and screen-reader observations, criterion IDs, defects, fixes and rerun results; include at least one manual defect an automated scan missed. No result is recorded as passed until actually executed. Use the WAI evaluation guidance to define scope and limitations.

Official references: [WAI evaluation overview](https://www.w3.org/WAI/test-evaluate/), [APG keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), [modal interaction pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Verified2026-10-20.

## Worked state scan and interaction test

In the separate exercise application, install compatible pinned Playwright and @axe-core/playwright versions with browser binaries, configure baseURL/webServer and serve the complete accessible profile page from the examples note. Include its real installation/cleanup script and a document title/lang/main layout. The following test is study code for tests/accessibility/profile.spec.ts, not a change to any protected src/tests directory or this repository's scripts.

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('profile validation and confirmed recovery states', async ({ page }, testInfo) => {
  let rejectEmail = true;
  await page.route('**/api/profile', route => route.fulfill({
    status: rejectEmail ? 422 : 200, contentType: 'application/json',
    body: JSON.stringify(rejectEmail ? { errors: { email: 'INVALID_EMAIL' } } : { saved: true })
  }));
  await page.goto('/profile'); // Learner-supplied application fixture, not an existing notes URL.
  async function scan(state: string) {
    const result = await new AxeBuilder({ page }).analyze();
    await testInfo.attach(`accessibility-${state}`, {
      body: JSON.stringify({ state, result }, null, 2), contentType: 'application/json'
    });
    expect(result.violations, `Automated violations in ${state}`).toEqual([]);
    // Review incomplete/needs-human results and actual rule/version configuration separately.
  }
  await scan('initial');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.locator('#profile-summary')).toBeFocused();
  await page.getByRole('link', { name: 'Enter a valid email address.' }).click();
  await expect(page.getByLabel('Email address', { exact: true })).toBeFocused();
  await scan('local-invalid');
  await page.getByLabel('Name', { exact: true }).fill('Training learner');
  await page.getByLabel('Email address', { exact: true }).fill('learner@example.test');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.locator('#profile-summary')).toBeFocused();
  await scan('server-invalid');
  rejectEmail = false;
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.locator('#profile-status')).toHaveText('Profile saved.');
  await expect(page.getByRole('button', { name: 'Save profile' })).toBeEnabled();
  await scan('confirmed-success');
});
```

The mocked API tests UI response handling, not server authorization, actual persistence or database constraints. Add separate adapter/integration tests for those contracts. Axe rule defaults/tags and WCAG mappings depend on the installed version/configuration; record them rather than assuming every requirement is checked. Capture open dialogs, hidden/expanded navigation, errors, empty/loading/stale/results, both themes and relevant viewport states. An initial-page scan cannot certify a later modal or error flow.

A browser focus assertion proves that the active element is the expected target in that run; it does not prove a screen reader spoke the correct summary. Automated names/roles are useful structural checks, while meaning/reading order/voice input/keyboard model/reflow and actual announcement timing still need manual/user evaluation. Visual snapshots can detect layout regressions but need reviewed baselines and do not establish semantics. A DOM snapshot is not a screenshot or an accessibility conformance report.

## Triage, regression and evidence contract

For each finding retain: page/process/state, environment and tool/rule version, reproduction/input method, element/name/role, expected versus actual, relevant criterion, user impact, fix owner, correction and retest artifact. Group duplicate rule hits by root cause without discarding affected states. A false positive/inapplicable finding needs a specific documented rationale; don't globally disable a rule or exclude the whole component merely to get green CI. Temporary exceptions need an owner/revisit condition and accessible alternative where needed.

For keyboard/manual tests, specify task and starting focus; compare actual Tab/Shift+Tab, native activation, widget arrows, Escape, return focus and preserved data. For reader tests, state browser/OS/reader/version and navigation mode; inspect landmarks/headings/forms plus live updates, not only whether the page reads aloud. Involve disabled users where possible for task/usability evidence beyond technical criteria. Record known support gaps rather than inventing a universal pass from one environment.

Use the [criterion-specific matrix](./What_is_WCAG_standard__What_parts_it_contains_Web_Content_Accessibility_Guidelines.md) for text enlargement/reflow/spacing/contrast/focus/motion/targets and the [worked form/dialog record](./Can_you_provide_some_examples_for_a11y.md) for state announcements. The [compound tabs](../React/Are_there_design_patterns_in_react.md), native table and navigation disclosure each need their own interaction contract; a generic “all controls respond to arrows” test is wrong.

**Audit exercise acceptance:** execute this automated flow in an actual app, retain full results including incomplete checks, then add at least one meaningful manual-only finding, a scoped correction and recorded retest across the relevant states. Include slow/error/cancelled actions, a removed trigger, keyboard-only use, reader announcements, zoom/reflow/preferences and both themes. Distinguish authored tests, executed tests, observed pass/fail and unperformed work in the evidence ledger. No Playwright/axe/browser/screen-reader execution was performed for these notes; the snippet has only syntax validation here.

Official references checked2026-10-21: [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing), [WAI evaluation methods](https://www.w3.org/WAI/test-evaluate/), [WCAG-EM](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/), [APG keyboard practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/). Evaluation scope and real learner evidence remain separate from completed study material.


## Choose the smallest reproducible test path

Begin with the [configured public-search projects](../Other/Cross_Browser_Progressive_Enhancement.md#exact-browser-test-configuration-and-cases) when learning browser setup, keyboard/no-JS/failure assertions and a reviewed image baseline. Its Playwright configuration and server are supplied together. The profile/axe test above is a second, richer exercise: it requires assembling the separate profile application, installing its pinned axe integration and recording the actual scan/rule versions. Do not run it against a notes URL or infer that a mocked endpoint implements the real server.

Use [the snapshot comparison lesson](../Testing/What_is_snapshot_testing_When_should_we_avoid_using_it.md#concrete-browser-screenshot-comparison) to keep serialized DOM and browser pixels distinct. Define a fixed baseline environment, review the initial expected appearance, investigate each difference and accept only intentional changes. A local DOM check for a role/name or activeElement is useful evidence within its simulation; no manual reader, native focus-trap, visual baseline or WCAG-conformance result follows from it.

**Acceptance:** retain a checklist separating authored versus executed checks and browser/OS/reader/fixture revisions. Complete keyboard and reader task observations, visual baseline review and scoped failure/fix/retest rather than replace them with a percentage score. These native/manual steps remain unperformed here; the learning material includes their procedures and expected evidence.
