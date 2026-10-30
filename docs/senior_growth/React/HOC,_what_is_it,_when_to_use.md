# Higher-order components: purpose and use cases {#hoc-what-is-it-when-to-use}

Summary: When to Choose What

| Scenario                                 | Use HOCs | Use Hooks |
|-------------------------------------------|:--------:|:---------:|
| Legacy Codebase with Class Components     |   Yes |    No |
| Modern Function Components               | Component adapter when justified | Logic reuse inside components |
| State Management Libraries (e.g., Redux)  |   Yes |    Yes |
| Cross-Cutting Concerns                    | Explicit component contract | Explicit hook contract |
| Avoiding Wrapper Hell                     |   No |    Yes |
| Complex Component Composition             |   Yes |    Yes |

## A decision, not a framework-age rule

An HOC accepts a component and returns another component type; a custom hook is called inside a function component to reuse stateful logic. Hooks do not share one state instance between callers, and HOCs can still be useful in modern code. Use ordinary composition for layout/slots before adding wrapper layers. A class cannot call hooks directly, but a function adapter can call a hook and pass a clear contract to a class.

The [typed ActionButton adapter](./Composition_and_Higher-Order_Components_%28HOCs%29_in.md#typed-prop-and-ref-transparency-in-react19) implements prop/ref forwarding, stable type creation, event chaining and failure semantics without any/unsafe generic injection. The same lesson's controlled tabs and slots supply the composition alternative. A UI auth wrapper is not backend authorization; every protected operation needs the server policy.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/HOC%2C_what_is_it%2C_when_to_use.md). All learner practice remains outstanding; the worked examples above are explanatory material.
