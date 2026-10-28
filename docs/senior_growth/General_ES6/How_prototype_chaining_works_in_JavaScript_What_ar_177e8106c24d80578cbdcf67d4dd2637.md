### How prototype chaining works in JavaScript? What are classes?

### **Prototype Chaining in JavaScript**

An ordinary JavaScript object has an internal prototype link whose value is another object or null. A prototype is another object that serves as a blueprint or template for the object, containing properties and methods. This allows objects to **inherit properties and methods** from their prototypes, enabling a chain of inheritance.

This concept is called **prototype chaining**, and it is fundamental to how inheritance works in JavaScript.

https://www.youtube.com/watch?v=bsEIwvXoBxE&ab_channel=ColorCode

https://www.youtube.com/watch?v=evACeKnMCrU&ab_channel=LinkedInLearning

---

### **How Prototype Chaining Works**

When you try to access a property or method on an object, JavaScript first checks if the object has the property. If it doesn't, JavaScript looks up the **prototype** of that object. If the prototype also doesn't have the property, it continues looking at the **prototype of the prototype**, and so on, up the prototype chain. Lookup ends when a property is found or the prototype link becomes null. Many ordinary objects pass through Object.prototype, but Object.create(null) does not.

- If the property is not found at any level in the prototype chain, it returns `undefined`.

Let’s break this down with an example:

```jsx
// Parent object (prototype)
const animal = {
  species: "Dog",
  speak: function() {
    console.log("Woof!");
  }
};

// Child object that inherits from animal
const dog = Object.create(animal);
dog.name = "Buddy";

console.log(dog.name);     // Output: Buddy
console.log(dog.species);  // Output: Dog (inherited from `animal` prototype)
dog.speak();              // Output: Woof! (inherited from `animal` prototype)
```

### **Explanation:**

- The `dog` object is created using `Object.create(animal)`, which sets `animal` as the prototype of `dog`.
- When we access `dog.name`, JavaScript finds it directly on the `dog` object.
- When we access `dog.species`, JavaScript doesn’t find `species` on `dog`, so it looks up the prototype chain and finds it on `animal`.
- Similarly, when calling `dog.speak()`, JavaScript looks for `speak` in `dog`, doesn't find it, and then looks on `animal`, finding the method and calling it.

This is **prototype chaining** in action: `dog` has a direct reference to `animal`, which is why it can access properties and methods from `animal` even though they are not directly on the `dog` object.

---

### **The Prototype Chain**

The prototype chain forms a hierarchy that typically looks like this:

```text
dog -> animal -> Object.prototype -> null
```

- **dog** is the object we created.
- **animal** is the prototype of `dog`.
- Object.prototype participates in many ordinary chains; its own prototype is null. Null-prototype objects are a counterexample to “all objects inherit Object.prototype”.

Prefer Object.getPrototypeOf for inspection; __proto__ is a legacy accessor and can be shadowed or absent.

```jsx
console.log(Object.getPrototypeOf(dog));  // Outputs the `animal` object (prototype of `dog`)
console.log(Object.getPrototypeOf(dog) === animal);  // Output: true
console.log(Object.getPrototypeOf(animal));  // Outputs Object.prototype
```

---

### **What Are Classes in JavaScript?**

https://www.youtube.com/watch?v=bq_jZY6Skto&ab_channel=freeCodeCamp.org

Classes in JavaScript are a **syntactic sugar** over JavaScript's existing prototype-based inheritance. They provide a cleaner, more readable way to create objects and handle inheritance. Prior to **ES6**, JavaScript used constructor functions and prototypes directly to implement inheritance. With the introduction of **classes** in **ES6**, creating and working with objects became more familiar to developers coming from class-based languages like Java or C++.

However, behind the scenes, JavaScript classes still rely on the **prototype chain** for inheritance. Classes are essentially a more structured and easier-to-use way of defining object blueprints.

### **Basic Class Syntax**

Here's how you would define a class in JavaScript:

```jsx
class Animal {
  // Constructor to initialize properties
  constructor(name, species) {
    this.name = name;
    this.species = species;
  }

  // Method in the class
  speak() {
    console.log(`${this.name} says hello!`);
  }
}

const dog = new Animal("Buddy", "Dog");
dog.speak();  // Output: Buddy says hello!
console.log(dog.species);  // Output: Dog
```

### **Explanation:**

- **Class Declaration**: `class Animal { ... }` defines a class named `Animal`.
- **Constructor Method**: The `constructor` method is automatically called when a new object is created from the class using the `new` keyword. It sets the initial properties for each instance.
- **Methods**: The `speak()` method is added to the `Animal` class, and every object created from this class will have access to it.

### **Class Inheritance**

