# JavaScript MCP and graph integrations

These are small actual SDK integrations for the [MCP](../../../applied-ai/javascript/mcp.md) and [stateful workflow](../../../applied-ai/javascript/stateful-workflows.md) lessons. They use no model, key, private notes or write operation. Run the dependency-free [starter](../javascript/) first.

Copy **both** `javascript` and `javascript-integrations` as siblings into an owned learner directory. This lab imports the public fixture domain function from `../javascript/core.mjs`. In `javascript-integrations`:

```sh
npm ci --ignore-scripts
npm run build
npm run test
```

The lockfile pins the dependency graph. Direct packages are MCP TypeScript SDK 1.32.2, LangGraph.js 1.5.3 and Zod 3.25.76. The source is JavaScript; TypeScript conversion is optional practice. `build` checks source syntax, not TS types. Trace export is not configured or needed; keep hosted tracing disabled for private work.

## Protocol and graph checks

<<< ./check.mjs

The MCP portion starts an actual stdio subprocess, discovers capabilities, exercises allowed and invalid tool input, reads a resource, gets a prompt and closes the connection. It does not test a desktop host UI, HTTP transport or remote authentication.

The graph portion runs both branches through interruption/resumption and checks distinct RAM threads. The resume payload is an object `{ approved: boolean }`, validated by the review node. No real human approval channel is implemented, and approval never performs a write. RAM checkpoints disappear with a new process.

## Server and graph source

The full [MCP server](../../../applied-ai/javascript/mcp.md) and [graph source](../../../applied-ai/javascript/stateful-workflows.md) appear in their lesson owners, directly included from these files. Read them there before running the checks. The pins and lockfile make the tested examples reproducible; they do not assert that every newer online snippet is compatible.

See [verification and limits](../../../applied-ai/javascript/verification.md). Independent JS-07/08 work remains required.
