---
outline: [2, 2]
---

# Building Node.js Applications at a glance

One short reminder for each of the **53 questions** in this section. Use the topic links to return to the full answers and diagrams.

## Express and NestJS

- [Route matching](./16-framework-applications.md#t16-q05): **A route matches method, path and router prefix.** Register specific routes before overlapping parameter routes; a match does not validate or authorize the input.
- [Middleware flow](./16-framework-applications.md#t16-q06): **Each middleware path must finish the response, continue with `next()`, or report an error.** Registration order matters; do not continue after sending a response.
- [Controller, service, repository](./16-framework-applications.md#t16-q07): **Controllers translate HTTP, services apply business rules, repositories access storage.** Keep HTTP objects out of reusable business operations.
- [Request and work completion](./16-framework-applications.md#t16-q08): **Client disconnection does not stop work or undo a commit.** Track the operation until it actually finishes; local response completion does not prove remote receipt.
- [CRUD and public data](./16-framework-applications.md#t16-q09): **Share business rules between JSON and HTML entry points.** Check ownership in the service, select public fields and escape untrusted text for its HTML context.
- [Identity, input and permissions](./16-framework-applications.md#t16-q10): **Authentication identifies, validation checks input, authorization permits an action.** A verifier outage is a server failure, not proof that a credential was wrong.
- [Dependency injection](./16-framework-applications.md#t16-q11): **Create and connect components in one clear setup location.** Pass request-specific identity into operations instead of storing it in a shared singleton.
- [Framework hooks](./16-framework-applications.md#t16-q12): **Choose a hook by when it runs and what it controls.** Request hooks and resource lifecycle hooks have different jobs; neither guarantees cleanup after a crash.
- [Deployment readiness](./16-framework-applications.md#t16-q13): **Listening, liveness and readiness prove different things.** Reproducible builds, checked configuration, shared durable state where needed and bounded shutdown remain application responsibilities.

## Errors

- [Error information](./10-error-handling.md#t10-q01): **Messages help people; stable codes or classes guide program decisions.** Choose an error type that describes the failure instead of matching message wording.
- [Custom errors and causes](./10-error-handling.md#t10-q02): **Keep the original failure in `cause` when adding context.** Select safe public error fields separately from private stacks and dependency details.
- [Failure ownership](./10-error-handling.md#t10-q03): **Synchronous throws, promise rejections, callbacks and events have different error channels.** Install the appropriate handling before work starts and keep ownership through cleanup.
- [Runtime diagnosis](./10-error-handling.md#t10-q04): **Reproduce the failure and test one explanation at a time.** Keep safe context and a regression check that fails before the fix and passes afterward.
- [Recovery and retry](./10-error-handling.md#t10-q05): **Request failure, service shutdown and alerting are separate decisions.** Retry only temporary, safely repeatable work within attempt and time budgets.
- [Express error responses](./10-error-handling.md#t10-q06): **Final four-argument error middleware maps failures to safe responses.** Express 5 observes returned route promises; after headers are sent, delegate with `next(error)`.
- [Transaction retry](./10-error-handling.md#t10-q07): **Retry the whole transaction only after a confirmed retryable abort.** Release the client before backoff; reconcile an unknown commit outcome instead of blindly replaying.

## Testing

- [Useful unit tests](./15-testing.md#t15-q01): **Assert observable behavior with independently chosen expected results.** Include normal, boundary, invalid-input and relevant dependency-failure cases.
- [Framework tests](./15-testing.md#t15-q08): **Use the real HTTP handling chain to verify routing, parsing and error responses.** A deliberately injected service double does not prove real storage behavior.
- [Integration tests](./15-testing.md#t15-q03): **Name which real components interact and isolate their data.** Await setup and cleanup even when the interaction or assertion fails.
- [Contract tests](./15-testing.md#t15-q02): **Verify the agreement between real participants, not only a shared fake.** Inputs, statuses, headers, data shape and important meaning all belong to the contract.
- [End-to-end tests](./15-testing.md#t15-q04): **Exercise a valuable journey through the assembled system.** Wait for readiness, bound requests, isolate state and verify resource closure afterward.
- [TDD and BDD](./15-testing.md#t15-q05): **TDD: fail, pass, refactor; BDD: agree on concrete behavior examples.** Tools do not replace a meaningful failing check or shared understanding.
- [Load and stress](./15-testing.md#t15-q06): **Load checks expected traffic; stress explores limits and recovery.** Define budgets and stop conditions, count failures too, then check recovery after reducing traffic.
- [Performance evidence](./15-testing.md#t15-q07): **Measure correct, equivalent workloads repeatedly.** One noisy laptop timing is not a reliable CI threshold or proof of whole-service capacity.

## Networking

- [HTTP exchange layers](./08-networking.md#t08-q09): **Connection success, acceptable HTTP status and valid application data are separate checks.** `fetch()` can resolve for 404 or 500; read and validate the body too.
- [TCP framing](./08-networking.md#t08-q01): **TCP preserves byte order, not application message boundaries.** Define framing, size and time limits; a timeout event alone does not close a socket.
- [UDP datagrams](./08-networking.md#t08-q02): **UDP keeps datagram boundaries but does not guarantee arrival, order or uniqueness.** A successful send callback does not prove remote receipt or processing.
- [HTTPS lifetime](./08-networking.md#t08-q03): **Verify the intended TLS identity and supervise the full body read.** Receiving headers is not completion; keep byte limits, deadlines and cleanup.
- [DNS lookup](./08-networking.md#t08-q04): **`lookup()` follows OS rules; `resolve*()` asks for DNS records.** A naming answer proves neither reachability, permission nor certificate identity.
- [Responsive HTTP interaction](./08-networking.md#t08-q10): **An in-page fetch can wait without freezing the page.** Prevent stale responses from overwriting newer UI state; cancellation cannot undo an already committed server action.
- [Connection pooling](./08-networking.md#t08-q11): **A socket limit does not bound the waiting request queue.** Budget admission and the whole operation, consume or cancel bodies, and close the pool.

## Development-tool workflows

- [Build, test and start](./29-development-tools.md#t29-q01): **Build produces files, tests check behavior, start runs the service.** Confirm listening before reporting startup success and check shutdown through a bounded smoke test.
- [Lint rules](./29-development-tools.md#t29-q02): **Prove the intended violation fails in the intended files.** Then fix it and confirm success; disabling a rule changes policy rather than correcting behavior.
- [Different development checks](./29-development-tools.md#t29-q03): **Formatting, linting, typechecking and tests check different properties.** Passing one does not supply the others' evidence; separate formatting edits from behavior edits.
- [Diagnosing a failed gate](./29-development-tools.md#t29-q04): **Identify the exact command, directory, version and file scope.** A check that never examines the intended file can produce a false green.
- [IDE and debugger](./29-development-tools.md#t29-q05): **Use navigation to find callers and breakpoints to inspect one real execution path.** Verify the actual process and source maps, then test the fix without the debugger.
- [Remote debugging](./29-development-tools.md#t29-q06): **Identify the deployed build before attaching to its process.** Prefer isolated staging and loopback Inspector through an authenticated private connection; close the session afterward.
- [Async tracing](./29-development-tools.md#t29-q07): **A request ID connects records; `cause` preserves the underlying failure.** Propagate safe context and keep private diagnostics separate from the public response.
- [Startup failures](./29-development-tools.md#t29-q08): **Find the last successful startup step and inspect the next one.** Check loading, configuration, dependencies and port binding before readiness.
- [JSDoc](./29-development-tools.md#t29-q09): **Document inputs, results, expected failures and units beside the function.** Editor checks can use JSDoc, but incoming values still need runtime validation.
- [OpenAPI](./29-development-tools.md#t29-q10): **OpenAPI describes the HTTP agreement; Swagger UI displays it.** Contract tests compare actual behavior with that agreement; documentation alone enforces nothing.

## Events and the event loop

- [EventEmitter delivery](./06-events-and-event-loop.md#t06-q01): **`emit()` calls listeners synchronously in registration order and returns whether listeners existed.** Own subscription cleanup, error events and async listener rejections separately.
- [Waiting for events](./06-events-and-event-loop.md#t06-q02): **Register every required wait before starting a producer that may emit immediately.** Observe rejections and cancel unused waits; emitters do not replay past events.
- [Event-loop phases](./06-events-and-event-loop.md#t06-q03): **Scheduling context determines timer and immediate order.** An immediate scheduled inside the shown I/O callback beats its timer; do not generalize that to program startup.
- [Ticks and microtasks](./06-events-and-event-loop.md#t06-q04): **After an ordinary callback, next ticks precede standard microtasks.** Top-level ESM runs in another context; record module mode before predicting the sequence.
- [Native async mechanisms](./06-events-and-event-loop.md#t06-q05): **Sockets commonly use OS notifications; many other APIs use libuv's native pool.** JavaScript completion still runs on its JS thread; `worker_threads` is a separate mechanism.
- [Signal shutdown](./06-events-and-event-loop.md#t06-q06): **Start shutdown once, stop admission, drain within limits and close resources.** Signal handlers replace default behavior; blocked JavaScript cannot enforce its own deadline reliably.
- [Loop measurements](./06-events-and-event-loop.md#t06-q07): **Delay measures lateness; utilization compares active and idle loop time.** Convert delay nanoseconds to milliseconds and compare interval measurements with CPU and dependency evidence.
- [Starvation and fairness](./06-events-and-event-loop.md#t06-q08): **Repeated resolved-promise awaits can still starve I/O.** Bounded CPU chunks with awaited immediates give the loop opportunities; sustained CPU work may need a worker pool.

## Design patterns

- [Pattern selection](./18-patterns.md#t18-q01): **Choose a pattern for an independently changing responsibility.** Creational patterns organize creation, structural patterns connect parts, behavioral patterns organize actions and communication.
- [Creation and lifetime](./18-patterns.md#t18-q02): **Factories construct, builders assemble, singletons share within a defined scope.** Decide state lifetime and resource ownership; a singleton is not shared across processes.
- [Adapter and Decorator](./18-patterns.md#t18-q03): **An Adapter translates an interface; a Decorator adds behavior while preserving its contract.** Results, errors, effects and cleanup matter as much as method names.
- [Strategy, Observer, Command](./18-patterns.md#t18-q04): **Strategy chooses an algorithm; Observer notifies listeners; Command represents an operation.** None automatically supplies durable delivery, safe retries or undo.

## Put it into practice

[Build an HTTP application](./progressive-projects.md#project-2-http-application): keep the existing CLI and use cases, add the HTTP/UI adapters, and verify behavior through unit, contract and real HTTP checks. Real-time transport reminders continue in [Specialized systems](./specialized-at-a-glance.md).
