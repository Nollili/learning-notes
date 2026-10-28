# lab_tests/test_model_sdk.py
from __future__ import annotations

import asyncio
import json

import httpx2
import pytest

from study_ai.model_sdk import ModelFailure, open_model_client, propose_label

KEY = "fake_offline_key_not_a_provider_secret"
MODEL = "reviewed-model-fixture"
SOURCE = "React renders a tree of components."
VALID = {"category": "frontend", "evidence_quote": "React", "needs_review": False}


def envelope(content, *, status="completed"):
    return {"id": "resp_fixture", "object": "response", "created_at": 1,
            "model": MODEL, "status": status, "error": None,
            "incomplete_details": {"reason": "max_output_tokens"} if status == "incomplete" else None,
            "output": [{"type": "message", "id": "msg_fixture", "role": "assistant",
                        "status": "completed", "content": content}],
            "parallel_tool_calls": False, "tool_choice": "auto", "tools": [],
            "metadata": {}, "text": {"format": {"type": "text"}},
            "temperature": 1, "top_p": 1, "usage": None}


def text_item(value):
    return {"type": "output_text", "text": json.dumps(value), "annotations": []}


def test_real_sdk_request_and_typed_result():
    calls = []
    def handler(request):
        calls.append(request)
        assert str(request.url) == "https://api.openai.com/v1/responses"
        assert request.headers["authorization"] == f"Bearer {KEY}"
        body = json.loads(request.content)
        assert body["input"][0]["role"] == "developer"
        assert body["input"][1] == {"role": "user", "content": SOURCE}
        assert body["store"] is False and body["truncation"] == "disabled"
        assert body["max_output_tokens"] == 1024
        format = body["text"]["format"]
        assert format["strict"] is True and format["type"] == "json_schema"
        assert format["schema"]["additionalProperties"] is False
        assert set(format["schema"]["required"]) == {"category", "evidence_quote", "needs_review"}
        return httpx2.Response(200, json=envelope([text_item(VALID)]))
    async def run():
        async with open_model_client(KEY, transport=httpx2.MockTransport(handler)) as client:
            decision = await propose_label(client, model=MODEL, source=SOURCE)
            assert decision.category == "frontend" and decision.evidence_quote == "React"
        assert client.is_closed()
    asyncio.run(run())
    assert len(calls) == 1


@pytest.mark.parametrize("payload,code", [
    (envelope([{"type": "refusal", "refusal": "PRIVATE_REFUSAL"}]), "refused"),
    (envelope([], status="incomplete"), "incomplete"),
    (envelope([text_item({**VALID, "category": "invented"})]), "invalid_output"),
    (envelope([text_item({**VALID, "needs_review": "false"})]), "invalid_output"),
    (envelope([text_item({**VALID, "PRIVATE_FIELD": "PRIVATE_VALUE"})]), "invalid_output"),
    (envelope([text_item({**VALID, "evidence_quote": "invented quotation"})]), "invalid_output"),
    (envelope([text_item({**VALID, "evidence_quote": ""})]), "invalid_output"),
])
def test_non_success_is_typed_and_private(payload, code):
    async def run():
        async with open_model_client(KEY, transport=httpx2.MockTransport(
            lambda request: httpx2.Response(200, json=payload)
        )) as client:
            with pytest.raises(ModelFailure) as caught:
                await propose_label(client, model=MODEL, source=SOURCE)
            assert caught.value.code == code and str(caught.value) == code
    asyncio.run(run())


@pytest.mark.parametrize("status,code", [(401, "provider_rejected"), (429, "provider_unavailable"),
                                         (503, "provider_unavailable")])
def test_status_is_one_attempt_without_body_leak(status, code):
    calls = []
    def handler(request):
        calls.append(request)
        return httpx2.Response(status, json={"error": {"message": "PRIVATE_PROVIDER_BODY"}})
    async def run():
        async with open_model_client(KEY, transport=httpx2.MockTransport(handler)) as client:
            with pytest.raises(ModelFailure, match=code):
                await propose_label(client, model=MODEL, source=SOURCE)
    asyncio.run(run())
    assert len(calls) == 1
