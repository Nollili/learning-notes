---
outline: [2, 3]
---

# Development tools and IDE workflows

Examples use Node.js 24.18.0 and npm 11. These five questions cover build/test/serve, linting, formatting, routine configuration and IDE debugging. Complete the exercise yourself after working through the example.

### How do package scripts connect a tested build to a running service? {#t29-q01}

*Study depth: Intermediate*

<span class="notes-section-label">**Example — identify which command keeps running**</span>

Start with the complete isolated build-study fixture from [related explanation](./04-package-management.md#t04-q07): src/add.mjs, build.mjs, checks/add.test.mjs and verify.mjs. Its build copies the module to dist, and its test imports that emitted module. In that disposable fixture only, use this package.json and add serve.mjs below. No dependency installation is required.

Do not replace this repository's scripts or an Autocode template's Jest/build/coverage configuration.

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

Package scripts name separate lifecycle stages. **Build creates the artifact, test verifies its behaviour**, and serve/start opens the long-lived process that uses it. In this fixture npm start first runs prestart: **build must succeed, then test must succeed before the server launches**.

The server **prints readiness only after binding successfully**; it keeps running until its owned resources close. Use a bounded smoke check to verify the live endpoint and shutdown. A successful build, spawned process or ready line is **not the same as a completed service run or deployment readiness**.

</div>

<span class="notes-section-label">**Detailed explanation**</span>

Run npm start or npm run serve in the owned fixture. npm runs prestart before start under ordinary script policy. The shell's && gates the test after build; npm also prevents start when prestart fails. The finite build/test stages should exit, while the serve stage intentionally remains active.

Do not put a permanent server before tests in a sequential verification command and expect the next command to run. Do not start build and serve concurrently with a shell background operator: that can serve stale or missing output.

The ready line contains the actual loopback port allocated by the OS. Once it appears, request GET /sum at that port: expect status200 and {value:5}. Other paths/methods have separate404/405 outcomes. This narrow smoke check exercises the imported emitted module through HTTP; the existing unit test still verifies its arithmetic independently.

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
3. <span class="notes-section-label">**Does changing PORT require a source rewrite?**</span> No. Set a validated environment value for the process; this example permits0 for an ephemeral fixture and rejects malformed/out-of-range text.

::: tip Key takeaway
Keep build, test, readiness and shutdown as explicit stages with observable outcomes and an owner for the running service.
:::

## Small-batch learner practice

- [ ] Recreate the linked build fixture and run npm start; capture build/test success before the ready line and GET /sum returning5.
- [ ] Introduce the subtracting defect and prove startup is blocked, then restore it. Also test missing output, malformed PORT and an occupied port.
- [ ] Supervise a real owned service child: await readiness, perform the request, send termination and verify exit/closed sockets. Include an external watchdog so a defect cannot hang the exercise.

Acceptance: assert stage order, emitted-artifact behaviour, failure exit/no-ready cases, HTTP status/body and actual termination. Do not change protected tests or infer learner completion from the author's fixture checks.

Official references checked2026-11-04: npm11 [script lifecycle and ignore-scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts/); Node24.18 [HTTP server close](https://nodejs.org/download/release/v24.18.0/docs/api/http.html#serverclosecallback), [test runner](https://nodejs.org/download/release/v24.18.0/docs/api/test.html). This lesson extends [related explanation](./04-package-management.md#t04-q07), preserving its earlier answer and verification history.

<span id="next-checkpoint"></span>


---

### How do you configure lint execution and change one rule without hiding defects? {#t29-q02}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Linting applies configured static rules to selected files. **A useful rule change must affect the intended files and fail for the intended defect.** Inspect the installed version, configuration mode, file matching and severity; prove both a failing example and its repair. **Disabling a rule or ignoring a file is a policy change, not a behavioral fix.**

</div>

<span class="notes-section-label">**Reuse one owned fixture**</span>

Use the complete [existing quality-standard lab](../../senior_growth/Clean_code_and_Code_Quality/What_is_code_standard_What_code_standard_is_on_your_current_project_Should_we_always_work_by_code_standard_Have_you_used_linters_and_do_you_have_any_experience_in_configuring_them.md#minimal-executable-standard). It contains package.json, ESM JavaScript/JSDoc source, a behavior test and separate typecheck/build configurations. Copy it into an owned learning directory, preserving the original source notes. This chapter's validation uses ESLint10.13.0, TypeScript5.9.3, Node24.18.0 and npm11; keep its lockfile. No React/TS parser/plugin is required for this plain-JS scope.

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

Run `npm run lint` using the existing `eslint src --max-warnings=0` script. The `files` pattern is the source-policy scope, while the standalone ignore object excludes owned generated output. Configuration/fixture test files need their own intentional scope if you want to lint them; this example does not claim every repository file was checked. Do not point a formatter/fixer at protected Autocode tests.

<span class="notes-section-label">**A repeatable rule change**</span>

In an owned `src/equality.js`, write `export const same = (a, b) => a == b;`. Run lint: `eqeqeq` should reject it. Read whether coercive equality is actually intended, then use `===` for this strict-comparison contract and rerun. A generic truthiness substitution is not equivalent. Some lint suggestions cannot be safely autofixed because changing coercion changes behavior.

For configuration diagnosis, run `npm exec -- eslint --print-config src/equality.js` and inspect the effective rule. Use `--debug` for discovery/ignore investigation, with paths/log content reviewed before sharing. Flat-config composition can change the effective result; do not assume an old `.eslintrc` tutorial or a globally installed tool describes this fixture. For TypeScript source, install a compatible parser/plugin and scope it deliberately; TypeScript annotations alone do not make the JS configuration parse `.ts`.

Warnings normally differ from errors; `--max-warnings=0` makes any warning fail this gate too. Distinguish a reported rule violation from missing config/parser/tool invocation errors. An exit status alone does not identify the cause. Review proposed `--fix` changes and rerun behavioral checks; static rules cannot prove authorization, transaction or business correctness.

<span class="notes-section-label">**Common mistakes**</span>

Changing only an editor setting leaves CI unchanged. Running from the wrong package can discover another configuration. A wrong glob can make a clean result meaningless. Blanket ignore/disable comments can conceal regressions. A formatter fixes whitespace, not a loose-equality or undefined-variable defect.

<span class="notes-section-label">**Examiner follow-ups**</span>

1. <span class="notes-section-label">**Can lint pass while the program is wrong?**</span> Yes. A subtraction bug can satisfy every configured static rule; behavior tests exercise a different contract.
2. <span class="notes-section-label">**Why use print-config?**</span> It verifies the effective configuration for one actual path, rather than guessing from a file you think applies.
3. <span class="notes-section-label">**Should an existing Autocode template be migrated to this test runner?**</span> No. Preserve its required build/Jest/coverage configuration; this is a separate study fixture.

::: tip Key takeaway
Prove the rule, file scope and failure reason before calling a lint-policy change complete.
:::

<span class="notes-section-label">**Practice — learner work still required**</span>

Reproduce the loose-equality failure and repair; add an unused declaration and verify a separate failure. Acceptance: retain effective config, rule names, command status, source diff and passing rerun. Explain a defect the selected rules cannot detect.

<span class="notes-section-label">**Official references**</span>

[ESLint flat configuration](https://eslint.org/docs/latest/use/configure/configuration-files), [eqeqeq](https://eslint.org/docs/latest/rules/eqeqeq), [CLI and configuration diagnosis](https://eslint.org/docs/latest/use/command-line-interface). Use documentation matching your pinned version; latest documentation can include later options.

---

### How do formatting, linting, typechecking and tests complement one another? {#t29-q03}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Formatting makes source presentation consistent; linting checks configured static policies; typechecking checks the modeled type contract; tests check selected behavior. **Passing one does not imply passing the others.** Keep these commands independently reproducible, and **keep formatting fixes separate from behavioral fixes** so their effects can be reviewed.

</div>

<span class="notes-section-label">**Configure one formatter in the owned lab**</span>

Add Prettier3.6.2 as an exact dev dependency in the same disposable quality fixture (`npm install --save-dev --save-exact prettier@3.6.2`). Retain its updated lockfile. This is not a request to install into an existing Autocode submission or the notes repository.

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

### How do you make a routine tool change and diagnose which gate actually failed? {#t29-q04}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A tool change is a small behavior change to the development workflow. **Inspect the effective command, working directory, file scope, tool version and output artifact before editing configuration.** Change one cause at a time, preserve required template behavior, and **prove a failing case becomes passing without bypassing its gate**.

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

Do not modify a task's build/Jest/database configuration to imitate this lab. For an Autocode implementation, preserve the supplied scripts and run `npm run build`, `npm run test`, plus Module4's required Cobertura coverage. Keep `src/tests` untouched. A local hook or `prestart` is bypassable and is not the only CI/acceptance enforcement.

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

### How do IDE navigation, refactoring and breakpoints help diagnose a Node application? {#t29-q05}

*Study depth: Intermediate*

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Use navigation to find the actual caller/implementation, refactoring tools to propose coordinated edits, and a debugger to inspect a paused execution. **A breakpoint is evidence about one actual runtime path, not proof that every path works.** Preserve behavior with tests, verify the process/artifact/source mapping, and **treat inspected values and debugger access as sensitive**.

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

The author check for this lesson uses Node's real in-process Inspector Session to set a conditional breakpoint, observe the paused `add` frame/local value, resume and disconnect. That verifies the underlying breakpoint behavior without opening an inspector listener. **It does not claim that VS Code's GUI, a remote attach or TypeScript source maps were exercised.** The launch JSON and entry point are separately checked; complete the actual IDE exercise yourself.

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

[VS Code Node debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging), [official documentation source](https://github.com/microsoft/vscode-docs/blob/main/docs/nodejs/nodejs-debugging.md), [refactoring](https://code.visualstudio.com/docs/editing/refactoring), [Node24 Inspector](https://nodejs.org/download/release/v24.18.0/docs/api/inspector.html). Official site debugging fetch timed out during this review; the maintained Microsoft documentation source was checked instead.

## Tooling revision and practice

- [ ] Reproduce the build/test/serve gate and supervise readiness/shutdown.
- [ ] Make a scoped lint-rule change with effective-config and negative-control evidence.
- [ ] Repair formatting drift and prove idempotence without hiding a behavior defect.
- [ ] Diagnose a type error and a behavioral error at different gates; inspect the emitted artifact.
- [ ] Complete the real IDE navigation/refactor/breakpoint exercise and retain redacted evidence.

Acceptance is your reproducible work and explanation, not the existence of these notes. Specialized IDE features, remote debugging and alternative lint/test frameworks remain optional extensions unless your project requires them.
