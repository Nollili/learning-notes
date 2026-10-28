# GraphQL: a bounded catalogue query — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/graphql-basics.md) · [Node.js practice map](./index.md)

Reproduce the fixture, then replace arrays with the primary PostgreSQL repository. Retain a query-count check for repeated authors, tenant denial before slicing and a malformed/over-budget variable case. Add a nullable optional field and a deliberate required-field failure; explain the resulting `data/errors` shape. Add one reviewed operation version without breaking an old client, measure cost under a defined workload and implement the HTTP/auth/body/deadline boundary before calling it a service.

Keep the persisted operation allowlist unless arbitrary queries are a real requirement. Learner implementation remains **still required**; the supplied engine checks do not establish application or professional readiness.
