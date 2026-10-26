# GraphQL: a bounded catalogue query

GraphQL is a typed query/execution model, not a database or an automatic authorization layer. A schema describes fields, argument types and nullability; a query selects a projection; resolvers obtain the data. REST remains the primary course API. Learn GraphQL as an alternative when clients need evolving nested projections and the team can own query cost, resolver authorization and schema compatibility.

This worked fixture uses **Node24.18.0 and graphql-js17.0.2**, pinned from the official npm registry on2026-10-25. It executes the real GraphQL engine in-process, without introducing an additional web framework or running a hosted API. Consult the [official GraphQL.js route](https://www.graphql-js.org/docs/running-an-express-graphql-server/) before adding an HTTP adapter; do not mix v16/v17 experimental APIs into this small stable schema example.

## Read the contract

`CoursePage!` means the page cannot be null on a successful resolution; `[Course!]!` means the list and its elements are non-null. If a required nested field fails, GraphQL error propagation can null a parent up to a nullable boundary. Choose nullability from the real availability/domain contract rather than adding exclamation marks everywhere. Clients inspect `errors` and `data`; a fulfilled request or an HTTP200 alone is not proof every requested field succeeded.

The fixed named operation below requests IDs/titles/authors plus cursor metadata. Its variables carry data, not query syntax. For this teaching endpoint, a server-owned **persisted-operation allowlist** admits only `catalogue.v1`; clients cannot submit arbitrary aliases, fragments or deep nesting. Combined with `first<=20`, this gives a small known work shape. A general query endpoint additionally needs byte/token/depth/complexity limits, validated variable-dependent list costs and aggregate admission/rate budgets. Depth alone misses wide aliases or expensive fields. See [official complexity controls](https://www.graphql-js.org/docs/operation-complexity-controls/).

## Complete schema and resolver

Create `catalogue.mjs` and `check.mjs` in an owned scratch directory with an explicit ESM manifest and a lockfile containing `graphql@17.0.2`. For example, initialize that new directory, set its package type to module, install the exact package, then run `node check.mjs`. Do not overwrite a course submission template.

```js
import {buildSchema, graphql, GraphQLError} from 'graphql';
export const schema = buildSchema(`
  type Query { courses(first: Int!, after: ID): CoursePage! }
  type CoursePage { nodes: [Course!]!, endCursor: ID, hasNextPage: Boolean! }
  type Course { id: ID!, title: String!, author: Author! }
  type Author { id: ID!, name: String! }
`);
const operations = new Map([['catalogue.v1', `query Catalogue($first: Int!, $after: ID) {
  courses(first: $first, after: $after) { nodes { id title author { id name } } endCursor hasNextPage }
}`]]);
const courses = [
  {id: 'c1', tenant: 'a', title: 'One', authorId: 'u1'},
  {id: 'c2', tenant: 'a', title: 'Two', authorId: 'u1'},
  {id: 'c3', tenant: 'a', title: 'Three', authorId: 'u2'},
  {id: 'b1', tenant: 'b', title: 'B private', authorId: 'u1'}
];
const authors = [
  {id: 'u1', tenant: 'a', name: 'Ada'}, {id: 'u2', tenant: 'a', name: 'Grace'},
  {id: 'u1', tenant: 'b', name: 'B author'}
];
const failure = (message, code) => ({errors: [new GraphQLError(message, {extensions: {code}})]});
export async function executeCatalogue(operationId, variables, viewer) {
  const stats = {authorBatches: 0}; // New request-owned evidence; never a shared tenant cache.
  if (!viewer) return {...failure('Not authenticated', 'UNAUTHENTICATED'), stats};
  const source = operations.get(operationId);
  if (!source) return {...failure('Unknown operation', 'BAD_REQUEST'), stats};
  if (!variables || typeof variables !== 'object' || Array.isArray(variables) ||
      Object.keys(variables).some(key => key !== 'first' && key !== 'after') ||
      (variables.after != null && (typeof variables.after !== 'string' || variables.after.length > 80))) {
    return {...failure('Invalid variables', 'BAD_REQUEST'), stats};
  }
  const rootValue = {courses({first, after}, context) {
    if (!Number.isInteger(first) || first < 1 || first > 20) throw new GraphQLError('Page budget', {extensions: {code: 'BAD_USER_INPUT'}});
    // Authorization scope is applied BEFORE cursor lookup, slicing and related-data loading.
    const visible = courses.filter(row => row.tenant === context.viewer.tenant).sort((a, b) => a.id.localeCompare(b.id, 'en'));
    const index = after == null ? -1 : visible.findIndex(row => row.id === after);
    if (after != null && index < 0) throw new GraphQLError('Invalid cursor', {extensions: {code: 'BAD_USER_INPUT'}});
    const remaining = visible.slice(index + 1), page = remaining.slice(0, first);
    const ids = new Set(page.map(row => row.authorId));
    if (ids.size) context.stats.authorBatches++;
    // One scoped batch (a real adapter uses one parameterized tenant+ID query).
    const batch = new Map(authors.filter(row => row.tenant === context.viewer.tenant && ids.has(row.id)).map(row => [row.id, row]));
    const nodes = page.map(row => {
      const author = batch.get(row.authorId);
      if (!author) throw new GraphQLError('Related data unavailable');
      return {id: row.id, title: row.title, author: {id: author.id, name: author.name}};
    });
    return {nodes, endCursor: nodes.at(-1)?.id ?? null, hasNextPage: remaining.length > first};
  }};
  const result = await graphql({schema, source, variableValues: variables,
    contextValue: {viewer, stats}, rootValue});
  return {...result, stats};
}
```

The authenticated viewer is a **trusted server context**, not query input. The HTTP adapter must validate its session/access token and establish subject/tenant before calling this function. The fixture supplies synthetic viewers directly, so it tests scope isolation rather than token verification. Unknown extra variables cannot smuggle in a tenant override. Scope is applied before cursor lookup, page slicing and author loading, so another tenant's ID is not used to locate an unrestricted cursor or fetch related data.

The raw ID cursor is suitable only for this fixed synthetic in-memory catalogue: ordering is stable here and the data is unchanged. A real endpoint needs the [scoped signed cursor/ordering contract](./cursor-pagination.md), matching database sort/collation/tie-breaker and an explicit live-feed or snapshot policy. An opaque cursor does not grant access. Do not describe this array slice as a database keyset-performance test.

## N+1 and request-owned data loading

A naive `Course.author` resolver fetching once per course makes one course query plus N author queries, often repeating the same author. Here the page resolver collects distinct author IDs and loads one **tenant-scoped batch**, then supplies each nested object to GraphQL's default field resolver. A real repository would execute one parameterized tenant+ID query and preserve missing/error semantics. The fixture's batch counter proves the adapter invocation shape; it is not a measurement of SQL traffic.

DataLoader is another option for independently resolved nested fields: create it per request/principal, batch keys, return results aligned to input keys, and avoid a global cache leaking one tenant's result to another. Authorization still belongs in the domain/repository boundary. The fixture intentionally repeats author IDu1 across tenants and verifies different names. See [official N+1/DataLoader guidance](https://www.graphql-js.org/docs/n1-dataloader/) and [authorization strategies](https://www.graphql-js.org/docs/authorization-strategies/).

## Executed checks

```js
import assert from 'node:assert/strict';import{graphql}from'graphql';import{schema,executeCatalogue}from'./catalogue.mjs';
const a={subject:'alice',tenant:'a'},b={subject:'bob',tenant:'b'};
const first=await executeCatalogue('catalogue.v1',{first:2},a);assert.equal(first.errors,undefined);assert.deepEqual(first.data.courses.nodes.map(x=>x.id),['c1','c2']);assert.equal(first.stats.authorBatches,1);assert.equal(first.data.courses.hasNextPage,true);assert.equal(first.data.courses.endCursor,'c2');
const next=await executeCatalogue('catalogue.v1',{first:2,after:'c2'},a);assert.deepEqual(next.data.courses.nodes.map(x=>x.id),['c3']);assert.equal(next.data.courses.hasNextPage,false);
const other=await executeCatalogue('catalogue.v1',{first:20},b);assert.equal(other.data.courses.nodes[0].author.name,'B author');assert.equal(JSON.stringify(first.data).includes('tenant'),false);
for(const [op,vars,viewer]of[['catalogue.v1',{first:2},null],['unknown',{first:2},a],['catalogue.v1',{first:21},a],['catalogue.v1',{first:1.5},a],['catalogue.v1',{first:'2'},a],['catalogue.v1',{first:2,after:'b1'},a],['catalogue.v1',{first:2,tenant:'b'},a],['catalogue.v1',{first:2,after:'x'.repeat(81)},a]]){
 const result=await executeCatalogue(op,vars,viewer);assert(result.errors?.length);assert.equal(result.stats.authorBatches,0);
}
const invalid=await graphql({schema,source:'{ courses(first:1) { password } }'});assert(invalid.errors?.length);console.log('GraphQL17.0.2 actual schema/query/page/batched-author/tenant isolation and eight negative admission/variable/cursor cases pass.');
```

**Observed:** the real17.0.2 engine validates/executes the schema and named query, returns the expected first/next page, batches repeated authors once and preserves tenant isolation. Eight negative admission/variable/cursor cases reject before any author batch. A direct invalid-field query also fails schema validation; that raw-query path is shown only as a library check, not admitted by the persisted-operation endpoint. No HTTP transport, real authentication, database query or browser client was run.

A production wrapper also needs request/body/response limits, timeouts/cancellation through repositories, safe error projection and auth/CSRF/CORS policy appropriate to its transport/session. Mutations require transactional invariants, idempotency and field/action permission; a GraphQL `mutation` declaration does not supply those. Request batching, subscriptions and federation add operational cost and are alternatives to study when required, not prerequisites to this introduction.

## Trade-offs and practice acceptance

REST often gives simpler resource semantics, ordinary HTTP cache/CDN behavior and a smaller public operation vocabulary. GraphQL can reduce client over/under-fetching but shifts work into schema evolution, resolver cost and client error/cache policy. Both can return too much private data if projections/authorization are wrong; neither is inherently faster.

Reproduce the fixture, then replace arrays with the primary PostgreSQL repository. Retain a query-count check for repeated authors, tenant denial before slicing and a malformed/over-budget variable case. Add a nullable optional field and a deliberate required-field failure; explain the resulting `data/errors` shape. Add one reviewed operation version without breaking an old client, measure cost under a defined workload and implement the HTTP/auth/body/deadline boundary before calling it a service. Keep the persisted operation allowlist unless arbitrary queries are a real requirement. Learner implementation remains **still required**; the supplied engine checks do not establish application or professional readiness.
