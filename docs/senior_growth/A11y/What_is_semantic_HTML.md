# What is semantic HTML?

**Semantic HTML** refers to using **HTML elements that have meaningful names** which convey the **purpose and structure** of the content, rather than purely defining how it looks.  

Semantic elements improve **accessibility, SEO, and maintainability**.

---

## What Makes HTML Semantic? {#_1%EF%B8%8F%E2%83%A3-what-makes-html-semantic}

- Elements **describe the content’s role**.
- Browsers, developers, and assistive technologies can **understand the page structure**.
- Avoids using generic `<div>` and `<span>` for everything.

---

## Common Semantic HTML Elements {#_2%EF%B8%8F%E2%83%A3-common-semantic-html-elements}

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

## Benefits of Semantic HTML {#_3%EF%B8%8F%E2%83%A3-benefits-of-semantic-html}

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

## Examples {#_4%EF%B8%8F%E2%83%A3-examples}

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
```

---

### Summary {#%E2%9C%85-summary}

* Semantic HTML = **meaningful, descriptive markup**.
* Improves **accessibility, SEO, and code clarity**.
* Always prefer semantic elements over generic `<div>` or `<span>` when possible.

> Senior Tip:
> Prefer native semantics, then add only the ARIA states/relationships the interaction needs. Redundant/conflicting roles can make an otherwise useful native element worse.

## Page structure and accessible names

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<header>
  <a href="/">Learning library</a>
  <nav aria-label="Primary"><a href="/courses">Courses</a></nav>
</header>
<main id="main-content" tabindex="-1">
  <h1>Course library</h1>
  <section aria-labelledby="featured-title">
    <h2 id="featured-title">Featured courses</h2>
    <article><h3>Browser fundamentals</h3><p>DOM and accessibility.</p></article>
  </section>
  <button type="button" aria-expanded="false" aria-controls="filters">Show filters</button>
  <div id="filters" hidden>Filter controls belong here.</div>
</main>
<footer><nav aria-label="Policies"><a href="/privacy">Privacy</a></nav></footer>
```

Use headings for hierarchy rather than visual font size; one clear page h1 is a useful convention, not a substitute for testing the actual hierarchy. A section without a name is not automatically a useful landmark. Page header/footer roles depend on their context; a header inside an article is not the page banner. Name multiple nav landmarks by purpose. Keep the skip link visible when focused and test where fragment navigation moves focus.

A link navigates to a real destination; a button performs an action. Give non-submit buttons type=button inside a form. Do not nest interactive controls inside one another. The filter disclosure must toggle hidden/aria-expanded together, preserve a usable focus target and allow Tab to leave; it is not a modal trap. With no enhancement, render essential filters available or provide a dedicated filter page rather than hiding the only route to a task.

Accessible names may come from associated labels, referenced text via aria-labelledby, aria-label, or permitted contents depending on the element. aria-label can override visible text; ensure the visible label is included in the spoken name for speech-input users. aria-describedby supplies a description, not the control's name. Placeholder text is not a durable visible label. Inspect the rendered accessibility tree, not only JSX attributes.

## Native form workflow before enhancement

```html
<form action="/courses/search" method="get" role="search" aria-label="Courses">
  <label for="course-query">Course title</label>
  <input id="course-query" name="q" type="search" required minlength="2" maxlength="80"
         aria-describedby="query-hint" autocomplete="off">
  <p id="query-hint">Enter2–80characters. This search is public; do not enter private data.</p>
  <fieldset>
    <legend>Delivery</legend>
    <label><input type="radio" name="delivery" value="any" checked>Any</label>
    <label><input type="radio" name="delivery" value="online">Online</label>
  </fieldset>
  <button type="submit" name="action" value="search">Search courses</button>
</form>
```

This baseline works without JavaScript when the server implements /courses/search and returns accessible HTML results/errors. GET puts query data in URLs/history/logs, so do not use it for secrets or mutations. The server must independently parse length/allowlisted delivery and encode any echoed text; client constraints are usability, not a security boundary. For authenticated mutations use POST or another appropriate method plus the server's CSRF/auth policy.

Native constraint validation checks required/type/range/pattern conditions before a normal submit event. invalid is fired on failing controls and does not bubble normally; a capture listener can observe it. checkValidity returns a boolean; reportValidity also requests native feedback. requestSubmit follows submit-button validation/event behavior; form.submit bypasses it. novalidate is appropriate only when a complete alternative validation/error flow is implemented, such as the dialog example.

FormData includes successful named controls: disabled controls and unchecked checkbox/radio values are omitted; readonly text fields differ from disabled fields; repeated names produce multiple values. Use getAll for a repeated field and validate files/limits separately. Browser validation messages/appearance vary; do not depend on their exact English text. setCustomValidity must be cleared with an empty string once corrected or the control remains invalid.

