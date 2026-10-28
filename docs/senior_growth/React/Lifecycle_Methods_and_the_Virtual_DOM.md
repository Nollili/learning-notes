# Lifecycle Methods and the Virtual DOM

Subjects: React

Lifecycle methods allow developers to hook into specific stages of a React component's rendering and update process. Here's how they interact with the Virtual DOM and reconciliation:

1. **Mounting Phase** (Initial Render):
    - **`constructor()`**: Initialize state and bind methods; no interaction with the Virtual DOM yet.
    - **`render()`**: The Virtual DOM tree for the component is created here.
    - **`componentDidMount()`**: Called after the component is added to the real DOM. Suitable for side effects like fetching data or adding event listeners.
2. **Updating Phase** (When props or state change):
    - **`shouldComponentUpdate(nextProps, nextState)`**:
        - By default, React updates every time props or state change. Use this method to return `false` if an update is unnecessary, saving Virtual DOM comparisons.
        - Treat this as a measured optimization with a correct comparison contract, not a requirement for every class.
    - **`render()`**:
        - React generates a new Virtual DOM tree based on the updated props or state.
        - React then diffs the new Virtual DOM with the previous one to identify changes.
    - **`componentDidUpdate(prevProps, prevState)`**:
        - Called after the reconciliation process updates the real DOM. Useful for operations dependent on the updated DOM.
3. **Unmounting Phase** (Component Removal):
    - **`componentWillUnmount()`**:
        - Clean up resources like event listeners or timers to avoid memory leaks. At this stage, the component is removed from the Virtual DOM and real DOM.

### **Example of Lifecycle Integration with Reconciliation**

```jsx
import * as React from 'react';
class ExampleComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Prevent update if the counter is even
    return nextState.counter % 2 !== 0;
  }

  increment = () => {
    this.setState((prevState) => ({ counter: prevState.counter + 1 }));
  };

  render() {
    console.log('Render: Generating Virtual DOM');
    return (
      <div>
        <p>Counter: {this.state.counter}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    console.log(`Component updated from ${prevState.counter} to ${this.state.counter}`);
  }
}
```

**Flow**:

1. The user clicks the "Increment" button, triggering a state change.
2. `shouldComponentUpdate()` decides whether the component should re-render.
3. If `true`, `render()` generates a new Virtual DOM tree.
4. React diffs the new tree with the old one and updates only the affected nodes in the real DOM.
5. After the update, `componentDidUpdate()` is called.

## Skipping render does not skip the state update

The even-counter example deliberately leaves visible output behind its internal state. After clicks1,2,3, internal values are1,2,3 while displayed values are1,1,3. shouldComponentUpdate=false does not cancel the update or freeze props/state; it skips that render/associated update lifecycle under this contract. A callback comparing the wrong fields can hide valid UI changes. Do not derive business side effects from an assumed render count.

## A typed section error boundary

Use React19.3.0/types19 and TypeScript5.9.3. A boundary contains a descendant rendering failure so sibling sections can remain usable. Keep the fallback simple enough that it is unlikely to fail itself.

```tsx
// section-boundary.tsx
import { Component, type ReactNode } from 'react';
type Props = {
  children: ReactNode;
  onReport: (event: { code: 'SECTION_RENDER_FAILED' }) => undefined;
};
export class SectionBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {
    try { this.props.onReport({ code: 'SECTION_RENDER_FAILED' }); }
    catch { /* A best-effort reporting failure must not break the fallback. */ }
  }
  render() {
    if (this.state.failed) return <div role="alert">
      <p>This section could not be displayed.</p>
      <button type="button" onClick={() => this.setState({ failed: false })}>Try section again</button>
    </div>;
    return this.props.children;
  }
}
```

The reporter receives a fixed safe event, not raw user content/stack traces. An asynchronous reporting sink needs its own bounded queue/error policy; the undefined return contract does not silently accept a Promise. A deterministic broken child will fail again after retry—there is no automatic retry loop. Correct the cause or refresh authorized data before retrying. Reset with a deliberate key when switching to a different record so one record's failure does not permanently hide the next; a key reset also discards descendant local state/drafts.

Error boundaries are not a universal try/catch. They do not catch ordinary event-handler errors, arbitrary timer/Promise rejections, their own fallback failures or server-rendering failures. Handle asynchronous outcomes in the request/action owner; use the framework's server/route error mechanism where applicable. A boundary does not undo a database write or recover an abandoned subscription automatically. Resource-owning effects still need cleanup.


Official references checked 2026-10-22: [Component/error boundary/update contracts](https://react.dev/reference/react/Component), [state/type/key reset](https://react.dev/learn/preserving-and-resetting-state).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/Lifecycle_Methods_and_the_Virtual_DOM.md). All learner practice remains outstanding; the worked examples above are explanatory material.
