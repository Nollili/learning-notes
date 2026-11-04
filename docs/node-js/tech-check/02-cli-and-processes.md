---
outline: [2, 3]
---

# CLI and process management

JavaScript examples use Node24, ES Modules (`.mjs`) and built-in APIs. Shell commands use POSIX syntax unless stated otherwise; adapt environment/redirection syntax for your shell. Depth labels describe study depth, not an official exam grade.

### How do you run a program and distinguish Node flags from script arguments? {#t02-q01}

*Study depth: Foundational*

<span class="notes-section-label">**Code question — attempt first**</span>

Save as `args.mjs`, then run `node --trace-warnings args.mjs --mode test`. Which array contains --trace-warnings, and which contains --mode?

```js
console.log(JSON.stringify({
  runtime: process.execArgv,
  application: process.argv.slice(2)
}));
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

The node executable starts the runtime; an entry file supplies the program. **Runtime flags normally precede that file**, and **arguments after it belong to the script**. process.argv contains executable path, entry path and script arguments, while process.execArgv contains Node options such as --trace-warnings. **Values arrive as strings and need validation**.

Useful commands include --version, --help, --check for syntax, and --eval/--print for short expressions. A shell can transform quotes/globs before Node sees the arguments, so **shell parsing and application parsing are separate boundaries**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

For the command above the result has runtime `["--trace-warnings"]` and application `["--mode","test"]`. Absolute executable/entry paths are intentionally omitted by slice(2). Node consumes its own flag before loading the entry. It does not automatically convert the script's --mode into a settings object.

If you move a Node flag after the file, your script usually receives it instead of configuring the runtime.

| Command | Purpose and limitation |
|---|---|
| `node --version` / `node --help` | Inspect the selected executable; a different terminal/container may select another version |
| `node app.mjs` | Run an explicit ES-module entry |
| `node --check app.mjs` | Check syntax without running the program; does not establish correct imports, permissions or behavior |
| `node --input-type=module --eval "console.log(1 + 2)"` | Execute inline ES-module input; --input-type applies to string/stdin input, not a way to relabel an arbitrary file |
| `node --print "1 + 2"` | Evaluate and print the expression result; do not put secrets in shell history/arguments |
| `node --inspect=127.0.0.1:9229 app.mjs` | Start an inspector listener; the debugger is privileged, not a public application endpoint |

Use `node -- args.mjs --help` when deliberately ending Node option parsing before the file; --help still belongs to the application. Quoting `"two words"` commonly preserves one argument in a POSIX shell. A shell-expanded glob may become several arguments before your code runs; behavior differs between shells/platforms.

Never implement security by assuming you know what the user typed before shell expansion.

A real CLI should parse a declared option schema (for example node:util parseArgs), reject unsupported/duplicate options according to policy, validate numbers/enums and produce a useful usage error. This tiny example only shows the two argument channels. There is no DOM form to constrain a terminal user; direct invocation can bypass any wrapper script.

<span class="notes-section-label">**Common mistakes**</span>

- Taking argv[0] as the first user argument; it normally identifies the executable.
- Treating --check success as successful application startup.
- Building a shell command by concatenating parsed arguments; argument validation does not make shell metacharacters harmless.
- Assuming an npm wrapper and direct node invocation always expose identical argument forwarding; verify the wrapper's documented separator behavior.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why is the number42 received as text?**</span> Operating-system argument lists carry strings. Parse and range-check it; Number conversion alone can accept empty/whitespace or unintended notation.
2. <span class="notes-section-label">**Does --trace-warnings prove the source of every error?**</span> No. It adds warning stack information. Thrown errors, failed dependencies and application logs have their own diagnostic paths.
3. <span class="notes-section-label">**What if node is not found or is the wrong version?**</span> Inspect the executable/toolchain selection in that environment, including PATH and container image; changing application imports cannot fix executable selection.

::: tip Key takeaway
Keep runtime flags, shell processing and validated application arguments as three distinct responsibilities.
:::


---

### How should a service turn environment variables into reliable configuration? {#t02-q02}

*Study depth: Intermediate*

<span class="notes-section-label">**Code question — attempt first**</span>

What is wrong with `const enabled = Boolean(process.env.FEATURE_ENABLED)` when the environment contains FEATURE_ENABLED=false? Would `Number(process.env.PORT) || 3000` reliably distinguish absent, zero and malformed configuration?

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>



**Environment variables supply string configuration, not typed application state**. **Validate them once at startup**, **apply defaults only for genuinely absent values**, convert deliberately and pass a small immutable configuration object to the application. **The string false is truthy**, and truthy defaults can hide invalid or meaningful values.

A .env file is a loading mechanism, not a secret vault. Node24 supports --env-file; **an existing process environment value takes precedence over the file**. Keep credentials out of logs, argv and client bundles, and fail startup safely for invalid essential settings.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

Boolean('false') is true because the string is nonempty. Number('') is0, and a || default treats0 like absence. Those conversions can silently change operational policy. Configuration needs a schema: accepted names, types, ranges, required/optional fields, precedence and safe error messages.

A port used for an externally configured service can deliberately forbid0, while a test listener can deliberately allow ephemeral0; decide per application.

The following `config.mjs` exports a pure parser with no network/startup side effect. Defaults apply only when an option is undefined. It accepts decimal ports1–65535 and exactly true/false for the feature switch. The end-of-string guard rejects a trailing newline rather than relying on JavaScript's permissive $ position.

<span class="notes-section-label">**Example**</span>

```js
export function loadConfig(env = process.env) {
  const portText = env.PORT === undefined ? '3000' : env.PORT;
  const featureText = env.FEATURE_ENABLED === undefined ? 'false' : env.FEATURE_ENABLED;
  if (typeof portText !== 'string' || !/^\d{1,5}$(?![\s\S])/.test(portText) ||
      Number(portText) < 1 || Number(portText) > 65535 ||
      !['true', 'false'].includes(featureText)) {
    throw new Error('Invalid service configuration');
  }
  return Object.freeze({port: Number(portText), featureEnabled: featureText === 'true'});
}
```

An entry imports loadConfig, catches this fixed startup error and exits before opening resources. Do not catch it and start with a guessed database URL. A plain frozen object here has only scalar fields; freezing is not deep immutability for a nested configuration graph.

For a local fixture, a file containing `PORT=3100` can be loaded with `node --env-file=local.env app.mjs`. Existing PORT in the parent environment wins. A missing required env file makes startup fail; --env-file-if-exists is a different deliberate contract. File paths are relative to the launch working directory unless made explicit.

Do not assume the file is a shell script or that every dotenv tool implements identical quoting/expansion. Review loaded NODE_OPTIONS as trusted runtime configuration too.

A process receives its environment from its parent. Editing the parent's shell or a file afterward does not mutate an already-running service. Changing process.env in one process does not update other replicas. Reload/rotation needs an explicit lifecycle, and shared secrets require a coordinated acceptance/expiry policy.

Source code should depend on validated configuration rather than read ambient env in every helper, making tests and ownership clearer.

<span class="notes-section-label">**Common mistakes**</span>

- Printing the entire environment to debug one missing setting.
- Assuming server environment variables remain secret after copying them into browser-facing configuration.
- Silently defaulting malformed production credentials or treating the word false as a boolean.
- Re-reading changing ambient configuration halfway through a transaction without a consistency policy.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why inject env into this parser?**</span> Tests can pass a small isolated mapping without mutating global process state or leaking unrelated credentials.
2. <span class="notes-section-label">**Can .env be committed?**</span> A sanitized example containing names/nonsecret defaults can be useful; real credentials require the owner's secret storage/rotation policy. Ignoring a file in Git does not revoke an already exposed credential.
3. <span class="notes-section-label">**Can a client choose the tenant through an environment variable?**</span> Deployment config can select an allowed service scope, but request authority must come from verified current identity/policy, not an arbitrary caller or model field.

::: tip Key takeaway
Parse environment strings into a validated startup contract; defaults, precedence and secret handling are explicit policy.
:::


---

### What is the REPL useful for, and where does its behavior differ from a file? {#t02-q03}

*Study depth: Foundational*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

The REPL is an interactive Read–Eval–Print Loop started by running node without a script in an interactive terminal, or explicitly with --interactive. It reads JavaScript, evaluates it, displays the result and **keeps context for the next input**. It is useful for checking a small language/API hypothesis, inspecting values and trying await.

It is **not a substitute for a reproducible module or test**: its state, top-level bindings, printing and input mode differ from an ordinary file. It also **runs code with the process's real privileges**, so it is not a sandbox.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

In this local Node24 REPL transcript, the prompts/results are terminal interaction, not lines to copy into a .mjs file:

<span class="notes-section-label">**Example**</span>

```text
> const count = 2
undefined
> count + 3
5
> await Promise.resolve('done')
'done'
> .help
... list of REPL commands ...
> .exit
```

The variable declaration evaluates without producing a useful value, so the REPL prints undefined. An expression's displayed value is not a console.log your file would perform automatically. Top-level await is supported by this REPL, but that does not mean arbitrary CommonJS files accept top-level await.

A fresh session also does not contain your previous variables. A “works in my REPL” report must identify initialization, input mode and runtime before it becomes a useful reproduction.

Useful commands include .help, .break to abandon an incomplete multiline entry and .exit to leave. .save writes the session's input and .load evaluates code from a file; neither is a harmless view operation. .clear concerns the evaluation context according to the REPL's mode, not undoing files, database writes or external requests already performed.

Use a disposable nonsecret fixture and avoid recording credentials in terminal/REPL history. Ctrl-C/Ctrl-D behavior is terminal/session-specific; a pasted interactive transcript is not a portable process-control script.

Top-level interactive bindings and inspection conveniences are not the same as an isolated ESM/CommonJS module scope. Explicitly import the API you intend to use instead of relying on previously entered or conveniently available names. Large/infinite synchronous expressions can block the session.

A promise that never completes can make interactive diagnosis confusing; add a finite reproduction and move it into a file/test to observe its lifecycle properly.

<span class="notes-section-label">**Common mistakes**</span>

- Calling the REPL an in-browser console: it has Node host resources and no ordinary page DOM.
- Assuming its printed quotes/undefined are output an equivalent script automatically produces.
- Treating .load or code pasted from a log as trusted, or assuming .clear rolls back effects.
- Testing a module-loading issue in accumulated interactive state and omitting that state from the report.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**How would you preserve a useful experiment?**</span> Put the minimal imports/input/assertion into a named file with its runtime/module type and run it from a clean process.
2. <span class="notes-section-label">**Is node -e identical to the interactive REPL?**</span> No. --eval evaluates supplied input under its selected mode; it does not automatically provide the same interactive session/context/printing contract.
3. <span class="notes-section-label">**Why prefer synthetic input during debugging?**</span> A REPL can execute network/filesystem operations and retain history. Reproducing with a small fixture reduces accidental exposure and uncontrolled effects.

::: tip Key takeaway
Use the REPL to explore, then turn important observations into reproducible files or tests with explicit context.
:::


---

### How should a CLI use stdin, stdout and stderr without corrupting its output? {#t02-q04}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Standard input is the process's input stream; standard output carries its normal result; standard error carries diagnostics. Their conventional OS descriptors are0,1,2. They can be a terminal, pipe or file, so do not assume interactive prompts or synchronous writes.

A composable CLI keeps **machine-readable output on stdout**, **sends fixed diagnostics to stderr** and **reports failure through its exit status**. It must also respect stream errors/backpressure and close owned interfaces. The OS descriptor identifies an I/O channel, **not a guarantee about the order of two separate output channels**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

`tool < input.txt > result.json 2> errors.log` in a POSIX shell connects input and separates the two outputs. If a debug console.log is mixed into a JSON result, the next program may fail to parse it. console.error normally targets stderr; it does not set a failure exit code by itself.

A service may deliberately emit structured logs to stdout under its collector contract, but that is different from a CLI promising one machine-readable stdout result.

Save this teaching example as `count-lines.mjs`. It accepts a finite trusted text fixture, counts logical lines and prints one JSON object:

<span class="notes-section-label">**Example**</span>

```js
import {createInterface} from 'node:readline';
const input = createInterface({input: process.stdin, crlfDelay: Infinity, terminal: false});
let lines = 0;
try {
  for await (const line of input) {
    if (line.length > 10_000) throw new Error('Line policy exceeded');
    lines++;
  }
  process.stdout.write(JSON.stringify({lines}) + '\n');
} catch {
  console.error('Could not count input');
  process.exitCode = 1;
} finally {
  input.close();
}
```

Run `node count-lines.mjs < fixture.txt > result.json 2> errors.log`. `a\nb\n` produces `{"lines":2}`, not3: a final terminator does not add an empty logical line. A blank line within the input is still a line. crlfDelay makes CRLF handling explicit; this is not a binary file/framing protocol.

Limits: readline can accumulate a long line before the check runs, so this is not a hard hostile-input memory cap. A production byte/line protocol needs bounded chunks/framing before accumulation, deadlines and stream-error ownership. This small final stdout write is not a general streaming/backpressure implementation. Large output must observe write(false)/drain or use pipeline. Do not claim a browser ReadableStream and Node process streams have identical methods/lifetimes.

<span class="notes-section-label">**Common mistakes**</span>

- Parsing arbitrary binary input as text or splitting every incoming chunk as if it were a whole line/code point.
- Using console.error but returning exit0 for a failed CLI.
- Calling process.exit immediately after a write; asynchronous output can be cut off.
- Ignoring every stdout error because one expected broken pipe occurred. An EPIPE caused by an intentionally closed downstream consumer needs a chosen cancellation policy; other write failures still matter.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can stdout and stderr logs always be merged into the exact source order?**</span> No. They are separate streams/sinks; buffering and the collector influence interleaving. Include correlation/time/sequence when the log contract needs it.
2. <span class="notes-section-label">**Should a pipeline prompt for interactive confirmation?**</span> Only under an explicit interface contract. Detecting a terminal with isTTY can help, but a server/job should not hang waiting for a human on piped input.
3. <span class="notes-section-label">**Does readline.close close every resource?**</span> It closes that interface; it is not a universal destroy for arbitrary underlying streams. The program must own its input/error/cancellation policy separately.

::: tip Key takeaway
Separate results from diagnostics, and treat standard streams as real resources rather than always-interactive console strings.
:::

<span id="batch-b02-progress"></span>


---

### What keeps a process alive, and how do exitCode, exit and process events differ? {#t02-q05}

*Study depth: Intermediate*

<span class="notes-section-label">**Code question — attempt first**</span>

Does this Node24 `.mjs` program print saved? What is its exit status?

```js
process.on('exit', () => {
  setTimeout(() => console.log('saved'), 0);
});
process.exitCode = 2;
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Node normally exits when no referenced runtime work keeps its event loop alive. A server, timer, active I/O or IPC channel can keep it running; **an arbitrary unresolved promise alone is not a general keep-alive mechanism**. **process.exitCode selects the eventual status without immediately stopping cleanup**. **process.exit forces termination** and can cut off asynchronous output/work.

