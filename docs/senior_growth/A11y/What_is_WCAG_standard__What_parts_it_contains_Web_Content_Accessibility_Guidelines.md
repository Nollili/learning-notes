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

- Helps organizations comply with **legal accessibility requirements** (ADA, EN 301 549, Section 508).

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
- **WCAG 2.2** (draft/future) – further improvements for cognitive and motor accessibility  

### 3.2 Conformance Levels
| Level | Meaning                                    |
|-------|--------------------------------------------|
| **A** | Minimum accessibility; basic issues fixed |
| **AA** | Recommended for legal compliance; medium-level issues fixed |
| **AAA** | Highest level; very strict, often impractical for all content |

> Most organizations aim for **WCAG 2.1 Level AA compliance**.

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
- Ensures web content is **inclusive, usable, and legally compliant**.

> 💡 Senior Tip:  
> Aim for **WCAG 2.1 Level AA** as a realistic standard. Combine **semantic HTML, ARIA roles, keyboard accessibility, and testing** to achieve compliance.
