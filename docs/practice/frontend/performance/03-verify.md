# H3 — Verify and prevent regressions

**Learner status: outstanding.** Third required performance hometask. Prerequisites: H1, H2 and [cache/delivery policies](../../../frontend/performance/caching.md). Keep the same catalogue and journeys; add a monitoring plan without pretending the plan is production evidence.

## Goal

Show that the accepted changes help under comparable conditions, preserve behavior and have a practical defense against regressions. Where H2 rejected changes, report that outcome honestly and choose a check protecting the behavior/cost you investigated.

## Final comparison

Repeat the original cold, warm and interaction trials against the final production artifact. Keep the environment and data comparable; disclose any unavoidable difference. Record every run and the median/range, then connect the result to H1's complaint. Report component/byte changes as supporting diagnostics alongside actual journey outcomes.

Check slow/failed image or font delivery, first optional-feature open, narrow/wide views and keyboard navigation. Include rapid input replacement or navigation during computation when applicable. Record untested real devices, browsers, assistive technology and field populations explicitly. A local usability check is not a full accessibility certification.

## Implement one meaningful regression check

Choose a project-specific check and integrate it into the existing app's appropriate verification workflow without changing unrelated templates:

- A production initial-route JS or image-byte budget derived from the measured baseline, **or**
- A controlled synthetic journey check with declared browser/device/network/cache settings and a tolerance supported by repeated runs.

State exactly what the check counts. A compressed on-disk file size differs from an HTTP transfer; a whole-build total differs from initial-route resources. For timing, document rerun/aggregation rules so random noise does not create arbitrary failures. Do not add an unexplained universal threshold.

Introduce one intentional local regression in a disposable variant, run the check and retain its failure output. Restore the final version and show that it passes. Do not leave the fault committed or change a test to accept the regression. A working byte budget can pass this requirement without provisioning a full Lighthouse CI service.

## Monitoring and release plan

Describe the first-party RUM endpoint or planned tool, relevant metric instrumentation, release/route/device labels, data minimization, sampling/aggregation and observation window. Explain how field p75 would be evaluated for LCP, INP and CLS separately, how missing samples are handled, and which degraded segment would trigger investigation. If no real collection exists, label this **planned, not executed**.

Add a short delivery table:

| Resource | Freshness/scope choice | Update/recovery check |
|---|---|---|
| Public hashed JS/CSS/images | Defined public immutable lifetime | Old open tab can fetch its versioned chunks |
| Entry HTML | Explicit validation/freshness | New navigation receives a compatible asset graph |
| Private API/application state, if present | Explicit private/no-store and scoped app state as appropriate | No cross-user reuse; logout clears relevant owners |

These are decisions to substantiate, not headers to apply blindly. If the app has no private data or service worker, state that scope. A service worker is not required. If it exists, include update/activation, offline/eviction recovery and owned-cache cleanup in actual checks; inspect current code before asserting correctness.

## Hand-in and acceptance

Provide one report connecting baseline, individual experiments, final behavior and regression control. Include source revision, reproduction commands, raw data, causal traces, intentional-failure proof, restored pass, cache/release decisions and monitoring limitations.

Explain which optimization you would prioritize next and why its expected benefit justifies effort/risk. Avoid claiming all users are faster based on a desktop lab or that a green score prevents production regressions. Completion requires the implemented local check and credible evidence; live production telemetry and deployment are optional follow-up integrations.

[Hometask overview](./index.md) · [Learning path](../../../frontend/performance/) · [Author verification](../../../frontend/performance/verification.md)
