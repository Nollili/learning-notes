# MCP: roles, tools, resources and prompts — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/mcp-primitives.md)

## Practice and acceptance

1. Reproduce the locked SDK checks and explain which object acts as client/server and what the host still must decide. Retain versions and command output.
2. Add one bounded public resource and one user-selected prompt; verify listing versus actual reading/rendering and prove rendering makes no provider/tool call.
3. Add a missing-ID and malformed-input case, inspect `is_error`, and reject an unexpected output shape at the client. Do not expose raw exception details or credentials.
4. Explain when a direct function is preferable to MCP, and write the principal/data/action policy needed before changing the fixture from public to private data.
Learner implementation and independent explanation remain **still required**. Passing the supplied protocol fixture does not establish secure deployment, successful model behavior or professional readiness.

Next: [schema, discovery and real stdio connection ownership](../../../python-for-ai/mcp-connections.md). The later lesson records actual subprocess checks separately from this chapter's original in-memory evidence.
