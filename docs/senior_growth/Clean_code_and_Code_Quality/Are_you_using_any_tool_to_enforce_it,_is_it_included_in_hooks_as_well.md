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

- **useReducer:** Groups related transitions into a pure reducer when named actions/invariants are clearer than separate setters. It is not generally discouraged. State still belongs to the component invoking the hook, and a provider can share that state/dispatch through Context. It does not supply Redux's store/selectors/middleware automatically. See the [scoped reducer lesson](../React/What_Are_React_Hooks_Good_For_Rules_of_Hooks.md#refs-pure-reducers-scoped-context-and-custom-hooks).
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

In modern JavaScript/TypeScript projects, enforcing code quality is **automated using various tools**, often integrated with **pre-commit hooks, CI/CD pipelines, and IDEs**. These tools provide feedback on configured checks; they cannot establish overall correctness. React hooks above and Git lifecycle hooks below are different concepts.

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

**Pre-commit hooks** run local feedback checks before a normal commit; they can be bypassed:

**Current Husky setup in an independent practice repository:** install a compatible pinned Husky release as a dev dependency, then run npx husky init. Review the generated prepare script and .husky/pre-commit. Keep existing lifecycle scripts when integrating; do not overwrite a submission template. The old package.json husky.hooks object is a legacy configuration and is not the current setup.

```sh
# .husky/pre-commit — after the installed Husky version initializes its hook runner
npm run lint
```

A lint-staged alternative installs/configures that tool explicitly and invokes its local binary from the hook; commands receive staged filenames. Avoid hand-built shell filename splitting. Fixers can change partially staged working files, so test the selected tool's staging behavior. This primary example uses the full small lint target, not a pretend staged-only command.

* **Behavior:**
  * When committing code, The hook above runs the configured full lint target; lint-staged is a separately configured alternative.
  * Failing linting prevents the commit.

**Optional:** Pre-push hooks can also run:

- Unit tests
- Type checking (`tsc --noEmit`)
- Security scans

---

## 3️⃣ CI/CD Enforcement

Even with hooks, **CI/CD pipelines** rerun checks independently of local hooks:

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
- Combined with required CI checks, this improves feedback and enforces the selected rules; review and behavior testing remain necessary.

> 💡 Senior Tip:  
> Always use **hooks for developer productivity** and **CI/CD for enforcement at the team level**. Local hooks catch issues early, protected CI checks enforce configured gates; untested behavior and misconfiguration can still slip through.



## Verify enforcement without touching the submission template

Use the [minimal lint/type/test/build lab](./What_is_code_standard_What_code_standard_is_on_your_current_project_Should_we_always_work_by_code_standard_Have_you_used_linters_and_do_you_have_any_experience_in_configuring_them.md#minimal-executable-standard). Test a passing source, an ESLint violation and a type error; the gate must stop with a nonzero exit. A hook is developer convenience, not a security boundary: HUSKY=0 or Git options can bypass it. Required CI/status checks and repository policy are separate administrative configuration, not implemented by this document. No push is part of this exercise; only the user may push.

**Acceptance:** explain React versus Git hooks, reducer/Context ownership, initialized .husky files and bypass behavior. In an isolated Git practice checkout, install the pinned compatible hook release, inspect the generated runner and demonstrate both an allowed and blocked local commit without changing src/tests. Hook installation/commit behavior itself remains learner practice here; the gate commands are checked separately.

References checked2026-10-24: [Husky current initialization](https://typicode.github.io/husky/get-started.html), [React useReducer](https://react.dev/reference/react/useReducer), [React reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context).
