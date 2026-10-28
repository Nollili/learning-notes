// server.mjs
import { createSearchApp } from './search-app.mjs';
const server = createSearchApp().listen(4173, '127.0.0.1');
server.on('error', error => { console.error(error.code || 'SERVER_START_FAILED'); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
