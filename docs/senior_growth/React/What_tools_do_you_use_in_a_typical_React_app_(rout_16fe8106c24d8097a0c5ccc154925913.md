### What tools do you use in a typical React app (routing, render, etc)?

In a typical React application, various tools and libraries are used to handle essential functionalities like routing, rendering, state management, form handling, and testing. Here's a breakdown of commonly used tools and libraries:

---

### **Core Libraries and Frameworks**

1. **React**:
    - Provides the base for building components and managing the UI.
    - **Key Tools**: React itself (`react`) and ReactDOM (`react-dom`).
2. **React Frameworks**:
    - **Next.js**: For server-side rendering (SSR), static site generation (SSG), and API integration.
    - **Create React App (CRA)**: Officially deprecated for new apps on2025-02-14; legacy migration context.

---

### **Routing**

- **React Router**: The most popular library for routing in React apps.
    - Provides tools for declarative routing (`<Routes>`, `<Route>`, etc.).
    - Handles nested routes, dynamic routes, and URL parameters.
    - Example:
        
        ```jsx
        import { BrowserRouter, Routes, Route } from 'react-router-dom';
        
        const App = () => (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </BrowserRouter>
        );
        ```
        

---

### **State Management**

1. **React’s Built-in Tools**:
    - **useState**: For local state in functional components.
    - **useReducer**: For more complex local state logic.
    - **Context API**: For lightweight global state sharing.
2. **External Libraries**:
    - **Redux**: Popular for centralized state management, often used with `@reduxjs/toolkit` for simplicity.
    - **Zustand**: A minimalist state management library.
    - **Recoil**: Historical/archived project; evaluate maintenance before using an existing installation, and choose an active alternative for new work.
    - **Jotai**: An atomic state management library for React.

---

### **Forms and Validation**

- **Formik**: Simplifies handling forms and validations.
- **React Hook Form**: Lightweight and efficient, leveraging React’s refs for minimal re-renders.
- **Yup**: Often paired with Formik or React Hook Form for schema-based validation.

Example using React Hook Form:

```jsx
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form'; // v7 baseline

export function NameForm() {
  const id = useId();
  const [status, setStatus] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ defaultValues: { name: '' } });
  async function onSubmit(data) {
    setStatus('');
    try {
      const response = await fetch('/api/profile/name', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name.trim() }), signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) { await response.body?.cancel(); throw new Error('Name could not be saved'); }
      setStatus('Name saved'); // Endpoint contract: success status confirms committed write.
    } catch {
      setError('root.server', { message: 'Unable to save. Check the result before retrying.' });
    }
  }
  return <form noValidate onSubmit={handleSubmit(onSubmit)}>
    <label htmlFor={id}>Name</label>
    <input id={id} autoComplete="name" aria-invalid={!!errors.name}
      aria-describedby={errors.name ? `${id}-error` : undefined}
      {...register('name', { required: 'Enter a name', maxLength: { value: 80, message: 'Use at most80characters' },
        validate: value => value.trim().length > 0 || 'Enter a name' })} />
    {errors.name && <p id={`${id}-error`} role="alert">{errors.name.message}</p>}
    {errors.root?.server && <p role="alert">{errors.root.server.message}</p>}
    <button disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving…' : 'Save name'}</button>
    <p role="status">{status}</p>
  </form>;
}
```

---

### **Styling**

1. **CSS-in-JS Libraries**:
    - **Styled Components**: Write component-scoped styles using tagged template literals.
    - **Emotion**: Similar to Styled Components, but with more flexibility.
2. **CSS Frameworks**:
    - **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
    - **Bootstrap**: Traditional framework with pre-built components.
3. **SCSS/LESS**: For more traditional preprocessors.

---

### **Performance Optimization**

- **React.memo**: May skip unchanged parent-driven props; own state/context can still render.
- **useMemo** caches a calculation/value and **useCallback** caches a function identity; dependencies/cost and the consuming boundary determine benefit.
- **React Profiler**: Analyze and improve render performance.
- **Code Splitting**:
    - Achieved using **React.lazy** and **Suspense** for dynamically loading components.
    - Example:
        
        ```jsx
        const LazyComponent = React.lazy(() => import('./LazyComponent'));
        
        const App = () => (
          <React.Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
          </React.Suspense>
        );
        ```
        

---

### **Testing**

1. **Unit and Integration Testing**:
    - **Jest**: For writing test cases.
    - **React Testing Library**: For testing React components in a DOM-like environment.
2. **End-to-End (E2E) Testing**:
    - **Cypress**: Browser-based user-flow tests; distinguish its test isolation/runtime from unit DOM emulation.
    - **Playwright**: A powerful alternative for E2E testing.

---

### **API Handling**

1. **Axios**: For making HTTP requests.
2. **React Query**: A powerful library for managing server state, caching, and synchronizing API calls.
3. **SWR**: Lightweight library for data fetching with built-in caching and revalidation.

Example with React Query:

```jsx
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'; // v5

// Client-only SPA singleton. SSR must scope query clients per request to prevent data leakage.
const queryClient = new QueryClient();
export function parseCourses(value) {
  if (!Array.isArray(value) || !value.every(row => row && typeof row === 'object' &&
    typeof row.id === 'string' && typeof row.title === 'string')) throw new Error('Invalid course response');
  return value.map(({ id, title }) => ({ id, title }));
}
export async function fetchCourses({ signal }) {
  const response = await fetch('/api/courses', {
    signal: AbortSignal.any([signal, AbortSignal.timeout(5000)])
  });
  if (!response.ok) { await response.body?.cancel(); throw new Error('Courses unavailable'); }
  return parseCourses(await response.json());
}
function Courses() {
  const query = useQuery({ queryKey: ['courses', 'public'], queryFn: fetchCourses,
    staleTime: 30_000, gcTime: 5 * 60_000, retry: false });
  if (!query.data && query.fetchStatus === 'paused') return <p role="status">Offline; waiting to load courses.</p>;
  if (!query.data && query.isPending) return <p role="status">Loading courses…</p>;
  if (!query.data && query.isError) return <section><h2>Courses could not load</h2>
    <button type="button" onClick={() => query.refetch()}>Retry</button></section>;
  const courses = query.data ?? [];
  return <section aria-label="Courses">
    {query.isFetching && <p role="status">Refreshing courses…</p>}
    {query.fetchStatus === 'paused' && <p role="status">Offline; showing saved data.</p>}
    {query.isError && <p role="alert">Refresh failed; showing the last loaded data.</p>}
    {courses.length === 0 ? <p>No courses found.</p> : <ul>{courses.map(course => <li key={course.id}>{course.title}</li>)}</ul>}
  </section>;
}
export function CoursesApp() {
  return <QueryClientProvider client={queryClient}><Courses /></QueryClientProvider>;
}
```

---

### **Build Tools**

1. **Webpack**: Traditional bundler used with older setups like CRA.
2. **Vite**: Modern, fast build tool for React applications.
3. **Parcel**: Zero-config bundler.

---

### **Error Tracking and Monitoring**

- **Sentry**: For logging and monitoring errors in production.
- **LogRocket**: Monitors user sessions alongside errors.

---

### **Other Utilities**

- **PropTypes**: Legacy runtime prop checks; React19 removed automatic propTypes checks. Use TypeScript for static contracts and explicit runtime validation at external boundaries.
- **React DevTools**: Browser extension for inspecting React components and hooks.
- **ESLint + Prettier**: For maintaining consistent code quality and formatting.

---

### **Typical Tech Stack for a React Project**

- **Routing**: React Router.
- **State Management**: Context API, Redux, or Zustand.
- **Styling**: Tailwind CSS or Styled Components.
- **Forms**: React Hook Form.
- **API**: Axios or React Query.
- **Build**: Vite or Next.js.
- **Testing**: Jest + React Testing Library.
## One coherent stack and user-flow acceptance

Primary client lab: React19+TypeScript+Vite, CSS Modules, native fetch, TanStack Query5 for remote state, React Hook Form7 for complex form state, and React Router7.18.4 when client routing is required. Next16 App Router is the primary integrated full-stack branch. Local state/reducer/context come first for UI state; Zustand/Redux Toolkit are alternatives when a shared client store is justified. Formik uses controlled state; RHF often registers uncontrolled native inputs and Controller integrates controlled widgets. Neither eliminates server validation or accessibility work. Broader cross-field/draft/optimistic workflows continue in the dedicated form/state lessons.

The form endpoint is an exercise contract, not an implemented API. It must validate/authorize/commit on the server and define duplicate-write semantics. A timeout after a committed mutation is an ambiguous result; preserve the draft and verify/refetch rather than assuming no write occurred. isSubmitting disables routine repeated clicks but is not server idempotency. AbortSignal timeout/any require a declared browser support policy; mount/route cancellation must also be owned in a full application. Never log private form data as a substitute for save behavior.

The query example deliberately disables automatic retry to make failure handling explicit. staleTime is freshness; gcTime applies to inactive-cache retention, not a guarantee to cap active data bytes. Browser online state does not prove the API is reachable. Query keys must contain every data-affecting filter/scope; private user data must be segregated and cleared appropriately on logout. A304/cache hit, stale cached data, empty success and unavailable data are different states. Add byte/item bounds at the real API boundary. Avoid copying query data into a second global store without a concrete synchronization requirement.

**Exercise acceptance:** implement the form and course API contract; test invalid/whitespace input, delayed/failing/committed-but-response-lost save, initial/empty/error/retry/stale/offline query states and logout cache separation. Verify labels, field errors/focus, status announcements, keyboard controls and preserved last data; no data.title dereference before a successful shape check. Run actual library typechecks and user-interaction tests in the separate app. Syntax/helper tests in this notes project do not execute React, RHF or Query.

Official references checked2026-10-21: [TanStack Query5 overview](https://tanstack.com/query/latest/docs/framework/react/overview), [important defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults), [RHF source/API contract](https://github.com/react-hook-form/react-hook-form/blob/master/src/types/form.ts), [RHF registration documentation](https://react-hook-form.com/docs/useform/register), [React19 migration](https://react.dev/blog/2024/04/25/react-19-upgrade-guide), [Recoil archive](https://github.com/facebookexperimental/Recoil). RHF documentation page returned403 during verification; primary repository types/README were used as fallback. No learner practice is marked complete.
