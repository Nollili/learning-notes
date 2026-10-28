# State

The typical rules of dividing components into stateful/stateless are the following:

| **Stateful Components**         | **Stateless Components**                |
|---------------------------------|-----------------------------------------|
| Knows how everything works      | Knows how to display received data      |
| Containers for other components | Receive and operate only with props     |
| Provide application data        |                                         |
| Perform data fetching           |                                         |

---

## State vs Props

In React, a component should never change its own props directly. A parent component should change them. State, on the other hand, is the opposite of props: a component keeps track of its own state and can change it at any time.

|                              | **Props** | **State** |
|------------------------------|:---------:|:---------:|
| Can get initial value from parent component? | Yes | Yes |
| Can be changed by parent component?          | Yes | No  |
| Can set default values inside component?     | Yes | Yes |
| Can change inside component?                 | No  | Yes |
| Can set initial value for child components?  | Yes | Yes |

---

## Benefits of State

- Application becomes more understandable
- Reduces complexity
- Stateless components become reusable
- Enables creation of many simple components

Excellent — this is another **fundamental React interview topic**, and how you explain it really shows your *depth of understanding* and whether you think in terms of **component architecture and data flow**.

Let’s break it down the way a **senior developer** would explain it 👇

---

## 🧠 **Core idea**

In React, components can be **stateful** or **stateless**, depending on whether they **hold and manage internal state**.

---

### 🔹 **Stateless (or “Presentational”) Component**

* **Has no internal state.**
* Receives all data via **props**.
* Used for **UI rendering** only — doesn’t manage data or side effects.
* Often written as **pure functions**.

**Example:**

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

✅ **Use when:**
You just need to display data passed in from a parent (e.g., buttons, labels, UI cards).

---

### 🔸 **Stateful (or “Container”) Component**

* **Manages its own state** using `useState`, `useReducer`, or other hooks.
* Can have **logic**, **side effects**, and **event handlers**.
* Passes data down to stateless components as props.

**Example:**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

✅ **Use when:**
The component needs to track or update data internally (like open/closed state, input values, etc.).

---

### ⚙️ **In modern React**

Function and class components are both supported; new code commonly uses functions. Either can own state:

* **Stateful:** owns render state through useState/useReducer or class state.
* **Without local render state:** may still use context, refs or Effects; purity and state ownership are different dimensions.

Hook usage alone does not define statefulness: useRef does not schedule renders and an Effect synchronizes externally. State ownership, rendering and side effects must be considered separately.

---

### 🧩 **Architecture insight (senior-level point)**

> “In a well-structured React app, I like to separate **stateful** ‘container’ components that handle logic from **stateless** ‘presentational’ components that handle UI. This separation improves reusability and makes testing and refactoring easier.”

---

### 🗣️ **Interview-ready 30-second answer**

> “A stateful component manages its own data using state or hooks, while a stateless component just receives data via props and renders UI.
> Functions and classes are both supported; the ownership distinction is whether they manage render state.
> I usually separate stateful logic into higher-level components or custom hooks, and keep the presentational ones stateless for clarity and reusability.”

---


## State ownership and reset decisions

A presentational component can have local interaction state (open disclosure, hovered item) without becoming a business-data container. Container/presenter is an optional separation by responsibility, not a rule requiring every component to be in one fixed category. Put state at the nearest common owner that needs to coordinate it; keep server cache, URL/shareable state and transient UI state under distinct owners.

Props are immutable inputs for one render. A parent changes the value it passes in a later render; the child does not mutate a received object. State setters request another snapshot rather than changing the currently executing closure. useState(initialProp) initializes on mount; it does not resynchronize when initialProp later changes.

```jsx
function ContactEditor({ contact }) {
  const [draft, setDraft] = useState(contact.name);
  return <label>Name <input value={draft} onChange={event => setDraft(event.target.value)} /></label>;
}
// Parent deliberately resets this local draft when entity identity changes:
// <ContactEditor key={contact.id} contact={contact} />
```

Resetting by key also loses focus and every subtree state, so lift/save drafts when users must switch away and return. A controlled editor instead receives draft/onChange from an owner and can preserve per-entity drafts explicitly. Derived values such as filtered results usually should not be copied into another state variable with an Effect, which creates extra synchronization and possible stale frames.


Official references: [choosing state structure](https://react.dev/learn/choosing-the-state-structure), [sharing state](https://react.dev/learn/sharing-state-between-components), [preserving/resetting state](https://react.dev/learn/preserving-and-resetting-state). React19 baseline; checked2026-10-20.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/state_stateless_stateful.md). All learner practice remains outstanding; the worked examples above are explanatory material.
