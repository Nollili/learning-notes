# Routing in React

## What is React Router?

React Router is a library designed to manage navigation in Single Page Applications (SPAs). It allows users to change the browser's URL and navigate through different views within the application without refreshing the page. Declarative client navigation can avoid a full document reload, while loaders/API calls may still make server requests. Data and framework modes add data loading, actions and rendering integrations; React Router as a whole is not exclusively client-rendered.

**Core components of React Router:**

- **BrowserRouter:** Manages the routing history and URL changes.
- **Routes and Route:** Define which component should be rendered for a specific path.
- **Link:** A React component that renders as an anchor tag (`<a>`) to allow navigation without reloading the page.

---

Version baseline for the preserved component-routing examples: React Router7.18.4 compatibility exports from react-router-dom, React19. Current docs also show8.5.0; that major is an upgrade alternative, not assumed API compatibility. Full-stack framework labs use Next; this is the client-router branch of the study stack. Checked2026-10-21.

## Installing React Router

Install React Router by running:

```bash
npm install react-router-dom@7.18.4
```

For an explicitly historical v6 project:

```bash
npm install react-router-dom@6.30.6 # Historical v6 compatibility lab, not an additional requirement
```

---

## Setting Up React Router

Wrap your entire app in the `BrowserRouter` component, typically in your entry point (`src/index.js`):

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
);
```

---

## Creating Basic Routes

Define routes in your app using the `Routes` and `Route` components:

```jsx
import { Routes, Route } from "react-router-dom";
import Movies from "./components/Movies";
import MovieForm from "./components/MovieForm";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Movies />} />
            <Route path="/add" element={<MovieForm />} />
        </Routes>
    );
}

export default App;
```

- Navigating to `/` renders the `Movies` component.
- Navigating to `/add` renders the `MovieForm` component.

**Important Points:**

- **Routes:** Wraps all `Route` components, selecting a matching route branch, which can render parent layouts and nested children.
- **Route:** Maps a URL path to a component.
- **element:** Specifies which component to render when the path is matched.

---

## Dynamic Routing

Dynamic routes capture parts of the URL and use them in your components:

```jsx
<Route path="/movies/:movieId" element={<Movie />} />
```

**Optional Parameters and Redirects:**

```jsx
<Route path="/movies/:movieId?" element={<Movies />} />
```

Redirect users programmatically or for invalid routes using `Navigate`:

```jsx
import { Navigate } from "react-router-dom";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Movies />} />
            <Route path="/add" element={<MovieForm />} />
            {/* Redirect all unknown routes to movies page */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}
```

---

## Declarative Navigation with Link

The `Link` component creates navigational links without reloading the page:

```jsx
import { Link } from "react-router-dom";

function Navigation() {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
                <li>
                    <Link to="/contact">Contact</Link>
                </li>
            </ul>
        </nav>
    );
}
```

---

## React Router Hooks

React Router provides several hooks for interacting with route data, URL parameters, and navigation.

**Key Hooks:**

- `useParams`: Access route parameters from dynamic segments of the URL.
- `useNavigate`: Navigate programmatically to different routes.
- `useLocation`: Access information about the current location (URL).
- `useRoutes`: Define routes declaratively using JavaScript objects.
- `useSearchParams`: Manage query parameters within the URL.
- `useResolvedPath`: Resolve relative paths against the current location.

---

### useParams Hook

Access dynamic parameters of the current route:

```jsx
import { useParams } from "react-router-dom";

function Movie() {
    const { movieId } = useParams(); // Access the movieId from the URL

    return <h2>Movie ID: {movieId}</h2>;
}
```

For multiple parameters:

```jsx
<Route path="/users/:userId/movies/:movieId" element={<Movie />} />

import { useParams } from "react-router-dom";

