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

> ⚠️ Note: Automated tools usually catch **30–50% of issues**. Manual testing is still needed.

---

## 2️⃣ Manual Testing Techniques

### 2.1 Keyboard Navigation

- Test your site **without a mouse**.
- All interactive elements (links, buttons, forms) must be reachable with `Tab`, `Shift+Tab`, `Enter`, `Space`, and arrow keys.

### 2.2 Screen Readers

- Use screen readers such as **NVDA (Windows), VoiceOver (macOS/iOS), TalkBack (Android)**.
- Check whether content is **read in a logical order** and ARIA roles are announced properly.

### 2.3 Color Contrast and Visual Checks

- Use **contrast checkers** (e.g., WebAIM Contrast Checker) to ensure sufficient contrast ratios (≥4.5:1 for normal text).
- Test in grayscale to ensure information is not conveyed by color alone.

### 2.4 Focus Management

- Ensure **modals, dialogs, and dynamic content** trap focus correctly.
- Return focus to the triggering element after closing modals.

---

## 3️⃣ Metrics & Scoring

- **Accessibility Score (0–100)**: Provided by tools like Lighthouse.  
- **Number of Violations**: Count of failed rules (missing alt, ARIA errors, contrast issues).  
- **Keyboard Coverage**: Percentage of interactive elements accessible by keyboard.  
- **Screen Reader Usability**: Subjective testing using screen readers for navigation flow.  

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
> Treat accessibility as **part of the definition of done** for every feature. Continuous measurement ensures **inclusive and compliant web applications**.
