# Can you explain to me the difference between virtual dom and shadow dom/real dom? {#can-you-explain-to-me-the-difference-between-virtual-dom-and-shadow-dom-real-dom}

## Difference Between Virtual DOM, Shadow DOM, and Real DOM {#difference-between-virtual-dom-shadow-dom-and-real-dom}

### **Real DOM**

**Definition**:

The Real DOM (Document Object Model) is the browser's internal representation of the structure of a web page. It represents the HTML document as a tree of nodes.

**Key Characteristics**:

- **Mutable**: Updating the DOM directly modifies the structure and content of the page.
- **Synchronous mutation, scheduled rendering**: DOM mutations are observable immediately, but style/layout/paint are generally scheduled and may be coalesced. Reading layout after a write can force synchronous work; a mutation does not imply an immediate repaint.
- **Event Delegation**: Event listeners are attached to nodes in the tree.

**Example**:
HTML:

```html
<div id="root">
  <p>Hello World!</p>
</div>
```

Real DOM structure:

```html
Document
└── <html>
    └── <body>
        └── <div id="root">
            └── <p>Hello World!</p>
```

**Challenges**:

- Updating the Real DOM frequently can be **expensive** (slow), as the browser recalculates styles, layout, and paints the UI.
- Inefficient for modern dynamic and interactive applications.

---

### **Virtual DOM**

**Definition**:

The Virtual DOM is an in-memory lightweight JavaScript representation of the Real DOM. It describes desired UI; it is not a complete copy of browser DOM state. React reconciles element descriptions and commits required host mutations. This supports declarative composition; performance depends on the workload.

**Key Characteristics**:

- **Immutable descriptions**: React elements describe desired UI for a render; they do not snapshot browser input selection, layout or every DOM property.
- **Efficient Updates**: Changes are applied to the Virtual DOM first. React then calculates the **difference (diff)** between the current and previous Virtual DOM versions and efficiently updates only the changed parts of the Real DOM.
- **Declarative**: Developers describe what the UI should look like, and React handles the updates.

**Example**:
React component:

```jsx
const App = () => <div>Hello World!</div>;
```

Virtual DOM structure:

```json
{
  "type": "div",
  "props": {},
  "children": [
    {
      "type": "text",
      "props": { "value": "Hello World!" }
    }
  ]
}
```

**Benefits**:

- Can batch updates; less rendering work is a workload-dependent outcome, not a universal speed guarantee.
- Reduces costly direct interactions with the Real DOM.
- Simplifies UI logic with a declarative programming model.

---

### **Shadow DOM**

**Definition**:

The Shadow DOM is a browser feature that allows developers to create encapsulated and scoped DOM trees. It is primarily used for creating reusable and self-contained **Web Components**.

**Key Characteristics**:

- **Encapsulation**: Selectors are scoped by a shadow boundary, with deliberate styling channels. JavaScript runs in the same page environment; Shadow DOM is not a security sandbox.
- **Real DOM Element**: Shadow DOM elements are part of the Real DOM but operate within their isolated subtree.
- **Custom Elements**: Shadow DOM is commonly used with Web Components.

**Example**:

```html
<my-element></my-element>
<script>
  class MyElement extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<p>Hello Shadow DOM!</p>`;
    }
  }
  customElements.define('my-element', MyElement);
</script>
```

Result in the browser:

```php
<my-element>
  #shadow-root
    <p>Hello Shadow DOM!</p>
