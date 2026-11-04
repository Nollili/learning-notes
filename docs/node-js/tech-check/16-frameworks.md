---
outline: [2, 3]
---

# Framework foundations

These questions complete the framework basics part of Node.js Foundations. The primary implementation is Express 5 on Node.js 24, using `.mjs` files. Other frameworks are comparison points, not additional required implementations.

Use a separate learning folder for the runnable example. Preserve an existing project's build, test and database configuration, particularly an Autocode template. This local HTTP lab has no authentication or persistence; later application chapters cover those responsibilities.

### What does a web framework provide, and how do MVC, full-stack frameworks and API frameworks differ? {#t16-q01}

*Study depth: Foundational*

<span class="notes-section-label">**Think before reading**</span>

A service receives `GET /products/42` and returns JSON. Another service renders an HTML product page. Must they use different runtimes? Does installing a framework automatically provide a product database?

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A web framework supplies reusable HTTP application mechanics: routing, middleware, request/response helpers and error flow. **Node supplies the underlying runtime and networking facilities**. **MVC separates models, views and controllers**; an API application commonly returns data rather than rendering a view. A full-stack framework supplies or integrates broader application conventions. These are **overlapping architectural descriptions, not mutually exclusive runtime types**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

With `node:http`, you can inspect a request and write a response directly. Once multiple endpoints need path matching, body parsing and shared policies, a framework avoids repeatedly building that plumbing. It does not eliminate the need to understand HTTP or resource ownership.

| Concept | Responsibility | Example decision |
|---|---|---|
| Model | Application data and relevant behavior | What makes a product valid? |
| View | Presentation of application state | Render an HTML product page |
| Controller | Translate a request into an application operation and response | Fetch a product and choose the response |
| API transport | Expose application capabilities over a protocol | Return JSON with an appropriate status |
| Full-stack conventions | Integrate multiple application concerns | Coordinate routing, rendering and data access |

A model is not necessarily an ORM entity. Returning JSON does not automatically make an interface RESTful: resource semantics, HTTP methods, caching and status contracts still matter. An API can reuse services and repositories without having server-rendered views.

Express is deliberately flexible. It can support an MVC arrangement or a JSON API, but does not impose a database layer, dependency-injection container or business architecture. **Installing it does not establish authentication, authorization, runtime validation or durable storage**.

<span class="notes-section-label">**Example answer**</span>

Both services can use Node and Express. The JSON service might call `res.json(product)`; the HTML service can use a configured template engine. Both still need a product source and business rules. A framework change need not force a change to those rules if HTTP concerns are kept at the boundary.

<span class="notes-section-label">**Common mistakes**</span>

- Calling Node a web framework rather than a runtime.
- Treating MVC as three folders regardless of dependency boundaries.
- Assuming a “full-stack” label guarantees every database or authentication choice is built in.
- Putting persistence queries and business decisions into every route because a framework permits it.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can an API have controllers?**</span> Yes. Controllers adapt transport inputs and outputs; they do not require server-rendered HTML.
2. <span class="notes-section-label">**Must a small app have three layers?**</span> No. Preserve meaningful responsibilities without creating empty forwarding layers just for a diagram.
3. <span class="notes-section-label">**When is raw Node HTTP enough?**</span> A small, tightly bounded endpoint or protocol exercise may need little routing infrastructure. Reassess as shared HTTP concerns grow.

::: tip Key takeaway
A framework provides HTTP mechanics; your application still owns its contracts, business rules and dependencies.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

For a product lookup, write a responsibility map covering transport, business rules, storage and presentation. Acceptance: explain where input validation belongs, which pieces could survive an Express-to-another-framework migration, and why returning JSON alone does not prove REST conformance.

