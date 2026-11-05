---
outline: [2, 3]
---

# Design patterns in Node.js applications

These questions use **plain JavaScript functions and explicit dependencies** alongside the [Express catalog](./16-frameworks.md#application-frameworks). Examples run as `.mjs` on Node.js24.18.0 using built-in modules only. They teach intermediate pattern selection and troubleshooting; deeper distributed architecture remains in its own scope.


## Full worked catalogue

All **23 GoF patterns** have explanations, worked code, failure cases, alternatives and practical acceptance at intermediate depth. This overview retains the original four questions; the focused pages expand the remaining patterns without duplicating Adapter/Decorator or Strategy/Observer.

- [Creational patterns](./patterns/creational.md): construction hooks, product families, builders, cloning and scoped single instances.
- [Structural patterns](./patterns/structural.md): independent variation, trees, subsystem entry points, shared intrinsic state and access proxies.
- [Behavioral workflows](./patterns/behavioral-workflows.md): handler chains, commands, coordination, state transitions and workflow skeletons.
- [Behavioral data and traversal](./patterns/behavioral-data.md): bounded expressions, iterators, opaque history and visitors.

| Pattern | Worked lesson |
|---|---|
| Factory Method | [Explanation, example and practice](./patterns/creational.md#t18-q05) |
| Abstract Factory | [Explanation, example and practice](./patterns/creational.md#t18-q06) |
| Builder | [Explanation, example and practice](./patterns/creational.md#t18-q07) |
| Prototype | [Explanation, example and practice](./patterns/creational.md#t18-q08) |
| Singleton | [Explanation, example and practice](./patterns/creational.md#t18-q09) |
| Adapter | [Explanation, example and practice](./18-patterns.md#t18-q03) |
| Bridge | [Explanation, example and practice](./patterns/structural.md#t18-q10) |
| Composite | [Explanation, example and practice](./patterns/structural.md#t18-q11) |
| Decorator | [Explanation, example and practice](./18-patterns.md#t18-q03) |
| Facade | [Explanation, example and practice](./patterns/structural.md#t18-q12) |
| Flyweight | [Explanation, example and practice](./patterns/structural.md#t18-q13) |
| Proxy | [Explanation, example and practice](./patterns/structural.md#t18-q14) |
| Chain of Responsibility | [Explanation, example and practice](./patterns/behavioral-workflows.md#t18-q15) |
| Command | [Explanation, example and practice](./patterns/behavioral-workflows.md#t18-q16) |
| Interpreter | [Explanation, example and practice](./patterns/behavioral-data.md#t18-q17) |
| Iterator | [Explanation, example and practice](./patterns/behavioral-data.md#t18-q18) |
| Mediator | [Explanation, example and practice](./patterns/behavioral-workflows.md#t18-q19) |
| Memento | [Explanation, example and practice](./patterns/behavioral-data.md#t18-q20) |
| Observer | [Explanation, example and practice](./18-patterns.md#t18-q04) |
| State | [Explanation, example and practice](./patterns/behavioral-workflows.md#t18-q21) |
| Strategy | [Explanation, example and practice](./18-patterns.md#t18-q04) |
| Template Method | [Explanation, example and practice](./patterns/behavioral-workflows.md#t18-q22) |
| Visitor | [Explanation, example and practice](./patterns/behavioral-data.md#t18-q23) |

Material completion is separate from practice. Do not implement every pattern in one application; choose a justified variation point and preserve its contract.

### How do you choose a design pattern, and what do the three families mean? {#t18-q01}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A design pattern names a recurring design problem, the roles that solve it and its trade-offs. **Creational patterns organize construction, structural patterns organize composition, and behavioral patterns organize collaboration.** Choose one for an actual variation or ownership problem. **A pattern name does not prove the implementation preserves its contract.**

</div>

<span class="notes-section-label">**Reason from a concrete change**</span>

Our catalog already has router → controller → service → repository factories. Now one storage provider returns a different representation, pricing rules change independently, and read outcomes need observation. These are distinct pressures:

| Change | Candidate | What stays stable | Cost to consider |
|---|---|---|---|
| Construct an isolated application with selected dependencies | Factory/composition boundary | Callers receive the agreed capabilities | More wiring; resource disposal still needs an owner |
| Integrate a provider's incompatible read interface | Adapter | Application reader contract | Mapping and failure semantics must be maintained |
| Observe an existing reader without changing consumers | Decorator | Reader inputs/results/errors | Wrapper ordering and extra execution |
| Replace a pricing algorithm | Strategy | Quote operation and result contract | Selection still exists; multiple algorithms need tests |
| Notify optional local listeners | Observer | Publisher need not name each listener | Delivery/error/lifetime coupling still exists |

Before refactoring, write a failing behavior or change scenario, identify what changes independently, state the boundary contract, and compare a direct implementation with the proposed pattern. Preserve tests for results, failures, mutation and cleanup. Keep the simpler design when both meet the requirement. A two-case switch can be clearer than five classes.

<span class="notes-section-label">**Patterns are not interchangeable labels**</span>

Factory Method is a particular creation hook in a creator's workflow; a function named `createService` is usually a simple factory, not automatically that GoF pattern. An Adapter changes the interface/representation; a Decorator adds behavior through the interface it promises to preserve. A Strategy supplies an interchangeable algorithm; State changes behavior according to an object's current state and allowed transitions.

The classic [GoF catalogue](https://www.pearson.com/en-us/subject-catalog/p/design-patterns-elements-of-reusable-object-oriented-software/P200000009480/9780321700698) contains23 object-oriented patterns. JavaScript can express many roles with functions, closures and objects; **classes are an implementation choice, not the requirement**. ESM encapsulation, dependency injection, middleware and Repository are useful related techniques, but they are not additional members of those23. One design may have more than one role; explain its intent instead of counting labels.

For Express, factories connect collaborators explicitly. Nest's provider container can wire a factory or strategy; its `@Controller`/`@Injectable` syntax does not by itself demonstrate the object Decorator pattern. Framework interception can resemble decoration but has its own lifecycle contract.

<span class="notes-section-label">**Common mistakes**</span>

- Choosing a pattern before identifying the change or invariant it addresses.
- Assuming matching method names imply matching authorization, errors, transactions or cancellation.
- Treating a local singleton as coordination across replicas.
- Extracting similar-looking code that represents independently changing business rules.
- Measuring quality by the number of abstractions instead of explainability and preserved behavior.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Where does the selection switch go after introducing Strategy?**</span> Usually at a request/application composition boundary. The algorithm's consumer need not contain that selection.
2. <span class="notes-section-label">**Can a plain function implement a GoF idea?**</span> Yes, when it expresses the relevant roles and contract. Do not rename every callback Strategy without explaining the family of algorithms.
3. <span class="notes-section-label">**Does a repository abstraction make persistence interchangeable?**</span> Only if adapters preserve the behavior callers rely on, including ownership, concurrency and failure semantics.

::: tip Key takeaway
Name the changing responsibility, the stable contract and the cost before naming the pattern.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Choose one real catalog change. Write a short decision comparing a direct solution with a pattern. Acceptance: identify an invariant, a failure test, the variation point, one rejected alternative and how the design could be simplified later. Do not invent a requirement merely to justify a pattern.

<span class="notes-section-label">**References**</span>

[Existing design-decision context](../../engineering/design.md), [existing pattern pitfalls](../../senior_growth/Coding_principles_patterns_conventions/What_are_the_common_pitfalls_when_applying_a_design_pattern.md), [official Nest custom-provider mechanics](https://docs.nestjs.com/fundamentals/custom-providers). Pattern selection here is a reasoned design interpretation, not a framework mandate or an official detailed examination rubric.

---

### When should you use a factory, builder or singleton, and who owns the created state? {#t18-q02}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Use a factory to construct a coherent capability and make its dependencies/lifetime explicit. **Creating an object does not establish ownership of everything it references.** A builder helps with meaningful construction steps; a singleton deliberately shares one instance within a defined scope. **Neither a singleton nor module caching creates shared state across processes.**

</div>

<span class="notes-section-label">**The creational family**</span>

| GoF pattern | Main intent | Node-oriented example or limit |
|---|---|---|
| Factory Method | A creator's workflow delegates creation to an overridable method | A reusable import workflow lets a subclass choose its parser; a simple function is often sufficient |
| Abstract Factory | Create a compatible family of collaborators | A storage family produces matching reader/writer capabilities with one explicit backend contract |
| Builder | Assemble a complex product through deliberate steps | A validated report specification with independent output snapshots; not every options object needs fluent methods |
| Prototype | Create from an existing exemplar by a defined copying policy | Copy a supported data template; distinguish copying from JS prototype delegation |
| Singleton | One instance and an access point within the intended scope | Application-owned shared configuration; avoid hidden request-specific state |

A simple factory is a useful creation idiom outside the exact GoF list. Use the [existing Factory Method and builder comparisons](../../senior_growth/Coding_principles_patterns_conventions/What_kind_of_creational_design_patterns_do_you_know.md#ownership-and-creation-checks) for subclass/clone contrasts. Start with explicit composition rather than introduce inheritance solely to fit a name.

<span class="notes-section-label">**Worked example — an owned product-reader factory**</span>

This reader is deliberately bounded to100 fixture products. It is a small standalone read capability, not a replacement for the catalog's authenticated service. Save the following as `owned-reader.mjs`:

```js
// file: owned-reader.mjs
export function createOwnedReader(rows) {
  if (!Array.isArray(rows) || rows.length > 100) throw new TypeError('Bounded rows required');
  const store = new Map();
  for (const row of rows) {
    if (!row || typeof row.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(row.id) ||
        typeof row.name !== 'string' || row.name.length < 1 || row.name.length > 80 ||
        !Number.isSafeInteger(row.unitPriceCents) || row.unitPriceCents < 1 ||
        row.unitPriceCents > 1_000_000 || store.has(row.id)) {
      throw new TypeError('Invalid or duplicate fixture product');
    }
    store.set(row.id, Object.freeze({
      id: row.id, name: row.name, unitPriceCents: row.unitPriceCents
    }));
  }
  let closed = false;
  return Object.freeze({
    async get(id) {
      if (closed) throw new Error('Reader closed');
      if (typeof id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(id)) throw new TypeError('Invalid id');
      const row = store.get(id);
      return row ? { ...row } : null;
    },
    close() { closed = true; store.clear(); }
  });
}
```

The factory projects three primitive fields into private storage, so later mutation of the input array/rows cannot change its products. Each call creates a new Map. Reads return a fresh DTO; freezing the public capability does not itself freeze hidden Map state. Repeated close is safe, and later reads reject. A missing product is `null`; invalid input and a closed capability are distinct failures.

This copying policy is enough only because the retained fields are primitives. Spread and `Object.freeze` are shallow. Adding nested metadata requires an explicit validation/copy/freeze policy; `Object.create(source)` establishes delegation rather than a snapshot. `structuredClone` supports many data values but is not an arbitrary behavior/class copier.

<span class="notes-section-label">**Apply it to the framework app**</span>

The [catalog composition factory](./16-frameworks.md#t16-q11) already assembles repository, service, controllers and router. Create a real database pool once at an intended application boundary; close it from the owner that acquired it. A failed construction path must dispose of resources acquired before failure. Injecting an externally owned pool does not automatically transfer permission to close it.

A module-exported object may be shared by consumers of the same loaded module instance, but separate worker/process contexts and replicas have separate memory. Cache identity also depends on module resolution/loading. Keep the authenticated actor in explicit request arguments; never overwrite `singleton.currentUser` for concurrent requests. Nest's default provider lifetime is application-context sharing, with request/transient scopes available deliberately.

<span class="notes-section-label">**Common mistakes and alternatives**</span>

A builder returning its mutable internal object lets later setter calls modify an earlier result. Return a validated independent result or document one-shot transfer. A factory that silently defaults an unknown privileged mode can create the wrong capability; validate selection explicitly. Prefer a validated options object for a short stable configuration and a directly injected dependency when construction is already simple.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why is this not classic Factory Method?**</span> There is no creator superclass workflow with a subclass-overridden creation hook. It is a closure-based simple factory.
2. <span class="notes-section-label">**Does freezing the returned object prevent all changes?**</span> No. Its methods can still modify closed-over state; nested objects also need their own ownership policy.
3. <span class="notes-section-label">**Does a factory guarantee isolation?**</span> No. A factory can return a global object or retain caller-owned references. Inspect and test what it actually owns.

::: tip Key takeaway
Choose construction and sharing deliberately; the factory name alone promises neither isolation nor cleanup.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Run two readers from the same input. Mutate the input and a returned DTO, close one twice, and prove the other still works. Acceptance: duplicate/invalid products fail before a usable reader is returned; missing returns null; closed reads reject. Add nested metadata and demonstrate the alias bug before implementing its copy policy. Explain which owner would close a real pool.

<span class="notes-section-label">**Official references**</span>

[ECMAScript Object.create](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.create), [Object.freeze](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.freeze), [Node24 structuredClone](https://nodejs.org/download/release/v24.18.0/docs/api/globals.html#structuredclonevalue-options), [Nest provider scopes](https://docs.nestjs.com/fundamentals/injection-scopes). These document implementation mechanics; pattern names describe the design intent above.

---

### How do Adapter and Decorator differ, and what must a wrapper preserve? {#t18-q03}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

An Adapter translates an incompatible interface or representation into the contract a consumer expects. A Decorator adds behavior around a capability while **preserving its promised observable contract**. **Matching method names is insufficient:** results, missing values, failures, side effects and resource ownership must also agree. Wrappers do not automatically forward every method or identity.

</div>

<span class="notes-section-label">**The structural family**</span>

| GoF pattern | Main intent | Example or decision |
|---|---|---|
| Adapter | Translate an incompatible interface | Convert legacy product lookup/results to `get(id)` |
| Bridge | Let an abstraction and its implementation vary independently | Report types composed with independent delivery implementations; avoid a subclass for every combination |
| Composite | Treat leaves and nested groups through one interface | A bounded validation tree; define depth/cycle and error aggregation rules |
| Decorator | Add behavior through an existing contract | Observe read outcomes without editing the reader |
| Facade | Offer a simpler entry point to a subsystem | A checkout use-case coordinates collaborators; transaction behavior still needs design |
| Flyweight | Share intrinsic state across many logical objects | Reuse immutable parsing descriptors; keep user-specific mutable state separate |
| Proxy | Control access to another capability | Lazy/remote/access-controlled access; remote failures and identity remain observable |

These roles can overlap in a concrete object. Explain the intent: a Facade simplifies a subsystem, while an Adapter makes a particular interface fit. A cache often resembles a Proxy, but adding caching without tenant keys, invalidation and bounds breaks the reader contract. A JavaScript `Proxy` object is a language mechanism, not automatically a sound implementation of the design pattern.

<span class="notes-section-label">**Worked example — translation, then observation**</span>

The legacy provider has `findProduct({ sku })` and returns either null or `{ sku, title, cents }`. The application read contract is `get(id)` → promise of `{ id, name, unitPriceCents }` or null. This fixture concerns public products; **it must not replace an owner-filtered repository without preserving that authorization contract**.

```js
// file: reader-wrappers.mjs
const validId = id => typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id);
export function adaptLegacyReader(legacy) {
  if (typeof legacy?.findProduct !== 'function') throw new TypeError('Legacy reader required');
  return Object.freeze({
    async get(id) {
      if (!validId(id)) throw new TypeError('Invalid id');
      const row = await legacy.findProduct({ sku: id });
      if (row === null) return null;
      if (!row || row.sku !== id || typeof row.title !== 'string' ||
          row.title.length < 1 || row.title.length > 80 ||
          !Number.isSafeInteger(row.cents) || row.cents < 1 || row.cents > 1_000_000) {
        throw new TypeError('Invalid legacy product');
      }
      return { id: row.sku, name: row.title, unitPriceCents: row.cents };
    }
  });
}
export function withReadMetrics(reader) {
  if (typeof reader?.get !== 'function') throw new TypeError('Reader required');
  let active = 0, hits = 0, misses = 0, failures = 0;
  return Object.freeze({
    async get(id) {
      active++;
      try {
        const value = await reader.get(id);
        value === null ? misses++ : hits++;
        return value;
      } catch (error) {
        failures++;
        throw error;
      } finally { active--; }
    },
    metrics() { return { active, hits, misses, failures }; }
  });
}
```

`adaptLegacyReader` keeps the legacy method's receiver by calling it through `legacy`; it does not detach `findProduct` and lose `this`. It rejects an unexpected provider representation and projects away extra fields. A backend failure remains the original rejection rather than becoming a false “not found.” If your application needs normalized domain errors, add a documented mapping at the adapter boundary and test it explicitly.

`withReadMetrics` preserves the async `get` result, null and original rejection. `finally` decrements active work on either outcome. It stores only fixed counters, not IDs, credentials or product data. Counts are local observations, not durable business receipts; very long-lived counters eventually need a suitable metrics implementation. It does not infer success from the moment a promise is created.

The wrapper promises only the read interface plus metrics. **It does not own or forward a pool's close method.** Keep the original resource owner for disposal. If callers require streams, cancellation, transactions or additional methods, this narrow wrapper is insufficient until those contracts are deliberately supported. It also creates a different object identity; equality/private fields/prototype behavior are not magically transparent.

<span class="notes-section-label">**Composition order changes meaning**</span>

`withReadMetrics(adaptLegacyReader(legacy))` counts mapping failures as reader failures. Metrics placed only around the raw legacy call would count successful transport before a later mapping failure. Retry inside a wrapper can count one user operation versus several attempts depending on placement. Neither retry nor caching belongs in a “transparent” wrapper unless the operation's correctness and observability contracts permit it.

This is ordinary object/function composition. The [NestJS interceptor](./16-frameworks.md#t16-q11) is a framework-specific interception mechanism; TypeScript `@decorator` syntax is a separate language/compiler feature. Do not copy syntax from one and assume the other has the same lifecycle or metadata behavior.

<span class="notes-section-label">**Common mistakes**</span>

Converting every dependency failure to null hides outages. Spreading a class instance into a wrapper can lose prototype methods, private state and receiver binding. Broadly catching errors can replace their identity/cause. A read cache shared across users can expose data even though it has the correct method name. A wrapper that starts unreturned async work can report completion too soon.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why is mapping `{ sku, title }` an Adapter?**</span> Its purpose is compatibility with the application's different interface/representation.
2. <span class="notes-section-label">**Is adding `metrics()` incompatible with decoration?**</span> Extra capabilities are possible, but consumers relying on `get` must retain that contract. Do not promise full object transparency.
3. <span class="notes-section-label">**Should metrics failure replace a successful write?**</span> Decide the observation policy explicitly. These local counters have no external exporter; a real exporter needs its own bounded failure policy and must not accidentally reclassify a committed write.

::: tip Key takeaway
Adapter changes how a capability fits; Decorator changes what happens around it. Both require behavioral contract tests.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Wrap the factory reader and the legacy adapter with the same metrics decorator. Acceptance: shared read-contract tests pass; missing differs from rejection; the exact thrown error survives; concurrent held reads appear active until settlement; returned metrics cannot mutate internal counts. Demonstrate a mismatched legacy SKU and explain which wrapper layer records the failure. Retain resource ownership outside the wrapper.

<span class="notes-section-label">**Official references**</span>

[Node assertions for contract checks](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html), [promise completion mechanics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises), [ECMAScript function calls and receiver semantics](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-function-calls). The [existing Decorator lesson](../../senior_growth/Coding_principles_patterns_conventions/What_do_you_know_about_Decorator_design_pattern_Where_in_React.js_it%27s_used.md) supplies a frontend comparison.

---

### How do Strategy, Observer and Command organize behavior without hiding failures? {#t18-q04}

*Study depth: Intermediate; full worked catalogue linked below*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Strategy makes an algorithm interchangeable; Observer notifies registered collaborators; Command represents an operation as a separate request. **Each changes collaboration, not the underlying correctness obligations.** Strategies must share behavioral contracts, subscriptions need owners, and commands still need validation/authorization and outcome handling. **Local notification is not durable delivery, and representing a command does not make a write reversible.**

</div>

<span class="notes-section-label">**The behavioral family**</span>

| GoF pattern | Main intent | Node-oriented example or limit |
|---|---|---|
| Chain of Responsibility | Pass a request through potential handlers | Express-style middleware resembles a chain; define stop/error/continuation ownership |
| Command | Represent an operation independently from its invoker | A validated rename-product request handled by a service |
| Interpreter | Evaluate expressions in a defined grammar | A small bounded filter DSL; do not evaluate untrusted JavaScript |
| Iterator | Traverse without exposing representation | Iterables/async iterables; exhaustion, cleanup and cancellation still matter |
| Mediator | Centralize interactions among collaborators | A workflow coordinator; avoid an unbounded all-purpose controller |
| Memento | Capture state for later restoration | Bounded immutable editor snapshots; not rollback of external effects |
| Observer | Notify subscribed collaborators | Local EventEmitter with explicit subscription lifetime |
| State | Delegate behavior according to current state/transitions | Draft versus published product workflow with allowed transitions |
| Strategy | Substitute an algorithm behind a shared contract | Shipping quote rules selected by a caller |
| Template Method | Define a workflow skeleton with overridable steps | An import superclass with deliberate hooks; injected functions often suffice |
| Visitor | Add operations across a stable object structure | Multiple operations over a typed syntax tree; new node kinds affect visitors |

The family tables introduce all23 GoF patterns. The linked full lessons now give every pattern worked intermediate material; advanced production specialization remains optional. The classification is a vocabulary, not an instruction to use every pattern in one service.

<span class="notes-section-label">**Worked Strategy — replace rules, preserve the quote boundary**</span>

Shipping uses integer cents in one illustrative currency. Save `shipping-rules.mjs`:

```js
// file: shipping-rules.mjs
export const standardShipping = subtotal => subtotal >= 10_000 ? 0 : 500;
export const expressShipping = _subtotal => 1200;
export function quoteShipping(subtotal, rule) {
  if (!Number.isSafeInteger(subtotal) || subtotal < 0 || subtotal > 1_000_000) {
    throw new RangeError('Invalid subtotal');
  }
  if (typeof rule !== 'function') throw new TypeError('Shipping rule required');
  const fee = rule(subtotal);
  if (!Number.isSafeInteger(fee) || fee < 0 || fee > 1_000_000) {
    throw new RangeError('Invalid shipping fee');
  }
  return { subtotalCents: subtotal, shippingCents: fee, totalCents: subtotal + fee };
}
```

`quoteShipping` is the context; injected functions are the strategies. The contract is synchronous and side-effect free by design. All rules accept the same validated subtotal and must return bounded integer cents. Passing an async function returns a promise, which fails the output check; it does not turn the context asynchronous. A throwing rule propagates its original error. The caller still selects a rule through an explicit allowed option, switch or map. This synchronous boundary does not own promises returned by invalid async rules; a rejecting async rule can additionally create an unobserved rejection. Use a separately awaited context for I/O algorithms instead of treating numeric validation as async lifecycle management.

A pickup rule `() => 0` needs no context change. However, if tax/currency/customer information becomes necessary, evolve the shared contract deliberately. A payment provider is not interchangeable merely because it has `pay()`: timeout, cancellation, idempotency, refund and error semantics also matter. Do not silently switch payment providers after an uncertain write.

<span class="notes-section-label">**Worked Observer — scope local notification and disposal**</span>

The existing [events chapter](./06-events-and-event-loop.md#t06-q01) owns full EventEmitter mechanics. This small executable shows the design boundary:

```js
// file: observer-lifetime.mjs
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
const events = new EventEmitter();
const seen = [];
function subscribe(onViewed) {
  if (typeof onViewed !== 'function') throw new TypeError('Listener required');
  const deliver = id => onViewed(id); // unique registration owner
  events.on('viewed', deliver);
  return () => { events.off('viewed', deliver); };
}
const callback = id => { seen.push(id); };
const stopFirst = subscribe(callback);
const stopSecond = subscribe(callback);
events.emit('viewed', 'p1');
assert.deepEqual(seen, ['p1', 'p1']);
stopFirst(); stopFirst();
events.emit('viewed', 'p2');
assert.deepEqual(seen, ['p1', 'p1', 'p2']);
stopSecond();
assert.equal(events.listenerCount('viewed'), 0);
```

Each subscription owns a unique function, even when callers reuse a callback. Its disposer removes only that registration and is idempotent. The listener policy here is synchronous callbacks only; this API does not await or manage promises returned by async listeners. Node invokes EventEmitter listeners synchronously in registration order; a synchronous throw interrupts that emit and propagates to its caller. Reuse the event chapter for rejection/error policies rather than assume notification is isolated or durable.

If a catalog write commits and a later local notification throws, the commit still happened. An HTTP500 at that point is not proof the write failed. Use durable outcome/idempotency and an outbox when the business requirement needs reliable cross-process publication; those belong to the retained architecture/messaging scope. A local emitter supplies neither persistence nor broker acknowledgments/backpressure. Avoid leaking a listener on every request, and do not disable warnings instead of fixing ownership.

<span class="notes-section-label">**Worked Command and State — separate the request from its execution**</span>

A command can be ordinary validated data:

```js
// Illustrative data, not a complete dispatcher or authorization implementation.
const rename = Object.freeze({
  type: 'RenameProduct', productId: 'p1', name: 'Revised title', expectedVersion: 3
});
```

An invoker accepts that request; a handler supplies the trusted actor separately and calls the existing service's version-checked update. Validate an allowlisted command type and fields. The command is a request for authority, not a grant of it. A command object containing a function closure cannot simply be serialized into a durable queue; define the data schema, compatibility, deduplication and trusted execution owner.

A retry with version3 after a successful update to4 can produce a conflict. It does not necessarily tell the caller whether an earlier uncertain attempt committed. Idempotency keys and durable receipts solve a different problem from optimistic concurrency. An “undo” command may itself fail or conflict; it is not transaction rollback or guaranteed compensation of a payment. The [bounded text-history example](../../senior_growth/Coding_principles_patterns_conventions/What_design_patterns_do_you_use_on_daily_basis_in_JS%2C_why_are_they_useful.md#bounded-undo-and-redo-for-owned-text) deliberately limits restoration to owned local strings.

For State, imagine `Draft` allows rename/publish while `Published` requires a different edit/review policy. Behavior follows current state and permitted transitions; Strategy instead chooses among algorithms for the same operation. Start with a small transition table and explicit guards. State classes become useful when state-specific behavior grows, not merely because a record has a `status` field. Concurrency/authorization still belong in the authoritative service/store operation.

<span class="notes-section-label">**Common mistakes and debugging**</span>

If two strategies disagree on cents versus units, the interface is broken despite both returning numbers. If work finishes after its caller has returned, inspect missing returned/awaited promises. If memory grows, inspect listener ownership and retained command/history data before increasing limits. If a repeated command duplicates an effect, inspect its durable operation contract rather than add an in-memory singleton flag.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Are Observer and broker pub/sub equivalent?**</span> They share notification ideas; topology, durability, acknowledgment and failure semantics differ. State the actual implementation's guarantees.
2. <span class="notes-section-label">**Can one request use several patterns?**</span> Yes: a controller invokes a command handler that uses an injected strategy and an adapted reader. Keep each boundary justified; avoid abstractions with no actual variation.
3. <span class="notes-section-label">**Does a chain guarantee the next handler runs?**</span> No. A handler may respond, reject or deliberately stop. Middleware must have explicit continuation/error behavior.

::: tip Key takeaway
Interchangeable behavior needs a common contract; notification needs ownership; an operation request needs an authoritative execution and outcome policy.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Add pickup shipping and test threshold, negative, oversized, throwing and invalid-output rules. Demonstrate synchronous listener failure and stop every registration. Represent a rename request, execute it through the real service, then demonstrate a stale version and explain an uncertain-response retry. Acceptance: preserve the shared quote contract, distinguish notification from durability, and explain why local history cannot undo an external effect.

<span class="notes-section-label">**Official references**</span>

[Node24 event delivery and listener lifetime](https://nodejs.org/download/release/v24.18.0/docs/api/events.html), [promise return/settlement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises), [Node24 assertions](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). See also the existing [async-iteration explanation](./05-asynchronous-programming.md) and [framework lifecycle](./16-frameworks.md#t16-q08).

## Revision and practice evidence

| Design question | Evidence to retain |
|---|---|
| Why this pattern? | A concrete change, simpler alternative and accepted trade-off |
| What is preserved? | Shared success/missing/error/mutation contract tests |
| Who owns state and resources? | Isolation, subscription disposal and cleanup failure cases |
| What crosses a process boundary? | Explicit persistence/delivery/identity assumptions; no local-memory guarantees invented |

- [ ] Explain all three families and compare simple factory/Factory Method, Adapter/Decorator, Strategy/State.
- [ ] Run and extend the creation example, including a nested alias failure and repair.
- [ ] Integrate the Adapter/Decorator with a real application reader and preserve its authorization/error contract.
- [ ] Add and contract-test a new shipping rule; demonstrate listener failure and cleanup.
- [ ] Execute a versioned command through the catalog and explain retry versus undo versus compensation.

These checkboxes track **your practice**, not whether learning material exists. A written answer or author-run fixture does not complete them.
