# Why Accessibility Matters

**Accessibility (a11y)** aims to remove barriers so people, including those with disabilities, can **perceive, understand, navigate, and interact** with a website or application. The term “a11y” comes from **“accessibility”**, with 11 representing the letters between “a” and “y”.

---

## 1️⃣ Importance of Accessibility

### 1.1 Legal & Compliance Reasons

- Technical accessibility criteria, product contracts and applicable legal obligations are related but distinct.
- This study note does not determine jurisdiction, coverage, required standard/version or legal compliance; the product needs an assessment of its actual scope.

### 1.2 Inclusive User Experience

- People have varied visual, auditory, cognitive and motor access needs; an undated prevalence statistic is not needed to justify removing a concrete barrier.
- Accessible task design reduces exclusion; actual usability and remaining barriers require testing with the relevant people and technologies.

### 1.3 SEO & Discoverability

- Clear content structure and meaningful alternatives help people understand and navigate content.
- Neither ARIA attributes nor a tool score guarantee a search rank or useful assistive-technology behavior.

### 1.4 Usability for Everyone

- Accessibility features like **keyboard navigation, clear color contrast, and readable fonts** benefit **all users**, not only those with disabilities.
- Example: captions on videos help in **noisy environments**, high contrast helps in **bright sunlight**.

### 1.5 Ethical & Brand Reputation

- Shows commitment to **social responsibility** and **inclusive design**.
- Builds **trust** and a **positive reputation** among users and partners.

---

## 2️⃣ Common Accessibility Considerations

| Area                     | Example Practices                              |
|---------------------------|-----------------------------------------------|
| Visual                    | Sufficient color contrast, resizable text, high DPI support |
| Auditory                  | Captions and transcripts for videos/audio     |
| Motor / Interaction       | Keyboard navigability, larger clickable areas |
| Cognitive                 | Clear language, predictable layouts, consistent UI |
| ARIA & Semantic HTML      | Correct roles, labels, and landmarks          |
| Forms                     | Proper labels, error messages, tab order      |

---

## 3️⃣ Tools to Check a11y

- **Lighthouse (Chrome DevTools)**
- **axe DevTools**
- **WAVE Web Accessibility Evaluation Tool**
- **Screen readers:** NVDA, VoiceOver

---

## 4️⃣ Best Practices

1. Use **semantic HTML** (headings, lists, buttons, forms).  
2. Ensure **keyboard-only accessibility**.  
3. Provide **text alternatives** for non-text content.  
4. Check applicable contrast criteria: normal text generally4.5:1, qualifying large text3:1, and required nontext indicators3:1, with the defined exceptions.  
5. Use **ARIA attributes** only when necessary.  
6. Test with **real assistive technologies**.

---

### ✅ Summary

- Accessibility is about **inclusion, legal compliance, and usability**.  
- Benefits everyone: users with disabilities, SEO, and general usability.  
- Ignoring a11y can lead to **legal risk, lost users, and poor reputation**.

> 💡 Senior Tip:  
> Treat accessibility as **part of the design and development process**, not as an afterthought. Integrate it early and retain task-based evidence; a guideline or one passing tool run does not establish universal usability.


## Turn the rationale into observable task outcomes

A useful first task is finding a note and recovering when the enhanced search fails. The [HTML-first search fixture](../Other/Cross_Browser_Progressive_Enhancement.md) supplies a configured browser test path; the [React component lesson](../React/React_testing.md) supplies executable pending/error/retry behavior. Neither is claimed as a measured accessibility project outcome. Follow the [audit and retest contract](./Can_we_test,_measure_a11y_somehow.md) for actual keyboard, reader, reflow and contrast evidence.

**Acceptance:** choose one important task and access need; describe the starting state, input method, expected outcome and failure/recovery path. Record a real observed barrier, a scoped correction and retest under the same conditions. Keep automated DOM behavior, native browser observations and user/reader evidence separate. A personal statement such as “we test accessibility” requires retained project evidence; learner practice remains required.

Authoritative guidance checked 2026-10-22: [WAI evaluation overview](https://www.w3.org/WAI/test-evaluate/), [WCAG2.2 technical criteria and conformance](https://www.w3.org/TR/WCAG22/).
