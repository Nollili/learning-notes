import math
import pytest
from study_ai.retrieval_metrics import score_retrieval,RetrievalMetrics

def test_exact_worked_metrics():
 grades={'a':3,'b':1,'c':0};r=score_retrieval(['c','b','a'],grades,k=2)
 assert r.recall_at_k==0.5 and r.reciprocal_rank_at_k==0.5
 assert r.ndcg_at_k==pytest.approx((1/math.log2(3))/(7+1/math.log2(3)))
 ideal=score_retrieval(['a','b','c'],grades,k=2);assert ideal==RetrievalMetrics(1,1,1)
 assert score_retrieval(['a'],grades,k=2).recall_at_k==0.5

def test_no_hits_empty_and_no_relevant():
 assert score_retrieval([],{'a':1},k=2)==RetrievalMetrics(0,0,0)
 assert score_retrieval(['z'],{'a':1},k=1)==RetrievalMetrics(0,0,0)
 assert score_retrieval(['z'],{'a':0},k=1)==RetrievalMetrics(None,None,None)
 assert score_retrieval([],{},k=1)==RetrievalMetrics(None,None,None)
 assert score_retrieval(['b','a'],{'a':1,'b':1},k=2).ndcg_at_k==1

@pytest.mark.parametrize('k',[0,21,True,1.5])
def test_bad_k(k):
 with pytest.raises(ValueError):score_retrieval([],{},k=k)

@pytest.mark.parametrize('ranked,grades',[(['a','a'],{'a':1}),(['../x'],{}),([],{'a':True}),([],{'a':-1}),([],{'a':4}),([],{'a':1.5}),(['x'*65],{}),([str(i) for i in range(21)],{})])
def test_bad_contract(ranked,grades):
 with pytest.raises(ValueError):score_retrieval(ranked,grades,k=2)
