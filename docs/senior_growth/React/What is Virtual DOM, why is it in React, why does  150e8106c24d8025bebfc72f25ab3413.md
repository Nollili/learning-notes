### What is Virtual DOM, why is it in React, why does it improve performance?

## What is the Virtual DOM?

- The **Virtual DOM (VDOM)** is a concept implemented by React and other modern frameworks to optimize UI updates.
- The Virtual DOM is an in-memory representation of the actual DOM (Document Object Model). It’s a lightweight JavaScript object that mimics the structure of a real DOM tree. React uses this to keep track of changes in the UI efficiently.

## Why is the Virtual DOM used in React?

- **Efficient Updates**: The real DOM is slow because updating it requires recalculating styles, layout, and re-rendering elements. React minimizes these operations by using the Virtual DOM as an intermediary. (intermediary: közvetítő)
- **Declarative UI**: React's declarative approach allows developers to specify *what* the UI should look like at any given point. React uses the VDOM to determine the minimum number of changes needed to achieve this.

## How does the Virtual DOM improve performance?

- **Batch Updates**: React batches multiple state changes and calculates updates efficiently, reducing unnecessary DOM manipulations.
- **Reconciliation**: When state or props change:
    
    (reconciliation: összeegyeztetés)
    
    - React creates a new Virtual DOM tree.
    - It compares the new tree with the previous one (using a process called *diffing*).
    - It calculates the minimal set of changes needed to update the real DOM.
- **DOM Manipulation Optimization**: Instead of directly modifying the DOM for every change, React applies changes in batches, reducing the overhead caused by frequent reflows and repaints. (overhead: koltseg)
- **Component Reusability**: React’s component-based architecture, combined with the Virtual DOM, ensures that only the components affected by changes are updated.

### Key Advantages:

- **Improved Performance**: React updates only the parts of the UI that have changed.-
- **Predictable Rendering**: React’s reconciliation process ensures consistent updates.
- **Cross-Browser Consistency**: Abstracting away direct DOM manipulation avoids browser-specific quirks.

##