</my-element>
```

**Benefits**:

- Limits ordinary selector leakage; inherited values, custom properties, slots and exposed parts still matter.
- Useful for author-defined reusable controls; native controls may use browser-owned internal trees with their own implementation rules.
- Native browser support without external libraries.

---

### **Comparison Table**

| Feature | **Real DOM** | **Virtual DOM** | **Shadow DOM** |
| --- | --- | --- | --- |
| **Definition** | The actual DOM tree. | Lightweight in-memory copy of the Real DOM. | Scoped and encapsulated subtree of the Real DOM. |
| **Performance** | Depends on mutation/read/rendering work. | Reconciliation adds work and can avoid unnecessary mutations. | Browser DOM work plus scoped-tree behavior. |
| **Use Case** | Web pages and basic apps. | Used in frameworks like React for performance optimization. | Creating reusable Web Components. |
| **Encapsulation** | Ordinary document tree. | No browser isolation boundary. | DOM/selector boundary; no JavaScript security isolation. |
| **Direct Interaction** | Can directly manipulate nodes. | Cannot interact directly, requires rendering logic. | Can manipulate within its scope. |
| **Styling** | Global scope. | Global scope. | Scoped to the component. |

---

### **When to Use What?**

- **Real DOM**: Every browser UI ultimately uses browser-managed DOM; direct APIs are useful for focused interactions too.
- **Virtual DOM**: Choose a declarative framework for its composition/state model; measure performance against the application needs.
- **Shadow DOM**: Useful for reusable custom elements with explicit styling/interaction contracts; test the boundary instead of assuming full isolation.

---

### **Analogy for Understanding**

1. **Real DOM**: Like editing a book directly; each change requires finding the exact page and section, whose cost depends on the operation.
2. **Virtual DOM**: Like editing a draft copy of the book, then highlighting only the changes and updating the final book.
3. **Shadow DOM**: Like a chapter in the book that is self-contained and doesn’t affect other chapters or the overall book format.

## A complete small custom-element contract

Use a Web Component when the same native-DOM widget must work in several frameworks or plain HTML. Use a React component when React composition/state tooling is the main integration need; a custom element adds lifecycle, typing, event and styling boundaries. Neither implies faster rendering. The example below is an autonomous custom element for a non-form toggle; it deliberately uses a native button **inside** the shadow tree for semantics and keyboard activation.

Contract: `pressed` and `disabled` are reflected boolean attributes/properties; `context` is a property-only immutable projected object; `toggle-change` carries a small data payload; default slot is the visible button label, named `hint` slot is the description. State is local/uncontrolled: activation immediately commits pressed state; an application may explicitly set `.pressed` to reconcile external state. This is not a controlled React input or a form-associated element and does not persist progress by itself.

```js
// study-toggle.js — browser module; register once per document registry
export class StudyToggle extends HTMLElement {
  static observedAttributes = ['pressed', 'disabled'];
  #button;
  #connection = null;
  #context = Object.freeze({ courseId: '' });
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    // Only a fixed trusted template; never interpolate user HTML here.
    shadow.innerHTML = `
      <style>
        :host { display: inline-block; }
        button { font: inherit; padding: .5rem 1rem; border: 2px solid currentColor;
          background: var(--study-surface, Canvas); color: var(--study-text, CanvasText); }
        button:focus-visible { outline: 3px solid var(--study-focus, Highlight);
          outline-offset: 3px; }
        #hint { display: block; font-size: .875em; }
        @media (forced-colors: active) { button { border-color: ButtonText; } }
      </style>
      <button part="button" type="button" aria-pressed="false" aria-describedby="hint">
        <slot>Mark complete</slot>
      </button>
      <span id="hint" part="hint"><slot name="hint">Toggle completion status.</slot></span>`;
    this.#button = shadow.querySelector('button');
  }
  get pressed() { return this.hasAttribute('pressed'); }
  set pressed(value) { this.toggleAttribute('pressed', Boolean(value)); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(value) { this.toggleAttribute('disabled', Boolean(value)); }
  get context() { return this.#context; }
  set context(value) {
    if (!value || typeof value.courseId !== 'string' || value.courseId.length > 100)
      throw new TypeError('context.courseId must be a string of at most 100 characters');
    this.#context = Object.freeze({ courseId: value.courseId });
  }
  #render() {
    this.#button.disabled = this.disabled;
    this.#button.setAttribute('aria-pressed', String(this.pressed));
  }
  #upgradeProperty(name) {
    // A caller may assign a property before customElements.define upgrades the tag.
    if (Object.hasOwn(this, name)) {
      const value = this[name]; delete this[name]; this[name] = value;
    }
  }
  connectedCallback() {
    if (!this.isConnected || this.#connection) return;
    for (const name of ['pressed', 'disabled', 'context']) this.#upgradeProperty(name);
    const Controller = this.ownerDocument.defaultView?.AbortController ?? AbortController;
    this.#connection = new Controller();
    this.#button.addEventListener('click', () => {
      if (this.disabled) return;
      this.pressed = !this.pressed;
      // Construct the event in the owning window, including after adoption.
      const EventType = this.ownerDocument.defaultView?.CustomEvent ?? CustomEvent;
      this.#button.dispatchEvent(new EventType('toggle-change', {
        bubbles: true, composed: true,
        detail: Object.freeze({ pressed: this.pressed, courseId: this.#context.courseId })
      }));
    }, { signal: this.#connection.signal });
    this.#render();
  }
  disconnectedCallback() {
    this.#connection?.abort(); this.#connection = null;
  }
  adoptedCallback() {
    // Discard connection resources tied to the old document/window.
    this.disconnectedCallback();
    if (this.isConnected) this.connectedCallback();
  }
  attributeChangedCallback(name, previous, next) {
    if (previous !== next) this.#render();
  }
}
if (!customElements.get('study-toggle')) customElements.define('study-toggle', StudyToggle);
```

```html
<study-toggle id="course-toggle">
  Mark complete
  <span slot="hint">Updates this course's completion flag.</span>
