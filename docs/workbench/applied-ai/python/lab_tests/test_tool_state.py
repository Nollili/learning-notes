import sqlite3
import pytest
from pydantic import ValidationError
from study_ai.tool_state import JobState,JobStore,RevisionConflict,after_lookup,after_answer
from study_ai.vector_search import Principal

P=Principal('t','u')

def test_success_route_and_terminal_stops():
 s=after_lookup(JobState(),'ok');assert s.stage=='answer_pending'
 assert after_answer(s,checked=True).stage=='completed'
 assert after_answer(s,checked=False).stage=='failed'
 with pytest.raises(ValueError):after_lookup(s,'ok')
 with pytest.raises(ValueError):after_answer(JobState(),checked=True)
 for terminal in ['completed','failed']:
  with pytest.raises(ValueError):after_lookup(JobState(stage=terminal),'ok')

def test_retry_cap_and_terminal_errors():
 s=JobState()
 for retries in [1,2]:s=after_lookup(s,'temporary_failure');assert s.retries==retries and s.stage=='lookup_pending'
 assert after_lookup(s,'temporary_failure').stage=='failed'
 assert after_lookup(s,'ok').stage=='answer_pending'
 for outcome in ['invalid_arguments','unavailable','unknown_tool']:assert after_lookup(JobState(),outcome).stage=='failed'
 with pytest.raises(ValueError):after_lookup(JobState(),'invented')

@pytest.mark.parametrize('value',[{'retries':True},{'retries':3},{'stage':'eval'},{'extra':1}])
def test_strict_state(value):
 with pytest.raises(ValidationError):JobState.model_validate(value)

def test_file_persistence_two_owners_and_conflict(tmp_path):
 path=tmp_path/'jobs.db';a=sqlite3.connect(path,timeout=0.05);b=sqlite3.connect(path,timeout=0.05)
 try:
  one,two=JobStore(a),JobStore(b);state=JobState();assert one.save('j',state,principal=P,expected_version=None)==0
  old=two.load('j',principal=P);assert old==(0,state)
  moved=after_lookup(state,'ok');assert one.save('j',moved,principal=P,expected_version=0)==1
  with pytest.raises(RevisionConflict):two.save('j',JobState(stage='failed'),principal=P,expected_version=0)
  with pytest.raises(RevisionConflict):one.save('j',state,principal=P,expected_version=None)
  assert two.load('j',principal=P)==(1,moved)
  for principal in [Principal('foreign','u'),Principal('t','other')]:
   assert two.load('j',principal=principal) is None
   with pytest.raises(RevisionConflict):two.save('j',state,principal=principal,expected_version=0)
   assert two.save('j',state,principal=principal,expected_version=None)==0
  assert two.load('j',principal=P)==(1,moved)
 finally:a.close();b.close()
 with sqlite3.connect(path) as reopened:assert JobStore(reopened).load('j',principal=P)==(1,moved)
 reopened.close()

def test_invalid_id_version_corruption_and_busy(tmp_path):
 path=tmp_path/'jobs.db';a=sqlite3.connect(path,timeout=0.01);b=sqlite3.connect(path,timeout=0.01)
 try:
  one,two=JobStore(a),JobStore(b)
  for version in [True,-1,1000000,1.5]:
   with pytest.raises(ValueError):one.save('j',JobState(),principal=P,expected_version=version)
  with pytest.raises(ValueError):one.load("'; DROP TABLE jobs;--",principal=P)
  one.save('j',JobState(),principal=P,expected_version=None)
  a.execute('BEGIN IMMEDIATE')
  with pytest.raises(sqlite3.OperationalError):two.save('new',JobState(),principal=P,expected_version=None)
  a.rollback();assert two.load('j',principal=P)==(0,JobState())
  with a:a.execute("UPDATE jobs SET state=? WHERE job_id=?",('{"stage":"execute-shell"}','j'))
  with pytest.raises(ValidationError):one.load('j',principal=P)
 finally:a.close();b.close()
