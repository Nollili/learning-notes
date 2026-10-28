# What is RxJS?

## 🔹 RxJS (Reactive Extensions for JavaScript)

**RxJS** is a **reactive programming library** for JavaScript that allows you to work with **asynchronous data streams** using **observables**. It is widely used in modern front-end frameworks like **Angular**, and can also be used with React, Vue, or vanilla JS.

---

## 1️⃣ Core Concepts

### 1.1 Observables
- Represents a **stream of data over time**.
- Can emit:
  - **Next values** → new data
  - **Error** → error event
  - **Complete** → stream finished
- Similar to **Promises**, but can emit **multiple values** instead of just one.

```javascript
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});

observable.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log('Done')
});
```

**Output:**

```
1
2
Done
```

---

### 1.2 Observers

* **Observers** are consumers of observables.
* Implement the **callback methods**:

  * `next()`
  * `error()`
  * `complete()`

---

### 1.3 Operators

Operators allow you to **transform, filter, combine, and manage streams**.

* **Creation operators**: `of()`, `from()`, `interval()`
* **Transformation operators**: `map()`; pluck is deprecated in RxJS7.8.2, use map with explicit property access/optional chaining instead
* **Filtering operators**: `filter()`, `take()`
* **Combination operators**: `merge()`, `concat()`, `combineLatest()`
* **Error handling operators**: `catchError()`, `retry()`

```javascript
import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

of(1, 2, 3, 4)
  .pipe(
    filter(x => x % 2 === 0),
    map(x => x * 10)
  )
  .subscribe(console.log);
```

**Output:**

```
20
40
```

---

### 1.4 Subjects

* A **Subject** is both an **observable and an observer**.
* Useful for **multicasting** values to multiple subscribers.

```javascript
import { Subject } from 'rxjs';

const subject = new Subject();
subject.subscribe(value => console.log('Subscriber 1:', value));
subject.subscribe(value => console.log('Subscriber 2:', value));

subject.next(10);
```

**Output:**

```
Subscriber 1: 10
Subscriber 2: 10
```

---

## 2️⃣ Why Use RxJS?

* Handles **complex asynchronous flows**: HTTP requests, WebSocket streams, UI events.
* **Declarative programming** → define how data flows.
* **Composable operators** → transform streams without nesting callbacks.
* Reduces **callback hell** in async programming.
* Integrates naturally with **Angular's HttpClient, Forms, and Event handling**.

---

## 3️⃣ Pros and Cons

| Pros                                                 | Cons                                           |
| ---------------------------------------------------- | ---------------------------------------------- |
| Simplifies **async data handling**                   | Steep **learning curve**                       |
| **Composes multiple streams** easily                 | Can be **overkill** for small projects         |
| Reduces **nested callbacks / Promise chains**        | Debugging operators can be tricky              |
| Powerful operators for filtering, mapping, combining | Requires understanding **observables concept** |

---

### ✅ Summary

* **RxJS** = Reactive programming + Observables + Operators.
* Ideal for **asynchronous streams** of events or data.
* Commonly used in **Angular**, but can be applied anywhere JS async programming is needed.
* Helps **avoid callback hell**, makes code more declarative, composable, and testable.

> 💡 Senior Tip:
> Use **RxJS** when dealing with **multiple streams** or **complex async workflows**. For simple async tasks, Promises or async/await may be simpler and more readable.


## Keep request recovery inside the request stream

For this optional introduction, reuse the [owned cold adapter](../EngX_Quality/What_is_Observable_and_Observers._How_does_it_work._What_are_the_similarities,_differences_against_Promise._When_to_use_which.md#bounded-conversion-and-owned-teardown). Put the two files in the same isolated lab directory. The primary app can still use Toolkit/Promises; this alternative demonstrates cancellation and recovery without requiring a second full architecture.

<<< ../../workbench/engineering/specialists/rxjs/latest-results.ts{ts}

switchMap unsubscribes the previous inner subscription when a new key arrives, triggering this adapter's abort request. A late ignored result cannot be delivered through that closed subscriber. catchError is inside the per-key inner stream, so one request failure becomes a safe failed result and later keys remain usable. An outer catchError returning a single fallback can instead replace/complete the entire input pipeline. Key parsing, HTTP status/schema/size/deadline and tenant policy still belong to the injected load adapter; a new key is not authorization.

The consumer owns the final subscription and calls unsubscribe on feature disposal. A completed outer key stream waits for its current inner request; it does not mean every inner operation is immediately cancelled. The per-request timeout bounds cooperative async waiting, not synchronous blocking computation. Bound event rates/queues and choose switchMap/concatMap/mergeMap/exhaustMap according to cancellation/order/concurrency semantics; do not use switchMap as a blanket automatic-write cancellation strategy. retry repeats a subscription and can duplicate side effects; use explicit budgets/idempotency before adopting it.


References checked2026-10-22 against RxJS7.8.2 installed source/types: [pluck deprecation](https://rxjs.dev/api/operators/pluck), [catchError placement](https://rxjs.dev/api/operators/catchError), [switchMap](https://rxjs.dev/api/operators/switchMap), [official source](https://github.com/ReactiveX/rxjs). No arbitrary retry, raw error payload or background timer is required by these examples.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/specialists/What_is_RxJS.md). All learner practice remains outstanding.