function Movie() {
    const { userId, movieId } = useParams();

    return (
        <div>
            <h2>User ID: {userId}</h2>
            <h3>Movie ID: {movieId}</h3>
        </div>
    );
}
```

---

### useNavigate Hook

Navigate programmatically between routes:

```jsx
import { useNavigate } from "react-router-dom";

function LoginForm() {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/dashboard");
    };

    return <button onClick={handleLogin}>Login</button>;
}
```

With options:

```jsx
navigate("/dashboard", { replace: true, state: { from: "login" } });
```

Navigate using history:

```jsx
navigate(-1); // Go back
navigate(1);  // Go forward
```

---

### useLocation Hook

Returns the location object representing the current URL:

```jsx
import { useLocation } from "react-router-dom";

function ShowLocation() {
    const location = useLocation();

    return (
        <div>
            <h2>Current Pathname: {location.pathname}</h2>
            <p>Query String: {location.search}</p>
            <p>Hash: {location.hash}</p>
        </div>
    );
}
```

**Using useLocation for Side Effects:**

```jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return null;
}
```

---

### Other React Router Hooks

#### useRoutes

Define routes programmatically:

```jsx
import { useRoutes } from "react-router-dom";

function App() {
    const element = useRoutes([
        { path: "/", element: <Movies /> },
        { path: "/add", element: <MovieForm /> },
        { path: "/profile/:userId", element: <Profile /> },
    ]);

    return element;
}
```

#### useSearchParams

Manage query strings:

```jsx
import { useSearchParams } from "react-router-dom";

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleFilterChange = (filter) => {
        setSearchParams({ filter });
    };

    return (
        <div>
            <h2>Current Filter: {searchParams.get("filter")}</h2>
            <button onClick={() => handleFilterChange("active")}>Active</button>
            <button onClick={() => handleFilterChange("completed")}>Completed</button>
        </div>
    );
}
```

---

## Conclusion

React Router’s hooks offer a powerful and flexible way to manage routing, URL parameters, and navigation in your React applications.

---

## Advanced Topics

### Nested Routes

Define routes within routes for shared layouts:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Settings from "./Settings";
import Profile from "./Profile";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />}>
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
```

**Using Outlet for Nested Routes:**

```jsx
import { Outlet } from "react-router-dom";

function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>
            <Outlet />
        </div>
    );
}
```

---

### Code Splitting and Lazy Loading with Routes

Load components dynamically for better performance:

```jsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Movies = React.lazy(() => import("./Movies"));
const MovieForm = React.lazy(() => import("./MovieForm"));

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Movies />} />
                    <Route path="/add" element={<MovieForm />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
```

---

### Route Guards and Private Routes

Protect routes based on authentication or roles.

**Private Route Example:**

```jsx
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
    const { status } = useAuth();
    if (status === "loading") return <p role="status">Checking session…</p>;
    const isAuthenticated = status === "authenticated";

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}
```

**Role-Based Route Guard Example:**

```jsx
import { Navigate } from "react-router-dom";

function RoleBasedRoute({ children, requiredRole }) {
    const { status, userRole } = useAuth();
    if (status === "loading") return <p role="status">Checking session…</p>;
    const isAuthenticated = status === "authenticated";

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (userRole !== requiredRole) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}
```

---

### Using createBrowserRouter (data-router API introduced in v6.4; compatible example for pinned v7)

Create a data-router instance outside rendering; do not wrap RouterProvider in an additional BrowserRouter:

```jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Dashboard from "./Dashboard";

const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "about", element: <About /> },
    { path: "dashboard", element: <Dashboard /> },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
```

---

## Conclusion

Advanced routing topics like code splitting, nested routes, and private routes are essential for building large-scale, performant React applications. By utilizing these features, developers can create highly optimized SPAs with improved performance, security, and scalability.
## Route contracts, failures and navigation ownership

