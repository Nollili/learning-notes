### Would you introduce centralized state management in a React project which does not have it, and how?

Introducing centralized state management to a React project is justified only when the project has specific needs or challenges that centralized management can solve.

https://www.youtube.com/watch?v=-bEzt5ISACA&ab_channel=freeCodeCamp.org

### **When to Introduce Centralized State Management**

### **Signs You Need Centralized State Management**

1. **Complex State Sharing**: If multiple components need to share and synchronize state, centralized management can simplify the architecture.
2. **Prop Drilling Issues**: When props are passed through several layers of components unnecessarily.
3. **Global State Requirements**: App-wide data like user authentication, theme, or language settings require a single source of truth.
4. **Frequent Updates**: If state updates cause excessive re-renders or are difficult to track/debug.
5. **Scalability**: When the project is growing and the existing local state management becomes hard to maintain.

If the project is small and the above issues are absent, centralized state management might introduce unnecessary complexity.

---

### **Steps to Introduce Centralized State Management**

### **1. Assess the Existing State Management**

- Identify the state that needs to be shared or global (e.g., user data, notifications, settings).
- Determine whether existing local state management is sufficient for certain parts of the app.

---

### **2. Choose the Right Solution**

The solution depends on the project scale and requirements:

| **Tool** | **Use Case** |
| --- | --- |
| **React Context API** | Small to medium projects with limited shared state. |
| **Redux Toolkit** | Medium to large projects with complex state logic or frequent updates. |
| **Zustand** | Simple alternative for centralized state without boilerplate. |
| **Recoil (historical)** | Repository archived2025-01-01; retain legacy context, not a primary new-project recommendation. |

---

### **3. Implement the Chosen Solution**

### **Option 1: React Context API**

1. **Create a Context**:
    
    ```jsx
    import React, { createContext, useContext, useReducer } from 'react';
    
    const StateContext = createContext();
    const DispatchContext = createContext();
    
    const initialState = { user: null };
    
    const reducer = (state, action) => {
      switch (action.type) {
        case 'SET_USER':
          return { ...state, user: action.payload };
        default:
          return state;
      }
    };
    
    export const StateProvider = ({ children }) => {
      const [state, dispatch] = useReducer(reducer, initialState);
    
      return (
        <StateContext.Provider value={state}>
          <DispatchContext.Provider value={dispatch}>
            {children}
          </DispatchContext.Provider>
        </StateContext.Provider>
      );
    };
    
    export const useAppState = () => useContext(StateContext);
    export const useAppDispatch = () => useContext(DispatchContext);
    ```
    
2. **Wrap Your App**:
    
    ```jsx
    import { StateProvider } from './StateContext';
    
    const Root = () => (
      <StateProvider>
        <App />
      </StateProvider>
    );
    ```
    
3. **Use Context in Components**:
    
    ```jsx
    const Profile = () => {
      const state = useAppState();
      const dispatch = useAppDispatch();
    
      const handleLogin = () => dispatch({ type: 'SET_USER', payload: { name: 'John Doe' } });
    
      return (
        <div>
          <h1>Welcome, {state.user?.name || 'Guest'}</h1>
          {!state.user && <button onClick={handleLogin}>Choose demo profile</button>}
        </div>
      );
    };
    ```
    

---

### **Option 2: Redux Toolkit**

1. **Install Redux**:
    
    ```bash
    npm install @reduxjs/toolkit react-redux
    ```
    
2. **Set Up a Store**:
    
    ```jsx
    import { configureStore, createSlice } from '@reduxjs/toolkit';
    
    const userSlice = createSlice({
      name: 'user',
      initialState: null,
      reducers: {
        setUser: (state, action) => action.payload,
      },
    });
    
    export const { setUser } = userSlice.actions;
    
    const store = configureStore({
      reducer: { user: userSlice.reducer },
    });
    
    export default store;
    ```
    
