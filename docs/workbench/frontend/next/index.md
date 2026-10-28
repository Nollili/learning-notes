# Next.js reference boundaries

Baseline: **Next.js 16.4.3 App Router, React 19.3.0, TypeScript 5.9.3, Node 24.18.0**. Official APIs checked 2026-10-27; this is a declared teaching baseline, not an upgrade policy for every application.

## Public read-only application

Copy `read-only/` into an isolated directory; install its pinned package.json, then run `npm run build`, `npm run typecheck` and `npm start`. Browse `/courses` and a detail link on loopback port 4175. It has two fixed public courses and no external API, auth or persistent data. No root homepage is supplied; `/courses` is the entry route.

The deliberate config sets cacheComponents:false. Current generator defaults may choose another model; use the checked config rather than silently combining recipes. The [route lesson](../../../senior_growth/React/next-app-router.md) includes the canonical source files.

## Security integration fragments

`security-fragments/` contains the separate SQL/DAL/session/body/parser/Route Handler/Server Action worked boundary from [the server security lesson](../../../senior_growth/React/next-server-security.md). It is **not a standalone login application**: it needs the authentication integration's app_user table, PostgreSQL, sessions, trusted origin configuration and a UI. Do not copy it into the public app and claim an authenticated deployment without that integration.

The schema is not automatically applied. No credentials or services are provisioned. Metadata/images/fonts and ISR instrumentation remain explicit extensions of the public fixture; their required binary assets/upstream are not invented here.

[Practice F06](../../../practice/frontend/f06-next.md) specifies integration evidence. [Author verification](../../../frontend/verification.md) records executed subsets separately.

The pure `security-fragments/check.ts` runner covers body/parser failure and cleanup cases with local Request/ReadableStream fixtures. Bundle it with the React reference esbuild tool (Node platform, ESM output), then run the emitted file; no session, provider or database is contacted.
