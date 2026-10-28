# Next.js and UI architecture

Prerequisites: [React ownership](./react.md), HTTP/status/cookies, unknown-input validation and server authorization. Teaching baseline: **Next.js 16.4.3 App Router, React 19.3.0, Node 24.18.0**, official docs checked 2026-10-27. Recheck patched versions and deployment support before using these examples in a real service.

## Recommended order

1. [App Router, safe DTOs and route states](../senior_growth/React/next-app-router.md).
2. [Sessions, server data access and mutations](../senior_growth/React/next-server-security.md).
3. [Metadata, assets and deployment assumptions](../senior_growth/React/next-deployment-and-assets.md).
4. [Application ports and boundaries](../senior_growth/React/application_struvture.md) → [component/token contracts](../senior_growth/React/design-system-contracts.md) → [stories, versioning and consumer migration](../senior_growth/React/design-system-release.md).
5. [Large-data state ownership](../senior_growth/EngX_Quality/Large_Data_Workflow.md) and [rendering/capability decisions](../senior_growth/EngX_Quality/Rendering_and_Capability_Workflows.md) when the product requires them.

## Choose server/client boundaries by responsibility

Server Components can await protected data and keep server implementation out of the client module graph. Client Components own browser interactions, state and Effects; their initial HTML may still be rendered on the server. `use client` marks a dependency boundary, not a promise of browser-only initial execution. Project safe fields before crossing it; hidden client props are still delivered data.

A server layout is not a complete authorization boundary for every descendant action. Check actor, resource scope and current version in the data operation itself. Treat Route Handlers and Server Actions as externally invocable mutation boundaries; validate their inputs and enforce the appropriate CSRF policy. A UI guard and CORS do not substitute for that decision.

## Rendering and caching are separate contracts

| Boundary | Decision |
|---|---|
| Client navigation cache | What the browser may reuse during navigation |
| Public server data/route cache | Shared freshness, invalidation and deployment store |
| Private request data | Actor-specific authorization and isolation; avoid accidental shared caching |
| HTTP/CDN cache | Response policy, keys and trusted proxy behavior |

The public reference deliberately sets `cacheComponents:false`. Current create-next-app defaults can enable Cache Components and Partial Prefetching; do not apply the previous-model fetch/route advice to that different model by accident. Caching documentation and upgrade guidance must match the pinned configuration.

router.refresh requests fresh route output but does not invalidate every server cache. Time-based revalidation is not a periodic job or instant write visibility. Stale-while-revalidate tag invalidation differs from Server Action updateTag/read-your-writes. Check clean production requests and instrumented upstream versions; the fixed public array cannot prove a data-cache freshness policy.

Missing data differs from operational failure. A streamed missing route can return an already-committed 200 while rendering not-found UI; test actual status and indexing behavior. Current error retry is stable from 16.3 and refetches/re-renders; reset has a narrower error-state-reset contract. Expected validation errors should be returned as safe data.

## UI architecture is an enforceable contract

A component API specifies state ownership, event meaning, ref target, native semantics, supported styling hooks and compatibility. Keep Button and Link separate until polymorphism has a demonstrated need. Tokens express semantic design roles; generated types alone cannot prove contrast or first-paint theme agreement.

Organize by a small feature/application boundary before introducing a framework of abstractions. UI consumes a port; the application edge composes network/storage adapters. A direct-import lint rule is useful but not a resolved dependency-graph proof. Keep migrations incremental, preserve consumer behavior and define rollback before removing an old token/prop.

A static export cannot execute authenticated request-time handlers/actions, cookie reads or a Node image/ISR service. A Node deployment needs durable state, shared-cache/invalidation decisions where applicable, trusted ingress, runtime secrets and asset/CDN ownership. Public build-time environment values are not runtime secrets. Use the existing Node deployment material for infrastructure mechanisms.

[Workbench](../workbench/frontend/next/) separates a runnable public application from security integration fragments. [F06](../practice/frontend/f06-next.md) defines the private/cache/deployment exercises without claiming they have run.

Official references: [Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [caching](https://nextjs.org/docs/app/getting-started/caching), [error APIs](https://nextjs.org/docs/app/api-reference/file-conventions/error), [authentication](https://nextjs.org/docs/app/guides/authentication), [static export](https://nextjs.org/docs/app/guides/static-exports). See [verification and limits](./verification.md).
