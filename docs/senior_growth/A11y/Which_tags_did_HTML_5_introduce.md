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
| `email`, `date`, `url`, `number`, `range`, `tel`, `color` | Separate input type values, e.g. `<input type="email">`; the pipe-separated list is notation, not valid HTML |
| `<datalist>`    | Defines a list of predefined options for input.      |
| `<output>`      | Represents the result of a calculation or action.   |
| `<progress>`    | Shows progress of a task.                            |
| `<meter>`       | Displays a measurement within a known range.       |
| Historical `<keygen>` | Obsolete; do not use in new HTML. |

---

## 4️⃣ Deprecated / Removed in HTML5

- Obsolete presentational elements include `<center>`, `<font>`, `<big>`, `<strike>`  
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

## Living HTML semantics and practical choices

HTML is maintained as a Living Standard; “HTML5 introduced” is a historical overview, not a frozen feature/support guarantee. `<u>` remains valid for an unarticulated nontextual annotation, such as marking a spelling error. Use CSS `text-decoration` for purely visual underlining; avoid link-like underlines on ordinary text. Use `<em>` for stress, `<strong>` for importance, `<s>` for no-longer-accurate content and `<del>` for an edit deletion.

```html
<p>The draft contains <u class="spelling">recieve</u> (spelling annotation).</p>
<label for="contact-email">Contact email</label>
<input id="contact-email" name="email" type="email" autocomplete="email" required>
<details>
  <summary>Why we ask for an email address</summary>
  <p>We send the requested receipt. Optional marketing consent is separate.</p>
</details>
```

Native details/summary already provides disclosure behavior; do not add competing click/key handlers or modal focus containment. Native email validation improves feedback but does not replace server validation. `type="tel"` hints at an input mode; it does not universally validate phone formats. Canvas needs an accessible equivalent for meaningful visual content. Headings and landmarks require a coherent document structure, not merely replacing every div with a section.

**Exercise:** replace a clickable-div disclosure with details/summary and implement the labeled email control. Acceptance: keyboard toggling works; accessible names/states match visible purpose; invalid email is identified; no obsolete keygen/presentational elements remain; spelling annotation is distinguishable from a link. Record browser/assistive-technology behavior rather than assuming support from tag names.

Official references: [WHATWG u](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-u-element), [obsolete elements](https://html.spec.whatwg.org/multipage/obsolete.html), [details](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element), [input](https://html.spec.whatwg.org/multipage/input.html). Checked2026-10-20.

### Follow the historical list into a real workflow

The labeled email/details snippet above is valid markup, unlike treating several input type names as one type value. Continue with the [native form and table examples](./What_is_semantic_HTML.md#native-form-workflow-before-enhancement) for successful controls, validation, names and scoped table headers. For a complete server path rather than an isolated tag snippet, use the [HTML-first search fixture](../Other/Cross_Browser_Progressive_Enhancement.md). Native disclosure/email validity can be partially checked in a DOM simulation; keyboard disclosure behavior, native validation feedback and assistive output require the actual browser/reader. Keep those practice results distinct from source validation.
