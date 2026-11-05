---
outline: [2, 3]
---

# Behavioral patterns: requests and collaboration

Five worked patterns for routing requests, representing operations, coordinating peers, changing state-specific behavior and defining workflow skeletons. Existing [Strategy and Observer](../18-patterns.md#t18-q04) remain their shared worked lessons.

Examples are standalone `.mjs` files for Node.js24.18.0, using built-in modules only. Keep experiments in an owned lab. [Pattern overview](../18-patterns.md) supplies selection criteria; exercises remain your separate practice.

---

### How does Chain of Responsibility stop, delegate and preserve failure? {#t18-q15}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Chain of Responsibility passes a request through candidate handlers. **Define what means handled, delegated or failed.** Ordering and termination are observable behavior; an error is not automatically permission to try another handler.

</div>

<span class="notes-section-label">**Why and when**</span>

It fits a bounded sequence of product lookup sources or escalation rules when the sender should not name a single receiver. This version stops at the first handled result; a validation pipeline or Express continuation chain has a different explicit continuation protocol.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: chain-of-responsibility.mjs
import assert from 'node:assert/strict';
async function handle(request, handlers) {
  if (
    !Array.isArray(handlers) ||
    handlers.length > 5 ||
    Array.from(handlers).some((h) => typeof h !== 'function')
  )
    throw new TypeError('Handlers');
  for (const handler of handlers) {
    const result = await handler(request);
    if (result === null) continue;
    if (!result || result.handled !== true || !Object.hasOwn(result, 'value'))
      throw new TypeError('Handler result');
    return result.value;
  }
  throw new Error('Unhandled');
}
const calls = [];
const miss = () => {
  calls.push('local');
  return null;
};
const found = () => {
  calls.push('catalog');
  return { handled: true, value: 'Book' };
};
const later = () => {
  calls.push('later');
  return { handled: true, value: 'Wrong' };
};
assert.equal(await handle({ id: 'p1' }, [miss, found, later]), 'Book');
assert.deepEqual(calls, ['local', 'catalog']);
await assert.rejects(handle({}, [() => null]), /Unhandled/);
await assert.rejects(handle({}, [() => undefined]), TypeError);
const failure = Error('policy denied');
await assert.rejects(
  handle({}, [
    () => {
      throw failure;
    },
    later,
  ]),
  (e) => e === failure,
);
assert.deepEqual(calls, ['local', 'catalog']);
```

Only null delegates; a result envelope handles the request. Throws/rejections stop the chain and preserve their identity. Later handlers never run after handling or failure. The request payload itself belongs to the application’s validation/authentication boundary; this generic dispatcher does not validate a domain schema.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Swallowing a denial and falling through can bypass policy. An unbounded/dynamically cyclic chain can fail to terminate. This array-based chain has no next callback, so next-called-twice is avoided rather than solved generically. Use direct dispatch for a fixed obvious receiver.

<span class="notes-section-label">**Examiner follow-up**</span>

Is every middleware list this exact pattern? It may resemble a chain, but first-handler, all-validator and next/error semantics differ. Explain the actual continuation contract.

::: tip Key takeaway
Chain of Responsibility passes a request through candidate handlers.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add an authorized cache handler before the fallback. Acceptance: correct order, miss delegation, malformed result rejection, denied request never falling through and a documented cache ownership/freshness policy.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### How does Command separate an operation from its invoker, and what can undo promise? {#t18-q16}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Command represents an operation so an invoker can trigger it without knowing its receiver’s details. **Execution, retry and undo need separate contracts.** Undoing owned local state is not automatic rollback of an external effect.

</div>

<span class="notes-section-label">**Why and when**</span>

A rename action can be an object capturing the receiver and requested change. This synchronous one-process example allows one execution and at most one successful undo, guarded by a version. Durable queues need serializable command data and a trusted handler, not function closures.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: command.mjs
import assert from 'node:assert/strict';
function createNameStore() {
  let row = { name: 'Book', version: 1 };
  return {
    read: () => ({ ...row }),
    set(name, version) {
      if (typeof name !== 'string' || name.length < 1 || name.length > 80)
        throw new TypeError('Name');
      if (version !== row.version) throw new Error('Conflict');
      row = { name, version: row.version + 1 };
      return { ...row };
    },
  };
}
function renameCommand(store, name) {
  let before,
    applied,
    undone = false;
  return Object.freeze({
    execute() {
      if (applied) throw new Error('Already executed');
      const original = store.read();
      const result = store.set(name, original.version);
      before = original;
      applied = result;
      return result;
    },
    undo() {
      if (!applied || undone) throw new Error('No undo');
      const result = store.set(before.name, applied.version);
      undone = true;
      return result;
    },
  });
}
const store = createNameStore(),
  command = renameCommand(store, 'Pen');
assert.equal(command.execute().name, 'Pen');
assert.equal(command.undo().name, 'Book');
assert.throws(() => command.undo(), /No undo/);
assert.throws(() => command.execute(), /Already executed/);
const conflict = renameCommand(store, 'Draft');
conflict.execute();
store.set('Other', store.read().version);
assert.throws(() => conflict.undo(), /Conflict/);
assert.equal(store.read().name, 'Other');
assert.throws(() => renameCommand(store, '').execute(), TypeError);
```

The command owns the operation request and captured before-state; the store is the receiver. The version guard prevents undo from overwriting another edit. Failed execution does not record an applied result. This is a local synchronous contract, not proof of cross-process atomicity.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

An in-memory already-executed flag is not durable idempotency. Captured credentials can expire, and a queued command must be authorized at execution. Undo can fail or conflict; compensation is a new fallible operation. Use direct service calls when no scheduling/history/invoker separation is needed.

<span class="notes-section-label">**Examiner follow-up**</span>

Can a command be plain data? Yes. A type/payload envelope plus a handler can represent it; serialization, compatibility, authorization and deduplication still need explicit design.

::: tip Key takeaway
Command represents an operation so an invoker can trigger it without knowing its receiver’s details.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Put two commands behind a tiny invoker and add undo history bounds. Acceptance: execute/undo order, no-op/failed command policy, stale-version conflict and a clear distinction between local history and durable retries.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### How does Mediator coordinate peers without becoming a global dependency hub? {#t18-q19}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Mediator centralizes a set of collaborating peers so they need not call one another directly. **Coordination needs explicit ordering, concurrency and failure policy.** A mediator should own one cohesive interaction, not every application event.

</div>

<span class="notes-section-label">**Why and when**</span>

A product form, save service and list refresh can coordinate through one submission owner. The form reports an action; the mediator sequences collaborators and exposes busy state. These are injected fixture capabilities, not an actual transaction or UI framework.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: mediator.mjs
import assert from 'node:assert/strict';
function createCoordinator(save, refresh) {
  if (typeof save !== 'function' || typeof refresh !== 'function')
    throw new TypeError('Peers');
  let busy = false;
  return Object.freeze({
    isBusy: () => busy,
    async submit(product) {
      if (busy) throw new Error('Busy');
      if (
        !product ||
        typeof product.id !== 'string' ||
        !/^[a-z0-9-]{1,20}$/.test(product.id)
      )
        throw new TypeError('Product');
      busy = true;
      try {
        const id = await save({ id: product.id });
        await refresh(id);
        return id;
      } finally {
        busy = false;
      }
    },
  });
}
let release;
const gate = new Promise((r) => (release = r));
const order = [];
const mediator = createCoordinator(
  async (p) => {
    order.push('save');
    await gate;
    return p.id;
  },
  async () => {
    order.push('refresh');
  },
);
const first = mediator.submit({ id: 'p1' });
assert.equal(mediator.isBusy(), true);
await assert.rejects(mediator.submit({ id: 'p2' }), /Busy/);
release();
assert.equal(await first, 'p1');
assert.deepEqual(order, ['save', 'refresh']);
assert.equal(mediator.isBusy(), false);
const failure = Error('refresh failed');
let saved = false;
const broken = createCoordinator(
  async (p) => {
    saved = true;
    return p.id;
  },
  async () => {
    throw failure;
  },
);
await assert.rejects(broken.submit({ id: 'p1' }), (e) => e === failure);
assert.equal(saved, true);
assert.equal(broken.isBusy(), false);
```

The peers do not hold references to each other; the mediator owns their collaboration. A held promise makes concurrent-submission rejection deterministic. The refresh failure occurs after save and is not reported as a rollback. Real recovery should distinguish “saved but view refresh failed” from “save failed.”

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Centralizing unrelated flows creates a god object and hidden event cycles. A Facade emphasizes a simplified entry point; a Mediator emphasizes peer interaction, and one service may play both roles. Use direct composition when there are only two obvious calls and no coordination policy.

<span class="notes-section-label">**Examiner follow-up**</span>

Does busy=false mean no remote effects remain? Only under the collaborators’ promised completion contract; detached background work would break that assumption.

::: tip Key takeaway
Mediator centralizes a set of collaborating peers so they need not call one another directly.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add an explicit saved-but-refresh-failed result policy and retry only the refresh. Acceptance: no duplicate save, busy reset on each failure, peers remain independent and one rejected global-event-bus alternative explained.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### How does State change permitted behavior as an object moves through its lifecycle? {#t18-q21}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

State delegates behavior according to the current lifecycle state and permitted transitions. **A status field alone is not the State pattern.** Encapsulate state-specific behavior and prevent invalid transitions from partially changing the object.

</div>

<span class="notes-section-label">**Why and when**</span>

A draft product may be renamed and published, while a published product may only be archived in this simplified workflow. The state-specific handlers capture behavior; the context owns its current state and data. A small transition table is often sufficient before introducing classes.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: state.mjs
import assert from 'node:assert/strict';
function createProduct() {
  let state = 'draft',
    name = 'Book';
  const states = {
    draft: {
      rename(value) {
        if (typeof value !== 'string' || value.length < 1 || value.length > 80)
          throw new TypeError('Name');
        name = value;
      },
      publish() {
        state = 'published';
      },
    },
    published: {
      archive() {
        state = 'archived';
      },
    },
    archived: {},
  };
  function act(action, value) {
    if (!Object.hasOwn(states[state], action)) throw new Error('Transition forbidden');
    states[state][action](value);
  }
  return Object.freeze({
    rename: (value) => act('rename', value),
    publish: () => act('publish'),
    archive: () => act('archive'),
    snapshot: () => ({ state, name }),
  });
}
const product = createProduct();
assert.throws(() => product.rename(''), TypeError);
assert.equal(product.snapshot().name, 'Book');
product.rename('Pen');
product.publish();
assert.throws(() => product.rename('Other'), /forbidden/);
assert.throws(() => product.publish(), /forbidden/);
assert.deepEqual(product.snapshot(), { state: 'published', name: 'Pen' });
product.archive();
assert.equal(product.snapshot().state, 'archived');
assert.throws(() => product.publish(), /forbidden/);
const copy = product.snapshot();
copy.state = 'draft';
assert.equal(product.snapshot().state, 'archived');
```

The context exposes a stable API, while state-specific handlers decide which actions exist. Validation happens before name mutation. Returned snapshots cannot change the hidden state. This fixture’s rules are deliberate domain choices, not universal product-publication rules.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Directly exposing a writable status bypasses transition guards. Separate processes require authoritative version/transaction checks; a closure cannot synchronize replicas. Strategy chooses an algorithm for a common operation; State models behavior tied to lifecycle/transitions. A switch is clearer when there are few stable states.

<span class="notes-section-label">**Examiner follow-up**</span>

Can the context choose its state object internally? Yes. Encapsulation of transition rules matters more than whether each state uses a class or an object of functions.

::: tip Key takeaway
State delegates behavior according to the current lifecycle state and permitted transitions.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add an archived-to-draft recovery action with an explicit permission/version contract. Acceptance: invalid transitions leave state unchanged, snapshots are isolated and the server remains the authoritative transition owner.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### How does Template Method define a workflow while allowing selected steps to vary? {#t18-q22}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Template Method fixes a workflow skeleton and lets subclasses provide selected steps. **The allowed extension hooks must preserve the overall contract.** JavaScript does not make a method final, so contract tests still protect intended invariants.

</div>

<span class="notes-section-label">**Why and when**</span>

An import workflow can parse input differently while preserving validation and save order. Here the parser varies by subclass and persistence is injected. This separates algorithm structure from replaceable parsing without pretending an import is automatically atomic.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: template-method.mjs
import assert from 'node:assert/strict';
class ImportJob {
  constructor(save) {
    if (typeof save !== 'function') throw new TypeError('Save');
    this.save = save;
  }
  parse() {
    throw new Error('Parser required');
  }
  async run(text) {
    if (typeof text !== 'string' || text.length > 1000) throw new TypeError('Input');
    const rows = await this.parse(text);
    if (
      !Array.isArray(rows) ||
      rows.length > 10 ||
      Array.from(rows).some((x) => typeof x !== 'string' || x.length > 80)
    )
      throw new TypeError('Rows');
    return this.save([...rows]);
  }
}
class JsonImport extends ImportJob {
  parse(text) {
    return JSON.parse(text);
  }
}
class LineImport extends ImportJob {
  parse(text) {
    return text === '' ? [] : text.split('\n');
  }
}
const saved = [];
const save = async (rows) => {
  saved.push(rows);
  return rows.length;
};
assert.equal(await new JsonImport(save).run('["Book","Pen"]'), 2);
assert.equal(await new LineImport(save).run('Book\nPen'), 2);
assert.deepEqual(saved, [
  ['Book', 'Pen'],
  ['Book', 'Pen'],
]);
await assert.rejects(new JsonImport(save).run('[1]'), TypeError);
assert.equal(saved.length, 2);
await assert.rejects(new JsonImport(save).run('{'), SyntaxError);
const failure = Error('save');
await assert.rejects(
  new JsonImport(async () => {
    throw failure;
  }).run('[]'),
  (e) => e === failure,
);
```

Both parsers reuse the inherited parse → validate → save sequence. Invalid parsed rows never reach save. Persistence rejection remains its original error; multi-row transaction and partial-write semantics belong to the real save implementation. The parser may be awaited, but the number/size of rows is still bounded.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Calling overridable hooks before required initialization or letting a subclass bypass validation breaks the workflow. Constructor injection/a pipeline of functions may be simpler than inheritance. Unlike Factory Method, the varying step here performs parsing rather than constructing a product; the patterns can coexist but their intents differ.

<span class="notes-section-label">**Examiner follow-up**</span>

How is this different from Strategy? Template Method varies steps through an inherited skeleton; Strategy composes an interchangeable algorithm into a context. Prefer the clearer variation boundary.

::: tip Key takeaway
Template Method fixes a workflow skeleton and lets subclasses provide selected steps.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add a delimiter-based parser with a bounded escaping contract. Acceptance: invalid input never reaches save, failures remain observable and shared workflow tests run against every subclass.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.
