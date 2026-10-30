# JavaScript inheritance, prototypes and ES2015 classes {#please-compare-js-inheritance-mehanisms-and-classic-oop-style-classes-what-about-es6-class}

JavaScript’s inheritance mechanism and **classic Object-Oriented Programming (OOP)** style inheritance have some significant differences, but there are also similarities. The introduction of **ES6 classes** in JavaScript brought a more structured and familiar syntax that mimics the behavior of classes in traditional OOP languages (such as Java or C++), though it still relies on JavaScript's **prototype-based inheritance** under the hood.

Let's break down and compare **JavaScript inheritance** (including **ES6 classes**) with **classic OOP inheritance**.

---

### **JavaScript Inheritance Mechanism (Prototype-based)** {#_1-javascript-inheritance-mechanism-prototype-based}

Before ES6, JavaScript used a **prototype-based inheritance model**. This is quite different from the **class-based inheritance** model commonly used in traditional OOP languages.

- **Prototype-based inheritance** means that an object has an internal prototype that is another object or null; Object.create(null) has no inherited Object.prototype.
- When you try to access a property on an object, if that property is not found on the object itself, JavaScript looks for the property on the object’s **prototype**. This process continues up the chain of prototypes until it either finds the property or reaches a null prototype. Ordinary objects commonly pass through Object.prototype, whose own prototype is null.

Here’s an example of **prototype-based inheritance**:

```jsx
// Parent Object (Prototype)
const Animal = {
  speak: function() {
    console.log('Animal speaks');
  }
};

// Child Object that inherits from Animal
const dog = Object.create(Animal);
dog.bark = function() {
  console.log('Woof!');
};

dog.speak();  // Output: Animal speaks (inherited from Animal prototype)
dog.bark();   // Output: Woof! (defined on the dog object)

```

### **Key Points of Prototype-based Inheritance:**

- **Objects Inherit from Other Objects**: In JavaScript, objects directly inherit from other objects (prototypes).
- **Dynamic and Flexible**: You can add new properties or methods to an object’s prototype at runtime.
- **No Classes**: JavaScript doesn’t have classes in the traditional OOP sense until ES6. Instead, you work with objects and prototypes.
- **Constructor Functions**: Before ES6, JavaScript used **constructor functions** to create objects and set up inheritance.

---

### **Classic OOP Inheritance (Class-based)** {#_2-classic-oop-inheritance-class-based}

In classical OOP languages like **Java** or **C++**, inheritance is based on **classes**. A **class** is a blueprint that defines the properties and methods common to all objects of that type. A class can inherit from another class, meaning it can take on properties and methods from the parent class.

Here's a basic example of **class-based inheritance** in Java:

```java
// Parent class
class Animal {
    void speak() {
        System.out.println("Animal speaks");
    }
}

// Child class that extends Animal
class Dog extends Animal {
    void bark() {
        System.out.println("Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog();
        dog.speak();  // Output: Animal speaks (inherited from Animal class)
        dog.bark();   // Output: Woof! (defined in Dog class)
    }
}
```

### **Key Points of Class-based Inheritance (Classic OOP):**

- **Classes Define Blueprints**: A class is a blueprint or template for creating objects (instances).
- **Inheritance via `extends`**: A class can **extend** another class, inheriting its properties and methods. This is a formal and rigid structure for creating relationships between objects.
- **Encapsulation and Abstraction**: Classes often provide a more formal and enforceable structure for managing object state and behavior.
- **Static and Rigid**: The class structure is often more static, meaning it is defined upfront and not as flexible as JavaScript's prototype-based system.

---

### **ES6 Classes in JavaScript** {#_3-es6-classes-in-javascript}

With **ES6 (ECMAScript 2015)**, JavaScript introduced the `class` syntax, which allows you to create **class-like structures** with a syntax that is similar to traditional OOP languages.

