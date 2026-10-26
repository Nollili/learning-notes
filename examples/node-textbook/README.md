# Task Board learning fixture

Read the [complete HTTP application in Module 9](../../docs/node-js/module-09-authentication-authorization.md#complete-runnable-example-app-ts).
The source listing is imported directly from `src/app.ts`.

From this directory, use Node 24.18+, `npm ci`, copy `.env.example` to `.env` and supply
an authorized disposable PostgreSQL 16 URI and a generated session secret. Then run
`npm run build`, `npm run migrate`, and `npm start`.

For `npm run test`, set `TEXTBOOK_TEST_DATABASE_URL` to a **separate disposable database**
and `TEXTBOOK_ALLOW_TEST_RESET=yes`. Tests migrate and truncate the fixture's tables.
Build first. Tests live in `checks`, outside any Autocode-owned `src/tests`.

This loopback-only teaching server includes a private local recovery inbox. It sends
no email. Before hosting it, review Module 10 and provide HTTPS/Secure cookies, production secret management, shared rate limiting, real recovery delivery and data-retention jobs.
