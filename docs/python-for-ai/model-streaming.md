# Model Streams, Deadlines and Cancellation

Use the existing Python3.13.11/OpenAI SDK3.35.1 client with its HTTPX2 transport. HTTP SSE streaming delivers semantic events incrementally; a network chunk, an SSE event, a text delta and a token are different units. A UTF-8 character or JSON object can span network chunks. Let the SDK decode the protocol; do not split bytes on newlines and parse each chunk as complete JSON.

Streaming can reduce time until a first visible draft, but not necessarily total generation time or cost. Partial output can be wrong, refused, incomplete or disconnected later. A user-visible draft must be clearly pending and safely rendered, never an authorized action. This classifier deliberately shows only pending status until its complete validated decision is available. It does not forward raw deltas to the UI or parse JSON fragments as success.

## Own the stream and distinguish time budgets

Transport connection/pool/read timeouts cover different waits. A per-event idle deadline limits silence between SDK events, while an overall deadline limits total work even if a peer keeps sending events. Application admission/concurrency limits are separate. Cancelling a consumer must close its stream; it does not prove remote generation stopped or no cost was incurred. Do not silently reconnect/replay a partial generation and concatenate it with a new answer.

The adapter below uses the existing input/schema/error vocabulary. It caps accepted text bytes and event count, requires a successful terminal response and validates its final schema/quote. It avoids the SDK's accumulating high-level helper and explicitly closes the low-level stream. A delta must belong to the same single text item/content index. It compares streamed text with the terminal message rather than trusting whichever one happens to look valid first.

```python
# study_ai/model_streaming.py
from __future__ import annotations

import asyncio
import math
import httpx2
from openai import APIError, APIConnectionError, APIStatusError, APITimeoutError, AsyncOpenAI, AsyncStream
from openai.types.responses import Response, ResponseStreamEvent
from pydantic import ValidationError
from .model_sdk import LabelDecision, ModelFailure, label_messages, label_text_format, validate_label_input


def checked_terminal(response: Response, source: str, text: str, item_id: str | None) -> LabelDecision:
    if response.status != "completed":
        raise ModelFailure("incomplete")
    messages = [item for item in response.output if item.type == "message"]
    if len(messages) != 1 or any(item.type not in {"message", "reasoning"} for item in response.output):
        raise ModelFailure("invalid_output")
    message = messages[0]
    if any(part.type == "refusal" for part in message.content):
        raise ModelFailure("refused")
    if (len(message.content) != 1 or message.content[0].type != "output_text"
        or message.id != item_id or message.content[0].text != text):
        raise ModelFailure("invalid_output")
    try:
        result = LabelDecision.model_validate_json(text)
    except ValidationError:
        raise ModelFailure("invalid_output") from None
    quote = result.evidence_quote
    if len(quote) > 160 or (quote and quote not in source) or (
        not quote and not (result.category == "other" and result.needs_review)
    ):
        raise ModelFailure("invalid_output")
    return result


async def stream_label(client: AsyncOpenAI, *, model: str, source: str,
                       overall: float = 10.0, idle: float = 2.0) -> LabelDecision:
    validate_label_input(model=model, source=source)
    if any(isinstance(value, bool) or not math.isfinite(value) or not 0 < value <= 30
           for value in (overall, idle)):
        raise ModelFailure("invalid_input")
    stream: AsyncStream[ResponseStreamEvent] | None = None
    pieces: list[str] = []
    size = 0
    item_id: str | None = None
    try:
        async with asyncio.timeout(overall):
            stream = await client.responses.create(
                model=model, input=label_messages(source), text=label_text_format(),
                max_output_tokens=1024, stream=True, store=False, truncation="disabled",
            )
            events = stream.__aiter__()
            for _ in range(1000):
                try:
                    async with asyncio.timeout(idle):
                        event = await anext(events)
                except StopAsyncIteration:
                    raise ModelFailure("incomplete") from None
                if event.type == "response.output_text.delta":
                    if event.content_index != 0 or (item_id is not None and item_id != event.item_id):
                        raise ModelFailure("invalid_output")
                    item_id = event.item_id
                    size += len(event.delta.encode("utf-8", errors="strict"))
                    if size > 8192:
                        raise ModelFailure("invalid_output")
                    pieces.append(event.delta)
                elif event.type in {"response.refusal.delta", "response.refusal.done"}:
                    raise ModelFailure("refused")
                elif event.type == "response.incomplete":
                    raise ModelFailure("incomplete")
                elif event.type in {"response.failed", "error"}:
                    raise ModelFailure("provider_unavailable")
                elif event.type == "response.completed":
                    return checked_terminal(event.response, source, "".join(pieces), item_id)
                # Other lifecycle/reasoning events are never published or executed.
            raise ModelFailure("invalid_output")  # Event budget, including empty deltas.
    except (APITimeoutError, httpx2.TimeoutException, TimeoutError):
        raise ModelFailure("timeout") from None
    except (APIConnectionError, httpx2.TransportError):
        raise ModelFailure("provider_unavailable") from None
    except APIStatusError as error:
        raise ModelFailure("provider_unavailable" if error.status_code == 429 or error.status_code >= 500
                           else "provider_rejected") from None
    except APIError:
        raise ModelFailure("provider_unavailable") from None
    except UnicodeEncodeError:
        raise ModelFailure("invalid_output") from None
    finally:
        if stream is not None:
            await stream.close()
```

