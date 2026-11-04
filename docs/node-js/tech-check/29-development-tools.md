---
outline: [2, 3]
---

# Development tools and IDE workflows

Examples use **Node.js 24.18.0 and npm 11**. This lesson connects build, test and service commands; linting and formatting configuration are separate topics. Complete the exercise yourself after working through the example.

### How do package scripts connect a tested build to a running service? {#t29-q01}

*Study depth: Intermediate*

**Example — identify which command keeps running**

Start with the complete isolated build-study fixture from [related explanation](./04-package-management.md#t04-q07): src/add.mjs, build.mjs, checks/add.test.mjs and verify.mjs. Its build copies the module to dist, and its test imports that emitted module. In that **disposable fixture only**, use this package.json and add serve.mjs below. No dependency installation is required.

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

**Short exam answer**

Package scripts name separate lifecycle stages. Build creates the artifact, test verifies its behaviour, and serve/start opens the long-lived process that uses it. In this fixture npm start first runs prestart: build must succeed, then test must succeed before the server launches.

The server prints readiness only after binding successfully; it keeps running until its owned resources close. Use a bounded smoke check to verify the live endpoint and shutdown. A successful build, spawned process or ready line is not the same as a completed service run or deployment readiness.

**Detailed explanation**

Run npm start or npm run serve in the owned fixture. npm runs prestart before start under ordinary script policy. The shell's && gates the test after build; npm also prevents start when prestart fails. The finite build/test stages should exit, while the serve stage intentionally remains active.

Do not put a permanent server before tests in a sequential verification command and expect the next command to run. Do not start build and serve concurrently with a shell background operator: that can serve stale or missing output.

The ready line contains the actual loopback port allocated by the OS. Once it appears, request GET /sum at that port: expect status200 and {value:5}. Other paths/methods have separate404/405 outcomes. This narrow smoke check exercises the imported emitted module through HTTP; the existing unit test still verifies its arithmetic independently.

A port printed before listen completes could falsely report readiness when binding later fails. This example's readiness means only that the local teaching service is listening, not that a real application's database/authentication/migrations are ready.

To prove the gate, deliberately change src/add.mjs to subtract, then run npm start. Build can succeed while test fails; no ready line or server should appear. Restore the source afterward. Remove dist/add.mjs and run node serve.mjs directly: loading fails, showing that bypassing the package lifecycle also bypasses its build prerequisite.

Changing the package test script to always succeed would hide the defect rather than repair the service.

For shutdown, send SIGTERM to the **owned Node service process** in a Unix-like fixture. The idempotent handler stops acceptance, closes existing ordinary HTTP connections under a deadline and lets the process exit. It owns no database/job/WebSocket resources; those would require additional drain/close owners.

A blocked JavaScript thread can delay both shutdown and its timer, so an external supervisor still needs a final deadline. npm/shell process trees and signal forwarding vary; a test must supervise the actual child or its owned process group, not assume signalling a wrapper reaches every descendant. Windows signal behaviour needs its own test.

This example keeps an explicit ordinary prestart lifecycle. npm's ignore-scripts policy suppresses pre/post hooks even when an explicit start command still runs, so it is not a security boundary or a universal CI gate.

CI should invoke the required build/test checks explicitly and promote the same reviewed artifact; do not depend on undocumented hooks. npm restart and watch-mode tools also have their own lifecycle semantics. Before changing scripts, inspect existing names, output paths, module mode, local tool versions, failure statuses and the project contract.

**Common mistakes**

- Waiting for a long-running serve command to finish before running the next test stage.
- Reporting a spawned process as ready or ignoring the artifact it actually imports.
- Bypassing hooks with direct node/ignore-scripts invocation and assuming prestart still protected the workflow.
- Killing only npm while leaving the service alive, or forcing exit to conceal leaked resources.

**Examiner follow-ups**

1. **Is prestart a bundler?** No. It coordinates commands; the build implementation produces output and a bundler/compiler has its own configuration.
2. **Should production rebuild on every restart?** Not necessarily. This is a local study workflow. A deployment normally starts an already built/tested immutable artifact and configures its environment separately.
3. **Does changing PORT require a source rewrite?** No. Set a validated environment value for the process; this example permits0 for an ephemeral fixture and rejects malformed/out-of-range text.

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

