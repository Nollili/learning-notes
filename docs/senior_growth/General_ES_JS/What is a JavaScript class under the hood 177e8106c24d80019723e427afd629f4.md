### What is a JavaScript class under the hood?

Under the hood, a **JavaScript class** is essentially **syntactic sugar** for JavaScript's existing **prototypal inheritance** mechanism. It provides a cleaner and more structured syntax for defining objects and their behavior compared to using constructor functions and directly modifying prototypes. Let's break this down step by step:

---

### **What Happens When You Define a Class?**

When you define a class in JavaScript, the JavaScript engine:

1. **Creates a Function**:
    - The `class` keyword internally creates a special type of function called a "class constructor."
    - This constructor is just a regular function, but it is treated differently by the language to provide additional structure.
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

**Equivalent Using Function Constructor:**

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
    
    - Public fields are assigned directly to the instance (`this`).
    - Private fields use a special internal mechanism to ensure privacy.

---

### **Key Differences Between Classes and Constructor Functions**

| **Aspect** | **Class** | **Constructor Function** |
| --- | --- | --- |
| **Definition Syntax** | Uses the `class` keyword. | Uses a plain function. |
| **Prototype Assignment** | Automatically assigns methods to `prototype`. | Requires manual assignment to `prototype`. |
| **Call Without `new`** | Throws a `TypeError`. | Executes the function in the global context. |
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