The provider client is still owned outside this function and closes at application lifespan end; each call owns only its response stream. Cancellation propagates because CancelledError is not converted into a model failure. An idle timer resets for every SDK event, including metadata; the overall timer prevents endless progress events. The close operation depends on a cooperative transport: this is not a hard process deadline for hostile code.

**Memory boundary:**8192 caps accepted text-delta bytes and1000 caps application event processing. It does not cap a single SSE frame, HTTP transport buffering, the terminal response envelope or SDK parsing allocations *before* the application receives an event. The terminal contains the full message as well as earlier deltas. Do not claim bounded total HTTP memory from max_output_tokens or this accumulator. A deployment needing a hard inbound frame/byte cap must implement/test it below SDK parsing and apply process/resource limits. The existing bounded NDJSON decoder is not an SSE decoder. This lesson makes that limitation explicit rather than label an output cap a transport security guarantee.

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

Use actual SDK parsing over synthetic SSE bytes with a fake key and no network. Split UTF-8 across transport chunks; split JSON text across deltas; emit a completed response with the exact accumulated text/item ID. Test disconnect after valid-looking JSON, refusal, failed/incomplete terminal, wrong item/content index, terminal mismatch, invented quote, >8192text bytes,1000empty events, read error, slow idle, continually active overall timeout, external cancellation and invalid input with zero requests. Assert response stream/client closure and safe error categories; no raw provider/source bodies enter errors.

**Acceptance:** strict checks/tests pass; only checked terminal output is returned; cancellation and both deadlines close cooperative transport; preview never becomes an action; application caps are distinguished from unimplemented transport-frame caps. A separately authorized live/browser integration, real provider usage/latency/backpressure, hard pre-parser frame limits and learner implementation remain unperformed. Those limits must be resolved before claiming a hostile-input production boundary.

