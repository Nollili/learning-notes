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
