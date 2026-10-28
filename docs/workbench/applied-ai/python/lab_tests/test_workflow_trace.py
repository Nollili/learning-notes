import json
import pytest
from study_ai.workflow_trace import SafeTrace
from study_ai.note_tool import dispatch_note_tool
from study_ai.vector_search import Principal

def test_projection_sequence_eviction_and_roundtrip():
 trace=SafeTrace('a'*32,capacity=2)
 for n in range(3):trace.record(stage='lookup',outcome='ok',attempt=n+1,duration_ms=1.25)
 assert [e.sequence for e in trace.snapshot()]==[2,3] and trace.dropped==1
 rows=[json.loads(s) for s in trace.json_lines().splitlines()]
 assert all(set(r)=={'run_id','sequence','stage','outcome','attempt','duration_ms'} for r in rows)
 assert rows[0]['duration_ms']==1.25
 with pytest.raises(ValueError):trace.snapshot()[0].stage='answer'

@pytest.mark.parametrize('changes',[{'outcome':'PRIVATE_SECRET'},{'stage':'PRIVATE_SECRET'},{'attempt':True},{'attempt':0},{'attempt':7},{'duration_ms':float('nan')},{'duration_ms':float('inf')},{'duration_ms':-1},{'duration_ms':600001}])
def test_rejected_values_not_in_error_or_events(changes):
 trace=SafeTrace('a'*32);values=dict(stage='lookup',outcome='ok',attempt=1,duration_ms=1.0);values.update(changes)
 with pytest.raises(ValueError) as caught:trace.record(**values)
 assert str(caught.value)=='Invalid trace event' and not trace.snapshot()

@pytest.mark.parametrize('run,capacity',[('secret',2),('a'*32,True),('a'*32,0),('a'*32,101)])
def test_configuration(run,capacity):
 with pytest.raises(ValueError):SafeTrace(run,capacity=capacity)

def test_real_dispatch_outcome_projection():
 class Empty:
  def get(self,source_id):return None
 raw=dispatch_note_tool('lookup_note','{"source_id":"PRIVATE_ID"}',principal=Principal('t','u'),store=Empty())
 outcome=json.loads(raw)['status'];assert outcome=='unavailable'
 trace=SafeTrace('b'*32);trace.record(stage='lookup',outcome=outcome,attempt=1,duration_ms=0.5)
 assert 'PRIVATE' not in trace.json_lines() and 'unavailable' in trace.json_lines()
 with pytest.raises(TypeError):trace.record(stage='lookup',outcome='ok',attempt=1,duration_ms=1.0,arguments='SECRET')
