# What do you know about Decorator design pattern? Where in React.js it's used?

````markdown
# 🎨 Decorator Design Pattern in JavaScript and React

---

## 1️⃣ What is the Decorator Pattern?

**Definition:**  
The **Decorator pattern** is a **structural design pattern** that allows you to **dynamically add new behavior** to an object **without modifying its structure**.  

- Wrap an existing object with a new layer that **enhances or overrides functionality**.
- Promotes **open/closed principle**: open for extension, closed for modification.

### Key Concepts
- **Component:** Original object or class
- **Decorator:** Adds new behavior while keeping the original interface
- **Composition over inheritance:** Prefer wrapping objects instead of subclassing

---

## 2️⃣ Simple JavaScript Example
```js
class Coffee {
  cost() { return 5; }
}

class MilkDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  cost() {
    return this.coffee.cost() + 2; // add milk cost
  }
}

const plainCoffee = new Coffee();
const milkCoffee = new MilkDecorator(plainCoffee);

console.log(plainCoffee.cost()); // 5
console.log(milkCoffee.cost());  // 7
````

* Original `Coffee` object remains unchanged.
* `MilkDecorator` **extends behavior dynamically**.

---

## 3️⃣ Decorator Pattern in React.js

In React, decorators are commonly used for **enhancing components**, often called **Higher-Order Components (HOCs)**.

### 🔹 Higher-Order Component (HOC)

* Function that **takes a component and returns an enhanced component**.
* Allows code reuse, logic separation, and behavior injection.

**Example:**

```js
// HOC to log props
function withLogger(WrappedComponent) {
  return function(props) {
    console.log('Props:', props);
    return <WrappedComponent {...props} />;
  };
}

function MyButton(props) {
  return <button>{props.label}</button>;
}

const EnhancedButton = withLogger(MyButton);

// Usage
<EnhancedButton label="Click me" />
```

**Explanation:**

* `withLogger` is a **decorator**.
* `MyButton` is the **original component**.
* `EnhancedButton` is the **decorated component** with additional logging behavior.

---

### 🔹 Where Decorators Are Useful in React

1. **Cross-cutting concerns**

   * Logging, analytics, error handling
2. **Authorization / Permissions**

   * Wrap components to show/hide based on user roles
3. **Styling / Theming**

   * Add additional styling logic dynamically
4. **State or context injection**

   * HOCs can inject Redux or Context props

---

### 4️⃣ Modern React Approach

* **HOCs** are still used, but with **React Hooks**, many decorator use cases are replaced by **custom hooks**.
* Hooks allow **composition and behavior reuse** without wrapping components, making code more readable.

---

### ✅ Key Takeaways

* **Decorator Pattern:** Dynamically extend object behavior.
* **In React:** Implemented via **Higher-Order Components (HOCs)** or class decorators (legacy syntax).
* Promotes **code reuse, separation of concerns, and adherence to SOLID principles**.
* Hooks can replace many HOC/decorator scenarios in modern React.

```
```
