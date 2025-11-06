# What kind of creational design patterns do you know?

# 🏗️ Creational Design Patterns in JavaScript

**Creational design patterns** deal with **object creation mechanisms**. They **abstract the instantiation process**, making code more flexible and reusable.

---

## 1️⃣ Singleton

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
````

**Use Cases:**

* Configuration objects
* Logging services
* Caching or shared resources

---

## 2️⃣ Factory Method

**Purpose:** Define an interface for creating objects, but **let subclasses decide which class to instantiate**.

**Example:**

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

## 3️⃣ Abstract Factory

**Purpose:** Provide an **interface for creating families of related objects** without specifying concrete classes.

**Example:**

```js
class Button {}
class MacButton extends Button {}
class WinButton extends Button {}

class GUIFactory {
  createButton() { throw 'Not implemented'; }
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

## 4️⃣ Builder Pattern

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

## 5️⃣ Prototype Pattern

**Purpose:** Create **new objects by cloning existing ones**, rather than instantiating via a constructor.

**Example:**

```js
const person = { name: 'Alice', age: 25 };
const clone = Object.create(person);
clone.name = 'Bob';
console.log(clone); // { name: 'Bob', age: 25 }
```

**Use Cases:**

* Avoid expensive object creation
* Implement undo/redo features
* Copying object templates

---

## 6️⃣ Summary Table

| Pattern          | Purpose                                   | Key Use Case                              |
| ---------------- | ----------------------------------------- | ----------------------------------------- |
| Singleton        | One instance only                         | Logging, config, caching                  |
| Factory Method   | Decouple object creation from client code | Dynamic object instantiation              |
| Abstract Factory | Create families of related objects        | Cross-platform UI elements                |
| Builder          | Step-by-step construction                 | Complex objects with many optional fields |
| Prototype        | Clone existing objects                    | Object templates, undo/redo, performance  |

---

### ✅ Senior Tips

1. **Prefer composition over inheritance** in object creation when possible.
2. Use **Factory/Builder** to encapsulate creation logic and avoid exposing constructors.
3. Singleton should be used sparingly — often for shared services or configuration.
4. Prototype pattern is memory-efficient for heavy objects but beware of shared mutable state.
5. Creational patterns improve **code maintainability, scalability, and flexibility**.