**The exit event permits synchronous final actions, not awaited cleanup**. beforeExit can schedule more work during natural draining but is not a universal shutdown hook. A service needs an explicit signal-driven stop-admission/drain/close policy.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

The example does not print saved and naturally exits with status2. By the time exit is being processed, scheduling a timer cannot revive normal execution. Making the listener async does not make the runtime await it. Await required persistence/cleanup before reaching termination, then set the appropriate final status.

Use exit0 for success and a documented nonzero application status for failure; code2 as a usage error is this guide's convention, not a universal Node requirement.

A referenced timer keeps the process alive by default. Calling timer.unref allows it not to keep the process alive by itself; it does not cancel it. A missing output from an unreferenced timer is therefore not necessarily a timer bug. Conversely a leaked interval or open listening server can prevent a test/CLI from finishing after its apparent result.

Inspect owned resources instead of appending process.exit to hide the leak.

beforeExit is emitted when the loop naturally empties; scheduling work there can make it fire again. It is not guaranteed for forced termination, explicit exit or every crash. SIGKILL cannot be caught for cleanup.

For a POSIX service, handle SIGTERM/SIGINT once through an idempotent shutdown owner: stop admitting work, drain accepted work within a deadline, close clients/pools/server, then let the process finish. Installing a signal listener changes the default behavior; the handler must actually finish shutdown. Signal support differs on Windows.

