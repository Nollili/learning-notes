# 🌐 REST — Representational State Transfer

REST is an **architectural style** for designing networked applications, commonly used for web APIs. It defines a set of principles for **client-server communication** over HTTP.

---

## 🔑 Key Concepts

1. **Resource-Oriented**
    - Everything is a resource, identified by a URL.
    - Example:  
      - `/users` → collection of users  
      - `/users/123` → specific user

2. **Stateless**
    - Each request contains all information the server needs.
    - Server does **not store client session state** between requests.

3. **Uniform Interface**
    - Standard HTTP methods are used for actions:
      | Method | Action | Example |
      |--------|--------|---------|
      | GET    | Retrieve resource | GET `/users/123` |
      | POST   | Create new resource | POST `/users` |
      | PUT    | Replace resource | PUT `/users/123` |
      | PATCH  | Update resource | PATCH `/users/123` |
      | DELETE | Remove resource | DELETE `/users/123` |

4. **Cacheable**
    - Responses can be cached to improve performance.
    - Controlled via HTTP headers (`Cache-Control`, `ETag`, `Last-Modified`).

5. **Client-Server Separation**
    - Client handles UI and user experience.
    - Server handles data, business logic, and security.
    - Promotes scalability and maintainability.

6. **Layered System**
    - Client does not need to know if it is connected directly to the server, or through intermediate layers (load balancers, proxies, gateways).

---

## ✅ Advantages of REST

- Simple and widely adopted
- Scales well (stateless design)
- Works over HTTP → compatible with CDNs, caching
- Easy to test and debug
- Human-readable URLs and methods

---

## ⚠️ Limitations

- Not ideal for **real-time communication** (requires polling or WebSockets)
- Statelessness may lead to repeated authentication on each request
- Can be inefficient for complex operations requiring multiple requests

---

## 🔧 Example: RESTful API

**Request:**
```http
GET /users/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com"
}
```

---

**Summary:**

> REST is about **resources**, **stateless communication**, and using **HTTP standards** effectively. It is the foundation for most web APIs and works well with modern front-end applications.
