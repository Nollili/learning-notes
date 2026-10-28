import pytest
from study_ai.judge_checks import compare_judge,repeated_success

def test_exact_false_accept_reject():
 human={'a':True,'b':True,'c':False,'d':False};judge={'a':True,'b':False,'c':True,'d':False};r=compare_judge(human,judge)
 assert (r.total,r.true_accepts,r.true_rejects,r.false_accepts,r.false_rejects,r.agreement)==(4,1,1,1,1,0.5)
 assert compare_judge(human,human).agreement==1
 assert compare_judge(human,{k:True for k in human}).false_accepts==2
 assert compare_judge(human,{k:False for k in human}).false_rejects==2

@pytest.mark.parametrize('human,judge',[({},{}),({'a':True},{}),({'a':True},{'a':True,'b':False}),({'a':1},{'a':True}),({'a':True},{'a':0})])
def test_invalid_comparison(human,judge):
 with pytest.raises(ValueError):compare_judge(human,judge)

def test_repeated_outcomes():
 assert repeated_success([True,True,False,True])==(0.75,False)
 assert repeated_success([True]*4)==(1,True)
 assert repeated_success([False]*4)==(0,False)
 for outcomes in [[],[True]*101,[1],[None]]:
  with pytest.raises(ValueError):repeated_success(outcomes)
