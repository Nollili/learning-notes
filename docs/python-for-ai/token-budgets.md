# Tokens, Context and Explicit Budget Rejection

Continue the pinned Python/OpenAI SDK3.35.1 project. A token is a model-tokenizer unit, not a word, character, UTF-8 byte or grapheme. A word can span several tokens; punctuation, whitespace, code, uncommon names and different languages change segmentation. Token IDs are vocabulary-specific. Do not store character offsets from the extraction lesson as if they were token offsets, or compare token IDs from different tokenizers as semantic similarity.

## Distinguish the limits

| Limit | What it bounds | What it does not prove |
|---|---|---|
| Source/request bytes | Transport/parser allocation and accepted upload size | Model input-token count |
| Input tokens | The actual serialized model input, including relevant structure | Enough output capacity or good retrieval |
| Context window | The model's supported combined context under its accounting rules | Maximum useful output or perfect recall |
| Output-token cap | Generated output budget, including applicable non-visible tokens | A requested number of visible words or valid complete JSON |
| Application deadline | How long this caller waits | Remote cancellation or zero charge |
| Spend/request budget | Account/application resource policy | Accuracy, authorization or data privacy |

Configure context and output limits from the selected model/snapshot's current official contract. No real model limit is hardcoded below; the tests use a fictional2048-token window. Large advertised context is not reliable recall of every fact. Test questions whose supporting evidence occurs early/middle/late and measure citation quality. Sending all available notes can increase irrelevant/conflicting content and prompt-injection exposure while raising cost and latency.

A simple conservative admission rule is:

`counted_input + reserved_output + safety_margin <= configured_context_window`

Also require reserved_output <= the model's separate output limit. Do not add reasoning twice when the selected API already counts it inside the output cap. For this application the output reserve is also the actual generation max_output_tokens value. Example:2048 total,1024 output and128 margin leaves896 input. An input count of896 fits;897 is rejected. These numbers teach the arithmetic, not a model recommendation.

## Count the actual payload

A local tokenizer is useful for plain-text exploration when its encoding matches the selected model. `len(text)`, word splitting and a universal characters/4 rule are not exact counters. Message boundaries, instructions, tools, schemas and multimodal representations can add costs beyond the visible source text. Use the provider's counting interface for the actual reviewed payload when exact admission matters; counting itself sends the input to that provider and needs the same data/credential/network policy as generation.

The implementation reuses the SDK lesson's deterministic message/schema builders, then counts and generates with the same model/source/schema. There is no mutable remote conversation, previous-response chain, file URL or tool state in this exercise. If you add those, counting a stale state and generating against a changed state is not a stable admission proof. Snapshot/version the state or serialize its ownership, then count the exact final request again.

```python
# study_ai/token_budgets.py
from __future__ import annotations

import asyncio
from dataclasses import dataclass

from openai import APIConnectionError, APIStatusError, APITimeoutError, AsyncOpenAI

from .model_sdk import (LabelDecision, ModelFailure, label_messages, label_text_format,
                        propose_label, validate_label_input)


class ContextBudgetExceeded(Exception):
    pass


@dataclass(frozen=True, slots=True)
class TokenBudget:
    context_window: int
    model_output_limit: int
    output_cap: int = 1024
    margin: int = 128

    def __post_init__(self) -> None:
        values = (self.context_window, self.model_output_limit, self.output_cap, self.margin)
        if any(type(value) is not int for value in values):
            raise ValueError("Token limits must be integers")
        if not (1 <= self.context_window <= 10000000 and 1 <= self.model_output_limit <= 10000000
                and 1 <= self.output_cap <= min(32768, self.model_output_limit) and self.margin >= 0
                and self.output_cap + self.margin < self.context_window):
            raise ValueError("Invalid token budget")

    def admit(self, input_tokens: int) -> None:
        if type(input_tokens) is not int or input_tokens < 0:
            raise ModelFailure("invalid_output")
        if input_tokens + self.output_cap + self.margin > self.context_window:
            raise ContextBudgetExceeded("Input exceeds the configured context budget")


async def propose_with_budget(client: AsyncOpenAI, *, model: str, source: str,
                              budget: TokenBudget) -> LabelDecision:
    validate_label_input(model=model, source=source)
    try:
        # One overall deadline includes preflight plus the generation call.
        async with asyncio.timeout(12.0):
            counted = await client.responses.input_tokens.count(
                model=model, input=label_messages(source), text=label_text_format(),
            )
            budget.admit(counted.input_tokens)
            return await propose_label(client, model=model, source=source, output_cap=budget.output_cap)
    except (APITimeoutError, TimeoutError):
        raise ModelFailure("timeout") from None
    except APIConnectionError:
        raise ModelFailure("provider_unavailable") from None
    except APIStatusError as error:
        raise ModelFailure("provider_unavailable" if error.status_code == 429 or error.status_code >= 500
                           else "provider_rejected") from None
```

The count endpoint does not accept every generation option; pass the shared context-affecting fields it supports, not an unfiltered create payload. No output cap/store field is sent to the count request. Its truncation parameter is deprecated in the checked reference, so this example omits it there; the generation call still explicitly disables automatic input truncation. Review both endpoint schemas when upgrading.

The dataclass's upper bounds are teaching application caps, not provider limits. Runtime validation rejects bool even though Python considers it an int subclass. A malformed negative/non-integer returned count becomes invalid_output; over-budget input has a distinct recoverable outcome before any generation call. Provider count failure stops the workflow instead of silently falling back to an unsafe estimate. Count and generation both use the owned no-retry client; a later policy can add bounded retries without hiding additional attempts.

