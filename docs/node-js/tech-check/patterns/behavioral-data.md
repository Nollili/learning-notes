---
outline: [2, 3]
---

# Behavioral patterns: expressions, traversal and history

Four worked patterns for bounded expression semantics, traversal/resource ownership, opaque snapshots and operations over stable node types. These examples use owned in-memory data; production parsers/cursors/history need their actual boundary contracts.

Examples are standalone `.mjs` files for Node.js24.18.0, using built-in modules only. Keep experiments in an owned lab. [Pattern overview](../18-patterns.md) supplies selection criteria; exercises remain your separate practice.

---

### How does Interpreter evaluate a small language without executing arbitrary code? {#t18-q17}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Interpreter represents a grammar and defines how its expressions are evaluated. **A small explicit language is different from evaluating arbitrary JavaScript.** Bound its syntax, depth and work, and separate syntax validity from record validation.

</div>

<span class="notes-section-label">**Why and when**</span>

A catalogue filter may support only price/stock thresholds and conjunction. A structured expression tree avoids inventing a general parser in this lesson; parsing text into this grammar would be another bounded boundary. Never use eval or Function on user-supplied filters.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: interpreter.mjs
import assert from 'node:assert/strict';
function compileFilter(root) {
  let remaining = 50;
  function visit(node, depth) {
    if (--remaining < 0 || depth > 6) throw new RangeError('Expression budget');
    if (!node || typeof node !== 'object') throw new TypeError('Expression');
    if (node.kind === 'gte') {
      if (
        !['price', 'stock'].includes(node.field) ||
        !Number.isSafeInteger(node.value) ||
        node.value < 0 ||
        node.value > 10000
      )
        throw new TypeError('Threshold');
      const field = node.field,
        value = node.value;
      return (record) => {
        if (
          !record ||
          !Object.hasOwn(record, field) ||
          !Number.isSafeInteger(record[field]) ||
          record[field] < 0 ||
          record[field] > 10000
        )
          throw new TypeError('Record');
        return record[field] >= value;
      };
    }
    if (
      node.kind === 'all' &&
      Array.isArray(node.children) &&
      node.children.length > 0 &&
      node.children.length <= 5
    ) {
      const children = Array.from(node.children, (child) => visit(child, depth + 1));
      return (record) => children.every((test) => test(record));
    }
    throw new TypeError('Unknown expression');
  }
  return visit(root, 0);
}
const ast = {
  kind: 'all',
  children: [
    { kind: 'gte', field: 'price', value: 100 },
    { kind: 'gte', field: 'stock', value: 1 },
  ],
};
const test = compileFilter(ast);
ast.children[0].value = 999;
assert.equal(test({ price: 100, stock: 1 }), true);
assert.equal(test({ price: 99, stock: 1 }), false);
assert.throws(() => test({ price: '100', stock: 1 }), TypeError);
assert.throws(() => compileFilter({ kind: 'eval', source: 'anything' }), TypeError);
assert.throws(
  () =>
    compileFilter({
      kind: 'all',
      children: [{ kind: 'gte', field: 'price', value: 100 }, null],
    }),
  TypeError,
);
const cycle = { kind: 'all', children: [] };
cycle.children.push(cycle);
assert.throws(() => compileFilter(cycle), /budget/);
```

Compilation visits every expression before runtime short-circuiting, so an invalid later expression is not hidden by an earlier false result. Captured primitive thresholds and compiled child arrays isolate the executable predicate from later AST edits. Only evaluated fields are checked here; a complete product schema belongs at the record boundary. Inputs are intended to be plain parsed data, not arbitrary objects with side-effecting getters.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Adding unbounded regex, recursion or general property paths changes the resource/security contract. An AST without a clear grammar is not a safe language by itself. A normal parameterized query/filter object is simpler when no language is needed; avoid translating unchecked fields directly into SQL.

<span class="notes-section-label">**Examiner follow-up**</span>

Is JSON.parse an Interpreter for this domain? It parses JSON syntax; this filter’s grammar and price/stock semantics are still your application responsibility.

::: tip Key takeaway
Interpreter represents a grammar and defines how its expressions are evaluated.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add a bounded any expression. Acceptance: validate every child before evaluation, preserve depth/node limits, reject unknown fields/operators and document empty-expression semantics.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### How does Iterator expose traversal while preserving resource ownership? {#t18-q18}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Iterator provides sequential traversal without exposing a collection’s representation. **Exhaustion, early return and failure need cleanup semantics.** A generator can express the protocol, but merely creating an iterator must not silently leak an eagerly opened resource.

</div>

<span class="notes-section-label">**Why and when**</span>

A database cursor or paged feed can supply one item at a time. This synchronous fixture uses a lazy cursor factory so an iterator that is never started acquires nothing. Async cursors need the corresponding awaited iteration and cancellation protocol.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: iterator.mjs
import assert from 'node:assert/strict';
function* scan(open) {
  const cursor = open();
  try {
    while (true) {
      const item = cursor.next();
      if (item.done) return;
      yield item.value;
    }
  } finally {
    cursor.close();
  }
}
let opened = 0,
  closed = 0;
function openRows(rows) {
  const data = [...rows];
  let index = 0,
    done = false;
  opened++;
  return {
    next() {
      if (done) throw new Error('Closed');
      return index < data.length ? { done: false, value: data[index++] } : { done: true };
    },
    close() {
      if (!done) {
        done = true;
        closed++;
      }
    },
  };
}
const never = scan(() => openRows([1]));
never.return();
assert.equal(opened, 0);
const input = [1, 2, 3];
const values = [];
for (const value of scan(() => openRows(input))) {
  values.push(value);
  input[1] = 99;
  break;
}
assert.deepEqual(values, [1]);
assert.equal(closed, 1);
assert.deepEqual([...scan(() => openRows([2, 3]))], [2, 3]);
assert.equal(closed, 2);
const failure = Error('read');
let released = false;
assert.throws(
  () => [
    ...scan(() => ({
      next() {
        throw failure;
      },
      close() {
        released = true;
      },
    })),
  ],
  (e) => e === failure,
);
assert.equal(released, true);
```

