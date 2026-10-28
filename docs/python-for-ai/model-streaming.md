# Model Streams, Deadlines and Cancellation

Use the existing Python3.13.11/OpenAI SDK3.35.1 client with its HTTPX2 transport. HTTP SSE streaming delivers semantic events incrementally; a network chunk, an SSE event, a text delta and a token are different units. A UTF-8 character or JSON object can span network chunks. Let the SDK decode the protocol; do not split bytes on newlines and parse each chunk as complete JSON.

Streaming can reduce time until a first visible draft, but not necessarily total generation time or cost. Partial output can be wrong, refused, incomplete or disconnected later. A user-visible draft must be clearly pending and safely rendered, never an authorized action. This classifier deliberately shows only pending status until its complete validated decision is available. It does not forward raw deltas to the UI or parse JSON fragments as success.

## Own the stream and distinguish time budgets

Transport connection/pool/read timeouts cover different waits. A per-event idle deadline limits silence between SDK events, while an overall deadline limits total work even if a peer keeps sending events. Application admission/concurrency limits are separate. Cancelling a consumer must close its stream; it does not prove remote generation stopped or no cost was incurred. Do not silently reconnect/replay a partial generation and concatenate it with a new answer.

The adapter below uses the existing input/schema/error vocabulary. It caps accepted text bytes and event count, requires a successful terminal response and validates its final schema/quote. It avoids the SDK's accumulating high-level helper and explicitly closes the low-level stream. A delta must belong to the same single text item/content index. It compares streamed text with the terminal message rather than trusting whichever one happens to look valid first.

<<< ../workbench/applied-ai/python/study_ai/model_streaming.py


The provider client is still owned outside this function and closes at application lifespan end; each call owns only its response stream. Cancellation propagates because CancelledError is not converted into a model failure. An idle timer resets for every SDK event, including metadata; the overall timer prevents endless progress events. The close operation depends on a cooperative transport: this is not a hard process deadline for hostile code.

**Memory boundary:**8192 caps accepted text-delta bytes and1000 caps application event processing. It does not cap a single SSE frame, HTTP transport buffering, the terminal response envelope or SDK parsing allocations *before* the application receives an event. The terminal contains the full message as well as earlier deltas. Do not claim bounded total HTTP memory from max_output_tokens or this accumulator. A deployment needing a hard inbound frame/byte cap must implement/test it below SDK parsing and apply process/resource limits. The existing bounded NDJSON decoder is not an SSE decoder.

This lesson makes that limitation explicit rather than label an output cap a transport security guarantee.

Only one complete final text item is accepted; unsupported tool outputs fail terminal validation and are never executed. Some valid provider modes can use different content patterns, which this intentionally narrow classifier rejects. After an SDK/model upgrade, retest event types and terminal/delta identity before relaxing the contract. Schema/quote checks still do not prove category quality. A provider-side error event may be raised directly by the SDK rather than yielded; the SDK error handlers preserve a safe failure category.

## Failure timelines and UI decisions

| Timeline | Outcome |
|---|---|
| Deltas → matching completed response → valid decision | Publish one checked proposal |
| Valid-looking JSON delta → disconnect/end of stream | Incomplete; no proposal |
| Deltas → refusal or incomplete/failed terminal | Distinct failure; never parse the partial buffer as success |
| Metadata continues but overall budget expires | Timeout; close stream |
| No next event arrives before idle budget | Timeout; close stream |
| User changes query or leaves | Cancel current task/stream; frontend request identity rejects stale completion |
| UI/client becomes slow | Bound any queue or stop the producer; do not accumulate unlimited deltas |

A browser-facing implementation can stream status or safe draft text under a bounded queue, but must handle proxy buffering, disconnect propagation, authentication and safe rendering. Treat elapsed generation, final usage and missing terminal usage distinctly; a failed stream may still have incurred provider work. Do not invent final token usage or persist incomplete output as if it were accepted. Stateful/background remote cancellation is endpoint-specific and is not automatically provided by closing this HTTP stream.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/model-streaming.md).

Official references checked2026-10-22: [SSE streaming lifecycle](https://developers.openai.com/api/docs/guides/streaming-responses), [Python Responses request/events](https://developers.openai.com/api/reference/python/resources/responses/methods/create), [owned client/schema/error boundary](./model-sdk.md), [generic async resource ownership](./async-http.md). Streaming and model capabilities are version-sensitive; no paid/provider call is required for this lesson's offline checks.

## A browser owner with explicit recovery

For the primary React19.3/TypeScript5.9.3 front end, this component displays pending state until the backend's complete checked classifier result arrives. Its API port returns domain-validated data; implement the fetch/status/JSON/schema boundary separately and keep backend validation too. No raw provider deltas, keys or provider errors cross this port. ApiFailure is an application-owned fixed category, not a server message to display verbatim.

<<< ../workbench/applied-ai/ui/generation-panel.tsx


Keep api identity stable. Replacement intentionally aborts/invalidates the earlier owner and clears accepted state; the excerpt remains editable. Changing input invalidates immediately, before another submit. The epoch guard rejects a late result even if a fake/noncooperative API ignores abort. A ref blocks duplicate submissions before React has rerendered the disabled button. Cancellation is local request ownership, not proof the provider stopped charging; it never revokes a committed write. Retrying classification is an explicit new read/inference attempt, charged under application budgets. A write workflow instead needs its stable approved operation ID and receipt policy.

Rendering uses ordinary React text escaping. This is a proposed label, not an automatic publish/action. The textarea maxLength is UI feedback; server/transport byte/schema limits remain mandatory. A production UI should localize messages, retain task/source provenance and test focus/announcement/recovery behavior with supported browsers and assistive technology. role=status/alert markup alone does not establish usability or WCAG conformance. This fixture has no persistence, provider key or raw stream rendering.

[Related learner criteria](../practice/applied-ai/chapters/model-streaming.md).
