### What is the difference between 'null' and 'undefined'?

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
| **Meaning** | Missing/undefined value after initialization; an uninitialized lexical binding is in the TDZ. | Explicit absence of a value. |
| **Default** | Default for var or a let declaration reached without an initializer. | Not a default value, must be assigned explicitly. |
| **typeof result** | `undefined` | `object` (historical quirk; null is primitive) |
| **Usage** | Indicates missing value by default. | Used to intentionally represent "no value". |
| **Equality Check** | `undefined === undefined` is `true`. | `null === null` is `true`. |

---

### **3. Comparison of `null` and `undefined`**

### **Equality Operators**

- **Loose Equality (`==`)**:
`null` and `undefined` are loosely equal because the abstract equality algorithm explicitly treats this pair as equal:
    
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
    
- Choose null/undefined according to a documented domain/API contract. Explicit undefined can be appropriate for an optional result or clearing an internal binding; JSON and patch semantics need separate rules.

## Equality algorithms and numeric edge values

Do not choose equality from “truthy means valid.” An empty input, numeric zero, false, null and an absent field can each mean something different. A reached `let x;` initializes x to undefined; accessing it before the declaration is reached throws due to the temporal dead zone. An absent property and an own property containing undefined both read as undefined, but Object.hasOwn distinguishes them.

| Comparison | Coercion | NaN versus NaN | +0 versus -0 | Typical use |
|---|---|---|---|---|
| `===` | None | false | true | Explicit application comparisons |
| `Object.is` (SameValue) | None | true | false | React dependency/state equality and precise numeric tests |
| SameValueZero | None | true | true | Set/Map key equality, Array.includes |
| `==` | Algorithm-dependent | false | true | Deliberate compatibility/nullish idioms, with coercion understood |

Distinct objects remain unequal under these algorithms even if their properties match; compare domain identifiers or use a deliberately defined value comparison. `indexOf` does not find NaN, whereas includes does. `value == null` deliberately checks null or undefined for ordinary application values; browsers' legacy document.all is an exceptional host object, so do not treat that idiom as a complete definition of every web-platform value.

```js
const missing = {};
const present = { value: undefined };
console.log(missing.value === present.value); // true
console.log(Object.hasOwn(missing, 'value'), Object.hasOwn(present, 'value')); // false true
console.log(NaN === NaN, Object.is(NaN, NaN), [NaN].includes(NaN)); // false true true
console.log([NaN].indexOf(NaN)); // -1
console.log(+0 === -0, Object.is(+0, -0), new Set([+0, -0]).size); // true false 1
console.log(Number.isNaN('bad'), isNaN('bad')); // false true: global isNaN coerces
```

| Input | `Boolean(input)` | `Number(input)` | `input ?? 'fallback'` | `input || 'fallback'` |
|---|---|---|---|---|
| `undefined` | false | NaN | fallback | fallback |
| `null` | false | 0 | fallback | fallback |
| `''` / whitespace | false / true | 0 | Original string | fallback / original whitespace |
| `'0'` | true | 0 | `'0'` | `'0'` |
| `0` | false | 0 | 0 | fallback |
| `false` | false | 0 | false | fallback |
| `NaN` | false | NaN | NaN | fallback |

`+` can concatenate after primitive conversion (`1 + '2'` gives `'12'`), while numeric subtraction converts (`'2' - 1` gives1). Objects can run user-defined conversion methods; never use coercion as validation for an unknown object. `Number.isFinite` rejects Infinity/NaN without coercing strings. Integers beyond Number.MAX_SAFE_INTEGER lose exact integer guarantees; use integer minor units with safe-integer bounds for this money lab or a reviewed decimal representation.

BigInt is distinct from Number: mixed arithmetic throws, and BigInt does not provide fractional decimal money automatically. Binary floating point makes `0.1 + 0.2 === 0.3` false; Number.EPSILON is spacing near1, not a universal tolerance for every magnitude or domain.

### Worked boundary: a strict quantity parser

```js
export function parseQuantity(raw) {
  // Policy: trimmed decimal digits, 1–999, at most3 digits, no signs/exponents/decimals.
  if (typeof raw !== 'string') throw new TypeError('Quantity must be text');
  const text = raw.trim();
  if (!/^[1-9][0-9]{0,2}$/.test(text)) throw new RangeError('Quantity must be 1–999');
  return Number(text);
}
```

This grammar rejects empty/whitespace, leading zeros, Infinity, NaN, hexadecimal and scientific notation before conversion. Number('') alone would accept0 and parseInt('12items',10) would partially accept12. Those may be useful conversions elsewhere, but violate this explicit quantity contract. Validate an API JSON number with safe-integer/domain checks instead of coercing it through the UI's string parser. JSON omits undefined object properties, serializes undefined array entries as null and cannot serialize a BigInt by default; serialization has a different contract from equality.


References checked2026-10-21: [ECMAScript equality/conversion algorithms](https://tc39.es/ecma262/multipage/abstract-operations.html), [Number values](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-number-type). Examples checked with Node24.18.0; browser-only document.all is a documented exception, not a locally executed test.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/general_es6/What_is_the_difference_between_%27null%27_and_%27undefin_177e8106c24d80f98ff8c802efb7ff70.md). All learner practice remains outstanding; the worked examples above are explanatory material.