The guard snippets assume an application-owned useAuth hook returning `{ status: 'loading' | 'anonymous' | 'authenticated', userRole?: string }`. They are UI decisions only. Authentication/authorization must also happen on every protected backend read/write; directly requesting an endpoint bypasses client routing. A fake navigate-to-dashboard click does not implement login. Sanitize any returnTo to an allowed internal path; never navigate to an arbitrary user-provided absolute URL after authentication.

A missing route and a missing entity are separate states; showing a useful not-found view usually helps more than silently redirecting every typo home. BrowserRouter deployments need a deliberate document/deep-link fallback at the host while API/assets retain correct404 behavior. HashRouter avoids some host rewrites but changes URLs and is an alternative, not a universal fix. Nested paths inherit parent params; a userId cannot appear merely because a component destructures it. Treat params/query values as untrusted strings and define parsing/default/bounds policies.

```jsx
// v7 data-router module: a worked loader boundary; API/auth server supplied by exercise.
import { createBrowserRouter, useLoaderData, useRouteError, isRouteErrorResponse, useRevalidator } from 'react-router-dom';
export async function movieLoader({ params, request }) {
  const id = params.movieId;
  if (!id || !/^[a-z0-9-]{1,80}$/i.test(id)) throw new Response('Not found', { status: 404 });
  const response = await fetch(`/api/movies/${encodeURIComponent(id)}`, { signal: request.signal });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Response('Movie unavailable', { status: response.status });
  }
  const value = await response.json();
  if (!value || typeof value !== 'object' || typeof value.id !== 'string' || typeof value.title !== 'string') {
    throw new Error('Invalid movie response');
  }
  return { id: value.id, title: value.title };
}
function MovieDetails() {
  const movie = useLoaderData();
  return <main><h1>{movie.title}</h1></main>;
}
function MovieFailure() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  return <main><h1>{missing ? 'Movie not found' : 'Movie could not load'}</h1>
    {!missing && <button type="button" disabled={revalidator.state !== 'idle'}
      onClick={() => revalidator.revalidate()}>Retry</button>}
  </main>;
}
export const movieRouter = createBrowserRouter([
  { path: '/movies/:movieId', loader: movieLoader, element: <MovieDetails />, errorElement: <MovieFailure /> },
  { path: '*', element: <main><h1>Page not found</h1></main> }
]);
```

This uses navigation cancellation via request.signal; add an owned total deadline/body byte bound for production. A Response-based route error is UI control flow, not a substitute for the real API's status/authentication policy. Do not display raw exception/response text containing private details. Initial pending, navigation pending, empty list, entity absence, recoverable failure and stale data need different UI; data mode useNavigation helps represent transitions. Route loaders and a query cache can integrate, but avoid two independent owners making duplicate fetches for the same data.

The earlier ScrollToTop is a simple example, not complete restoration: back/forward often should restore prior position, hash navigation needs its target, and reduced-motion preferences/focus need consideration. Change document title and focus intentionally for page-like navigation; don't steal focus on every query-string update. setSearchParams replaces the query unless preserving other keys explicitly; history state is not a durable shareable URL contract. navigate(-1) may leave the app or lack an intended prior entry; provide a known fallback when appropriate.

Unsaved drafts need a data-mode blocker plus an accessible confirm/discard flow, and a separate browser-unload policy where applicable. useBlocker covers supported SPA navigation, not every document/external exit; beforeunload is limited/unreliable on some mobile paths and cannot guarantee data retention. Persist drafts with version/user/expiry rules when justified. Do not invent a synchronous browser-confirm workflow as complete accessibility. See the subsequent complex-form lesson for draft state ownership.


Official references checked2026-10-21: [v7.18.4 modes](https://reactrouter.com/7.18.4/start/modes), [data loading](https://reactrouter.com/7.18.4/start/data/data-loading), [useBlocker](https://reactrouter.com/7.18.4/api/hooks/useBlocker), [React client root](https://react.dev/reference/react-dom/client/createRoot).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/routing_in_react.md). All learner practice remains outstanding; the worked examples above are explanatory material.
