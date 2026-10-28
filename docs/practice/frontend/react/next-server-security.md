# Practice: next-server-security

**Status: outstanding learner practice.**

Prerequisite: [the worked lesson](../../../senior_growth/React/next-server-security.md) and [the staged sequence](../index.md).


## Practice and acceptance evidence

Implement this in the separate pinned Next/PostgreSQL exercise application with two users/notes and valid, expired and revoked fixture sessions; integrate the chosen authentication provider before calling it a usable login system. Apply migrations/test fixtures outside this notes repository and outside any protected src/tests directory.

Acceptance: malformed/no cookie fails; owner can edit; another owner/forged userId cannot; two simultaneous same-version writes produce exactly one success; stale retries cannot duplicate a write; extra JSON fields/malformed UTF8/oversized/stalled bodies fail within limits; missing/null/cross-site origin fails; database outage yields safe operational failure; no raw session token/secret/private data in HTML/RSC/client bundle/logs/shared caches. Verify cookie attributes over HTTPS and server-action direct invocation. Test pending/error/focus recovery without relying on a disabled button for integrity. Record actual typecheck, tests, production build/start, DB concurrency and browser results.

The notes provide material and worked boundaries; no live provider, database migration, Next build, CSRF attack simulation or learner evidence has been executed here. Mocked reader/query checks are useful contract checks but do not establish deployment security or professional readiness.
