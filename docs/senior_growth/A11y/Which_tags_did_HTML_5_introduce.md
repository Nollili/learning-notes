# Which tags did HTML 5 introduce?

## 🔹 HTML5 New Semantic & Structural Tags

HTML5 introduced several **new elements** to improve **semantic structure, accessibility, and multimedia support**. These tags help browsers, developers, and assistive technologies understand the **purpose and structure of content**.

---

## 1️⃣ Structural / Semantic Elements

| Tag          | Purpose / Description                                    |
|-------------|---------------------------------------------------------|
| `<header>`  | Represents introductory content or navigation section.  |
| `<nav>`     | Defines a section for navigation links.                |
| `<main>`    | Represents the main content of the document.           |
| `<section>` | Defines a thematic grouping of content (like chapters).|
| `<article>` | Represents independent, self-contained content (blog post, news item). |
| `<aside>`   | Content tangentially related to the main content (sidebar, callout). |
| `<footer>`  | Footer section for a document or section (copyright, contacts). |
| `<figure>`  | Self-contained content, like images, diagrams, code snippets. |
| `<figcaption>` | Caption or legend for a `<figure>` element.         |
| `<mark>`    | Highlights or emphasizes text for reference.           |
| `<time>`    | Represents a date/time value.                          |
| `<details>` | Disclosure widget that the user can open/close.       |
| `<summary>` | Summary or label for `<details>` element.             |
| `<dialog>`  | Represents a dialog box or interactive component.     |

---

## 2️⃣ Multimedia Elements

| Tag          | Purpose / Description                                    |
|-------------|---------------------------------------------------------|
| `<audio>`   | Embeds audio content.                                    |
| `<video>`   | Embeds video content.                                    |
| `<source>`  | Specifies multiple media sources for `<audio>` or `<video>`. |
| `<track>`   | Provides subtitles, captions, or descriptions for media. |
| `<canvas>`  | Defines a drawable area for graphics via JavaScript.    |
| `<svg>`     | Scalable Vector Graphics directly in HTML.              |

---

## 3️⃣ Form / Input Enhancements

| Tag / Attribute | Purpose / Description                                  |
|-----------------|--------------------------------------------------------|
| `<input type="email|date|url|number|range|tel|color">` | New input types for validation and better UX |
| `<datalist>`    | Defines a list of predefined options for input.      |
| `<output>`      | Represents the result of a calculation or action.   |
| `<progress>`    | Shows progress of a task.                            |
| `<meter>`       | Displays a measurement within a known range.       |
| `<keygen>` (deprecated in modern browsers) | Generates key-pair for forms. |

---

## 4️⃣ Deprecated / Removed in HTML5

- `<center>`, `<font>`, `<big>`, `<strike>`, `<u>`  
  → replaced by **CSS for styling**.

---

## 5️⃣ Benefits of HTML5 Tags

1. **Better semantics & structure** → easier for search engines and screen readers.  
2. **Improved accessibility** → ARIA roles are often implied.  
3. **Rich multimedia support** → no need for third-party plugins.  
4. **Cleaner code** → reduces reliance on `<div>` and `<span>` for layout.  

---

### ✅ Summary

HTML5 introduced **semantic, multimedia, and enhanced form tags** to:

- Make content **meaningful and structured**.
- Improve **accessibility and SEO**.
- Enable **rich media experiences** without extra plugins.

> 💡 Senior Tip:  
> Always use **semantic HTML5 tags over generic `<div>`s** whenever possible; it improves **a11y, SEO, and maintainability**.
