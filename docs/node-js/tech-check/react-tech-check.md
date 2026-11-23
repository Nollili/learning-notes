---
outline: [2, 3]
---

# React tech-check

Use these interview questions to practise clear explanations of React. This page contains questions, not model answers. Missing snippets and unclear points are marked below. Version-specific questions reflect the interview; check the version used by your project when answering them.


## Coding task: recursive navigation menu


## Build a navigation component from an array of menu items:

   - Each item has an id, a label, and optional nestedItems.
   - Support nested items at any depth.
   - Allow submenus to expand and collapse.
   - Keep submenus hidden initially.
   - Receive the menu data through props. You do not need to fetch it or add styling.

- Optional extension: How would you support additional item properties, such as onClick or a link?

- Where should the key prop go when mapping items to components?

- Do nested mapped items also need keys?

- Does each navigation item created by the recursive component have separate state?

## JSX and component return values


- Which JavaScript expressions can you put inside JSX braces, and which kinds of code cannot go there directly?

- Snippet question: Can the shown statements go directly inside JSX? If not, how would you rewrite the code?

- What can a function component return?

- Snippet comparison: How does rendering a component with JSX differ from calling its function yourself?

  *The exact expressions are missing from the transcript. The speakers later discuss render props, so the intended comparison is unclear.*

## State, initialization, and batching


- How does useState work internally?

- How does passing an initial value to `useState` differ from passing a function that calculates it?

- When does React call the function used to calculate the initial state?

- What happens if you call a state setter several times inside one event handler?

- Does React render after every setter call?

- What is batching?

- How do you queue several state updates when each needs the result of the previous one?

- Can you make React apply updates synchronously instead of waiting for its normal batching?

  *The interviewer gives `flushSync` as a hint. The discussion also covers functional state updaters, which solve a different problem.*

- How does useReducer work, and how does it differ from useState?

- Why should you replace state values rather than change existing state objects directly?

- How would you update a value inside several levels of nested state?

## Rendering lifecycle and error boundaries


- Explain what happens during a function component's render, pre-commit and commit stages.

- Can hooks provide every lifecycle capability available in class components?

- Which class-component capabilities do the hooks discussed here not provide directly?

  *The speakers discuss error boundaries as the example. Treat this as the transcript's question, rather than a claim about every React version.*

- What happens if a component throws an unhandled error during rendering?

## Effects


- Coding task: Add a `useEffect` that starts a fetch request. Explain when the effect runs.

- How does the dependency array affect when an effect runs again?

- What happens if you remove the dependency array?

- Have you used useLayoutEffect, and how does it differ from useEffect?

## Hook categories and custom hooks


- What jobs do different hooks do? Group them by purpose and include examples beyond `useState` and `useReducer`.

- Do you use custom hooks? How do you design and create them?

- Which hook rules must you preserve when moving shared logic into a custom hook?

- Why must ordinary hooks be called in a consistent order rather than inside conditions?

- How does the order of hook calls help React match stored state to each hook?

## Reusing logic and component composition


- Besides custom hooks, how can React components share behavior?

- Coding task: Write a simple higher-order component: a function that takes a component and returns a component with added behavior.

- Does your higher-order component return a component function or an element that has already been created?

  *The interviewer asks this to correct the candidate's implementation.*

- What other reuse patterns do you know?

  *The speakers demonstrate render props and composing components through `children`.*

## React DOM APIs


- What do these APIs do, and when would you use each?
    - createRoot
    - hydrateRoot
    - createPortal

## Keys, reconciliation, and performance


- What does `key` tell React about an item in a list, and why does that matter when the list changes?

- What happens if you omit a key?

- What happens if two sibling elements have the same key?

- How does React compare a new element tree with the previous one?

- Which hooks and APIs can you use to improve component performance?

- What performance-related improvements have you heard about in React 19?

- Is it always true that developers no longer need to add memoization themselves?

  *The speakers explore this claim briefly; they do not assess it in depth.*

- How do you measure React performance in practice?

- How do you decide whether a component needs optimization?

- Is memoization the only way to prevent an expensive component from rendering unnecessarily?

- Composition exercise: A component has local state that changes often. Could receiving an expensive child through `children`, rather than creating that child itself, avoid some renders? Explain why.

## Redux fundamentals


- What are Redux’s three main principles?

- What are its main building blocks?

  *The interviewer uses both “principles” and “building blocks.” The building-block discussion covers the store, actions and reducers.*

- Where does Redux state live?

- How do you update data in the store from a component?

- Coding task: Write a simple reducer.

- What must a reducer return after updating state?

- How do you read Redux state inside a component?

- What does a selector function look like?

- When would you choose Redux over Context, or Context over Redux?

## Redux normalization and asynchronous operations


- What does it mean to normalize Redux state: for example, store related records by ID instead of repeating nested copies?

- What makes a state structure difficult to read or update, and how would you improve it?

- Data exercise: What is difficult about reading the supplied nested orders and items? How would you reorganize it into normalized state?

- How do you handle asynchronous operations in a Redux application?

  *The discussion includes Redux Thunk, Redux Saga and actions representing loading, success and failure.*

## React Router


- Have you used React Router?

- How does it enable navigation without a full-page reload?

- Which router types are commonly used?

- Which browser API can a router use to change navigation without reloading the page?

  *The discussion includes browser, hash, memory, and static routers, plus the History API.*

## React testing


- What experience do you have writing unit tests for React applications?

- What is the difference between shallow rendering and full rendering?

- When would shallow rendering be useful, and when would you need full rendering?

- How do you test components that make API calls?

- Have you used Mock Service Worker (MSW)? How does it work?

- Which React Testing Library queries do you know?

- What are the Arrange, Act and Assert steps in a test?

- How can a component test simulate a user's action? Name two approaches or APIs you know.

  *The transcript does not clearly identify both APIs the interviewer expects. It does mention `fireEvent`.*

- After rendering a component containing a button, how would you find that button?

  *The interviewer introduces `screen` and queries that find elements by their accessible role.*

## Rendering strategies and Next.js


- Which rendering strategies do you know and use?

- What benefits can rendering HTML on the server provide?

- Explain the steps of a server-side-rendered request:
    - What does the client request?
    - What does the server do?
    - What does it return?
    - What does the browser do next?

- Do you use Next.js App Router, Pages Router, or both?

- With App Router, how do you generate pages statically and later regenerate or revalidate their data or content?

- How does that differ from the Pages Router approach?

## Build tools and production optimization


- What is the difference between a transpiler and a compiler?

- What does Babel do in a React build?

- How do development and production builds differ?

- How does React’s performance differ between those builds?

- How can you optimize a production bundle?

- What is tree shaking?

- Example: A module exports two functions, but the app uses only one. What might the bundler do with the unused function?

Forms, Context as its own topic, and type checking were skipped or not explored fully. Do not count them as assessed topics.
