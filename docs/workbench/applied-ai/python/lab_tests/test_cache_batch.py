# lab_tests/test_cache_batch.py
from dataclasses import replace
from decimal import Decimal
import pytest
from study_ai.cache_batch import cache_identity,correlate,BatchOutcome
from study_ai.eval_measurements import Usage,Rates,token_micro_usd,nearest_rank_ms

BASE=dict(tenant='t',subject='alice',permission_revision='acl1',model_revision='model1',prompt_revision='p1',
 schema_revision='s1',settings_revision='settings1',sources=[('a','0'*64),('b','1'*64)],question='What changed?')

def test_cache_namespace_and_source_snapshot():
    key=cache_identity(**BASE)
    assert key!=cache_identity(**{**BASE,'sources':list(reversed(BASE['sources']))})
    for field in ['tenant','subject','permission_revision','model_revision','prompt_revision','schema_revision','settings_revision','question']:
        assert key!=cache_identity(**{**BASE,field:'different'})
    assert key!=cache_identity(**{**BASE,'sources':[('a','2'*64),('b','1'*64)]})
    assert key!=cache_identity(**{**BASE,'sources':[('a','0'*64)]})
    with pytest.raises(ValueError):cache_identity(**{**BASE,'sources':[('a','0'*64),('a','0'*64)]})


def test_unordered_partial_batch_is_joined_by_identity():
    a=BatchOutcome('a','accepted','Checked answer');b=BatchOutcome('b','failed','')
    assert correlate(['a','b','c'],[b,a])==(a,b,None)
    assert correlate(['a'],[])==(None,)
    with pytest.raises(ValueError):correlate(['a','b'],[a,a])
    with pytest.raises(ValueError):correlate(['a'],[replace(a,custom_id='unknown')])
    with pytest.raises(ValueError):correlate(['a','a'],[])
    with pytest.raises(ValueError):correlate(['b'],[replace(b,text='PRIVATE_ERROR')])


def test_synthetic_cost_tail_and_critical_path():
    rates=Rates(2_000_000,500_000,8_000_000)
    cold=token_micro_usd(Usage(input_tokens=1000,cached_input_tokens=0,output_tokens=100,reasoning_tokens=20),rates)
    warm=token_micro_usd(Usage(input_tokens=1000,cached_input_tokens=800,output_tokens=100,reasoning_tokens=20),rates)
    assert cold==Decimal(2800) and warm==Decimal(1600)
    # Prompt reuse still generates output; an authorized full-response hit is a different policy.
    assert 10*cold==Decimal(28000) and 2*cold+8*warm==Decimal(18400)
    samples=[1.0]*95+[1000.0]*5
    assert nearest_rank_ms(samples,0.95)==1 and nearest_rank_ms(samples,0.99)==1000
    serial=20+40+60+300+10;parallel=20+max(40,60)+300+10
    assert (serial,parallel)==(430,390)  # authored stage durations, not measured service timings
