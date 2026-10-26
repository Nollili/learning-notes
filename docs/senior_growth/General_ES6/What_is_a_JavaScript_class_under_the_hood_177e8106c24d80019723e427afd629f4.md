### What is a JavaScript class under the hood?

Under the hood, a **JavaScript class** is essentially **syntactic sugar** for JavaScript's existing **prototypal inheritance** mechanism. It provides a cleaner and more structured syntax for defining objects and their behavior compared to using constructor functions and directly modifying prototypes. Let's break this down step by step:

---

### **What Happens When You Define a Class?**

When you define a class in JavaScript, the JavaScript engine:

1. **Creates a Function**:
    - The `class` keyword internally creates a special type of function called a "class constructor."
    - The resulting value has typeof function but special construction semantics; it cannot be called like an ordinary function.
2. **Sets Up a Prototype**:
    - The methods you define inside the class are added to the class's prototype (`MyClass.prototype`).
    - This allows objects created using the class to share methods via the prototype chain, maintaining memory efficiency.
3. **Marks it as Non-Callable Without `new`**:
    - Unlike regular functions, class constructors cannot be called without the `new` keyword. Attempting to do so results in a `TypeError`.

---

### **Example Class and Its Under-the-Hood Behavior**

**Class Definition:**

```jsx
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hello, my name is ${this.name}.`);
  }
}

const john = new Person("John");
john.greet(); // Output: "Hello, my name is John."

```

**Approximation using a function constructor (not fully equivalent):**

```jsx
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  console.log(`Hello, my name is ${this.name}.`);
};

const john = new Person("John");
john.greet(); // Output: "Hello, my name is John."

```

---

### **Key Characteristics of JavaScript Classes**

1. **Internally Functions**:
    - A class is just a constructor function with additional semantics.
    - You can verify this:
        
        ```jsx
        console.log(typeof Person); // Output: "function"
        
        ```
        
2. **Prototypal Inheritance**:
    - Methods defined in the class (e.g., `greet`) are stored on the prototype:
        
        ```jsx
        console.log(Person.prototype.greet); // Function definition of greet
        console.log(john.__proto__ === Person.prototype); // true
        
        ```
        
3. **`new` Enforcement**:
    - Classes cannot be invoked without `new`:
        
        ```jsx
        const jane = Person("Jane"); // TypeError: Class constructor Person cannot be invoked without 'new'
        
        ```
        
4. **Static Methods**:
    
    https://www.youtube.com/watch?v=UOH4SAG3BoQ&ab_channel=BroCode
    
    - Methods defined with the `static` keyword are attached to the class itself, not the prototype:
        
        ```jsx
        class Person {
          static species() {
            return "Homo sapiens";
          }
        }
        
        console.log(Person.species()); // "Homo sapiens"
        
        ```
        
    
    **Under the Hood:**
    
    ```jsx
    Person.species = function () {
      return "Homo sapiens";
    };
    
    ```
    
5. **Class Fields (Modern Feature)**:
    - Public and private fields (introduced in ES2022) provide a way to define properties directly inside the class body:
        
        ```jsx
        class Person {
          name = "Anonymous"; // Public field
          #age = 30; // Private field (accessible only within the class)
        
          showAge() {
            console.log(this.#age);
          }
        }
        
        ```
        
    
    **Under the Hood**:
    
    - Public fields define own data properties on the instance; this differs from assignment through a potentially inherited setter.
    - Private fields use a special internal mechanism to ensure privacy.

---

### **Key Differences Between Classes and Constructor Functions**

| **Aspect** | **Class** | **Constructor Function** |
| --- | --- | --- |
| **Definition Syntax** | Uses the `class` keyword. | Uses a plain function. |
| **Prototype Assignment** | Automatically assigns methods to `prototype`. | Requires manual assignment to `prototype`. |
| **Call Without `new`** | Throws TypeError. | Normal invocation rules: strict plain-call this undefined, sloppy plain-call global substitution, method receiver otherwise. |
| **Static Methods** | Defined using `static` keyword. | Assigned manually to the constructor itself. |
| **Private Fields** | Supported (using `#` syntax). | Not natively supported; requires workarounds. |

---

### **Why Use Classes?**

1. **Readability**: Provides a clear and concise syntax for defining objects and their behavior.
2. **Structure**: Encourages organized and modular code, particularly for developers coming from traditional OOP languages.
3. **Modern Features**: Offers additional functionality like static methods, private fields, and more.

---

### **In Summary**

Under the hood:

- A **class** is just a constructor function with syntactic sugar.
- It relies on **prototypal inheritance** for sharing methods and properties among instances.
- It enforces stricter semantics (e.g., requiring `new`) and introduces modern features (e.g., private fields).
## Where the constructor approximation breaks

Class bodies are strict; prototype methods are nonenumerable; a class declaration has a temporal dead zone; private fields use brand checks rather than ordinary property names. Public fields initialize own properties and instance field arrows allocate per-instance functions. Methods normally live on the prototype, while static methods live on the constructor. These are language semantics, not just formatting preferences.

```js
class ClassExample { method() { return this; } }
function FunctionExample() {}
FunctionExample.prototype.method = function () { return this; };
console.log(Object.getOwnPropertyDescriptor(ClassExample.prototype, 'method').enumerable); // false
console.log(Object.getOwnPropertyDescriptor(FunctionExample.prototype, 'method').enumerable); // true

class Base { set value(next) { throw new Error('inherited setter'); } }
class WithField extends Base { value = 1; }
class WithAssignment extends Base { constructor() { super(); this.value = 1; } }
console.log(new WithField().value); // 1: own field definition bypasses inherited setter
// new WithAssignment(); // Throws: assignment invokes inherited setter

class Secret {
  #value = 42;
  read() { return this.#value; }
}
const secret = new Secret();
console.log(secret.read()); // 42
// secret.read.call({}); // TypeError: receiver lacks the private brand
```

In derived constructors, call super before using this. Static fields and instance fields initialize at different times; do not call an overridable method from a base constructor expecting derived fields to exist already. Detached prototype methods lose their receiver; bind or wrap deliberately and keep callback identity for cleanup. Private fields are not a serialization format; JSON/string spreads do not export them automatically.

**Trade-off:** shared prototype methods reduce per-instance function allocation; arrow fields make detached callbacks convenient but have per-instance identity and different override/super behavior. Composition with explicit dependencies can avoid an inheritance tree when behavior varies independently.

**Exercise:** inspect property descriptors and prototypes of the class/function examples, then test field-versus-assignment and private-brand failure. Acceptance: expected false/true enumerable flags; field construction succeeds while setter assignment fails; detached private method fails without binding; subclass does not read uninitialized fields. Do not describe a hand-written constructor as fully equivalent without matching these behaviors.

Official references: [ECMA class definitions and field initialization](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-class-definitions), [property descriptors](https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html). Checked2026-10-20; Node24.18.0 baseline.
