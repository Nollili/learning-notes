---
outline: [2, 3]
---

# Node.js tech-check

A question-and-answer guide for understanding Node.js, building applications and explaining engineering decisions. Use the five levels below as a learning ladder, with **Designing Services and Hardening/Optimization as your target depth**.

Each question includes explanations, examples, failure cases and practice. Try the example or scenario before reading its answer. Your own implementation, debugging and explanation provide the evidence of what you can do.

The [five progressive projects](./progressive-projects.md) evolve one repository from CLI → HTTP application with a basic UI → deployable service → hardened service → operated specialist service.

![Node.js Tech Check five-level ladder and its topic criteria, from core JavaScript and Node.js APIs through architecture, security, databases, performance, queues and WebSockets.](/images/node-js/nodejs-tech-check-levels.png)

## Node.js Foundations

- [Runtime fundamentals](./01-runtime-fundamentals.md)
- [CLI and process management](./02-cli-and-processes.md)
- [Modules](./03-modules.md)
- [Package management](./04-package-management.md)
- [Asynchronous programming](./05-asynchronous-programming.md)
- [Core APIs](./07-core-apis.md)
- [Framework foundations](./16-frameworks.md)

Build alongside these topics with the [Foundations CLI project](./progressive-projects.md#project-1-foundations-cli).

## Building Node.js Applications

- [Events and the event loop](./06-events-and-event-loop.md)
- [Networking](./08-networking.md)
- [Development-tool workflows](./29-development-tools.md)
- [Errors](./10-error-handling.md)
- [Testing](./15-testing.md)
- [Express and NestJS](./16-frameworks.md#application-frameworks)
- [Design patterns](./18-patterns.md)

Apply the application topics in the [HTTP application project](./progressive-projects.md#project-2-http-application).

## Designing Node.js Services

- [Concurrency](./09-concurrency.md)
- [Architecture](./18-architecture.md)
- [Authentication and authorization](./13-authentication-and-authorization.md)
- [Database fundamentals](./17-databases.md)
- [Docker](./23-containerization.md)
- [Cloud](./30-cloud-fundamentals.md)
- [Serverless](./20-serverless.md)
- [Deployment](./24-deployment.md)

Bring the pieces together in the [deployable service project](./progressive-projects.md#project-3-deployable-service).

## Hardening and Optimizing Node.js Services

- [Security](./14-security.md)
- [Advanced authentication](./13-authentication-and-authorization.md#t13-q06)
- [Performance and V8](./12-performance-and-v8.md)
- [Deeper data access](./17-databases.md#t17-q09)
- [Advanced APIs and frameworks](./16-advanced-api-frameworks.md)

## Specialized Node.js Systems {#specialized-systems}

- [Queues and message-driven systems](./19-messaging.md)
- [WebSockets and Socket.IO](./08-networking.md#t08-q06)
- [Structured logging](./21-logging.md)
- [Monitoring and diagnostic signals](./22-monitoring.md)

- [Advanced real-time, native modules and WebAssembly](./specialized-systems.md)

Choose specialist extensions for a concrete reliability, interoperability or measured performance need.

## Practice and references

Use the [runtime course](../index.md) for longer lessons and the [Node.js exercises](../../practice/node-js/index.md) for independent implementation. Examples state their runtime and dependency assumptions. A local fixture or worked solution does not replace testing your own implementation in its intended environment.
