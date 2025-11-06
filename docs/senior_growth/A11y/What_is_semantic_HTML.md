# What is semantic HTML?

**Semantic HTML** refers to using **HTML elements that have meaningful names** which convey the **purpose and structure** of the content, rather than purely defining how it looks.  

Semantic elements improve **accessibility, SEO, and maintainability**.

---

## 1️⃣ What Makes HTML Semantic?

- Elements **describe the content’s role**.
- Browsers, developers, and assistive technologies can **understand the page structure**.
- Avoids using generic `<div>` and `<span>` for everything.

---

## 2️⃣ Common Semantic HTML Elements

| Element      | Purpose / Usage                                      |
|-------------|-----------------------------------------------------|
| `<header>`  | Introductory content or navigation at top          |
| `<nav>`     | Navigation links                                   |
| `<main>`    | Main content area                                  |
| `<section>` | Thematically grouped content                       |
| `<article>` | Independent, self-contained content (blog, post)  |
| `<aside>`   | Sidebar or complementary content                  |
| `<footer>`  | Footer content, legal info, copyright             |
| `<h1>-<h6>`| Headings hierarchy                                 |
| `<p>`       | Paragraphs                                         |
| `<ul> / <ol>` | Lists                                           |
| `<figure>` & `<figcaption>` | Media with caption                     |
| `<button>`  | Actionable button                                  |
| `<form>`    | Forms for input                                    |
| `<label>`   | Label for form input                               |
| `<table>`   | Tabular data                                      |

---

## 3️⃣ Benefits of Semantic HTML

1. **Accessibility (a11y)**
   - Screen readers understand the structure.
   - Users can navigate with assistive devices.

2. **SEO**
   - Search engines understand page hierarchy and content importance.

3. **Maintainability**
   - Clear structure makes code easier to read and maintain.

4. **Future-proof**
   - Modern browsers and tools better handle semantic content.

---

## 4️⃣ Examples

```html
<header>
  <h1>My Blog</h1>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h2>Semantic HTML Guide</h2>
    <p>Using semantic HTML improves accessibility, SEO, and readability.</p>
  </article>
  <aside>
    <p>Related articles</p>
  </aside>
</main>

<footer>
  <p>&copy; 2025 My Website</p>
</footer>
````

---

### ✅ Summary

* Semantic HTML = **meaningful, descriptive markup**.
* Improves **accessibility, SEO, and code clarity**.
* Always prefer semantic elements over generic `<div>` or `<span>` when possible.

> 💡 Senior Tip:
> Combine **semantic HTML with ARIA roles** for advanced accessibility in dynamic UIs.
