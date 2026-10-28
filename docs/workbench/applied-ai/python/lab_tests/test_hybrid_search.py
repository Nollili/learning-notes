# lab_tests/test_hybrid_search.py
import pytest

from study_ai.hybrid_search import fuse_ranks, lexical_search


def test_lexical_identifiers_unicode_and_empty_hits():
    texts = {"a": "ERR_TIMEOUT closes client", "b": "Client cancellation releases resources",
             "private": "ERR_TIMEOUT", "unicode": "café"}
    allowed = frozenset({"a", "b", "unicode"})
    assert lexical_search("err_timeout", texts=texts, authorized_ids=allowed, top_k=1) == (("a", 1 / 3),)
    assert lexical_search("cafe\u0301", texts=texts, authorized_ids=allowed) == (("unicode", 1.0),)
    assert lexical_search("unknownword", texts=texts, authorized_ids=allowed) == ()
    assert lexical_search("!!!", texts=texts, authorized_ids=allowed) == ()
    assert lexical_search("err_timeout", texts=texts, authorized_ids=allowed, threshold=0.5) == ()


def test_rank_fusion_shared_support_exact_scores_and_empty_branch():
    allowed = frozenset({"a", "b", "c"})
    ranked = fuse_ranks(["a", "b"], ["b", "c"], authorized_ids=allowed)
    assert [identity for identity, score in ranked] == ["b", "a", "c"]
    assert ranked[0][1] == pytest.approx(1 / 62 + 1 / 61)
    assert fuse_ranks([], ["b", "a"], authorized_ids=allowed, top_k=1)[0][0] == "b"
    assert fuse_ranks(["a"], ["b"], authorized_ids=allowed, semantic_weight=0)[0][0] == "a"
    assert fuse_ranks(["private", "a"], ["b"], authorized_ids=allowed) == (
        ("a", 1 / 61), ("b", 1 / 61))
    assert fuse_ranks([], [], authorized_ids=allowed) == ()


def test_invalid_fusion_and_lexical_policies():
    allowed = frozenset({"a"})
    for options in [dict(lexical_weight=0, semantic_weight=0), dict(lexical_weight=float("nan")),
                    dict(rank_constant=True), dict(top_k=0)]:
        with pytest.raises(ValueError):
            fuse_ranks(["a"], [], authorized_ids=allowed, **options)
    with pytest.raises(ValueError, match="branch ranking"):
        fuse_ranks(["a", "a"], [], authorized_ids=allowed)
    with pytest.raises(ValueError):
        lexical_search("x", texts={"a": "x"}, authorized_ids=allowed, threshold=float("nan"))
