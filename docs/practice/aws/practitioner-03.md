# P03 — Serverless product API

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [serverless and apis](../../aws/serverless-and-apis.md). **Overlap:** Repeating in A10: product list/by-id Lambda API, using a different API Gateway product.

[Original supplied text](/aws-homework/sources/practitioner-03.txt) preserves the source wording. Apply the [corrections](./source-notes.md) and this path’s mandatory status when interpreting it.

You're about to write your first application code in this course. The Product Service is a small REST API that serves product data, backed by two Lambda functions — one for the full catalog, one for a single item. Both read from mock data for now, but later modules swap that for a real database without changing the API surface you build here.

## Prerequisites

Configure your AWS credentials so CDK can access them. Make sure your default region is set correctly.

Make sure to use Node.js version 22 — this matches the Lambda runtime required for this module.

Use TypeScript for all practical tasks. It's mandatory to ensure code quality and maintainability. If you're using the template provided below, TypeScript is already configured properly, so just install dependencies with npm i.

Check out the Working with Autocode guide before you start. It explains how submissions are validated and how to avoid common issues.

## Workflow

Make sure you're working in your fork of the template repository.

Create a branch named task-3 off the latest main and work there for this module.

Run npm run sync-tests -- module-3 to pull this module's Autocode tests into your local src/test/.

Implement all the tasks described in Tasks below.

Deploy and configure your stack for testing:

Deploy: npm run deploy. It bundles each handler.ts into a handler.js next to it, then runs cdk deploy.

Copy the printed API Gateway endpoint URL into the root-level e2e.config.ts's PRODUCT_API_URL.

Keep the stack deployed while you work. The tests in the next step run as real HTTP requests against it, not against your code directly.

Validate your work:

```bash
npm run test:unit # infrastructure tests.
npm run test:e2e # endpoint tests against your deployed API.
npm test # runs both.
```

You can also test the live endpoints manually with a tool like Postman.

**User-owned submission:** after local validation, the user pushes and submits the branch in Autocode and waits for grading. The assistant must never push.

After grading, the learner follows the course pull-request and merge workflow.

## Architecture

