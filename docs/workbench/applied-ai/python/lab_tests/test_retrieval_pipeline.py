# lab_tests/test_retrieval_pipeline.py
import asyncio
import json
from dataclasses import replace

import pytest

from study_ai.evidence import Evidence
from study_ai.retrieval_pipeline import NoContext, ReadyContext, prepare_context, rerank, search_variants
from study_ai.token_budgets import TokenBudget


def item(identity: str, text: str, source: str = "s") -> Evidence:
    return Evidence(identity * 64, source, "f" * 64, "line:1", 0, len(text), text)


def test_rewrite_preserves_original_negation_identifier_and_scope_absence():
    query = "CORS is not authentication ERR_42"
    variants = search_variants(query)
    assert variants[0] == query and variants[1].startswith(query + " ")
    assert "cross origin resource sharing" in variants[1]
    assert search_variants("ERR_42") == ("ERR_42",)
    with pytest.raises(ValueError):
        search_variants(" ")


def test_reranking_known_candidates_scores_ties_and_no_hit():
    a, b = item("a", "client cancellation"), item("b", "client")
    assert rerank("client cancellation", [b, a]) == (a, b)
    assert rerank("client", [b, a]) == (a, b)  # Equal score, deterministic ID tie.
    assert rerank("unknown", [a, b]) == ()
    for score in [float("nan"), float("inf"), -1.0, 2.0, True]:
        with pytest.raises(ValueError):
            rerank("client", [a], scorer=lambda q, t: score)
    with pytest.raises(ValueError):
        rerank("client", [a, a])


def test_final_payload_count_drops_worst_and_retains_exact_spans():
    a, b = item("a", "Cancellation closes the client."), item("b", "Retry needs a budget.", "other")
    seen = []
    async def count(messages, text):
        assert text["format"]["name"] == "evidence_answer"
        payload = json.loads(messages[1]["content"])
        seen.append(payload)
        return 900 if len(payload["evidence"]) == 2 else 600
    async def run():
        result = await prepare_context("What closes the client?", [a, b],
                                       budget=TokenBudget(1024, 512, 256, 64), count=count)
        assert isinstance(result, ReadyContext) and result.evidence == (a,)
        assert result.input_tokens == 600
        assert json.loads(result.payload) == seen[-1]
        assert seen[-1]["evidence"][0]["text"] == a.text
        assert len(seen) == 2
    asyncio.run(run())


def test_empty_exhausted_diversity_duplicates_and_counter_failure():
    a = item("a", "client")
    b = item("b", "client")
    c = item("c", "client", "other")
    async def small(messages, text): return 10
    async def huge(messages, text): return 10000
    async def failed(messages, text): raise RuntimeError("counter unavailable")
    async def run():
        budget = TokenBudget(1024, 512, 256, 64)
        assert await prepare_context("client", [], budget=budget, count=small) == NoContext("no_evidence")
        assert await prepare_context("client", [a], budget=budget, count=huge) == NoContext("budget_exhausted")
        plan = await prepare_context("client", [a, b, c], budget=budget, count=small, per_source=1)
        assert isinstance(plan, ReadyContext) and plan.evidence == (a, c)
        with pytest.raises(ValueError): await prepare_context("client", [a, a], budget=budget, count=small)
        with pytest.raises(RuntimeError): await prepare_context("client", [a], budget=budget, count=failed)
        with pytest.raises(ValueError): await prepare_context("client", [replace(a, text="x" * 2001)], budget=budget, count=small)
    asyncio.run(run())
