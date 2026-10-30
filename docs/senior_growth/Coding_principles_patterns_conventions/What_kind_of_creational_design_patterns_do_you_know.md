# What kind of creational design patterns do you know?

## Creational Design Patterns in JavaScript {#%F0%9F%8F%97%EF%B8%8F-creational-design-patterns-in-javascript}

**Creational design patterns** deal with **object creation mechanisms**. They **abstract the instantiation process**, making code more flexible and reusable.

---

## Singleton {#_1%EF%B8%8F%E2%83%A3-singleton}

**Purpose:** Ensure a class has **only one instance** and provide a global access point.

**Example:**
```js
class Logger {
  constructor() {
    if (Logger.instance) return Logger.instance;
    Logger.instance = this;
  }
  log(msg) { console.log(msg); }
}

const log1 = new Logger();
const log2 = new Logger();
console.log(log1 === log2); // true
```

**Use Cases:**

* Configuration objects
* Logging services
* Caching or shared resources

---

## Simple factory and Factory Method {#_2%EF%B8%8F%E2%83%A3-simple-factory-and-factory-method}

**Purpose:** Define an interface for creating objects, but **let subclasses decide which class to instantiate**.

**Simple factory example (selection in a function, not subclass-overridden Factory Method):**

```js
class User {}
class Admin extends User {}
class Guest extends User {}

function createUser(role) {
  if (role === 'admin') return new Admin();
  return new Guest();
}

const user = createUser('admin');
```

**Use Cases:**

* Dynamic object creation based on type or input
* Avoid exposing direct constructors to client code

---

## Abstract Factory {#_3%EF%B8%8F%E2%83%A3-abstract-factory}

**Purpose:** Provide an **interface for creating families of related objects** without specifying concrete classes.

**Partial illustration:** only buttons are shown; an Abstract Factory normally creates a coherent family, such as buttons and dialogs. A single `createButton` alone does not demonstrate family consistency.

```js
class Button {}
class MacButton extends Button {}
class WinButton extends Button {}

class GUIFactory {
  createButton() { throw new Error('Not implemented'); }
}

class MacFactory extends GUIFactory {
  createButton() { return new MacButton(); }
}

class WinFactory extends GUIFactory {
  createButton() { return new WinButton(); }
}
```

**Use Cases:**

* UI frameworks that support multiple platforms
* Consistent creation of related objects (buttons, windows, menus)

---

## Builder Pattern {#_4%EF%B8%8F%E2%83%A3-builder-pattern}

**Purpose:** Construct **complex objects step by step**, allowing different representations using the same construction process.

**Example:**

```js
class CarBuilder {
  constructor() { this.car = {}; }
  setEngine(engine) { this.car.engine = engine; return this; }
  setWheels(wheels) { this.car.wheels = wheels; return this; }
  build() { return this.car; }
}

const car = new CarBuilder().setEngine('V8').setWheels(4).build();
console.log(car); // { engine: 'V8', wheels: 4 }
```

**Use Cases:**

* Building complex objects with optional parts
* Fluent API designs
* React component configuration objects

---

## Prototype Pattern {#_5%EF%B8%8F%E2%83%A3-prototype-pattern}

**Purpose:** Create **new objects by cloning existing ones**, rather than instantiating via a constructor.

**Delegation example, not an own-property clone:**

```js
const person = { name: 'Alice', age: 25 };
const clone = Object.create(person);
clone.name = 'Bob';
console.log(Object.keys(clone)); // ['name']
console.log(clone.age); // 25, inherited from person
console.log(Object.hasOwn(clone, 'age')); // false
```

**Use Cases:**

* Avoid expensive object creation
* Implement undo/redo features
* Copying object templates

---

## Summary Table {#_6%EF%B8%8F%E2%83%A3-summary-table}

| Pattern          | Purpose                                   | Key Use Case                              |
| ---------------- | ----------------------------------------- | ----------------------------------------- |
| Singleton        | One instance only                         | Logging, config, caching                  |
| Factory Method   | Decouple object creation from client code | Dynamic object instantiation              |
| Abstract Factory | Create families of related objects        | Cross-platform UI elements                |
| Builder          | Step-by-step construction                 | Complex objects with many optional fields |
| Prototype        | Clone existing objects                    | Object templates, undo/redo, performance  |

---

### Senior Tips {#%E2%9C%85-senior-tips}

1. **Prefer composition over inheritance** in object creation when possible.
2. Use **Factory/Builder** to encapsulate creation logic and avoid exposing constructors.
3. Singleton should be used sparingly — often for shared services or configuration.
4. Prototype delegation shares inherited values; cloning costs and correctness depend on the representation. Do not promise memory/performance wins without measurement.
5. Creational patterns improve **code maintainability, scalability, and flexibility**.


## Ownership and creation checks

`Object.create(person)` sets the prototype; it does not copy `person`'s own properties. Reassigning `person.age` changes an inherited read until shadowed on the child. Nested objects are shared too. Spread copies enumerable own properties shallowly, so nested references remain shared. For supported structured data, `structuredClone` creates independent nested data, but cannot clone arbitrary functions/classes with their behavior. Undo needs an explicit snapshot/history policy; prototype delegation alone does not preserve an old state.

The builder above returns its exact mutable internal object: later setters mutate an already returned car. Either document one-shot ownership, reset after build, or return an appropriately independent validated snapshot. A shallow copy is insufficient if fields are nested. A module/class singleton is scoped to that module/runtime, not automatically one instance across workers or processes, and hidden global state complicates isolation.

This runnable Node24 example distinguishes simple factory selection from a subclass-overridden factory method and tests ownership:

```js
import assert from 'node:assert/strict';
class User { kind = 'user'; }
class Admin extends User { kind = 'admin'; }
class Guest extends User { kind = 'guest'; }
class UserCreator {
  createUser() { throw new Error('Implement creation'); }
  describe() { return this.createUser().kind; }
}
class GuestCreator extends UserCreator { createUser() { return new Guest(); } }
class AdminCreator extends UserCreator { createUser() { return new Admin(); } }
assert.equal(new GuestCreator().describe(), 'guest');
assert.equal(new AdminCreator().describe(), 'admin');
const original = {age: 25, preferences: {theme: 'light'}};
const delegated = Object.create(original);
assert.equal(Object.hasOwn(delegated, 'age'), false);
original.age = 26;
assert.equal(delegated.age, 26);
delegated.preferences.theme = 'dark';
assert.equal(original.preferences.theme, 'dark');
const shallow = {...original};
assert.equal(shallow.preferences, original.preferences);
const snapshot = structuredClone(original);
snapshot.preferences.theme = 'light';
assert.equal(original.preferences.theme, 'dark');
class CarBuilder {
  #car = {engine: 'electric', wheels: 4};
  setWheels(value) {
    if (!Number.isInteger(value) || value < 2 || value > 8) throw new RangeError('Invalid wheels');
    this.#car.wheels = value; return this;
  }
  build() { return Object.freeze({...this.#car}); }
}
const builder = new CarBuilder();
const first = builder.build(); builder.setWheels(6);
assert.equal(first.wheels, 4);
assert.equal(builder.build().wheels, 6);
assert.throws(() => builder.setWheels(0), RangeError);
```

**Validation:** exact block executed on Node24.18.0; ten assertions passed. No class hierarchy is needed for the earlier two-case simple factory; use Factory Method when the creator's workflow actually needs a replaceable creation hook. A validated options object is often clearer than a builder for a small configuration.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/patterns/What_kind_of_creational_design_patterns_do_you_know.md). All learner practice remains outstanding.
