# Have you heard about Context in React?

# 🌐 React Context API

The **Context API** in React is a **built-in mechanism to share state across the component tree** without having to pass props down manually at every level (avoiding "prop drilling").

---

## 1️⃣ What is React Context?

- **Context** provides a way to **share data globally** for a tree of React components.
- Useful for:
  - Themes (dark/light mode)
  - User authentication info
  - Language/localization
  - Global settings/preferences

---

## 2️⃣ Core Concepts

| Concept | Description |
|---------|------------|
| **React.createContext** | Creates a Context object with `Provider` and `Consumer`. |
| **Provider** | Component that holds the **value** you want to share and wraps children. |
| **Consumer / useContext** | Used to **read the context value** in any descendant component. |

---

## 3️⃣ Basic Example

```tsx
import React, { createContext, useContext, useState } from 'react';

// 1. Create context
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

// 2. Provide context
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Consume context
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return <button onClick={toggleTheme}>Current Theme: {theme}</button>;
}

// 4. Use provider in app
function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  );
}
````

---

## 4️⃣ When to Use Context

* **Global/shared state** that many components need access to.
* **Settings/configuration** like theme, language, or authentication.
* **Avoid overusing** for high-frequency updates (like typing input) because it can trigger **unnecessary re-renders**.

---

## 5️⃣ Advantages

* Built into React; no extra library needed.
* Simple API for **moderate global state**.
* Avoids prop drilling.
* Works well with **functional components and hooks**.

---

## 6️⃣ Limitations / Disadvantages

* **Not ideal for large-scale global state** with complex logic.
* Updates can cause **all consuming components to re-render** even if they only use part of the context.
* Lacks built-in support for **middleware or async actions**, unlike Redux.
* Can become **hard to manage for multiple contexts**.

---

## ✅ Key Takeaways

* Context is great for **moderate shared state**.
* For **complex, frequently updated, or async global state**, a library like **Redux, Zustand, or Recoil** is better.
* Can be combined with local state and centralized stores for **hybrid solutions**.

> 💡 Senior Tip:
> Use Context for **settings, themes, or auth info**, and **Redux/Zustand** for complex shared data with async operations.
