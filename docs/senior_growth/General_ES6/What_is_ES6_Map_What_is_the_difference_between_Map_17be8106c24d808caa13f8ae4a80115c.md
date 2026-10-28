### What is ES6 Map? What is the difference between Map and WeakMap and Object?

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
    - Suitable semantics for dynamic key/value collections; actual costs depend on implementation and workload.

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
| **Key Types** | Keys can be any type (objects, primitives). | Keys are objects or nonregistered symbols in modern ECMAScript. | Keys are strings or symbols only. |
| **Key References** | Strong references to keys and values. | Weak references to keys (key can be garbage-collected if there are no other references). | Strong references to keys and values. |
| **Iteration Support** | Iterable (can use `for...of`, `.keys()`, `.values()`, etc.). | Not iterable. | Not iterable by default (`Object.keys` needed for keys). |
| **Order of Keys** | Preserves insertion order of keys. | N/A (WeakMaps do not have order). | Ordinary own keys: array-index strings numerically, then other strings by creation, then symbols by creation; APIs select subsets. |
| **Garbage Collection** | A reachable Map strongly retains entries; the Map and entries can be collected when unreachable. | Supports garbage collection of keys when no longer referenced elsewhere. | Ordinary object properties retain values while reachable; unreachable objects can be collected. |
| **Direct Size Property** | Has a `size` property. | No `size` property. | No `size` property. Use `Object.keys(obj).length`. |
| **Use Case** | Best for mapping relationships with frequent additions/removals. | Object-associated metadata without keeping its key alive; not a security or timely-deletion mechanism. | Generic key-value pairs with string keys. |

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
        - Keys to be objects or supported nonregistered symbols; registered Symbol.for keys are rejected.
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
- **Performance**: Measure the required access/update workload; Map is not universally faster than an object.

### **Advantages of Object over Map**

- **Lighter Syntax**: Simpler for static data with string keys.
- **Prototypal Inheritance**: Useful when leveraging inheritance.

---

### **Conclusion**

- Use **Map** for dynamic key-value mappings with non-string keys or frequent updates.
- Use **WeakMap** for metadata tied to weakly held objects/nonregistered symbols; do not depend on GC timing.
- Use **Object** for lightweight and simple mappings with string keys.
## Equality, ownership, ordering and serialization

```js
const first = { id: 1 };
const second = { id: 1 };
const registry = new Map([[first, 'first']]);
console.log(registry.get(second)); // undefined: object identity, not deep equality
registry.set(NaN, 'not-a-number');
registry.set(-0, 'zero');
console.log(registry.get(NaN), registry.get(+0)); // not-a-number zero
registry.set('present', undefined);
console.log(registry.has('present')); // true; get alone cannot distinguish absence

const marker = Symbol('local');
const metadata = new WeakMap([[marker, { loaded: true }]]);
console.log(metadata.get(marker).loaded); // true on the Node24 baseline
// metadata.set(Symbol.for('global'), {}); // TypeError: registered symbol

const annotation = Symbol('annotation');
const record = { b: 1, 10: 'ten', 2: 'two', a: 2, [annotation]: true };
console.log(Object.keys(record)); // ['2', '10', 'b', 'a']
console.log(Reflect.ownKeys(record)); // same strings, then annotation symbol
```

Map key comparison uses SameValueZero (NaN equals itself;±0 are equal). Ordinary object keys coerce numbers/objects to property keys; two object keys can collide as '[object Object]'. Object.keys returns only enumerable own string keys; Reflect.ownKeys includes nonenumerable own keys and symbols. Do not infer an arbitrary iterable's behavior from the ordinary-object rule; proxies/exotic objects have their own rules.

Map/Set lookup is required to be average sublinear, not guaranteed O(1) for every operation/engine. Choose by semantics, then benchmark realistic access patterns. A bounded string-key cache should use explicit eviction/TTL; WeakMap cannot hold string keys, enumerate entries or promise prompt deletion. No size/iteration API prevents exposing garbage-collector timing through enumeration.

```js
const dictionary = Object.create(null);
dictionary['__proto__'] = 'ordinary own entry';
console.log(Object.hasOwn(dictionary, '__proto__')); // true
console.log(JSON.stringify(new Map([['x', 1]]))); // '{}' by default
console.log(JSON.stringify([...new Map([['x', 1]])])); // '[["x",1]]'
```

A null-prototype dictionary avoids inherited-key lookup, but it lacks methods such as hasOwnProperty. It does not make later unsafe merges safe. Serializing Map as entries needs an explicit key/value schema: object identity, symbol keys and cyclic values cannot be preserved by ordinary JSON. Object.fromEntries can lose key distinctions when keys coerce; use it only for a defined string-key contract.

[Separate collection/cache exercise](../../practice/cs-foundations/collections-and-queues.md#cache-extension). For representation and complexity tradeoffs, see [CS data structures](../../cs-foundations/data-structures.md).

Official references: [ECMAScript keyed collections](https://tc39.es/ecma262/multipage/keyed-collections.html), [ordinary own key order](https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ordinaryownpropertykeys). Checked2026-10-20, established behavior exercised on Node24.18.0; a living specification can also contain newer APIs not used here.
