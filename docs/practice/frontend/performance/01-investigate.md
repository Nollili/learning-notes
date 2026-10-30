# H1 — Investigate a slow user journey

**Learner status: outstanding.** First required performance hometask. Prerequisites: a working public catalogue, [measurement](../../../frontend/performance/measurement.md) and [delivery](../../../frontend/performance/delivery.md). Reuses E02/P-328/P-329.

## Goal

Turn “the app is slow” into a reproducible user action and an evidence-backed hypothesis. Do this before optimizing. The result is an investigation report, not a required Lighthouse score.

## Work

1. Select an initial-load journey and an interaction journey in the same app: for example open `/courses`, then search/filter a deterministic large catalogue. State what the user expects to see and when the task is complete. Use public/generated data with a recorded size/seed.
2. Build and serve the production artifact using its documented commands. Record the revision, dependencies, browser/tool versions, viewport/DPR, CPU/network conditions, storage state and exact steps. Distinguish a physical device from desktop emulation.
3. Record at least three cold and three warm baseline trials for initial load. Define precisely which caches are cold/warm and how you reset them. Run the same interaction sequence at least three times, recording input feedback and eventual completion separately.
4. Save a Lighthouse report plus a Network waterfall and a Performance trace for representative runs. Retain raw values for every run. Explain median/range and any outlier rather than silently deleting it.
5. Identify the LCP candidate and its dependency chain. Inspect one real interaction's input, processing and presentation phases; inspect CLS during initial and delayed content. If nothing shifts, say what states were observed rather than claiming the whole app has zero CLS.
6. Rank up to three plausible causes by evidence, expected benefit, effort and correctness risk. Choose one loading and one interaction hypothesis for H2. If the fixture is already fast, use a disposable controlled variant, such as delaying a public hero or increasing the dataset; disclose the artificial setup.

## Required report

| Record | What to include |
|---|---|
| Complaint and journey | Route, action, data, expected visible/usable result |
| Environment | Artifact, browser, viewport/DPR, CPU/network, cache reset procedure |
| Trials | Raw measurements, median/range, matching conditions |
| Causal evidence | Initiator chain / blocking task / layout work and screenshot or trace region |
| Hypotheses | Why this cause is plausible, how to falsify it and what change to test |
| Limits | No field pipeline, untested browsers/devices, observation scope |

A screenshot of a score is insufficient. A waterfall may show the hero starts after app JS and API work; a trace may show that the input event waits behind unrelated filtering. Explain how the evidence supports that interpretation and what would contradict it.

## Failure cases to investigate

Delay/fail one image or font request; repeat with a warm cache; perform the interaction during loading. Observe whether the UI remains readable and whether feedback differs from completion. Restore the controlled fault after capture. Check a narrow viewport and keyboard operation of the chosen action.

## Acceptance

Another person can follow the steps and encounter the same class of bottleneck. You can distinguish lab TBT from interaction latency/field INP, identify the actual LCP element and explain why request durations should not be summed into page-load time. No code optimization is necessary to complete H1, but the two H2 hypotheses must be concrete and testable.

Do not infer field p75 from local trials or treat an unused Coverage region as safe deletion across unrecorded states. Keep honest findings if evidence is inconclusive.

Next: [H2 — Improve loading and interaction](./02-improve.md).