<span class="notes-section-label">**Example — own the asynchronous boundary**</span>

```js
async function main() {
  await Promise.resolve(); // Replace with owned, bounded application work.
  console.log('work settled');
}
try {
  await main();
} catch {
  console.error('Application failed');
  process.exitCode = 1;
}
```

This ensures main's promise is observed. It does not create an overall deadline or make arbitrary cleanup succeed. The runtime foundations health service demonstrates a real bounded server stop; database/job owners require their own close/drain contracts.

After a fatal uncaught error, continuing to accept requests as though state is healthy is unsafe; report a minimal safe failure, bound cleanup and let a supervisor restart according to policy. Security-critical effects still need durable recovery, since cleanup cannot undo a remote commit.

<span class="notes-section-label">**Common mistakes**</span>

- Awaiting a database close inside exit and assuming it completed.
- Calling process.exit(0) after an error or to conceal an open handle.
- Treating a sent signal or started cleanup as proof of completed shutdown.
- Assuming every nonzero status identifies the same cause; preserve code versus terminating signal in a subprocess result.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why not use beforeExit as a service's primary stop hook?**</span> A listening service may never naturally drain, and that event does not cover every termination path. Explicit lifecycle triggers and resource owners are clearer.
2. <span class="notes-section-label">**What does unref mean for a deadline?**</span> An unreferenced timer can still fire while other work keeps the process alive. Do not unref the only owner whose completion the program must await without understanding that contract.
3. <span class="notes-section-label">**Does exit0 prove business success?**</span> Only if the program sets it according to confirmed outcomes. A swallowed rejection or unverified write can produce a false success status.

