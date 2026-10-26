import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { loadConfig } from './config.js';
import { openDatabase } from './database.js';
import { createApp } from './app.js';
import { createServer, createShutdown, listen } from './lifecycle.js';
import { event, writeFatal } from './diagnostics.js';

async function start() {
  const config = loadConfig();
  const db = await openDatabase(config.databaseUrl);
  const state = { ready: false };
  let server: ReturnType<typeof createServer> | undefined;
  try {
    // Local mailbox simulation only: no message is sent to anybody.
    await mkdir('.local-inbox', { recursive: true, mode: 0o700 });
    const { app } = await createApp(db, config, state, async (_email, token) => {
      await writeFile(`.local-inbox/${randomUUID()}.json`, JSON.stringify({ token }),
        { mode: 0o600, flag: 'wx' });
    });
    server = createServer(app);
    server.requestTimeout = 5000;
    server.headersTimeout = 3000;
    const shutdown = createShutdown(server, state, () => db.close());
    let running = false;
    server.on('error', () => { if (running) void shutdown(true); });
    await listen(server, config.port);
    process.once('SIGTERM', () => { void shutdown(); });
    process.once('SIGINT', () => { void shutdown(); });
    process.once('unhandledRejection', () => {
      writeFatal('UNHANDLED_REJECTION'); void shutdown(true);
    });
    // A capture callback replaces Node's default raw stack reporting. Never resume service.
    process.setUncaughtExceptionCaptureCallback(() => {
      writeFatal('UNCAUGHT_EXCEPTION'); process.exit(1);
    });
    state.ready = true;
    running = true;
    event('server.started', { port: config.port });
  } catch (error) {
    if (server?.listening) await new Promise<void>(resolve => server!.close(() => resolve()));
    await db.close();
    throw error;
  }
}
void start().catch(() => { writeFatal('STARTUP_FAILED'); process.exitCode = 1; });
