# Tools and workflows {#_4-tools-and-workflows}

A model generates text. A tool lets your application perform a specific operation. “Read note n1” becomes useful only when your code checks the request and calls a function that can read that note.

Start with ordinary functions before asking a model to choose them. You can understand and test the tool boundary without an agent framework.

## Run a checked read

Run `npm run demo` in the [starter](../../workbench/applied-ai/javascript/). Inspect `dispatch` and `getNote` in `core.mjs`:

```js
const note = dispatch('get_note', { id: 'n1' });
```

Only the name `get_note` is allowed. Arguments must contain exactly one string `id`, and that ID must refer to one of three public fixture notes. A path such as `../private` is not a note ID. The dispatcher does not interpret tool names as JavaScript, import modules dynamically or run shell commands.

This catalogue is synthetic and public. A real notes app must obtain the user identity from its authenticated server context and check current note access. A model-provided `userId` cannot supply that identity. Follow [tool authorization depth](../../python-for-ai/tool-boundaries.md) when adding real users.

## Give the model a description, not execution authority

A Responses tool definition might describe this function as:

```js
const tool = {
  type: 'function', name: 'get_note',
  description: 'Read a public study note by ID.',
  parameters: {
    type: 'object', properties: { id: { type: 'string', enum: ['n1', 'n2', 'n3'] } },
    required: ['id'], additionalProperties: false
  }, strict: true
};
```

This is a declaration to attach to a request, not a standalone tool loop. The complete interaction is:

1. Send the user task and available tool descriptions.
2. Receive a completed function-call item, including its call ID and arguments.
3. Parse and validate the complete arguments; check current permissions and limits.
4. Execute the allowed function and retain its actual result.
5. Return a function-call output tied to that exact call ID.
6. Ask the model for a final answer, or continue within a small overall call limit.

Preserve the provider's required response items when continuing the conversation. Never execute incomplete streamed arguments. Unknown tools, invalid JSON and exhausted budgets terminate safely. The supplied demo stops at deterministic dispatch; the model-selected loop is independent practice JS-05.

## Separate workflows from agents

`validate → get_note → format` is a fixed workflow: your code chooses the stages. Letting a model select `get_note` or `finish` adds agent-directed choice. It still needs allowed routes and a maximum number of attempts. Start with the fixed version and compare whether model-directed routing actually helps.

For write-like behavior, `proposeRename` returns a pending proposal. `reviewProposal` records a synthetic boolean review decision. **Neither changes a note.** A true write needs exact command binding, authenticated approval, current resource/version checks and a receipt. A button labeled Approve does not supply all of those automatically.

**Your exercise:** add a read-only `list_notes` tool to your learner implementation, with explicit output and no path input. Reject unknown names, extra arguments and a forged identity. Then create a three-step fixed workflow. Only afterward add a bounded model tool loop.

**Done:** you can distinguish description, proposed call, validation, execution and result. Demonstrate that invalid calls perform zero forbidden reads. [Next: RAG](./rag.md).

API contract checked 2026-10-28: [official function-calling guide](https://developers.openai.com/api/docs/guides/function-calling). The plain dispatcher is not an already implemented provider loop.
