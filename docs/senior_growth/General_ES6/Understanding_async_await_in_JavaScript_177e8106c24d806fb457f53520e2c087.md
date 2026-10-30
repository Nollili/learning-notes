# Understanding async/await in JavaScript {#understanding-async-await-in-javascript}

`async/await` is a modern way to handle asynchronous code in JavaScript, introduced in ES2017. It’s built on top of Promises and provides a way to write asynchronous code that looks and behaves like synchronous code.

---

### **The Basics of `async/await`** {#_1-the-basics-of-async-await}

### **What is `async`?**

- The `async` keyword is used to define an asynchronous function.
- An `async` function always returns a **Promise**, even if you don’t explicitly return one.

### **What is `await`?**

- await suspends an async function until the awaited value settles; rejection throws at that expression. It also works at the top level of an ES module (ES2022), but not an ordinary classic script/CJS top level.
- It makes your code easier to read by avoiding `.then` chains.

---

### **How `async/await` Works** {#_2-how-async-await-works}

Here’s a simple example:

```jsx
async function fetchData() {
  console.log("Fetching data...");
  const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
  if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}`); }
  const data = await response.json();
  console.log("Data fetched:", data);
}

fetchData().catch(console.error);
```

### **What Happens Here**:

1. `fetchData` is declared as an `async` function.
2. The `fetch` API is called, and the function pauses at `await fetch(...)` until the Promise resolves.
3. Once resolved, the result is stored in `response`, and the function continues.
4. Another `await` is used to process the `response` as JSON.
5. Finally, the data is logged.

---

### **Error Handling in `async/await`** {#_3-error-handling-in-async-await}

When using `async/await`, you can handle errors with a `try...catch` block:

```jsx
async function fetchDataWithErrorHandling() {
  try {
    const response = await fetch("https://nonexistenturl.com");
    if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}`); }
  const data = await response.json();
    console.log("Data fetched:", data);
  } catch (error) {
    console.error("An error occurred:", error instanceof Error ? error.message : String(error));
  }
}

fetchDataWithErrorHandling();
```

### **Why Use `try...catch`?**

- It simplifies error handling compared to chaining `.catch()` when using Promises.
- Errors from any `await` statement in the `try` block can be caught.

---

### **Real-Life Example: `async/await` in Action** {#_4-real-life-example-async-await-in-action}

### **Fetching Multiple Resources**:

```jsx
async function fetchMultiple() {
  try {
    const [userResponse, postsResponse] = await Promise.all([
      fetch("https://jsonplaceholder.typicode.com/users/1"),
      fetch("https://jsonplaceholder.typicode.com/posts?userId=1"),
    ]);

    if (!userResponse.ok || !postsResponse.ok) {
      await Promise.allSettled([userResponse.body?.cancel(), postsResponse.body?.cancel()]);
      throw new Error("One resource returned an HTTP failure");
    }
    const user = await userResponse.json();
    const posts = await postsResponse.json();

    console.log("User:", user);
    console.log("Posts:", posts);
  } catch (error) {
    console.error("Error fetching data:", error instanceof Error ? error.message : String(error));
  }
}

fetchMultiple();
```

### **What’s Happening**:

1. `Promise.all` is used to run multiple `fetch` calls in parallel.
2. `await` pauses until both Promises resolve.
3. The results are processed as JSON and logged.

---

### **Key Points to Remember** {#_5-key-points-to-remember}

1. **Async Functions Always Return Promises**:
    
    ```jsx
    async function example() {
      return "Hello!";
    }
    
    example().then(console.log); // Logs: "Hello!"
    ```
    
2. **Await context matters**:
    - Use it inside async functions or at ES-module top level. A non-async nested function does not inherit permission to await. Module top-level await delays dependent module evaluation; avoid accidental startup cycles.
3. **Blocking Behavior**:
    - `await` pauses the execution of the current function but doesn’t block the entire program.

---

### **Comparing `async/await` with Promises** {#_6-comparing-async-await-with-promises}

### **Using Promises**:

```jsx
fetch("https://jsonplaceholder.typicode.com/posts/1")
  .then(async response => {
    if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}`); }
    return response.json();
  })
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

### **Using `async/await`**:

```jsx
async function fetchData() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
    if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}`); }
  const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

fetchData().catch(console.error);
```

- **`async/await` is cleaner and easier to read**, especially when handling multiple asynchronous steps.

---

### **When to Use `async/await`?** {#_7-when-to-use-async-await}

- Use `async/await` when you want more readable and maintainable code for asynchronous operations.
- It’s particularly useful when you need to process a sequence of asynchronous steps that depend on each other.
## Total lifetimes and failure-aware concurrent work

The short examples above explain syntax and HTTP status; a complete caller also needs deadlines/body-size limits, parsed output and cancellation. Fetch fulfills on headers even if the body is still pending. HTTP404/500 does not reject fetch by itself. Independent work can overlap, but Promise.all rejection alone leaves other work running.

```js
async function loadJsonPair(urls, parentSignal) {
  if (urls.length !== 2) throw new RangeError('Exactly two URLs required');
  const controller = new AbortController();
  const signal = AbortSignal.any([
    controller.signal, AbortSignal.timeout(5_000),
    ...(parentSignal ? [parentSignal] : []),
  ]);
  const jobs = urls.map(async url => {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json(); // Deadline remains active through body consumption.
  });
  try { return await Promise.all(jobs); }
  catch (error) {
    controller.abort(error);
    await Promise.allSettled(jobs); // Drain before handing resource ownership back.
    throw error;
  } finally { controller.abort(); }
}
```

This Node22.7+/24-compatible example uses AbortSignal.any/timeout; check browser API support separately. It is intentionally bounded to two requests; a large collection needs the foundations limiter/producer queue. JSON parsing remains synchronous once bytes are assembled and must not accept arbitrarily large bodies. If dependencies ignore cancellation, they need their own finite driver deadlines. User cancellation is not a reason to retry a write; a timed-out remote write can already have completed.


Official references: [Node ESM top-level await](https://nodejs.org/api/esm.html#top-level-await), [Node AbortSignal](https://nodejs.org/api/globals.html#class-abortsignal), [ECMAScript async functions](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-asyncfunction-objects). Checked2026-10-20. The bounded limiter and total-body budget lesson is in [Node foundations](../../node-js/module-01-nodejs-foundations.md).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/Understanding_async_await_in_JavaScript_177e8106c24d806fb457f53520e2c087.md). All learner practice remains outstanding; the worked examples above are explanatory material.
