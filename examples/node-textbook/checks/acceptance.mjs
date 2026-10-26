import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { migrate } from '../dist/migrate.js';
import { openDatabase } from '../dist/database.js';
import { createApp } from '../dist/app.js';
import { createServer, listen, createShutdown } from '../dist/lifecycle.js';
import { issueRefresh, rotateRefresh, requestReset, completeReset } from '../dist/security.js';
import { loadConfig } from '../dist/config.js';

const databaseUrl = process.env.TEXTBOOK_TEST_DATABASE_URL;
assert.ok(databaseUrl, 'Set TEXTBOOK_TEST_DATABASE_URL to a dedicated disposable database');
assert.equal(process.env.TEXTBOOK_ALLOW_TEST_RESET, 'yes', 'Explicitly authorize clearing textbook tables');
// The runner never guesses credentials or reuses DATABASE_URL from a deployment.
await migrate(databaseUrl);
await migrate(databaseUrl);
const db = await openDatabase(databaseUrl);
let server;
try {
  await db.pool.query(`TRUNCATE textbook_accounts, textbook_tasks, textbook_sessions,
    textbook_refresh_families, textbook_refresh_tokens, textbook_resets CASCADE`);
  const config = { databaseUrl, sessionSecret: 'a'.repeat(64), origin: 'http://127.0.0.1:3000', port: 3000 };
  assert.throws(() => loadConfig({}), /configuration/);
  const state = { ready: true };
  const deliveries = [];
  const { app } = await createApp(db, config, state, async (_email, token) => { deliveries.push(token); });
  server = createServer(app);
  await listen(server, 0);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const password = 'Long practice password 42';
  function browser() {
    let cookie = '';
    let csrf = '';
    return {
      get cookie() { return cookie; },
      async request(path, method = 'GET', body, overrides = {}) {
        const response = await fetch(origin + path, {
          method, headers: { Cookie: cookie, Origin: config.origin, 'X-CSRF-Token': csrf,
            ...(body ? { 'Content-Type': 'application/json' } : {}), ...overrides },
          ...(body ? { body: JSON.stringify(body) } : {}),
        });
        if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
        const text = await response.text();
        let data; try { data = JSON.parse(text); } catch { data = text; }
        if (data?.csrfToken) csrf = data.csrfToken;
        return { status: response.status, data, headers: response.headers };
      },
    };
  }
  const alice = browser(); const bob = browser();
  assert.equal((await alice.request('/tasks')).status, 401);
  await alice.request('/csrf'); await bob.request('/csrf');
  assert.equal((await alice.request('/register', 'POST', { email: 'alice@example.test', password },
    { 'X-CSRF-Token': '' })).status, 403);
  const account = await alice.request('/register', 'POST', { email: ' Alice@EXAMPLE.test ', password });
  assert.equal(account.status, 201);
  assert.equal((await bob.request('/register', 'POST', { email: 'bob@example.test', password })).status, 201);
  assert.equal((await bob.request('/register', 'POST', { email: 'alice@example.test', password })).status, 409);
  const beforeLogin = alice.cookie;
  const login = await alice.request('/login', 'POST', { email: 'alice@example.test', password });
  assert.equal(login.status, 200); assert.notEqual(alice.cookie, beforeLogin);
  assert.match(login.headers.get('set-cookie'), /HttpOnly/);
  assert.match(login.headers.get('set-cookie'), /SameSite=Lax/);
  assert.equal((await bob.request('/login', 'POST', { email: 'bob@example.test', password })).status, 200);
  const task = await alice.request('/tasks', 'POST', { title: 'Learn transactions' });
  assert.equal(task.status, 201);
  assert.equal((await bob.request(`/tasks/${task.data.id}`, 'PATCH', { done: true })).status, 404);
  assert.equal((await alice.request(`/tasks/${task.data.id}`, 'PATCH', { done: true })).status, 200);
  assert.equal((await alice.request('/tasks')).data[0].done, true);
  assert.equal((await alice.request(`/tasks/${task.data.id}`, 'DELETE')).status, 204);
  assert.deepEqual((await bob.request('/tasks')).data, []);
  assert.equal((await alice.request('/tasks', 'POST', { title: 'x', ownerId: randomUUID() })).status, 400);
  assert.equal((await alice.request('/tasks', 'POST', { title: 'x' }, { Origin: 'https://evil.example' })).status, 403);
  const first = await issueRefresh(db.pool, account.data.id);
  const results = await Promise.allSettled([rotateRefresh(db.pool, first.token), rotateRefresh(db.pool, first.token)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const winner = results.find(result => result.status === 'fulfilled').value;
  await assert.rejects(rotateRefresh(db.pool, winner), error => error.status === 401);
  const row = await db.pool.query('SELECT revoked FROM textbook_refresh_families WHERE id=$1', [first.familyId]);
  assert.equal(row.rows[0].revoked, true);
  const active = await issueRefresh(db.pool, account.data.id);
  const known = await alice.request('/password/reset-request', 'POST', { email: 'alice@example.test' });
  const unknown = await alice.request('/password/reset-request', 'POST', { email: 'missing@example.test' });
  assert.equal(known.status, 202); assert.deepEqual(known.data, unknown.data);
  assert.equal(deliveries.length, 1);
  const reset = deliveries[0];
  const newPassword = 'A different long password 73';
  const attempts = await Promise.allSettled([
    completeReset(db.pool, reset, newPassword), completeReset(db.pool, reset, newPassword),
  ]);
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await alice.request('/tasks')).status, 401);
  await assert.rejects(rotateRefresh(db.pool, active.token), error => error.status === 401);
  await alice.request('/csrf');
  assert.equal((await alice.request('/login', 'POST', { email: 'alice@example.test', password })).status, 401);
  assert.equal((await alice.request('/login', 'POST', { email: 'alice@example.test', password: newPassword })).status, 200);
  const oldCookie = alice.cookie;
  assert.equal((await alice.request('/logout', 'POST')).status, 204);
  const replay = await fetch(origin + '/tasks', { headers: { Cookie: oldCookie } });
  assert.equal(replay.status, 401); await replay.text();
  assert.equal((await alice.request('/health/ready')).status, 200);

  // Recovery expiry is enforced by PostgreSQL time, not a mocked JavaScript clock.
  await requestReset(db.pool, 'alice@example.test', async (_email, token) => deliveries.push(token));
  await db.pool.query("UPDATE textbook_resets SET expires_at=now()-interval '1 second'");
  await assert.rejects(completeReset(db.pool, deliveries.at(-1), newPassword), error => error.status === 400);

  // Async bind rejection must be observable rather than an unhandled server error.
  const occupied = createServer();
  await assert.rejects(listen(occupied, server.address().port), error => error.code === 'EADDRINUSE');
  // Fatal projection has no input channel for raw diagnostic text.
  const fatal = spawnSync(process.execPath, ['--input-type=module', '-e',
    "import { writeFatal } from './dist/diagnostics.js'; writeFatal('UNHANDLED_REJECTION',new Error('PASSWORD_SENTINEL'));"],
    { encoding: 'utf8' });
  assert.equal(fatal.status, 0); assert.ok(!fatal.stderr.includes('PASSWORD_SENTINEL'));
  assert.equal(JSON.parse(fatal.stderr).code, 'UNHANDLED_REJECTION');

  // The driver really stops a statement at its server-side deadline; later queries recover.
  const queryStarted = Date.now();
  await assert.rejects(db.pool.query('SELECT pg_sleep(2)'), error => error.code === '57014');
  assert.ok(Date.now() - queryStarted < 1900);
  assert.equal((await alice.request('/health/ready')).status, 200);

  // Exercise the executable's startup catch using the occupied HTTP port.
  const childEnv = { ...process.env, DATABASE_URL: databaseUrl,
    SESSION_SECRET: config.sessionSecret, APP_ORIGIN: config.origin,
    PORT: String(server.address().port) };
  const bindFailure = spawnSync(process.execPath, ['dist/server.js'], {
    env: childEnv, encoding: 'utf8', timeout: 10000,
  });
  assert.equal(bindFailure.status, 1);
  assert.equal(JSON.parse(bindFailure.stderr).code, 'STARTUP_FAILED');
  assert.ok(!bindFailure.stderr.includes(databaseUrl));

  // Run the real exception boundary, not just its serializer. Trigger after startup.
  const reservation = createServer();
  await listen(reservation, 0);
  const childPort = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const fatalChild = spawn(process.execPath, ['--input-type=module', '-e', `
    import './dist/server.js';
    process.stdin.once('data', () => { throw new Error('PASSWORD_SENTINEL'); });
  `], { env: { ...childEnv, PORT: String(childPort) }, stdio: ['pipe', 'pipe', 'pipe'] });
  let fatalOutput = ''; let startupOutput = '';
  fatalChild.stderr.on('data', chunk => { fatalOutput += chunk; });
  const fatalExited = once(fatalChild, 'exit');
  const childDeadline = setTimeout(() => fatalChild.kill('SIGKILL'), 10000);
  fatalChild.stdout.on('data', chunk => {
    startupOutput += chunk;
    if (startupOutput.includes('server.started')) fatalChild.stdin.end('crash');
  });
  const [fatalCode] = await fatalExited;
  clearTimeout(childDeadline);
  assert.equal(fatalCode, 1);
  assert.equal(JSON.parse(fatalOutput).code, 'UNCAUGHT_EXCEPTION');
  assert.ok(!fatalOutput.includes('PASSWORD_SENTINEL'));

  const slowServer = createServer((_req, res) => setTimeout(() => res.end('finished'), 100));
  await listen(slowServer, 0);
  const inFlight = fetch(`http://127.0.0.1:${slowServer.address().port}`);
  await once(slowServer, 'request');
  const slowState = { ready: true }; let closed = false;
  const shutdown = createShutdown(slowServer, slowState, async () => { closed = true; });
  const one = shutdown(); const two = shutdown();
  assert.equal(one, two); assert.equal(slowState.ready, false); assert.equal(closed, false);
  assert.equal(await (await inFlight).text(), 'finished');
  await one; assert.equal(closed, true);

  // Real process: deadline must fire even if a cleanup promise owns no active handle.
  const child = spawn(process.execPath, ['--input-type=module', '-e', `
    import { createServer,createShutdown,listen } from './dist/lifecycle.js';
    const server=createServer(); await listen(server,0);
    await createShutdown(server,{ready:true},()=>new Promise(()=>{}),50)();
  `], { stdio: ['ignore', 'pipe', 'pipe'] });
  const [code] = await once(child, 'exit'); assert.equal(code, 1);
  const badUrl = new URL(databaseUrl); badUrl.port = '1';
  await assert.rejects(openDatabase(badUrl.href));
  console.log('PASS: CRUD, CSRF, sessions, reset, replay, startup, fatal logging, drain and deadline');
} finally {
  if (server?.listening) await new Promise(resolve => server.close(resolve));
  await db.close();
}
