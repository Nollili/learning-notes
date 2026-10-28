# REST contracts: OpenAPI, runtime schemas and drift checks — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../workbench/node-js/backend/rest-contracts.md) · [Node.js practice map](./index.md)

## Practice acceptance

Reproduce the fixture, replace the auth and array repository with the primary project's real adapters, and retain allowed/denied/foreign-cursor cases. Add one consumer checked against the reviewed OpenAPI, deliberately change a required response field/error status and show CI detects the mismatch. Verify malformed query, dependency failure, privacy projection and token validation through HTTP. Review a contract update separately from code generation; record which compatibility guarantee remains untested. Learner implementation remains **still required**.

Official references: [Zod4 JSON Schema conversion/limitations](https://zod.dev/json-schema), [Swagger Parser validation API](https://apidevtools.com/swagger-parser/), [Ajv JSON Schema dialects](https://ajv.js.org/json-schema.html), [OpenAPI3.1.2](https://spec.openapis.org/oas/v3.1.2.html).