Official references: [Express FAQ: structure and database boundaries](https://expressjs.com/en/starter/faq/), [Express API overview](https://expressjs.com/en/5x/api/).


---

### How should you choose a framework without learning every alternative? {#t16-q02}

*Study depth: Foundational → Intermediate*

<span class="notes-section-label">**Decision exercise — attempt first**</span>

An existing team maintains an Express service. A new internal endpoint needs two routes and a repository adapter. Someone proposes rewriting the service in a different framework because a benchmark shows higher requests per second. What evidence would justify the change?

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>



**Start from requirements and the existing system**: runtime/deployment constraints, team knowledge, lifecycle conventions, integration needs and measured bottlenecks. **Select one primary framework and learn its contracts well**. Compare alternatives where their design solves a real problem; **a synthetic throughput ranking is not enough to justify migration**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

For this guide, Express 5 is the primary stack because its small routing and middleware surface makes HTTP boundaries visible. This is a teaching choice, not a claim that it is the best option for every workload.

| Alternative | Main comparison question | Cost to evaluate |
|---|---|---|
| Express | Do we want a flexible HTTP middleware/router foundation? | The team must choose structure and supporting integrations |
| Koa | Do we want middleware composed around `await next()` and a request context? | Express middleware is not automatically interchangeable; select compatible integrations |
| NestJS | Do we benefit from modules, controllers and injected providers? | Learn the framework's lifecycle and conventions; account for the selected HTTP adapter |
| Hapi | Does the existing service or team rely on its route/plugin lifecycle? | Evaluate its own plugin contracts rather than importing Express assumptions |
| Feathers | Do service abstractions and HTTP/real-time integration fit our application? | Understand service hooks, adapters and authorization boundaries |

These are comparison leads. The exercise does not require installation of every alternative or mastery of every framework named in the source list.

A useful decision record names the requirement, alternatives, evidence, costs and a condition for revisiting the choice. For the scenario, preserve Express unless a requirement cannot reasonably be met or measurements show a material bottleneck attributable to the framework.

Database latency, synchronous CPU work and excessive payloads often dominate an endpoint. Replacing the router will not automatically fix these. Measure a representative workload, including validation and storage, rather than extrapolating from a trivial response benchmark.

<span class="notes-section-label">**Common mistakes**</span>

- Selecting technology only because it is familiar, without checking whether deployment constraints fit.
- Selecting technology only because it is new, without considering migration and maintenance costs.
- Comparing framework overhead while ignoring downstream operations and security behavior.
- Treating a framework's architectural conventions as proof of good application boundaries.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**When would stronger conventions help?**</span> Shared modules and explicit dependency boundaries may reduce inconsistency across a growing team; those benefits must outweigh added concepts and constraints.
2. <span class="notes-section-label">**Can the existing code limit a choice?**</span> Yes. Middleware, integrations, tests and operational knowledge have replacement costs; compatibility is part of the decision.
3. <span class="notes-section-label">**How do you investigate performance claims?**</span> Reproduce the actual workload, measure latency distributions and saturation, identify where time is spent, and compare equivalent behavior before proposing a migration.

::: tip Key takeaway
Choose for requirements and maintainability, then measure. Learning one stack deeply is more useful than collecting framework names.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Write a one-page decision record for the scenario. Acceptance: compare Express with one alternative, name two constraints and one measurable success criterion, and explain the cost and rollback approach for a migration. Keeping Express is a valid conclusion.

Official references: [Koa middleware composition](https://koajs.com/), [NestJS concepts](https://docs.nestjs.com/), [Hapi](https://hapi.dev/), [Feathers overview](https://feathersjs.com/). Only Express is executed in the following lab.


---

### How do you install Express and separate the application from its HTTP server? {#t16-q03}

*Study depth: Foundational → Intermediate*

<span class="notes-section-label">**Predict before running**</span>

If a test imports `app.mjs`, should it immediately open port 3000? If a port is occupied, does constructing an Express application detect that failure?

<span class="notes-section-label">**Create a separate lab folder**</span>

```bash
mkdir express-foundations-lab
cd express-foundations-lab
npm init -y
npm install --save-exact express@5.2.1
```

This example uses Express 5.2.1, a pinned validation baseline, not a claim that it is the newest or permanently safe release. Express 5 requires Node 18 or higher; use the guide's Node 24 baseline. Keep `package.json` and `package-lock.json` together; a clean checkout uses `npm ci`. `.mjs` selects ES Modules without changing `package.json`'s module type.

Save this as `app.mjs`:

```js
import express from 'express';

export function createApp({ label = 'study' } = {}) {
  if (typeof label !== 'string' || !/^[a-z][a-z0-9-]{0,31}$/.test(label)) {
    throw new TypeError('Invalid application label');
  }
  const app = express();
  app.disable('x-powered-by');
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: label });
  });
  app.use((_req, res) => {
    res.status(404).json({ error: 'NOT_FOUND' });
  });
  return app;
}
```

Save this as `server.mjs`:

```js
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createApp } from './app.mjs';

const port = 3000;
const label = 'study';
const server = createServer(createApp({ label }));
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => {
    process.exitCode = 1;
    server.closeAllConnections();
  }, 5000);
  server.close(error => {
    clearTimeout(deadline);
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
    if (error) process.exitCode = 1;
  });
}

try {
  const listening = once(server, 'listening');
  server.listen(port, '127.0.0.1');
  await listening;
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  console.log(`Listening at http://127.0.0.1:${port}`);
} catch {
  console.error('HTTP_START_FAILED');
  process.exitCode = 1;
}
```

Run `node server.mjs` and request `http://127.0.0.1:3000/health` in another terminal or browser. Expect status 200 with `{"status":"ok","service":"study"}`; an unmatched path returns JSON with status 404. Stop the server with Ctrl+C.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Install the framework as a runtime dependency, **construct the application without opening a socket**, and let a separate entry point own listening and shutdown. An Express app is a request handler; **the HTTP server owns the port and connections**. **Startup succeeds when listening is confirmed**, not when the app object is created.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

`createApp()` returns a new middleware/router stack. It can be imported without binding a port, and separate instances can have different configuration. The server entry point composes that handler with Node HTTP, reports readiness after `listening`, and turns bind failure into a nonzero exit status.

`once(server, 'listening')` is registered before `listen()`; Node's event helper rejects when an `error` occurs while waiting. This makes `EADDRINUSE` an observable startup failure. Do not print a success message before binding actually succeeds.

The shutdown owner stops accepting new connections and allows active ordinary HTTP requests to finish. After five seconds, the lab destroys remaining HTTP connections and sets a failing exit status. The referenced deadline is cleared on closure. This is a small local server: upgraded sockets, databases, worker pools and durable jobs would need their own shutdown owners.

`/health` here is liveness, **not database readiness**. It proves this handler can respond. Removing `x-powered-by` avoids one disclosure header; it does not establish application security.

<span class="notes-section-label">**Common mistakes**</span>

- Installing Express only as a development dependency while expecting production runtime imports to work.
- Importing a module that unexpectedly starts a server during every test.
- Assuming an Express app and a listening server are the same object.
- Calling `process.exit()` immediately on a signal, interrupting responses and buffered output.
- Treating this unauthenticated local lab as a public deployment template.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why keep the lockfile?**</span> It records the resolved dependency graph so clean installations can reproduce it; it does not remove the need to review updates.
2. <span class="notes-section-label">**How would a test avoid a fixed-port conflict?**</span> Create its own HTTP server and request port `0`, then read the assigned address and close it afterward.
3. <span class="notes-section-label">**Does an unknown route reach error middleware automatically?**</span> No. Register a terminal not-found response after the routes. An unmatched route is not itself a thrown exception.

::: tip Key takeaway
Build the app without side effects; let the entry point own startup, the listening socket and bounded shutdown.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Run two servers on the same port. Acceptance: the second exits unsuccessfully without claiming readiness; the first still responds. Import `app.mjs` without running `server.mjs` and verify that the process exits without opening a port. Stop the running service and confirm it releases its socket.

Official references: [Express installation](https://expressjs.com/en/starter/installing/), [Express 5 migration requirements](https://expressjs.com/en/guide/migrating-5/), [Node 24 HTTP lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/http.html#servercloseallconnections).


---

### How should configuration and dependencies enter an application? {#t16-q04}

*Study depth: Foundational → Intermediate*

<span class="notes-section-label">**Predict before reading**</span>

What should happen if `PORT` is `3000garbage`, `0`, an empty string, or missing? Should a request handler re-read `process.env` on every request? Does `process.env.ENABLED === 'false'` become false when passed to `Boolean()`?

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>



**Read and validate configuration at the startup boundary, before acquiring resources**. Convert strings to intentional application values, then **pass those values and explicit dependencies into the application**. Keep infrastructure construction and cleanup in one composition point. Environment variables are strings; **their existence does not make them valid or safe to log**.

</div>

<span class="notes-section-label">**Worked example**</span>

Save `config.mjs` alongside the previous files:

```js
export function readConfig(env) {
  const rawPort = env.PORT ?? '3000';
  if (typeof rawPort !== 'string' || !/^[0-9]{1,5}$/.test(rawPort)) {
    throw new TypeError('PORT must contain only decimal digits');
  }
  const port = Number(rawPort);
  if (port < 1 || port > 65535) {
    throw new RangeError('PORT must be between 1 and 65535');
  }
  const label = env.SERVICE_LABEL ?? 'study';
  if (typeof label !== 'string' || !/^[a-z][a-z0-9-]{0,31}$/.test(label)) {
    throw new TypeError('Invalid SERVICE_LABEL');
  }
  return Object.freeze({ port, label });
}
```

In `server.mjs`, add `import { readConfig } from './config.mjs';` and replace the two hard-coded constants with:

```js
const { port, label } = readConfig(process.env);
```

The rest of the entry point stays the same. From the lab directory, use Node 24's `--env-file` option with a local `.env` file:

```dotenv
PORT=3000
SERVICE_LABEL=catalog
```

Run `node --env-file=.env server.mjs`. The health response now identifies `catalog`. Keep secret-bearing environment files out of version control; an example configuration should contain names and placeholders rather than credentials.

<span class="notes-section-label">**Detailed explanation**</span>

The port policy intentionally rejects an empty string, fractional values, whitespace, signs, suffixes and `0`. Port `0` remains useful in a test-owned server, but is excluded from this runnable service's configured contract. **Missing means default; present-but-invalid means failure**. Do not use `parseInt()` to accept a malformed suffix accidentally.

Configuration validation runs before `createServer()` or listening. An invalid configuration throws during startup, producing a nonzero process exit without binding a port. `Object.freeze()` prevents changes to the returned object's properties; it would not deeply freeze future nested objects.

`Boolean('false')` is true because the nonempty string is truthy. A future boolean option needs an explicit accepted vocabulary, such as exactly `'true'` or `'false'`, and a rejection policy for other values. Do not silently broaden the configuration contract.

Dependencies are capabilities. Today `createApp({ label })` receives a value. With storage, composition might pass a product-service object with a documented asynchronous method. Routes should receive that capability rather than create a fresh database pool per request or import mutable global test state.

Keep module imports, packages and application dependencies distinct: an npm dependency supplies executable code; an injected dependency supplies a specific application's configured capability. A constructor parameter is not proof of a valid implementation—validate its interface where appropriate and exercise failure behavior.

If startup later opens a database and HTTP binding fails, startup must close the acquired database resource. If no database is used, do not open one just to satisfy an architectural diagram. Multi-resource readiness and cleanup are higher-level lifecycle work, not completed by this basic lab.

<span class="notes-section-label">**Common mistakes**</span>

- Reading configuration throughout business logic, making tests depend on the process's ambient environment.
- Letting different modules apply different defaults to the same setting.
- Logging the complete environment or connection string to diagnose startup.
- Assuming TypeScript types validate deployment strings at runtime.
- Installing packages during each service startup rather than producing a reproducible artifact beforehand.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Should invalid configuration be retried indefinitely?**</span> No. Fail clearly before serving traffic; an operator must correct it. A bounded dependency retry is a different policy.
2. <span class="notes-section-label">**Why not read environment variables inside every handler?**</span> Startup parsing gives a consistent snapshot and a testable boundary; dynamic configuration needs a deliberate refresh and validation design.
3. <span class="notes-section-label">**Can dependencies be replaced in tests?**</span> Yes, when their contracts are explicit. A fake can isolate a service; integration tests must still verify the real adapter and lifecycle separately.

::: tip Key takeaway
Parse configuration once, reject invalid values before opening resources, and pass explicit values and capabilities to the application.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Check defaults and valid custom settings, then try `PORT=''`, `PORT=0`, `PORT=65536`, `PORT=3.5`, `PORT=3000x` and a label containing spaces. Acceptance: invalid settings fail before listening; valid settings produce the expected health JSON; changing one app instance's label does not change another. Do not print any real secrets.

Official references: [Node 24 environment files](https://nodejs.org/download/release/v24.18.0/docs/api/cli.html#--env-filefile), [Express application API](https://expressjs.com/en/5x/api/application/), [Express FAQ: application structure](https://expressjs.com/en/starter/faq/).

## Foundations revision

<span class="notes-section-label">**Framework-basics checklist**</span>

- [ ] Explain runtime versus framework and MVC versus a JSON API.
- [ ] Justify one primary framework and compare one alternative.
- [ ] Install a pinned runtime dependency and reproduce it from the lockfile.
- [ ] Build an importable app without opening a listener.
- [ ] Explain the app/server distinction and diagnose a port conflict.
- [ ] Validate configuration before resource acquisition and stop the local service cleanly.

These are learner tasks. Written answers and author checks do not mark them completed. This page finishes the basic framework scope; advanced routing, middleware composition, business CRUD, persistence, authentication and optimization remain in their respective application/service groups.

<span class="notes-section-label">**Mixed practice — answer before revealing the explanations**</span>

1. A service returns HTML today and JSON tomorrow. Which concerns must change, and which can remain?
2. A faster framework benchmark appears, but your database accounts for nearly all endpoint latency. What should you measure first?
3. A deployment sets `PORT=3000junk`. Why might one parser accept it, and what should this lab do?
4. A test imports the application and never exits. What side effects should you inspect?

::: details Practice explanations
1. The transport/presentation response changes; business rules and storage can remain when boundaries are explicit. New contracts still require tests.
2. Profile the real request and its database operations before changing the HTTP adapter. Compare equivalent behavior and include migration cost.
3. `parseInt()` can accept a numeric prefix. This lab validates the entire string and rejects the malformed setting before binding.
4. Look for module-level listeners, database connections, timers or background work. Importing this lab's `app.mjs` alone should acquire none of them.
:::

## References and scope

Official Express documentation was checked on 2026-11-04. The executable baseline is Node.js 24.18.0 and Express 5.2.1, with npm's lockfile in a disposable lab. No framework migration or dependency update is required in your existing projects. The [Express and architecture course](../module-06-express-architecture.md) provides broader examples; these questions focus on the Foundations exam scope.

## Express applications with NestJS alongside {#application-frameworks}

Express is the main implementation: an app is an ordered HTTP middleware/router handler. NestJS adds an application structure around controllers, injected providers and modules, with guards, pipes, interceptors and filters for particular lifecycle concerns. Nest is a separate framework, not the next Express version. Its default Express adapter does not make all Express assumptions portable to every Nest adapter.

The application examples below use Express5.2.1 and Node24.18.0. They introduce a small in-memory Products API; it complements the tested quote API rather than replacing that lesson. A bounded Nest11.1.6 companion is assembled later, with equivalent read concepts and explicit limits. Keep all experiments in a separate lab and preserve actual assignment templates.


---

### How do Express routes match methods, paths and parameters? {#t16-q05}

*Study depth: Intermediate*

<span class="notes-section-label">**Predict before reading**</span>

For a router mounted at `/products`, does its `/:id` route include the `/products` prefix? If `/stats` comes after `/:id`, which handler might receive it? Does `?limit=5` become a path parameter?

`product-router.mjs` — routing only; the supplied controllers own behavior:

```js
// file: product-router.mjs
import { Router } from 'express';
export function createProductRouter(controllers) {
  const names = ['list', 'get', 'stats', 'page', 'create', 'update', 'remove'];
  if (names.some(name => typeof controllers?.[name] !== 'function')) {
    throw new TypeError('Product controllers required');
  }
  const router = Router();
  router.get('/page', controllers.page);
  router.get('/stats', controllers.stats);
  router.route('/').get(controllers.list).post(controllers.create);
  router.route('/:id').get(controllers.get).patch(controllers.update).delete(controllers.remove);
  return router;
}
```

Mount it with `app.use('/products', createProductRouter(controllers))`. For a routing-only check, supply handlers that return a small fixed marker; that verifies matching without claiming CRUD or persistence. Real controllers and services follow in separate questions.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A route matches an HTTP method and a path pattern within its mount point. Use a Router to organize a feature, **register specific paths before overlapping parameter paths**, and **validate decoded parameters/query/body values separately**. **Matching an endpoint does not validate or authorize its input**.

</div>

<span class="notes-section-label">**Explanation and edge cases**</span>

`GET /products/p1?limit=5` matches `/:id` with `req.params.id === 'p1'`; the query is separate. Inside a mounted router, `req.url` is relative to the mount while `req.originalUrl` retains the incoming URL. Do not log the latter indiscriminately: paths/query values may contain sensitive data.

The literal `/stats` must come before the overlapping `/:id` GET route. Express ordinarily supports HEAD via a matching GET route when a separate HEAD handler is absent; the response has no body. Unknown methods do not automatically become a complete custom405 policy. If the API requires405, define method fallbacks and the `Allow` header deliberately. Automatic OPTIONS behavior and explicit handlers must agree.

Express5 path syntax differs from old Express4 string-pattern examples: use documented named wildcards/optional groups and validate values in code rather than copy old inline-regexp strings blindly. For nested routers, parent parameters require `Router({ mergeParams: true })` when the child needs them; their existence still does not establish authorization.

<span class="notes-section-label">**NestJS alongside**</span>

`@Controller('products')` supplies a prefix; `@Get(':id')` and `@Param('id')` bind a handler and value. `@Query('limit')` is a separate source. A TypeScript annotation such as `limit: number` does not convert an incoming string by itself; use an explicit pipe or validated DTO. The runnable companion later shows `DefaultValuePipe`/`ParseIntPipe` and bound checks.

Common mistakes: repeating the mount prefix inside every route; letting a generic parameter swallow a reserved path; expecting TypeScript or matching to validate values; assuming every missing method is automatically405.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can two routers use `/:id` safely?**</span> Yes, with intentional distinct mounts and contracts; avoid accidental overlap/order dependence.
2. <span class="notes-section-label">**Does query order select a different route?**</span> Route path matching and query interpretation are distinct. Validate duplicates and allowed values explicitly.
3. <span class="notes-section-label">**Is a route handler necessarily a controller class?**</span> No. Express accepts functions; a controller is an architectural responsibility, not required class syntax.

::: tip Key takeaway
Separate matching, input interpretation and permissions. Route ordering is observable behavior.
:::

Practice — learner work still required: mount marker controllers and test collection, item, stats, HEAD, unknown path and malformed input. Acceptance: demonstrate the reserved-path order bug, restore it, and explain which validations still belong elsewhere.

Official references: [Express routing](https://expressjs.com/en/guide/routing/), [Express5 migration](https://expressjs.com/en/guide/migrating-5/), [Nest controllers](https://docs.nestjs.com/controllers).


---

### How does middleware compose request behavior without hanging or responding twice? {#t16-q06}

*Study depth: Intermediate*

<span class="notes-section-label">**Predict before reading**</span>

Which happens first: authentication or JSON parsing? What does `next()` return? If the response finishes and then closes, should one request produce two completion records?

`application.mjs` — a composition factory; all policy callbacks are explicit:

```js
// file: application.mjs
import express from 'express';
import { randomUUID } from 'node:crypto';
export function createApplication({ router, authenticate, errorHandler, observe = () => {}, viewsDirectory }) {
  if (typeof router !== 'function' || typeof authenticate !== 'function' ||
      typeof errorHandler !== 'function' || errorHandler.length !== 4 ||
      typeof observe !== 'function') throw new TypeError('Application policies required');
  const app = express();
  app.disable('x-powered-by');
  if (viewsDirectory !== undefined) {
    if (typeof viewsDirectory !== 'string') throw new TypeError('Trusted views path required');
    app.set('view engine', 'ejs');
    app.set('views', viewsDirectory);
  }
  app.use((req, res, next) => {
    const requestId = randomUUID();
    res.locals.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    const complete = outcome => {
      res.removeListener('finish', finished);
      res.removeListener('close', closed);
      const method = ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'].includes(req.method)
        ? req.method : 'OTHER';
      try { observe({ requestId, method, status: res.statusCode, outcome }); }
      catch { /* Fixture policy: reporting failure must not send another response. */ }
    };
    const finished = () => complete('finished');
    const closed = () => complete('aborted');
    res.once('finish', finished);
    res.once('close', closed);
    next();
  });
  app.use(authenticate);
  app.use(express.json({ limit: '1kb', inflate: false }));
  app.use('/products', router);
  app.use((_req, res) => res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND' } }));
  app.use(errorHandler);
  return app;
}
```

For routing-only tests, pass an explicit fixture authenticator that calls `next()` and a four-argument fixed500 error handler. That is a public test boundary, not private API authentication. The real fixture credential verifier and error mapping are supplied later; this factory has no automatic allow-all default.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>



**Middleware forms an ordered chain**. A path must **either end the response, pass control, or report a failure**; otherwise it hangs. Register policies before the routes they govern, **keep error middleware last**, and do not call `next()` after already sending a response. **Express `next()` is control transfer, not a promise that all downstream asynchronous work completed**.

</div>

<span class="notes-section-label">**Reason about ordering and ownership**</span>

The request ID is application-generated, not blindly copied from a client header. The observer records a bounded method label/status/outcome, not raw paths, tokens or request bodies. Its finish/close listeners remove each other so ordinary completion is recorded once. An aborted connection's current status is not proof of successful delivery.

Authentication before the parser can reject an unauthorized request without spending its body-parsing budget. Route-specific parsers or permission checks may need another arrangement; define that order from the threat model. The parser limit does not bound total service memory or all open connections.

The contained observer failure is an explicit teaching policy for that reporting callback, not permission to suppress business failures. A production reporting owner needs a reviewed fallback/metric when its sink is unavailable. No raw observer exception is exposed to the response here.

<span class="notes-section-label">**NestJS alongside**</span>

Nest middleware still performs request/response/next work, but authentication/authorization often belongs in a guard because it can inspect the selected handler's metadata. Pipes parse/validate inputs; interceptors surround handler execution; exception filters translate exceptions. Nest's request lifecycle orders these mechanisms; naming everything “middleware” loses useful boundaries. An Express `await next()` pattern does not become Koa-style composition merely because it appears in an async function.

Common mistakes: forgetting both `next` and a response; placing a parser after its route; logging whole incoming URLs; treating a finish event as business commit; swallowing all errors because a logger callback is contained.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does returning from middleware continue the chain?**</span> No. Call `next()` deliberately when continuing.
2. <span class="notes-section-label">**Does a close event roll back work?**</span> No. Resource cancellation and durable business outcome are separate decisions.
3. <span class="notes-section-label">**Why keep error-handler arity explicit?**</span> Express recognizes the four-argument error signature; defaults/rest parameters can obscure that contract.

::: tip Key takeaway
Compose policies in a deliberate order and give both the request and its reporting callbacks clear completion owners.
:::

Practice — learner work still required: record pipeline order, test a denied request before parsing, and confirm exactly one completion event for success. Acceptance: observer failure does not create a second response, and no path/token/body appears in its record. Add abort-specific evidence separately.

Official references: [Express middleware](https://expressjs.com/en/guide/using-middleware/), [Nest request lifecycle](https://docs.nestjs.com/faq/request-lifecycle), [Nest middleware](https://docs.nestjs.com/middleware).


---

### What belongs in a controller rather than a service or repository? {#t16-q07}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — locate the decisions**</span>

Who interprets `?limit=10`, who decides whether a product may be edited, and who knows how a product is stored? A thin controller should not perform all three jobs.

<span class="notes-section-label">**`catalog-errors.mjs`**</span>

```js
// file: catalog-errors.mjs
export class CatalogError extends Error {
  constructor(code) {
    if (!['INVALID_INPUT', 'MISSING', 'CONFLICT', 'FORBIDDEN', 'UNAUTHENTICATED'].includes(code)) {
      throw new TypeError('Unknown catalog error');
    }
    super('Catalog operation failed');
    this.name = 'CatalogError';
    this.code = code;
  }
}
```

`product-controllers.mjs` — the service returns public DTOs, not storage rows:

```js
// file: product-controllers.mjs
import { CatalogError } from './catalog-errors.mjs';
export function createProductControllers(service) {
  const methods = ['list', 'get', 'stats', 'create', 'update', 'remove'];
  if (methods.some(name => typeof service?.[name] !== 'function')) {
    throw new TypeError('Catalog service required');
  }
  return {
    async list(req, res) {
      const raw = req.query.limit ?? '10';
      if (typeof raw !== 'string' || !/^[1-9][0-9]?$/.test(raw) || Number(raw) > 50 ||
          Object.keys(req.query).some(key => key !== 'limit')) {
        throw new CatalogError('INVALID_INPUT');
      }
      res.json({ items: await service.list({ limit: Number(raw), actor: req.actor }) });
    },
    async page(req, res) {
      res.render('products', { items: await service.list({ limit: 10, actor: req.actor }) });
    },
    async get(req, res) { res.json(await service.get(req.params.id, req.actor)); },
    async stats(req, res) { res.json(await service.stats(req.actor)); },
    async create(req, res) {
      const product = await service.create(req.body, req.actor);
      res.status(201).location(`/products/${encodeURIComponent(product.id)}`).json(product);
    },
    async update(req, res) {
      res.json(await service.update(req.params.id, req.body, req.actor));
    },
    async remove(req, res) {
      await service.remove(req.params.id, req.actor);
      res.status(204).end();
    }
  };
}
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>



**A controller adapts transport input into a use-case call** and adapts its outcome into an HTTP response. **A service owns business rules and operation boundaries**; **a repository owns storage interaction**. **Keep `req`, `res` and HTTP status decisions out of reusable business/storage code**. Thin does not mean empty: query interpretation, status and Location are real controller responsibilities.

</div>

<span class="notes-section-label">**Reasoning and edge cases**</span>

Duplicate query values can arrive as an array, so `Number(req.query.limit)` is not a complete contract. The controller accepts exactly one decimal value from1 to50 and rejects unknown query fields. Missing and invalid input are different cases. Resource/body business validation remains in the reusable service.

`req.actor` must come from trusted authentication middleware, never a submitted owner/role field. The later service rechecks permission/ownership so non-HTTP callers cannot bypass business authorization. Returning a DTO from the service is a deliberate boundary; verify its field projection against real storage, not only a response mock.

Express5 observes each returned async handler promise. After a response is sent, the handler does not call `next()` again. A 204 has no JSON body. The Location path assumes this lab's `/products` mount; configure it consistently if an external API prefix changes.

<span class="notes-section-label">**NestJS alongside**</span>

A Nest controller typically injects an `@Injectable()` service through its constructor and uses `@Get`, `@Post`, `@Param`, `@Body` and `@Query` for transport bindings. Returning a DTO lets the standard adapter serialize it; using `@Res()` directly switches to adapter-specific response ownership and can require explicitly sending the response. Type annotations do not perform runtime validation. The companion below uses standard returns rather than raw-response mode.

Common mistakes: SQL inside controllers; service methods accepting Express Request; raw entity serialization; forwarding the same failure twice; accidental status200 for a create or content on204.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can a service run from a job?**</span> Yes, with explicit inputs/security context and dependencies; it should not need an HTTP object.
2. <span class="notes-section-label">**Why not mock every private helper?**</span> That verifies the current implementation arrangement, not the public use-case contract.
3. <span class="notes-section-label">**Where are transactions chosen?**</span> At the use-case boundary that knows which persistence steps must form one invariant, not independently in each controller call.

::: tip Key takeaway
Controllers translate protocols; services enforce use cases; repositories isolate persistence. Boundaries should keep changes local.
:::

Practice — learner work still required: test controller responses and exact service inputs, including duplicated/invalid limits. Acceptance: Location/status/body are intentional,204 is empty, and service calls contain plain values plus trusted actor context, not req/res.

Official references: [Express response API](https://expressjs.com/en/5x/api/response/), [Nest controllers](https://docs.nestjs.com/controllers), [Nest providers](https://docs.nestjs.com/providers).


---

### How do request completion, client disconnect and business completion differ? {#t16-q08}

*Study depth: Intermediate*

<span class="notes-section-label">**Predict before reading**</span>

The client disconnects while a service is awaiting a database reply. Is the service promise canceled? If `res.json()` returns normally, has the client certainly received and used the data? Can an error handler replace a response whose headers are already sent?

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A request has several related lifetimes: transport input, response output, application work and any durable operation. **Disconnect does not automatically cancel service work or undo a committed effect**. A response finish event is **local output completion, not proof of remote business processing**. **Give active work its own completion/cancellation owner** and **delegate late response failures instead of sending again**.

</div>

<span class="notes-section-label">**Follow the lab's successful request**</span>

1. Node accepts an HTTP message; the application creates a safe request identifier.
2. Authentication supplies a trusted actor; the parser handles the allowed bounded representation.
3. The router selects a handler; the controller interprets transport input.
4. The service checks rules/permissions and asks its repository for data.
5. The controller emits a public response; the application records its finish or aborted-close outcome once.

An early error skips the ordinary response path into error middleware. A late error cannot replace committed headers; use the [error-boundary explanation](./10-error-handling.md#t10-q06). A completed HTTP200 can still be truncated or fail during body consumption at the client.

<span class="notes-section-label">**Worked ownership pattern**</span>

The quote API's [admission handler](./15-testing.md#t15-q04) uses this structure:

```js
// Conceptual excerpt; the testing chapter contains the complete executable owner.
active++;
try {
  const result = await service.quote(id, quantity);
  res.json(result);
} finally {
  active--;
}
```

Its slot is released when the service settles, not simply when a client closes a response. Releasing on close while work is still running can allow more expensive work than intended. The pattern bounds only the stated handler work, not parser allocations, all sockets or every downstream resource.

For request-bound optional work, propagate an AbortSignal to APIs that actually support cancellation, clean up listeners and observe the final promise. A Promise race only ends one wait. For a durable payment/order/outbox workflow, define persistent outcome/reconciliation separately; client disappearance cannot be treated as proof of rollback.

<span class="notes-section-label">**NestJS alongside**</span>

Nest's typical lifecycle is middleware → guards → interceptors before the handler → pipes/handler → interceptor response path, with exception filters for uncaught exceptions in their scope. Interceptors wrap an Observable result, so operators such as `finalize` can observe termination, while `tap` on success alone misses some failures. Neither mechanism automatically cancels every driver or rolls back durable work. Guards can reject before the handler; test that denied requests do not invoke the use case.

<span class="notes-section-label">**Debugging decisions**</span>

If requests hang, locate whether the chain failed to continue/respond, a dependency never settled, or a resource remained active after response completion. Record phases/outcomes without raw body/token values. Use a controlled deferred dependency or completion event to reproduce the race, not an arbitrary sleep. An expected HTTP disconnect is not automatically a fatal process error.

Common mistakes: returning200 before required work completes; releasing admission only on successful work; treating finish as remote acknowledgement; canceling durable work without an outcome policy; trying to JSON-respond after headersSent.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can work continue after the response?**</span> Yes, but it needs a deliberate supervisor/durable owner; a floating promise is not one.
2. <span class="notes-section-label">**Does abort mean nothing happened?**</span> No. The remote or persistence outcome may require reconciliation.
3. <span class="notes-section-label">**Does every exception reach every filter?**</span> No. Framework scope/order and the actual async ownership determine that; detached work is not automatically part of the handler.

::: tip Key takeaway
Own transport and business lifetimes separately, then connect cancellation only where the operation's contract supports it.
:::

Practice — learner work still required: hold service work behind an event-controlled gate, disconnect a client, and verify that admission stays occupied until work settles. Acceptance: no early slot release, no second response, cleanup after both success/rejection, and an explicit policy for durable work. The Testing chapter's gate/recovery test is a starting point, not proof of every disconnect case.

Official references: [Node HTTP response lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/http.html), [Nest request lifecycle](https://docs.nestjs.com/faq/request-lifecycle), [Nest interceptors](https://docs.nestjs.com/interceptors).

---

### How do CRUD endpoints and an HTML page share business rules safely? {#t16-q09}

*Study depth: Intermediate*

<span class="notes-section-label">**Predict before reading**</span>

A PATCH carries `ownerId`, a negative price and a stale version. Should the controller spread it into storage? If two requests update version1 concurrently, should both silently overwrite the same record?

<span class="notes-section-label">**`catalog-domain.mjs`**</span> — an intentionally process-local repository and reusable service:

```js
// file: catalog-domain.mjs
import { randomUUID } from 'node:crypto';
import { CatalogError } from './catalog-errors.mjs';
const fail = code => { throw new CatalogError(code); };
const validId = id => typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id);
const project = row => ({ id: row.id, name: row.name,
  unitPriceCents: row.unitPriceCents, version: row.version });
function owner(actor, write = false) {
  if (!validId(actor?.id) || typeof actor.canWrite !== 'boolean') fail('UNAUTHENTICATED');
  if (write && !actor.canWrite) fail('FORBIDDEN');
  return actor.id;
}
function fields(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !allowed.includes(key))) fail('INVALID_INPUT');
}
function name(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 80) {
    fail('INVALID_INPUT');
  }
  return value.trim();
}
function price(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 1_000_000) fail('INVALID_INPUT');
  return value;
}
export function createMemoryCatalog() {
  const rows = new Map();
  const find = (id, actorId) => {
    const row = rows.get(id);
    if (!row || row.ownerId !== actorId) fail('MISSING');
    return row;
  };
  return {
    listOwned(actorId, limit) {
      return [...rows.values()].filter(row => row.ownerId === actorId).slice(0, limit)
        .map(row => ({ ...row }));
    },
    getOwned(id, actorId) { return { ...find(id, actorId) }; },
    countOwned(actorId) { return [...rows.values()].filter(row => row.ownerId === actorId).length; },
    insert(row) {
      if (rows.has(row.id)) fail('CONFLICT');
      rows.set(row.id, { ...row });
      return { ...row };
    },
    updateOwned(id, actorId, version, patch) {
      const row = find(id, actorId);
      if (row.version !== version) fail('CONFLICT');
      const updated = { ...row, ...patch, version: row.version + 1 };
      rows.set(id, updated);
      return { ...updated };
    },
    removeOwned(id, actorId) { find(id, actorId); rows.delete(id); }
  };
}
export function createCatalogService(repository, { newId = randomUUID } = {}) {
  const required = ['listOwned', 'getOwned', 'countOwned', 'insert', 'updateOwned', 'removeOwned'];
  if (required.some(key => typeof repository?.[key] !== 'function') ||
      typeof newId !== 'function') throw new TypeError('Catalog dependencies required');
  const checkedId = id => { if (!validId(id)) fail('INVALID_INPUT'); return id; };
  return {
    async list({ limit, actor }) {
      const actorId = owner(actor);
      if (!Number.isInteger(limit) || limit < 1 || limit > 50) fail('INVALID_INPUT');
      return (await repository.listOwned(actorId, limit)).map(project);
    },
    async get(id, actor) { return project(await repository.getOwned(checkedId(id), owner(actor))); },
    async stats(actor) { return { count: await repository.countOwned(owner(actor)) }; },
    async create(input, actor) {
      const actorId = owner(actor, true);
      fields(input, ['name', 'unitPriceCents']);
      const row = { id: newId(), name: name(input.name),
        unitPriceCents: price(input.unitPriceCents), ownerId: actorId, version: 1 };
      if (!validId(row.id) || ['stats', 'page'].includes(row.id)) {
        throw new TypeError('Invalid generated identity');
      }
      return project(await repository.insert(row));
    },
    async update(id, input, actor) {
      const actorId = owner(actor, true);
      checkedId(id);
      fields(input, ['name', 'unitPriceCents', 'version']);
      if (!Number.isSafeInteger(input.version) || input.version < 1 ||
          (!Object.hasOwn(input, 'name') && !Object.hasOwn(input, 'unitPriceCents'))) {
        fail('INVALID_INPUT');
      }
      const patch = {};
      if (Object.hasOwn(input, 'name')) patch.name = name(input.name);
      if (Object.hasOwn(input, 'unitPriceCents')) patch.unitPriceCents = price(input.unitPriceCents);
      return project(await repository.updateOwned(id, actorId, input.version, patch));
    },
    async remove(id, actor) { await repository.removeOwned(checkedId(id), owner(actor, true)); }
  };
}
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Define the resource contract, validate allowed inputs, generate identities server-side, **enforce business permission/ownership** and return deliberate public DTOs. Use POST/GET/PATCH/DELETE with documented status/body semantics. An HTML page can call the same service but **must render untrusted text with context-appropriate escaping**. **Storage and deployment guarantees must match the actual adapter**.

