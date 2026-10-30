# Can you decipher SOLID acronym? What is "L"?

## SOLID Principles in OOP {#%F0%9F%8F%97%EF%B8%8F-solid-principles-in-oop}

**SOLID** is an acronym describing **five principles for writing maintainable, scalable, and robust object-oriented code**.  

- S — **Single Responsibility Principle (SRP)**
- O — **Open/Closed Principle (OCP)**
- L — **Liskov Substitution Principle (LSP)**
- I — **Interface Segregation Principle (ISP)**
- D — **Dependency Inversion Principle (DIP)**

---

## L — Liskov Substitution Principle (LSP) {#%F0%9F%94%B9-l-%E2%80%94-liskov-substitution-principle-lsp}

**Definition:**  
Behavioral subtyping means callers relying on a base contract can use a subtype while preserving that contract. This is a study paraphrase, not a verbatim quotation.

In simple terms: **Subtypes must be substitutable for their base types.**

### Key Idea {#%E2%9C%85-key-idea}
- Subclasses should **honor the behavior** of their parent classes.
- They should not **break expected functionality**.
- No unexpected side effects when replacing a base class with a derived class.

---

### Example (Violation of LSP)
```js
class Bird {
  fly() { console.log('Flying'); }
}

class Penguin extends Bird {
  fly() { throw new Error('Penguins cannot fly'); }
}

function makeBirdFly(bird) {
  bird.fly();
}

const penguin = new Penguin();
makeBirdFly(penguin); // Throws error, violates LSP
```

**Problem:** `Penguin` cannot fully substitute `Bird`.

---

### Correct Approach (Respect LSP)

```js
class Bird {}
class FlyingBird extends Bird {
  fly() { console.log('Flying'); }
}
class Penguin extends Bird {}

const birds = [new FlyingBird(), new Penguin()];
// Only call fly on birds that can fly
birds.forEach(bird => {
  if (bird.fly) bird.fly(); // safe
});
```

* Alternatively, **split interfaces** so that only flying birds have `fly()` method.
* Ensures subclasses can always substitute base types without breaking behavior.

---

### Why LSP Matters {#%E2%9C%85-why-lsp-matters}

* Makes **polymorphism reliable**
* Avoids runtime errors from incompatible subclasses
* Improves **code maintainability and predictability**
* Essential for **clean, extensible OOP design**

---

> **Tip for Senior Developers:**
> When designing class hierarchies, always ask:
> *“If I replace the parent class with this subclass, will existing code still work correctly?”*


## S – Single Responsibility Principle (SRP) {#_1%EF%B8%8F%E2%83%A3-s-%E2%80%93-single-responsibility-principle-srp}

- **Definition:** A class or module should have **only one reason to change**, meaning it should have **only one responsibility**.
- **Why important:** Reduces complexity, improves maintainability, and makes code easier to test.
- **Example:**
```ts
  // Bad: Handles both data storage and email notification
  class UserManager {
    saveUser(user) { /* ... */ }
    sendWelcomeEmail(user) { /* ... */ }
  }

  // Good: Separate responsibilities
  class UserRepository {
    save(user) { /* ... */ }
  }
  class EmailService {
    sendWelcomeEmail(user) { /* ... */ }
  }
```

---

## O – Open/Closed Principle (OCP) {#_2%EF%B8%8F%E2%83%A3-o-%E2%80%93-open-closed-principle-ocp}

* **Definition:** Software entities (classes, modules, functions) should be **open for extension but closed for modification**.
* **Why important:** Allows adding new functionality without changing existing code, reducing risk of bugs.
* **Illustrative pseudocode** (omits implementations; not standalone compilable TypeScript):

  ```ts
  interface Shape { area(): number; }

  class Rectangle implements Shape { /* ... */ }
  class Circle implements Shape { /* ... */ }

  function calculateArea(shapes: Shape[]) {
    return shapes.reduce((sum, shape) => sum + shape.area(), 0);
  }
  ```

---

## I – Interface Segregation Principle (ISP) {#_4%EF%B8%8F%E2%83%A3-i-%E2%80%93-interface-segregation-principle-isp}

* **Definition:** Clients should not be forced to depend on interfaces they **do not use**. Use multiple, small, specific interfaces instead of one large one.
* **Why important:** Reduces coupling and improves maintainability.
* **Illustrative pseudocode** (omits implementations; not standalone compilable TypeScript):

  ```ts
  interface Printer { print(): void; }
  interface Scanner { scan(): void; }

  class MultiFunctionDevice implements Printer, Scanner { /* ... */ }
  ```

