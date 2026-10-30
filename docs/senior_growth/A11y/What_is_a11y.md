# What is accessibility?

**a11y** is short for **accessibility**—the practice of making websites, applications, and digital content usable by **all people, including those with disabilities**. The term comes from:

```md
a11y → a + 11 letters + y → accessibility
```

---

## Purpose of a11y {#_1%EF%B8%8F%E2%83%A3-purpose-of-a11y}

Accessibility ensures that everyone can **perceive, understand, navigate, and interact** with digital content, including users with:

- **Visual impairments** (blindness, low vision, color blindness)
- **Hearing impairments**
- **Motor or dexterity limitations**
- **Cognitive or learning disabilities**
- Temporary or situational limitations (e.g., bright sunlight, noisy environment)

---

## Key Principles (WCAG Guidelines) {#_2%EF%B8%8F%E2%83%A3-key-principles-wcag-guidelines}

1. **Perceivable** – Information must be available in forms users can perceive, including compatible text alternatives and assistive output.
   - Example: Provide alt text for images, captions for videos.
2. **Operable** – Users must be able to **interact with content**.
   - Example: Keyboard navigation, focus indicators.
3. **Understandable** – Content and UI must be **comprehensible**.
   - Example: Clear language, consistent layouts.
4. **Robust** – Content must work with **assistive technologies**.
   - Example: Proper semantic HTML, ARIA roles.

---

## Benefits of a11y {#_3%EF%B8%8F%E2%83%A3-benefits-of-a11y}

- **Inclusion:** Removes barriers for people with varied disabilities and access needs; an undated prevalence estimate is unnecessary to justify a usable task.
- **Content structure:** Useful semantics and alternatives can aid both people and content understanding; accessibility does not guarantee a search ranking.
- **Usability for all:** Improves experience for everyone (e.g., mobile users, older adults).  
- **Applicable obligations:** Technical criteria, product scope and jurisdiction/contract requirements need an actual assessment; this introductory note makes no legal-compliance claim.

---

### Summary {#%E2%9C%85-summary}

**a11y = accessibility.**  
It’s about designing **inclusive, usable, and robust experiences** for all users, regardless of ability.  

> Senior Tip:
> Accessibility should be **built in from the start**, not patched later. It improves **quality, reach, and brand trust**.

## Move from terminology to an implemented task

Start with the [semantic HTML lesson](./What_is_semantic_HTML.md): a labeled native form, scoped landmarks, a sortable table with row/column headers, accessible name/description examples and an owned disclosure. Compare names, roles, states, keyboard operation and failure recovery rather than counting ARIA attributes. The [WCAG criterion matrix](./What_is_WCAG_standard__What_parts_it_contains_Web_Content_Accessibility_Guidelines.md#criteria-mapped-to-implementation-decisions) connects these decisions to numbered criteria and a scoped evidence record.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/a11y/What_is_a11y.md). All learner practice remains outstanding; the worked examples above are explanatory material.
