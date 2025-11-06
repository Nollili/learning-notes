# What is the callback hell? How can you avoid it?

## 🔹 Callback Hell in JavaScript

**Callback hell** occurs when you have **nested callbacks** in asynchronous JavaScript code, leading to code that is **hard to read, maintain, and debug**. It often looks like a “pyramid of doom.”

---

## 1️⃣ Example of Callback Hell

```javascript
getUser(userId, function(user) {
  getOrders(user.id, function(orders) {
    getOrderDetails(orders[0].id, function(details) {
      sendEmail(details, function(response) {
        console.log('Email sent!');
      });
    });
  });
});
````

**Problems:**

* **Deep nesting** → hard to follow
* **Error handling** is repetitive and messy
* Difficult to **refactor** or maintain

---

## 2️⃣ How to Avoid Callback Hell

### 2.1 Use Named Functions

Instead of anonymous functions:

```javascript
function handleDetails(details) {
  sendEmail(details, handleEmailResponse);
}

function handleEmailResponse(response) {
  console.log('Email sent!');
}

getUser(userId, function(user) {
  getOrders(user.id, function(orders) {
    getOrderDetails(orders[0].id, handleDetails);
  });
});
```

**Benefit:** Flattens the code, improves readability.

---

### 2.2 Use Promises

Promises provide **chaining** and **better error handling**.

```javascript
getUser(userId)
  .then(user => getOrders(user.id))
  .then(orders => getOrderDetails(orders[0].id))
  .then(details => sendEmail(details))
  .then(() => console.log('Email sent!'))
  .catch(err => console.error(err));
```

**Benefits:**

* Avoids deep nesting
* Centralized `.catch()` for error handling
* Easier to read and maintain

---

### 2.3 Use Async/Await (ES2017+)

Async/await makes asynchronous code look **synchronous**, improving readability.

```javascript
async function processEmail(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    const details = await getOrderDetails(orders[0].id);
    await sendEmail(details);
    console.log('Email sent!');
  } catch (err) {
    console.error(err);
  }
}

processEmail(1);
```

**Benefits:**

* Flat, readable code
* Easy error handling with `try/catch`
* Works seamlessly with Promises

---

### 2.4 Modularize Functions

Split complex logic into **small reusable functions**.

```javascript
async function getUserOrders(userId) { ... }
async function getFirstOrderDetails(orders) { ... }
async function notifyUser(details) { ... }
```

**Benefit:** Each function does **one thing**, making code maintainable.

---

### ✅ Summary

* **Callback Hell**: Nested callbacks that are hard to read and maintain.
* **Avoidance Techniques:**

  1. Use **named functions** instead of anonymous callbacks.
  2. Use **Promises** and `.then()` chaining.
  3. Use **async/await** for clean, linear code.
  4. **Modularize** complex logic into reusable functions.

> 💡 Senior Tip:
> For modern projects, prefer **async/await with proper error handling**. Use Promises only if integrating with legacy code.
