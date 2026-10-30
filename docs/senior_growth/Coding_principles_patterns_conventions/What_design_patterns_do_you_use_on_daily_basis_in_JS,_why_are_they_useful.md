# Common JavaScript Design Patterns and Their Use Cases

Design patterns are **reusable solutions** to common problems in software design. In JavaScript, they help with **code organization, maintainability, and scalability**. Here’s a detailed overview of patterns commonly used in modern frontend development.

---

## Module Pattern {#_1%EF%B8%8F%E2%83%A3-module-pattern}

**Purpose:** Encapsulate code in a self-contained module with private and public members.

**Example:**
```js
const CounterModule = (() => {
    let count = 0; // private
    return {
        increment: () => count++,
        getCount: () => count
    };
})();
CounterModule.increment();
console.log(CounterModule.getCount()); // 1
```

**Use Case:**

* Organize code without polluting global scope.
* Provides **encapsulation** for functions and variables.

---

## Singleton Pattern {#_2%EF%B8%8F%E2%83%A3-singleton-pattern}

**Purpose:** Ensure a class or object has **only one instance** and provide a global point of access.

**Example:**

```js
class AppConfig {
    constructor() {
        if (AppConfig.instance) return AppConfig.instance;
        this.settings = {};
        AppConfig.instance = this;
    }
}
const config1 = new AppConfig();
const config2 = new AppConfig();
console.log(config1 === config2); // true
```

**Use Case:**

* Shared state across application (e.g., configuration, logging, caching).

---

## Factory Pattern {#_3%EF%B8%8F%E2%83%A3-factory-pattern}

**Purpose:** Create objects without exposing the instantiation logic to the client.

**Example:**

```js
class User {
    constructor(name, role) { this.name = name; this.role = role; }
}
class Admin extends User {}
class Guest extends User {}

function userFactory(name, role) {
    if (role === 'admin') return new Admin(name, role);
    return new Guest(name, role);
}

const user1 = userFactory('Alice', 'admin');
const user2 = userFactory('Bob', 'guest');
```

**Use Case:**

* Dynamic object creation based on conditions.
* Simplifies code when instantiating multiple types of objects.

---

## Observer / Pub-Sub Pattern {#_4%EF%B8%8F%E2%83%A3-observer-pub-sub-pattern}

**Purpose:** Allow objects to **subscribe to events** and get notified when they occur.

**Example:**

<<< ../../workbench/engineering/patterns/local-signal.ts{ts}

**Use Case:**

* UI updates, state management (Redux, React Context).
* Real-time notifications and decoupling components.

---

## Strategy Pattern {#_5%EF%B8%8F%E2%83%A3-strategy-pattern}

**Purpose:** Define a family of algorithms and make them **interchangeable** at runtime.

**Example:**

```js
const strategies = {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b
};
function executeStrategy(strategy, a, b) {
    return strategies[strategy](a, b);
}
console.log(executeStrategy('multiply', 2, 3)); // 6
```

**Use Case:**

* Switch between different behaviors without changing client code.
* Useful in validation, sorting, and dynamic UI behavior.

---

## Decorator Pattern {#_6%EF%B8%8F%E2%83%A3-decorator-pattern}

**Purpose:** Dynamically **add behavior** to objects without modifying their structure.

**Example:**

```js
function logger(fn) {
    return function (...args) {
        console.log('Function invoked'); // Fixed event only; do not log arbitrary/private arguments.
        return fn.apply(this, args);
    };
}

function sum(a, b) { return a + b; }
const loggedSum = logger(sum);
console.log(loggedSum(2, 3)); // logs args, returns 5
```

**Use Case:**

* Add logging, caching, or validation dynamically.
* Widely used in middleware (Express, Redux middleware).

---

## Prototype / Inheritance Pattern {#_7%EF%B8%8F%E2%83%A3-prototype-inheritance-pattern}

**Purpose:** Reuse behavior through prototypes instead of creating new instances.

**Example:**

```js
function Person(name) { this.name = name; }
Person.prototype.sayHi = function() { console.log(`Hi, I'm ${this.name}`); };

const alice = new Person('Alice');
alice.sayHi(); // Hi, I'm Alice
```

**Use Case:**

* Memory-efficient method sharing.
* Foundation for object-oriented JS and class-based patterns.

---

## Command Pattern {#_8%EF%B8%8F%E2%83%A3-command-pattern}

**Purpose:** Encapsulate requests as objects for **undo/redo**, queueing, or logging.

**Example:**

```js
class Command {
    constructor(execute) { this.execute = execute; }
}

const logCommand = new Command(msg => console.log('Log:', msg));
logCommand.execute('Hello World');
```

**Use Case:**

* Undo/redo in editors.
* Task queues, macros, or decoupled UI actions.

---

## Why These Patterns Are Useful in Daily JS Development {#%F0%9F%A7%A0-why-these-patterns-are-useful-in-daily-js-development}

1. **Code Reusability:** Avoid duplication, centralize logic.
2. **Maintainability:** Easier to extend and debug.
3. **Scalability:** Patterns like Observer and Module decouple components.
4. **Flexibility:** Strategy and Decorator allow dynamic behavior without modifying core logic.
5. **Consistency:** Standardized approach helps team development, especially in large projects.

---

> **Rule of Thumb:**
> Use patterns **where they make sense** — overusing them can add unnecessary complexity. Most SPAs rely heavily on **Module, Observer, Singleton, Factory, and Strategy** patterns.


## Ownership, subscription policy and singleton limits

LocalSignal takes a listener snapshot per emit: removal/addition during delivery affects later emits, not the captured list. A synchronous subscriber failure propagates to the emitter and stops later delivery in that emit; document and test that fail-fast policy. Each subscription has its own token even for the same callback, and its disposer is idempotent. Async subscribers need a different awaited/queued/rejection policy; the undefined callback result rejects ordinary async functions statically. This is not Node EventEmitter's complete API or special error-event contract.

The AppConfig singleton above is only per loaded module/realm/instance of the runtime, not one distributed process-wide truth. Mutable global singletons can share one user's request data with another, prolong cache retention and couple tests. Prefer a factory/injected owner for request/user/session state, with explicit disposal. A stateless shared configuration service may be appropriate; do not put a principal or private query cache into its global settings. Factory role selection creates objects, not permission: a caller-selected Admin class does not authorize a server action.

## Bounded undo and redo for owned text

<<< ../../workbench/engineering/patterns/text-history.ts{ts}

This stores immutable string snapshots with a bounded retained count; it does not undo server writes, revoke permissions or compensate an external payment. A new edit after undo drops the redo branch; a no-op preserves it. Current value plus retained snapshots still consumes memory proportional to string lengths; do not generalize this shallow text policy to aliased mutable object graphs. Multi-user history, collaborative transforms and effectful command compensation need separate designs.


References checked 2026-10-22: [Node event ordering/listener/error contracts](https://nodejs.org/api/events.html), [React effect/subscription ownership](https://react.dev/reference/react/useEffect), [state identity](https://react.dev/learn/preserving-and-resetting-state).


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/patterns/What_design_patterns_do_you_use_on_daily_basis_in_JS%2C_why_are_they_useful.md). All learner practice remains outstanding.
