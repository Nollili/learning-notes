# Build your own MCP server {#_6-build-your-own-mcp-server}

An ordinary tool function works inside your app. MCP gives a host application a standard way to discover and use capabilities from a separate server. You can expose the same notes function to multiple compatible hosts without writing a custom integration for each one.

MCP does not require an LLM inside the server. Our server reads three public synthetic notes and uses no provider key.

## Understand the three roles and primitives

The **host** is the AI application. It owns an MCP **client** connection to a **server** that offers capabilities. Your Node MCP server is distinct from the HTTP backend of your chatbot, although both could reuse the same domain functions.

| Primitive | In the worked server | How to think about it |
|---|---|---|
| Tool | `get_note({ id: 'n1' })` | A checked operation with arguments |
| Resource | `study://guide` | Readable context with a stable URI |
| Prompt | `explain-note` with an ID argument | A reusable user-invoked interaction template |

The server describes tools through schemas. A schema does not grant filesystem or account permission. Our tool maps IDs to public data; it accepts no arbitrary paths, URLs, commands or private credentials.

## Run the actual SDK example

After the plain tool lesson, copy both sibling directories `javascript` and `javascript-integrations` from `docs/workbench/applied-ai` into one learner parent directory. The integration imports the shared public notes function from its sibling. In `javascript-integrations`:

```sh
npm ci --ignore-scripts
npm run build
npm run test
```

The [integration workbench](../../workbench/applied-ai/javascript-integrations/) pins dependencies and retains a lockfile. Its test launches `mcp-server.mjs` as a real child process, initializes an SDK connection, lists tools, calls one, rejects a bad ID, reads a resource, obtains a prompt and closes the connection. The same script also checks the later graph exercise. You can read the MCP portion first; running it does not mean you have completed the graph lesson.

Read the server after predicting each result:

<<< ../../workbench/applied-ai/javascript-integrations/mcp-server.mjs

This source is JavaScript using the TypeScript SDK package. Converting it to `.ts` with a build and typed boundaries is a useful later exercise. The SDK owns protocol framing and negotiation; do not invent a second JSON-RPC implementation just to run this lesson.

## Connect it to a host deliberately

First use the included SDK client check. For your own approved host, configure an absolute Node executable and the absolute `mcp-server.mjs` path using that host's current MCP settings. Keep the two sibling folders. Start with discovery and one read; record the actual listed capability and result. The automated check is a protocol integration test, not proof that a particular desktop host was configured.

For **stdio**, the host starts a child process and uses its standard streams for protocol messages. Never use `console.log` for diagnostics in that server; stdout belongs to MCP. Use stderr sparingly and close child connections. A process runs with its OS authority: MCP is not a sandbox.

Remote **Streamable HTTP** introduces network identity, authentication, origin checks, limits and deployment. Learn it after local stdio works. Do not expose the study server publicly or copy a legacy SSE example without checking versions.

**Your exercise:** independently expose a second public read tool and resource, check discovery/invalid arguments, then connect your own host. Keep host-specific settings outside the lesson's public files. Add no write operation yet.

**Done:** explain each role, distinguish the three primitives, and show actual discovery/call/cleanup. [Next: stateful workflows](./stateful-workflows.md). Existing [MCP deep dive](../../python-for-ai/mcp-primitives.md) remains available.

Reference checked 2026-10-28: [official MCP server tutorial](https://modelcontextprotocol.io/docs/develop/build-server). The fixture pins an SDK version; a newer tutorial may use different imports.
