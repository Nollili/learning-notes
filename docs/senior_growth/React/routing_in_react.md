# Routing in React

## What is React Router?

React Router is a library designed to manage navigation in Single Page Applications (SPAs). It allows users to change the browser's URL and navigate through different views within the application without refreshing the page. React Router operates entirely on the client-side, which means users experience seamless transitions between different pages without making additional requests to the server.

**Core components of React Router:**

- **BrowserRouter:** Manages the routing history and URL changes.
- **Routes and Route:** Define which component should be rendered for a specific path.
- **Link:** A React component that renders as an anchor tag (`<a>`) to allow navigation without reloading the page.

---

## Installing React Router

Install React Router by running:

```bash
npm install react-router-dom
```

To install a specific version:

```bash
npm install react-router-dom@6
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

- **Routes:** Wraps all `Route` components, ensuring only one route is rendered at a time.
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

## Programmatic Navigation with Link Component

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
<Route path="/movies/:movieId" element={<Movie />} />

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
    const isAuthenticated = useAuth();

    return isAuthenticated ? children : <Navigate to="/login" />;
}
```

**Role-Based Route Guard Example:**

```jsx
import { Navigate } from "react-router-dom";

function RoleBasedRoute({ children, requiredRole }) {
    const { isAuthenticated, userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (userRole !== requiredRole) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}
```

---

### Using createBrowserRouter (Router 6.26.0)

Create a router instance with a declarative approach:

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