</study-toggle>
```

```js
// Plain-DOM consumer; import registration before selecting/updating the element.
import './study-toggle.js';
const element = document.querySelector('#course-toggle');
if (!element) throw new Error('Missing study toggle');
element.context = { courseId: 'course-42' };
element.pressed = false;
const onChange = event => {
  console.log(event.detail.courseId, event.detail.pressed);
};
element.addEventListener('toggle-change', onChange);
// Consumer cleanup when its own view is destroyed:
// element.removeEventListener('toggle-change', onChange);
```

### Lifecycle, reflection and failure cases

The constructor creates owned internals; it does not read initial light-DOM children/attributes or perform network work. Connection can occur many times, including ordinary moves. Install listeners once per connection and release them on disconnection; reconnection must not duplicate activation. Observed attributes may run on upgrade as well as later changes; never assume attributeChanged means a user action. A setter reflects to an attribute, while the callback only renders, avoiding setter/callback reflection loops. State remains in attributes across reconnections.

The new `connectedMoveCallback`/state-preserving move APIs have their own support contract; this lesson does not require them and remains reconnect-safe for ordinary insertion/removal.

Boolean attributes mean **presence**, so `<study-toggle disabled="false">` is disabled. Set `.disabled = false` or remove the attribute. Structured context stays a property: attributes are strings, not arbitrary JS objects. Projection prevents retaining a mutable caller object; no secret should be embedded in the page or custom-event detail. The upgrade helper removes a pre-definition own property so the prototype setter can run.

Test definition-before-render and render-before-definition; global registration is an application concern, not a side effect to run during server rendering. The guard avoids duplicate-definition exceptions but does not hot-replace an old class; reload after implementation changes when needed.

An ordinary move may briefly disconnect/reconnect; cleanup must not erase legitimate state. Adoption changes ownerDocument, so window-bound listeners/controllers/observers must be recreated. Async fetches/timers, if added, require cancellation and stale-result protection too; a removed element must not keep global listeners alive. Native `formAssociated`/ElementInternals, validation/reset/submission and restoration are separate advanced contracts. Prefer a real light-DOM form control or a reviewed form-associated implementation for submitted values; this toggle is neither a checkbox field nor an automatic FormData entry.

### Slots, styling and events cross different boundaries

A slotted node remains a light-DOM child; the slot projects it into the composed rendering tree rather than cloning it. A named slot matches the child's `slot` attribute. Listen to `slotchange` and inspect `assignedNodes`/`assignedElements` when assigned-node changes matter; mutations deep inside an already assigned subtree need their own observation policy. Keep the visible toggle label stable when `aria-pressed` changes so its state, not a renamed action, communicates completion. Empty/whitespace-only consumer content may defeat the fallback and needs an authoring rule/test.

Document selectors do not ordinarily select internal buttons. Inherited font/color/custom properties can cross; consumers can style documented `::part(button)` and `::part(hint)` hooks. `::slotted()` targets assigned elements, not arbitrary deep descendants. Publish supported custom properties and parts as API; renaming them can break consumers. `mode:'closed'` changes ordinary shadowRoot access, not the JavaScript trust boundary. Same-page code and XSS remain a security concern.

The emitted event starts at the internal button. `bubbles:true` enables ancestor bubbling and `composed:true` allows it across the shadow boundary. Outside, `event.target` is retargeted to the host; `composedPath()` can expose allowed path entries for an open shadow root. Consumers should use the documented detail payload rather than depend on internal paths. The event is a committed notification, not a cancelable permission request: calling preventDefault cannot undo the local state change. A request/approval API would need a separately documented cancelable event or controlled state contract.

### React 19 integration

Current React recognizes hyphenated tags as custom elements, supports property assignment when a property exists on the constructed instance, and supports custom events through appropriately named handlers. Attribute serialization and property assignment differ; confirm registration timing and exact event casing. To keep the contract explicit across React typings, a typed wrapper can own DOM property and listener integration:

```tsx
import { createElement, useEffect, useRef } from 'react';
import { StudyToggle } from './study-toggle.js'; // browser/client module only

