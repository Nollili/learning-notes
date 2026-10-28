# Practice: What is a CDN and what is the benefit of using one?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Other/What_is_a_CDN_and_what_is_the_benefit_of_using_one.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** serve two distinct asset versions in an owned environment, verify exact bytes/hash/header/key behavior, tamper with one and observe actual browser SRI rejection. Test CSP violations without broadening trust, cache miss/revalidation, query variants, auth/cookie/private responses and rollback with an old open client. Record actual provider/browser results separately from the local policy assertions. Learner practice remains required. References: [HTTP caching RFC9111](https://httpwg.org/specs/rfc9111.html), [Subresource Integrity Recommendation](https://www.w3.org/TR/2016/REC-SRI-20160623/), [CSP specification](https://www.w3.org/TR/CSP3/).

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
