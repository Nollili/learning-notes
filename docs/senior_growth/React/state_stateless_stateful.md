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

All components are **function components**, but they can be:

* **Stateful:** use hooks (`useState`, `useEffect`, etc.)
* **Stateless:** just a pure function returning JSX

So instead of saying *“class vs functional”*, we now say *“stateful vs stateless”* in terms of whether hooks are used.

---

### 🧩 **Architecture insight (senior-level point)**

> “In a well-structured React app, I like to separate **stateful** ‘container’ components that handle logic from **stateless** ‘presentational’ components that handle UI. This separation improves reusability and makes testing and refactoring easier.”

---

### 🗣️ **Interview-ready 30-second answer**

> “A stateful component manages its own data using state or hooks, while a stateless component just receives data via props and renders UI.
> In modern React, both are function components — the difference is whether they hold state or not.
> I usually separate stateful logic into higher-level components or custom hooks, and keep the presentational ones stateless for clarity and reusability.”

---

Would you like me to give you a **quick diagram or code structure** showing how a stateful parent and stateless child interact (like in a typical React architecture)?

