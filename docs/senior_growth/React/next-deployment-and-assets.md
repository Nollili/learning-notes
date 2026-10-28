# Next.js Metadata, Assets and Deployment Decisions

Target: senior frontend delivery reasoning and intermediate full-stack troubleshooting. Baseline Next.js16.4.3 App Router/React19, Node runtime; official docs checked2026-10-27. Continue [route foundations](./next-app-router.md) and [server security](./next-server-security.md). These are study fixtures/runbooks, not an application deployed from this notes repository.

## Metadata belongs to the route's content contract

A meaningful unique title, description, canonical URL and sharing image help users/crawlers understand a public page. They do not replace correct status, visible content, crawlable links, performance or accessibility. Private account content must not leak through metadata/share images; robots/noindex is not access control. Production canonical origin comes from trusted configuration, not arbitrary Host/query input. Preview indexing needs an explicit hosting/access policy as well as metadata.

```tsx
// app/layout.tsx — add to the foundation layout; keep its component export.
import type { Metadata } from 'next';
export const metadata: Metadata = {
  metadataBase: new URL('https://study.example'), // Replace with the canonical public deployment.
  title: { default: 'Study courses', template: '%s | Study courses' },
  description: 'Practical engineering courses and exercises.'
};
```

```tsx
// app/courses/[id]/page.tsx — add beside the existing page, not a separate page file.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findCourse } from '../../../lib/courses';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(id)) notFound();
  const course = await findCourse(id);
  if (!course) notFound();
  return {
    title: course.title,
    alternates: { canonical: `/courses/${encodeURIComponent(course.id)}` },
    openGraph: { title: course.title, images: [{ url: '/images/courses-og.png', width: 1200, height: 630, alt: 'Study courses' }] }
  };
}
```

The image is an exercise asset that must actually exist and be public. Metadata exports are server-side APIs; do not export them from a use-client file. Nested metadata merging is not arbitrary recursive merging; inspect the final output when overriding openGraph/title fields. Data fetched independently by page/metadata can duplicate work; understand per-render memoization and keep the same authorized DAL, not a separate less-secure metadata query. Dynamic metadata/streaming and bot handling depend on framework version; test rendered head/status for the relevant crawlers rather than asserting all tags arrive before first byte.


## Images and fonts: optimizations have runtime and accessibility contracts

```tsx
// A measured likely-LCP image in a public course page.
import Image from 'next/image';
export function CourseHero() {
  return <Image src="/images/layout-lab.webp" width={960} height={540}
    sizes="(min-width: 60rem) 48rem, 100vw" loading="eager" fetchPriority="high"
    alt="Inspector showing a grid with an overflowing content track"
    style={{ width: '100%', height: 'auto', maxWidth: '48rem' }} />;
}
```

Supply the real dimensions/asset and match sizes to the rendered slot. Next Image defaults to lazy; do not carry that default into an identified LCP hero blindly. Current Next16 deprecates priority in favor of explicit preload; this example instead uses eager/high priority. Preload is a different discovery choice and should not be piled onto loading/fetchPriority without following the versioned API. More high-priority resources can compete with the one that matters.

Remote image sources require a narrow remotePatterns allowlist; arbitrary hosts/paths can create proxy/security/cost problems. Decorative images need empty alt; a meaningful diagram needs a useful description, sometimes longer adjacent prose.

```tsx
// app/font.ts — local asset supplied by learner with suitable license/coverage.
import localFont from 'next/font/local';
export const studyFont = localFont({
  src: './fonts/study-regular.woff2', weight: '400', style: 'normal',
  display: 'swap', variable: '--font-study'
});
// In root layout: <html lang="en" className={studyFont.variable}>…</html>
// In global CSS: body { font-family: var(--font-study), system-ui, sans-serif; }
```

The local font file is relative to its module; public image URLs are rooted at public/. next/font can self-host font assets and handle integration, but does not guarantee zero shift for arbitrary typography. Verify script/diacritic coverage, weight/style matching, fallback metrics, narrow/zoomed layouts and actual request bytes. next/font/google can require network access during build; choose local fonts or a controlled build strategy for isolated CI. Preload only the fonts needed by the relevant routes. A system font stack is a valid lower-complexity alternative.


## Rendering/build modes and freshness

| Mode | Work and deployment implications |
|---|---|
| CSR | Client data/render work; static shell can host on CDN, but API/auth still needs backend ownership |
| SSG/prerender | Build-time output for known public data; build needs its dependencies and output can become stale |
| Request-time SSR | Fresh/request-specific work on server; budget data/server latency, concurrency and client hydration |
| ISR, previous cache model | Cached public output regenerated with time/on-demand policy; needs supported Node server/cache infrastructure |
| Cache Components alternative | Explicit cached scopes/static shell/runtime holes; adopt as a coherent config/model migration |
| Static export | HTML/CSS/JS files generated ahead of time; no request-time Next server capabilities |