---

## D – Dependency Inversion Principle (DIP) {#_5%EF%B8%8F%E2%83%A3-d-%E2%80%93-dependency-inversion-principle-dip}

* **Definition:** High-level modules should **not depend on low-level modules**; both should depend on **abstractions**. Abstractions should not depend on details; **details should depend on abstractions**.
* **Why important:** Promotes decoupling and easier testing (e.g., via dependency injection).
* **Illustrative pseudocode** (omits implementations; not standalone compilable TypeScript):

  ```ts
  interface MessageService { send(msg: string): void; }

  class EmailService implements MessageService { send(msg: string) { /* ... */ } }

  class Notification {
    constructor(private service: MessageService) {}
    notify(msg: string) { this.service.send(msg); }
  }
  ```

## Behavioral contracts and dependency substitution

Matching a TypeScript interface only establishes structural shape. LSP also needs accepted inputs (**preconditions**), promised outputs/effects (**postconditions**) and state rules that remain true (**invariants**). A replacement must not require stronger inputs, weaken promised outputs or introduce prohibited effects. Exceptions, ordering, async completion and cancellation are observable parts of the contract. Document them; finite tests provide evidence, not a proof for all inputs.

Worked port: `find(id)` accepts any positive safe integer; missing users produce `undefined`, malformed IDs reject with `RangeError`; a read does not mutate stored state, and returned objects cannot mutate later reads. A cache-backed or SQL adapter must obey the same semantic contract, including misses and failure policy. This fixture compares two local implementations, not a live database.

```ts
import assert from 'node:assert/strict';
type User = {id: number; name: string};
interface UserReader {find(id: number): Promise<User | undefined>}
const requireId = (id: number) => {
  if (!Number.isSafeInteger(id) || id <= 0) throw new RangeError('Invalid id');
};
class MemoryReader implements UserReader {
  #rows = new Map<number, User>();
  constructor(rows: User[]) {for (const row of rows) this.#rows.set(row.id, {...row});}
  async find(id: number) {requireId(id); const row = this.#rows.get(id); return row ? {...row} : undefined;}
}
function delegatedReader(source: UserReader): UserReader {
  return {find: id => source.find(id)};
}
async function contract(reader: UserReader) {
  const first = await reader.find(1);
  assert.deepEqual(first, {id: 1, name: 'Ada'});
  assert.equal(await reader.find(2), undefined);
  await assert.rejects(() => reader.find(0), RangeError);
  await assert.rejects(() => reader.find(1.5), RangeError);
  if (!first) throw new Error('Expected fixture user');
  first.name = 'Changed by caller';
  assert.deepEqual(await reader.find(1), {id: 1, name: 'Ada'});
}
const seed = [{id: 1, name: 'Ada'}];
const memory = new MemoryReader(seed);
seed[0]!.name = 'Changed after construction';
await contract(memory);
await contract(delegatedReader(new MemoryReader([{id: 1, name: 'Ada'}])));
// Compiles against the interface but strengthens the precondition: missing IDs throw.
const incompatible: UserReader = {async find(id) {
  requireId(id); if (id !== 1) throw new Error('Missing user');
  return {id: 1, name: 'Ada'};
}};
await assert.rejects(() => contract(incompatible), /Missing user/);
```

The negative substitution is intentionally rejected by the shared suite. A production network adapter can fail with documented availability errors; silently redefining “not found” as an exception would still break this port. Dependency inversion lets the high-level use case depend on this small contract; dependency injection supplies an implementation. Neither requires a container or a class for every function.

**Validation:** TypeScript5.9.3 strict compilation (including indexed-access checks), Node24.18.0: two conforming adapters pass the five-assertion suite; an interface-compatible violating adapter is caught. The seed/returned-object mutation cases guard ownership. [Creation/ownership corrections](./What_kind_of_creational_design_patterns_do_you_know.md#ownership-and-creation-checks) cover prototype delegation versus copying and actual Factory Method; [shipping-rule Strategy](./Please_describe_Strategy_design_pattern._What_are_the_valid_use_cases_for_it.md#worked-change-inject-a-shipping-quote-rule) justifies variation using a concrete change rather than applying a pattern mechanically.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/patterns/Can_you_decipher_SOLID_acronym_What_is_%22L%22.md). All learner practice remains outstanding.
