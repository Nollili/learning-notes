### What is Virtual DOM, why is it in React, why does it improve performance?

## What is the Virtual DOM?

- The **Virtual DOM (VDOM)** is a concept implemented by React and other modern frameworks to optimize UI updates.
- The Virtual DOM is an in-memory representation of the actual DOM (Document Object Model). It’s a lightweight JavaScript object that mimics the structure of a real DOM tree. React uses this to keep track of changes in the UI efficiently.

## Why is the Virtual DOM used in React?

- **Efficient Updates**: DOM work has operation-dependent costs. A write can invalidate style/layout, which the browser may defer; it does not necessarily force immediate layout or paint. React adds bookkeeping to express updates declaratively. (intermediary: közvetítő)
- **Declarative UI**: React's declarative approach allows developers to specify *what* the UI should look like at any given point. React uses the VDOM to determine host changes using reconciliation heuristics to achieve this.

## How does the Virtual DOM improve performance?

- **Batch Updates**: React batches multiple state changes and calculates updates efficiently, reducing unnecessary DOM manipulations.
- **Reconciliation**: When state or props change:
    
    (reconciliation: összeegyeztetés)
    
    - React creates a new Virtual DOM tree.
    - It compares the new tree with the previous one (using a process called *diffing*).
    - It determines host updates without guaranteeing the globally minimal edit set.
- **DOM Manipulation Optimization**: Instead of directly modifying the DOM for every change, React applies changes in batches, reducing the overhead caused by frequent reflows and repaints. (overhead: koltseg)
- **Component Reusability**: An ancestor render can call children even with unchanged props; rendering does not necessarily commit a DOM change. Memoization and subscription design can skip some work.

### Key Advantages:

- **Improved Performance**: React updates only the parts of the UI that have changed.-
- **Predictable Rendering**: React’s reconciliation process ensures consistent updates.
- **Consistent authoring model**: React abstracts host updates, while browser API/CSS/accessibility differences still require testing.

## Performance reasoning and exercise

React elements describe desired UI; Fiber stores reconciliation work/state. Neither is a second browser rendering engine or a pixel screenshot. Declarative ownership is the main reason to choose React; a small hand-written DOM update can be faster, while manual coordination becomes more complex as state and interactions grow. Compare complete user interactions under the same data and production build rather than claiming “VDOM is always faster.”

A read such as getBoundingClientRect after a style-changing write may force pending layout. Batching React state does not automatically remove that browser cost, nor does a portal isolate CSS. DOM snapshots serialize structure; screenshot tests inspect rendered pixels and have different limitations.

**Exercise:** profile a list update with stable keys and an equivalent direct DOM update. Acceptance: separate JavaScript/render/commit/layout/paint timings, record workload/device/build, and verify the same resulting behavior and focus. Explain one render that produces no DOM mutation. The goal is evidence-based design, not selecting a universal winner.

Continue with [render scheduling and snapshots](./Change_Detection_in_React.md). Official reference: [React render and commit](https://react.dev/learn/render-and-commit). React19 baseline; checked2026-10-20.