Generator execution begins at the first pull, when open runs. The for-of break calls return and executes finally; normal exhaustion and read failure also close. The cursor snapshot is shallow and suitable for these primitive rows. Real paged iteration can reduce retention without promising an immutable snapshot across database changes. This traversal adapter does not impose an item-count/deadline on an arbitrary cursor; callers need explicit budgets for untrusted or infinite sources.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

Opening a cursor before returning an unstarted generator is a common leak: return before its first next does not enter that generator’s finally. Explicitly own a never-consumed resource or acquire it lazily. A throwing close can replace a primary failure unless the API preserves both. Use arrays when the collection is small and already materialized.

<span class="notes-section-label">**Examiner follow-up**</span>

Does early break undo values already processed? No. Traversal cleanup and rollback of consumer effects are separate contracts.

::: tip Key takeaway
Iterator provides sequential traversal without exposing a collection’s representation.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Adapt the example to an async paged reader with cancellation. Acceptance: normal exhaustion, early break, read error, never-started iterator, close error policy and no overlapping/unbounded page requests.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-generator-objects). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### How does Memento restore owned state without exposing its internals? {#t18-q20}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Memento lets an originator capture/restores its state through snapshots held by a caretaker. **The caretaker need not inspect or mutate the snapshot.** Restoration is scoped to that originator’s owned state, not a guarantee that external effects can be undone.

</div>

<span class="notes-section-label">**Why and when**</span>

An editor owns text; a bounded history owner holds opaque checkpoint tokens. The originator controls which tokens are valid and how to restore them. This is different from a Command representing an action, though the two can cooperate in an undo design.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: memento.mjs
import assert from 'node:assert/strict';
function createEditor(initial = '') {
  let text = '';
  const snapshots = new WeakMap();
  function write(value) {
    if (typeof value !== 'string' || value.length > 4000) throw new RangeError('Text');
    text = value;
  }
  write(initial);
  return Object.freeze({
    write,
    read: () => text,
    checkpoint() {
      const token = Object.freeze({});
      snapshots.set(token, text);
      return token;
    },
    restore(token) {
      if (!snapshots.has(token)) throw new TypeError('Foreign checkpoint');
      text = snapshots.get(token);
    },
  });
}
const editor = createEditor('A'),
  history = [];