</div>

<span class="notes-section-label">**API behavior and trade-offs**</span>

The controllers return201+Location for create,200 for get/list/update, and204 without content for delete. Missing records and another owner's records share MISSING so the read does not disclose cross-owner existence. Read-only actors can read their own data but cannot mutate it. Owner/role/version fields are never mass-assigned from a create body.

PATCH requires the expected version and at least one changed field. The repository's check-and-update occurs without an await inside one synchronous Map operation, so concurrent calls in this one process cannot both update the same old version. **A real database needs an atomic conditional UPDATE/constraint/transaction**; this Map is **not persistent or multi-instance storage**. Lists are deliberately bounded, not a complete stable pagination protocol.

<span class="notes-section-label">**HTML alongside JSON**</span>

Install `ejs@3.1.10` in the lab and save **`products.ejs`** in a trusted views directory:

```html
<!-- file: products.ejs -->
<!doctype html>
<html lang="en"><meta charset="utf-8"><title>Products</title>
<body><h1>Products</h1><ul>
<% items.forEach(item => { %>
  <li><%= item.name %> — <%= item.unitPriceCents %> cents</li>
<% }) %>
</ul></body></html>
```

The finished router/controller factories above include `/products/page` before `/:id`. The controller calls `res.render('products', { items })`; configure `view engine` and a trusted views directory during composition below. `<%=` escapes HTML text; do not substitute unescaped `<%-` for product names. Text escaping is not a universal URL/script/CSS policy, and templates/engine options must never be supplied by a request.