**Enhancement contract:** keep the real action/method; intercept submit only when the enhancement is ready. Announce pending/results/errors through a suitable status region, preserve input/focus, cancel superseded requests and provide a retry/native-navigation fallback. JSON and HTML responses need deliberate content negotiation. A failed bundle/network request must not remove the baseline server path. Do not report a successful save merely because local validation passed.


## A sortable data table, not an application grid

```html
<table id="course-prices">
  <caption>Example course prices in GBP</caption>
  <thead><tr>
    <th scope="col">Course</th>
    <th scope="col" id="price-heading" aria-sort="ascending">
      <button id="sort-price" type="button">Price</button>
    </th>
  </tr></thead>
  <tbody id="course-rows">
    <tr><th scope="row">TypeScript</th><td>£20.00</td></tr>
    <tr><th scope="row">Browser</th><td>£30.00</td></tr>
    <tr><th scope="row">Node</th><td>£30.00</td></tr>
  </tbody>
</table>
<p id="sort-status" role="status"></p>
```

```js
const courses = [
  { id: 'a', name: 'Browser', priceMinor: 3000 },
  { id: 'b', name: 'TypeScript', priceMinor: 2000 },
  { id: 'c', name: 'Node', priceMinor: 3000 },
];
let ascending = true;
const formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const body = document.querySelector('#course-rows');
const heading = document.querySelector('#price-heading');
function renderCourses() {
  const sorted = [...courses].sort((a, b) => {
    const priceOrder = ascending ? a.priceMinor - b.priceMinor : b.priceMinor - a.priceMinor;
    return priceOrder || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  });
  const fragment = document.createDocumentFragment();
  for (const course of sorted) {
    const row = document.createElement('tr');
    const name = document.createElement('th'); name.scope = 'row'; name.textContent = course.name;
    const price = document.createElement('td'); price.textContent = formatter.format(course.priceMinor / 100);
    row.append(name, price); fragment.append(row);
  }
  body.replaceChildren(fragment); // Rows are display-only, so no edited cell state is discarded.
  heading.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
}
document.querySelector('#sort-price').addEventListener('click', () => {
  ascending = !ascending; renderCourses();
  document.querySelector('#sort-status').textContent = `Sorted by price ${ascending ? 'ascending' : 'descending'}.`;
});
renderCourses();
```

The caption names the data; row/column headers establish relationships. Sorting preserves focus on the existing header button and compares numeric minor units, not formatted strings. The ID tie-breaker makes equal-price order explicit. Render initial rows server-side for no-JS availability; the snippet isolates the client sort algorithm. Large/server-paginated datasets must sort/filter on the server across the whole result set, with a deterministic cursor contract.

Use table semantics for reading data with links/buttons. ARIA grid introduces a different keyboard model (roving focus, arrow navigation, editing) and should be chosen only when the interaction needs it. For complex multilevel headers use justified scope/headers/id relationships. If a wide table scrolls horizontally, preserve a meaningful accessible name and keyboard access to its scroll container; do not destroy header relationships just to make cards visually.


