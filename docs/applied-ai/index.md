# Build AI Apps — JavaScript First

Start here if you know some JavaScript but are new to AI development. Build a chatbot inside a web app, let it use a checked tool, teach it to answer from your notes, and expose those notes through your own MCP server. Python is an optional continuation, not an entrance requirement.

Want help **using AI to fix bugs, develop features and prepare PRs**? Follow [AI for Software Development](../ai-assisted-engineering/) alongside this path. That course teaches your development process; this one teaches the software you build.

## Start with one small project

The continuing project is a **learning-notes assistant** using three public synthetic notes. Begin in offline simulation mode: no account, key or paid model is required. A simulation teaches request flow and UI behavior; it cannot demonstrate model intelligence or quality. Try a real provider only after understanding the server boundary and recording a small experiment budget.

**Your first session:** read [0. Understand the pieces](./javascript/orientation.md), run the console in [1. First call](./javascript/first-call.md), ask one question, reset the conversation and exit. Do not install a graph framework or study every Python chapter first.

## Follow this sequence

| Stage | Learn and build | Done when you can… |
|---|---|---|
| 0 | [Understand the pieces](./javascript/orientation.md) | Explain model, application, prompt, context, tool, workflow, agent, RAG and MCP in your own words |
| 1 | [First request and console chat](./javascript/first-call.md) | Run offline, locate the provider boundary and explain where the key belongs |
| 2 | [Chatbot inside a web app](./javascript/chatbot.md) | Trace browser→server→model, handle failure, retain bounded history and stop a request |
| 3 | [Reliable structured output](./javascript/structured-output.md) | Validate a result and reject a fabricated quote |
| 4 | [Tools and workflows](./javascript/tools-workflows.md) | Dispatch only an allowed read and prepare a proposal without executing it |
| 5 | [RAG from your notes](./javascript/rag.md) | Compare lexical and semantic retrieval, cite sources and decline unsupported answers |
| 6 | [Build an MCP server](./javascript/mcp.md) | Discover and call an SDK tool, read a resource and retrieve a prompt |
| 7 | [Stateful graph workflows](./javascript/stateful-workflows.md) | Branch, interrupt and resume a graph; distinguish RAM from durable state |
| 8 | [Choose your next extension](./javascript/extensions.md) | Choose Python, hosted storage, n8n, multimedia or A2A for a concrete need |

Use the [JavaScript practice milestones](../practice/applied-ai/javascript-assistant.md) for independent implementation. The [starter workbench](../workbench/applied-ai/javascript/) is a worked reference, not a completed learner submission. Each lesson separates supplied behavior from the extension you implement.

## Keep the deeper material

The existing lessons and URLs remain available. Visit them when a project reaches the relevant problem:

- [Shared foundations](./shared/): model schemas, budgets, security, evaluation and diagnostics.
- [RAG engineering](./rag/): provenance, retrieval quality, access control and index lifecycle.
- [Workflow engineering](./workflows/): approvals, durable recovery, receipts and controlled autonomy.
- [n8n](./n8n/): visual automation and service integration.
- [Python for AI — Optional Deep Dive](../python-for-ai/): language prerequisites and existing detailed implementations.

The [coverage map](./coverage-map.md) distinguishes beginner JavaScript examples, deeper Python mechanisms and integrations still left to the learner. Reading, a mock response and passing reference checks are different observations; none completes your independent project.