However, despite the syntactic sugar, ES6 **classes** are still based on **prototype inheritance** under the hood. So, when you use classes in JavaScript, you are still fundamentally working with prototypes, but the class syntax provides a more structured and familiar way to write and manage code.

### **ES6 Class Syntax Example**:

```js
// Parent Class
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} says hello`);
  }
}
```
// Child Class that extends Animal
```js
class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // Call the parent class's constructor
    this.breed = breed;
  }

  bark() {
    console.log('Woof!');
  }
}
```
```js
const myDog = new Dog('Buddy', 'Golden Retriever');
myDog.speak();  // Output: Buddy says hello (inherited from Animal)
myDog.bark();   // Output: Woof! (defined in Dog)
```

### **Key Points of ES6 Classes in JavaScript:**

- **Structured syntax with additional semantics**: ES6 classes provide a **readable syntax** for creating objects and working with inheritance. It makes the prototype-based inheritance easier to understand and work with.
- **`constructor`**: The `constructor` method is used to initialize object properties when a new instance is created.
- **`super()`**: The `super()` method is used to call the parent class’s constructor and methods.
- **Prototype-based**: Internally, **ES6 classes** still use the same prototype-based inheritance as before, instance methods declared with method syntax are on the prototype; instance fields (including arrow fields) are own properties and static members live on the constructor.

---

### **Comparison of Prototype Inheritance vs. ES6 Classes vs. Classic OOP Inheritance**

| **Aspect** | **JavaScript Prototype-based Inheritance** | **ES6 Classes (JavaScript)** | **Classic OOP Classes (e.g., Java, C++)** |
| --- | --- | --- | --- |
| **Syntax** | Flexible, uses `Object.create` or constructor functions | Uses `class` syntax for structure | Formal, uses `class` and `extends` keywords |
| **Inheritance** | Inherited via prototypes (objects linked to other objects) | Inherits via prototypes but with class syntax | Inherits via `extends` keyword (classes) |
| **Flexibility** | Highly flexible (properties and methods can be added at runtime) | Still flexible (methods are added to the class’s prototype) | Less flexible (inheritance structure is more rigid) |
| **Encapsulation** | Manual encapsulation using closures | Encapsulation via class properties and methods | Encapsulation via class properties, methods, and access modifiers (`private`, `public`) |
| **Method Definition** | Methods defined on prototypes | Methods defined inside the class body | Methods defined inside the class body |
| **Constructor Functionality** | Objects are initialized by functions | Constructor method (`constructor`) for initialization | Constructor method for initialization |
| **Inheritance Mechanism** | Direct object-to-object inheritance (via prototypes) | Inherits through prototype chain (same as before, but cleaner syntax) | Class-based inheritance through `extends` keyword |
| **Class Support** | No native class syntax (use of constructor functions) | Native `class` syntax (sugar over prototype) | Native `class` syntax |

---

### **Why Use ES6 Classes in JavaScript?**

- **Cleaner Syntax**: ES6 classes make the code easier to understand for developers familiar with traditional OOP.
- **Familiarity**: If you come from an OOP language background, classes provide a familiar way to organize and structure code.
- **Better Organization**: Classes help you organize your code better and define clear blueprints for objects.
- **ES6 Classes Still Use Prototypes**: Despite the cleaner syntax, ES6 classes don’t change the underlying inheritance mechanism (which is prototype-based). They just provide a more structured approach to working with prototypes.

### **When to Use Prototype-based Inheritance vs ES6 Classes?**

- **Use ES6 classes** when:
    - You want cleaner and more readable code.
    - You prefer a more structured and object-oriented approach to working with inheritance.
    - You are working in a team and want to follow a standard, class-based inheritance pattern.
- **Use prototype-based inheritance** when:
    - You need more flexibility (e.g., adding properties to objects dynamically at runtime).
    - You want a deeper understanding of JavaScript’s internal mechanics.
    - You are working with legacy code or libraries that use prototype-based patterns.

---

### **Summary**

- **Prototype-based inheritance** is JavaScript’s original and dynamic inheritance model, where objects directly inherit from other objects through the prototype chain.
- **ES6 classes** provide a cleaner and more structured syntax for working with prototype-based inheritance. They make the prototype system easier to work with but are fundamentally still based on prototypes.
- **Classic OOP inheritance** (like in Java or C++) is class-based, where classes define the blueprint for objects and relationships between them are rigid and defined upfront.

JavaScript’s **ES6 classes** are an improvement over the old prototype-based inheritance system, but they are still built on the same underlying concept of **prototypes**.
## Class semantics are more than a mechanical constructor rewrite

Class code is strict, class declarations have lexical initialization/TDZ behavior and the constructor cannot be called without new. Prototype methods are non-enumerable; static methods belong to the constructor; instance fields belong to instances. `#private` fields enforce branded access, unlike a conventionally named `_private` property. An object with the same visible shape is not automatically an instance with that private brand. `extends` links both the instance-prototype chain and constructor chain; super property access uses its method's home-object relationship.

