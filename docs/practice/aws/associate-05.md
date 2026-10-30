# A05 — CloudFront origins, behaviors and invalidation

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [storage and frontend](../../aws/storage-and-frontend.md).

## A05.1 — S3 origin — repeating P02/A04

- [ ] Reuse the static-site bucket/app, configure CloudFront and restrict S3 object access to the distribution with OAC (or the original OAI exercise where explicitly needed). Use a bucket REST origin for this private-access path; see [source corrections](./source-notes.md).
- [ ] Inspect and remove unintended public policy access. Upload the app and verify delivery through CloudFront, with direct origin access denied for the private design.
- [ ] Change/rebuild/upload the app, invalidate the cache, observe the update and initiate an invalidation with CLI.
- [ ] **Promoted from optional:** serve a maintenance page during a controlled deployment and verify the visible transition.
- [ ] **Promoted from optional; repeating through CLI:** export distribution configuration, adapt it to valid creation input, create a second distribution, inspect/reuse or create OAC/OAI, update configuration via CLI, then disable/delete the obsolete disposable distribution. Record ETag/version handling where required.

## A05.2 — EC2 origin and cache behaviors — repeating A03 backend

- [ ] Start the course backend (`feat/cloudfront-lab`) on EC2 with the source's HTTP port-80 origin arrangement. Configure its public DNS name as another distribution origin.
- [ ] Route `/api/*` to it, allow the requested HTTP methods and inspect the default cache policy. Verify the browser actually obtains backend data through CloudFront.
- [ ] **Promoted from optional:** manage behaviors through CLI and compare different cache policies, recording cache-hit/miss evidence and response correctness. Do not cache private responses indiscriminately.

## A05.3 — ALB origin — repeating A03 load balancer

- [ ] Create/reuse an internet-facing ALB in at least two public subnets with the backend as a healthy target and the source-required listener/security configuration.
- [ ] Replace the EC2 origin DNS name with the ALB DNS name, wait for distribution deployment and verify fresh API responses rather than a previously cached success.
- [ ] Inspect price-class choices and remove obsolete distributions, ALBs and instances after the evidence is saved or preserve explicitly needed dependencies.


## Completion evidence

- [ ] Record observed results for every section, including all promoted extensions.
- [ ] Retain configuration/code, successful and denied/failing cases where specified, and actual cleanup state.
- [ ] Link earlier evidence for repeating work and add the new interface/behavior comparison.

Use the [shared evidence rules](./index.md#evidence-for-every-required-module); never claim screenshots or sample code complete independent work.
