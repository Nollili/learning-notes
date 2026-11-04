---
outline: [2, 3]
---

# Testing Node.js applications

These questions build one small quote API through several test boundaries. The primary stack is Node.js 24.18.0, Jest 30.2.0, Express 5.2.1 and Supertest 7.1.4. Versions are a reproducible lab baseline, not a claim about the newest releases.

Create a separate scratch project. This lab uses CommonJS `.js` files so the basic Jest configuration needs no ESM loader or transform. Other chapters' `.mjs` examples remain ES Modules; follow an existing application's module/test setup instead of changing it to match this lab.

```bash
mkdir quote-testing-lab
cd quote-testing-lab
npm init -y
npm pkg set type=commonjs scripts.test=jest
npm install --save-exact express@5.2.1
npm install --save-dev --save-exact jest@30.2.0 supertest@7.1.4
```

Keep the lockfile. Test files below live at the scratch project's root, never in an Autocode `src/tests` directory. Preserve supplied build/Jest/database settings in actual assignments. The notes repository itself has a documentation build, not these application scripts.

### What makes a useful unit test, and which cases should it cover? {#t15-q01}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — choose the important partitions first**</span>

The quote rule uses integer cents, quantities from 1 to 100, a 500-cent shipping fee below a 5,000-cent subtotal, and free shipping at or above that threshold. Which examples detect an off-by-one error at the threshold?

<span class="notes-section-label">**`pricing.js`**</span>

```js
// file: pricing.js
class InputError extends Error {
  constructor(code) {
    super('Invalid input');
    this.name = 'InputError';
    this.code = code;
  }
}
function assertQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    throw new InputError('INVALID_QUANTITY');
  }
}
function quoteLine(unitPriceCents, quantity) {
  assertQuantity(quantity);
  if (!Number.isSafeInteger(unitPriceCents) || unitPriceCents < 1 ||
      unitPriceCents > 1_000_000) throw new TypeError('Invalid catalog price');
  const subtotalCents = unitPriceCents * quantity;
  const shippingCents = subtotalCents >= 5000 ? 0 : 500;
  return Object.freeze({ subtotalCents, shippingCents,
    totalCents: subtotalCents + shippingCents });
}
module.exports = { InputError, assertQuantity, quoteLine };
```

<span class="notes-section-label">**`pricing.test.js`**</span>

```js
// file: pricing.test.js
const { quoteLine, InputError } = require('./pricing');

test.each([
  [4999, { subtotalCents: 4999, shippingCents: 500, totalCents: 5499 }],
  [5000, { subtotalCents: 5000, shippingCents: 0, totalCents: 5000 }],
  [5001, { subtotalCents: 5001, shippingCents: 0, totalCents: 5001 }]
])('quotes the threshold neighbor %i', (price, expected) => {
  expect(quoteLine(price, 1)).toEqual(expected);
});
test('multiplies quantity before applying shipping', () => {
  expect(quoteLine(500, 2)).toEqual({
    subtotalCents: 1000, shippingCents: 500, totalCents: 1500
  });
});
test.each([0, 101, 1.5, '2', null, NaN])('rejects invalid quantity %p', quantity => {
  expect(() => quoteLine(500, quantity)).toThrow(InputError);
});
test.each([1, 100])('accepts quantity boundary %i', quantity => {
  expect(quoteLine(1, quantity).subtotalCents).toBe(quantity);
});
test.each([0, -1, 1.5, '500', Infinity])('rejects catalog price %p', price => {
  expect(() => quoteLine(price, 1)).toThrow(TypeError);
});
```

Run `npm test -- --runInBand pricing.test.js`. The three threshold neighbors should pass; changing `>= 5000` to `> 5000` should make the exact-boundary test fail.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A unit test isolates a cohesive behavior and **asserts its observable contract**. Choose meaningful input partitions: **normal cases, boundaries, invalid values and relevant collaborator failures**. **Make expected results independent of the implementation**, control nondeterminism and **use the smallest boundary capable of detecting the defect**.

</div>

<span class="notes-section-label">**Why these assertions matter**</span>

Arrange the input, act through the public function, then assert the result or deliberate failure. The expected totals are explicit business examples, not a second copy of the production formula. An assertion that only checks “result exists” could pass with wrong prices or shipping.

No mocks are needed for a deterministic calculation. In a service unit test, a stub supplies a dependency result, a fake implements a small working substitute, and a spy records a meaningful interaction. Jest's `jest.fn()` can play several roles; replacing every internal helper would couple the test to implementation details.

Prefer `toBe` for identity/primitive results, `toEqual` for values, and `toStrictEqual` when object types/undefined keys matter. For synchronous exceptions pass a function to `expect`; for promise rejection await or return `.rejects`. Catching an exception without an assertion is not a passing negative test.

<span class="notes-section-label">**Common mistakes**</span>

- Testing many arbitrary values while missing the decision boundary.
- Repeating the production calculation inside the expectation.
- Mocking the calculation being tested.
- Making unit tests depend on a live network or developer-owned files.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does a unit mean exactly one function?**</span> No. Define a cohesive public boundary; private helpers can remain real.
2. <span class="notes-section-label">**What does a surviving threshold mutation suggest?**</span> The assertions may not distinguish inclusive from exclusive behavior; examine the missing risk rather than add random cases.
3. <span class="notes-section-label">**Does high coverage prove these tests are good?**</span> No. Execution and assertion quality are different evidence.

::: tip Key takeaway
Test the contract at its important boundaries, with explicit outcomes that a real defect can contradict.
:::

Practice — learner work still required: explain the threshold partitions, run the temporary `>=` → `>` mutation, observe the intended failure and restore the code. Acceptance: the correct implementation passes and the wrong boundary fails for the business reason.