You can use **class inheritance** to create subclasses that extend a parent class. This is how you would use the `extends` keyword to inherit from another class:

```jsx
class Dog extends Animal {
  constructor(name, breed) {
    super(name, "Dog");  // Calls the parent class constructor
    this.breed = breed;
  }

  // Overriding the `speak` method
  speak() {
    console.log(`${this.name} says woof!`);
  }
}

const myDog = new Dog("Buddy", "Golden Retriever");
myDog.speak();  // Output: Buddy says woof!
console.log(myDog.species);  // Dog: own property initialized by super(), not a prototype field.
console.log(myDog.breed);    // Output: Golden Retriever
```

### **Explanation:**

- **`extends`**: The `Dog` class extends the `Animal` class, meaning it inherits all properties and methods from `Animal`.
- **`super()`**: The `super` keyword is used to call the parent class's constructor. In this case, it sets the `name` and `species` properties on the `Dog` object.
- **Overriding Methods**: The `speak()` method is overridden in the `Dog` class to change its behavior.

### **Classes vs Prototypes**

Even though classes look like they provide a more traditional object-oriented approach, they still use the underlying prototype-based inheritance. The class methods are added to the prototype of the class.

Here’s how classes and prototypes work together:

```jsx
console.log(Dog.prototype);  // Shows the prototype of Dog class (contains `speak` method)
console.log(Dog.prototype.constructor);  // Shows the constructor (Dog function itself)
```

---

### **Key Differences Between Prototypes and Classes**

- **Prototypes**:
    - Prototypes are the traditional way of defining inheritance in JavaScript.
    - Prototype links can be objects or null; Object.create(null) has no inherited methods.
    - You can define methods directly on an object or its prototype.
    - It is more flexible but requires more manual setup and can be harder to understand for beginners.
- **Classes**:
    - Classes are introduced as a more structured, cleaner way to define blueprints for objects.
    - They provide syntax for inheritance, constructors, and method definitions in a way that's familiar to developers from class-based languages.
    - Under the hood, JavaScript classes are still prototype-based.

### **When to Use Which?**

- Use **prototypes** if you need maximum flexibility and don’t mind a less structured approach.
- Use **classes** if you prefer a cleaner, more structured syntax and are working in a team or with other developers who are familiar with class-based inheritance.

---

### **Summary**

- **Prototype Chaining**: In JavaScript, objects inherit properties and methods from their prototypes. If a property is not found on an object, JavaScript looks up the prototype chain until it finds the property or reaches a null prototype link.
- **Classes**: Classes in JavaScript are a syntactic sugar over prototype-based inheritance, providing a more familiar and structured way to define objects, constructors, and inheritance.

JavaScript’s class system makes working with inheritance easier, but under the hood, it still relies on prototypes. Classes are just a more readable and modern way to interact with the same prototype-based mechanism that has always existed in JavaScript.
## Ownership, shadowing and composition

```js
const prototype = { tags: [], greet() { return this.name; } };
const one = Object.create(prototype);
const two = Object.create(prototype);
one.name = 'Ada';
one.tags.push('shared'); // Mutates the inherited array shared by both objects.
console.log(two.tags); // ['shared']
one.tags = []; // Creates an own property that shadows the inherited array.
console.log(Object.hasOwn(one, 'tags'), Object.hasOwn(two, 'tags')); // true false
const dictionary = Object.create(null);
console.log(Object.getPrototypeOf(dictionary)); // null
```

Object.create delegates lookups; it does not copy prototype data. Assignment often creates an own property, but inherited setters/nonwritable descriptors can affect the result; inspect descriptors when debugging. Object.keys enumerates enumerable own string properties, whereas for-in also visits enumerable inherited strings. Use Object.hasOwn for an ownership decision rather than trusting a user-provided hasOwnProperty method.

Prototype pollution arises when attacker-controlled keys alter shared prototype behavior or unsafe merge paths. Parse/allowlist input fields, avoid merging arbitrary objects into shared configuration and use explicit DTO projection; a null-prototype dictionary is one useful tool, not a complete security policy. Avoid changing prototypes of hot objects during normal execution.

For a real domain, prefer composing a notification service from a message formatter and send adapter when channels vary independently. Inheriting Email/SMS/Push variants can couple transport, formatting and retry behavior. A base class is appropriate when subtypes must preserve a stable behavioral contract; test that substituting one keeps preconditions/results/errors compatible.


Official references: [ordinary object internals](https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html), [Object operations](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object-objects). Checked2026-10-20; Node24 baseline.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/How_prototype_chaining_works_in_JavaScript_What_ar_177e8106c24d80578cbdcf67d4dd2637.md). All learner practice remains outstanding; the worked examples above are explanatory material.
