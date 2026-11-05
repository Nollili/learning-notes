---
outline: [2, 3]
---

# Creational patterns

Five patterns for controlling construction and ownership. Prefer the simplest creation boundary that expresses the required variation.

Examples are standalone `.mjs` files for Node.js24.18.0, using built-in modules only. Keep experiments in an owned lab. [Pattern overview](../18-patterns.md) supplies selection criteria; exercises remain your separate practice.

---

### How does Factory Method vary construction inside a stable workflow? {#t18-q05}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A creator defines a workflow and delegates creation through an overridable method. **Factory Method changes the created collaborator while the creator’s workflow stays stable.** A standalone selection function is a simple factory, not automatically this pattern.

</div>

<span class="notes-section-label">**Why and when**</span>

Use it when a reusable workflow genuinely needs subclasses to supply different products, such as report encoders. The creator is ReportJob, the factory method is createEncoder, and an encoder is the product. Do not invent a hierarchy when injecting one function would be clearer.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: factory-method.mjs
import assert from 'node:assert/strict';
class ReportJob {
  createEncoder() {
    throw new Error('Encoder required');
  }
  run(rows) {
    if (
      !Array.isArray(rows) ||
      rows.length > 10 ||
      Array.from(rows).some((x) => typeof x !== 'string' || x.length > 80)
    )
      throw new TypeError('Rows');
    const encoder = this.createEncoder();
    if (typeof encoder?.encode !== 'function') throw new TypeError('Encoder');
    const text = encoder.encode([...rows]);
    if (typeof text !== 'string' || text.length > 2000)
      throw new TypeError('Encoded result');
    return text;
  }
}
class JsonReport extends ReportJob {
  createEncoder() {
    return { encode: (rows) => JSON.stringify({ rows }) };
  }
}
class TextReport extends ReportJob {
  createEncoder() {
    return { encode: (rows) => rows.join(' | ') };
  }
}
assert.equal(new JsonReport().run(['Book']), '{"rows":["Book"]}');
assert.equal(new TextReport().run(['Book', 'Pen']), 'Book | Pen');
assert.throws(() => new ReportJob().run([]), /Encoder required/);
assert.throws(() => new TextReport().run([null]), TypeError);
class BrokenReport extends ReportJob {
  createEncoder() {
    return { encode: () => null };
  }
}
assert.throws(() => new BrokenReport().run([]), TypeError);
```

The workflow validates input and output regardless of which concrete creator supplies the encoder. Subclasses change construction, not the caller’s invocation. The fixed text format is a fixture, not CSV escaping. Copying the array protects its structure; elements are bounded strings.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

An override that weakens the output contract breaks substitution. Trace which factory method actually ran before blaming serialization. Constructor injection or a direct encoder argument avoids inheritance when the workflow has no other useful creator abstraction.

<span class="notes-section-label">**Examiner follow-up**</span>

Why is JsonReport different from a createEncoder(type) switch? The subclass supplies a creation hook used by an inherited workflow; the switch is a separate simple-factory idiom.

::: tip Key takeaway
A creator defines a workflow and delegates creation through an overridable method.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add an HTML-text encoder without changing run. Acceptance: preserve bounds, escape according to the output context, reject a broken encoder and compare this design with injected functions.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### How does Abstract Factory keep a family of collaborators compatible? {#t18-q06}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

An Abstract Factory supplies a related family of products behind agreed interfaces. **The useful guarantee is coherent collaborators, not merely several create methods.** It does not supply transactions or make unlike backends semantically identical.

</div>

<span class="notes-section-label">**Why and when**</span>

A catalog can need a reader and writer bound to the same storage namespace. The client uses that family rather than constructing each half independently. In a real database family, connection, schema and transaction semantics must remain explicit.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: abstract-factory.mjs
import assert from 'node:assert/strict';
function createMemoryFamily() {
  const rows = new Map();
  const valid = (id) => typeof id === 'string' && /^[a-z0-9-]{1,20}$/.test(id);
  return Object.freeze({
    createReader: () =>
      Object.freeze({
        get(id) {
          if (!valid(id)) throw new TypeError('Id');
          return rows.get(id) ?? null;
        },
      }),
    createWriter: () =>
      Object.freeze({
        put(id, name) {
          if (
            !valid(id) ||
            typeof name !== 'string' ||
            name.length < 1 ||
            name.length > 80
          )
            throw new TypeError('Product');
          if (!rows.has(id) && rows.size >= 10) throw new RangeError('Capacity');
          rows.set(id, name);
        },
      }),
  });
}
function saveAndRead(factory, id, name) {
  const reader = factory.createReader(),
    writer = factory.createWriter();
  writer.put(id, name);
  return reader.get(id);
}
const family = createMemoryFamily();
assert.equal(saveAndRead(family, 'p1', 'Book'), 'Book');
assert.equal(createMemoryFamily().createReader().get('p1'), null);
assert.throws(() => family.createWriter().put('p2', ''), TypeError);
assert.equal(family.createReader().get('p2'), null);
```

