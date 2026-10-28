### What is Observable and Observers? How does it work? What are the similarities, differences against Promise? When to use which?

### **1. What is an Observable?**

An **Observable** is a data structure in reactive programming that represents a sequence of data or events that can be observed over time. Observables are used in frameworks like **RxJS** (commonly with Angular) to handle asynchronous programming.

- **Key Features**:
    - Emits multiple values over time (e.g., stream of events).
    - Can be synchronous, asynchronous, or both.
    - Producers of data/events in a stream.

### **2. What is an Observer?**

An **Observer** is an object that subscribes to an Observable to receive emitted data, errors, or completion notifications. Observers are essentially consumers of the data stream.

- **Observer Interface**:
    - `next(value)`: Receives the next emitted value.
    - `error(err)`: Receives an error if one occurs in the Observable.
    - `complete()`: Called when the Observable completes and no further data will be emitted.

---

### **How Observables and Observers Work**

1. **Creation**: An Observable is created using libraries like RxJS or manually using `new Observable()`.
2. **Subscription**: An Observer subscribes to the Observable using `.subscribe()`.
3. **Emission**: The Observable emits data or events over time.
4. **Notification**:
    - The Observer’s `next()` method is called with each emitted value.
    - If an error occurs, the `error()` method is triggered.
    - When the Observable completes, the `complete()` method is invoked.

### **Example**:

```jsx
import { Observable } from 'rxjs';

// Create an Observable
const observable = new Observable((subscriber) => {
  subscriber.next(1); // Emit a value
  subscriber.next(2);
  subscriber.complete(); // Signal completion
});

// Subscribe to the Observable
observable.subscribe({
  next: (value) => console.log(`Received: ${value}`),
  error: (err) => console.error(`Error: ${err}`),
  complete: () => console.log('Completed'),
});

```

---

### **Observable vs. Promise**

| **Aspect** | **Observable** | **Promise** |
| --- | --- | --- |
| **Emissions** | Emits multiple values over time | Resolves to a single value |
| **Cancellation** | Unsubscribe stops notifications; underlying work stops only through implemented teardown | No built-in cancellation; the operation can support a separate AbortSignal |
| **Lazy/Eager** | A cold producer can start per subscription; hot/shared sources may already be running | new Promise executor runs immediately; a function may defer creating the operation |
| **Delivery** | Push notifications; not automatically demand/backpressure aware | One eventual settlement observed through scheduled reactions; not a pull-stream protocol |
| **Methods** | Rich operators (e.g., map, filter, merge) | Limited chaining methods (`then`, `catch`) |
| **Control** | Subscription/teardown and operator policy; producer may still ignore cancellation | Operation lifecycle is separate from promise settlement |
| **Error Handling** | Errors can be handled in streams | Handled via `catch` or `try-catch` |

---

### **When to Use Observable vs. Promise**

### **Use Observable When**:

1. **Multiple Emissions**: For data streams or event-based systems (e.g., user input, WebSocket messages).
2. **Real-time Data**: For continuous updates, like live stock prices or chat applications.
3. **Cancelation**: When an owned producer/adapter implements teardown that aborts the underlying operation.
4. **Complex Data Pipelines**: When you need to process data streams with operators (e.g., combining or filtering streams).

### **Use Promise When**:

1. **Single Value**: For one-time operations (e.g., an HTTP request or file read).
2. **Simple ownership**: One bounded async operation is enough; defer its creation in a function when needed.
3. **Simple Error Handling**: When handling errors in a straightforward manner suffices.
4. **Browser API Integration**: Many modern browser APIs (e.g., `fetch`, `async/await`) use Promises natively.

---

### **Observable Example: Real-time Stock Prices**

```jsx
import { interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

const stockPrices = interval(1000).pipe(
  map((val) => ({ price: 100 + val })), // Simulate stock price changes
  take(5) // Emit 5 values
);

stockPrices.subscribe({
  next: (price) => console.log(`Stock Price: $${price.price}`),
  complete: () => console.log('Stream ended'),
});

```

### **Promise example: owned HTTP data**

Use the [bounded HTTP adapter](../State_management_and_Redux/What_are_middlewares,_how_to_handle_asynchronous_actions.md#primary-http-flow-bounded-adapter-plus-request-owner) with an explicit AbortSignal, checked status/media/schema, size cap and safe errors. A successful fetch promise alone does not imply HTTP200 or valid JSON. Observe the returned promise and handle failure/cancellation at the caller.

---

### **When to Combine Both**

In some scenarios, Promises and Observables can complement each other:

- from(promise) observes an already-created promise; it does not restart/cancel its underlying work. A factory/defer can create work per subscription. RxJS7.8.2 deprecates toPromise: use firstValueFrom or lastValueFrom with an explicit completion/timeout policy.

## Bounded conversion and owned teardown

<<< ../../workbench/engineering/design/observables/bounded-observable-promises.ts{ts}

firstValueFrom unsubscribes after the first value, including0; lastValueFrom waits for completion. take(3) caps emissions but alone does not terminate a silent source, so the timeout matters. Empty completion rejects with EmptyError unless an explicitly meaningful defaultValue is supplied. A source error rejects the promise; callers must catch it. These timer budgets cannot preempt a synchronous producer blocking the JavaScript event loop. Cancellation of an external await still needs an operation/subscription owner, not an assumption that promises can be cancelled.

<<< ../../workbench/engineering/design/observables/owned-observable.ts{ts}

These are cold wrappers: each subscription owns one registration/controller and teardown. A Subject is hot: next can happen with no subscribers and is not replayed to late subscribers unless a replaying abstraction is chosen. Sharing/replay operators change ownership: one consumer leaving must not unexpectedly stop another's work. A controller abort request does not force an ignoring library/promise to stop or undo a committed write; this wrapper also prevents late notifications after unsubscribe. RxJS subscription disposal is not automatic stream backpressure.


Validated baseline RxJS7.8.2/TypeScript5.9.3/Node24.18.0. Official references checked2026-10-22: [RxJS Observable guide](https://rxjs.dev/guide/observable), [promise conversion deprecation](https://rxjs.dev/deprecations/to-promise), [firstValueFrom official source](https://github.com/ReactiveX/rxjs/blob/7.8.2/src/internal/firstValueFrom.ts). The installed7.8.2 package source/declarations were inspected because the documentation site's text requires JavaScript.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/design/What_is_Observable_and_Observers._How_does_it_work._What_are_the_similarities%2C_differences_against_Promise._When_to_use_which.md). All learner practice remains outstanding.
