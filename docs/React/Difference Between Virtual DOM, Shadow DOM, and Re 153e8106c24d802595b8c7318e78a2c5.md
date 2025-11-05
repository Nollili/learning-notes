# Difference Between Virtual DOM, Shadow DOM, and Real DOM

Subjects: React

### **Real DOM**

**Definition**:

The Real DOM (Document Object Model) is the browser's internal representation of the structure of a web page. It represents the HTML document as a tree of nodes.

**Key Characteristics**:

- **Mutable**: Updating the DOM directly modifies the structure and content of the page.
- **Synchronous Updates**: Any DOM update triggers immediate re-rendering and repainting, which can be slow for complex UIs.
- **Event Delegation**: Event listeners are attached to nodes in the tree.

**Example**:
HTML:

```html
<div id="root">
  <p>Hello World!</p>
</div
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

The Virtual DOM is an in-memory lightweight JavaScript representation of the Real DOM. It acts as a **copy** of the Real DOM and is used by libraries like React to improve performance.

**Key Characteristics**:

- **Immutable Representation**: The Virtual DOM is a snapshot of the Real DOM at a specific point in time.
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

- Faster updates by batching changes.
- Reduces costly direct interactions with the Real DOM.
- Simplifies UI logic with a declarative programming model.

---

### **Shadow DOM**

**Definition**:

The Shadow DOM is a browser feature that allows developers to create encapsulated and scoped DOM trees. It is primarily used for creating reusable and self-contained **Web Components**.

**Key Characteristics**:

- **Encapsulation**: The styles and scripts defined in a Shadow DOM are scoped to that component and do not affect the rest of the document.
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

- Avoids style leakage (encapsulation of CSS).
- Ideal for creating reusable components like `<video>` or `<input>` without affecting global styles.
- Native browser support without external libraries.

---

### **Comparison Table**

| Feature | **Real DOM** | **Virtual DOM** | **Shadow DOM** |
| --- | --- | --- | --- |
| **Definition** | The actual DOM tree. | Lightweight in-memory copy of the Real DOM. | Scoped and encapsulated subtree of the Real DOM. |
| **Performance** | Slow for frequent updates. | Fast due to diffing and batching updates. | Same as Real DOM but scoped. |
| **Use Case** | Web pages and basic apps. | Used in frameworks like React for performance optimization. | Creating reusable Web Components. |
| **Encapsulation** | No encapsulation. | No encapsulation. | Full encapsulation (CSS and DOM). |
| **Direct Interaction** | Can directly manipulate nodes. | Cannot interact directly, requires rendering logic. | Can manipulate within its scope. |
| **Styling** | Global scope. | Global scope. | Scoped to the component. |

---

### **When to Use What?**

- **Real DOM**: Suitable for simple, static websites where performance is not critical.
- **Virtual DOM**: Best for dynamic and interactive applications that require frequent updates, such as single-page applications (SPAs).
- **Shadow DOM**: Ideal for creating reusable and encapsulated Web Components without worrying about style leakage.

---

### **Analogy for Understanding**

1. **Real DOM**: Like editing a book directly; each change requires finding the exact page and section, which is slow.
2. **Virtual DOM**: Like editing a draft copy of the book, then highlighting only the changes and updating the final book.
3. **Shadow DOM**: Like a chapter in the book that is self-contained and doesn’t affect other chapters or the overall book format.