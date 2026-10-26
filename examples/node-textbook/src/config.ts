import { z } from 'zod';
const environment = z.object({
  DATABASE_URL: z.string().url().refine(value => /^postgres(?:ql)?:/.test(value)),
  SESSION_SECRET: z.string().regex(/^[a-f0-9]{64}$/i),
  APP_ORIGIN: z.string().url(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
}).transform(value => ({
  databaseUrl: value.DATABASE_URL, sessionSecret: value.SESSION_SECRET,
  origin: value.APP_ORIGIN, port: value.PORT,
}));
export type Config = z.output<typeof environment>;
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = environment.safeParse(env);
  if (!result.success) throw new Error('Invalid application configuration');
  const config = result.data;
  const url = new URL(config.origin);
  if (url.origin !== config.origin || !['http:', 'https:'].includes(url.protocol)) {
    throw new Error('APP_ORIGIN must be an HTTP origin without a trailing slash');
  }
  // This runnable teaching server binds only to loopback and uses a private local inbox.
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
    throw new Error('The teaching server requires a loopback origin');
  }
  return config;
}
