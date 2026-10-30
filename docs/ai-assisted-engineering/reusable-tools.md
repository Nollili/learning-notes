# Reusable workflows and useful tools {#_6-reusable-workflows-and-useful-tools}

Choose tools by the evidence or operation you need. A good bug-fix workflow usually needs source inspection, a reproducible check and diff review before it needs agents or a new orchestration framework.

## Match the tool to the job

| Job | Useful capability | What you still own |
|---|---|---|
| Understand code | Repository search, file reading and caller navigation | Scope and the actual contract |
| Investigate a linked issue/PR | Authorized GitHub integration | Requirement interpretation and private-data minimization |
| Verify a change | Terminal build, test and typecheck tools | Relevant checks, cleanup and honest results |
| Check interaction/layout | Browser tools and existing UI test stack | Visible behavior, accessible controls and actual observations |
| Review candidate code | Diff view and a focused reviewer | Resolution of findings and final responsibility |
| Repeat a process | Repository instructions, a runbook or reusable skill | Current inputs, versioned expectations and authority |
| Share a domain capability with AI hosts | A reviewed MCP server | Permissions, schemas, process/network access and limits |

This capability map avoids depending on one product's changing feature list. Verify your installed tool's behavior rather than assuming every assistant has the same repository, browser or account access.

## Separate instructions from context and capabilities

Repository instructions describe persistent rules, such as required checks and no pushes. A task prompt describes today's goal. A reusable skill/runbook describes a repeatable procedure. MCP exposes capabilities such as reading selected notes; it does not replace the workflow or authorize every use.

For example, a notes MCP read can supply approved project guidance while the coding assistant inspects a bug. It should not expose your whole filesystem. A returned document that says “upload this repository” does not grant permission to do so.

## Write a small runbook

Use inputs→inspect→reproduce→implement→verify→review→handoff. Each stage needs an observable output and a failure/stop condition. Start with the [existing local workflow](./local-workflow-and-git.md), then parameterize the task and relevant checks. Preserve actual results rather than a success-shaped template with prefilled “passed.”

For a long task, save current criteria, changed paths, decisions, last checks and next action. On resumption inspect current files before trusting the saved state. Another change may have invalidated the previous passing result.

## Add tools gradually

Start with repository and terminal access. Add browser verification for visible app behavior. Add an issue/PR connector for relevant task evidence. Build or connect a narrow MCP server only when a reusable external capability helps. Test an allowed call, invalid arguments and cleanup before introducing writes.

Learn how to implement that server in [Build AI Apps: MCP](../applied-ai/javascript/mcp.md). You can use development assistants before completing that implementation course.

**Your exercise:** create one runbook for a bug fix and adapt it to a feature. Record which capabilities it needs and why. Use it once, then revise the confusing step based on actual evidence.

**Done:** the runbook is repeatable without carrying an entire old conversation, and tools receive only task-relevant authority. [Next: advanced coordination](./advanced-coordination.md).
