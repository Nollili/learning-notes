# Practice: What is reflow and repaint, what causes those events, why is it important to have them in mind?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Web_Performance/What_is_reflow_and_repaint%2C_what_causes_those_events%2C_why_is_it_important_to_have_them_in_mind.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** assert all geometry reads precede the owned writes and teardown restores the original properties once. Then compare a deliberately interleaved variant and this variant in an allowed native browser using the same DOM/data/viewport and trace. Inspect actual layout call stacks, preserved dimensions, hidden/zoomed content and subsequent responsiveness. A DOM simulation/order test cannot measure native layout cost; native trace and learner results remain unperformed.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