3. **Wrap the App**:
    
    ```jsx
    import { Provider } from 'react-redux';
    import store from './store';
    
    const Root = () => (
      <Provider store={store}>
        <App />
      </Provider>
    );
    ```
    
4. **Access Redux in Components**:
    
    ```jsx
    import { useSelector, useDispatch } from 'react-redux';
    import { setUser } from './store';
    
    const Profile = () => {
      const user = useSelector((state) => state.user);
      const dispatch = useDispatch();
    
      const handleLogin = () => dispatch(setUser({ name: 'John Doe' }));
    
      return (
        <div>
          <h1>Welcome, {user?.name || 'Guest'}</h1>
          {!user && <button onClick={handleLogin}>Choose demo profile</button>}
        </div>
      );
    }
    ```
    

---

### **Option 3: Zustand**

1. **Install Zustand**:
    
    ```bash
    npm install zustand
    ```
    
2. **Create a Store**:
    
    ```jsx
    // user-store.js
    import { create } from 'zustand';
    
    const useStore = create((set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }));
    
    export default useStore;
    ```
    
3. **Use Zustand in Components**:
    
    ```jsx
    // zustand-profile.jsx
    import useStore from './user-store.js';
    export const Profile = () => {
      const user = useStore(state => state.user);
      const setUser = useStore(state => state.setUser);
    
      const handleLogin = () => setUser({ name: 'John Doe' });
    
      return (
        <div>
          <h1>Welcome, {user?.name || 'Guest'}</h1>
          {!user && <button onClick={handleLogin}>Choose demo profile</button>}
        </div>
      );
    };
    ```
    

---

### **4. Test and Monitor Performance**

- Ensure the centralized state doesn't overburden the application with frequent re-renders.
- Use tools like **React DevTools** or **Redux DevTools** to monitor state changes.

---

### **5. Incremental Migration**

- Migrate parts of the app needing centralized state first (e.g., authentication or theme).
- Gradually refactor local state logic to use the centralized state.

---

### **Conclusion**

Introducing centralized state management should be driven by specific needs such as complexity, scalability, and maintainability. Start with a lightweight solution like React Context or Zustand for small apps, and opt for Redux Toolkit for larger projects.

## Scope the owner before selecting a store

The examples set a display-only demo user; they do not verify credentials or grant API permissions. Never store access/refresh tokens or derive server authorization from this UI. Primary complex shared-client path: Redux Toolkit. Context/reducer is appropriate for scoped settings; Zustand is an alternative, not an additional required migration. Keep remote query caches, URL state and short-lived form drafts with their appropriate owners.

Zustand5 uses named create; calling the bound hook without a selector subscribes to the entire state. Select a primitive or stable action as above. A new object/array returned on every snapshot is not a stable selection; use individual selectors or the documented useShallow/custom-equality API deliberately. Do not copy an old second comparator argument onto the v5 create hook. The module-level toy store is one client singleton; SSR/test/user-session isolation requires a per-request/scoped store factory and deliberate reset/disposal.


References checked2026-10-22: [Zustand5 migration](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5), [official selector guidance](https://github.com/pmndrs/zustand/blob/main/README.md), [Recoil archive](https://github.com/facebookexperimental/Recoil).

For normalized entities, use the [worked Toolkit adapter](../State_management_and_Redux/Is_still_valid_to_use_Redux_in_a_new_project_nowadays.md#normalize-identity-persist-only-a-reviewed-subset). Keep server mutations with the [pending-overlay/versioned-confirmation workflow](./complex-forms-and-data.md#worked-optimistic-policy-pending-overlay-instead-of-stale-snapshot-rollback): a failed earlier mutation must not restore a stale snapshot over later success; pending intent, confirmed cache and server transaction are distinct owners. Test overlapping failure/success and uncertain commits rather than copy remote records into another global store.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/Would_you_introduce_centralized_state_management_i_164e8106c24d8038b616c7e2e368c6a9.md). All learner practice remains outstanding; the worked examples above are explanatory material.