Every product from this factory shares its private Map, while another factory has independent state. Values are primitive strings; a read does not leak a mutable row. This is a synchronous bounded lab with overwrite-on-put behavior, not a durable repository or transaction example.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Mixing a reader from one family with a writer from another loses the compatibility guarantee. Contract-test both halves and their interaction. A single composition factory returning ready collaborators is often simpler; Abstract Factory earns its cost when product families vary together.

<span class="notes-section-label">**Examiner follow-up**</span>

Does “same interface” mean a memory and SQL implementation are interchangeable? Only when they preserve the relevant behavior, including errors, visibility, ownership and concurrency.

::: tip Key takeaway
An Abstract Factory supplies a related family of products behind agreed interfaces.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add another family behind the same read/write contract. Acceptance: run shared missing/overwrite/invalid-input tests, show that mixed families fail the interaction contract, and document durability/transaction differences.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### When does Builder help, and how does build avoid leaking mutable state? {#t18-q07}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Builder collects meaningful construction steps before producing a validated product. **A built result needs its own ownership policy.** Returning the builder’s mutable internal object lets later steps change an earlier product.

</div>

<span class="notes-section-label">**Why and when**</span>

It fits a report specification assembled through several independently supplied options. The builder owns intermediate state; callers receive finished specifications. For a small fixed configuration, a validated options object usually has less ceremony.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: builder.mjs
import assert from 'node:assert/strict';
class ReportBuilder {
  #columns = ['name'];
  #format = 'json';
  columns(values) {
    if (
      !Array.isArray(values) ||
      values.length < 1 ||
      values.length > 3 ||
      Array.from(values).some((x) => !['id', 'name', 'price'].includes(x)) ||
      new Set(values).size !== values.length
    )
      throw new TypeError('Columns');
    this.#columns = [...values];
    return this;
  }
  format(value) {
    if (!['json', 'text'].includes(value)) throw new TypeError('Format');
    this.#format = value;
    return this;
  }
  build() {
    return Object.freeze({
      columns: Object.freeze([...this.#columns]),
      format: this.#format,
    });
  }
}
const columns = ['id', 'name'];
const builder = new ReportBuilder().columns(columns);
const first = builder.build();
columns.push('price');
builder.columns(['price']).format('text');
assert.deepEqual(first, { columns: ['id', 'name'], format: 'json' });
assert.deepEqual(builder.build().columns, ['price']);
assert.throws(() => first.columns.push('price'), TypeError);
assert.throws(() => builder.columns(['id', 'id']), TypeError);
assert.throws(() => builder.format('unknown'), TypeError);
```

Input arrays and finished arrays are copied; nested columns are frozen too. The supported representation contains only strings, so this explicit shallow-plus-array policy is sufficient. Reusing the builder changes future products without modifying prior ones.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Fluent methods do not automatically make a Builder useful. Validate complete cross-field invariants at build when individual steps cannot establish them. Returning this.#columns directly or freezing only the outer object reintroduces aliasing. A one-shot builder must document that it cannot be reused.

<span class="notes-section-label">**Examiner follow-up**</span>

Why validate again at build? Individual valid steps can combine into an invalid product; the finished-product boundary owns the complete invariant.

::: tip Key takeaway
Builder collects meaningful construction steps before producing a validated product.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add a rule that text reports require a name column. Acceptance: validate it at build, preserve earlier products, test invalid intermediate/final states and compare a plain options-object constructor.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### How does Prototype create from an exemplar without confusing copying and delegation? {#t18-q08}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Prototype creates a new product from an existing exemplar through a defined cloning operation. **Copy policy must preserve the intended behavior and isolate owned mutable state.** Object.create delegates property lookup; it is not an independent snapshot.

</div>

<span class="notes-section-label">**Why and when**</span>

Use it when an existing configuration/report model is the natural template and constructing it from scratch would obscure intent. Define which fields are copied, shared, regenerated or excluded. Database IDs, sockets and credentials normally should not be blindly cloned.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: prototype.mjs
import assert from 'node:assert/strict';
class ReportSpec {
  constructor(title, tags) {
    if (
      typeof title !== 'string' ||
      title.length > 80 ||
      !Array.isArray(tags) ||
      tags.length > 5 ||
      Array.from(tags).some((t) => typeof t !== 'string' || t.length > 20)
    )
      throw new TypeError('Spec');
    this.title = title;
    this.tags = [...tags];
  }
  clone() {
    return new ReportSpec(this.title, this.tags);
  }
  label() {
    return `${this.title}:${this.tags.length}`;
  }
}
const template = new ReportSpec('Stock', ['public']);
const draft = template.clone();
draft.tags.push('draft');
assert.equal(template.label(), 'Stock:1');
assert.equal(draft.label(), 'Stock:2');
assert.notEqual(template.tags, draft.tags);
assert.equal(draft instanceof ReportSpec, true);
assert.equal(structuredClone(template) instanceof ReportSpec, false);
const delegated = Object.create(template);
template.title = 'Changed';
assert.equal(delegated.title, 'Changed');
assert.equal(Object.hasOwn(delegated, 'title'), false);
assert.throws(() => new ReportSpec('X', [null]), TypeError);
```

clone explicitly reconstructs the class and copies its tag array. structuredClone is useful for supported data graphs but does not promise arbitrary class behavior. Delegation intentionally observes later prototype changes, which is different from the cloned draft.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Adding a nested object requires an updated clone contract. A generic JSON roundtrip loses unsupported values and representation information. Prefer plain immutable data or an explicit constructor when cloning a rich object would hide identity/resource semantics.

<span class="notes-section-label">**Examiner follow-up**</span>

Can Prototype share immutable objects? Yes if deliberately documented; independence is required only for the state the clone promises to own.

::: tip Key takeaway
Prototype creates a new product from an existing exemplar through a defined cloning operation.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add nested display settings and a generated draft ID. Acceptance: isolate mutable settings, preserve required methods, regenerate identity and prove that an unsupported resource is rejected rather than silently copied.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/globals.html#structuredclonevalue-options). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### What does Singleton guarantee, and when is explicit application ownership safer? {#t18-q09}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Singleton restricts access to one instance within a defined owner/scope. **One loaded module is not one distributed instance.** Shared mutable request identity or unbounded caches can make this convenience unsafe and hard to test.

</div>

<span class="notes-section-label">**Why and when**</span>

A stateless application configuration capability can be shared, while per-request identity belongs in explicit arguments. This example uses a private factory closure to express an application-scoped single access point without exporting a mutable global class field.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: singleton.mjs
import assert from 'node:assert/strict';
function createConfigOwner() {
  let instance;
  return function getConfig(mode) {
    if (!['development', 'production'].includes(mode)) throw new TypeError('Mode');
    if (instance && instance.mode !== mode) throw new Error('Already configured');
    return (instance ??= Object.freeze({
      mode,
      isProduction: () => mode === 'production',
    }));
  };
}
const getConfig = createConfigOwner();
const first = getConfig('production');
assert.equal(getConfig('production'), first);
assert.equal(first.isProduction(), true);
assert.throws(() => getConfig('development'), /Already configured/);
assert.throws(() => {
  first.mode = 'development';
}, TypeError);
const otherApp = createConfigOwner();
assert.notEqual(otherApp('production'), first);
assert.throws(() => otherApp('invalid'), TypeError);
```

This is one instance per explicitly created application owner. Another owner deliberately creates another instance for isolation. A classic global Singleton often hides that boundary; ESM caching can supply sharing within one module instance, but workers/replicas and distinct module identities differ.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Fail rather than silently accept contradictory second configuration. Do not put currentUser on a shared capability. Prefer injecting the configuration object directly when global discovery is unnecessary. A resource-owning singleton still needs startup failure handling and disposal; object uniqueness does not solve lifecycle.

<span class="notes-section-label">**Examiner follow-up**</span>

Why call this scoped Singleton rather than claim one object forever? The scope is part of the guarantee; the example deliberately makes it reviewable and test-isolatable.

::: tip Key takeaway
Singleton restricts access to one instance within a defined owner/scope.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Use two application owners in tests and pass configuration into a service. Acceptance: no cross-test configuration leakage, reject incompatible reconfiguration, and explain who closes any resource added later.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.
