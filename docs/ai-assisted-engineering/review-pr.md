# Review changes and prepare a PR {#_5-review-changes-and-prepare-a-pr}

A completed implementation needs an actual reviewable change and an accurate explanation. Generated PR text is useful after you know the final diff and verification results.

## Review the final candidate

Read the task next to the actual diff. For the catalogue feature, check normalization, default versus explicit zero, sort-before-limit, ID ties, invalid options and input ownership. Inspect callers and new files too: a tracked-file diff can omit untracked additions.

Ask an assistant to identify concrete defects with an input that triggers them. “Could be more robust” is not enough. A useful finding explains the failing behavior, its requirement and where the correction belongs. A review that finds no issue is not proof of correctness or independent human approval.

Keep these review questions near the code:

- Does the implementation satisfy the agreed behavior and preserve useful existing behavior?
- Do tests fail against a meaningful broken candidate?
- Are credentials, private content or executable model output exposed?
- Did dependencies, configuration or generated files change unnecessarily?
- Are incomplete, cancelled and failed states reported accurately?

## Prepare factual PR text

Lead with the concrete trigger and new behavior. For the worked feature a suitable title is **“Add bounded title search to the notes catalogue.”** A description can say that queries are trimmed and matched case-insensitively, results sort before limiting, and explicit zero is preserved. Add actual build/test outcomes from your candidate, not copied workbench outcomes.

Do not claim hosted CI passed, a linked issue closed or a reviewer approved unless those events happened. List meaningful limits: this pure helper is not an authenticated endpoint, semantic search engine or deployed UI.

## Use a local handoff record

Retain task/acceptance criteria, candidate identity or saved diff, changed files, actual check commands/results, review findings and unresolved gaps. For a real repository include the relevant base revision; do not invent one for an uncommitted standalone exercise.

This hub forbids remote pushes. Preparing a title/body is local work; creating or updating a remote PR is a separate external action requiring task authorization. The user alone may push. Do not turn a course exercise into automatic publication.

**Your exercise:** review your independent bug fix and feature, correct a concrete finding, then prepare separate local PR summaries. A bug fix and feature can share a study repository without needing one giant PR.

**Done:** a reader can understand the problem, behavior, evidence and limits without reading your chat history. [Next: reusable workflows and tools](./reusable-tools.md). Use [traceability depth](./traceability-and-evaluation.md) for larger changes.
