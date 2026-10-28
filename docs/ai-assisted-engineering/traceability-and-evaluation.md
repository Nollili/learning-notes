# Trace Requirements to Evidence and Evaluate the Workflow

This closes the documentation record for [LN-DEMO-001](./issue-to-reviewed-change.md), with [defect challenges](./verification-and-permissions.md) and [local Git isolation](./local-workflow-and-git.md). It is one authored local case, not an estimate of developer productivity, a hosted benchmark or evidence of the learner's professional readiness.

## Requirements-to-checks matrix

| Requirement | Actual evidence | Remaining boundary |
|---|---|---|
| AC1: zero means one initial attempt | zero retries means exactly one attempt; exact original error identity | No production caller was migrated |
| AC2: default is two additional retries | omitted limit permits two additional attempts; three calls to success | Contract assumes the documented default is intended |
| AC3: integer0–3, invalid before read | invalid limits cause no read; includes null/NaN/string/bool/out-of-range | Public JSON/HTTP DTO parsing is not implemented by this helper |
| AC4: bounded persistent failure | hard cap terminates persistent failure; max3 gives4 calls | A never-settling callback can still wait indefinitely |
| AC5: classifier and original failure | nonretryable and falsy original failures are preserved | Retry classifier is an application-owned policy, not a complete network error taxonomy |
| AC6: cancellation | preabort starts no work; abort during read discards late result without retry | Abort cannot forcibly stop an uncooperative callback or undo remote effects |
| AC7: API/config/dependency/scope | Actual one-expression source diff, one changed tracked path in the Git fixture, unchanged types/config/dependencies | No separate human reviewed a real project integration |
| AC8: retain evidence | Baseline5 pass/2 fail, final strict build/7 pass, actual4-mutant results, Git record/patch and current source/emitted hashes | No hosted CI/PR, live network/load or clean toolchain install claimed |

A link to a test name is not proof the requirement was logically captured. Review the assertion and trigger: “one attempt” must check the callback count, not just a rejected promise. Requirements may need several checks; AC6 has both preabort and in-flight cases. A single test can cover several invariants, but do not collapse the matrix into a coverage percentage that hides missing security/permission cases. Code coverage measures executed lines/branches, not requirement correctness.

## Preserve candidate identity with the result

The actual local verification record below was generated from a successful fresh build and Node TAP run. The source and emitted SHA256 identify the checked candidate bytes; the mutation results belong to that fixture. The output files named here are local scratch artifacts, not public downloadable attachments or a provider/audit proof.

```json
{
  "issue": "LN-DEMO-001",
  "kind": "authored-local-fixture",
  "runtime": "Node24.18.0",
  "compiler": "TypeScript5.9.3",
  "source_sha256": "1750e23b38f700dfc3e26a836c50948dd7154a7b3b521fdfad1dda28812d7199",
  "emitted_sha256": "2e8e5e3b4294264dfc1f1b0ac988bf2aa040c6100c46ba2d4f09e2a1733a289d",
  "baseline": {
    "build": "passed",
    "tests_passed": 5,
    "tests_failed": 2
  },
  "candidate": {
    "tests_passed": 7,
    "tests_failed": 0
  },
  "checks": {
    "build": {
      "exit": 0,
      "artifact": "build-verified.txt"
    },
    "acceptance": {
      "exit": 0,
      "artifact": "acceptance-verified.txt"
    }
  },
  "targeted_defects_detected": 4,
  "human_review": "not performed",
  "remote_pr": "not created",
  "learner_practice": "still required"
}```

Hashing does not authenticate the author, establish truth or prevent an actor with write access replacing both code and evidence. Use appropriately controlled artifacts/CI provenance when that assurance is required. A test result from an earlier source hash must not be reused after a change without assessing which checks are affected. Retain the exact commands, versions, return codes and relevant output; a copied “passed” label without execution context is not enough. Missing checks remain not run/blocked with the specific reason.

