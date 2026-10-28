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
