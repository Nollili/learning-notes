### How do you start a REACT project from scratch?

Starting a React project from scratch involves setting up the environment, installing necessary dependencies, and configuring tools for development. Here's a step-by-step guide:

### **1. Prerequisites**

Before starting, ensure you have:

- **Node.js** installed: Download from [Node.js](https://nodejs.org/). This includes `npm` (Node Package Manager).
- Use the package runner included with supported npm; pin a Node version compatible with the selected toolchain.

---

### **2. New project choice and historical CRA context**

CRA was officially deprecated for new apps on2025-02-14. Use Vite+React+TypeScript for these client-only labs, or Next App Router for integrated server/routing work. The commands below are historical migration context; do not choose CRA as a new-project default.

### Steps:

1. Open a terminal.
2. Run the following command:
    
    ```bash
    npx create-react-app my-app
    ```
    
    - Replace `my-app` with your desired project name.
3. Navigate to the project directory:
    
    ```bash
    cd my-app
    ```
    
4. Start the development server:
    
    ```bash
    npm start
    ```
    

Your React application will open in the browser at `http://localhost:3000`.

---

### **3. Starting a React Project Manually**

If you prefer a minimal setup without using Create React App:

### **Step 1: Create a Project Folder**

```bash
mkdir my-app
cd my-app
```

### **Step 2: Initialize a New Node.js Project**

```bash
npm init -y
```

This creates a `package.json` file with default settings.

---

### **Step 3: Install Dependencies**

1. **Install React and ReactDOM**:
    
    ```bash
    npm install react react-dom
    ```
    
2. **Install Development Tools**:
Install tools for building and bundling your app (e.g., Webpack and Babel).
    
    ```bash
    npm install --save-dev webpack webpack-cli webpack-dev-server babel-loader @babel/core @babel/preset-env @babel/preset-react html-webpack-plugin
    ```
    

---

### **Step 4: Create Project Structure**

Create the following file structure:

```text
my-app/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── App.js
├── package.json
└── webpack.config.cjs
```

**Files:**

1. **`public/index.html`**:
    
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>React App</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
    </html>
    ```
    
2. **`src/index.js`**:
    
    ```jsx
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import App from './App';
    
    const container = document.getElementById('root');
    if (!container) throw new Error('Missing root element');
    createRoot(container).render(<App />);
    ```
    
3. **`src/App.js`**:
    
    ```jsx
    import React from 'react';
    
    const App = () => {
      return <h1>Hello, React!</h1>;
    };
    
    export default App;
    ```
    

---

### **Step 5: Configure Webpack**

Create a `webpack.config.cjs` file (CommonJS even if package type is module):

```jsx
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: './dist',
    port: 3000,
  },
};
```

---

### **Step 6: Configure Babel**

Create a `.babelrc` file in the root directory:

```json
{
  "presets": ["@babel/preset-env", ["@babel/preset-react", { "runtime": "automatic" }]]
}
```

---

### **Step 7: Add Scripts to `package.json`**

Update the `scripts` section in `package.json`:

```json
"scripts": {
  "start": "webpack serve --mode development",
  "build": "webpack --mode production"
}
```

---

### **Step 8: Start the Development Server**

Run the following command:

```bash
npm start
```

Your app will be available at `http://localhost:3000`.

---

### **4. Alternative Setups**

- **Vite**: A faster build tool for React projects.
    
    ```bash
    npm create vite@latest my-app -- --template react-ts
    cd my-app
    npm install
    npm run dev
    ```
    
- **Next.js**: If you want server-side rendering and more features:
    
    ```bash
    npx create-next-app@16.4.2 my-app
    cd my-app
    npm run dev
    ```
    

---

### **5. Tips for React Projects**

- **Code Quality**: Install ESLint and Prettier.
    
    ```bash
    npm install --save-dev eslint prettier eslint-plugin-react eslint-config-prettier
    ```
    
- **Styling**: Use CSS frameworks like TailwindCSS or styled-components.
- **State Management**: Consider using Redux, Zustand, or React Context.

## Reproducible setup and production acceptance

Applicable React19 client root API: createRoot; hydrateRoot for existing server-rendered React HTML. ReactDOM.render was removed in React19. The automatic JSX transform is required by current React; explicit Babel runtime configuration above avoids relying on a changing preset default. These instructions are a setup lesson, not changes to this repository's VitePress scripts.

The manual Webpack/Babel path is an alternative learning lab. Pin compatible Webpack5/Babel/plugin versions and lockfile; choose consistent module config extensions. Babel transpilation does not typecheck TypeScript. If adding TS, configure parser/loader plus a separate tsc --noEmit check and correct TS/browser/module targets. Resolve extension/alias settings consistently across bundler, typechecker and tests; an editor alias alone does not change runtime resolution. Source maps improve debugging but must not expose secrets/private source unintentionally in a public deployment.

Use the scaffold's current scripts/config rather than installing unrelated tools blindly. Add accessible base HTML, CSS ownership, one meaningful route, error/loading behavior and a server boundary for secrets. A client environment prefix is public configuration, not secret storage. Avoid installing every store/form/styling library in a starter: local state, CSS Modules, native fetch and an explicit router/query requirement are enough to begin.

**Exercise acceptance:** create a pinned client app, render an accessible labeled form and one lazy route, then run typecheck/lint/tests/build/preview as configured. Test deep-link refresh, invalid route, missing root, asset base path, chunk loading, failed API and no-JS behavior; map one production stack trace through the chosen source-map policy. Record versions/lockfile/commands/results and keep the app buildable in small increments. No React/Webpack application install/build was performed in this notes repository. Its docs build only checks the study material.

Official references checked2026-10-21: [CRA deprecation](https://react.dev/blog/2025/02/14/sunsetting-create-react-app), [React19 removed APIs/JSX](https://react.dev/blog/2024/04/25/react-19-upgrade-guide), [Vite scaffold](https://vite.dev/guide/), [Babel React preset](https://babeljs.io/docs/babel-preset-react), [Webpack TypeScript](https://webpack.js.org/guides/typescript/).

For executable compiler configuration, alias failure drills, NodeNext output and production source-map handling, complete the [worked build and resolution lab](./build_tools.md#worked-lab-typechecking-host-resolution-and-private-source-maps). This supplies the concrete configuration beyond the setup checklist above.
