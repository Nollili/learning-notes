# Practice: What unidirectional dataflow means. Why immutability is important in the React?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/What_unidirectional_dataflow_means_Why_immutabilit_166e8106c24d8080ab3ce9dc309b32a3.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Exercise acceptance:** assert previous/next values and changed/unchanged branch identities using the actual produce implementation, verify a no-op result, then demonstrate why mutating a nested object after only a root spread corrupts previous state. Distinguish state-setter, memo-prop and useSelector-result equality. Browser render counts/profiling and learner practice remain required.

**Acceptance:** execute actual Immer structural sharing/no-op checks, then compare a client-owned state update with a confirmed remote mutation and a pending overlay. Explain who owns each value, which equality rule observes it and how stale/error outcomes are reconciled. Learner UI/API practice and browser profiling remain required.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
