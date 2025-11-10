# Are you using any tool to enforce it, is it included in hooks as well?

## 🛠 Tools to Enforce Code Quality & Hooks Integration

### Hooks

In React, **hooks** are special functions that let you use state and other React features in functional components.

- **useState:** The useState hook lets you add local state to functional components in React. It provides a stateful value and a function to update it, preserving the state across re-renders. When you call setState, the component does not update immediately. Instead, React schedules a re-render, and the new state will be available on the next render.
  ```js
  const [count, setCount] = useState(0);
  ```
  `count` is the state variable, and `setCount` updates it.

- **useEffect:** Runs side effects (like data fetching or DOM manipulation) after rendering. Combines lifecycle methods from class components.
  ```js
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]);
  ```
  The `[count]` dependency ensures the effect runs only when `count` changes.

- **useContext:** Shares data globally without passing props manually. React's Context API provides a way to pass data through the component tree without having to manually pass props down at every level. The useContext hook is the idiomatic way to consume context values in functional components.

✅ What useContext Does  
The useContext hook allows a component to read the current value of a context. It takes a context object (the one returned from React.createContext) as an argument and returns the current context value.
  ```js
  const value = useContext(MyContext);
  ```

- **useReducer:** Represents the possibility to deal with complex state management inside the component. Typically, should be avoided in favor of useState. One of the core benefits is the ability to run multiple setters during one rendering cycle.

MUST NOT be confused with Redux and other approaches created for a state management. Should be used only for updates on a component level.
  ```js
  const [state, dispatch] = useReducer(reducer, initialState);
  ```

- **useRef:** Creates a mutable object that persists across renders, often used to access DOM elements. 

There are two common use cases for useRef:

- Accessing a DOM element directly
- Storing mutable values that don’t require triggering a component update

  ```js
  const inputRef = useRef();
  ```

- **useCallback, useMemo:**  
Both represent a possibility to create memoized values of some internally used values (useMemo) and callbacks (useCallback).

useCallback could be implemented via useMemo, so it’s basically a shortcut. In most cases used for passing callbacks as props to underlying components in order to prevent them from unnecessary re-rendering all the time.

useMemo is typically used to avoid unnecessary re-calculations on render phase.

- **Custom Hooks:** Combine built-in hooks to create reusable logic across components.
#### Custom Hooks

Custom hooks are one of the most powerful concepts in React, enabling developers to separate and reuse logic efficiently. They are simply JavaScript functions, but when they use React’s built-in hooks like `useState`, `useEffect`, or `useContext`, they unlock the ability to encapsulate complex behaviors in an easily reusable and shareable way.

> **Rule:**  
> Custom hooks must be called exclusively inside React components or other hooks. This ensures React's hook rules are followed.

**Benefits of Custom Hooks:**

- **Cleaner Code:** Move logic out of components to keep them focused and tidy.
- **Abstraction:** Hide complex logic behind a simple and reusable interface.
- **Reusability:** Share logic across multiple components without duplicating code.
- **Consistency:** Standardize coding practices for state management, API calls, or side effects.
- **Enhanced Development:** Encourages modular and fun coding practices.

### Key Points

- **Custom hooks must follow React's rules of hooks:**
  - Only call hooks at the top level.
  - Only call hooks from React functions (components or other hooks).
  - Hook names always start with `use`.
- They allow developers to encapsulate any logic, making applications more modular and maintainable.
- With custom hooks, you can significantly enhance your development process, making code cleaner, reusable, and more efficient.

In modern JavaScript/TypeScript projects, enforcing code quality is **automated using various tools**, often integrated with **pre-commit hooks, CI/CD pipelines, and IDEs**. This ensures code quality is maintained **before code reaches the repository**.

---

## 1️⃣ Common Tools

| Tool                  | Purpose                                   | Notes                                                        |
|-----------------------|-------------------------------------------|--------------------------------------------------------------|
| **ESLint**            | Linting for JavaScript/TypeScript         | Finds errors, enforces style, supports custom rules           |
| **Prettier**          | Code formatting                           | Ensures consistent style, works with ESLint                   |
| **Stylelint**         | Linting for CSS/SCSS/styled-components    | Enforces UI style consistency                                 |
| **Husky**             | Git hooks management                      | Runs scripts on `pre-commit`, `pre-push`, etc.                |
| **lint-staged**       | Lint staged files only                    | Improves hook speed, checks only changed files                |
| **SonarQube/SonarCloud** | Static analysis, code smells, security | Typically runs in CI/CD pipelines                             |
| **Jest/Vitest**       | Unit testing and coverage                 | Can block commits if tests fail                               |

---

## 2️⃣ Integration with Hooks

**Pre-commit hooks** ensure code meets quality standards **before it is committed**:

**Example with Husky + lint-staged:**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.tsx": ["eslint --fix", "prettier --write"]
  }
}
```

* **Behavior:**
  * When committing code, `lint-staged` runs ESLint and Prettier **only on staged files**.
  * Failing linting prevents the commit.

**Optional:** Pre-push hooks can also run:

- Unit tests
- Type checking (`tsc --noEmit`)
- Security scans

---

## 3️⃣ CI/CD Enforcement

Even with hooks, **CI/CD pipelines** provide a **secondary enforcement layer**:

- Runs full linting, formatting, unit tests, coverage, and security checks
- Prevents merging code that passes local hooks but fails global rules
- Common platforms: GitHub Actions, GitLab CI/CD, Jenkins, CircleCI

---

## 4️⃣ Benefits of Hook + Tool Integration

1. **Immediate feedback:** Developers fix issues before committing.
2. **Consistency across the team:** All developers follow the same rules automatically.
3. **Reduced technical debt:** Enforces standards from day one.
4. **Improved code review efficiency:** Code arrives cleaner for review.

---

### ✅ Key Takeaways

- Tools like **ESLint, Prettier, Stylelint, Jest, SonarQube** are essential for code quality.
- **Hooks (pre-commit, pre-push)** enforce standards **locally before code leaves the developer’s machine**.
- Combined with **CI/CD pipelines**, this ensures **high-quality, consistent, and maintainable code** across the team.

> 💡 Senior Tip:  
> Always use **hooks for developer productivity** and **CI/CD for enforcement at the team level**. Local hooks catch issues early, CI ensures nothing slips through.

