# What is ES6 Map? What is the difference between Map and WeakMap and Object?

Subjects: General ES6+

### **What is an ES6 Map?**

A **Map** in ES6 is a collection of key-value pairs where both the keys and values can be of any data type (e.g., objects, primitives, functions). It is designed to overcome some of the limitations of plain JavaScript objects when used as maps (dictionaries).

### **Key Characteristics of Map**

1. **Key Flexibility**:
    - A `Map` can have keys of any type (e.g., objects, functions, primitives).
    - In contrast, plain objects (`{}`) only allow strings or symbols as keys.
2. **Preserves Order**:
    - Iteration over a `Map` preserves the insertion order of keys.
3. **Direct Size Property**:
    - Maps have a `size` property to get the number of key-value pairs, unlike objects where you need to calculate manually using `Object.keys(obj).length`.
4. **Iterable**:
    - A `Map` is iterable and can be directly used in `for...of` loops or spread operations.
5. **Performance**:
    - Optimized for frequent additions and removals of key-value pairs.

### **Example:**

```jsx
const map = new Map();
map.set('name', 'John'); // string key
map.set(42, 'Age'); // number key
map.set(true, 'Is Admin'); // boolean key

console.log(map.get('name')); // "John"
console.log(map.size); // 3

for (const [key, value] of map) {
  console.log(key, value);
}
// Output:
// "name" "John"
// 42 "Age"
// true "Is Admin"

```

---

### **Difference Between Map, WeakMap, and Object**

| **Aspect** | **Map** | **WeakMap** | **Object** |
| --- | --- | --- | --- |
| **Key Types** | Keys can be any type (objects, primitives). | Keys must be objects only. | Keys are strings or symbols only. |
| **Key References** | Strong references to keys and values. | Weak references to keys (key can be garbage-collected if there are no other references). | Strong references to keys and values. |
| **Iteration Support** | Iterable (can use `for...of`, `.keys()`, `.values()`, etc.). | Not iterable. | Not iterable by default (`Object.keys` needed for keys). |
| **Order of Keys** | Preserves insertion order of keys. | N/A (WeakMaps do not have order). | No guaranteed order (but modern engines generally maintain insertion order for strings). |
| **Garbage Collection** | Does not support garbage collection of keys. | Supports garbage collection of keys when no longer referenced elsewhere. | Does not support garbage collection of keys. |
| **Direct Size Property** | Has a `size` property. | No `size` property. | No `size` property. Use `Object.keys(obj).length`. |
| **Use Case** | Best for mapping relationships with frequent additions/removals. | Managing sensitive data with limited lifecycle (e.g., caching). | Generic key-value pairs with string keys. |

---

### **When to Use Each**

https://www.youtube.com/watch?v=ycohYSx5h9w&ab_channel=TraversyMedia

1. **Use `Map`**:
    - When you need:
        - Non-string keys.
        - Frequent key-value pair additions and deletions.
        - Preserved insertion order of keys.
    - Example: Maintaining a registry of objects or settings with unique keys.
        
        ```jsx
        const userRegistry = new Map();
        userRegistry.set(user1, 'Admin');
        userRegistry.set(user2, 'Member');
        
        ```
        
2. **Use `WeakMap`**:
    - When you need:
        - Keys to be objects.
        - Keys that should not prevent garbage collection.
    - Example: Storing metadata or private data about objects.
        
        ```jsx
        const weakMap = new WeakMap();
        const obj = {};
        weakMap.set(obj, 'metadata');
        // If `obj` is no longer referenced, it can be garbage-collected.
        
        ```
        
3. **Use `Object`**:
    - When you need:
        - A simple key-value pair structure with string or symbol keys.
        - Lightweight, static data storage.
    - Example: Static configurations or settings.
        
        ```jsx
        const config = { theme: 'dark', lang: 'en' };
        
        ```
        

---

### **Advantages of Map over Object**

- **Key Flexibility**: `Map` allows non-string keys, unlike `Object`.
- **Iteration**: Built-in methods for iteration (`forEach`, `keys`, `values`, `entries`).
- **Size Property**: Easy access to the number of elements with `size`.
- **Performance**: Better optimized for frequent additions and deletions.

### **Advantages of Object over Map**

- **Lighter Syntax**: Simpler for static data with string keys.
- **Prototypal Inheritance**: Useful when leveraging inheritance.

---

### **Conclusion**

- Use **Map** for dynamic key-value mappings with non-string keys or frequent updates.
- Use **WeakMap** when working with object keys and managing memory efficiently.
- Use **Object** for lightweight and simple mappings with string keys.