import { MikroORM } from '@mikro-orm/postgresql';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { Pool } from 'pg';
import { Account, Task } from './model.js';

export async function openDatabase(databaseUrl: string) {
  const orm = await MikroORM.init({
    entities: [Account, Task], metadataProvider: ReflectMetadataProvider,
    clientUrl: databaseUrl, debug: false, pool: { min: 0, max: 4 },
    driverOptions: { connectionTimeoutMillis: 500, statement_timeout: 1000 },
  });
  // This second, explicitly owned pool serves the session store and SQL security labs.
  const pool = new Pool({ connectionString: databaseUrl, max: 4,
    connectionTimeoutMillis: 500, statement_timeout: 1000 });
  // Idle client errors are operational failures, never raw strings sent to logs.
  let healthy = true;
  pool.on('error', () => { healthy = false; });
  try {
    await orm.connect();
    await orm.em.getConnection().execute('select 1');
    await pool.query('select 1');
  } catch (primary) {
    const cleanup = await Promise.allSettled([orm.close(true), pool.end()]);
    throw new AggregateError([primary, ...cleanup.flatMap(item =>
      item.status === 'rejected' ? [item.reason] : [])], 'Database startup failed');
  }
  return { orm, pool, get healthy() { return healthy; },
    async close() {
      const results = await Promise.allSettled([orm.close(true), pool.end()]);
      const errors = results.flatMap(item => item.status === 'rejected' ? [item.reason] : []);
      if (errors.length) throw new AggregateError(errors, 'Database cleanup failed');
    },
  };
}
export type Database = Awaited<ReturnType<typeof openDatabase>>;