Official references: [WAI page structure](https://www.w3.org/WAI/tutorials/page-structure/), [WAI form validation](https://www.w3.org/WAI/tutorials/forms/validation/), [WHATWG forms](https://html.spec.whatwg.org/multipage/forms.html), [WAI tables](https://www.w3.org/WAI/tutorials/tables/), [accessible name/description](https://www.w3.org/TR/accname-1.2/). Checked2026-10-20; browser/reader results must be collected in practice.

## Accessible name, description, role and state are separate contracts

Checked2026-10-21 against ARIA-in-HTML Recommendation (2026-08-11), WAI patterns and the current AccName1.2 working draft. A specification draft is not a guarantee that every browser/reader exposes identical behavior. Inspect the actual accessibility tree and test the supported platform combination.

```html
<label for="billing-email">Billing email</label>
<input id="billing-email" type="email" aria-describedby="billing-email-hint">
<p id="billing-email-hint">Receipts go here; this does not change sign-in.</p>

<button type="button" aria-labelledby="save-label" aria-label="Commit">
  <span id="save-label">Save profile</span>
</button>

<button type="button" aria-label="Close profile editor">
  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16">
    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" />
  </svg>
</button>
```

For these examples, expect the input's name “Billing email” and a separate hint description; expect “Save profile” from the referenced label rather than Commit; expect an icon-only close button named by aria-label with the decorative SVG excluded.

Do not keep competing naming mechanisms in real code merely because this fixture demonstrates precedence. aria-labelledby references can compose text in ID order and direct hidden references can contribute under the algorithm's rules; visually hiding text does not always remove it from a referenced name/description. Broken/duplicate IDs or an overriding label can produce a different result than the visible text suggests.

The exact naming algorithm depends on host element/role; do not assume every div/paragraph can be given a useful name by aria-label. Prefer label/legend/caption/heading relationships and meaningful native text. A placeholder is a hint, not a persistent visible label. A name identifies the control; a description adds instructions/errors; a role declares interaction semantics; states such as expanded/pressed/checked/current report the current condition. Adding a role does not implement keyboard behavior or state transitions.

| Intent | Appropriate starting point | Frequent failure |
|---|---|---|
| Navigate | a with real href | div role=link with no native navigation/modified-click support |
| Submit/act | button with explicit type | nested buttons/links or missing type submits an unrelated form |
| Toggle value | checkbox or justified pressed button | state changes visually while aria-pressed/checked stays stale |
| Disclose links | button expanded state + normal nav links | role=menu added without the application-menu keyboard model |
| Read data | table caption/headers | layout divs painted as a grid without header relationships |
| Composite tabs | tablist/tab/tabpanel plus roving keyboard behavior | labels/roles without linked active state or arrows |

A native disabled control suppresses operation and usually leaves the tab sequence. aria-disabled on a custom/kept-focusable control announces a state but does not prevent activation; the implementation must enforce it. aria-hidden is not a way to disable a focusable button: it can create a keyboard focus target absent from the accessibility tree. Never hide an ancestor containing the current focus or use aria-modal as a substitute for real inert/modal behavior. Check permitted roles/states in ARIA-in-HTML rather than adding every attribute to every element.

## Worked navigation disclosure: not an application menu

```html
<!-- Server/no-JS baseline: links are available; enhancement button starts hidden. -->
<nav id="account-navigation" aria-label="Account">
  <button id="account-toggle" type="button" hidden aria-controls="account-links" aria-expanded="true">Account links</button>
  <ul id="account-links"><li><a href="/profile">Profile</a></li><li><a href="/settings">Settings</a></li></ul>
</nav>
```

```js
export function installAccountDisclosure(root) {
  const nav = root.querySelector('#account-navigation');
  const button = root.querySelector('#account-toggle');
  const links = root.querySelector('#account-links');
  function setExpanded(expanded) {
    if (!expanded && links.contains(document.activeElement)) button.focus();
    links.hidden = !expanded;
    button.setAttribute('aria-expanded', String(expanded));
  }
  const toggle = () => setExpanded(links.hidden);
  const escape = event => {
    if (event.key === 'Escape' && !links.hidden) { event.preventDefault(); setExpanded(false); }
  };
  button.hidden = false; setExpanded(false);
  button.addEventListener('click', toggle); nav.addEventListener('keydown', escape);
  return () => {
    button.removeEventListener('click', toggle); nav.removeEventListener('keydown', escape);
    links.hidden = false;
    if (document.activeElement === button && links.isConnected) links.querySelector('a')?.focus();
    button.hidden = true; button.setAttribute('aria-expanded', 'true');
  };
}
// Install after markup; dispose on owner teardown. Unique IDs are for this one fixture.
```

Enter/Space activate the native button; Tab moves into/through links and can leave the disclosure. Escape closes and restores to the toggle if focus was in the collapsed links. No focus trap, menuitem role or arrow-key protocol is invented for ordinary site navigation. The no-JS baseline retains the links; the disposer reveals links and moves toggle focus to the first surviving link before hiding the enhancement. If the entire navigation is removed, its parent owner supplies a logical surviving focus target.

For a real composite widget, study the [worked value-paired tabs](../React/Are_there_design_patterns_in_react.md): role/ID linkage, roving Tab stop, arrows/Home/End, active panel and static-horizontal API limits are implemented there. Automatic activation needs low-latency panels; manual activation requires a separate focus/selected policy. Use the native sortable table above for reading tabular records; a spreadsheet grid is a different accessibility/keyboard project. These shared examples satisfy different interaction needs rather than requiring a custom menu/grid everywhere.


References: [ARIA in HTML](https://www.w3.org/TR/html-aria/), [AccName1.2 draft](https://www.w3.org/TR/accname-1.2/), [APG disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [APG menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/). Checked2026-10-21.

### Connect isolated semantics to a complete path

The [HTML-first search fixture](../Other/Cross_Browser_Progressive_Enhancement.md) supplies the missing runnable server/optional enhancement boundary for a small public search, including escaped HTML, invalid/repeated-query rejection, request failure fallback and Playwright keyboard/no-JS tests. Its exact route and field names differ from the course form above; adapt one coherent path rather than assume /courses/search is implemented by /search. The [WCAG evidence record](./What_is_WCAG_standard__What_parts_it_contains_Web_Content_Accessibility_Guidelines.md#a-scoped-evidence-record-not-a-percentage-score) explains how to record observations without turning selected DOM checks into a conformance claim.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/a11y/What_is_semantic_HTML.md). All learner practice remains outstanding; the worked examples above are explanatory material.
