---
outline: [2, 3]
---

# React tech-check


## Coding task: recursive navigation menu


## Build a navigation component from an array of menu items:

   - Each item has an id, a label, and optional nestedItems.
   - Support arbitrary nesting depth.
   - Allow submenus to expand and collapse.
   - Keep submenus hidden initially.
   - Receive the data through props; fetching and styling are unnecessary.

- Optional extension: How would you support additional item properties, such as onClick or a link?

- Where should the key prop go when mapping items to components?

- Do nested mapped items also need keys?

- Will each recursively rendered navigation item have its own independent state?

## JSX and component return values


- What JavaScript can you write inside JSX curly braces? What restrictions apply?

- Snippet question: Can you put the demonstrated statements directly inside JSX? If not, how could you restructure them?

- What can a function component return?

- Snippet comparison: What is the difference between rendering a component with JSX and invoking it as a function?

  *The exact expressions are unavailable. The discussion later connects this question to render props, so its intended scope is somewhat ambiguous.*

## State, initialization, and batching


- How does useState work internally?

- What is the difference between direct initialization and lazy initialization?

- When does a lazy initializer execute?

- What happens if you call a state setter several times inside one event handler?

- Does React render after every setter call?

- What is batching?

- How do you update state repeatedly when each update depends on the previous result?

- Can you force synchronous updates instead of relying on batching?

  *flushSync is introduced as a hint. Functional updater functions are also discussed; they are a separate mechanism.*

- How does useReducer work, and how does it differ from useState?

- Why should state be treated as immutable?

- How would you manage updates to deeply nested state?

## Rendering lifecycle and error boundaries


- Explain the lifecycle of a function component, focusing on render, pre-commit, and commit.

- Can hooks reproduce all the lifecycle functionality available in class components?

- What functionality cannot be implemented directly with existing function-component hooks?

  *Error boundaries are the example discussed.*

- What happens if a component throws an unhandled error during rendering?

## Effects


- Coding/discussion task: Add a useEffect containing a fetch operation and explain when it executes.

- How does the dependency array control effect execution?

- What happens if you remove the dependency array?

- Have you used useLayoutEffect, and how does it differ from useEffect?

## Hook categories and custom hooks


- How would you group React hooks by purpose? Give examples beyond useState and useReducer.

- Do you use custom hooks? How do you design and create them?

- What rules apply when extracting reusable logic into a custom hook?

- Why can’t you call ordinary hooks conditionally?

- How does hook call order allow React to associate state with the correct hook?

## Reusing logic and component composition


- Besides custom hooks, what patterns can you use to reuse logic in React?

- Coding task: Write a simple higher-order component.

- Does your HOC return a component function, or an already-created element?

  *This is a corrective follow-up to the implementation.*

- What other reuse patterns do you know?

  *Render props and composition through children are explained and demonstrated.*

## React DOM APIs


- What do these APIs do, and when would you use each?
    - createRoot
    - hydrateRoot
    - createPortal

## Keys, reconciliation, and performance


- What is the purpose of key, and how does it affect React’s handling of a list?

- What happens if you omit a key?

- What happens if two sibling elements have the same key?

- How does React compare successive element trees?

- Which hooks and APIs can you use to improve component performance?

- What performance-related improvements have you heard about in React 19?

- Is the claim that you no longer need manual memoization accurate?

  *This is an exploratory discussion, not a deeply assessed topic.*

- How do you measure React performance in practice?

- How do you decide whether a component needs optimization?

- Is memoization the only way to prevent an expensive component from rendering unnecessarily?

- Composition exercise: If an expensive component is passed through children from a parent, instead of being instantiated inside a component with changing local state, can that help avoid unnecessary renders? Why?

## Redux fundamentals


- What are Redux’s three main principles?

- What are its main building blocks?

  *The interviewer moves between “principles” and “building blocks”; the latter discussion concerns store, actions, and reducers.*

- Where does Redux state live?

- How do you update data in the store from a component?

- Coding task: Write a simple reducer.

- What must a reducer return after updating state?

- How do you read Redux state inside a component?

- What does a selector function look like?

- When would you choose Redux over Context, or Context over Redux?

## Redux normalization and asynchronous operations


- What is state normalization in Redux?

- What does a poorly structured state shape look like, and how would you improve it?

- Data-shape exercise: How difficult is it to read the supplied nested orders/items data? How could you normalize it?

- How do you handle asynchronous operations in a Redux application?

  *Redux Thunk, Redux Saga, and loading/success/failure actions are discussed.*

## React Router


- Have you used React Router?

- How does it enable navigation without a full-page reload?

- Which router types are commonly used?

- Which browser API does routing use to navigate?

  *The discussion includes browser, hash, memory, and static routers, plus the History API.*

## React testing


- What experience do you have writing unit tests for React applications?

- What is the difference between shallow rendering and full rendering?

- When would you use one approach over the other?

- How do you test components that make API calls?

- Have you used Mock Service Worker (MSW)? How does it work?

- Which React Testing Library queries do you know?

- What is the Arrange–Act–Assert pattern?

- How do you simulate user events in a component test? Which two approaches/APIs do you know?

  *The transcript does not clearly capture both intended API names; fireEvent is discussed.*

- After rendering a component containing a button, how would you find that button?

  *The interviewer introduces screen and role-based queries.*

## Rendering strategies and Next.js


- Which rendering strategies do you know and use?

- What benefits does server-side rendering provide?

- Explain the SSR request lifecycle:
    - What does the client request?
    - What does the server do?
    - What does it return?
    - What does the browser do next?

- Do you use Next.js App Router, Pages Router, or both?

- How do you implement static generation and incremental regeneration/revalidation with App Router?

- How does that differ from the Pages Router approach?

## Build tools and production optimization


- What is the difference between a transpiler and a compiler?

- What role does Babel play when building a React application?

- What differs between development and production builds?

- How does React’s performance differ between those builds?

- How can you optimize a production bundle?

- What is tree shaking?

- Example discussion: If a module exports two functions but the application uses only one, what can happen to the unused function during bundling?

Explicitly skipped or not fully explored: forms, Context as a standalone topic, and type checking. They should not be counted as assessed questions.
