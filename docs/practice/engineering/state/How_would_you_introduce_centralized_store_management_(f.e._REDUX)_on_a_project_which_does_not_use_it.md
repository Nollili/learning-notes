# Practice: How would you introduce centralized store management (f.e. REDUX) on a project which does not use it?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/State_management_and_Redux/How_would_you_introduce_centralized_store_management_%28f.e._REDUX%29_on_a_project_which_does_not_use_it.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Exercise acceptance:** load two users and three projects, rename one user, and prove all owner labels derive the new name without copying project records. Check unchanged project and unrelated user references, previous snapshots, duplicate/dangling snapshot rejection without partial updates, unknown rename/removal, cascade cleanup and independent store instances. Verify selector output identity on identical inputs. Measure row renders with a representative UI and decide whether a reverse index is justified; no measured render improvement follows from normalization alone. Learner implementation remains required.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