::: tip Key takeaway
Await owned work before termination; exit events and forced process termination are not asynchronous cleanup strategies.
:::


---

### Which Process APIs help diagnose a program without confusing paths, memory and timing? {#t02-q06}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

process exposes the current process's identity, environment, arguments, working directory, streams, lifecycle events and resource measurements. **Use cwd for launch-relative paths**, execPath for the selected executable, and runtime/platform metadata to reproduce a problem.

For measurement distinguish **elapsed monotonic time from CPU time** and **process RSS from JavaScript heap/external allocations**. getActiveResourcesInfo can identify resource types that keep work alive, but it is not a close-everything API. Project only necessary diagnostic fields; **environment/report dumps can contain secrets**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

The working directory belongs to the process, not the source module. Launching the same file from another directory can change path.resolve('config.json') without changing the file itself. Module-relative assets should use an explicit module location, such as new URL('./asset.txt', import.meta.url).

Calling process.chdir changes shared process state; it is a poor request-specific setting in a concurrent server.

process.pid/ppid identify the current/parent process, not an application user. process.platform and arch describe the process platform/architecture, while execPath identifies the executable actually running. These help explain why a binary dependency or path works on one machine but not another. Do not derive authorization from a PID or publish sensitive host metadata casually.

<span class="notes-section-label">**Example**</span>

