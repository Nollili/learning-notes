# 🌐 HTTP Verbs — Detailed Explanation

HTTP verbs (also called **methods**) define the **action** the client wants to perform on a resource. Understanding them is crucial for designing **RESTful APIs** and frontend-backend communication.

---

## 1️⃣ **GET**

- **Purpose:** Retrieve data from the server.
- **Idempotent:** ✅ (multiple identical requests produce same result)
- **Safe:** ✅ (does not modify resources)
- **Request Body:** Usually none (ignored by most servers)
- **Caching:** Responses can be cached.
- **Use Case:** Fetching user data, page content, or images.

**Example:**
```http
GET /users/123 HTTP/1.1
Host: api.example.com
```

**Response:**
```json
{
    "id": 123,
    "name": "Alice"
}
```

---

## 2️⃣ **POST**

* **Purpose:** Create a new resource or trigger an action.
* **Idempotent:** ❌ (multiple requests can create duplicates)
* **Safe:** ❌ (modifies server state)
* **Request Body:** Required (e.g., JSON, form data)
* **Caching:** Responses are **not cached** by default.
* **Use Case:** Create user, submit form, trigger workflow.

**Example:**
```http
POST /users HTTP/1.1
Content-Type: application/json

{
    "name": "Bob",
    "email": "bob@example.com"
}
```

**Response:** `201 Created`

---

## 3️⃣ **PUT**

* **Purpose:** Replace an existing resource (or create if missing)
* **Idempotent:** ✅ (multiple identical requests → same result)
* **Safe:** ❌ (modifies server state)
* **Request Body:** Required
* **Caching:** Usually not cached
* **Use Case:** Update entire resource

**Example:**
```http
PUT /users/123 HTTP/1.1
Content-Type: application/json

{
    "name": "Alice Updated",
    "email": "alice.new@example.com"
}
```

**Response:** `200 OK` or `204 No Content`

---

## 4️⃣ **PATCH**

* **Purpose:** Update **part** of a resource.
* **Idempotent:** ✅ (if applied repeatedly, same result)
* **Safe:** ❌ (modifies server state)
* **Request Body:** Partial data describing changes
* **Use Case:** Update a single field (e.g., email)

**Example:**
```http
PATCH /users/123 HTTP/1.1
Content-Type: application/json

{
    "email": "alice.new@example.com"
}
```

**Response:** `200 OK` or `204 No Content`

---

## 5️⃣ **DELETE**

* **Purpose:** Remove a resource.
* **Idempotent:** ✅ (deleting same resource multiple times has same effect)
* **Safe:** ❌ (modifies server state)
* **Request Body:** Usually none
* **Use Case:** Delete a user, post, or file.

**Example:**
```http
DELETE /users/123 HTTP/1.1
```

**Response:** `204 No Content`

---

## 6️⃣ **HEAD**

* **Purpose:** Retrieve headers only (no response body)
* **Idempotent:** ✅
* **Safe:** ✅
* **Use Case:** Check if a resource exists, check caching headers, content-length, last-modified.

**Example:**
```http
HEAD /users/123 HTTP/1.1
```

**Response Headers:**
```
Content-Type: application/json
Content-Length: 123
```

---

## 7️⃣ **OPTIONS**

* **Purpose:** Discover supported HTTP methods and CORS policies for a resource.
* **Idempotent:** ✅
* **Safe:** ✅
* **Use Case:** CORS preflight requests, API discovery.

**Example:**
```http
OPTIONS /users/123 HTTP/1.1
```

**Response Headers:**
```
Allow: GET, POST, PUT, DELETE, OPTIONS
```

---

## 8️⃣ Other Less Common Verbs

| Verb              | Purpose / Use Case                                          |
| ----------------- | ----------------------------------------------------------- |
| **CONNECT**       | Establish a tunnel (e.g., HTTPS through a proxy)            |
| **TRACE**         | Echo the request for debugging (rarely used, security risk) |
| **LINK / UNLINK** | Rare, manage relationships between resources                |

---

## 🧠 Summary Table

| Method  | Safe | Idempotent | Typical Use Case           |
| ------- | ---- | ---------- | -------------------------- |
| GET     | ✅    | ✅          | Read/fetch resource        |
| POST    | ❌    | ❌          | Create resource / action   |
| PUT     | ❌    | ✅          | Replace resource           |
| PATCH   | ❌    | ✅          | Partial update             |
| DELETE  | ❌    | ✅          | Delete resource            |
| HEAD    | ✅    | ✅          | Fetch headers only         |
| OPTIONS | ✅    | ✅          | Discover supported methods |

---

### 💡 Best Practices

* **GET** → fetch data only
* **POST** → create new resources
* **PUT/PATCH** → update resources (choose based on full vs partial update)
* **DELETE** → remove resources
* **HEAD/OPTIONS** → meta operations, CORS, or preflight checks
* Always respect **idempotency** and **safety** for proper REST design
