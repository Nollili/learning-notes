# HOC, what is it, when to use

Summary: When to Choose What

| Scenario                                 | Use HOCs | Use Hooks |
|-------------------------------------------|:--------:|:---------:|
| Legacy Codebase with Class Components     |   ✅     |    ❌     |
| Modern Function Components               | Component adapter when justified | Logic reuse inside components |
| State Management Libraries (e.g., Redux)  |   ✅     |    ✅     |
| Cross-Cutting Concerns                    | Explicit component contract | Explicit hook contract |
| Avoiding Wrapper Hell                     |   ❌     |    ✅     |
| Complex Component Composition             |   ✅     |    ✅     |

## A decision, not a framework-age rule

An HOC accepts a component and returns another component type; a custom hook is called inside a function component to reuse stateful logic. Hooks do not share one state instance between callers, and HOCs can still be useful in modern code. Use ordinary composition for layout/slots before adding wrapper layers. A class cannot call hooks directly, but a function adapter can call a hook and pass a clear contract to a class.

The [typed ActionButton adapter](./Composition_and_Higher-Order_Components_%28HOCs%29_in.md#typed-prop-and-ref-transparency-in-react19) implements prop/ref forwarding, stable type creation, event chaining and failure semantics without any/unsafe generic injection. The same lesson's controlled tabs and slots supply the composition alternative. A UI auth wrapper is not backend authorization; every protected operation needs the server policy.

**Acceptance:** choose one requirement and explain why it needs a component adapter rather than a hook or plain child prop. Execute the shared adapter tests and its compile-time negative cases; inspect ref/disabled/caller-handler transparency and type identity on rerender. Document collisions, static fields and version boundaries explicitly. The table is design guidance; learner code and browser practice remain required.