```js
const start = process.hrtime.bigint();
const baseline = process.cpuUsage();
let total = 0;
for (let i = 0; i < 50_000; i++) total += i;
const cpu = process.cpuUsage(baseline);
const memory = process.memoryUsage();
console.log(JSON.stringify({
  total,
  elapsedNs: String(process.hrtime.bigint() - start),
  cpuUserMicros: cpu.user,
  cpuSystemMicros: cpu.system,
  rssBytes: memory.rss,
  heapUsedBytes: memory.heapUsed
}));
```

The sum is1249975000; timing/memory values vary. hrtime.bigint measures elapsed monotonic duration in nanoseconds; BigInt is converted explicitly because plain JSON.stringify cannot serialize it. cpuUsage reports user/system CPU microseconds, not request latency. An I/O wait can increase elapsed time while consuming little CPU.

These process-level measurements include runtime/other activity, not an isolated per-request CPU proof.

RSS (resident set size) includes resident process memory beyond the JavaScript heap. heapUsed is not the whole process footprint. Buffer backing memory contributes to external/arrayBuffers accounting; arrayBuffers is included in external, so adding every field double-counts overlapping categories.

A temporary RSS increase alone does not prove a JavaScript object leak. Retention trends, allocation/heap analysis and workload reproduction belong in the diagnostics/performance groups.

Use getActiveResourcesInfo to investigate types such as timers or sockets when a program does not exit. It does not reveal all business ownership or justify closing another module's resources. Preserve a reference to resources you create and implement disposal through their public APIs. Prefer this documented diagnostic over relying on private underscored process methods as application contracts.