Official references checked2026-10-22: [SSE streaming lifecycle](https://developers.openai.com/api/docs/guides/streaming-responses), [Python Responses request/events](https://developers.openai.com/api/reference/python/resources/responses/methods/create), [owned client/schema/error boundary](./model-sdk.md), [generic async resource ownership](./async-http.md). Streaming and model capabilities are version-sensitive; no paid/provider call is required for this lesson's offline checks.

## A browser owner with explicit recovery

For the primary React19.3/TypeScript5.9.3 front end, this component displays pending state until the backend's complete checked classifier result arrives. Its API port returns domain-validated data; implement the fetch/status/JSON/schema boundary separately and keep backend validation too. No raw provider deltas, keys or provider errors cross this port. ApiFailure is an application-owned fixed category, not a server message to display verbatim.

```tsx
// generation-panel.tsx
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
export type Decision = {
  category: 'frontend' | 'backend' | 'ai' | 'other';
  evidence_quote: string; needs_review: boolean;
};
export type FailureCode = 'timeout' | 'incomplete' | 'unavailable' | 'refused' | 'invalid_output';
export class ApiFailure extends Error {
  constructor(readonly code: FailureCode) { super(code); }
}
export type ClassifyApi = (source: string, signal: AbortSignal) => Promise<Decision>;
type View = { status: 'idle' } | { status: 'pending' }
  | { status: 'ready'; decision: Decision } | { status: 'failed'; code: FailureCode };
const messages: Record<FailureCode, string> = {
  timeout: 'The request timed out. You can retry.',
  incomplete: 'The result was incomplete. Reduce the excerpt or retry.',
  unavailable: 'The service is unavailable. Retry when it recovers.',
  refused: 'The service declined this request. Review the excerpt.',
  invalid_output: 'The result could not be validated. No proposal was accepted.',
};
export function GenerationPanel({ api }: { api: ClassifyApi }) {
  const [source, setSource] = useState('');
  const [view, setView] = useState<View>({ status: 'idle' });
  const active = useRef<AbortController | null>(null);
  const epoch = useRef(0);
  const invalidate = () => { epoch.current++; active.current?.abort(); active.current = null; };
  useEffect(() => {
    setView({ status: 'idle' });
    return () => { epoch.current++; active.current?.abort(); active.current = null; };
  }, [api]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active.current !== null || !source.trim()) return;
    const controller = new AbortController();
    active.current = controller;
    const request = ++epoch.current;
    const submitted = source;
    setView({ status: 'pending' });
    try {
      const decision = await api(submitted, controller.signal);
      if (epoch.current === request && !controller.signal.aborted)
        setView({ status: 'ready', decision });
    } catch (error) {
      if (epoch.current === request && !controller.signal.aborted)
        setView({ status: 'failed', code: error instanceof ApiFailure ? error.code : 'unavailable' });
    } finally {
      if (active.current === controller) active.current = null;
    }
  }
  return <form onSubmit={submit}>
    <label>Study excerpt<textarea value={source} maxLength={4000} onChange={event => {
      invalidate(); setSource(event.currentTarget.value); setView({ status: 'idle' });
    }} /></label>
    <button type="submit" disabled={view.status === 'pending' || !source.trim()}>
      {view.status === 'failed' ? 'Retry classification' : 'Classify excerpt'}
    </button>
    {view.status === 'pending' && <button type="button" onClick={() => {
      invalidate(); setView({ status: 'idle' });
    }}>Cancel request</button>}
    <p role="status">{view.status === 'pending' ? 'Classifying; no result accepted yet.' :
      view.status === 'idle' ? 'Ready for an excerpt.' : ''}</p>
    {view.status === 'failed' && <p role="alert">{messages[view.code]}</p>}
    {view.status === 'ready' && <section aria-label="Classification proposal">
      <p>{view.decision.category}</p><blockquote>{view.decision.evidence_quote}</blockquote>
      <p>{view.decision.needs_review ? 'Review required' : 'Proposal ready for your review'}</p>
    </section>}
  </form>;
}
```

Keep api identity stable. Replacement intentionally aborts/invalidates the earlier owner and clears accepted state; the excerpt remains editable. Changing input invalidates immediately, before another submit. The epoch guard rejects a late result even if a fake/noncooperative API ignores abort. A ref blocks duplicate submissions before React has rerendered the disabled button. Cancellation is local request ownership, not proof the provider stopped charging; it never revokes a committed write. Retrying classification is an explicit new read/inference attempt, charged under application budgets. A write workflow instead needs its stable approved operation ID and receipt policy.

Rendering uses ordinary React text escaping. This is a proposed label, not an automatic publish/action. The textarea maxLength is UI feedback; server/transport byte/schema limits remain mandatory. A production UI should localize messages, retain task/source provenance and test focus/announcement/recovery behavior with supported browsers and assistive technology. role=status/alert markup alone does not establish usability or WCAG conformance. This fixture has no persistence, provider key or raw stream rendering.

**UI acceptance:** pending blocks repeated submit, cancel propagates abort, input change/API replacement/unmount reject stale completion, and the current checked result alone displays as a proposal. Test timeout/incomplete/refusal/invalid-output/service failures with fixed safe messages; retry preserves the excerpt, clears the old error and starts a distinct owned request. Confirm raw exception/source text is absent from error UI. Use controlled deferred promises for out-of-order/cancellation races. Then run a real browser/fetch/backend flow with buffering/disconnect/keyboard/AT checks; DOM tests do not establish native network or announcement behavior. Learner UI and full-service practice remain required.
