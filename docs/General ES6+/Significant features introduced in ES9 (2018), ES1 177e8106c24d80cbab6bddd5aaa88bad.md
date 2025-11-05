# Significant features introduced in ES9 (2018), ES10 (2019), and ES11 (2020)

Subjects: General ES6+

## **ES9 (ECMAScript 2018): Key Features**

### **1. Asynchronous Iteration**

- **`for await...of`** allows asynchronous iteration over streams or collections of Promises.

```jsx
const fetchData = async () => {
  const urls = ["url1", "url2", "url3"];
  const fetchResults = urls.map((url) => fetch(url)); // Array of Promises

  for await (const result of fetchResults) {
    console.log(await result.json()); // Process each response
  }
};

fetchData();
```

---

### **2. Rest/Spread Properties for Objects**

- Previously available for arrays, `rest` and `spread` were extended to objects.

**Rest: Extract remaining properties**:

```jsx
const { a, ...rest } = { a: 1, b: 2, c: 3 };
console.log(a); // 1
console.log(rest); // { b: 2, c: 3 }
```

**Spread: Copy or merge objects**:

```jsx
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };
console.log(obj2); // { a: 1, b: 2, c: 3 }
```

---

### **3. Promise.prototype.finally**

- Adds a `finally` method to Promises for cleanup, regardless of the Promise's resolution or rejection.

```jsx
fetch("https://api.example.com/data")
  .then((data) => console.log("Data fetched"))
  .catch((error) => console.error("Error occurred"))
  .finally(() => console.log("Cleanup done"));
```

---

### **4. Regular Expression Enhancements**

- **Unicode Property Escapes**: Match Unicode characters based on their properties.
    
    ```jsx
    const regex = /\p{Script=Greek}/u;
    console.log(regex.test("π")); // true
    ```
    
- **DotAll Mode (`s` flag)**: Allows `.` to match newline characters.
    
    ```jsx
    const regex = /foo.bar/s;
    console.log(regex.test("foo\nbar")); // true
    ```
    

---

## **ES10 (ECMAScript 2019): Key Features**

### **1. Array `flat` and `flatMap`**

- **`flat`**: Flattens nested arrays to a specified depth.
    
    ```jsx
    const arr = [1, [2, [3, [4]]]];
    console.log(arr.flat(2)); // [1, 2, 3, [4]]
    ```
    
- **`flatMap`**: Maps each element and flattens the result by one level.
    
    ```jsx
    const arr = [1, 2, 3];
    console.log(arr.flatMap((x) => [x, x * 2])); // [1, 2, 2, 4, 3, 6]
    ```
    

---

### **2. `Object.fromEntries`**

- Converts an array of key-value pairs into an object (reverse of `Object.entries`).

```jsx
const entries = [["a", 1], ["b", 2]];
const obj = Object.fromEntries(entries);
console.log(obj); // { a: 1, b: 2 }
```

---

### **3. String `trimStart` and `trimEnd`**

- Removes whitespace from the start or end of a string.

```jsx
console.log("   Hello ".trimStart()); // "Hello "
console.log("   Hello ".trimEnd()); // "   Hello"
```

---

### **4. Optional Catch Binding**

- The `catch` block no longer requires an error parameter.

```jsx
try {
  // Code that might throw
} catch {
  console.log("An error occurred");
}
```

---

### **5. Function `toString` Updates**

- The `toString` method of functions now returns the exact source code.

```jsx
function greet() {
  return "Hello!";
}
console.log(greet.toString());
// Outputs: "function greet() { return 'Hello!'; }"
```

---

## **ES11 (ECMAScript 2020): Key Features**

### **1. Optional Chaining (`?.`)**

- Safely access deeply nested properties without checking each level.

```jsx
const user = { profile: { name: "Alice" } };
console.log(user?.profile?.name); // "Alice"
console.log(user?.settings?.theme); // undefined
```

---

### **2. Nullish Coalescing (`??`)**

- Provides a default value only if the left-hand side is `null` or `undefined`.

```jsx
const foo = null ?? "default";
console.log(foo); // "default"

const bar = 0 ?? "default"; // Unlike `||`, doesn't treat `0` as falsy
console.log(bar); // 0
```

---

### **3. Dynamic Import**

- Allows importing modules dynamically at runtime.

```jsx
const loadModule = async () => {
  const { default: module } = await import("./module.js");
  module.doSomething();
};
loadModule()
```

---

### **4. BigInt**

- Supports arbitrarily large integers.

```jsx
const bigNumber = 123456789012345678901234567890n;
console.log(bigNumber + 1n); // 123456789012345678901234567891n
```

---

### **5. Promise.allSettled**

- Waits for all Promises to settle (resolve or reject) and returns their results.

```jsx
const promises = [
  Promise.resolve(10),
  Promise.reject("Error"),
  Promise.resolve(20),
];

Promise.allSettled(promises).then((results) => console.log(results));
// [
//   { status: "fulfilled", value: 10 },
//   { status: "rejected", reason: "Error" },
//   { status: "fulfilled", value: 20 }
// ]
```

---

### **6. GlobalThis**

- Provides a universal way to access the global object.

```jsx
console.log(globalThis); // Works in browsers, Node.js, and other environments
```

---

### **7. `String.prototype.matchAll`**

- Returns all matches of a regular expression as an iterator.

```jsx
const regex = /t(e)(st)/g;
const str = "test1test2";
for (const match of str.matchAll(regex)) {
  console.log(match);
}
// ["test1", "e", "st", index: 0, input: "test1test2"]
// ["test2", "e", "st", index: 5, input: "test1test2"]
```

---

### **Summary of Features**

| **Version** | **Key Features** |
| --- | --- |
| **ES9** | `for await...of`, object rest/spread, `finally`, regex improvements (`s` flag, Unicode escapes) |
| **ES10** | `flat`, `flatMap`, `Object.fromEntries`, `trimStart`, `trimEnd`, optional catch binding |
| **ES11** | Optional chaining (`?.`), nullish coalescing (`??`), dynamic import, BigInt, `Promise.allSettled` |