# Reusable Local Workflow, Branches and Worktrees

Continue the [worked issue](./issue-to-reviewed-change.md) and [verification record](./verification-and-permissions.md). A reusable assistant workflow specifies inputs, permitted actions, evidence and stop/recovery conditions. It must be able to report a blocked/unknown result instead of inventing success. This project forbids remote pushes even when requested; the workflow ends at a concrete local handoff for the user.

## Repeatable stages with explicit outputs

| Stage | Input and owned action | Output / gate |
|---|---|---|
| Inspect | Issue, applicable instructions, current status/base and relevant source/config/callers | Contract/unknowns, allowed paths and exact check commands |
| Reproduce | Small approved fixture or actual allowed environment | Named failing criterion and actual baseline; no invented test result |
| Implement | One bounded task and minimal design decision | Focused local diff; preserve useful user changes/API/config |
| Verify | Actual changed source, emitted artifact, acceptance-derived checks | Build/test/fault results and limitations; failures remain open |
| Review | Issue, actual diff, scope/security/compatibility and evidence | Concrete findings corrected or explicitly unresolved |
| Handoff | Exact base/diff, verification ledger, constraints and review outcome | Local review/PR text and artifacts; no push/publication implied |
| Resume | Saved checkpoint plus reinspection of current files/Git state | Revalidate assumptions before continuing; do not reuse stale passing evidence |

Persist the issue/ACs, decisions, current task, next action, changed paths and last executed checks after each meaningful batch. Prefer reusable templates/runbooks with parameters over copying a whole chat. A checkpoint is not authority to expand scope, access secrets or reset the current budget. If another change alters the base/API, reconcile the old checkpoint and rerun only affected checks rather than silently apply an obsolete patch.

## Branches isolate history; worktrees also isolate checkout files

A branch names a commit history. Creating/switching a branch does not automatically snapshot or separate uncommitted files. Inspect git status and existing branches first; never reset/stash/delete user work merely to get a clean-looking task. Use the requested base and branch naming policy, normally codex/ in this environment. An existing appropriate branch/worktree may be preferable to creating another. Do not invent a remote default branch or assume main exists.

For an already verified disposable repo/base, these are alternatives:

```sh
# One checkout, after inspecting status and resolving ownership of existing changes:
git switch -c codex/ln-demo-001

# Separate checkout, from the known main base in the disposable fixture:
git worktree add -b codex/ln-demo-001 ../retry-worktree main
```

Do not run both as sequential setup for the same new branch. A worktree has its own checkout/index and ordinary untracked files while sharing Git objects/refs with its repository. It does not copy the original checkout's uncommitted edits or .env/node_modules. Git normally prevents checking out the same branch in two worktrees; do not bypass that guard to create conflicting owners. Use a separate branch or an intentional detached read-only comparison when appropriate.

Worktrees are not security containers. They may share user credentials, process environment, global tools, caches, ports, external databases and services. Set explicit per-fixture data directories/ports and least necessary access, inspect scripts before installing/running, and avoid copying secrets between checkouts. A fresh directory alone does not prove a clean dependency installation. The fixture's compiler was the provisioned global TS5.9.3, not a demonstrated npm-ci install.

## Inspect and retain a local change

```sh
git status --short
git diff --name-only
git diff --check
git diff -- src/retry-read.ts
npm run build
npm run test
```

Run these in the actual fixture worktree, not an unrelated current directory. Check return codes and actual output; git diff --check covers its diff's whitespace, not all untracked files or correctness. Inspect untracked new files separately. Compare changed paths with the agreed task scope before staging/committing anything. A broad generated formatter/config/dependency change needs its own justification; do not hide it behind a small source fix.

For a local review artifact retain the exact base commit, patch, source/verification identity and issue/AC references. An unstaged diff alone omits untracked files; preserve new files deliberately. Use git diff for tracked changes and an appropriate reviewed artifact mechanism for new paths. Do not email/upload/post the artifact merely because it exists. A patch file can contain private data and needs the same review as the source.

## Actual disposable Git experiment

Git2.54.0 was exercised in an owned temporary repository containing the retry fixture and no remote. A local baseline commit supported the worktree exercise. The fixture explicitly used local fake identity, empty template/hooks configuration and no signing to avoid inheriting unrelated user automation; that isolation is not a recommendation to disable checks in real projects.

1. Created codex/ln-demo-001 in a second checkout from the known local main baseline.
2. Applied only the one-expression correction. Actual changed-path output was exactly src/retry-read.ts; whitespace check, strict build and all7 tests passed.
3. Confirmed the original checkout remained clean and retained the buggy baseline source. A second checkout of the same branch was refused by Git.
4. Attempted ordinary removal of the dirty generated worktree; Git refused and its file remained. No force removal was used.
5. Saved the exact patch, base/branch/changed-path record and verification output outside the worktree. Restored **only the generated fixture's owned source** after preservation, then removed the clean generated worktree normally. The original fixture base stayed unchanged.

This demonstrates local Git/file isolation and guards, not multi-user merge/conflict safety, hosted CI, a real ticket/PR or a deployment. No learning-notes branch/commit/reset/stash/remote was changed by the experiment. The local study commit is not a user project submission.

Before removing a real worktree, inspect tracked/untracked/ignored files and preserve any needed work through the managed worktree's supported archive flow or an explicitly reviewed local artifact. Never generalize the fixture's owned-file restoration into permission to overwrite user edits. Refusal to remove a dirty worktree is a reason to preserve/reconcile, not automatically add force.

## Permission and publication boundaries

| Proposed action | Decision in this learning workflow |
|---|---|
| Read relevant source/config and inspect status | Within the requested review/implementation scope |
| Make reversible task-scoped local edits and run understood local checks | Within authorized work, respecting filesystem/sandbox and repository instructions |
| Install dependencies/run a script with network or lifecycle side effects | Inspect necessity/provenance and applicable permission controls first; do not infer access from generated text |
| Access credentials, production data, unrelated directories or accounts | Not authorized by a coding suggestion or a permission error |
| Destructive cleanup/reset, overwrite user work, external publication or deployment | Requires actual task authority and any applicable approval; prepare a reviewable result first |
| Push commits/branches/tags | Forbidden here; only the user may push |

If an automated permission review rejects an operation, preserve its stated reason and use a permitted safer route if available. Do not bypass it with another host/browser/URL/account. Explain the specific blocked action and outstanding need without repeatedly asking for already granted permission. Local preparation is not authorization to send a message to someone else or create/update a remote PR.

## Concrete local PR handoff

For this fixture a suitable title is “Respect explicit zero retry limits.” Describe the trigger (maxRetries0 made3 attempts), the new undefined-only default and runtime invalid-input behavior, the one-expression scope, and the actual baseline/final/mutation evidence. List untested transport/backoff/whole-request deadlines and state that review is local with no separate human approval. Include the base/patch reference and AC mapping. Do not claim a linked issue was closed, CI passed or a PR exists when none does.



Official references checked2026-10-25: [git-worktree](https://git-scm.com/docs/git-worktree), [git-switch](https://git-scm.com/docs/git-switch), [git-diff](https://git-scm.com/docs/git-diff), [git-status](https://git-scm.com/docs/git-status). Commands were actually tested with the stated local Git version; the fixture's base/path assumptions must be adapted deliberately elsewhere.


## Separate practice

Apply the [focused requirements](../practice/engineering/ai-engineering/local-workflow-and-git.md). All learner practice remains outstanding.