The baseline strict build passing while two behavioral tests failed is useful evidence of why compile-only verification was insufficient. After the correction, all7 acceptance tests pass. The nullish/default, attempt-bound and classifier mutations compile but fail named behavioral tests; the invented API fails compilation. These are complementary checks that can contradict the candidate. They do not establish exhaustive correctness or independent human review.

## Evaluate the engineering process as a system

For repeated learner cases, freeze a small representative set of issues before comparing workflows: a bug, API integration, UI behavior and security/data-boundary change. Preserve starting code/dependencies, issue clarity, tools/runtime, permitted context/access and human-review conditions. Compare complete results, including failures/rework, rather than select the most impressive successful demo. Avoid changing the benchmark after seeing which workflow wins; newly discovered regressions belong in development plus a separately retained holdout.

Use hard gates for instruction/permission/secret violations, omitted acceptance criteria, invented evidence and incorrect behavior. Among eligible results, record defect escape/rework, supported scope, reproducibility, review effort and elapsed task time under a declared measurement policy. Count all attempts and time spent correcting a plausible bad answer. If a live assistant/provider is involved, record actual model/tool/prompt/settings and total known/unknown usage/cost without retaining secrets. Model self-rating or two agreeing responses is not ground truth.

The observations for this one case are deliberately narrow:

| Measure | Observed | Interpretation |
|---|---|---|
| Baseline/candidate behavior |5/7→7/7 named acceptance tests | Local contract defect repaired; not a general quality score |
| Targeted defect challenges |4/4 detected by relevant check | Chosen faults are caught; not an unbiased mutation score |
| Production source diff | One expression in one source file | Focused scope, not proof smaller changes are always better |
| API/dependency/config drift | None in the fixture correction | Compatibility preserved for this case only |
| Git isolation/cleanup guards | Original clean, same-branch/dirty-removal refused | Local guard behavior verified, not complete multi-user safety |
| Human review / real issue outcome | Not performed / not applicable | Do not convert authored fixture success into professional experience |
| Productivity/cost savings | Not measured | No claim that AI was faster/cheaper than a human baseline |

A candidate that is faster but weakens a test or violates permission fails the gate. A slower result that exposes an actual specification ambiguity may be more useful than an immediate wrong patch. Decide policy before collecting data, inspect case-level errors and document unresolved uncertainty. Requalify after tool/model/dependency/instruction changes; a workflow template is not permanently correct.

## Documentation is part of the handoff

Keep the final issue description, behavior change, public contract, relevant examples, verification matrix and limitations aligned with the actual implementation. Rewrite a stale plan after scope changes. Do not document features merely suggested in a chat, future tests as already run, or an implicit deadline/backoff that the helper does not implement. Links to exact local source/artifact identities help a reviewer locate evidence; protect sensitive artifacts and avoid relying on an ephemeral scratch path as the only permanent explanation.

A concise final local handoff for this case is: explicit zero no longer selects the retry default; only undefined defaults to2, malformed values reject before reads, and the rest of the retry/cancellation API remains as specified. The baseline reproduced two failures; strict build plus7 final tests and4 defect challenges passed. Transport, outer deadlines/backoff, hosted CI and independent human review were not performed. The patch is prepared locally; no PR/push/merge/deployment happened.

Keep learner practice status separate from material checks. The supplied fixture and documentation can pass while the learner has not yet reproduced, explained or extended them. A real practice record should include the learner's own diagnosis, independent implementation, reviewed evidence and corrections; never mark it complete because an assistant generated the exercise.



References checked2026-10-25: [Node test runner/reporters](https://nodejs.org/api/test.html), [TypeScript strict checks](https://www.typescriptlang.org/tsconfig/strict.html), [Git diff evidence](https://git-scm.com/docs/git-diff), [existing task-evaluation concepts](../python-for-ai/evaluation-lab.md). Local hashes/counts above were read from the executed fixture; they are not external benchmark results.


## Separate practice

Apply the [focused requirements](../practice/engineering/ai-engineering/traceability-and-evaluation.md). All learner practice remains outstanding.
