### What are the tasks / microtasks?

In JavaScript, tasks and microtasks are part of the **event loop** mechanism and determine how asynchronous code is executed. Understanding their differences is crucial to mastering how JavaScript works behind the scenes.

![](https://miro.medium.com/v2/resize:fit:1400/1*XVqPA2z1dTHJWm2TwIAsBw.gif)

---

### **1. Tasks (Macrotasks)**

### **Definition**:

- Tasks, also called **macrotasks**, are pieces of code that are scheduled to run later after the current stack is cleared.
- Examples of tasks:
    - `setTimeout`
    - `setInterval`
    - `setImmediate` (Node.js)
    - I/O operations (like file reading in Node.js)
    - UI rendering tasks (in browsers)

### **How They Work**:

1. Tasks are queued in the **task queue**.
2. After the **call stack** is empty, the event loop picks the first task from the task queue and executes it.
3. Once executed, the event loop moves to the next task in the queue.

---

### **2. Microtasks**

### **Definition**:

- Microtasks are smaller, high-priority tasks that are executed before the next task in the queue.
- They always run immediately after the currently executing JavaScript code and before any pending tasks.
- Examples of microtasks:
    - `Promise` callbacks (`.then`, `.catch`, `.finally`)
    - `MutationObserver` (used for DOM changes)
    - `queueMicrotask` (a browser API to schedule microtasks)

### **How They Work**:

1. When a microtask is scheduled, it goes into the **microtask queue**.
2. After the currently executing code in the **call stack** completes, the event loop checks the **microtask queue** and executes all the microtasks in order.
3. Only when the microtask queue is empty does the event loop pick the next task from the **task queue**.

---

### **Key Difference: Task vs. Microtask**

| Feature | **Tasks (Macrotasks)** | **Microtasks** |
| --- | --- | --- |
| **Priority** | Lower | Higher |
| **Execution Timing** | After the call stack is cleared | Immediately after the current stack |
| **Examples** | `setTimeout`, `setInterval` | Promises, `queueMicrotask` |
| **Use Case** | Delayed execution, animations | Critical small tasks, chaining ops |

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

```vbnet
Start
End
Microtask: Promise
Task: setTimeout
```

---

### **4. Why This Matters**

- Microtasks are prioritized, so they allow you to handle follow-up operations immediately after a promise resolves or a DOM mutation occurs.
- Tasks are better suited for non-urgent actions or delays.