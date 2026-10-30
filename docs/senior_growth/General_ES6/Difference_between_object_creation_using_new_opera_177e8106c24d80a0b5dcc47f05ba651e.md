# Difference between object creation using new operator and function constructor? {#difference-between-object-creation-using-new-operator-and-function-constructor}

The new operator invokes a constructor; these are not competing creation mechanisms. Compare construction with new against a factory function that explicitly returns an object.

---

### **Object Creation Using the `new` Operator** {#_1-object-creation-using-the-new-operator}

The **`new` operator** is used to create an object from a constructor function. It sets up the newly created object to inherit from the prototype of the constructor function and executes the constructor function with the provided arguments.

**Steps Performed by `new`:**

1. A new empty object is created.
2. The `this` keyword in the constructor function is bound to the new object.
3. The new object is linked to the constructor’s `prototype`.
4. The constructor function runs and initializes the object.
5. The newly created object is returned automatically unless the constructor explicitly returns another object.

**Example:**

```jsx
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const person1 = new Person("John", 30);
console.log(person1); // Output: Person { name: 'John', age: 30 }

```

---

### **Object Creation Using a Factory Function** {#_2-object-creation-using-a-factory-function}

A **function constructor** is a function intended to be used with the `new` operator to initialize a newly created object. When a function is called with `new`, it acts as a constructor function.

**Factory example:** createPerson is called normally and explicitly returns its product; it is not a constructor example.

```jsx
function createPerson(name, age) {
  const obj = {}; // Create a new object
  obj.name = name; // Add properties to the object
  obj.age = age;

  obj.sayHello = function () {
    console.log(`Hi, I'm ${this.name} and I'm ${this.age} years old.`);
  };

  return obj; // Explicitly return the object
}

const person1 = createPerson('Alice', 30);
person1.sayHello(); // Output: Hi, I'm Alice and I'm 30 years old.
```

---

### **Key Differences Between `new` and Function Constructors**

| **Aspect** | **`new` Operator** | **Function Constructor** |
| --- | --- | --- |
| **Usage** | Used to invoke a constructor function. | The function serves as the blueprint. |
| **Purpose** | Automatically creates and initializes an object. | Used to define object properties and methods. |
| **Prototype Linking** | Links the object to the constructor’s prototype. | Defines the prototype for the objects created using `new`. |
| **Without `new`** | Throws an error or behaves unexpectedly if `new` is not used. | Needs the `new` operator to function correctly. |

---

### **Potential Issues Without `new`**

A plain call has undefined this in strict code/ESM and may throw on this.name assignment. In a sloppy classic script, a plain call substitutes the global object and may pollute it. Calling it as another object's method supplies that receiver instead. It does not execute in global lexical scope.

**Example:**

```jsx
function Person(name) {
  this.name = name;
}

const person1 = Person("Alice"); // Strict/ESM: TypeError before returning.
// Sloppy classic-script-only demonstration: returns undefined, may set globalThis.name.
// Do not reference window in portable Node code.

```

---

### **Solution: Enforce construction with `new.target`**

Use new.target to detect construction. An instanceof check can be fooled by calling the function with an existing compatible receiver:

```jsx
function Person(name) {
  if (!new.target) {
    throw new Error("Must use 'new' with Person");
  }
  this.name = name;
}

const person1 = new Person("Alice"); // Works
const person2 = Person("Bob"); // Throws Error

```

---

### **Modern Approach: Using ES6 Classes**

With ES6, **classes** provide a more structured and readable way to create objects. Classes have constructor/prototype semantics with additional rules; they are not interchangeable with every ordinary function implementation.

**Example:**

```jsx
class Animal {
  constructor(name) {
    this.name = name;
  }
}

const dog = new Animal("Buddy");
console.log(dog); // Output: Animal { name: 'Buddy' }

```

**Advantages of Classes Over `new` and Function Constructors**:

1. **Readable Syntax**: Classes are syntactically cleaner and more intuitive.
2. **Built-in Error Checking**: Using a class without `new` throws an error.
    
    ```jsx
    class Animal {
      constructor(name) {
        this.name = name;
      }
    }
    const dog = Animal("Buddy"); // TypeError: Class constructor Animal cannot be invoked without 'new'
    
    ```
    

---

### **Conclusion**

- The **`new` operator** is the mechanism for creating objects and linking them to a prototype.
- A **function constructor** provides the blueprint for initializing object properties and methods when used with `new`.
- Forgetting `new` can lead to issues, but modern **ES6 classes** simplify the process and enforce better practices.
## Constructor returns, factories and trade-offs

```js
function ReturnsObject() { this.ignored = true; return { replacement: true }; }
function ReturnsPrimitive() { this.kept = true; return 7; }
console.log(new ReturnsObject()); // {replacement:true}; replacement need not use the constructor prototype
console.log(new ReturnsPrimitive().kept); // true; primitive return ignored for this base constructor
const sharedMethods = { greet() { return `Hello ${this.name}`; } };
function createUser(name) { return Object.assign(Object.create(sharedMethods), { name }); }
const user = createUser('Ada');
console.log(user.greet()); // Hello Ada; factory can still share a prototype
```

A factory can choose the returned shape or hide dependencies in closures; a class/prototype can share methods and express instanceof-based identity. Do not choose solely by allocation folklore: measure construction volume and clarify ownership. instanceof checks a prototype relationship (and can be customized); it is not runtime schema validation and can fail across realms. new.target also supports subclass-aware construction, but derived-class return/super rules are more restrictive than the simple base examples above.


Official references: [ECMA construction](https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-new-operator), [new.target/classes](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html). Checked2026-10-20; Node24 runtime baseline.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/Difference_between_object_creation_using_new_opera_177e8106c24d80a0b5dcc47f05ba651e.md). All learner practice remains outstanding; the worked examples above are explanatory material.