<span class="notes-section-label">**Common mistakes**</span>

- Resolving a packaged file against whichever cwd a caller happened to use.
- Comparing CPU microseconds directly with wall-clock milliseconds.
- Reporting heapUsed as total memory or adding overlapping Buffer categories.
- Dumping process.env or complete diagnostic reports into a public log to find one setting.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why use a monotonic clock for elapsed duration?**</span> It avoids treating wall-clock adjustments as negative/incorrect execution duration; wall-clock timestamps still serve correlation/calendar purposes.
2. <span class="notes-section-label">**Can one request call process.chdir safely for itself?**</span> Not as request-local state. All code in the process observes the changed working directory; use explicit paths/context instead.
3. <span class="notes-section-label">**What if the CLI hangs after printing its answer?**</span> Inspect referenced timers, interfaces, server/client sockets, IPC and unfinished work against the owning module. A printed result is not a resource-disposal receipt.

::: tip Key takeaway
Process metadata and measurements are diagnostic evidence only when their scope, units, privacy and resource ownership are understood.
:::


---

### How do spawn, execFile and exec differ, and how do you handle child failures? {#t02-q07}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>



**spawn starts an executable with argument boundaries** and exposes streams, making it useful for incremental output. execFile runs a selected executable directly and usually buffers its callback output; **exec runs a command through a shell** and also buffers output. **Avoid a shell when you do not need shell features**, especially with untrusted text.

**Bound time/output/concurrency**, scope the child environment and distinguish launch errors, nonzero exit, signals and stream completion. A child is another process, not automatically a sandbox or a worker thread.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

A shell interprets operators, substitutions, redirects and quoting. Passing a filename as an argument to a fixed executable avoids that extra shell interpretation, but the executable can still interpret flags or special input. Use fixed allowlisted operations and validate semantic arguments; shell:false is not a universal input/security policy.

Batch/script invocation rules differ across operating systems, particularly Windows .cmd/.bat files.

| API | Execution/output model | Typical decision |
|---|---|---|
| spawn | Direct executable by default, streaming stdio | Large/progressive output with explicit backpressure/drain |
| execFile | Direct executable by default, callback-buffered output | Small bounded command result |
| exec | Shell command string, callback-buffered output | Trusted fixed shell composition when genuinely needed |
| Sync variants | Block the calling JavaScript thread | Bounded CLI/startup work, not an ordinary request path |

<span class="notes-section-label">**Example**</span>

Save as `child-argument.mjs`; run with no dependency installation. The suspicious-looking argument remains data:

```js
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run = promisify(execFile);
try {
  const {stdout} = await run(process.execPath, [
    '-e', 'process.stdout.write(JSON.stringify(process.argv.slice(1)))',
    '--', 'name; echo NOT_A_COMMAND'
  ], {env: {}, timeout: 1000, maxBuffer: 1024});
  console.log(stdout);
} catch {
  console.error('Child operation failed');
  process.exitCode = 1;
}
```

It prints `["name; echo NOT_A_COMMAND"]`. The child executes the fixed inline code, not the argument as shell instructions. process.execPath avoids guessing which node is on PATH. The empty environment is deliberate for this tiny self-contained child; a real approved executable may need selected platform/runtime variables.

Do not forward the entire parent environment by habit, or assume removing environment keys removes OS/filesystem/network privileges.

The promise rejects for failed launch, nonzero completion or configured timeout/output errors; inspect safe structured categories rather than returning raw command/credential output. execFile's timeout sends a termination signal under its contract: a child that ignores it or a process tree can require stronger owned supervision.

It is not an absolute kill-all-descendants deadline. Consume both streams for streaming spawn; an unread stderr pipe can fill and stall the child. Its error event covers launch problems; exit indicates process exit, while close follows closure of its stdio.

Use close when collected output/child-handle completion matters, and prevent duplicate settlement across failure events.

<span class="notes-section-label">**Common mistakes**</span>

