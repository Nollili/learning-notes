# Incremental DOM vs Virtual DOM? Pros and cons

# 🔹 Incremental DOM vs Virtual DOM

Both **Incremental DOM** and **Virtual DOM (VDOM)** are techniques to optimize **DOM updates** in web applications, but they differ in **how they track changes and render elements**.

---

## 1️⃣ Virtual DOM (VDOM)

**Definition:** A **virtual representation** of the real DOM stored in memory. When the state changes:

1. A **new virtual DOM tree** is created.
2. The new tree is **diffed** with the previous one.
3. The renderer commits necessary changes according to its reconciliation/identity rules; this is not a globally optimal edit-distance guarantee.

**Used by:** React, Preact, Vue (in some modes)

### Example Flow
```

State change → new VDOM → diff with old VDOM → patch real DOM

```

### Pros
- Declarative and **easy to reason about**.
- Minimizes direct DOM manipulation → less error-prone.
- Works well for **complex UIs**.
- Optimized with **reconciliation** algorithms.

### Cons
- Requires **extra memory** for VDOM tree.
- Diffing large trees can be **CPU-intensive**.
- Performance cost if **very frequent or huge updates**.

---

## 2️⃣ Incremental DOM

**Definition:** Instead of creating a VDOM, Incremental DOM **updates the real DOM directly** during render. It **walks the template** and applies changes **incrementally**.

**Historical example:** Google Incremental DOM, an in-place DOM diffing library. Do not conflate every direct/compiled renderer with this package or describe Preact generally as Incremental DOM.

### Example Flow
```

Render function → walk the DOM → update nodes directly

```

### Pros
- Avoids a separate newly allocated virtual tree in its rendering model; total retained/allocation cost still depends on implementation and workload.
- Updates are **incremental**, reducing overhead.
- Different allocation/update behavior that requires a controlled workload comparison.

### Cons
- More **imperative**; harder to reason about than declarative VDOM.
- Uses an in-place diffing API with a different author/compiler integration contract.
- Harder to integrate with **stateful declarative frameworks**.
- Can require **manual keying** to avoid unnecessary DOM mutations.

---

## 3️⃣ Key Differences

| Feature                  | Virtual DOM                              | Incremental DOM                        |
|---------------------------|-----------------------------------------|----------------------------------------|
| Memory usage | Renderer bookkeeping and application retention vary | Different bookkeeping/allocations; measure total workload |
| Update method             | Diff + patch                             | Incremental updates during render      |
| Ease of reasoning         | Declarative, easy                        | Imperative, harder                      |
| Performance on large DOM | Rendering, reconciliation and browser work all matter | Direct patching still incurs browser work; no universal winner |
| Integration               | Works naturally with React/Vue           | More manual control, template-driven   |

---

## 4️⃣ When to Use Which

- **Virtual DOM**
  - Declarative frameworks (React, Vue)
  - Complex UI with frequent state changes
  - Easier maintainability

- **Incremental DOM**
  - Historical codebases or optional renderer research
  - A justified experiment with equivalent identity/cleanup semantics
  - Measured requirements that outweigh maintenance/tooling costs

---

### ✅ Summary

- **Virtual DOM:** A renderer computes representations and reconciles/commits according to its identity rules.
- **Incremental DOM:** In-place diffing/direct patch instructions use a different representation; benchmark costs and correctness.
- **Trade-off:** Representation, identity/ownership, integration and measured workload costs.

> 💡 Senior Tip:  
> Diagnose state ownership, computation, DOM size and layout first. A renderer rewrite is not a substitute for bounded data or virtualization.


## Optional historical specialization

The Google Incremental DOM repository was archived2025-06-20 and is read-only. Keep React19 as this path's primary renderer; introductory architectural awareness is sufficient here. A compiled template can be declarative for its author while generating lower-level patch instructions, so “imperative versus declarative” is not determined solely by whether a VDOM tree is allocated.

**Worked reasoning:** changing a greeting from Ada to Lili should retain the intended paragraph identity, update its text and preserve unrelated controls/drafts. Replacing every DOM child is not equivalent if it loses focus, selection, listeners or edit state. Stable keyed list identity, escaping/untrusted text, event cleanup and resource ownership need a defined policy in either renderer. A keyed reorder and an append are different workloads; compare equivalent outcomes rather than just a stopwatch around different operations.

**Introductory acceptance:** trace initial render, text update, keyed reorder and removal through the two models. Identify where identity, subscriptions and cleanup are owned. In the primary React app, verify stable keys and preserved input state, then inspect a browser trace to determine whether computation/reconciliation or browser layout dominates. A native trace is still unperformed here. Installing/building a historical Incremental DOM app and controlled cross-renderer benchmarks remain explicitly deferred optional advanced practice; no performance or memory ranking is claimed.

Official sources checked2026-10-22: [Incremental DOM implementation/archive](https://github.com/google/incremental-dom), [React render and commit](https://react.dev/learn/render-and-commit), [state/type/key identity](https://react.dev/learn/preserving-and-resetting-state). For actual production diagnosis use the [trace/evidence ledger](../Web_Performance/How_would_you_start_the_investigation,_what_are_your_steps_after_the_customer%27s_feedback_is_that_the_application_is_really_slow.md#an-evidence-ledger-for-one-reported-task).
