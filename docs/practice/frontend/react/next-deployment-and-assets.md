# Practice: Next.js Metadata, Assets and Deployment Decisions

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/next-deployment-and-assets.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise:** test known/missing/private courses, direct links and social preview fetches. Acceptance: final title/canonical/OG resource is correct, no duplicate/conflicting canonical tags, preview and production policies are distinct, no sensitive title in unauthenticated HTML/RSC/metadata. Retain output/status/asset evidence, not only the source object.

**Exercise:** inspect generated srcset/currentSrc, sizes, reserved geometry and font requests in cold/warm loads; block images/fonts and verify fallback meaning/readability. Acceptance: no lazy critical hero, no oversized candidate due to wrong sizes, no missing accents, sensible fallback and actual LCP/CLS trace comparison. No images/font binaries or browser scores are supplied here.

**Acceptance:** retain build route output, upstream call counts and content versions across first/cached/stale/invalidation/failure requests. Test two app instances: default local caches may diverge unless coordinated with a shared cache handler/invalidation design. Check what changes on a new build/deployment. Learner execution remains required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
