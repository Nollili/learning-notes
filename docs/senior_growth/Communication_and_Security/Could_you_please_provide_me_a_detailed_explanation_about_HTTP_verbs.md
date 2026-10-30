# HTTP Verbs — Detailed Explanation {#%F0%9F%8C%90-http-verbs-%E2%80%94-detailed-explanation}

HTTP verbs (also called **methods**) define the **action** the client wants to perform on a resource. Understanding them is crucial for designing **RESTful APIs** and frontend-backend communication.

---

## **GET** {#_1%EF%B8%8F%E2%83%A3-get}

- **Purpose:** Retrieve data from the server.
- **Idempotent:**  (same intended server effect; response representations may differ)
- **Safe:**  (client does not request a state-changing effect; incidental logging is possible)
- **Request Body:** No generally defined GET content semantics; avoid relying on a GET body without explicit interoperable agreement
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

## **POST** {#_2%EF%B8%8F%E2%83%A3-post}

* **Purpose:** Create a new resource or trigger an action.
* **Idempotent:**  (multiple requests can create duplicates)
* **Safe:**  (modifies server state)
* **Request Body:** API-defined; POST does not universally require content
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

## **PUT** {#_3%EF%B8%8F%E2%83%A3-put}

* **Purpose:** Replace an existing resource (or create if missing)
* **Idempotent:**  (same intended replacement effect; not necessarily identical response)
* **Safe:**  (modifies server state)
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

## **PATCH** {#_4%EF%B8%8F%E2%83%A3-patch}

* **Purpose:** Update **part** of a resource.
* **Idempotent:** Not inherently; depends on the patch document/operation
* **Safe:**  (modifies server state)
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

## **DELETE** {#_5%EF%B8%8F%E2%83%A3-delete}

* **Purpose:** Remove a resource.
* **Idempotent:**  (deleting same resource multiple times has same effect)
* **Safe:**  (modifies server state)
* **Request Body:** Usually none
* **Use Case:** Delete a user, post, or file.

**Example:**
```http
DELETE /users/123 HTTP/1.1
```

**Response:** `204 No Content`

---

## **HEAD** {#_6%EF%B8%8F%E2%83%A3-head}

* **Purpose:** Retrieve headers only (no response body)
* **Idempotent:** Yes
* **Safe:** Yes
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

## **OPTIONS** {#_7%EF%B8%8F%E2%83%A3-options}

* **Purpose:** Discover supported HTTP methods and CORS policies for a resource.
* **Idempotent:** Yes
* **Safe:** Yes
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

## Other Less Common Verbs {#_8%EF%B8%8F%E2%83%A3-other-less-common-verbs}

| Verb              | Purpose / Use Case                                          |
| ----------------- | ----------------------------------------------------------- |
| **CONNECT**       | Establish a tunnel (e.g., HTTPS through a proxy)            |
| **TRACE**         | Echo the request for debugging (rarely used, security risk) |
| **LINK / UNLINK** | Rare, manage relationships between resources                |

---

## Summary Table {#%F0%9F%A7%A0-summary-table}

| Method  | Safe | Idempotent | Typical Use Case           |
| ------- | ---- | ---------- | -------------------------- |
| GET     | Yes | Yes | Read/fetch resource        |
| POST    | No | No | Create resource / action   |
| PUT     | No | Yes | Replace resource           |
| PATCH   | No | Depends on operation | Partial update             |
| DELETE  | No | Yes | Delete resource            |
| HEAD    | Yes | Yes | Fetch headers only         |
| OPTIONS | Yes | Yes | Discover supported methods |

---

### Best Practices {#%F0%9F%92%A1-best-practices}

* **GET** → fetch data only
* **POST** → create new resources
* **PUT/PATCH** → update resources (choose based on full vs partial update)
* **DELETE** → remove resources
* **HEAD/OPTIONS** → meta operations, CORS, or preflight checks
* Always respect **idempotency** and **safety** for proper REST design


## Idempotency, concurrency and safe retries

Idempotency concerns the **intended effect** of repeating an identical request. DELETE can return204 first and404 later while leaving the resource absent both times. Safe methods can still have incidental access logs, but a GET endpoint must not be designed to transfer money or unsubscribe a user. POST can define an application idempotency-key contract; the method itself does not guarantee one. PATCH can be idempotent when setting email to a fixed value, and non-idempotent when appending/incrementing.

<<< ../../workbench/engineering/security/patch-semantics.mjs{js}

A retry that repeats the same intended assignment can still overwrite somebody else's concurrent update. Use a version/strong ETag with If-Match for a conditional update; the server must check the condition and perform the write atomically. A stale precondition receives412 rather than silently overwriting newer state.

After an uncertain network result, fetch/reconcile the current version; do not automatically replace the precondition with the newest ETag and retry an old edit. PATCH media type defines patch semantics (for example JSON Patch or JSON Merge Patch); application/json alone in the introductory example is a custom API contract, not a standard generic patch format.


References checked2026-10-22: [HTTP safety/idempotency](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2), [PATCH semantics/preconditions](https://www.rfc-editor.org/rfc/rfc5789.html). The networking/authentication modules provide the fuller server-side boundary; these rules apply across HTTP versions.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/security/Could_you_please_provide_me_a_detailed_explanation_about_HTTP_verbs.md). All learner practice remains outstanding.