- Using `exec('tool ' + userText)` and expecting argument validation alone to neutralize a shell.
- Ignoring stderr because the success result is on stdout, or treating any stderr text as a nonzero exit.
- Buffering unbounded command output or starting one subprocess per request without admission limits.
- Assuming sending SIGTERM guarantees the process exited or its business effect was rolled back.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Is execFile safe for an arbitrary caller-selected binary?**</span> No. Keep executable/operation authority fixed; direct invocation removes a shell layer, not all dangerous behavior.
2. <span class="notes-section-label">**Why might spawn be preferable for a media tool?**</span> Its output can be consumed incrementally without callback buffering, but you still need byte limits, backpressure, stderr consumption and process/resource isolation.
3. <span class="notes-section-label">**What does nonzero with partial stdout mean?**</span> The command failed under its status contract. Partial output is not automatically a valid complete artifact; define a staging/commit policy.

::: tip Key takeaway
Choose execution and output ownership explicitly; direct arguments, bounded resources and observed completion solve different child-process risks.
:::


---

### What does Node's fork create, and how do you build a bounded IPC exchange? {#t02-q08}

*Study depth: Advanced*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

child_process.fork starts **another Node process with an IPC channel**; it **does not clone the parent's JavaScript heap or create a worker thread**. IPC sends serialized messages between processes, so design a validated protocol with correlation, bounded payloads, deadlines and failure ownership.

A send callback means a transport-stage outcome, **not confirmed business completion**. **Observe a valid result and actual child closure**, distinguish missing/invalid results from success and close or disconnect unused channels. For repeated work a bounded pool is often better than per-item process creation, depending on workload.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

IPC means inter-process communication. The default message serialization supports a defined data contract; richer serialization is an explicit option, not arbitrary shared object identity. Mutating a parent's object after sending does not create shared-memory synchronization with the child.

A disconnected channel and an exited process are related but different events; open timers/sockets can keep a disconnected child alive.

This one-request protocol sends a bounded integer and expects one finite square result. The computation is deliberately trivial to expose lifecycle mechanics, not justify outsourcing multiplication. Copy both files into one owned directory. The parent has no caller-controlled module path or executable.

<span class="notes-section-label">**Example — square-child.mjs**</span>

```js
process.once('message', message => {
  if (!message || message.kind !== 'square' ||
      !Number.isSafeInteger(message.value) || message.value < 0 || message.value > 1_000_000) {
    process.exitCode = 2;
    process.disconnect();
    return;
  }
  process.send({kind: 'result', value: message.value * message.value}, error => {
    if (error) process.exitCode = 1;
    if (process.connected) process.disconnect();
  });
});
```

<span class="notes-section-label">**Example — fork-parent.mjs**</span>

```js
import {fork} from 'node:child_process';
async function calculate() {
  const child = fork(new URL('./square-child.mjs', import.meta.url), [], {
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'], env: {}, execArgv: []
  });
  return await new Promise((resolve, reject) => {
    let reply;
    let failure;
    const fail = () => {
      if (failure) return;
      failure = new Error('Child request failed');
      child.kill('SIGKILL'); // This owned child only; not a whole process-tree supervisor.
    };
    const timer = setTimeout(fail, 2000);
    child.on('error', fail);
    child.on('message', message => {
      if (reply !== undefined || !message || message.kind !== 'result' ||
          !Number.isSafeInteger(message.value) || message.value < 0 || message.value > 1_000_000 ** 2) {
        fail(); return;
      }
      reply = message.value;
    });
    child.once('close', (code, signal) => {
      clearTimeout(timer);
      if (failure || code !== 0 || signal || reply === undefined) {
        reject(failure ?? new Error('Child request failed'));
      } else resolve(reply);
    });
    try { child.send({kind: 'square', value: 6}, error => { if (error) fail(); }); }
    catch { fail(); }
  });
}
try { console.log(await calculate()); }
catch { console.error('Child request failed'); process.exitCode = 1; }
```

Expected successful output is36. The parent rejects on timeout, bad/duplicate result, failed startup/send, nonzero/signal termination or clean exit without a result. It waits for close before settling, so merely seeing a result does not leave child completion unowned. The timer is cleared on close.

Setting execArgv explicitly avoids accidentally inheriting a parent's inspector port; a real child may need reviewed runtime flags. Ignoring stdio here is deliberate because this protocol has no data/log contract there; a real worker needs a safe bounded diagnostic channel.

