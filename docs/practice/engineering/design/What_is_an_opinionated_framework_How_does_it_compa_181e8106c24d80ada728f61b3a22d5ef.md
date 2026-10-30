# Practice: Opinionated and unopinionated frameworks: tradeoffs {#practice-what-is-an-opinionated-framework-how-does-it-compare-to-non-opinionated-what-are-the-pros-and-cons-of-each-approach}

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/EngX_Quality/What_is_an_opinionated_framework_How_does_it_compa_181e8106c24d80ada728f61b3a22d5ef.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** list three required capabilities, compare two candidate approaches against them, implement or trace one small request→validation→domain→storage slice in the primary stack, and write an ADR with convention benefits, escape hatches, upgrade/deployment coupling and a realistic migration cost. Keep business assertions unchanged when replacing a local adapter; test framework-specific error/lifecycle behavior separately. Learner practice remains required. Official references: [Express middleware model](https://expressjs.com/en/guide/using-middleware.html), [React framework/project choices](https://react.dev/learn/creating-a-react-app). Use documentation for the exact installed versions before selecting APIs.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
