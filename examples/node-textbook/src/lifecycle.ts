import { createServer, type Server } from 'node:http';
import { event } from './diagnostics.js';
import type { State } from './app.js';

export function listen(server: Server, port: number, host = '127.0.0.1'): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => { server.off('error', fail); server.off('listening', ready); };
    const fail = (error: Error) => { cleanup(); reject(error); };
    const ready = () => { cleanup(); resolve(); };
    server.once('error', fail); server.once('listening', ready);
    try { server.listen(port, host); } catch (error) { cleanup(); reject(error); }
  });
}
export function createShutdown(server: Server, state: State, close: () => Promise<void>, timeoutMs = 5000) {
  let pending: Promise<void> | undefined;
  return (fatal = false): Promise<void> => {
    // A later fatal failure still changes the exit status during an ordinary drain.
    if (fatal) process.exitCode = 1;
    if (pending) return pending;
    state.ready = false;
    pending = (async () => {
      event('shutdown.started');
      const deadline = setTimeout(() => { process.exit(1); }, timeoutMs);
      const failures: unknown[] = [];
      try {
        await new Promise<void>(resolve => {
          const sweep = setInterval(() => server.closeIdleConnections(), 50);
          const done = (error?: Error) => {
            clearInterval(sweep);
            if (error) failures.push(error);
            resolve();
          };
          try { server.close(done); } catch (error) { clearInterval(sweep); failures.push(error); resolve(); }
        });
        // All active handlers have finished using the pool before it closes.
        try { await close(); } catch (error) { failures.push(error); }
        if (failures.length) { process.exitCode = 1; event('shutdown.failed', { count: failures.length }); }
        else event('shutdown.completed');
      } finally { clearTimeout(deadline); }
    })();
    return pending;
  };
}
export { createServer };
