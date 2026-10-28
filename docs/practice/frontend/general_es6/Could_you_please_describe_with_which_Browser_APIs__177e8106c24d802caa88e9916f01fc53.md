# Practice: Could you please describe with which Browser APIs you've already worked with?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/General_ES6/Could_you_please_describe_with_which_Browser_APIs__177e8106c24d802caa88e9916f01fc53.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Practical exercise:** build an editable task list, event-order fixture and delegated remove action. Acceptance: predict capture/target/bubble order; compare preventDefault versus propagation stopping; click nested spans and newly inserted rows; preserve focus after removing the active row using a deliberate next-control policy; dispose all listeners/observers/timers; demonstrate live versus static collection behavior; malicious label text stays inert. Test keyboard-native button activation as well as pointer input. These browser checks remain required practice.

**Failure-driven practice acceptance:** host two explicitly authorized origins in a separate real browser lab. Show same-origin frame DOM access succeeds and cross-origin access fails; show allowed CORS fetch does not grant DOM/storage access. Exercise a third-origin/wrong-window sender, malformed/unknown/stale IDs, wrong theme/extra fields, timeout, child navigation and parent disposal: none may resolve an unauthorized/stale request or leave a pending timer/listener. Confirm a legitimate response resolves once and exact target origins are used in both directions. Verify storage isolation/partitioning and popup/opener/COOP behavior in the declared browser matrix; record versions and observations rather than assume all privacy policies match. The authored protocol/port tests do not prove browser enforcement or learner completion.

**Web Storage exercise acceptance:** use the existing codec/owner with a store and throwing storage ports. Test v1/v2roundtrip, malformed/future/oversize input, access/read/write denial and serialization failure without discarding current in-memory input or overwriting unread stored data. Simulate an old update/clear notification after a newer stored value, wrong key/storage area, own-document transitions, remote application without echo writes and idempotent disposal. Then verify genuine two-tab events, partitioning/private mode and quota/eviction/recovery in the agreed native-browser matrix. Port/emulator tests are not evidence of native browser persistence or learner completion.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
