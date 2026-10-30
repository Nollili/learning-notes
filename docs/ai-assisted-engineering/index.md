# AI for Software Development

Use an AI assistant to understand a repository, fix bugs, develop features, test changes and prepare a reviewable PR handoff. You remain responsible for the requirements, code and evidence. No AI-development or Python knowledge is required to begin; use a small JavaScript/TypeScript repository you understand.

Want to **build chatbots, RAG, workflows and MCP servers**? Follow [Build AI Apps — JavaScript First](../applied-ai/). That path teaches the product you build; this path teaches how to work on software with AI. You can study them together.

## Begin with a concrete task

Start with [getting started](./getting-started.md), then the [catalogue mutation bug](./bug-fixing.md). The continuing project is a tiny TypeScript notes catalogue, separate from the chatbot's UI. You will reproduce a defect, fix it, then add a query/limit feature. Its [worked source](../workbench/engineering/ai-engineering/catalogue/) is a reference to inspect after making your own prediction.

| Stage | Lesson | Observable result |
|---|---|---|
| 1 | [Getting started with a coding assistant](./getting-started.md) | A precise task, repository context and an inspected proposed change |
| 2 | [Fix a bug](./bug-fixing.md) | Reproducer fails before the correction and passes afterward |
| 3 | [Develop a feature](./feature-development.md) | Acceptance criteria map to a focused implementation and checks |
| 4 | [Test and debug](./testing-debugging.md) | Classify failures and challenge generated tests with a meaningful defect |
| 5 | [Review and prepare a PR](./review-pr.md) | Actual diff review and factual local handoff |
| 6 | [Reusable workflows and tools](./reusable-tools.md) | A runbook, scoped context and a reasoned tool choice |
| 7 | [Advanced coordination](./advanced-coordination.md) | Explain when worktrees or multiple agents help and how to reconcile results |

Use the [independent development projects](../practice/engineering/ai-engineering/development-project.md). All learner practice remains outstanding. The reference's passing checks do not establish your own independent capability or a separate human review.

## Retain the existing engineering depth

The previous four lessons remain unchanged and available for the next layer:

- [Issue to a reviewed local change](./issue-to-reviewed-change.md): detailed retry-bug investigation and contract analysis.
- [Verification and permissions](./verification-and-permissions.md): evidence, API checks and defect challenges.
- [Local workflow and Git](./local-workflow-and-git.md): repeatable stages, worktrees and safe local handoffs.
- [Traceability and evaluation](./traceability-and-evaluation.md): requirement mapping and measured outcomes.

This repository forbids remote pushes. Prepare changes and PR text locally; only the user may push. Do not claim a PR, CI result or independent review exists unless it actually does.
