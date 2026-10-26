import { writeSync } from 'node:fs';
// No caller-controlled message, stack, field, URL or cause crosses this boundary.
export function event(name: 'server.started' | 'request.completed' | 'request.failed' |
  'shutdown.started' | 'shutdown.completed' | 'shutdown.failed', fields: object = {}) {
  process.stdout.write(`${JSON.stringify({ event: name, ...fields })}\n`);
}
export function writeFatal(label: 'UNHANDLED_REJECTION' | 'UNCAUGHT_EXCEPTION' | 'STARTUP_FAILED') {
  // Deliberately accepts no Error value. Works without async transports.
  try { writeSync(2, `${JSON.stringify({ level: 'fatal', code: label })}\n`); }
  catch { /* Fatal termination must not depend on the last-resort sink. */ }
}
