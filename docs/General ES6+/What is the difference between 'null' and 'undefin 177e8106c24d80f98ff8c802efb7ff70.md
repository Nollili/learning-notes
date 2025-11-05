# What is the difference between 'null' and 'undefined'?

Subjects: General ES6+

### **1. `undefined`**

- **Definition**: A variable is `undefined` when it has been declared but has not been assigned a value, or when a function does not explicitly return a value.
- **Type**: It is a primitive type.
- **Typical Scenarios**:
    1. When a variable is declared but not initialized:
        
        ```jsx
        let x;
        console.log(x); // Output: undefined
        ```
        
    2. When accessing a non-existent property of an object:
        
        ```jsx
        const obj = {};
        console.log(obj.nonExistentProp); // Output: undefined
        ```
        
    3. When a function does not return a value explicitly:
        
        ```jsx
        function doNothing() {}
        console.log(doNothing()); // Output: undefined
        ```
        

---

### **2. `null`**

- **Definition**: `null` is an explicitly assigned value indicating the intentional absence of any object value.
- **Type**: It is also a primitive type, but its type is a bit unintuitive:
    
    ```jsx
    console.log(typeof null); // Output: "object" (This is a historical quirk in JavaScript)
    ```
    
- **Typical Scenarios**:
    1. When you explicitly assign `null` to indicate "no value" or "empty":
        
        ```jsx
        let x = null;
        console.log(x); // Output: null
        ```
        
    2. Used as a placeholder for objects that will be initialized later:
        
        ```jsx
        let user = null; // User object will be assigned later
        ```
        

---

### **Key Differences**

| Aspect | `undefined` | `null` |
| --- | --- | --- |
| **Meaning** | Value not assigned (uninitialized). | Explicit absence of a value. |
| **Default** | Default for uninitialized variables. | Not a default value, must be assigned explicitly. |
| **Type** | `undefined` | `object` (quirk of JS) |
| **Usage** | Indicates missing value by default. | Used to intentionally represent "no value". |
| **Equality Check** | `undefined === undefined` is `true`. | `null === null` is `true`. |

---

### **3. Comparison of `null` and `undefined`**

### **Equality Operators**

- **Loose Equality (`==`)**:
`null` and `undefined` are loosely equal because they both represent "no value":
    
    ```jsx
    console.log(null == undefined); // true
    ```
    
- **Strict Equality (`===`)**:
They are not strictly equal because they are different types:
    
    ```jsx
    console.log(null === undefined); // false
    ```
    

---

### **4. Common Pitfalls**

### 1. **Default Function Parameters**

If you omit an argument in a function call, it becomes `undefined`:

```jsx
function greet(name) {
  console.log(`Hello, ${name}`);
}
greet(); // Output: "Hello, undefined"
```

### 2. **Checking for Both**

To check for both `null` and `undefined`, you can use a loose equality comparison:

```jsx
let value = null;
if (value == null) {
  console.log('Value is either null or undefined');
}
```

### 3. **Falsy Values**

Both `null` and `undefined` are falsy values in JavaScript:

```jsx
if (!undefined) console.log('undefined is falsy'); // true
if (!null) console.log('null is falsy');          // true
```

---

### **When to Use Which?**

- Use `null` when you want to **explicitly indicate the absence of a value** or **reset a variable**.
    
    ```jsx
    let user = { name: 'John' };
    user = null; // User is now explicitly "empty"
    ```
    
- Use `undefined` as a **default state** for variables, but avoid assigning it manually. Reserve `undefined` for cases where JavaScript sets it automatically.