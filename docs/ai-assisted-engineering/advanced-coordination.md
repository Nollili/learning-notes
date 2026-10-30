# Coordinate larger changes {#_7-coordinate-larger-changes}

Begin with one assistant and one clear task. Additional agents or worktrees help only when they remove a concrete bottleneck, such as an independent review or two changes with separate file ownership.

## Choose the form of separation

A branch separates history. A worktree provides another checkout directory. Neither is an OS security boundary: credentials, ports, services and caches may still be shared. The [existing Git lesson](./local-workflow-and-git.md) contains the detailed experiment and preservation rules.

Two assistants editing the same function concurrently can overwrite assumptions even when the tools report success. Assign independent scopes and designate one integration owner. A reasonable split is implementation in one checkout and read-only review of the exact candidate in another; do not ask reviewers to silently repair files while reviewing.

## Define a handoff contract

Give a reviewer the task, exact candidate/diff, relevant context, verification results and required output. Ask for actionable findings with triggering inputs. The integrating owner must reconcile them, inspect the final diff and rerun affected checks. A review of an earlier revision does not automatically approve later changes.

For two implementation subtasks, specify owned files or interfaces, expected outputs and dependencies first. Parallel work is less useful when both subtasks require frequent changes to one shared contract. Start serially if that makes integration clearer.

## Keep aggregate limits and evidence

Several agents may duplicate calls and context. The task still needs an overall scope/time/cost limit, one final acceptance map and a clear record of what actually ran. Agreement between agents is not independent evidence if they share the same mistaken premise.

Persist enough state to resume, then reinspect the repository. Never reset or delete user work just to obtain a clean checkout. Follow the no-push rule even if a generated plan proposes publication.

**Optional exercise:** after finishing your own feature, ask a separate reviewer to assess the frozen candidate read-only. Record a real finding or an explicitly limited no-findings result. Explain whether the extra review improved the outcome enough to justify the effort.

**Done:** you can choose single-owner work by default, explain when separation helps and reconcile the final candidate. Continue with your own project or [the advanced traceability material](./traceability-and-evaluation.md); multiple agents are not required for the beginner course.