See the [course-wide system diagram](../../aws/index.md#one-application-several-responsibilities). The pasted source contains an image label rather than an embedded diagram.

## Project structure

Files marked (unchanged) already exist and need no changes. Files marked (update) already exist and need the changes their Task describes. Everything else you'll create as you work through the Tasks below.

```text
src/
  infra/
    bin/
      app.ts                           # CDK app entry point (update)
    lib/
      index.ts                         # stack barrel (update)
      product-service-stack/
        index.ts                       # ProductServiceStack
        get-products-list-lambda.ts    # GetProductsListLambdaConstruct
        get-products-by-id-lambda.ts   # GetProductsByIdLambdaConstruct
        rest-api.ts                    # RestApiConstruct
  app/
    handlers/
      get-products-list/
        handler.ts                     # getProductsList handler
      get-products-by-id/
        handler.ts                     # getProductsById handler
    data/
      products.ts                      # mock `products` array (unchanged)
    types/
      product.ts                       # `Product` interface (unchanged)
```

## Data Models

Every product in the mock catalog follows this shape:

```text
products:
  id - uuid (Primary key)
  title - text, non-empty
  description - text
  price - number, greater than 0
```

## API Contract

Each response body below contains exactly the fields shown and no extra ones.

GET /products

Returns the full product catalog. No request body or query parameters.

200 response — the full product catalog as a JSON array:

```text
[
  {
    id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
    title: 'Wireless Noise-Cancelling Headphones',
    description: 'Over-ear headphones with active noise cancellation and 30-hour battery life.',
    price: 24,
  },
  // ...
];
```

See Data Models for field constraints.

GET /products/{productId}

Looks up a single product by id.

200 response — the matching product:

```text
{
  "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
  "title": "Wireless Noise-Cancelling Headphones",
  "description": "Over-ear headphones with active noise cancellation and 30-hour battery life.",
  "price": 24
}
```

See Data Models for field constraints.

404 — no product with that productId. Body: { "message": "`<reason>`" }.

## Tasks

Where a task specifies a file path, class name or props interface, use it exactly as shown. The tests Autocode runs import your code from these exact paths and names. If either is wrong, the test can't find your code, regardless of whether the logic inside is correct.

### Task 3.1 — List all products

In this task, you'll build your first Lambda function: one that will hand back the full product catalog once it's wired to GET /products. It's the simplest of the three, no input, just the whole list. You create the handler that reads the catalog first, then the construct that defines it as a Lambda function.

What to do:

Create the handler that returns 200 with the full array of products from data/products.ts. See API Contract for the response format:

`src/app/handlers/get-products-list/handler.ts`

```ts
export const main = async () => { ... };
```

Create a Lambda function for that handler:

Function name getProductsList.

Node.js 22.x runtime, handler.main entry point.

512 MB of memory, 30-second timeout.

`src/infra/lib/product-service-stack/get-products-list-lambda.ts`

```ts
export class GetProductsListLambdaConstruct extends lambda.Function {
  constructor(scope: Construct, id: string) { ... }
}
```

### Task 3.2 — Get a product by id

With the first Lambda function built, you'll now add a second one: it will look up a single product by its productId once it's wired to GET /products/{productId}. Unlike the list function, an id might not match any product, so you'll also handle the not-found case. Like before, you create the handler first and then the construct that defines it.

What to do:

Create the handler that reads the productId path parameter and looks up the product in data/products.ts. It returns 200 with the product it finds. It returns 404 when nothing is found. See API Contract for the response format:

`src/app/handlers/get-products-by-id/handler.ts`

```ts
export const main = async (event: { pathParameters: { productId: string } }) => { ... };
```

Create a Lambda function for that handler:

Function name getProductsById.

Same runtime, entry point, memory and timeout as getProductsList.

`src/infra/lib/product-service-stack/get-products-by-id-lambda.ts`

```ts
export class GetProductsByIdLambdaConstruct extends lambda.Function {
  constructor(scope: Construct, id: string) { ... }
}
```

### Task 3.3 — Wire up the REST API

Both Lambdas are defined now, but nothing outside AWS can reach them yet. API Gateway is what exposes a Lambda over HTTP, mapping a route to the function that handles it. This task wires both routes to their Lambda through a REST API, then composes everything into one stack. You define the API first, then the stack that ties it to both Lambdas.

What to do:

Create an API Gateway REST API construct, not an HTTP API, using Lambda-Proxy integration. It routes GET /products to getProductsList and GET /products/{productId} to getProductsById, where productId is the id field of a product in your mock data:

`src/infra/lib/product-service-stack/rest-api.ts`

```ts
export interface RestApiConstructProps {
  readonly getProductsListLambda: IFunction; // the GetProductsListLambdaConstruct from Task 3.1
  readonly getProductsByIdLambda: IFunction; // the GetProductsByIdLambdaConstruct from Task 3.2
}
```

```ts
export class RestApiConstruct extends apigateway.RestApi {
  constructor(scope: Construct, id: string, props: RestApiConstructProps) { ... }
}
```

Compose both Lambda constructs and the REST API into ProductServiceStack:

`src/infra/lib/product-service-stack/index.ts`

```ts
export class ProductServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) { ... }
}
```

Add ProductServiceStack next to FrontendHostingStack in src/infra/bin/app.ts, so cdk deploy picks it up too.

**Checkpoint: do both endpoints work properly?**

## Evaluation criteria

Everything below is checked automatically. Infrastructure criteria are asserted against your synthesized CDK template. Behavior criteria are asserted as real HTTP requests against your deployed API.

## Infrastructure

ProductServiceStack contains exactly two Lambda functions (getProductsList and getProductsById) and one API Gateway REST API.

Both Lambda functions run on the Node.js 22.x runtime with the handler.main entry point, 512 MB of memory and a 30-second timeout.

GET /products is wired to getProductsList and GET /products/{productId} to getProductsById, both through a Lambda-Proxy integration.

## Behavior

GET /products returns a 200 response with the full product catalog from data/products.ts.

GET /products/{productId} returns a 200 response with the matching product for an existing productId.

GET /products/{productId} returns a 404 response with a { "message": "`<reason>`" } body when no product matches the given productId.

Both endpoints return exactly the fields listed in the API Contract and no extra ones.

## Completion evidence

Record each required task, the observed acceptance results, applicable test output, all promoted extensions, and cleanup. Original Autocode checks do not automatically verify the promoted extensions. See the [shared evidence rules](./index.md#evidence-for-every-required-module).