function remember() {
  history.push(editor.checkpoint());
  if (history.length > 3) history.shift();
}
remember();
editor.write('B');
remember();
editor.write('C');
editor.restore(history[0]);
assert.equal(editor.read(), 'A');
assert.deepEqual(Object.keys(history[0]), []);
assert.throws(() => createEditor('Other').restore(history[0]), /Foreign/);
assert.throws(() => editor.restore({}), /Foreign/);
assert.throws(() => editor.write('x'.repeat(4001)), RangeError);
assert.equal(editor.read(), 'A');
for (const value of ['D', 'E', 'F', 'G']) {
  editor.write(value);
  remember();
}
assert.equal(history.length, 3);
```

WeakMap entries bind opaque tokens to their originator’s string snapshots. The caretaker retains at most three tokens. Strings are immutable, so restoring an old value cannot mutate another checkpoint. Opaque tokens are not serializable durable checkpoints; JSON-copying the empty object loses its identity.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

An unbounded caretaker history still retains memory. A mutable object snapshot needs an explicit copy policy; an alias is not a memento. Cross-user history can expose private state. For persistence, define versioned checkpoint data and authorization separately. A direct immutable-state history is often simpler when opacity is not useful.

<span class="notes-section-label">**Examiner follow-up**</span>

Is Memento the same as event sourcing? No. A snapshot captures state; an event log records events under a separate durability/replay contract. A system can use both.

::: tip Key takeaway
Memento lets an originator capture/restores its state through snapshots held by a caretaker.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add redo behavior and document branching after a new edit. Acceptance: bounded past/future history, no-op policy, foreign-token rejection, snapshot isolation and no claim that restoring text rolls back a server write.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

---

### How does Visitor add operations to a stable object structure? {#t18-q23}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Visitor separates operations from a stable family of node types. Each node dispatches to the appropriate visitor method. **New operations become easier, while new node types require updating visitors.** This trade-off is the reason to choose it, not the accept method name.

</div>

<span class="notes-section-label">**Why and when**</span>

A small report-expression tree can support evaluation and readable formatting without adding both algorithms to each node. This bounded two-type structure is deliberately closed; a rapidly changing node taxonomy may fit a simple switch or different representation better.

<span class="notes-section-label">**Worked example — predict before running**</span>

```js
// file: visitor.mjs
import assert from 'node:assert/strict';
class Literal {
  constructor(value) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 100)
      throw new RangeError('Literal');
    this.value = value;
    this.depth = 0;
    Object.freeze(this);
  }
  accept(visitor) {
    return visitor.literal(this.value);
  }
}
class Add {
  constructor(left, right) {
    if (![left, right].every((x) => x instanceof Literal || x instanceof Add))
      throw new TypeError('Nodes');
    this.depth = 1 + Math.max(left.depth, right.depth);
    if (this.depth > 8) throw new RangeError('Depth');
    this.left = left;
    this.right = right;
    Object.freeze(this);
  }
  accept(visitor) {
    return visitor.add(this.left, this.right);
  }
}
class SumVisitor {
  literal(value) {
    return value;
  }
  add(left, right) {
    return left.accept(this) + right.accept(this);
  }
}
class TextVisitor {
  literal(value) {
    return String(value);
  }
  add(left, right) {
    return `(${left.accept(this)}+${right.accept(this)})`;
  }
}
const tree = new Add(new Literal(2), new Add(new Literal(3), new Literal(4)));
assert.equal(tree.accept(new SumVisitor()), 9);
assert.equal(tree.accept(new TextVisitor()), '(2+(3+4))');
assert.throws(() => new Add({}, new Literal(1)), TypeError);
assert.throws(() => tree.accept({ literal: (x) => x }), TypeError);
assert.throws(() => new Literal(-1), RangeError);
let deep = new Literal(1);
for (let i = 0; i < 8; i++) deep = new Add(deep, new Literal(1));
assert.throws(() => new Add(deep, new Literal(1)), /Depth/);
```

accept selects literal versus add; each visitor then implements its operation across those types. Adding TextVisitor did not change the nodes. A new Multiply node would require a matching method in every complete visitor. Immutable typed children and depth8 bound this binary traversal; it is not a parser for arbitrary external graphs.

<span class="notes-section-label">**Mistakes, alternatives and debugging**</span>

A visitor missing a node method fails at runtime in this JS representation; typed exhaustiveness/contracts can improve diagnostics. Do not let visitors mutate supposedly immutable nodes or hide authorization/effects in a formatting operation. Interpreter can use a visitor, but grammar semantics and operation organization are distinct concerns.

<span class="notes-section-label">**Examiner follow-up**</span>

Why not just put evaluate and format methods on nodes? That is often simpler for few stable operations. Visitor helps when operations vary more often than the node family.

::: tip Key takeaway
Visitor separates operations from a stable family of node types.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

- [ ] Add a node-count visitor without editing Literal/Add, then introduce Multiply and update every visitor. Acceptance: shared structure tests, incomplete-visitor failure, bounded depth and a clear explanation of the extension trade-off.

<span class="notes-section-label">**Official implementation reference**</span>

[Documentation](https://nodejs.org/download/release/v24.18.0/docs/api/assert.html). References explain runtime mechanics; the design choices and bounded contracts are the teaching examples above.

Security reference: [OWASP Node.js guidance](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html) supports avoiding untrusted-code execution; the bounded Interpreter is a domain-specific data evaluator.
