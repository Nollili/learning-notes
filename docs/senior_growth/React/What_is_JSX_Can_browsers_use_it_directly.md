### What is JSX? Can browsers use it directly?

### **What is JSX?**

JSX (**JavaScript XML**) is a syntax extension for JavaScript used in React. It allows developers to write HTML-like syntax directly within JavaScript code, making it easier to define the structure of the UI components.

**Key Features of JSX**:

1. **HTML-Like Syntax in JavaScript**:
JSX resembles HTML but is written within JavaScript files, allowing you to define components more intuitively.
    
    ```jsx
    const element = <h1>Hello, world!</h1>;
    ```
    
2. **Compiles to JavaScript**:
JSX is not valid JavaScript; it must be transpiled (converted) into standard JavaScript code using tools like **Babel**.

---

### **How JSX Works**

When you write JSX, it gets transformed into standard JavaScript function calls (e.g., `React.createElement`) during the build process.

For example:

```jsx
const element = <h1>Hello, world!</h1>;
```

Compiles to:

```jsx
const element = React.createElement('h1', null, 'Hello, world!');
```

The `React.createElement` function:

- Creates a React element object representing the DOM structure.
- Specifies the tag (`'h1'`), attributes (`null` in this case), and children (`'Hello, world!'`).

---

### **Can Browsers Use JSX Directly?**

No, browsers cannot directly interpret JSX. JSX is not part of the JavaScript specification; it's a syntax extension created for React. Before running in a browser, JSX code must be transpiled into plain JavaScript.

---

### **How to Use JSX in Browsers**

To use JSX, you typically:

1. Install a build tool like **Webpack** or **Vite**.
2. Configure a transpiler like **Babel** to transform JSX into JavaScript.

**Example Babel Configuration**:

```json
{
  "presets": ["@babel/preset-react"]
}
```

The transformed output still needs the correct runtime dependency, module loading/bundling and supported JavaScript APIs.

---

### **Advantages of JSX**

1. **Declarative UI Definition**: Combines markup and logic for better readability and maintainability.
2. **Familiar Syntax**: Resembles HTML, making it easier for developers familiar with web development to adopt.
3. **Full Power of JavaScript**: Enables embedding JavaScript expressions within the UI using curly braces `{}`.
    
    ```jsx
    const name = "John";
    const element = <h1>Hello, {name}!</h1>;
    ```
    

---

### **Disadvantages of JSX**

1. **Transpilation Required**: Adds a build step and tooling complexity.
2. **Learning Curve**: Developers new to React or unfamiliar with JavaScript may initially find JSX syntax challenging.

---

### **Conclusion**

JSX is a powerful feature of React that simplifies UI development by allowing you to write HTML-like syntax in JavaScript. However, because browsers cannot natively interpret JSX, it must be transpiled into plain JavaScript before being executed. Tools like Babel and Webpack handle this process, enabling JSX to work seamlessly in modern development workflows.
## Primary automatic runtime and resolution debugging

The createElement example above shows the classic transform concept. React19 expects the modern JSX transform for its supported new-code path. For these examples use TypeScript5.9.3, React19.3.0/types19, jsx=react-jsx and a matching ESM bundler or NodeNext lab. A Babel-based alternative uses its React preset with runtime=automatic; do not configure two independent JSX passes accidentally.

```tsx
// greeting.tsx
export type GreetingProps = Readonly<{ name: string }>;
export function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}
```

With target ES2022, module ESNext and jsx react-jsx, the generated module imports a helper from react/jsx-runtime and calls it to construct an element. Multiple children may use jsxs; development mode uses jsxDEV from react/jsx-dev-runtime and adds development metadata. Neither output creates browser DOM by itself; React DOM renders/commits elements later. Inspect actual output rather than depend on helper alias spelling.

| Symptom | Investigate at the right boundary |
|---|---|
| Unexpected token `<` | JSX transform absent or JSX left preserved in a file sent as ordinary JavaScript; inspect response Content-Type and actual source |
| React is not defined | Classic transform emitted a React reference without its import/binding; align runtime/config rather than add random globals |
| Cannot resolve react/jsx-runtime | React dependency/export resolution or bundler conditions/version mismatch; inspect resolved package/lockfile |
| Browser rejects bare react/jsx-runtime import | Module output was not bundled or mapped for that browser; TS path aliases alone do not install browser import maps |
| Type errors invisible during dev server | Fast transformation is not a full typecheck; run tsc --noEmit separately |
| Works in dev, fails in published build | Compare production transformation, base paths, chunks, source maps and dependency resolution using the deployed-equivalent artifact |

Keep .tsx extensions and React type declarations aligned with the checker configuration. A component library should publish the intended module formats/declarations and peer dependency contract; packaging one React copy per component can create invalid-hook/context identity problems. Avoid “fixing” resolution by disabling checks without finding which file/package is actually loaded.


Official references checked2026-10-22: [TypeScript JSX output modes](https://www.typescriptlang.org/tsconfig/jsx.html), [module output/resolution](https://www.typescriptlang.org/tsconfig/module.html), [React19 modern transform](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#new-jsx-transform-is-now-required).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/What_is_JSX_Can_browsers_use_it_directly.md). All learner practice remains outstanding; the worked examples above are explanatory material.
