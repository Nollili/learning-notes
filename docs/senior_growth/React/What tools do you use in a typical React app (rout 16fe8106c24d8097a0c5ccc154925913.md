### What tools do you use in a typical React app (routing, render, etc)?

In a typical React application, various tools and libraries are used to handle essential functionalities like routing, rendering, state management, form handling, and testing. Here's a breakdown of commonly used tools and libraries:

---

### **Core Libraries and Frameworks**

1. **React**:
    - Provides the base for building components and managing the UI.
    - **Key Tools**: React itself (`react`) and ReactDOM (`react-dom`).
2. **React Frameworks**:
    - **Next.js**: For server-side rendering (SSR), static site generation (SSG), and API integration.
    - **Create React App (CRA)**: A boilerplate for quick React setups (although it’s becoming less common with alternatives like Vite).

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
    - **Recoil**: Designed for React for managing global state with a focus on scalability.
    - **Jotai**: An atomic state management library for React.

---

### **Forms and Validation**

- **Formik**: Simplifies handling forms and validations.
- **React Hook Form**: Lightweight and efficient, leveraging React’s refs for minimal re-renders.
- **Yup**: Often paired with Formik or React Hook Form for schema-based validation.

Example using React Hook Form:

```jsx
import { useForm } from 'react-hook-form';

const Form = () => {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      <button type="submit">Submit</button>
    </form>
  );
};
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

- **React.memo**: Prevents unnecessary re-renders of functional components.
- **useMemo** and **useCallback**: Optimize expensive computations or functions.
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
    - **Cypress**: For testing user flows in a browser-like environment.
    - **Playwright**: A powerful alternative for E2E testing.

---

### **API Handling**

1. **Axios**: For making HTTP requests.
2. **React Query**: A powerful library for managing server state, caching, and synchronizing API calls.
3. **SWR**: Lightweight library for data fetching with built-in caching and revalidation.

Example with React Query:

```jsx
import { useQuery } from 'react-query';

const fetchData = async () => {
  const res = await fetch('/api/data');
  return res.json();
};

const Component = () => {
  const { data, isLoading } = useQuery('dataKey', fetchData);

  if (isLoading) return <p>Loading...</p>;
  return <p>{data.title}</p>;
};
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

- **PropTypes**: For runtime type-checking of props in components.
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