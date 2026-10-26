import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import argon2 from 'argon2';
import { z } from 'zod';
import type { Config } from './config.js';
import type { Database } from './database.js';
import { Account, Task } from './model.js';
import { completeReset, HttpError, requestReset } from './security.js';
import { event } from './diagnostics.js';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    csrf?: string;
    establishedAt?: number;
    credentialVersion?: number
  }
}

const credentials = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(12).max(128)
}).strict();
const taskInput = z.object({ title: z.string().trim().min(1).max(200) }).strict();
const idInput = z.uuid();

const PgStore = connectPgSimple(session);
const cookieName = 'textbook.sid';
const absoluteSessionMs = 8 * 60 * 60 * 1000;

export interface State {
  ready: boolean
}

export async function createApp(
  db: Database,
  config: Config,
  state: State,
  deliverReset: (email: string, token: string) => Promise<void>
) {
  const app = express();

  const store = new PgStore({
    pool: db.pool,
    tableName: 'textbook_sessions',
    createTableIfMissing: false,
    pruneSessionInterval: false,
    errorLog: () => event('request.failed', { code: 'SESSION_STORE_FAILURE' })
  });

  // Pruning is a separate bounded admin operation in this small example; no hidden store timer.
  const dummyHash = await argon2.hash('a dummy password never used to log in');
  const secure = new URL(config.origin).protocol === 'https:';
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    const requestId = randomUUID();

    res.locals.requestId = requestId;
    res.locals.routeId = 'unmatched';

    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');

    res.once('finish', () => event('request.completed', {
      requestId, route: res.locals.routeId, status: res.statusCode,
    }));

    if (!state.ready && req.path !== '/health/live') return res.sendStatus(503);

    next();
  });

  app.get('/health/live', (_req, res) => {
    res.locals.routeId = 'health.live';

    res.json({ status: 'alive' });
  });

  let pending: Promise<boolean> | undefined;
  app.get('/health/ready', async (_req, res) => {
    res.locals.routeId = 'health.ready';

    // The driver bounds acquisition and execution; share the actual operation, not a timeout race.
    if (!pending) pending = db.pool.query('select 1').then(() => db.healthy, () => false)
      .finally(() => { pending = undefined; });

    const ready = await pending;

    res.status(ready && state.ready ? 200 : 503).json({ status: ready && state.ready ? 'ready' : 'not_ready' });
  });

  app.use(express.json({ limit: '10kb' }));

  app.use(session({
    name: cookieName,
    store,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: false,
    cookie: {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: absoluteSessionMs
    }
  }));

  app.use((req, _res, next) => {
    if (req.session.userId && (!req.session.establishedAt ||
      Date.now() - req.session.establishedAt >= absoluteSessionMs)) {
      return req.session.destroy(error => next(error ?? new HttpError(401, 'LOGIN_REQUIRED')));
    }

    next();
  });

  app.get('/csrf', (req, res) => {
    res.locals.routeId = 'csrf';
    req.session.csrf ??= randomBytes(32).toString('hex');
    res.json({ csrfToken: req.session.csrf });
  });

  app.use((req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

    const supplied = req.get('X-CSRF-Token') ?? '';
    const expected = req.session.csrf ?? '';

    if (req.get('Origin') !== config.origin || !/^[a-f0-9]{64}$/.test(supplied) ||
      expected.length !== supplied.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
      return next(new HttpError(403, 'CSRF_REJECTED'));
    }

    next();
  });

  // Local, single-process teaching limit. A deployment needs a shared/upstream limiter.
  const attempts = new Map<string, { count: number; until: number }>();
  app.use(['/register', '/login', '/password/reset-request', '/password/reset'], (req, _res, next) => {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);

    const key = req.ip ?? 'unknown';
    if (!attempts.has(key) && attempts.size >= 1000) return next(new HttpError(429, 'RATE_LIMITED'));

    const entry = attempts.get(key) ?? { count: 0, until: now + 60_000 };
    attempts.set(key, entry);

    if (++entry.count > 30) return next(new HttpError(429, 'RATE_LIMITED'));

    next();
  });

  app.post('/register', async (req, res) => {
    res.locals.routeId = 'register';

    const input = credentials.parse(req.body);
    const em = db.orm.em.fork();
    const account = em.create(Account, { email: input.email, credentialVersion: 1,
      passwordHash: await argon2.hash(input.password, { type: argon2.argon2id }) });

    await em.persist(account).flush();

    res.status(201).json({ id: account.id, email: account.email });
  });

  app.post('/login', async (req, res) => {
    res.locals.routeId = 'login';

    const input = credentials.parse(req.body);
    const account = await db.orm.em.fork().findOne(Account, { email: input.email });
    const matches = await argon2.verify(account?.passwordHash ?? dummyHash, input.password);

    if (!account || !matches) throw new HttpError(401, 'INVALID_CREDENTIALS');

    await new Promise<void>((resolve, reject) =>
      req.session.regenerate(error => error ? reject(error) : resolve())
    );

    req.session.userId = account.id;
    req.session.credentialVersion = account.credentialVersion;
    req.session.establishedAt = Date.now();
    req.session.csrf = randomBytes(32).toString('hex');

    await new Promise<void>((resolve, reject) =>
      req.session.save(error => error ? reject(error) : resolve())
    );

    res.json({ id: account.id, csrfToken: req.session.csrf });
  });

  app.post('/password/reset-request', async (req, res) => {
    res.locals.routeId = 'password.reset-request';
    const { email } = z.object({ email: z.string().trim().toLowerCase().pipe(z.email()) }).strict().parse(req.body);

    // Delivery failures keep the same public contract as missing accounts.
    try {
      await requestReset(db.pool, email, deliverReset);
    } catch {
      event('request.failed', { code: 'RESET_REQUEST_FAILED' });
    }

    res.status(202).json({ message: 'If the account exists, recovery instructions will be delivered' });
  });

  app.post('/password/reset', async (req, res) => {
    res.locals.routeId = 'password.reset';
    const input = z.object({ token: z.string().length(43), password: z.string().min(12).max(128) }).strict().parse(req.body);

    await completeReset(db.pool, input.token, input.password);

    await new Promise<void>((resolve, reject) =>
      req.session.destroy(error => error ? reject(error) : resolve())
    );

    res.clearCookie(cookieName, { path: '/', httpOnly: true, secure, sameSite: 'lax' }).sendStatus(204);
  });

  app.use(async (req, _res, next) => {
    if (!req.session.userId) throw new HttpError(401, 'LOGIN_REQUIRED');

    const account = await db.orm.em.fork().findOne(Account, { id: req.session.userId });
    if (!account || account.credentialVersion !== req.session.credentialVersion) {
      throw new HttpError(401, 'LOGIN_REQUIRED');
    }

    next();
  });

  app.post('/logout', (req, res, next) => {
    res.locals.routeId = 'logout';
    req.session.destroy(error => {
      if (error) return next(error);

      res.clearCookie(cookieName, { path: '/', httpOnly: true, secure, sameSite: 'lax' }).sendStatus(204);
    });
  });

  app.get('/tasks', async (req, res) => {
    res.locals.routeId = 'tasks.list';
    const tasks = await db.orm.em.fork().find(Task, { ownerId: req.session.userId! },
      { orderBy: { id: 'ASC' }, limit: 20 });

    res.json(tasks.map(({ id, title, done }) => ({ id, title, done })));
  });

  app.post('/tasks', async (req, res) => {
    res.locals.routeId = 'tasks.create';

    const input = taskInput.parse(req.body);
    const em = db.orm.em.fork();
    const task = em.create(Task, { ownerId: req.session.userId!, title: input.title, done: false });

    await em.persist(task).flush();

    res.status(201).json({ id: task.id, title: task.title, done: task.done });
  });

  app.patch('/tasks/:id', async (req, res) => {
    res.locals.routeId = 'tasks.update';
    const id = idInput.parse(req.params.id);
    const { done } = z.object({ done: z.boolean() }).strict().parse(req.body);

    // Ownership and the write are one database operation: no read-authorize-write gap.
    const result = await db.pool.query(`UPDATE textbook_tasks SET done=$1 WHERE id=$2 AND owner_id=$3
      RETURNING id,title,done`, [done, id, req.session.userId]);

    if (!result.rowCount) throw new HttpError(404, 'TASK_NOT_FOUND');

    res.json(result.rows[0]);
  });

  app.delete('/tasks/:id', async (req, res) => {
    res.locals.routeId = 'tasks.delete';
    const result = await db.pool.query('DELETE FROM textbook_tasks WHERE id=$1 AND owner_id=$2',
      [idInput.parse(req.params.id), req.session.userId]);

    if (!result.rowCount) throw new HttpError(404, 'TASK_NOT_FOUND');

    res.sendStatus(204);
  });

  app.use((_req, res) => res.sendStatus(404));

  const errors: express.ErrorRequestHandler = (error, _req, res, next) => {
    if (res.headersSent) return next(error);

    const status = error instanceof HttpError ? error.status : error instanceof z.ZodError ? 400 :
      error?.code === '23505' || error?.name === 'UniqueConstraintViolationException' ? 409 :
      error?.type === 'entity.too.large' ? 413 : error?.type === 'entity.parse.failed' ? 400 : 500;

    event('request.failed', { requestId: res.locals.requestId, status });

    res.status(status).json({ error: error instanceof HttpError ? error.code :
      status === 400 ? 'INVALID_INPUT' : status === 409 ? 'ACCOUNT_CONFLICT' :
      status === 413 ? 'BODY_TOO_LARGE' : 'INTERNAL_ERROR' });
  };
  app.use(errors);

  return { app, store };
}