Official references: [Jest setup](https://jestjs.io/docs/30.0/getting-started), [matchers](https://jestjs.io/docs/30.0/using-matchers), [mock functions](https://jestjs.io/docs/30.0/mock-functions).


---

### What does contract testing verify that ordinary unit tests can miss? {#t15-q02}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — decide whether a change is compatible**</span>

A quote consumer expects integer cent fields. The provider changes `totalCents: 1500` to `totalCents: "15.00"`, or nests the fields under `data`. Its own unit tests still pass. What evidence catches the consumer/provider disagreement?

`quote-contract.js` — a small consumer-side runtime reader:

```js
// file: quote-contract.js
function readQuote(body) {
  const fields = ['subtotalCents', 'shippingCents', 'totalCents'];
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      fields.some(key => !Number.isSafeInteger(body[key]) || body[key] < 0) ||
      !Number.isSafeInteger(body.subtotalCents + body.shippingCents) ||
      body.totalCents !== body.subtotalCents + body.shippingCents) {
    throw new TypeError('Incompatible quote response');
  }
  return Object.fromEntries(fields.map(key => [key, body[key]]));
}
module.exports = { readQuote };
```

<span class="notes-section-label">**`contract.test.js`**</span>

```js
// file: contract.test.js
const { readQuote } = require('./quote-contract');
const expected = { subtotalCents: 1000, shippingCents: 500, totalCents: 1500 };

test('accepts the consumer contract and ignores additive metadata', () => {
  expect(readQuote({ ...expected, version: 'v1' })).toEqual(expected);
});
test.each([
  { ...expected, totalCents: '15.00' },
  { data: expected },
  { ...expected, totalCents: 1000 },
  { ...expected, shippingCents: -1 },
  null
])('rejects incompatible response %p', body => {
  expect(() => readQuote(body)).toThrow(TypeError);
});
```

Run `npm test -- --runInBand contract.test.js`. All six cases should pass because incompatible representations are deliberately rejected. These checks exercise the reader, not a deployed provider; the later framework/provider tests pass a real HTTP response through this same reader.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A contract test verifies an agreement at a boundary: payload shape/types, status/media semantics, required behavior and compatibility rules. **Consumer-driven testing records what a consumer actually needs and verifies the provider against it**. **A shared fake or two independently passing unit suites cannot establish that the real participants agree**.

</div>

<span class="notes-section-label">**Define the agreement before choosing tooling**</span>

| Contract element | This lab's expectation |
|---|---|
| Request | POST `/quotes`, JSON product ID and quantity |
| Success | Status200, JSON media type, the three integer-cent fields |
| Data semantics | Nonnegative safe integers; total equals subtotal plus shipping |
| Errors | Known statuses and a stable error code; no private diagnostic data |
| Compatibility | Additional benign metadata is tolerated; missing/renamed/retargeted fields are breaking |

The reader checks structural and arithmetic agreement, not every pricing rule. The threshold rule belongs to the pricing tests. Tolerating additive fields is a consumer compatibility choice, **not permission for the provider to expose secrets**; the provider still needs an explicit public-field projection test.

For a repository contract, run the same behavioral suite against a fake and the real adapter: absence semantics, supported queries and failure behavior must match. A fake that returns `undefined` while production returns `null` can invalidate service tests. This lab's real file adapter is introduced next.

<span class="notes-section-label">**Consumer-driven workflows**</span>

Tools such as Pact can record consumer interactions and verify them against the provider, tracking versions and deployment compatibility. The useful workflow is consumer expectation → published/versioned contract → provider verification → deployment decision. A green consumer test against a mock alone is only the first step.

Schema checks do not automatically prove authorization, state transitions, transaction isolation or the intended production deployment. Add semantic examples where types alone are insufficient. Coordinate breaking changes with versioning or an expand/migrate/retire process rather than updating both sides' fixtures silently.

<span class="notes-section-label">**Common mistakes**</span>

- Calling a hard-coded sample a verified provider contract.
- Updating expected payloads to match a break without consulting consumers.
- Requiring exact equality for every optional metadata field while overlooking a required field's changed units.
- Treating a schema as a substitute for integration or critical E2E behavior.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Is this reader a complete contract-testing platform?**</span> No. It is an executable local boundary agreement; publication/version gates and consumer/provider deployments are not implemented.
2. <span class="notes-section-label">**Can a shape-correct total still be wrong?**</span> Yes. Semantic examples and business tests are still needed.
3. <span class="notes-section-label">**Why allow unknown benign fields?**</span> It permits additive evolution when the consumer does not depend on those fields. Provider disclosure rules remain separate.

::: tip Key takeaway
Verify both sides of a boundary agreement; a convenient mock is not evidence that the provider satisfies its consumers.
:::

Practice — learner work still required: change the provider's total to a string and identify the failing contract. Acceptance: retain the consumer reader, later exercise it against the actual HTTP response, and explain which changes require consumer coordination.

Official references: [Pact consumer-driven contracts](https://docs.pact.io/), [Jest assertions](https://jestjs.io/docs/30.0/expect).


---

### How do you write an integration test with real components and isolated state? {#t15-q03}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — name the real boundary**</span>

The next test combines a real service, pricing rules, catalog adapter and filesystem. A repository stub returning a row would not establish that file parsing and absence behavior work. This read-only JSON catalog is a small lab adapter, not a database replacement or a concurrent write store.

<span class="notes-section-label">**`service.js`**</span>

```js
// file: service.js
const { InputError, assertQuantity, quoteLine } = require('./pricing');
class NotFoundError extends Error {}
function createQuoteService(repository) {
  if (typeof repository?.findById !== 'function') throw new TypeError('Repository required');
  return {
    async quote(id, quantity) {
      if (typeof id !== 'string' || !/^[a-z0-9-]{1,32}$/.test(id)) {
        throw new InputError('INVALID_ID');
      }
      assertQuantity(quantity);
      const product = await repository.findById(id);
      if (product === null) throw new NotFoundError('Product not found');
      if (!product || product.id !== id) throw new TypeError('Invalid adapter result');
      return quoteLine(product.unitPriceCents, quantity);
    }
  };
}
module.exports = { createQuoteService, NotFoundError };
```

<span class="notes-section-label">**`catalog.js`**</span>

```js
// file: catalog.js
const { readFile } = require('node:fs/promises');
function createFileCatalog(file) {
  return {
    async findById(id) {
      const rows = JSON.parse(await readFile(file, 'utf8'));
      if (!Array.isArray(rows) || rows.some(row => !row ||
          typeof row.id !== 'string' || !/^[a-z0-9-]{1,32}$/.test(row.id) ||
          !Number.isSafeInteger(row.unitPriceCents) || row.unitPriceCents < 1 ||
          row.unitPriceCents > 1_000_000) ||
          new Set(rows.map(row => row.id)).size !== rows.length) {
        throw new TypeError('Invalid catalog');
      }
      const row = rows.find(row => row.id === id);
      return row ? { id: row.id, unitPriceCents: row.unitPriceCents } : null;
    }
  };
}
module.exports = { createFileCatalog };
```

<span class="notes-section-label">**`integration.test.js`**</span>

```js
// file: integration.test.js
const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { createFileCatalog } = require('./catalog');
const { createQuoteService, NotFoundError } = require('./service');
let directory, file, service;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'quote-integration-'));
  file = join(directory, 'catalog.json');
  await writeFile(file, JSON.stringify([{ id: 'p1', unitPriceCents: 500 }]));
  service = createQuoteService(createFileCatalog(file));
});
afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});
test('quotes through the real service and file catalog', async () => {
  await expect(service.quote('p1', 2)).resolves.toEqual({
    subtotalCents: 1000, shippingCents: 500, totalCents: 1500
  });
});
test('distinguishes a missing product from a missing catalog file', async () => {
  await expect(service.quote('missing', 1)).rejects.toBeInstanceOf(NotFoundError);
  await rm(file);
  await expect(service.quote('p1', 1)).rejects.toMatchObject({ code: 'ENOENT' });
});
test('does not turn malformed catalog JSON into an empty result', async () => {
  await writeFile(file, '{');
  await expect(service.quote('p1', 1)).rejects.toBeInstanceOf(SyntaxError);
});
test('rejects duplicate catalog identities', async () => {
  await writeFile(file, JSON.stringify([
    { id: 'p1', unitPriceCents: 500 }, { id: 'p1', unitPriceCents: 600 }
  ]));
  await expect(service.quote('p1', 1)).rejects.toBeInstanceOf(TypeError);
});
test('invalid input never calls the repository; dependency failure is preserved', async () => {
  const failure = new Error('fixture dependency failure');
  const repository = { findById: jest.fn().mockRejectedValue(failure) };
  const isolated = createQuoteService(repository);
  await expect(isolated.quote('p1', 0)).rejects.toMatchObject({ code: 'INVALID_QUANTITY' });
  expect(repository.findById).not.toHaveBeenCalled();
  await expect(isolated.quote('p1', 1)).rejects.toBe(failure);
});
```

Run `npm test -- --runInBand integration.test.js`. The last test intentionally narrows to a service unit boundary; putting it in this file does not make its stub a real integration.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**An integration test verifies a declared set of real collaborators**. **Create isolated configuration/state**, seed representative data, exercise the real interaction and assert both results and important effects. **Await setup and cleanup even after failure**. **Replace only collaborators outside the boundary** whose real behavior you are claiming to test.

</div>

<span class="notes-section-label">**Isolation decisions**</span>

Unique temporary directories avoid collisions between test workers. Fresh files prevent order dependence. The catalog path is supplied by the fixture owner; a product ID is never used to construct a filesystem path. The tiny whole-file read is deliberate, not a memory-bounded arbitrary-file loader.

For a relational repository, the equivalent test needs a real scratch database and actual migrations, queries, constraints and transactions. An in-memory fake cannot demonstrate PostgreSQL SQLSTATE or isolation behavior. Options include a fresh schema/database per worker, carefully coordinated transaction rollback, or targeted unique data cleanup. An outer test transaction cannot roll back writes made on unrelated connections or processes.

Use `beforeAll` for genuinely shared immutable infrastructure and `beforeEach` for mutable state; await/return hooks. Diagnose leaked resources instead of adding `--forceExit`. `--runInBand` is useful for constrained infrastructure but does not repair shared-state correctness.

<span class="notes-section-label">**Common mistakes**</span>

- Mocking away the adapter interaction that defines the test's purpose.
- Calling a missing data source an empty result.
- Sharing one mutable filename or database row across parallel workers.
- Cleaning up only on the success path.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does this verify PostgreSQL?**</span> No. It verifies the stated filesystem boundary. Real database acceptance belongs to the actual adapter and the transaction labs.
2. <span class="notes-section-label">**Can one test use an external stub?**</span> Yes, if that dependency is explicitly outside the integration boundary.
3. <span class="notes-section-label">**Why assert dependency failure identity?**</span> It detects silent suppression or an unintended translation; public HTTP translation remains a separate boundary.

::: tip Key takeaway
State what is real, isolate its data, and verify the interaction you would otherwise risk mocking away.
:::

Practice — learner work still required: introduce a catalog-format mismatch and observe the integration fail. Acceptance: fresh fixtures pass independently, malformed/missing data remains a failure, and no directory survives cleanup. Repeat the equivalent contract against your actual database adapter before claiming database integration coverage.

Official references: [Jest lifecycle hooks](https://jestjs.io/docs/30.0/setup-teardown), [Node filesystem APIs](https://nodejs.org/download/release/v24.18.0/docs/api/fs.html), [node-postgres transaction ownership](https://node-postgres.com/features/transactions).


---

### What should a backend end-to-end test exercise and clean up? {#t15-q04}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — follow the complete local request**</span>

This lab's E2E boundary is a separate Node process, real HTTP, Express parsing/routing, service/pricing and the real file catalog. It does not include a browser, PostgreSQL, authentication or a production proxy. Naming that boundary prevents a local pass from becoming a broader readiness claim.

First add the application used by this and later tests.

<span class="notes-section-label">**`app.js`**</span>

```js
// file: app.js
const express = require('express');
const { InputError } = require('./pricing');
const { NotFoundError } = require('./service');
function createApp(service, { maxActive = 8 } = {}) {
  if (typeof service?.quote !== 'function' || !Number.isInteger(maxActive) ||
      maxActive < 1 || maxActive > 64) throw new TypeError('Invalid app configuration');
  const app = express();
  let active = 0;
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1kb', inflate: false }));
  app.post('/quotes', async (req, res) => {
    if (!req.is('application/json')) {
      res.status(415).json({ error: { code: 'JSON_REQUIRED' } });
      return;
    }
    if (active >= maxActive) {
      res.status(503).json({ error: { code: 'BUSY' } });
      return;
    }
    active++;
    try {
      if (!req.body || Array.isArray(req.body) ||
          Object.keys(req.body).some(key => !['id', 'quantity'].includes(key))) {
        throw new InputError('INVALID_BODY');
      }
      res.json(await service.quote(req.body.id, req.body.quantity));
    } finally {
      active--;
    }
  });
  app.use((_req, res) => res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND' } }));
  app.use((error, _req, res, next) => {
    if (res.headersSent) { next(error); return; }
    if (error instanceof InputError) {
      res.status(400).json({ error: { code: error.code } });
    } else if (error instanceof NotFoundError) {
      res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND' } });
    } else if (error?.type === 'entity.parse.failed' && error.status === 400) {
      res.status(400).json({ error: { code: 'MALFORMED_JSON' } });
    } else if (error?.type === 'entity.too.large' && error.status === 413) {
      res.status(413).json({ error: { code: 'BODY_TOO_LARGE' } });
    } else if (['encoding.unsupported', 'charset.unsupported'].includes(error?.type) &&
        error.status === 415) {
      res.status(415).json({ error: { code: 'UNSUPPORTED_REPRESENTATION' } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR' } });
    }
  });
  return app;
}
module.exports = { createApp };
```

The quote admission limit counts handlers until their service promise settles, including after a disconnected client. It is not a bound on connections, parser allocations or all application resources. The rejection response has no waiting queue. This small local API omits production authentication and an operational logger.

`server.js` — an executable owner, not imported by unit tests:

```js
// file: server.js
const { createServer } = require('node:http');
const { createApp } = require('./app');
const { createQuoteService } = require('./service');
const { createFileCatalog } = require('./catalog');
const portText = process.env.PORT ?? '0';
if (!/^[0-9]{1,5}$/.test(portText) || Number(portText) > 65535 ||
    !process.env.CATALOG_FILE) throw new Error('Invalid lab configuration');
const app = createApp(createQuoteService(createFileCatalog(process.env.CATALOG_FILE)));
const server = createServer(app);
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => {
    process.exitCode = 1;
    server.closeAllConnections();
  }, 2000);
  server.close(error => {
    clearTimeout(deadline);
    process.removeListener('SIGTERM', stop);
    process.removeListener('SIGINT', stop);
    if (error) process.exitCode = 1;
  });
}
server.once('error', () => { console.error('START_FAILED'); process.exitCode = 1; });
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
server.listen(Number(portText), '127.0.0.1', () => {
  console.log(JSON.stringify({ port: server.address().port }));
});
```

Port0 is explicitly allowed for this scratch-service fixture. Its readiness message proves listening, not catalog availability; reads are lazy. Production readiness and allowed port/configuration policy need their own definition.

<span class="notes-section-label">**`e2e.test.js`**</span>

```js
// file: e2e.test.js
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
async function startService(file) {
  const child = spawn(process.execPath, [join(__dirname, 'server.js')], {
    env: { ...process.env, PORT: '0', CATALOG_FILE: file },
    stdio: ['ignore', 'pipe', 'ignore']
  });
  const exited = once(child, 'exit');
  exited.catch(() => {}); // Observe early spawn failure; original is still awaited below.
  async function close() {
    const timer = setTimeout(() => child.kill('SIGKILL'), 2500);
    try {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
      const [code, signal] = await exited;
      if (code !== 0 || signal !== null) throw new Error('Service did not stop cleanly');
    } finally { clearTimeout(timer); }
  }
  let startupTimer;
  try {
    const port = await new Promise((resolve, reject) => {
      let text = '';
      startupTimer = setTimeout(() => reject(new Error('Startup deadline')), 2000);
      child.once('error', reject);
      child.once('exit', () => reject(new Error('Service exited before readiness')));
      child.stdout.on('data', chunk => {
        text += chunk;
        if (!text.includes('\n')) return;
        try {
          const value = JSON.parse(text.split('\n')[0]);
          if (!Number.isInteger(value.port) || value.port < 1 || value.port > 65535) {
            throw new Error('Invalid readiness address');
          }
          resolve(value.port);
        } catch (error) { reject(error); }
      });
    });
    return { base: `http://127.0.0.1:${port}`, close };
  } catch (error) {
    await close().catch(() => {});
    throw error;
  } finally { clearTimeout(startupTimer); }
}
test('quotes through the separately running service and real catalog', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'quote-e2e-'));
  let service;
  try {
    const file = join(directory, 'catalog.json');
    await writeFile(file, JSON.stringify([{ id: 'p1', unitPriceCents: 500 }]));
    service = await startService(file);
    const response = await fetch(service.base + '/quotes', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'p1', quantity: 2 }), signal: AbortSignal.timeout(1500)
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/application\/json/);
    expect(await response.json()).toEqual({
      subtotalCents: 1000, shippingCents: 500, totalCents: 1500
    });
  } finally {
    try { if (service) await service.close(); }
    finally { await rm(directory, { recursive: true, force: true }); }
  }
}, 10000);
```

Run `npm test -- --runInBand e2e.test.js` in an environment allowing owned loopback listeners and child processes. The test awaits readiness, sends a real request, checks status/media/body, stops the child and removes its catalog even after assertion failure.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

An E2E test follows a critical behavior through the system's external boundary, **using its real composition and controlled infrastructure**. Cover a few high-value journeys and failure paths; use smaller tests for detailed partitions. **Own startup readiness, bounded waits, clean data, clients and teardown**. **A test using a repository stub must not claim real persistence coverage**.

</div>

<span class="notes-section-label">**Trade-offs and diagnosis**</span>

Broad tests detect wiring and deployment mistakes but usually fail less precisely and cost more to run. Start diagnosis from the failing layer: readiness, connect, HTTP status, body contract or business result. Keep enough redacted child diagnostics to investigate a real CI failure; this tiny known fixture discards stderr and reports fixed startup/exit errors.

Do not rely on a fixed “wait two seconds” sleep: the timeout above limits a readiness event, not an assumed startup duration. A forced kill is **a cleanup escalation and should fail the test**, not count as normal shutdown. Failed spawn/early exit must also settle the owner.

Common mistakes: calling a mock-backed route “full production E2E”; checking only status; leaving a child alive after a failed assertion; using a public provider as ordinary CI infrastructure.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Is Supertest automatically E2E?**</span> No. The real/replaced boundary determines the claim, not the library.
2. <span class="notes-section-label">**Does this cover a browser or ingress?**</span> No. Those are additional deployment/client boundaries.
3. <span class="notes-section-label">**Can every business permutation be E2E?**</span> It can, but costs and diagnostic ambiguity grow. Put permutations at the lowest useful level.

::: tip Key takeaway
A critical external journey needs real composition and reliable lifecycle ownership, with its infrastructure limits stated.
:::

Practice — learner work still required: change the child service's response field and observe the E2E failure. Acceptance: identify the broken boundary and demonstrate that the failed test still stops the process/removes its data. Add a real deployment-path smoke test separately before claiming proxy or browser coverage.

Official references: [Jest async completion](https://jestjs.io/docs/30.0/asynchronous), [Node child lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html), [Node HTTP server lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/http.html).


---

### How do TDD and BDD change the way you develop and review behavior? {#t15-q05}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — specify the next feature before coding it**</span>

A customer credit reduces the amount due but cannot make it negative. Given a 1,500-cent total and 2,000 cents of credit, the amount due must be zero. Write that observable expectation before choosing an implementation.

<span class="notes-section-label">**`credit.test.js`**</span>

```js
// file: credit.test.js
const { applyCredit } = require('./credit');

