# REST — Representational State Transfer {#%F0%9F%8C%90-rest-%E2%80%94-representational-state-transfer}

REST is an **architectural style** for designing networked applications, commonly used for web APIs. It defines a set of principles for **client-server communication** over HTTP.

---

## Key Concepts {#%F0%9F%94%91-key-concepts}

1. **Resource-Oriented**
    - Identify domain resources and exchange representations; a resource is not necessarily one database row.
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

## Advantages of REST {#%E2%9C%85-advantages-of-rest}

- Simple and widely adopted
- Scales well (stateless design)
- Works over HTTP → compatible with CDNs, caching
- Easy to test and debug
- Human-readable URLs and methods

---

## Limitations {#%E2%9A%A0%EF%B8%8F-limitations}

- Real-time delivery needs an explicit interaction/transport choice such as polling, streaming/SSE or WebSockets; REST statelessness does not prohibit persistent HTTP connections.
- Statelessness may lead to repeated authentication on each request
- Can be inefficient for complex operations requiring multiple requests

---

## Example: RESTful API {#%F0%9F%94%A7-example-restful-api}

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


## Uniform interface is more than a method table

REST's uniform interface includes identifying resources, manipulating them through representations, self-descriptive messages and hypermedia that drives available application transitions. Standard methods/status/content/cache metadata contribute to the message contract. Merely putting JSON behind GET/POST paths does not establish every REST constraint. The style also includes client-server, stateless, cache, layered-system and optional code-on-demand constraints. Stateless requests do not mean no durable server resources or no persistent transport connection; server-session workflows should be described honestly rather than labelled pure REST automatically.

For example, a user representation can contain a self link and related project collection link using a documented link relation/media contract. A client follows an offered relation instead of constructing every workflow URL from undocumented assumptions. Link discovery does not grant authorization, and an absent operation link is not a substitute for server enforcement. Many pragmatic APIs are resource-oriented HTTP/JSON APIs with limited hypermedia; state that scope explicitly.

## Worked versioned consumer boundary

Assume a maintained /v1/users/123 returns id/name and a deliberately versioned /v2/users/123 returns id/displayName. Preserve the numeric id contract; adding a new version does not silently change its type. Normalize the known negotiated representation at the client boundary, then let the UI use one domain model.

<<< ../../workbench/engineering/security/user-contract.ts{ts}

This parser projects JSON-style values; it is not a server implementation, authorization check or general sanitizer for hostile in-process getters/proxies. Check status/content/body limits before parsing and select a supported version deliberately. Do not guess a version from whichever field happens to exist; mixed payloads must use the negotiated field.

Support old/new consumers during a documented migration window, monitor deprecated usage and publish removal policy before deleting the old contract. Additive fields can still break an exact consumer schema; enum expansion/default/error behavior needs compatibility tests, not an assumption that “additive” means safe.


Primary architectural reference checked2026-10-22: [Fielding REST constraints/uniform interface](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm). The versioned parser is a pragmatic HTTP/JSON consumer example, not proof that a full hypermedia system has been implemented.


## Separate practice

Use the [focused acceptance and evidence requirements](../../practice/engineering/security/What_is_REST.md). All learner practice remains outstanding.
