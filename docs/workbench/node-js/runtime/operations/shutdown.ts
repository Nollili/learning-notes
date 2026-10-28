import type { Server } from 'node:http';

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    // Reap connections that become idle after draining starts, without aborting active responses.
    const sweep = setInterval(() => server.closeIdleConnections(), 100);
    const finish = (error?: Error) => {
      clearInterval(sweep);
      if (error) reject(error); else resolve();
    };
    try { server.close(finish); } catch (error) {
      clearInterval(sweep);
      reject(error);
    }
  });
}

// shutdown.ts — all adapters are owned; logger methods must not throw
interface LifecycleLogger {
  info(event: string, fields?: object): void;
  warn(event: string, fields?: object): void;
  error(event: string, fields?: object): void;
}
interface ShutdownDependencies {
  server: Server;
  readiness: { markUnready(): void };
  database: { close(): Promise<void> };
  jobs: { stopIntake(): void; drain(): Promise<void> };
  logger: LifecycleLogger;
  timeoutMs: number;
}
export function createShutdown(deps: ShutdownDependencies) {
  if (!Number.isInteger(deps.timeoutMs) || deps.timeoutMs < 1 || deps.timeoutMs > 2_147_483_647)
    throw new RangeError('Invalid shutdown budget');
  let pending: Promise<void> | undefined;
  return function shutdown(signal: string): Promise<void> {
    if (pending) return pending;
    pending = (async () => {
      const failures: unknown[] = [];
      deps.readiness.markUnready();
      deps.logger.warn('shutdown.started', { signal });
      const deadline = setTimeout(() => {
        deps.logger.error('shutdown.deadline_exceeded');
        try { deps.server.closeAllConnections(); } finally { process.exit(1); }
      }, deps.timeoutMs); // Referenced: deadline still fires if a stuck promise owns no handle.
      async function attempt(work: () => Promise<void>): Promise<void> {
        try { await work(); } catch (error) { failures.push(error); }
      }
      try {
        try { deps.jobs.stopIntake(); } catch (error) { failures.push(error); }
        // Both settle before the shared database closes, even if HTTP drain rejects.
        await Promise.all([
          attempt(() => closeServer(deps.server)),
          attempt(() => deps.jobs.drain()),
        ]);
        await attempt(() => deps.database.close());
        if (failures.length) {
          process.exitCode = 1;
          deps.logger.error('shutdown.failed', { failureCount: failures.length });
        } else {
          deps.logger.info('shutdown.completed');
        }
      } finally { clearTimeout(deadline); }
    })();
    return pending;
  };
}
export function installShutdownHandlers(deps: ShutdownDependencies) {
  const shutdown = createShutdown(deps);
  const onTerm = () => { void shutdown('SIGTERM'); };
  const onInt = () => { void shutdown('SIGINT'); };
  process.once('SIGTERM', onTerm);
  process.once('SIGINT', onInt);
  return { shutdown, dispose() {
    process.off('SIGTERM', onTerm); process.off('SIGINT', onInt);
  } };
}
