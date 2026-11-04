---
outline: [2, 3]
---

# JavaScript tech-check


## Data types


- What data types exist in JavaScript? How many are there?

- What is the difference between primitive and non-primitive values?

- Besides how they are referenced, what other differences exist—for example, mutability?

- What does “reference type” mean? Explain how object references work.

- You mentioned objects being stored in the heap. Where are primitive values stored?

## Symbols


- What is Symbol, and how do you create one?

- When would you use Symbol() versus Symbol.for()?

- When is reusing a globally registered symbol useful?

- Can you retrieve the key/name associated with a symbol?

  *The last question is ambiguous in the transcript. The discussion moves toward Symbol.keyFor(), but the on-screen reference is unavailable.*

## Variables, scope, and hoisting


- What are the differences between var, let, and const?

- What kinds of scope exist in JavaScript?

- What is hoisting?

- Does hoisting apply to let and const, or only to var?

- At what stage does JavaScript discover variable and function declarations?

- Code exercise: What will the supplied snippet print when declarations using the same name include var and a function declaration?

## Object copying


- How can you clone the supplied object?

- What is the difference between a shallow copy and a deep copy?

- What options exist for creating a deep clone?

- Is JSON.parse(JSON.stringify(obj)) a good cloning approach? What limitations does it have?

- What happens when the object contains getters and setters?

- Does copying an object using spread syntax preserve property descriptors?

  *The speakers say “destructuring,” but the context appears to concern object spread copying.*

## Property descriptors and object restrictions


- What are property descriptors, and what flags do they have?

- Have you used property descriptors in practice?

- Which static Object methods modify descriptor flags implicitly?

  *Object.freeze() is supplied as a hint; Object.seal() is discussed in the answer.*

## Object iteration and collections


- How can you iterate over an object’s properties?

- Can you use for...of with an ordinary object?

- Compare Map and Object. When would you choose each?

- How would you count entries in an object versus a Map?

- Can you iterate over a WeakMap’s entries?

  *The candidate also discusses weak references and garbage collection, but a separate interviewer question about those is not clearly captured.*

## Getters and setters — coding exercise


- Given an object with name and surname, implement:
    - A fullName getter that derives the full name without storing another data field.
    - A fullName setter that updates name and surname.

- How does JavaScript distinguish a getter from an ordinary method?

- Can you rewrite the setter’s multi-line assignment in one line using destructuring?

## Arrays


- What ways do you know to create an array?

- Code exercise: What does the supplied Array.from() call return? How many elements does it produce?

- Which array methods mutate the original array, and which do not?

- Code exercise: What does the supplied snippet involving push() and splice() print?

- What changes if the second argument to splice() is changed?

- Code exercise: How does the supplied numeric array sort without a comparator?

- Code exercise: What happens to an array and its length when an element is assigned at a distant index?

- Can you assign directly to an array’s length? Does it throw an error?

- What happens to the elements when you shorten length?

- How can you check whether a value is an array?

## Functions and this


- What kinds of functions do you know in JavaScript?

- When would you use an immediately invoked function expression—an IIFE?

- What are the differences between ordinary functions and arrow functions?

- How can you invoke a function with a different this value?

- Can call(), apply(), or bind() change an arrow function’s this?

## Asynchronous JavaScript and promises


- What is asynchronous JavaScript?

- What states can a promise have?

- Code exercise: Explain the execution order/output of a snippet containing synchronous logging, timers, promise construction, rejection, and chained handlers.

- Are promise handlers microtasks or macrotasks?

  *The spoken question says “Is the promise a macrotask or microtask?” This wording is normalized to distinguish the promise from its scheduled handlers.*

- Why do the logs labelled 4 and 5 not appear in that snippet?

- Besides then() and catch(), what other promise handler method exists?

- Does setTimeout(callback, 10) guarantee that the callback executes in exactly 10 milliseconds?

- Compare Promise.all() and Promise.allSettled().

- Compare Promise.any() and Promise.race().

## async/`await` and error handling


- Explain async/`await` and how it works.

- How do you handle errors when using async/`await`?

- What kinds of errors will a surrounding try...catch fail to catch?

  *The example discussed is an error thrown later inside a timer callback.*

## Browser APIs


- How can browser JavaScript access information or capabilities such as device memory, Bluetooth, or geolocation?

  *The ensuing discussion includes window, navigator, location, history, and screen.*

## DOM events


- What ways exist to register an event handler?

- What differences or pitfalls exist between onclick and addEventListener()?

- Does an event listener registered with default options use capturing or bubbling?

- What other options can you pass to addEventListener()?

- How can you remove an event listener?

- What arguments must you supply to removeEventListener()?

- What does preventDefault() do?

- How can you stop an event from propagating?

- Can you create your own event?

  *The custom-event exercise includes creating a CustomEvent, supplying options/data, registering a listener, and dispatching it.*

## Cookies


- What are cookies, why are they needed, and how are they used?

- Which cookie flags/attributes do you know?

- If a cookie is set over HTTPS without the Secure attribute, can it also be sent over HTTP?

- What does the SameSite attribute do?

- How do you create a session cookie?

  *The candidate asks to skip the session-cookie question.*

## Web Storage


- Could you store the information discussed for cookies in localStorage instead? Why or why not?

- What is localStorage used for?

- If you copy a URL into a new tab and close the original tab, what happens to its sessionStorage data?

- How could you preserve that information across this tab transition?

In the audience Q&A, someone asked whether L2 uses the same topics. The response was:
- The topic areas are broadly the same.
- L2 focuses on basic and intermediate coverage.
- Advanced topics are generally unnecessary unless the candidate volunteers deeper knowledge.
- Questions can differ in depth.
