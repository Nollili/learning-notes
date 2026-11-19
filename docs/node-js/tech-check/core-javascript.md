---
outline: [2, 3]
---

# Core JavaScript

Objects, function calls and lexical scope explain how JavaScript code shares data in Node.js.

<!-- tech-check: t26-q01; level: 1 -->

## How do object references affect assignment and copying?

*Study depth: Foundational*

Level Up: L1 — Junior\
Tech Check level: ⭐

Source mapping: [R148](./requirements.md#r148).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Assigning an object to another variable shares the same object.** Object spread creates a new outer object and copies its own enumerable properties. **Nested object values still refer to the original nested objects.**

</div>

```js
const original = { settings: { retries: 2 } };
const copy = { ...original };
copy.settings.retries = 4;
console.log(original === copy, original.settings.retries);
```

The output is `false 4`. The outer objects have different identities and both `settings` properties point to the same object. To update that branch independently, copy it too: `{ ...original, settings: { ...original.settings } }`.

---

<!-- tech-check: t26-q02; level: 1 -->

## What determines the value of this in a function?

*Study depth: Foundational*

Level Up: L1 — Junior\
Tech Check level: ⭐

Source mapping: [R149](./requirements.md#r149).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

For an ordinary method call, **the receiver at the call site determines `this`**. Extracting the function drops that receiver. **An arrow function captures `this` from its enclosing scope.**

</div>

```js
const counter = {
  value: 3,
  read() { return this.value; }
};
const read = counter.read.bind(counter);
console.log(read());
```

Save as an ES module. The bound call prints `3`. Calling a detached `counter.read` without binding it gives the method `undefined` as its receiver in this module, and reading `this.value` throws. Use a bound callback or a wrapper such as `() => counter.read()` when passing the method to another API.

---

<!-- tech-check: t26-q03; level: 1 -->

## What does a closure capture, and when do two closures share state?

*Study depth: Foundational*

Level Up: L1 — Junior\
Tech Check level: ⭐

Source mapping: [R150](./requirements.md#r150).



<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**A closure can read and update bindings from the scope where it was created**, even after the outer function returns. Closures created in one call can share those bindings. **Each new call creates its own local bindings.**

</div>

```js
function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    read: () => count
  };
}

const first = makeCounter();
const second = makeCounter();
first.increment();
console.log(first.read(), second.read());
```

The output is `1 0`. Both functions returned by the first call see the same `count` binding, so `read` sees the increment. The second call creates a separate binding. A callback that closes over a large object can keep it reachable while the callback is registered, so release subscriptions when their work ends.

[Homework on closures, races and cleanup](../../practice/frontend/f03-javascript.md).
