# Production-Ready Node.js Applications — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/module-10-production-ready-applications.md) · [Node.js practice map](./index.md)

### Test shutdown

An automated integration test can:

1. Start the application on an ephemeral port.
2. Begin a controlled slow request.
3. trigger the shutdown function directly rather than signaling the test runner;
4. verify readiness becomes `503`;
5. verify the in-flight request completes;
6. verify new connections are rejected;
7. verify pools and workers close;
8. verify the deadline handles a deliberately stuck resource.

---

## Graduated practice: logging and lifecycle

### 1. Worked example

Run the retained application using its README, then exercise the lifecycle contract. Observe one request ID, two different health checks, and a signal-triggered shutdown. Follow `server.ts` → `createShutdown` → `db.close`; identify which function owns each resource.

### 2. Guided failure

Start with an unreachable database port. Hint: metadata discovery does not establish connectivity. **Success:** HTTP never listens, startup reports only a stable diagnostic code, and the command terminates unsuccessfully. Then restore the database and repeat a successful start.

### 3. Independent task

Add a bounded background job with explicit `stopIntake` and `drain` ownership. **Success:** SIGTERM prevents new jobs, lets an active job finish, and closes its database only after the job releases it. A stuck job reaches the process deadline. Use a child process to test forced termination.

### 4. Optional depth: structured diagnostics

Use the primary Node 24/Express 5 stack and a locked Winston 3 version. Route metadata must be developer-defined templates; no req.path/originalUrl fallback on matched, unmatched or aborted requests. A router mounted under a prefix may need explicit static route IDs to distinguish operations. Never derive a log/metric route label by partially redacting a raw URL. Keep request IDs bounded and accept an upstream value only under an explicit trusted-gateway policy; they are correlation metadata, never authorization.

**Acceptance:** capture actual Winston JSON output. A nested raw Error demonstrates missing stack with the errors formatter alone; the explicit owned projection preserves bounded stack/cause codes. Put token/password/SQL sentinels into an unknown error message, enumerable fields, cause object and raw URL; none may appear in emitted records. Mutating an owned Error's message/stack after construction must not alter its recorded safe diagnostic. More than three causes truncate predictably.

Unknown exceptions remain observable as a stable category rather than silently disappearing. Matched routes emit a static template; unmatched/aborted routes use a fixed label. Run overlapping asynchronous request contexts and prove each completion/inner event retains its own ID. Retain evidence of the actual sink format, without recording real secrets.

Keep a short record of the emitted JSON and sentinel checks. Review retention/access controls when choosing a hosted log sink.

References checked 2026-10-21: [logform errors format contract](https://github.com/winstonjs/logform#errors), [Winston formats/transports](https://github.com/winstonjs/winston), [OWASP logging and sensitive data](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), [Node 24 AsyncLocalStorage](https://nodejs.org/download/release/v24.18.0/docs/api/async_context.html).

### 5. Optional depth: lifecycle failure matrix

**Acceptance:** start on an ephemeral port, hold a slow request/job, initiate shutdown twice and prove both calls share one promise. Intake stops immediately and readiness becomes false; active work finishes before database close; new connections are rejected. Force server-close/job/database failures separately and together: every eligible cleanup runs, failure exit status is nonzero and completed is absent. A job that cannot release its database ownership keeps drain pending until the final child-process deadline. Test deadline termination and uncaught startup rejection in disposable child processes, not the parent test runner.

Bind a second server to an occupied address and verify the async startup rejection closes its handed-over database. For readiness, issue concurrent calls to a deliberately never-settling ping: each reply returns false within budget and underlying call count stays one across subsequent probes. Then use a real driver-backed slow query with configured statement/acquisition limits; prove the query actually ends and later probes can recover. A response-only Promise.race test does not demonstrate database cancellation.

Test shutdown beginning during a successful ping to prevent a late 200 readiness response. Record the observed deadlines and exit statuses; do not infer driver cancellation from the HTTP response alone.

References checked 2026-10-21: [Node 24 HTTP server lifecycle](https://nodejs.org/download/release/v24.18.0/docs/api/http.html), [Node 24 net listen/error events](https://nodejs.org/download/release/v24.18.0/docs/api/net.html), [pg client timeout configuration](https://node-postgres.com/apis/client), [PostgreSQL statement timeout](https://www.postgresql.org/docs/16/runtime-config-client.html#GUC-STATEMENT-TIMEOUT), [MikroORM 7 driver options](https://mikro-orm.io/docs/configuration#driver-options).

---

## 15. Final review checklist

### Architecture and deployment

- [ ] Explain VMs, multiple instances, containers/orchestrators, and serverless trade-offs.
- [ ] Keep correctness independent of one process's memory or local disk.
- [ ] Build once and configure the same artifact per environment.
- [ ] Run migrations as controlled one-off release/admin work.
- [ ] Rely on an external supervisor for restart and replacement.

### Configuration

- [ ] Parse and validate all environment values before listening.
- [ ] Never provide unsafe defaults for secrets or trust decisions.
- [ ] Export a typed configuration object instead of spreading `process.env` reads.
- [ ] Keep production secrets out of source, images, `.env` files, logs, and error output.
- [ ] Understand Node's `--env-file` and the local-development role of dotenv-style files.

### Logging and observability

- [ ] Emit structured events with deliberate severity levels.
- [ ] Preserve error stacks/causes and avoid duplicate logging.
- [ ] Redact credentials and unnecessary personal data.
- [ ] Propagate validated correlation context with `AsyncLocalStorage` or tracing.
- [ ] Distinguish operational logs, audit events, metrics, and traces.
- [ ] Avoid high-cardinality metric labels.

### Health and lifecycle

- [ ] Distinguish startup, liveness, and readiness consequences.
- [ ] Keep liveness shallow and readiness bounded by timeouts.
- [ ] Mark the instance unready before draining.
- [ ] Stop new work, complete bounded in-flight work, and close owned resources.
- [ ] Handle WebSockets, workers, consumers, timers, pools, and telemetry explicitly.
- [ ] Keep shutdown shorter than the platform's forced-termination deadline.

### Errors and security

- [ ] Use a final Express error handler and respect `headersSent`.
- [ ] Return stable public errors without production stack traces.
- [ ] Treat uncaught exceptions and unhandled rejections as fatal defects.
- [ ] Use TLS and configure proxy trust precisely.
- [ ] Apply Helmet as a reviewed baseline, not a complete security solution.
- [ ] Understand that CORS is a browser read policy, not authorization.
- [ ] Configure rate limits for the actual multi-instance deployment and threat model.
- [ ] Bound body size, query cost, concurrency, queues, pools, and dependency duration.
