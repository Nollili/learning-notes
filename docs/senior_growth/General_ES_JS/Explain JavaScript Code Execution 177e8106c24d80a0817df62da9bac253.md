### Explain JavaScript Code Execution

JavaScript code execution involves several steps that are managed by the **JavaScript Engine**, which is responsible for interpreting and running the code. The process involves various components like **Call Stack**, **Heap**, **Event Loop**, **Execution Context**, and **Memory Management**.

Let’s break down the process to understand how JavaScript executes code from start to finish.

---

### **1. JavaScript Execution Context**

https://www.youtube.com/watch?v=zdGfo6I1yrA&ab_channel=LydiaHallie

Before diving into the flow, it’s important to understand **Execution Context**. Every time a function is invoked or code is executed in JavaScript, an **execution context** is created. It contains information about the environment in which the code is running, including variable scope, function declarations, and the `this` keyword.

An **execution context** has three main components:

- **Variable Object (VO)**: Holds variables and function declarations.
- **Scope Chain**: Keeps track of the current variable scope, which allows JavaScript to access variables in parent scopes.
- **`this` Keyword**: Refers to the current execution context, i.e., the object that is executing the current piece of code.

There are three types of execution contexts:

1. **Global Execution Context (GEC)**: The default or outermost context where the code starts running. There is only one global execution context.
2. **Function Execution Context (FEC)**: Created every time a function is called.
3. **Eval Execution Context**: Created when using `eval()` (though it is generally not recommended to use).

When JavaScript code starts running, it starts with the **Global Execution Context**.

---

### **2. The Call Stack**

The **Call Stack** is a stack data structure that keeps track of all the execution contexts (i.e., function calls) in the correct order. It follows the **Last In, First Out (LIFO)** principle, meaning the last function called is the first one to be executed.

- When a function is called, a new **execution context** is pushed onto the call stack.
- When a function finishes executing, its execution context is popped off the stack, and control goes back to the previous execution context.

### **Call Stack Example:**

```jsx
function first() {
  console.log('First function');
  second();
}

function second() {
  console.log('Second function');
}

first();
```

1. The global execution context is created and pushed onto the stack.
2. The `first()` function is called, so a new execution context for `first()` is pushed onto the stack.
3. Inside `first()`, the `second()` function is called, so a new execution context for `second()` is pushed onto the stack.
4. `second()` finishes, and its execution context is popped off the stack.
5. `first()` finishes, and its execution context is popped off the stack.
6. The global execution context finishes, and the stack is empty.

---

### **3. The Heap**

https://www.youtube.com/watch?v=5OJRqkYbK-4&t=79s&ab_channel=AlexHyett

The **Heap** is an area in memory where objects are stored. It is used for dynamic memory allocation for objects, arrays, and other complex data types in JavaScript.

- When you create objects or arrays, they are stored in the heap.
- Unlike the stack, the heap doesn’t follow a strict LIFO order; instead, it’s a large pool where memory is dynamically allocated and freed.

For example, when you create a large object like an array or a function, the object is stored in the heap, while references to those objects are stored in the stack.

```jsx
let arr = [1, 2, 3];  // `arr` is stored in the stack, but the array is stored in the heap.
```

---

### **4. The Event Loop**

https://www.youtube.com/watch?v=lqLSNG_79lI&ab_channel=JamesQQuick

JavaScript is **single-threaded**, meaning it executes one task at a time. However, it can handle asynchronous code like `setTimeout()`, network requests, or event listeners without blocking the main thread. This is achieved using the **Event Loop** and **Callback Queue**.

Here’s how the **Event Loop** works:

1. **Call Stack**: JavaScript first executes all the tasks in the **Call Stack** (functions, code) one by one.
2. **Web APIs (Asynchronous APIs)**: When an asynchronous operation is encountered (like `setTimeout`, `fetch`, or an event listener), it is sent to the browser's Web API environment (outside of the JavaScript engine).
3. **Callback Queue**: Once the asynchronous task is completed (e.g., a `setTimeout` expires or a network request returns), its callback function is placed in the **Callback Queue**.
4. **Event Loop**: The **Event Loop** constantly checks if the **Call Stack** is empty. If it is, it moves the callback from the **Callback Queue** to the **Call Stack** for execution.

### **Event Loop Example:**

```jsx
console.log('Start');  // Synchronous task

setTimeout(function() {
  console.log('Timeout 1');  // Asynchronous task
}, 0);

setTimeout(function() {
  console.log('Timeout 2');  // Asynchronous task
}, 0);

console.log('End');  // Synchronous task
```

**Execution Order:**

1. `Start` is logged.
2. The first `setTimeout` is sent to the Web API, and the callback is placed in the Callback Queue after 0 ms.
3. The second `setTimeout` is sent to the Web API, and the callback is placed in the Callback Queue after 0 ms.
4. `End` is logged.
5. The **Call Stack** is empty, so the Event Loop picks the first callback (`Timeout 1`) from the Callback Queue and places it in the Call Stack to execute.
6. `Timeout 1` is logged.
7. The Event Loop picks the second callback (`Timeout 2`) from the Callback Queue and places it in the Call Stack to execute.
8. `Timeout 2` is logged.

**Output:**

```sql
Start
End
Timeout 1
Timeout 2
```

Notice that even though `setTimeout` was set to 0 milliseconds, the callbacks were executed after all synchronous code (`console.log('Start')` and `console.log('End')`).

---

### **5. Memory Management and Garbage Collection**

https://www.youtube.com/watch?v=FZ42HMWG6xg&ab_channel=DanShykhov

JavaScript automatically handles memory management, and it has a **Garbage Collector** that reclaims memory that is no longer in use. It does this by identifying objects that are no longer referenced and freeing up memory to avoid memory leaks.

- When an object is no longer reachable (no reference to it exists), the garbage collector will mark it for cleanup and free the memory.

---

### **6. Execution Phases in Detail**

https://www.youtube.com/watch?v=UmcJktbZOGM&ab_channel=procademy

The **execution of JavaScript** can be divided into phases:

### **1. Compilation Phase:**

- JavaScript first parses the entire code and compiles it. This includes:
    - **Hoisting**: JavaScript moves **declarations** (variables and functions) to the top of their respective scopes.
    - **Creation of Execution Context**: The code is divided into different execution contexts (Global, Function).

### **2. Execution Phase:**

- After compilation, JavaScript starts executing the code:
    - **Global Execution Context** is executed first.
    - When a function is invoked, a new **Function Execution Context** is created and pushed onto the Call Stack.

---

### **Summary of the Execution Process:**

1. **Compilation Phase**:
    - Code is parsed, and **execution contexts** are created.
    - **Declarations** are hoisted (variables and functions).
2. **Execution Phase**:
    - The **Call Stack** starts running the code, executing synchronously.
    - If an **asynchronous task** is encountered, it’s sent to the **Web API**, and its callback is placed in the **Callback Queue** when ready.
    - The **Event Loop** checks if the **Call Stack** is empty and moves tasks from the **Callback Queue** to the **Call Stack** for execution.
3. **Garbage Collection**:
    - Unused variables and objects are cleaned up by the **Garbage Collector**.

---

### **Conclusion**

- **Call Stack**: Handles synchronous code execution.
- **Heap**: Stores objects and arrays.
- **Event Loop**: Allows asynchronous code to be handled without blocking the main thread.
- **Execution Context**: Manages the environment for the execution of code.
- **Garbage Collection**: Cleans up unused memory.

This mechanism ensures that JavaScript can handle both synchronous and asynchronous tasks efficiently while maintaining a single-threaded execution model.