type ToggleDetail = { pressed: boolean; courseId: string };
export function StudyToggleView({ courseId, onChange }: {
  courseId: string; onChange: (value: ToggleDetail) => void;
}) {
  const ref = useRef<StudyToggle | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.context = { courseId };
    const listener = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail: unknown = event.detail;
      if (!detail || typeof detail !== 'object' || !('pressed' in detail) ||
          !('courseId' in detail) || typeof detail.pressed !== 'boolean' ||
          typeof detail.courseId !== 'string') return;
      onChange({ pressed: detail.pressed, courseId: detail.courseId });
    };
    element.addEventListener('toggle-change', listener);
    return () => element.removeEventListener('toggle-change', listener);
  }, [courseId, onChange]);
  return createElement('study-toggle', { ref }, 'Mark complete');
}
```

The wrapper is uncontrolled: it observes changes without a second React pressed state. It preserves the instance while updating context/listener cleanup; a stable callback can avoid unnecessary resubscription. For strict TS, supply a declaration for the JS class (or author it as typed TS), including its context and HTMLElement inheritance. The note's syntax check does not prove those declarations or a React application compile.

Import this registration module only in a browser boundary; `HTMLElement` is absent on an ordinary server. A framework client component can still be pre-rendered on a server, so use an explicit client-only loader/dynamic import strategy rather than assuming a client directive alone makes top-level DOM globals safe. A custom element's lifecycle is not React's effect lifecycle.

### Reusable accessibility and interoperability acceptance contract

The native internal button owns name, role, pressed state, disabled behavior, focus outline and keyboard activation. IDs referenced by aria-describedby are in that same shadow root. Do not assume an external label's `for` or an ARIA IDREF crosses into an internal control. Slot text can supply the visible accessible name, but the actual computed name/description must be inspected in supported browsers/assistive technologies. `delegatesFocus` is not used and would not solve naming, keyboard order or form association by itself.

Build a plain HTML consumer and a React consumer. Acceptance: fallback/custom labels and hint are announced correctly; keyboard Tab/Space/Enter activates exactly once; pressed state updates; disabled blocks activation; focus is visible in both themes/forced colors; external part/token overrides retain contrast and zoom usability. Add listeners outside and confirm retargeting, detail and propagation behavior. Set/remove boolean attributes, assign properties before definition, reconnect repeatedly and adopt into another document; verify no duplicate listeners and correct state. Confirm slotted nodes remain light-DOM nodes and cleanup runs after each consumer unmount.

Record browser/version, screen-reader/version, exact observations and any unsupported combination. An automated shadow-aware query/axe scan is useful but insufficient to establish this contract. Browser, React, accessibility-tree and adoption tests remain learner practice; a lifecycle test double only verifies authored state/resource logic.

References checked 2026-10-21: [HTML custom elements](https://html.spec.whatwg.org/multipage/custom-elements.html), [DOM shadow/event model](https://dom.spec.whatwg.org/), [React custom elements](https://react.dev/reference/react-dom/components#custom-html-elements), [CSS shadow scoping](https://www.w3.org/TR/css-scoping-1/), [ARIA in HTML](https://www.w3.org/TR/html-aria/).
