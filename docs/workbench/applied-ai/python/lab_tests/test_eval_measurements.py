from decimal import Decimal
import pytest
from pydantic import ValidationError
from study_ai.eval_measurements import Usage,Rates,token_micro_usd,known_token_cost,nearest_rank_ms
R=Rates(2000000,500000,8000000)
def usage(**changes):
 values=dict(input_tokens=1000,cached_input_tokens=200,output_tokens=100,reasoning_tokens=20);values.update(changes);return Usage(**values)
def test_cost_subsets_and_unknowns():
 u=usage();assert token_micro_usd(u,R)==Decimal(2500)
 assert known_token_cost([u,u,u],R)==(Decimal(7500),0)
 assert known_token_cost([u,None,u],R)==(Decimal(5000),1)
 assert known_token_cost([None],R)==(Decimal(0),1)
 assert token_micro_usd(usage(input_tokens=1,cached_input_tokens=0,output_tokens=0,reasoning_tokens=0),Rates(1,0,0))==Decimal('0.000001')
@pytest.mark.parametrize('changes',[{'input_tokens':True},{'cached_input_tokens':1001},{'reasoning_tokens':101},{'output_tokens':-1},{'input_tokens':10000001}])
def test_bad_usage(changes):
 with pytest.raises(ValidationError):usage(**changes)
def test_bad_rate_and_counts():
 for value in [True,-1,1000000001,1.5]:
  with pytest.raises(ValueError):Rates(value,0,0)
 for values in [[],[None]*1001]:
  with pytest.raises(ValueError):known_token_cost(values,R)
def test_percentile_convention():
 assert nearest_rank_ms([4.,1.,3.,2.],0.5)==2
 assert nearest_rank_ms([4.,1.,3.,2.],0.95)==4
 for samples,p in [([],0.5),([1.],0),([1.],True),([True],0.5),([float('nan')],0.5),([-1.],0.5),([1.],float('inf'))]:
  with pytest.raises(ValueError):nearest_rank_ms(samples,p)
