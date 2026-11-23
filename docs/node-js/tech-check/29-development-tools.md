---
outline: [2, 3]
---

# Development tools and IDE workflows

Examples use Node.js 24.18.0 and npm 11. These five questions cover build/test/serve, linting, formatting, routine configuration and IDE debugging. Complete the exercise yourself after working through the example.

<!-- tech-check: t29-q01; level: 2 -->

### How do package scripts connect a tested build to a running service?

*Study depth: Intermediate*

Level Up: L1 — Junior\
Tech Check level: ⭐

Source mapping: [R023](./requirements.md#r023), [R028](./requirements.md#r028).


<span class="notes-section-label">**Example — identify which command keeps running**</span>

Start with the complete isolated build-study fixture from [related explanation](./04-package-management.md#t04-q07): src/add.mjs, build.mjs, checks/add.test.mjs and verify.mjs. Its build copies the module to dist, and its test imports that emitted module. In that disposable fixture only, use this package.json and add serve.mjs below. No dependency installation is required.


```json
{
  "name": "build-study",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node build.mjs",
    "test": "node --test checks/add.test.mjs",
    "verify": "node verify.mjs",
    "prestart": "npm run build && npm test",
    "start": "node serve.mjs",
    "serve": "npm start"
  }
}
```

Save as `serve.mjs` beside that manifest. What happens if the emitted-artifact test fails? Does the ready line mean the service has already terminated?

```js
import { createServer } from 'node:http';
import { add } from './dist/add.mjs';
const rawPort = process.env.PORT ?? '0';
if (!/^\d{1,5}$(?![\s\S])/.test(rawPort) || Number(rawPort) > 65535) {
  console.error('Invalid PORT');
  process.exitCode = 2;
} else {
  let stopping = false;
  const server = createServer((request, response) => {
    if (request.method !== 'GET') {
      response.writeHead(405, { Allow: 'GET' }).end(); return;
    }
    if (request.url !== '/sum') { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ value: add(2, 3) }));
  });
  server.headersTimeout = 1000;
  server.requestTimeout = 2000;
  server.keepAliveTimeout = 500;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => {
      process.exitCode = 1;
      server.closeAllConnections();
    }, 1000);
    server.close(error => {
      clearTimeout(deadline);
      if (error) process.exitCode = 1;
      process.off('SIGTERM', stop);
      process.off('SIGINT', stop);
      console.log('stopped');
    });
  };
  server.on('error', () => {
    console.error('Server startup/runtime error');
    process.exitCode = 1;
    if (server.listening) stop();
  });
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
  server.listen(Number(rawPort), '127.0.0.1', () => {
    console.log(JSON.stringify({ event: 'ready', port: server.address().port }));
  });
}
```

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Package scripts name commands for different stages. **Build produces the files to run; tests check behavior; start launches the service.** In this example, `npm start` runs `prestart` first: the build must pass, then the tests must pass, before the server starts.

**Print a readiness message only after the server is listening.** The service then keeps running until its active resources close. Use a smoke check with a time limit to request an endpoint and confirm shutdown. A build passing or a process starting does not, by itself, prove that the service is ready for deployment or will shut down correctly.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

Run npm start or npm run serve in the owned fixture. npm runs prestart before start under ordinary script policy. The shell's && gates the test after build; npm also prevents start when prestart fails. The finite build/test stages should exit, while the serve stage intentionally remains active.

Do not put a permanent server before tests in a sequential verification command and expect the next command to run. Do not start build and serve concurrently with a shell background operator: that can serve stale or missing output.

The ready line contains the actual loopback port allocated by the OS. Once it appears, request GET /sum at that port: expect status 200 and {value:5}. Other paths/methods have separate 404/405 outcomes. This narrow smoke check exercises the imported emitted module through HTTP; the existing unit test still verifies its arithmetic independently.

A port printed before listen completes could falsely report readiness when binding later fails. This example's readiness means only that the local teaching service is listening, not that a real application's database/authentication/migrations are ready.

To prove the gate, deliberately change src/add.mjs to subtract, then run npm start. Build can succeed while test fails; no ready line or server should appear. Restore the source afterward. Remove dist/add.mjs and run node serve.mjs directly: loading fails, showing that bypassing the package lifecycle also bypasses its build prerequisite.

Changing the package test script to always succeed would hide the defect rather than repair the service.

For shutdown, send SIGTERM to the owned Node service process in a Unix-like fixture. The idempotent handler stops acceptance, closes existing ordinary HTTP connections under a deadline and lets the process exit. It owns no database/job/WebSocket resources; those would require additional drain/close owners.

A blocked JavaScript thread can delay both shutdown and its timer, so **an external supervisor still needs a final deadline**. npm/shell process trees and signal forwarding vary; a test must supervise the actual child or its owned process group, not assume signalling a wrapper reaches every descendant. Windows signal behaviour needs its own test.

This example keeps an explicit ordinary prestart lifecycle. npm's ignore-scripts policy suppresses pre/post hooks even when an explicit start command still runs, so it is not a security boundary or a universal CI gate.

CI should invoke the required build/test checks explicitly and promote the same reviewed artifact; do not depend on undocumented hooks. npm restart and watch-mode tools also have their own lifecycle semantics. Before changing scripts, inspect existing names, output paths, module mode, local tool versions, failure statuses and the project contract.

<span class="notes-section-label">**Common mistakes**</span>

- Waiting for a long-running serve command to finish before running the next test stage.
- Reporting a spawned process as ready or ignoring the artifact it actually imports.
- Bypassing hooks with direct node/ignore-scripts invocation and assuming prestart still protected the workflow.
- Killing only npm while leaving the service alive, or forcing exit to conceal leaked resources.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Is prestart a bundler?**</span> No. It coordinates commands; the build implementation produces output and a bundler/compiler has its own configuration.
2. <span class="notes-section-label">**Should production rebuild on every restart?**</span> Not necessarily. This is a local study workflow. A deployment normally starts an already built/tested immutable artifact and configures its environment separately.
3. <span class="notes-section-label">**Does changing PORT require a source rewrite?**</span> No. Set a validated environment value for the process; this example permits 0 for an ephemeral fixture and rejects malformed/out-of-range text.

::: tip Key takeaway
Keep build, test, readiness and shutdown as explicit stages with observable outcomes and an owner for the running service.
:::

## Small-batch learner practice {#small-batch-learner-practice}

- [ ] Recreate the linked build fixture and run npm start; capture build/test success before the ready line and GET /sum returning 5.
- [ ] Introduce the subtracting defect and prove startup is blocked, then restore it. Also test missing output, malformed PORT and an occupied port.
- [ ] Supervise a real owned service child: await readiness, perform the request, send termination and verify exit/closed sockets. Include an external watchdog so a defect cannot hang the exercise.

Acceptance: assert stage order, emitted-artifact behaviour, failure exit/no-ready cases, HTTP status/body and actual termination.

Official references checked 2026-11-04: npm 11 [script lifecycle and ignore-scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts/); Node 24.18 [HTTP server close](https://nodejs.org/download/release/v24.18.0/docs/api/http.html#serverclosecallback), [test runner](https://nodejs.org/download/release/v24.18.0/docs/api/test.html). This lesson extends [related explanation](./04-package-management.md#t04-q07), preserving its earlier answer and verification history.

<span id="next-checkpoint"></span>


---

<!-- tech-check: t29-q02; level: 2 -->

### How do you configure lint execution and change one rule without hiding defects?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐

Source mapping: [R165](./requirements.md#r165).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Linting checks selected files against configured code rules without running the application. **A rule change must check the intended files and catch the intended problem.** Check the installed tool version, configuration format, file patterns and whether a violation is a warning or an error.

Try an example that should fail, then fix it and confirm it passes. **Disabling a rule changes what you check; it does not fix the code's behavior.** Ignoring a file also changes the checking policy, so make that choice deliberately.

</div>

<span class="notes-section-label">**Reuse one owned fixture**</span>

Use the complete [existing quality-standard lab](../../senior_growth/Clean_code_and_Code_Quality/What_is_code_standard_What_code_standard_is_on_your_current_project_Should_we_always_work_by_code_standard_Have_you_used_linters_and_do_you_have_any_experience_in_configuring_them.md#minimal-executable-standard). It contains package.json, ESM JavaScript/JSDoc source, a behavior test and separate typecheck/build configurations. Copy it into an owned learning directory, preserving the original source notes. Keep the lab’s lockfile. No React/TS parser/plugin is required for this plain-JS scope.

Its `eslint.config.mjs` is a flat config:

```js
// file: eslint.config.mjs
export default [
  { ignores: ['dist/**', 'coverage/**'] },
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
];
```

Run `npm run lint` using the existing `eslint src --max-warnings=0` script. The `files` pattern is the source-policy scope, while the standalone ignore object excludes owned generated output. Configuration/fixture test files need their own intentional scope if you want to lint them; this example does not claim every repository file was checked.

<span class="notes-section-label">**A repeatable rule change**</span>

In an owned `src/equality.js`, write `export const same = (a, b) => a == b;`. Run lint: `eqeqeq` should reject it. Read whether coercive equality is actually intended, then use `===` for this strict-comparison contract and rerun. A generic truthiness substitution is not equivalent. Some lint suggestions cannot be safely autofixed because changing coercion changes behavior.

For configuration diagnosis, run `npm exec -- eslint --print-config src/equality.js` and inspect the effective rule. Use `--debug` for discovery/ignore investigation, with paths/log content reviewed before sharing. Flat-config composition can change the effective result; do not assume an old `.eslintrc` tutorial or a globally installed tool describes this fixture. For TypeScript source, install a compatible parser/plugin and scope it deliberately; TypeScript annotations alone do not make the JS configuration parse `.ts`.

Warnings normally differ from errors; `--max-warnings=0` makes any warning fail this gate too. Distinguish a reported rule violation from missing config/parser/tool invocation errors. An exit status alone does not identify the cause. Review proposed `--fix` changes and rerun behavioral checks; static rules cannot prove authorization, transaction or business correctness.

<span class="notes-section-label">**Common mistakes**</span>

Changing only an editor setting leaves CI unchanged. Running from the wrong package can discover another configuration. A wrong glob can make a clean result meaningless. Blanket ignore/disable comments can conceal regressions. A formatter fixes whitespace, not a loose-equality or undefined-variable defect.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can lint pass while the program is wrong?**</span> Yes. A subtraction bug can satisfy every configured static rule; behavior tests exercise a different contract.
2. <span class="notes-section-label">**Why use print-config?**</span> It verifies the effective configuration for one actual path, rather than guessing from a file you think applies.

::: tip Key takeaway
Prove the rule, file scope and failure reason before calling a lint-policy change complete.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Reproduce the loose-equality failure and repair; add an unused declaration and verify a separate failure. Acceptance: retain effective config, rule names, command status, source diff and passing rerun. Explain a defect the selected rules cannot detect.

<span class="notes-section-label">**Official references**</span>

[ESLint flat configuration](https://eslint.org/docs/latest/use/configure/configuration-files), [eqeqeq](https://eslint.org/docs/latest/rules/eqeqeq), [CLI and configuration diagnosis](https://eslint.org/docs/latest/use/command-line-interface). Use documentation matching your pinned version; latest documentation can include later options.

---

<!-- tech-check: t29-q03; level: 2 -->

### How do formatting, linting, typechecking and tests complement one another?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐

Source mapping: [R165](./requirements.md#r165), [R166](./requirements.md#r166).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Each tool checks a different aspect of the code. A formatter keeps spacing and layout consistent. A linter checks configured code rules. A type checker checks whether values and operations fit the declared types. Tests run selected examples and check their results.

**Passing one check does not mean the others will pass.** Make each command easy to run on its own. **Keep formatting changes separate from behavior changes** so a reviewer can see what actually changes the program.

</div>

<span class="notes-section-label">**Configure one formatter in the owned lab**</span>

Add Prettier 3.6.2 as an exact dev dependency in the same disposable quality fixture (`npm install --save-dev --save-exact prettier@3.6.2`). Retain its updated lockfile.

Save `.prettierrc.json`:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 90
}
```

Save `.prettierignore`:

```text
node_modules/
dist/
coverage/
```

Add only these new scripts to the fixture's existing scripts object:

```json
{
  "format:check": "prettier --check \"src/**/*.js\" \"test/**/*.js\"",
  "format:write": "prettier --write \"src/**/*.js\" \"test/**/*.js\""
}
```

`--check` reports drift without rewriting source; `--write` changes matched files. Quoted globs let the tool expand the pattern consistently rather than depend on shell expansion. These test files belong to the owned study fixture; **never use write/fix commands on protected `src/tests`**. Keep ignored output outside the source-of-truth check.

Run check, inspect the named unformatted file, then run the narrowly scoped write command and inspect the diff. Rerun formatting and behavioral checks. Formatting changes should be idempotent: a second formatting pass should make no further content change. Editor format-on-save should use the same project configuration/version as the CLI, not a conflicting global default.

| Negative control | Expected failure | Why the others can still pass |
|---|---|---|
| Inconsistent spacing/quotes | Format check | Presentation can be inconsistent yet valid/executable |
| Undefined name or loose equality | Selected lint rule | Formatting preserves those tokens/semantics |
| `add('wrong', 1)` in checked JS | Typecheck | Plain syntax/lint can accept it; runtime input validation remains separate |
| Return subtraction instead of addition | Behavior test | Syntax, formatting and numeric types can all remain valid |

Our deliberately small ESLint ruleset has no competing layout rules, so no integration plugin is needed. A broader preset may require `eslint-config-prettier` to disable conflicting style rules. Running Prettier as a lint rule is an alternative with trade-offs, not the default requirement. Avoid two tools repeatedly undoing each other's formatting.

<span class="notes-section-label">**Common mistakes**</span>

A formatter is not a compiler, security scanner or schema validator. `printWidth` is a formatting preference, not a universal hard maximum for every line. Formatting an entire unrelated repository can bury the actual change. Disabling a check globally to make one file pass changes policy and can conceal future drift.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can a beautifully formatted function be wrong?**</span> Yes; the subtraction negative control demonstrates it.
2. <span class="notes-section-label">**Why not always use --write in CI?**</span> A verification gate should report an unreviewed difference rather than silently produce a different artifact/source tree.
3. <span class="notes-section-label">**Does typechecking validate an incoming HTTP body?**</span> No. Runtime input/schema validation is still required at that boundary.

::: tip Key takeaway
Give each check one clear purpose and prove its failure independently.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Introduce formatting drift, observe check failure, format only the intended files and verify idempotence. Then introduce a behavioral defect that formatting accepts. Acceptance: record which gate detects each defect, preserve useful configuration and explain any excluded/generated paths.

<span class="notes-section-label">**Official references**</span>

[Prettier CLI](https://prettier.io/docs/cli), [configuration](https://prettier.io/docs/configuration), [lint integration](https://prettier.io/docs/integrating-with-linters), [TypeScript checkJs](https://www.typescriptlang.org/tsconfig/checkJs.html).

---

<!-- tech-check: t29-q04; level: 2 -->

### How do you make a routine tool change and diagnose which gate actually failed?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐

Source mapping: [R028](./requirements.md#r028), [R165](./requirements.md#r165).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A tool configuration change changes the development workflow, so check what the tool actually runs before editing its settings. **Identify the command, working directory, included files, tool version and generated output.** A check can pass simply because it never examined the intended file.

Change one cause at a time and preserve the task template's required behavior. **Show that the intended problem fails the check before the fix and passes afterward.** Fix the cause rather than skipping or weakening the check that found it.

</div>

<span class="notes-section-label">**An explicit local verification chain**</span>

In the owned quality fixture only, extend `check` to include formatting:

```json
{
  "check": "npm run format:check && npm run lint && npm run typecheck && npm test && npm run build"
}
```

Each finite command must return its real status. `&&` stops at the first failure; it does not run the later checks for you after that failure. CI may instead run independent jobs to collect multiple results, but required failed jobs must still block acceptance. Do not append a command that always succeeds, swallow subprocess status or weaken tests to make the chain green.

The existing JSDoc fixture typechecks JS with `allowJs`, `checkJs`, `strict` and `noEmit`. Its build extends that configuration and turns emission on with `outDir: 'dist'`. This is a configuration relationship, not an instruction to put these options into every app. TypeScript module/target settings must match the actual runtime and module format. Lint config, compiler config and formatter config have separate schemas and responsibilities.

<span class="notes-section-label">**Diagnose by observation**</span>

| Symptom | First checks | Focused repair |
|---|---|---|
| Tool works in terminal but not editor | Local executable/version, package root, editor working directory | Align the integration with the intended workspace/package |
| Changed source is never checked | File glob, ignore rules, package script inputs | Include the intended source, verify with a negative control |
| Correct source but stale running output | Build entry/output, start import path, watch mode | Build and run the intended emitted artifact |
| Lint/type errors in generated output | Input globs and generated-output ownership | Check sources; exclude owned output intentionally |
| Module/config load failure | ESM/CJS mode, filename extension, installed major version | Fix configuration loading rather than disable rules |
| Start never reaches the next check | Long-lived serve/watch command in a sequential chain | Supervise service readiness/smoke/shutdown separately |

Inspect `npm run`, local tool `--version`, effective config and one exact file path. A monorepo/package workspace can have different roots and versions; do not assume the terminal and editor are looking at the same package. Reproduce without the editor before blaming its cache.

A watch process deliberately stays alive. A build may succeed while a stale service keeps serving an earlier artifact. Reuse [the existing build/test/serve ownership lesson](#t29-q01) for readiness and shutdown; do not start another unowned background server as a “fix.”

<span class="notes-section-label">**Negative controls that protect configuration**</span>

1. Append `add('wrong', 1)` to the owned checked JS source. Format it, then verify lint can pass while typecheck rejects the numeric contract. Restore it.
2. Change addition to subtraction. Verify formatting/lint/typecheck pass while the behavior test fails. Restore it.
3. Run the full chain, then import `dist/add.js` and assert addition again. The fixture's original test imports source; this separate smoke check verifies the emitted export too.

A local hook or `prestart` can be bypassed. Run the same checks in CI.

<span class="notes-section-label">**Common mistakes**</span>

A broad upgrade to fix one file-matching error adds unrelated uncertainty. Deleting a lockfile can change many dependencies without fixing the root cause. Reformatting output can hide that the wrong artifact is being checked. A successful script with no matched source files is not evidence of source correctness.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why test the emitted module if source tests passed?**</span> Build configuration and packaging can select or transform different content; identify the artifact actually shipped.
2. <span class="notes-section-label">**Does the chain always run every check?**</span> No. It stops at the first failed stage; report what actually ran.
3. <span class="notes-section-label">**Should routine configuration work require a new tool?**</span> Usually not. First fix the existing tool's path/scope/options and justify any added dependency.

::: tip Key takeaway
Treat workflow configuration as code: small diff, effective-setting evidence, negative control and a passing rerun.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Make one scoped lint/format/typecheck setting change. Acceptance: state the original symptom, show effective settings and the intended failure, repair without suppressing its contract, run all applicable gates and verify the emitted artifact. Record commands that did not run after an earlier failure.

<span class="notes-section-label">**Official references**</span>

[npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts/), [TypeScript configuration](https://www.typescriptlang.org/tsconfig/), [ESLint configuration diagnosis](https://eslint.org/docs/latest/use/configure/debug), [Prettier configuration](https://prettier.io/docs/configuration).

---

<!-- tech-check: t29-q05; level: 2 -->

### How do IDE navigation, refactoring and breakpoints help diagnose a Node application?

*Study depth: Intermediate*

Level Up: L1 — Junior\
Tech Check level: Related ⭐⭐

Source mapping: [R018](./requirements.md#r018), [R049](./requirements.md#r049).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Use Go to Definition and Find References to locate an implementation and its callers. Refactoring tools can update related uses together, but review the proposed edits. A debugger lets you pause a real run, inspect variables and follow calls.

**A breakpoint shows what happened on one execution path.** It does not prove every path works. Check that you are debugging the intended process and built files, with matching source maps when needed. Run tests after the fix and verify it without the debugger too. Debugger access is powerful, and inspected values may contain secrets.

</div>

<span class="notes-section-label">**Start from one reproducible input**</span>

In the owned quality fixture, add `debug-entry.mjs`:

```js
// file: debug-entry.mjs
import { add } from './src/add.js';
const left = 2;
const right = 3;
const result = add(left, right);
console.log({ result });
```

Open only the owned fixture as a workspace. Use Go to Definition on `add`, Find References to see its users, and inspect the exported function and JSDoc numeric contract. Workspace text search complements symbol navigation for configuration strings/dynamic names. Preview a symbol rename across source and test before accepting it; a textual replacement can miss dynamic uses or change unrelated strings. Rerun the established gates after refactoring.

<span class="notes-section-label">**A concrete VS Code launch configuration**</span>

Save this in the fixture's `.vscode/launch.json`; do not replace another project's debug configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Owned arithmetic study",
      "program": "${workspaceFolder}/debug-entry.mjs",
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

Place a breakpoint on `return a + b` in `src/add.js`, start the configuration and inspect the call stack and `a`/`b` locals. Step out to observe the result in the caller. A conditional breakpoint `a === 2` narrows a repeatable case; exception breakpoints help stop near a throw before a catch translates it. Watch expressions and debug-console evaluation can execute code, so avoid expressions with side effects, expensive getters or private-value logging.

If a breakpoint is unbound, verify the launched program, working directory and loaded source. For compiled TypeScript, build the expected output and configure appropriate source maps/output paths. A map must refer to the actual running artifact; stale output or an unrelated Node child explains many “breakpoint never hits” reports. Launching a package-script wrapper is not always the same as debugging its service child.

For a service, trigger one controlled request after listening and inspect the service boundary. Pausing can delay timers and network responses; a debugger can change the timing of a race. Use controlled concurrency tests/traces to establish races rather than infer their absence from one stepped request. Keep safe diagnostic IDs/codes and redact credentials/customer values from retained evidence.

<span class="notes-section-label">**Scope and access**</span>

The ordinary launch workflow starts the owned process under a debugger. An explicit `node --inspect`/`--inspect-brk` flow has different start/pause behavior and an inspector endpoint. Keep debugger access local and deliberate; do not expose it through a public bind/tunnel or disable authentication/network protections to simplify attaching. The inspector can inspect/execute powerful process operations. Stop the owned debug process and release resources when finished.


<span class="notes-section-label">**Common mistakes**</span>

A successful symbol rename is not proof every runtime/configuration reference changed. A logpoint can leak values just like console logging. Attaching to the wrong process yields misleading evidence. Fixing a timing bug by stepping more slowly is not a fix. Do not force-exit a debugged service to conceal unclosed pools/timers.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Why prefer a reproducible input over many speculative logs?**</span> It lets you test a specific hypothesis and compare the actual failure/fix under the same conditions.
2. <span class="notes-section-label">**Does source-map support rebuild output?**</span> No. Mapping and compilation are separate; verify the current emitted artifact first.
3. <span class="notes-section-label">**Can a debug-console expression alter the bug?**</span> Yes. It can mutate state, invoke getters or change timing; inspect deliberately and document relevant effects.

::: tip Key takeaway
Follow the actual call path, inspect a bounded case and verify the repair outside the debugger too.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Navigate to the implementation, preview a coordinated rename, run the gates, then pause a controlled call and record safe arguments/call stack/result. Introduce a subtraction defect and use a conditional breakpoint to explain it, repair it and rerun tests without the debugger. Acceptance: correct process/source, intentional breakpoint, no secret capture, safe shutdown and actual IDE evidence. Compiled/source-map or remote workflows need their own checks before claiming them.

<span class="notes-section-label">**Official references**</span>

[VS Code Node debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging), [official documentation source](https://github.com/microsoft/vscode-docs/blob/main/docs/nodejs/nodejs-debugging.md), [refactoring](https://code.visualstudio.com/docs/editing/refactoring), [Node 24 Inspector](https://nodejs.org/download/release/v24.18.0/docs/api/inspector.html). Official site debugging fetch timed out during this review; the maintained Microsoft documentation source was checked instead.

---

<!-- tech-check: t29-q06; level: 2 -->

### How do you diagnose a problem in a remote Node.js process?

*Study depth: Advanced*

Level Up: L4 — Lead\
Tech Check level: Related ⭐⭐

Source mapping: [R081](./requirements.md#r081).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**First identify the failing process and the exact build it runs.** Use logs and deployment information, then reproduce the issue on an isolated staging copy before pausing it with a debugger.

Node's Inspector is its debugging interface. **Bind Inspector to loopback and connect through an authenticated private connection** when attaching from your computer. This prevents exposing a powerful debugging endpoint publicly. Check that the loaded source matches the deployed build, avoid recording secrets, and close the debugging connection when finished.

</div>

For a staging exercise, deploy a copy of your own service with a synthetic configuration error. Record the artifact revision and process identity. Start the isolated replica with Inspector bound to its loopback interface, then attach through your environment’s approved private forwarding mechanism. Use a breakpoint immediately before configuration validation and check the value’s type and which branch runs. Keep secret values out of logs and screenshots.

Compare the loaded source with the deployed artifact. A breakpoint in the wrong checkout or an unmatched source map can send you to the wrong line. If the replica starts with a break-on-entry flag, resume execution before expecting application readiness. When done, disconnect, stop the replica and verify the debugging listener is closed. [Node.js debugging and Inspector security](https://nodejs.org/en/learn/getting-started/debugging).

---

<!-- tech-check: t29-q07; level: 2 -->

### How do you trace an async failure across a service and its dependency?

*Study depth: Intermediate*

Level Up: L4 — Lead\
Tech Check level: Related ⭐⭐

Source mapping: [R082](./requirements.md#r082).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Use the same request ID to follow one request through the service and its dependency calls.** Include it in relevant logs so you can connect events that happen at different times.

A stack trace shows where an error was thrown or reported. Preserve the original error with `cause` when adding context, such as which service operation failed. The request ID connects the records; the cause helps explain the underlying failure. Keep detailed diagnostics in controlled logs and return a stable, safe public error.

</div>

```js
async function readInventory() {
  await Promise.resolve();
  throw new Error('Inventory lookup timed out');
}

async function loadProduct() {
  try {
    return await readInventory();
  } catch (cause) {
    throw new Error('Product could not be loaded', { cause });
  }
}

try {
  await loadProduct();
} catch (error) {
  console.log(error.message);
  console.log(error.cause.message);
}
```

The first line identifies the failed operation. The second identifies the dependency failure. In this example, removing `await` inside the `try` returns the dependency’s promise before it rejects, so the catch block no longer adds context. In a service, include the same request ID in the entry, dependency and failure records. Report a stable public error and retain diagnostic details in controlled logs.

---

<!-- tech-check: t29-q08; level: 2 -->

### How do you find why a framework application fails to start?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: Related ⭐⭐

Source mapping: [R127](./requirements.md#r127).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**Find the last startup step that succeeded**, then inspect the next step. Check module loading, configuration validation, dependency setup and opening the listening port in that order.

Use the same command and built files as the service. A missing module needs path or dependency checks; invalid settings need validation checks; `EADDRINUSE` means something already uses the address or port. Once listening succeeds, a readiness check must still confirm the service can do its required work.

</div>

Run the same command and artifact that the service uses. If a module fails to load, check the entry path, package type and installed dependency. If validation fails, check which configuration keys are present and validate their types. If the server reports `EADDRINUSE`, check the configured host and port and identify the listener before changing anything. Once the server is listening, use a readiness check to distinguish a reachable process from a usable service.

In your owned Express project, supply an invalid port and verify that validation stops startup with a clear error. Restore it, then use a second copy of your own service to occupy the port. Verify that the listen error is distinguishable from the configuration error and that both processes can be stopped cleanly.

---

<!-- tech-check: t29-q09; level: 2 -->

### How do you document a JavaScript function with JSDoc?

*Study depth: Foundational*

Level Up: L1 — Junior\
Tech Check level: ⭐⭐

Source mapping: [R021](./requirements.md#r021).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

JSDoc is a structured comment beside a JavaScript function. **Describe what the function accepts, returns and may throw.** Use `@param` for parameter types and meanings, `@returns` for the result, and `@throws` for expected errors. Explain units too, such as milliseconds rather than just “number.”

Editors and configured static checks can use these annotations to spot mistakes. **JSDoc does not validate incoming values at runtime.** The function still needs checks for invalid input when its callers cannot be trusted to supply valid values.

</div>

```js
// @ts-check

/**
 * @param {number} seconds - A finite, nonnegative duration in seconds.
 * @returns {number} The duration in milliseconds.
 * @throws {RangeError} If seconds or the result is outside the supported range.
 */
function toMilliseconds(seconds) {
  const milliseconds = seconds * 1000;
  if (!Number.isFinite(seconds) || seconds < 0 || !Number.isFinite(milliseconds)) {
    throw new RangeError('Duration is outside the supported range');
  }
  return milliseconds;
}

console.log(toMilliseconds(2.5));
```

The example prints `2500`. In your editor or project’s JavaScript type check, try a string argument and observe the diagnostic. Then run with a negative number to see a runtime check that the `number` annotation alone cannot express. [TypeScript JSDoc reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html).

---

<!-- tech-check: t29-q10; level: 3 -->

### How do OpenAPI and Swagger UI document a real HTTP contract?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R055](./requirements.md#r055), [R177](./requirements.md#r177).



<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

**OpenAPI describes an HTTP API's methods, paths, inputs and possible responses.** It tells clients what they can send and what they should expect back. Swagger UI displays that description as browsable documentation.

**A contract test checks that the running implementation matches the documented agreement.** For example, it can check a response's status, content type and body shape. Documentation alone does not enforce the API's behavior or verify credentials; the application must implement those rules.

</div>

```yaml
openapi: 3.1.0
info:
  title: Study Log API
  version: 1.0.0
paths:
  /health:
    get:
      operationId: getHealth
      responses:
        '200':
          description: The process is running
          content:
            application/json:
              schema:
                type: object
                required: [status]
                properties:
                  status:
                    const: ok
```

Load the document in Swagger UI and inspect the documented status and body. In an owned Express fixture, implement the route and make an HTTP test assert the status, content type and response body against the contract. Change the response to `{ status: 'ready' }` and verify the test catches the drift. For application routes, describe expected failure responses too. A security scheme describes how a client supplies credentials, while the service verifies them.

[OpenAPI 3.1 specification](https://spec.openapis.org/oas/v3.1.0.html).

---

## Tooling revision and practice

- [ ] Reproduce the build/test/serve gate and supervise readiness/shutdown.
- [ ] Make a scoped lint-rule change with effective-config and negative-control evidence.
- [ ] Repair formatting drift and prove idempotence without hiding a behavior defect.
- [ ] Diagnose a type error and a behavioral error at different gates; inspect the emitted artifact.
- [ ] Complete the real IDE navigation/refactor/breakpoint exercise and retain redacted evidence.

Acceptance is your reproducible work and explanation, not the existence of these notes. Specialized IDE features and alternative lint/test frameworks remain optional extensions unless your project requires them.