A class field arrow allocates per instance and captures this, while a prototype method needs a receiver at the call site. Do not infer those semantics from a simplistic “just syntax sugar” slogan.

```js
class Counter {
  #value = 0;
  increment() { this.#value += 1; return this.#value; }
  static purpose() { return 'count'; }
}
const counter = new Counter();
console.log(Object.getPrototypeOf(counter) === Counter.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null
console.log(Object.keys(Counter.prototype)); // []: methods are not enumerable
// Counter(); // TypeError: constructor requires new
// Counter.prototype.increment.call({}); // TypeError: receiver lacks #value brand
```

## Domain composition: independent delivery and rendering policies

An inheritance tree such as EmailPdfReport/EmailHtmlReport/SmsTextReport grows with combinations and can violate substitutability if a subclass rejects inputs its parent accepts. Model independent behavior as small injected capabilities when their axes vary independently. Inheritance remains appropriate for a genuine stable subtype with a documented substitutable contract; composition is a design choice, not an automatic performance win.

```js
export function createProgressReporter({ render, deliver }) {
  if (typeof render !== 'function' || typeof deliver !== 'function')
    throw new TypeError('render and deliver functions required');
  return Object.freeze({
    async report(progress, { signal } = {}) {
      if (!progress || typeof progress.courseId !== 'string' ||
          !Number.isSafeInteger(progress.completed) || progress.completed < 0)
        throw new TypeError('Invalid progress');
      signal?.throwIfAborted();
      const message = render({ courseId: progress.courseId, completed: progress.completed });
      if (typeof message !== 'string') throw new TypeError('Renderer must return text');
      signal?.throwIfAborted();
      await deliver(message, { signal });
    }
  });
}
const delivered = [];
const reporter = createProgressReporter({
  render: progress => `${progress.courseId}: ${progress.completed} completed`,
  deliver: async text => { delivered.push(text); } // In-memory adapter, not real email.
});
await reporter.report({ courseId: 'c1', completed: 3 });
console.log(delivered); // ['c1: 3 completed']
```

The render contract is synchronous and returns text; delivery is async and must honor cancellation if promised by its adapter. ThrowIfAborted before delivery does not forcibly stop a noncooperative transport. Do not silently retry a non-idempotent delivery: define deduplication/retry semantics at the adapter/service boundary. This example performs no network delivery. Rendering plain text here is not safe HTML templating; escape/validate according to the actual output sink. Input projection prevents a renderer receiving unrelated caller fields, but full course authorization and business bounds remain the service's responsibility.


References checked2026-10-21: [ECMAScript classes](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-class-definitions), [Object.getPrototypeOf](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.getprototypeof), [AbortSignal](https://dom.spec.whatwg.org/#interface-abortsignal).


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/Please_compare_JS_inheritance_mehanisms_and_classi_177e8106c24d800d8f10dc65127d722c.md). All learner practice remains outstanding; the worked examples above are explanatory material.
