# AI-assisted bug fix and feature project

Use [AI for Software Development](../../../ai-assisted-engineering/) with a small owned TypeScript catalogue. **All learner work remains outstanding.** You may use the worked catalogue after predicting behavior, but copied reference test results do not establish your own investigation.

## DEV-01: reproduce and fix mutation

Create a disposable baseline whose sorter changes its input array. Define the non-mutation and title/ID ordering contract, obtain actual failing evidence, fix it and run focused checks plus build/test. Ask an assistant to investigate, then inspect its proposed change yourself. Retain one meaningful challenge, such as a frozen caller array or duplicate titles.

## DEV-02: develop query and limit

Add the [declared feature contract](../../../ai-assisted-engineering/feature-development.md): trimmed case-insensitive substring query, sort before limit, default ten, explicit zero and integer range 0–50. Map each criterion to a check. Keep invalid/no-match/tie cases, actual build/test output and one failed candidate/correction. No model or database is needed for the helper.

## DEV-03: diagnose and review

Introduce a meaningful fault only in your disposable copy, confirm a requirement-derived check detects it, then restore your owned candidate. Classify one environment/build failure without changing correct production behavior merely to silence it. Review the final diff and new files against the task; retain actual findings or an honestly limited no-findings result.

## DEV-04: prepare a local handoff

Prepare separate bug-fix and feature PR summaries with trigger/new behavior, actual checks and limits. Save the candidate/diff and acceptance map. Do not claim remote CI, publication or independent approval. Never push: only the user may push in this repository.

## DEV-05: reuse and optional coordination

Run the same inspect→reproduce→implement→verify→review→handoff process on another small issue. Record what the runbook needed to change. Optionally request an independent read-only review of a frozen candidate; record who/what reviewed which revision. Multiple agents and worktrees are optional, not required for completion.

These increments support [P-336](../../ai-project.md#p-336) rather than replacing its evidence requirements. The [catalogue source/checks](../../../workbench/engineering/ai-engineering/catalogue/) and existing retry case are separate worked references. Preserve Autocode templates and restricted tests; run the applicable official checks when this is a real course submission.