<span class="notes-section-label">**NestJS alongside**</span>

Nest uses `@Post`, `@Get`, `@Patch` and `@Delete` for the same HTTP responsibilities; `@HttpCode(204)` is an explicit no-content choice. An injected provider can implement the same business rules, while `@Render`/configured views are a separate presentation adapter. Decorators do not supply persistence, ownership or optimistic locking automatically. The Nest companion remains a read-focused introduction rather than duplicating this complete CRUD implementation.

<span class="notes-section-label">**Common mistakes:**</span> spreading a body into an entity; accepting client-selected owner/role; calling a Map a production database; overwriting concurrent edits silently; rendering product names as raw HTML.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Is PATCH automatically idempotent?**</span> No. Its operation contract determines repeatability; this version check makes stale replay conflict rather than silently reapply.
2. <span class="notes-section-label">**Is the version field a complete distributed design?**</span> No. Its check must be atomic in the actual shared store and its conflict policy must be exposed deliberately.
3. <span class="notes-section-label">**Does JSON output need HTML escaping?**</span> Serialize proper JSON; apply output-context protections where the client renders it. Double-escaping data in the repository corrupts unrelated consumers.

::: tip Key takeaway
Share use cases between representations, and keep validation, ownership, concurrency and output encoding explicit at their proper boundaries.
:::

