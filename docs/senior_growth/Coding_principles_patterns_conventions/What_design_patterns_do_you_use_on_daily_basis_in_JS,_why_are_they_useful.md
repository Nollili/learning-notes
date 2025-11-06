# Common JavaScript Design Patterns and Their Use Cases

Design patterns are **reusable solutions** to common problems in software design. In JavaScript, they help with **code organization, maintainability, and scalability**. Here’s a detailed overview of patterns commonly used in modern frontend development.

---

## 1️⃣ Module Pattern

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

## 2️⃣ Singleton Pattern

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

## 3️⃣ Factory Pattern

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

## 4️⃣ Observer / Pub-Sub Pattern

**Purpose:** Allow objects to **subscribe to events** and get notified when they occur.

**Example:**

```js
class EventEmitter {
    constructor() { this.events = {}; }
    on(event, listener) {
        (this.events[event] = this.events[event] || []).push(listener);
    }
    emit(event, data) {
        (this.events[event] || []).forEach(listener => listener(data));
    }
}

const emitter = new EventEmitter();
emitter.on('data', msg => console.log('Received:', msg));
emitter.emit('data', 'Hello World');
```

**Use Case:**

* UI updates, state management (Redux, React Context).
* Real-time notifications and decoupling components.

---

## 5️⃣ Strategy Pattern

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

## 6️⃣ Decorator Pattern

**Purpose:** Dynamically **add behavior** to objects without modifying their structure.

**Example:**

```js
function logger(fn) {
    return function (...args) {
        console.log('Calling function with args:', args);
        return fn(...args);
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

## 7️⃣ Prototype / Inheritance Pattern

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

## 8️⃣ Command Pattern

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

## 🧠 Why These Patterns Are Useful in Daily JS Development

1. **Code Reusability:** Avoid duplication, centralize logic.
2. **Maintainability:** Easier to extend and debug.
3. **Scalability:** Patterns like Observer and Module decouple components.
4. **Flexibility:** Strategy and Decorator allow dynamic behavior without modifying core logic.
5. **Consistency:** Standardized approach helps team development, especially in large projects.

---

> **Rule of Thumb:**
> Use patterns **where they make sense** — overusing them can add unnecessary complexity. Most SPAs rely heavily on **Module, Observer, Singleton, Factory, and Strategy** patterns.

