# F06 — Next.js boundaries and UI contracts

**Learner status: outstanding.**

## Prerequisites

F05; HTTP/status/cookies plus Node server authorization and database version checks. Reuse P-328/P-330; study the three existing Next lessons.

## Scope

Start with the public read-only App Router fixture, then add two-user private notes and one versioned mutation using the existing security contract. Choose cacheComponents:false or a separately justified Cache Components migration.

## Observable acceptance

Pin framework/runtime versions; typecheck, test and production-build/start. Verify direct and client navigation, slow/loading/missing/error/retry states. Client assets/RSC contain only projected data. Authorized writes enforce owner/version server-side; foreign and stale writes fail. Public cache invalidation and private no-store behavior match the declared policy.

## Failure cases

Malformed ID/JSON, missing/revoked session, forged owner, cross-origin mutation, concurrent same-version writes, deployment restart, shared-cache leakage, hydration mismatch and mutation uncertainty. Test cache counters in clean production, not only HMR.

## Evidence to record

Retain build output, HTTP/status/cache traces, safe bundle inspection, DB race results and actual browser focus/keyboard checks. Record deployment mode, durable stores, runtime secrets and rollback assumptions. No paid service/deployment is required; unrun provider/HTTPS/multi-instance tests remain explicit limitations.

Return to [the sequence](./index.md) and [original P-328–P-330 specification](../frontend-project.md). Author verification never completes this stage.