## Exact-limit and SDK integration checks

```python
# lab_tests/test_token_budgets.py
from __future__ import annotations

import asyncio
import json

import httpx2
import pytest

from study_ai.model_sdk import ModelFailure, open_model_client
from study_ai.token_budgets import ContextBudgetExceeded, TokenBudget, propose_with_budget
from lab_tests.test_model_sdk import KEY, MODEL, SOURCE, VALID, envelope, text_item


def test_budget_math_and_configuration():
    budget = TokenBudget(context_window=2048, model_output_limit=1024)
    budget.admit(896)
    with pytest.raises(ContextBudgetExceeded):
        budget.admit(897)
    for value in [True, -1, 1.5]:
        with pytest.raises(ModelFailure, match="invalid_output"):
            budget.admit(value)
    for values in [dict(context_window=True, model_output_limit=1024),
                   dict(context_window=2048, model_output_limit=512),
                   dict(context_window=1024, model_output_limit=1024),
                   dict(context_window=2048, model_output_limit=1024, margin=-1)]:
        with pytest.raises(ValueError):
            TokenBudget(**values)


@pytest.mark.parametrize("count,expected_paths", [(896, ["/v1/responses/input_tokens", "/v1/responses"]),
                                                  (897, ["/v1/responses/input_tokens"])])
def test_count_and_generate_share_context_and_reject_early(count, expected_paths):
    requests = []
    def handler(request):
        body = json.loads(request.content)
        requests.append((request.url.path, body))
        if request.url.path.endswith("/input_tokens"):
            assert "max_output_tokens" not in body and "store" not in body
            return httpx2.Response(200, json={"object": "response.input_tokens", "input_tokens": count})
        count_body = requests[0][1]
        for key in ["model", "input", "text"]:
            assert body[key] == count_body[key]
        assert body["max_output_tokens"] == 1024 and body["truncation"] == "disabled"
        return httpx2.Response(200, json=envelope([text_item(VALID)]))
    async def run():
        async with open_model_client(KEY, transport=httpx2.MockTransport(handler)) as client:
            if count == 897:
                with pytest.raises(ContextBudgetExceeded):
                    await propose_with_budget(client, model=MODEL, source=SOURCE,
                                              budget=TokenBudget(2048, 1024))
            else:
                assert (await propose_with_budget(client, model=MODEL, source=SOURCE,
                                                  budget=TokenBudget(2048, 1024))).category == "frontend"
        assert client.is_closed()
    asyncio.run(run())
    assert [path for path, body in requests] == expected_paths


def test_preflight_failure_never_generates():
    paths = []
    def handler(request):
        paths.append(request.url.path)
        return httpx2.Response(503, json={"error": {"message": "PRIVATE_COUNT_FAILURE"}})
    async def run():
        async with open_model_client(KEY, transport=httpx2.MockTransport(handler)) as client:
            with pytest.raises(ModelFailure, match="provider_unavailable") as caught:
                await propose_with_budget(client, model=MODEL, source=SOURCE, budget=TokenBudget(2048, 1024))
            assert "PRIVATE" not in str(caught.value)
    asyncio.run(run())
    assert paths == ["/v1/responses/input_tokens"]
```

## Truncation and recovery are product decisions

Distinguish input overflow from generated-output incompleteness. Automatic input truncation can discard earlier facts/instructions; users need a deliberate reduce/retrieve/summarize policy. Keep the current user request, required constraints, provenance and authorized evidence. A generated summary is a lossy derived artifact: version it, retain source references and check that it did not drop constraints or introduce instructions from untrusted content. Do not compact all history and claim nothing was lost.

When output ends because its generation budget is exhausted, preserve a non-success job state. A UI can offer reduce scope, increase a reviewed cap within budget, or retry explicitly. Do not append braces to partial JSON, execute partial tool arguments or display a partly generated answer as a completed verified result. If streaming is later added, separate provisional display from validated final persistence. The SDK lesson already converts status=incomplete before parsing into a distinct failure.

A "continue" request does not guarantee a model will resume at the exact missing byte or avoid duplicating earlier content. Reconstruct the task from a stable checkpoint and validate the complete result. Bound attempts and total resource usage. A context-fit check is not a financial reservation: multiple simultaneous jobs can all pass while exceeding a shared account limit. Admission quotas and a shared spend ledger require separate concurrency/atomicity rules.

## Practice and acceptance

Use the fictional2048/1024/128 budget to show exact acceptance896 and rejection897. Compare a small plain-text sample in a model-appropriate tokenizer with its full structured-request count; include Hungarian text, emoji, code, repeated whitespace, a schema and history. Record actual token counts and model/payload versions; do not substitute estimated character ratios as measurements. No provider count or generation request has been made by the supplied offline tests.

**Acceptance:** strict checking and all tests pass; count/generation payload fields match; one-over input and preflight failure cause zero generation calls; output cap matches the reserved value; private content stays out of errors. Add alternate output-cap assertions, negative provider counts, count-time cancellation/deadline and generated incomplete-result tests. Design a UI/state transition for input-too-large versus output-incomplete and retain user-controlled recovery evidence. Live tokenizer/provider comparison, shared monetary admission, long-context quality measurements, UI implementation and learner practice remain required.

Official references checked2026-10-21: [provider token counting and non-visible usage](https://developers.openai.com/api/docs/guides/token-counting), [count endpoint fields](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count), [conversation/context boundaries](https://developers.openai.com/api/docs/guides/conversation-state), [Responses generation controls](https://developers.openai.com/api/reference/python/resources/responses/methods/create). No context-window number in this lesson represents a current model's specification.
