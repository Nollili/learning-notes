# Typed Tool Arguments, Authorization and Results

A model tool call is a proposed application operation. A schema describes acceptable argument shapes; it does not grant permission, execute a function or establish correctness. Keep the primary Python3.13/OpenAI SDK3.35.1 project and a small allowlist of application-owned tools. Start with one read-only note lookup rather than a general shell, SQL or arbitrary-URL tool.

## The contract before the loop

The model proposes lookup_note with a source_id. The application obtains the principal from its authenticated session, validates the argument bytes/schema, loads the current record, checks tenant and subject permission and returns a projected bounded result. The model cannot supply tenant, subject, credentials or permission flags. A guessed source ID cannot expand access. Tool output is untrusted evidence for later reasoning, never a new application instruction.

A current record read is important: index-time permission and a conversation's earlier permission may be stale. This in-process fixture demonstrates the decision boundary; a real store must specify current authorization consistency and fail closed on unavailable/deleted/revoked data. Do not claim a dictionary fixture implements durable ACL transactions.

<<< ../workbench/applied-ai/python/study_ai/note_tool.py


The tool definition is the pinned SDK's function-tool shape; it does not invoke a model. Strict structured arguments help generation, while the application still parses and validates every call. Additional fields, wrong types, duplicate JSON keys, non-JSON numeric constants and oversized/invalid-Unicode arguments reject before the store is consulted. Runtime JSON can be deeply nested; the byte cap limits input and recursion failure has a fixed safe result. A real transport must also bound incoming bytes before building an arbitrarily large string. Types/Pydantic do not authenticate a caller or prove an internal StoredNote came from trusted storage.

## Errors are outcomes with a recovery policy

| Result | Meaning | Owner response |
|---|---|---|
| ok | Authorized current record projected to a prefix | Treat excerpt as evidence, with version and truncation visible |
| invalid_arguments | Proposal failed the accepted JSON/schema/size contract | No I/O; allow only a bounded correction attempt if the workflow permits |
| unavailable | Missing, foreign, denied or mismatched record | Do not disclose which condition, title or hidden ID caused it; no factual conclusion about existence |
| temporary_failure | Explicit storage outage | Preserve recoverable failure; do not turn into no evidence or silently retry forever |
| unknown_tool | Not in the exact allowlist | No dynamic import/eval/reflection or fallback execution |

Unexpected programming exceptions are not silently converted into a successful tool result. The service boundary should catch/report them as a fixed internal failure with protected diagnostics, never raw exception/record content. The example catches only the store's explicit operational exception. Real database/network adapters need deadlines, concurrency limits, cancellation and safe error translation; this synchronous bounded fixture cannot cancel a blocking database call or establish a latency guarantee.

ToolSuccess includes source revision and a visible prefix/truncated flag. A prefix can omit the relevant qualification, so the model must not treat it as the full document. Use an authorized span/pagination contract for a complete evidence flow; the [citation resolver](./retrieval-context.md) owns exact checked spans. Success does not prove the source is true, the answer is supported or a subsequent citation is authorized. Do not include raw ACLs, tenant data, hidden titles or credentials in results. The input contains no URL/path, so this tool cannot be repurposed as an arbitrary fetch or file reader.

## Wire a provider only after the application boundary

In an eventual Responses loop, supply lookup_definition as an application-owned tool. Inspect only the SDK's function-call output items, allowlist the name, and validate the call's complete arguments before dispatch. Return the projected JSON as a function-call result tied to that actual call_id; do not invent a call ID, substitute another call's result or turn returned source text into developer instructions. Preserve required response items/state under the selected API's documented contract. A response can request multiple calls; serial versus parallel execution, per-call/overall deadlines and resource limits must be explicit. Parallel tool calling is not permission to run unbounded work.

Count tool definitions, current instructions, history and results in the actual request budget. Cap total rounds/calls/bytes/time/spend, and stop on a final answer or a controlled failure. A model repeating a read can waste resources even when it cannot write. This lesson supplies the executable dispatch boundary, not a completed live agent loop. A fixed application workflow is preferable when the operation sequence is already known; [history and workflow checkpoints](./history-and-workflows.md) describe its recovery contract.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/tool-boundaries.md).

References checked2026-10-24: [official function calling contract](https://developers.openai.com/api/docs/guides/function-calling), [Pydantic strict validation](https://docs.pydantic.dev/latest/concepts/strict_mode/), [OWASP prompt injection controls](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html), [Python JSON decoding](https://docs.python.org/3/library/json.html). Model/tool/API support is version-sensitive; verify the actual selected provider contract before live integration.
