# Difference between object creation using new operator and function constructor?

Subjects: General ES6+

In JavaScript, objects can be created using either the **`new` operator** or a **function constructor**, but they are closely related since the `new` operator is commonly used with function constructors. Here's a detailed explanation:

---

### **1. Object Creation Using the `new` Operator**

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

### **2. Object Creation Using a Function Constructor**

A **function constructor** is a function intended to be used with the `new` operator to initialize a newly created object. When a function is called with `new`, it acts as a constructor function.

**Example of a Function Constructor:**

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

If you forget to use the `new` operator when calling a function constructor, the function will execute in the global scope or the default `this` context, which can lead to unintended side effects (e.g., polluting the global object).

**Example:**

```jsx
function Person(name) {
  this.name = name;
}

const person1 = Person("Alice"); // Forgot to use `new`
console.log(person1); // undefined
console.log(globalThis.name || window.name); // "Alice" (pollutes global scope)

```

---

### **Solution: Enforce `new` with `instanceof`**

You can enforce the use of `new` by checking if `this` is an instance of the constructor:

```jsx
function Person(name) {
  if (!(this instanceof Person)) {
    throw new Error("Must use 'new' with Person");
  }
  this.name = name;
}

const person1 = new Person("Alice"); // Works
const person2 = Person("Bob"); // Throws Error

```

---

### **Modern Approach: Using ES6 Classes**

With ES6, **classes** provide a more structured and readable way to create objects. Classes internally use function constructors and the `new` operator.

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