This validates selected fields/ranges, not a general hostile IPC schema or sandbox. Add exact keys/version/request IDs and finite queue/payload/concurrency budgets for multiple requests. Unknown fields/oversize messages should be rejected before expensive processing. The two-second timer is a local deadline, not proof OS termination happens instantaneously.

POSIX signal checks do not prove Windows behavior. Same-user child processes retain broad host authority unless a separate isolation boundary restricts them.

<span class="notes-section-label">**Common mistakes**</span>

- Equating Node fork with a worker thread or POSIX heap cloning.
- Resolving on send callback, exit0 alone, or a message while ignoring a later failed close.
- Leaving IPC connected after a one-shot child finishes its computation.
- Trusting child/model-supplied role/tenant fields or replacing a job budget with an IPC channel buffer.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can two forked processes share an ordinary Map?**</span> No. They have separate heaps; use explicit messages or an appropriately owned external store. Worker shared memory is another design with synchronization requirements.
2. <span class="notes-section-label">**Why is request correlation missing here?**</span> There is exactly one request per owned child. Multiplexing requests requires IDs so delayed/duplicate replies cannot complete another operation.
3. <span class="notes-section-label">**Can worker threads replace every subprocess?**</span> No. Execution/isolation, native code, memory, shared-state hazards, startup cost and failure boundaries differ. Choose after measuring the work and identifying authority/resource requirements.

::: tip Key takeaway
A forked process and its IPC protocol need independent data, deadline, failure and closure ownership.
:::

## Revision {#group2-revision}

Runtime options and script arguments are different channels. Parse environment/configuration once, use the REPL for reproducible exploration, and separate stdout results from stderr diagnostics. Process lifetime follows referenced resources, not merely promises; own asynchronous cleanup before termination.

Diagnose scope/units carefully and launch subprocesses with fixed authority, bounded output/time and observed closure. fork is another process with messages, not a thread or shared heap.

<span class="notes-section-label">**What you should be able to explain or implement**</span>

- [ ] Run scripts/inline input and explain runtime flags, argv/execArgv and shell boundaries.
- [ ] Validate configuration/defaults/precedence and keep credentials out of diagnostics.
- [ ] Reproduce a REPL finding in a clean module/test.
- [ ] Implement a composable finite-input CLI with result/error/status separation.
- [ ] Explain exitCode/exit/beforeExit/exit and referenced resources.
- [ ] Distinguish cwd/module paths, CPU/elapsed time and memory categories.
- [ ] Select execFile/spawn/exec and diagnose launch/exit/stdio failure.
- [ ] Implement a finite fork/IPC protocol and show it leaves no child/channel alive.

<span class="notes-section-label">**Mixed practice — attempt all first**</span>

1. `node app.mjs --inspect` runs without a debugger. Why?
2. FEATURE_ENABLED=false enables a feature through Boolean(...). What contract should replace it?
3. A test prints its final assertion but never exits. What do you inspect before forcing termination?
4. A child writes stderr but exits0. Is it necessarily a failed command?
5. A forked child exits0 without sending a reply. Should the parent resolve undefined as success?

<span class="notes-section-label">**Practice answers**</span>

1. --inspect is after the entry and reaches the application as an argument; put a deliberately restricted runtime inspector flag before the entry. Do not expose the debugger publicly.
2. Accept an explicit boolean string set and reject malformed values. Apply a default only for absence and compare to the exact accepted true value.
3. Referenced timers, interfaces, sockets, IPC and unsettled owned work. Trace their owners and cleanup rather than conceal leaks with process.exit.
4. No. stderr is a channel; the command's documented status/result semantics determine success. A failed launch/nonzero/signal is a separate outcome from diagnostic text.
5. No. The protocol requires a valid result and successful closure. Clean missing-result exit is a protocol failure; preserve the operation's unknown/outcome policy instead of inventing a value.

Official references checked2026-11-04: [Node24.18 CLI](https://nodejs.org/download/release/v24.18.0/docs/api/cli.html), [Process API](https://nodejs.org/docs/latest-v24.x/api/process.html), [REPL](https://nodejs.org/download/release/v24.18.0/docs/api/repl.html), [child processes](https://nodejs.org/download/release/v24.18.0/docs/api/child_process.html). APIs used here were exercised on the stated local Node24.18 runtime; do not assume latest online documentation matches every older runtime.

<span id="batch-b03-progress"></span>