SSR can improve earlier useful HTML while worsening TTFB or leaving hydration/INP expensive. SSG avoids per-request rendering for suitable data but does not make client scripts or resource discovery free. Hydration needs matching initial markup; compare timezone/random/storage cases as in the foundation lesson. None of these labels proves speed, security, SEO ranking or user readiness.

### SSG/ISR worked extension (previous cache model)

Use the foundation config with cacheComponents:false. For a finite public catalog, add generateStaticParams to list known course IDs at build time. With the local fixture this produces only fixture content; connect an instrumented durable upstream to observe real regeneration.

```tsx
// app/courses/[id]/page.tsx — add beside the existing page.
import { listCourses } from '../../../lib/courses';
export const runtime = 'nodejs';
export const revalidate = 60;
export async function generateStaticParams() {
  return (await listCourses()).map(course => ({ id: course.id }));
}
```

This is not a cron job firing every60seconds. Observe build generation and request-triggered stale/revalidation behavior in production mode; a local unchanged array cannot demonstrate freshness. A no-store read changes the rendering policy; do not combine mutually contradictory “always fresh” and cached-route expectations. On-demand tag/path invalidation requires authorization and appropriate scope; updateTag/read-your-own-writes differs from stale-while-revalidate. A failed regeneration can retain previously generated content; test upstream failure and recovery against the declared freshness policy. Do not claim Edge/static export support for Node ISR.


## Deploy the architecture that was actually built

A Next Node server supports request-time rendering/handlers/actions; a static host serves only exported files. output:'export' cannot host the cookie-authenticated handler/action example, request-time cookies, ISR or default image-optimization server. Use a custom image service/loader or explicitly unoptimized prebuilt assets when choosing static export. Enumerate dynamic paths ahead of time; new IDs require a rebuild under a finite static plan. Do not present static export as merely copying .next to any CDN.

For a self-hosted Node service, use the framework's production server or a deliberately packaged standalone artifact. If using standalone output, include required public and static assets according to the deployment recipe; inspect the actual artifact rather than assuming every source folder is copied. Keep immutable hashed static assets cacheable and personalized HTML/API responses private. Verify RSC/navigation cache behavior through proxies/CDNs; a generic “cache everything” rule can leak data or mix response variants.

Node and Edge runtimes have different API/dependency/timeout limits. The PostgreSQL/node:crypto session example explicitly needs Node; verify driver/platform compatibility before selecting a different runtime. Function-local memory/filesystem may be ephemeral, instance-specific or read-only. Use durable storage for notes/uploads/jobs and pooled database access within connection budgets. Long jobs/WebSockets/background work may need separate services; an HTTP response does not guarantee continued background execution.

A reverse proxy must preserve trusted host/origin information correctly and allow streaming when required; buffering/compression settings can defeat progressive delivery. Configure HTTPS/cookie security, request/body/time limits and health checks at the actual ingress. Test migrations/backward-compatible schema, simultaneous old/new instances, graceful termination and rollback. Cache coordination, secrets/public build-time values and region/database latency are deployment design decisions, not framework defaults to ignore.

### Reproducible preview/production runbook

In the separate exercise app, pin runtime/dependencies and record the exact framework patch/config/cache mode. A typical package contract is:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "next build",
    "start": "next start"
  }
}
```

Use that app's test script too; tests are part of acceptance, not implied by a successful build. A standalone/static-export artifact has a different start/serve contract. This JSON is an example, not a change to the notes project's package configuration.

1. Provision isolated preview data/secrets and a canonical origin; prevent unintended indexing/access. Install from lockfile, typecheck/test/build and record build-time network/data dependencies.
2. Start the production artifact and inspect deep-link/status/metadata/image/font paths, no-JS baseline, hydration, auth/session and error states. Confirm secret absence from client artifacts and safe cache headers.
3. Exercise fresh/cached/invalidated content and two users across two instances. Verify no cross-user leakage, expected consistency, database pool saturation behavior and bounded upstream failures.
4. Record resource/interaction traces and server timings under defined device/network conditions; compare repeated CSR/SSR/SSG choices on meaningful content, not only first byte. Keep lab versus field findings separate.
5. Rehearse shutdown/rollback and compatible schema recovery; retain deployment identifier, logs, smoke-test artifacts, known limits and an owner. A preview pass is not proof of production traffic behavior.

No deployment is performed by this lesson. Actual Next typecheck/build/start, assets, cache behavior, provider/DB integration and browser/field measurements remain learner practice. Material completion does not establish professional readiness.

## Official references

Verified2026-10-20 against docs showing Next16.4.3: [metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Image API](https://nextjs.org/docs/app/api-reference/components/image), [fonts](https://nextjs.org/docs/app/getting-started/fonts), [ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration), [static export limitations](https://nextjs.org/docs/app/guides/static-exports), [self-hosting](https://nextjs.org/docs/app/guides/self-hosting). Revalidate version/platform-sensitive claims when implementing or upgrading.


## Separate practice

Apply the [focused requirements and failure cases](../../practice/frontend/react/next-deployment-and-assets.md). All learner practice remains outstanding; the worked examples above are explanatory material.
