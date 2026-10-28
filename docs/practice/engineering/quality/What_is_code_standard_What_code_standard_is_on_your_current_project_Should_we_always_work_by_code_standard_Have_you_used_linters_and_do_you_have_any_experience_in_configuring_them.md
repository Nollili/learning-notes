# Practice: What is code standard? 

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/Clean_code_and_Code_Quality/What_is_code_standard_What_code_standard_is_on_your_current_project_Should_we_always_work_by_code_standard_Have_you_used_linters_and_do_you_have_any_experience_in_configuring_them.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Acceptance:** all four baseline commands pass and each negative control blocks its intended stage. Inspect matched file paths, effective config and actual exit codes. Explain why ignored files, wrong globs, warnings allowed by default, missing TS parsing, swallowed errors and tests that never execute can make a green gate misleading. Every rule needs a reason and deliberate exception policy; do not add arbitrary complexity/coverage thresholds merely to appear strict.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
