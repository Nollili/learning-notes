import pytest
from pydantic import ValidationError
from study_ai.workflow_budget import RunBudget,RunStopped

def test_reserve_restore_and_exhaust():
 original=RunBudget(calls_left=3,result_bytes_left=1000)
 reserved=original.reserve_call();assert reserved.calls_left==2 and original.calls_left==3
 recorded=reserved.record_result('x'*200);assert recorded.result_bytes_left==800
 restored=RunBudget.model_validate_json(recorded.model_dump_json());assert restored==recorded
 for _ in range(2):restored=restored.reserve_call()
 assert restored.calls_left==0
 with pytest.raises(RunStopped):restored.reserve_call()

def test_exact_and_unicode_result_budget():
 budget=RunBudget(calls_left=1,result_bytes_left=800)
 assert budget.record_result('🧠'*200).result_bytes_left==0
 for result in ['🧠'*201,'x'*801,'\ud800']:
  with pytest.raises(RunStopped):budget.record_result(result)
 with pytest.raises(RunStopped):RunBudget(calls_left=1,result_bytes_left=16384).record_result('x'*8193)
 assert budget.result_bytes_left==800

@pytest.mark.parametrize('data',[{'calls_left':True,'result_bytes_left':1},{'calls_left':7,'result_bytes_left':1},{'calls_left':-1,'result_bytes_left':1},{'calls_left':1,'result_bytes_left':True},{'calls_left':1,'result_bytes_left':16385},{'calls_left':1,'result_bytes_left':-1}])
def test_invalid(data):
 with pytest.raises(ValidationError):RunBudget.model_validate(data)
