### What are the tasks / microtasks?

In JavaScript, tasks and microtasks are part of the **event loop** mechanism and determine how asynchronous code is executed. 

External animation reference (unreviewed): [event-loop illustration](https://miro.medium.com/v2/resize:fit:1400/1*XVqPA2z1dTHJWm2TwIAsBw.gif). The explanation and executable fixture below are self-contained; this media is not evidence.

---

### **1. Tasks (Macrotasks)**

### **Definition**:

- Tasks, also called **macrotasks**, are pieces of code that are scheduled to run later after the current stack is cleared.
- Examples of tasks:
    - `setTimeout`
    - `setInterval`
    - `setImmediate` (Node.js)
    - I/O operations (like file reading in Node.js)
    - Browser event callbacks; rendering opportunities are separately scheduled, not an ordinary FIFO item after every task

### **How They Work**:

1. Tasks are queued in the **task queue**.
2. The browser selects a runnable task from its task sources according to host rules, not one universal FIFO for all events.
3. Microtask checkpoints and rendering opportunities may occur before another task; rendering is not guaranteed after every task.

---

### **2. Microtasks**

### **Definition**:

- Microtasks are jobs processed at specified checkpoints. They are not necessarily small or safe to run for a long time.
- They run at checkpoints such as after a task completes; they do not interrupt synchronous code. Checkpoints can also occur during host script/callback cleanup.
- Examples of microtasks:
    - `Promise` callbacks (`.then`, `.catch`, `.finally`)
    - `MutationObserver` (used for DOM changes)
    - `queueMicrotask` (available in browsers and Node to enqueue a microtask)

### **How They Work**:

1. When a microtask is scheduled, it goes into the **microtask queue**.
2. After the currently executing code in the **call stack** completes, the event loop checks the **microtask queue** and executes all the microtasks in order.
3. Only when the microtask queue is empty does the event loop pick the next task from the **task queue**.

---

### **Key Difference: Task vs. Microtask**

| Feature | **Tasks (Macrotasks)** | **Microtasks** |
| --- | --- | --- |
| **Scheduling** | Runnable task chosen by host | Drained at a microtask checkpoint |
| **Execution Timing** | Host task scheduling | At checkpoints, without interrupting current synchronous code |
| **Examples** | `setTimeout`, `setInterval` | Promises, `queueMicrotask` |
| **Use Case** | Timer/event work; rendering uses its own opportunities | Bounded follow-up work/chaining |

---

### **3. Example: Tasks vs. Microtasks in Action**

```jsx
console.log("Start");

setTimeout(() => {
  console.log("Task: setTimeout");
}, 0);

Promise.resolve().then(() => {
  console.log("Microtask: Promise");
});

console.log("End");
```

### **Execution Flow**:

1. `console.log("Start")` is executed (call stack).
2. `setTimeout` is scheduled as a task (goes to the **task queue**).
3. `Promise.resolve().then()` is scheduled as a microtask (goes to the **microtask queue**).
4. `console.log("End")` is executed (call stack).
5. The **microtask queue** is processed:
    - `console.log("Microtask: Promise")` is executed.
6. The **task queue** is processed:
    - `console.log("Task: setTimeout")` is executed.

### **Output**:

```text
Start
End
Microtask: Promise
Task: setTimeout
```

---

### **4. Why This Matters**

- Microtasks are prioritized, so they allow you to handle follow-up operations immediately after a promise resolves or a DOM mutation occurs.
- Tasks are better suited for non-urgent actions or delays.


## Nested microtasks and rendering starvation

<<< ../../workbench/frontend/javascript/checkpoints.mjs{js}

This bounded fixture produces start,end,micro-1,micro-2,micro-3,timer in the tested Node24 runtime and under the corresponding browser checkpoint rules. Newly queued microtasks are drained in that checkpoint; “await Promise.resolve()” does not necessarily give the browser an opportunity to paint or handle another task. Unbounded recursive microtasks can starve timers/input/rendering. Do not run an infinite starvation demo; use a small bounded counter when inspecting the order.

Browser rendering depends on refresh, visibility, work and host policy. rAF callbacks run around a rendering opportunity, but heavy rAF work can still miss a deadline. Node has no browser paint step and has nextTick/phase/ESM subtleties; label a Node ordering experiment with module type/runtime rather than claim every host follows a single queue diagram.


References checked2026-10-22: [HTML event loops/checkpoints/rendering](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops), [Node event loop phases](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick). The existing simple Promise/timer example remains valid within its stated scope.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/What_are_the_tasks_microtasks_177e8106c24d804f94a8c0f84060cdf2.md). All learner practice remains outstanding; the worked examples above are explanatory material.