**Practice — learner work still required:** create/list/read/update/delete a product, race two version1 updates, and render a name containing HTML. Acceptance: one concurrent edit conflicts, other owners cannot read/edit, invalid owner/price fields fail,204 stays empty and the page escapes the name. Reproduce persistence/concurrency against a real database before claiming shared-store guarantees.

**Official references:** [Express routing](https://expressjs.com/en/guide/routing/), [Express template engines](https://expressjs.com/en/guide/using-template-engines/), [EJS escaping tags](https://ejs.co/), [Nest controllers](https://docs.nestjs.com/controllers).

### How do authentication, validation and error middleware work together? {#t16-q10}

*Study depth: Intermediate*

**Predict before reading**

A request claims `ownerId: 'alice'` in JSON but presents Bob's credential. Which identity should the service use? If the verifier itself fails, is the credential necessarily invalid? Should a body-parser error return its original body to the caller?

**`http-policies.mjs`**

```js
// file: http-policies.mjs
import { CatalogError } from './catalog-errors.mjs';
export function requireActor(verifyAccessToken) {
  if (typeof verifyAccessToken !== 'function') throw new TypeError('Verifier required');
  return async function authenticate(req, res, next) {
    const match = /^Bearer ([A-Za-z0-9_-]{1,128})$/i.exec(req.get('authorization') ?? '');
    const actor = match ? await verifyAccessToken(match[1]) : null;
    if (actor === null) { next(new CatalogError('UNAUTHENTICATED')); return; }
    if (typeof actor?.id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(actor.id) ||
        typeof actor.canWrite !== 'boolean') throw new TypeError('Invalid verified actor');
    req.actor = Object.freeze({ id: actor.id, canWrite: actor.canWrite });
    next();
  };
}
const domain = Object.freeze({
  INVALID_INPUT: [400, 'INVALID_INPUT'], MISSING: [404, 'PRODUCT_NOT_FOUND'],
  CONFLICT: [409, 'CONFLICT'], FORBIDDEN: [403, 'FORBIDDEN'],
  UNAUTHENTICATED: [401, 'UNAUTHENTICATED']
});
const parser = Object.freeze({
  'entity.parse.failed': [400, 'MALFORMED_JSON'], 'entity.too.large': [413, 'BODY_TOO_LARGE'],
  'encoding.unsupported': [415, 'UNSUPPORTED_ENCODING'],
  'charset.unsupported': [415, 'UNSUPPORTED_CHARSET']
});
export function catalogErrorHandler(error, _req, res, next) {
  if (res.headersSent) { next(error); return; }
  let result = [500, 'INTERNAL_ERROR'];
  if (error instanceof CatalogError && Object.hasOwn(domain, error.code)) {
    result = domain[error.code];
  } else if (error && typeof error.type === 'string' && Object.hasOwn(parser, error.type) &&
      error.status === parser[error.type][0]) {
    result = parser[error.type];
  }
  const [status, code] = result;
  if (status === 401) res.set('WWW-Authenticate', 'Bearer realm="catalog"');
  res.status(status).json({ error: { code, requestId: res.locals.requestId } });
}
```

**`catalog-app.mjs`** — wire the actual policies; no listener opens during import:

```js
// file: catalog-app.mjs
import { fileURLToPath } from 'node:url';
import { createMemoryCatalog, createCatalogService } from './catalog-domain.mjs';
import { createProductControllers } from './product-controllers.mjs';
import { createProductRouter } from './product-router.mjs';
import { createApplication } from './application.mjs';
import { requireActor, catalogErrorHandler } from './http-policies.mjs';
export function createCatalogApp({ verifyAccessToken, observe, repository = createMemoryCatalog(),
  newId, viewsDirectory = fileURLToPath(new URL('.', import.meta.url)) } = {}) {
  const service = createCatalogService(repository, { newId });
  const router = createProductRouter(createProductControllers(service));
  return createApplication({ router, authenticate: requireActor(verifyAccessToken),
    errorHandler: catalogErrorHandler, observe, viewsDirectory });
}
```

**Fixture verifier:** supply an async lookup over a server-owned Map from fixed test tokens to actors, returning `null` for unknown tokens. For example, map `fixture-alice` to `{ id: 'alice', canWrite: true }` and `fixture-reader` to `{ id: 'alice', canWrite: false }`. These are **disposable lab credentials**, not JWTs or a production login/token design. Never treat a Bearer prefix alone as verification.

**Short exam answer**

Authenticate credentials into trusted server context, validate transport/business input and authorize the use case/resource independently. Compose these policies in a deliberate order and translate only known errors at the HTTP boundary. Unknown verifier/dependency failures remain server failures; they must not become proof that the user supplied an invalid credential.

**Reasoning and security boundaries**

The verifier returns an actor or null under an explicit contract; a malformed verifier result is an internal failure. An outage rejects its promise, which Express5 forwards to the error handler. The handler returns fixed fields and a generated request ID, not error messages, body, stack, SQL or tokens.

The service enforces read-only/owner rules even for non-HTTP callers. Client-supplied identity/role fields are rejected by the create/update allowlist. Pagination and stats filter the owner **before** limiting/counting, rather than fetching another owner's data and hiding a few fields afterward.

401 has a Bearer challenge;403 means an authenticated actor lacks the capability; this lab uses404 for another owner's resource to avoid disclosing existence. These are documented choices, not evidence that status codes alone enforce security.

For production tokens use a reviewed verifier/session system with signature/trust, expiry/revocation, issuer/audience and permission rules as appropriate; see the Authentication/Security topics. Cookie-based browser authentication also needs its appropriate CSRF/origin policy. This opaque test-token Map does not implement those systems.

**NestJS alongside**

A guard can verify a credential and return/throw a deliberate decision, using handler metadata for authorization. A `ValidationPipe` with explicit class DTO rules can validate/transform input; `whitelist` and `forbidNonWhitelisted` help control unknown fields but do not authorize ownership. An exception filter translates known exceptions. Interfaces/type aliases disappear at runtime, so they cannot alone provide a validation schema.

The runnable companion uses a real guard and explicit parsing pipes with a tiny fixture credential; the main Express service remains the full ownership/CRUD implementation. Do not read raw adapter response/status behavior into every Nest platform configuration.

**Common mistakes:** trusting body/header user IDs; accepting any Bearer string; mapping verifier outage to401; accepting arbitrary error.status; spreading parser/driver errors into JSON; assuming DTO decorators enforce resource permissions.

**Examiner follow-ups**

1. **Can authenticated users read every product?** No. Identity and resource authorization are separate checks.
2. **Why validate again inside the service?** Other adapters/jobs can call it without the HTTP controller.
3. **What does the opaque fixture prove?** Policy composition and credential lookup behavior, not production token issuance, password storage or a JWT trust model.

::: tip Key takeaway
Only a trusted verifier establishes actor context; the use case still checks permissions, and a separate boundary controls public failures.
:::

**Practice — learner work still required:** run valid, missing, unknown and read-only credentials; attempt cross-owner access and mass assignment. Acceptance: denied/invalid requests do not mutate storage, verifier outage returns safe500, and no response/observer record contains a credential or private diagnostic. Replace the fixture with your actual reviewed authentication adapter before production use.

**Official references:** [Express error handling](https://expressjs.com/en/guide/error-handling/), [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [Nest guards](https://docs.nestjs.com/guards), [Nest validation](https://docs.nestjs.com/techniques/validation), [Nest filters](https://docs.nestjs.com/exception-filters).
