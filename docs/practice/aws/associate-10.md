# A10 — Serverless APIs, versions and S3 triggers

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [serverless and apis](../../aws/serverless-and-apis.md).

## A10.1 — Products HTTP API — repeating P03

- [ ] Create `shop-get-products-list` on a currently supported Node.js runtime with basic execution permissions and an in-memory mock catalogue. Test it and inspect Lambda metrics/logs.
- [ ] Publish a version and create the alias `latest` pointing to that numbered version.
- [ ] Create HTTP API `shop-api-gw`, integrate `GET /products`, inspect configuration and verify the invoke URL.
- [ ] Update the integration to reference the alias ARN. Change the handler data and show that the alias stays on the previous published version until moved.
- [ ] Publish a new numbered version, move the `latest` alias to it and verify the updated response. **Correction:** an alias cannot point to `$LATEST`.
- [ ] Configure the client product endpoint and CORS, rebuild where needed and verify browser requests.
- [ ] Create `shop-get-product-by-id`, integrate `GET /products/{id}`, and demonstrate both a matching product and a 404. The source's `:id` is route notation, not the literal API Gateway path parameter syntax.

## A10.2 — S3 trigger — repeating P05

- [ ] Create a handler that logs the key from an object-created event, configure bucket notifications and permissions, upload objects and inspect the resulting logs. Avoid a self-triggering output path.

## A10.3 — Orders and alternate API product — promoted from optional

- [ ] Migrate the previous backend's orders API to the HTTP API using prior queue/database work as needed; verify the retained behavior from the client.
- [ ] Repeat the Task 1 product API with **REST API**, compare integration payloads/features and verify the same functional outcomes. **Repeating P03 through the Associate workflow; keep this comparison explicit.**
- [ ] Disable disposable bucket notifications and remove unused functions, API resources and log groups, preserving named dependencies needed for A11 or recreating them from templates.


## Completion evidence

- [ ] Record observed results for every section, including all promoted extensions.
- [ ] Retain configuration/code, successful and denied/failing cases where specified, and actual cleanup state.
- [ ] Link earlier evidence for repeating work and add the new interface/behavior comparison.

Use the [shared evidence rules](./index.md#evidence-for-every-required-module); never claim screenshots or sample code complete independent work.