describe('Given a 1500-cent total', () => {
  test.each([
    [500, 1000], [2000, 0], [0, 1500]
  ])('when credit is %i, then amount due is %i', (credit, expected) => {
    expect(applyCredit(1500, credit)).toBe(expected);
  });
});
test.each([[-1, 0], [1500, -1], ['1500', 500], [1500, 0.5]])(
  'rejects invalid money values %p %p', (total, credit) => {
    expect(() => applyCredit(total, credit)).toThrow(TypeError);
  }
);
```

For the first red run, temporarily create this skeleton in `credit.js`:

```js
module.exports = {
  applyCredit() { throw new Error('Not implemented'); }
};
```

Run `npm test -- --runInBand credit.test.js`. The scenario must fail because the feature is unimplemented, not because the runner cannot find a module or test. Then replace the skeleton with the green implementation:

<span class="notes-section-label">**`credit.js`**</span>

```js
// file: credit.js
function applyCredit(totalCents, creditCents) {
  if (![totalCents, creditCents].every(value => Number.isSafeInteger(value) && value >= 0)) {
    throw new TypeError('Money must be nonnegative integer cents');
  }
  return Math.max(0, totalCents - creditCents);
}
module.exports = { applyCredit };
```

Re-run the same tests. Refactor the implementation or naming while keeping the behavior and tests green. This helper is a separate credit-rule example; it does not silently change the quote API's contract.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

TDD develops behavior through red → green → refactor: **observe a meaningful failing test**, implement enough to satisfy it, then **improve the design while preserving evidence**. **BDD uses concrete behavior examples and shared language** to clarify requirements, often Given/When/Then. BDD is not a synonym for installing Cucumber, and **TDD is not satisfied by writing tests after a finished implementation**.

</div>

<span class="notes-section-label">**Reason about the feedback**</span>

The over-credit example disambiguates an important rule. A negative amount, a thrown business error and a zero amount are different product decisions. Agree on the intended behavior with stakeholders; tests cannot choose it for you.

Keep examples readable and technology-independent where possible. “Given a total and available credit, when credit is applied, then the amount due is zero” explains behavior; “Given mock number three was called” usually explains implementation plumbing. Jest can execute behavior-named cases without a Gherkin framework. Cucumber becomes useful when its collaboration/workflow benefits justify maintaining step definitions and fixtures.

For a real feature, evolve a few tests and implementation together rather than create a vast up-front suite. Refactoring needs a green baseline; changing expected outcomes during a refactor is a requirement change, not merely cleanup. Keep lower-level boundary cases alongside a small number of shared acceptance examples.

Common mistakes: counting import/setup failures as the intended red; asserting the internal algorithm; adding a Gherkin layer without shared product examples; skipping the refactor step; treating a green example as complete feature acceptance.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can BDD be used without TDD?**</span> Yes. Behavior discovery and test-first implementation are related but distinct practices.
2. <span class="notes-section-label">**Why observe the red test?**</span> It confirms the test can detect the missing or wrong behavior rather than pass vacuously.
3. <span class="notes-section-label">**Does the snippet prove you followed TDD?**</span> No. You need your own red/green/refactor evidence; seeing a finished test and implementation is study material.

::: tip Key takeaway
Specify behavior with examples, verify the intended failure, then implement and refactor under that evidence.
:::

Practice — learner work still required: perform the skeleton → implementation → refactor sequence yourself. Acceptance: retain the intended failing run and green run, add an uncovered boundary, and explain the rule without referring to mocks or private functions.

Official references: [Jest behavior grouping](https://jestjs.io/docs/30.0/api#describename-fn), [Cucumber BDD](https://cucumber.io/docs/bdd/), [Gherkin examples](https://cucumber.io/docs/gherkin/reference/).


---

### How do load and stress tests reveal behavior that functional tests miss? {#t15-q06}

*Study depth: introductory operations with an executable local lab*

<span class="notes-section-label">**Example — define success before increasing traffic**</span>

The quote API admits at most two concurrent quote handlers in this lab. What happens when four clients each send requests sequentially? Measure valid successes and explicit busy responses; a fast503 is not a fast successful quote.

`load-lab.js` — no public target, at most eight clients and twenty requests per client:

```js
// file: load-lab.js
const { performance } = require('node:perf_hooks');
const { createServer } = require('node:http');
const { once } = require('node:events');
const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { createApp } = require('./app');
const { createQuoteService } = require('./service');
const { createFileCatalog } = require('./catalog');
const { readQuote } = require('./quote-contract');
async function sampleLoad(base, clients, perClient = 5) {
  const url = new URL(base);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' ||
      url.username || url.password || !Number.isInteger(clients) || clients < 1 ||
      clients > 8 || !Number.isInteger(perClient) || perClient < 1 || perClient > 20) {
    throw new TypeError('Expected owned loopback address and small load bounds');
  }
  const signal = AbortSignal.timeout(4000);
  const counts = { attempts: 0, ok: 0, busy: 0, transportErrors: 0, invalidResponses: 0 };
  const successes = [];
  const started = performance.now();
  await Promise.all(Array.from({ length: clients }, async () => {
    for (let n = 0; n < perClient && !signal.aborted; n++) {
      counts.attempts++;
      const before = performance.now();
      let response;
      try {
        response = await fetch(base + '/quotes', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: 'p1', quantity: 2 }), signal
        });
      } catch { counts.transportErrors++; continue; }
      try {
        const body = await response.json();
        if (!response.headers.get('content-type')?.includes('application/json')) {
          throw new Error('Unexpected media type');
        }
        if (response.status === 200) {
          readQuote(body);
          if (body.totalCents !== 1500) throw new Error('Wrong business result');
          counts.ok++;
          successes.push(performance.now() - before);
        } else if (response.status === 503 && body.error?.code === 'BUSY') {
          counts.busy++;
        } else { counts.invalidResponses++; }
      } catch { counts.invalidResponses++; }
    }
  }));
  const wallMs = performance.now() - started;
  successes.sort((a, b) => a - b);
  return { clients, ...counts, wallMs, successRps: counts.ok / (wallMs / 1000),
    p95SuccessMs: successes.length ? successes[Math.ceil(successes.length * 0.95) - 1] : null };
}
async function runOwnedLab() {
  const directory = await mkdtemp(join(tmpdir(), 'quote-load-'));
  let server;
  try {
    const file = join(directory, 'catalog.json');
    await writeFile(file, JSON.stringify([{ id: 'p1', unitPriceCents: 500 }]));
    const service = createQuoteService(createFileCatalog(file));
    server = createServer(createApp(service, { maxActive: 2 }));
    const listening = once(server, 'listening');
    server.listen(0, '127.0.0.1');
    await listening;
    const base = `http://127.0.0.1:${server.address().port}`;
    const samples = [];
    for (const clients of [1, 2, 4, 8]) samples.push(await sampleLoad(base, clients));
    return samples;
  } finally {
    try {
      if (server?.listening) await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
    } finally { await rm(directory, { recursive: true, force: true }); }
  }
}
module.exports = { sampleLoad, runOwnedLab };
if (require.main === module) {
  runOwnedLab().then(samples => console.log(JSON.stringify(samples, null, 2)))
    .catch(() => { console.error('LOAD_LAB_FAILED'); process.exitCode = 1; });
}
```

Run `node load-lab.js`. Inspect every counter. The ramp is deliberately tiny and finite; scheduler/cache effects mean there is no promised throughput, latency or exact count of503 responses. A later controlled gate test verifies overload rejection independently of timing.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Load testing asks whether the system meets its contract under expected traffic**. **Stress testing investigates behavior beyond normal load or a resource limit**: rejection, queuing, errors and recovery matter as well as speed. Define workload, duration, resource bounds, **success criteria and a stop condition before generating traffic**. Start small on owned infrastructure.

| Test shape | Main question |
|---|---|
| Smoke | Does the test and service work with minimal traffic? |
| Expected load | Can representative traffic meet its latency/error goals? |
| Stress/breakpoint | How does saturation appear and how is excess work handled? |
| Spike | How does a sudden increase affect admission and recovery? |
| Soak | Do resources leak or degrade over a sustained period? |

This script is a smoke plus bounded local ramp, not a full soak, production capacity study or destructive stress campaign. Realistic data volume, request mix, dependencies, instance counts and the deployment path change the result. Tools such as k6 can express arrival-rate models, thresholds and longer controlled scenarios; mastering every load tool is not required here.

</div>

<span class="notes-section-label">**Interpret the results carefully**</span>

The script reports successful latency separately from503, malformed response and transport outcomes. Include all outcomes when deciding whether the service met its goal. A small sample's p95 is only a descriptive observation, not strong tail-latency evidence.

This is a closed-loop workload: a client waits before starting its next request. **When the server slows, offered traffic decreases**. An open arrival-rate model can expose overload that this feedback conceals; record planned arrivals and dropped/delayed work rather than silently measuring only requests that were sent. The client and server sharing one laptop also compete for resources.

Observe CPU, memory, event-loop delay, database/pool waits, queue depth and error rate alongside latency and successful throughput. “Busy” is an intentional admission decision; unbounded queues, rising memory or failure to recover are different concerns. After overload, **reduce traffic and check that normal work resumes**.

Common mistakes: measuring only average latency; counting errors as throughput success; creating an unbounded `Promise.all`; targeting a shared/public system accidentally; claiming capacity from one laptop sample; applying fake timers to a real network load test.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why bound both clients and request count?**</span> Concurrency and total work are independent budgets; each can cause uncontrolled resource use.
2. <span class="notes-section-label">**Can a fast error hide a slow service?**</span> Yes. Split successes, overload rejections and failures instead of combining them into an attractive average.
3. <span class="notes-section-label">**What does the four-second signal guarantee here?**</span> It cancels the fixture's fetch/body waits and stops further client iterations. It cannot preempt blocked JavaScript or cancel arbitrary server work automatically.

::: tip Key takeaway
A workload is useful only with defined outcomes, finite budgets, resource observations and an honest deployment boundary.
:::

Practice — learner work still required: run the bounded ramp, record configuration/raw counters, and explain why the graph changes. Acceptance: account for every attempt, identify overload separately from valid quotes, reduce traffic and verify recovery. Advanced sustained/spike/arrival-rate implementation is optional enrichment; introductory reasoning remains required.

Official references: [k6 test types](https://grafana.com/docs/k6/latest/testing-guides/test-types/), [open versus closed workload models](https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/), [Node measurements](https://nodejs.org/download/release/v24.18.0/docs/api/perf_hooks.html).


---

### How do you measure performance without turning timing noise into a flaky test? {#t15-q07}

*Study depth: introductory performance reasoning and measurement*

<span class="notes-section-label">**Example — define what a measurement can prove**</span>

You want to compare a pricing refactor. A single run is faster by a fraction of a millisecond. Is the refactor faster, did JIT warm-up differ, or did another process/GC affect the sample? First verify equal results and repeat a controlled workload.

<span class="notes-section-label">**`benchmark.js`**</span>

```js
// file: benchmark.js
const { performance } = require('node:perf_hooks');
const { quoteLine } = require('./pricing');
function runBenchmark(iterations = 20000, sampleCount = 7) {
  if (!Number.isInteger(iterations) || iterations < 1000 || iterations > 200000 ||
      iterations % 10 !== 0 || !Number.isInteger(sampleCount) ||
      sampleCount < 3 || sampleCount > 15) throw new TypeError('Invalid benchmark bounds');
  for (let n = 0; n < 1000; n++) quoteLine(500, n % 10 + 1);
  const cpuBefore = process.cpuUsage();
  const heapBefore = process.memoryUsage().heapUsed;
  const durationsMs = [];
  let checksum = 0;
  for (let sample = 0; sample < sampleCount; sample++) {
    checksum = 0;
    const before = performance.now();
    for (let n = 0; n < iterations; n++) checksum += quoteLine(500, n % 10 + 1).totalCents;
    durationsMs.push(performance.now() - before);
    // Ten independently specified quote totals sum to32000 cents.
    if (checksum !== iterations / 10 * 32000) throw new Error('Wrong benchmark result');
  }
  const cpu = process.cpuUsage(cpuBefore);
  const heapDeltaBytes = process.memoryUsage().heapUsed - heapBefore;
  const sorted = [...durationsMs].sort((a, b) => a - b);
  return { iterations, sampleCount, checksum, durationsMs,
    medianMs: sorted[Math.floor(sorted.length / 2)],
    cpuUserMicros: cpu.user, cpuSystemMicros: cpu.system, heapDeltaBytes };
}
module.exports = { runBenchmark };
if (require.main === module) console.log(JSON.stringify(runBenchmark(), null, 2));
```

Run `node benchmark.js`. Inspect the raw sample distribution as well as the median. The checksum makes the workload's returned behavior observable; a “faster” implementation returning incorrect prices is not an optimization.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Define a representative workload and performance goal, **verify correctness**, control important inputs/environment, warm up where appropriate and collect repeated observations. Separate wall latency, CPU, memory, event-loop responsiveness and throughput. **Compare equivalent builds and report variation/limitations**. **A microbenchmark cannot establish end-to-end service capacity**, and **a hard-coded laptop timing threshold often creates a flaky CI gate**.

</div>

<span class="notes-section-label">**Different questions need different experiments**</span>

| Question | Evidence to collect |
|---|---|
| Did a pure calculation slow down? | Repeated equivalent workloads and a CPU profile if needed |
| Does a request meet its latency goal? | End-to-end successful latency distribution, error rate and traffic model |
| Is memory leaking? | Sustained workload, post-GC/retained-state trends and targeted heap evidence |
| Is the loop blocked? | Scheduling delay/CPU evidence under a controlled observation window |
| Is the database the bottleneck? | Query/pool waits, plans, locks and server-side evidence |

`performance.now()` measures elapsed monotonic time in milliseconds. CPU usage is reported here in microseconds, not wall time or a ready-made utilization percentage. Heap deltas include allocation/collection effects and may be negative; one delta does not prove a leak or its absence. The benchmark's warm-up and sample counts are teaching choices, not statistical guarantees.

For the service, use the earlier load experiment and [event-loop diagnosis](./06-events-and-event-loop.md#t06-q07). Do not enable a delay monitor, block immediately and disable it before it samples, then interpret an empty histogram as a responsive loop.

<span class="notes-section-label">**Making a useful regression gate**</span>

Establish a stable baseline on comparable infrastructure, run repeated trials and choose tolerances justified by risk and measurement noise. Keep raw observations and configuration. When variation is similar to the claimed improvement, gather stronger evidence instead of declaring a win.

Use a functional suite to protect outcomes and a dedicated performance job for an agreed budget. For example, a latency SLO must specify workload, percentile, allowed errors and test environment—not merely “responds in under100ms.” Gate only when the experiment can reliably detect a meaningful regression. Keep startup, I/O and representative data sizes in the experiment when they are part of the user-visible cost.

Profiles attribute where resources are spent; measurements show whether the result improved. Inspect an unexpected slow sample, check algorithm/data-size changes and compare equivalent optimizations. Do not remove validation, correctness checks or representative work just to improve benchmark numbers.

Common mistakes: benchmarking a different result; comparing cold and warm runs; using one average; treating heap growth between two points as a leak; replacing an integration workload with a tight loop; requiring every CI runner to match a developer laptop.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does this microbenchmark measure HTTP throughput?**</span> No. It measures the stated in-process calculation workload.
2. <span class="notes-section-label">**Why retain raw samples?**</span> They expose variance and outliers hidden by one summary value and support reproducibility.
3. <span class="notes-section-label">**Can a slower local function improve service latency?**</span> Potentially, if it reduces I/O, contention or allocations elsewhere. Measure the actual system outcome.

::: tip Key takeaway
Correctness first; match the experiment to the question and report variability instead of presenting one timing as proof.
:::

Practice — learner work still required: compare equivalent implementations in repeated controlled runs, retaining raw samples and checksums. Acceptance: explain units, variation, scope and a justified regression budget; reject a faster incorrect implementation. Advanced CPU/heap profiling and long-running performance engineering remain optional enrichment here.

Official references: [Node performance hooks](https://nodejs.org/download/release/v24.18.0/docs/api/perf_hooks.html), [CPU/memory measurements](https://nodejs.org/download/release/v24.18.0/docs/api/process.html), [Node profiling](https://nodejs.org/en/learn/getting-started/profiling).


---

### How do you test an Express application without mocking away its framework behavior? {#t15-q08}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — keep the right parts real**</span>

A mock `res.json()` can prove your handler called a function but cannot prove real routing, parser limits, status/media headers or Express5 rejection forwarding. Use the real app through HTTP for those boundaries. Inject a controlled service only when the test intentionally isolates HTTP behavior; use the real service/catalog for provider verification.

<span class="notes-section-label">**`framework.test.js`**</span>

```js
// file: framework.test.js
const request = require('supertest');
const { createServer } = require('node:http');
const { EventEmitter, once } = require('node:events');
const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { createApp } = require('./app');
const { createQuoteService } = require('./service');
const { createFileCatalog } = require('./catalog');
const { readQuote } = require('./quote-contract');
const quote = { subtotalCents: 1000, shippingCents: 500, totalCents: 1500 };
const input = { id: 'p1', quantity: 2 };
let directory, file;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'quote-framework-'));
  file = join(directory, 'catalog.json');
  await writeFile(file, JSON.stringify([
    { id: 'p1', unitPriceCents: 500, internalNote: 'PRIVATE_SENTINEL' }
  ]));
});
afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});
function realApp() { return createApp(createQuoteService(createFileCatalog(file))); }
async function withApp(app, exercise) {
  const server = createServer(app);
  try {
    const listening = once(server, 'listening');
    server.listen(0, '127.0.0.1');
    await listening;
    const client = request(server);
    return await exercise({
      get: path => client.get(path).timeout({ response: 1500, deadline: 2500 }),
      post: path => client.post(path).timeout({ response: 1500, deadline: 2500 })
    });
  } finally {
    if (server.listening) await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
      server.closeAllConnections();
    });
  }
}
test('real provider satisfies the consumer contract without private fields', async () => {
  await withApp(realApp(), async client => {
    const response = await client.post('/quotes').send(input)
      .expect('Content-Type', /json/).expect(200);
    expect(readQuote(response.body)).toEqual(quote);
    expect(response.body).toEqual(quote);
    expect(JSON.stringify(response.body)).not.toContain('PRIVATE_SENTINEL');
  });
});
test('rejects extra input fields before invoking the service', async () => {
  const service = { quote: jest.fn().mockResolvedValue(quote) };
  await withApp(createApp(service), async client => {
    const response = await client.post('/quotes').send({ ...input, role: 'admin' }).expect(400);
    expect(response.body.error.code).toBe('INVALID_BODY');
    expect(service.quote).not.toHaveBeenCalled();
  });
});
test('real parser rejects malformed JSON', async () => {
  await withApp(realApp(), async client => {
    const response = await client.post('/quotes').set('Content-Type', 'application/json')
      .send('{').expect(400);
    expect(response.body).toEqual({ error: { code: 'MALFORMED_JSON' } });
  });
});
test('real parser enforces the byte limit before route validation', async () => {
  await withApp(realApp(), async client => {
    const response = await client.post('/quotes').send({ ...input, extra: 'x'.repeat(1500) })
      .expect(413);
    expect(response.body.error.code).toBe('BODY_TOO_LARGE');
  });
});
test('media, missing product, invalid quantity and unknown route keep distinct responses', async () => {
  await withApp(realApp(), async client => {
    await client.post('/quotes').type('text').send('text').expect(415);
    const missing = await client.post('/quotes').send({ id: 'missing', quantity: 1 }).expect(404);
    expect(missing.body.error.code).toBe('PRODUCT_NOT_FOUND');
    const invalid = await client.post('/quotes').send({ ...input, quantity: 0 }).expect(400);
    expect(invalid.body.error.code).toBe('INVALID_QUANTITY');
    const route = await client.get('/missing').expect(404);
    expect(route.body.error.code).toBe('ROUTE_NOT_FOUND');
  });
});
test('rejected service work produces a safe500 and releases admission for the next call', async () => {
  const service = { quote: jest.fn().mockRejectedValueOnce(new Error('PRIVATE_SENTINEL'))
    .mockResolvedValue(quote) };
  await withApp(createApp(service, { maxActive: 1 }), async client => {
    const failed = await client.post('/quotes').send(input).expect(500);
    expect(failed.body).toEqual({ error: { code: 'INTERNAL_ERROR' } });
    expect(JSON.stringify(failed.body)).not.toContain('PRIVATE_SENTINEL');
    await client.post('/quotes').send(input).expect(200);
  });
});
test('rejects overload while work is held and recovers when that work settles', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const events = new EventEmitter();
  const service = { quote: jest.fn(async () => {
    events.emit('entered');
    await gate;
    return quote;
  }) };
  await withApp(createApp(service, { maxActive: 1 }), async client => {
    const entered = once(events, 'entered', { signal: AbortSignal.timeout(1500) });
    const pending = client.post('/quotes').send(input).then(response => response);
    pending.catch(() => {});
    try {
      await entered;
      const rejected = await client.post('/quotes').send(input).expect(503);
      expect(rejected.body).toEqual({ error: { code: 'BUSY' } });
      expect(service.quote).toHaveBeenCalledTimes(1);
      release();
      expect((await pending).status).toBe(200);
      await client.post('/quotes').send(input).expect(200);
      expect(service.quote).toHaveBeenCalledTimes(2);
    } finally {
      release();
      await Promise.allSettled([pending]);
    }
  });
});
```

Run `npm test -- --runInBand framework.test.js`. Each HTTP request has a response/overall deadline; a Jest test timeout alone would not cancel a pending request. The overload test waits for a service-entry event, not an arbitrary sleep. It always releases its gate and observes the pending request, so an assertion failure does not intentionally leave held work behind. The recovery call proves that the admission count returns to its usable state.

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Test framework behavior through a real request pipeline**. Assert status, headers, public body and meaningful side effects; **use application/service doubles only at declared boundaries**. Export the app separately from listening, create isolated fixtures, **await every request and close owned servers**. **Keep a smaller real-composition suite to detect wiring and provider-contract drift**.

</div>

<span class="notes-section-label">**Choose the test boundary deliberately**</span>

The real-provider test verifies the consumer reader against the actual HTTP representation and checks exact safe public fields. The injected rejection test isolates Express promise forwarding and the public error boundary; it is not a database outage test. The gate is a deterministic scheduling device, not a simulated throughput benchmark.

For a NestJS or another framework, use its supported composition/testing utilities and replace declared providers deliberately. A compiled testing module with every adapter mocked still does not prove the real database or HTTP deployment. Keep one coherent primary framework here; alternatives are not separate mastery requirements.

<span class="notes-section-label">**Coverage and required project checks**</span>

In this scratch lab, add `jest.config.cjs` to describe which application/consumer sources coverage should include:

```js
// file: jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'pricing.js', 'service.js', 'catalog.js', 'app.js', 'credit.js', 'quote-contract.js'
  ]
};
```

Startup glue, the benchmark and load driver are deliberately outside this listed-source report; they have separate executable checks. Do not present the resulting percentage as coverage of every file or every deployed process. Child-process execution is not automatically instrumented by the parent's Jest report.

```bash
npm test -- --runInBand
npm pkg set 'scripts.coverage=jest --coverage --coverageReporters=cobertura --coverageDirectory=.'
npm run coverage -- --runInBand
```

Coverage maps statements, branches, functions and lines that executed. Inspect uncovered branches and decide which risks need more evidence. **A percentage does not prove assertions are strong**; the earlier threshold mutation and actual contract-breaking mutation are more direct evidence that particular defects can be caught. Avoid automatic snapshot updates, blanket exclusions or arbitrary universal thresholds.

Autocode: preserve the supplied `test` script, normally `jest`, and all build/test settings. Run `npm run build` and `npm run test` for the actual submission; Module4 additionally requires `npm run coverage`, normally `jest --coverage --coverageReporters=cobertura --coverageDirectory=.`. Never add or modify `src/tests`, fixtures or helpers there, or import it from production. The scratch setup above is not permission to reconfigure an assignment template. This JavaScript lab has no compile/build step; it is not an Autocode submission.

<span class="notes-section-label">**Reliability and debugging**</span>

A false green can come from missing `await`, an assertion that never ran, stale mocks, an unreviewed snapshot or a test that bypasses real validation. Restore spies after replacement; clearing call history does not restore the original method. If testing an owned timer, scope fake timers narrowly, advance the appropriate timers/microtasks and restore real timers. Do not fake the clock around real network tests by default.

When a suite hangs, inspect listeners, child processes, pools, watchers and timers. Use `--detectOpenHandles` as a diagnostic, not `--forceExit` as a fix. If a test fails only in the full suite or parallel execution, investigate shared paths/ports, environment and mock state. Fresh directories and ephemeral ports remove common collisions; tests should still pass alone and together.

Common mistakes: mocking `req`/`res` and claiming full HTTP coverage; accepting status alone; letting injected fakes drift from real contracts; treating failed shutdown as success; using coverage to claim professional readiness.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Does passing an app to Supertest avoid all sockets?**</span> Not generally; it can manage a temporary listener. This lab explicitly binds its owned server to loopback.
2. <span class="notes-section-label">**Why test recovery after rejection?**</span> A leaked admission slot may hide until the next request; the public follow-up reveals that lifecycle defect.
3. <span class="notes-section-label">**Does a safe body prove safe logging?**</span> No. Internal/default logging and public projection are separate policies and need their own evidence.

::: tip Key takeaway
Use the real framework for framework claims, a real composition for integration claims, and an explicit lifecycle owner for every resource.
:::

Practice — learner work still required: run the suite and introduce a provider change that makes the numeric total a string. Acceptance: the actual-provider contract test fails for that break; restoring the contract passes. Exercise overload and recovery, inspect the coverage report without changing its source list, and explain all untested deployment/infrastructure boundaries.

Official references: [Supertest](https://github.com/forwardemail/supertest), [Express error ownership](https://expressjs.com/en/guide/error-handling/), [Jest coverage configuration](https://jestjs.io/docs/30.0/configuration), [Jest timer controls](https://jestjs.io/docs/30.0/timer-mocks).

## Testing revision

Select evidence by the risk, not by a test filename. A unit test checks a focused behavior; a contract verifies a boundary agreement; an integration test joins declared real components; E2E follows a critical external journey. TDD/BDD shape the implementation and collaboration process. Load/stress/performance experiments answer different operational questions, while real framework tests protect parsing, routing and lifecycle behavior.

| Risk | Smallest useful evidence in this chapter |
|---|---|
| Free-shipping boundary changes accidentally | Explicit unit partitions plus a threshold mutation |
| Numeric cents become formatted strings | Consumer reader plus real-provider verification |
| Adapter suppresses missing/malformed data | Real service/file integration |
| Executable composition or listener lifecycle breaks | Separately running child-process E2E |
| A business example was never agreed/tested first | Recorded red/green behavior and Given/When/Then discussion |
| Excess work is accepted or recovery leaks capacity | Controlled admission gate plus bounded load observations |
| A supposed optimization changes outputs or is within noise | Correctness checksum, repeated samples and an honest comparison |
| Parser/error middleware is bypassed by mocks | Real HTTP framework requests and public contract checks |

<span class="notes-section-label">**Learner practice backlog — not completed by the author checks**</span>

- [ ] Reproduce the threshold mutant and explain why that precise test fails.
- [ ] Break and restore the provider contract, preserving the consumer's requirements.
- [ ] Run isolated integration fixtures and the separately running E2E service; account for teardown on a failed assertion.
- [ ] Perform your own red/green/refactor cycle and agree on behavior examples.
- [ ] Run the bounded ramp, account for every outcome, and explain closed-loop limitations.
- [ ] Compare repeated equivalent benchmark runs without inventing a universal timing gate.
- [ ] Exercise parser, error and overload recovery tests; inspect listed-source coverage and choose a missing risk to test.

Advanced Pact deployment gates, real-browser/proxy E2E, database adapters beyond the earlier transaction labs, long soak/spike campaigns and advanced profiling remain explicit extensions, not requirements to master every tool. Their introductory purpose and limitations are covered here.

<span class="notes-section-label">**Mixed practice — answer before opening the explanations**</span>

1. A service unit test uses a fake repository and passes. Which new evidence is needed before claiming a real PostgreSQL unique constraint works?
2. A 503 response is faster than normal quotes. Is the service's useful throughput necessarily improved?
3. Your consumer test passes against a hard-coded fixture. What provider step is missing?
4. An E2E test passes every assertion but the test process never exits. What should you fix?
5. A benchmark's results changed as well as its timing. Can it demonstrate an optimization?
6. A coverage report reaches100% after excluding an unimported adapter. What has this established?

::: details Practice explanations
1. A real controlled PostgreSQL adapter test exercising the actual constraint/concurrency and transaction behavior; the fake cannot establish it.
2. No. Count successful results separately from rejection/errors and measure the stated workload and latency goals.
3. Verify that the actual provider satisfies the recorded consumer agreement; the later HTTP reader test supplies that local evidence.
4. Find and close the owned server, child, pool, timer or other resource. Forcing exit hides the lifecycle defect.
5. No. First establish equivalent correct behavior; then compare repeated measurements and their variation.
6. Only the execution metrics for the listed sources, with that exclusion. It does not establish the omitted adapter's behavior or assertion quality.
:::

## References and validation scope

Official documentation was checked 2026-11-04. Run commands inside the standalone lab, preserve its lockfile and keep the versions/module format explicit. The [testing course](../module-04-testing.md) contains deeper Jest/assertion/timer/CI explanations. The single [progress tracker](./progress.md#testing-completion) records executed author checks, remaining learner tasks and exact continuation.

The examples do not replace an assignment's predefined tests, demonstrate production capacity, or establish your professional readiness. They provide complete study material for the eight listed Testing topics with an executable local boundary and a separate practical backlog.
