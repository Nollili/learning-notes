import json
import pytest
from study_ai.lookup_graph import LookupGraph
from study_ai.note_tool import StoredNote,StoreUnavailable
from study_ai.vector_search import Principal

class Store:
 def __init__(self):self.reads=[];self.note=StoredNote('t',frozenset({'u'}),'s1','a'*64,'Allowed fixture')
 def get(self,source_id):self.reads.append(source_id);return self.note

ARGS='{"source_id":"s1"}'

def test_actual_graph_and_scoped_memory():
 store=Store();owner=LookupGraph(Principal('t','u'),store);other=LookupGraph(Principal('other','u'),store)
 assert owner.snapshot('j')=={}
 assert json.loads(owner.run('j',ARGS))['excerpt']=='Allowed fixture'
 assert owner.snapshot('j')['arguments']==ARGS
 assert other.snapshot('j')=={}
 assert json.loads(other.run('j',ARGS))=={'status':'unavailable'}
 assert 'Allowed' in owner.snapshot('j')['result'] and 'Allowed' not in other.snapshot('j')['result']
 assert store.reads==['s1','s1']
 store.note=StoredNote('t',frozenset(),'s1','a'*64,'REVOKED')
 assert json.loads(owner.run('j',ARGS))=={'status':'unavailable'}
 owner.forget('j');assert owner.snapshot('j')=={}
 assert LookupGraph(Principal('t','u'),store).snapshot('j')=={}

def test_schema_and_fixture_caps():
 store=Store();owner=LookupGraph(Principal('t','u'),store)
 assert json.loads(owner.run('bad','{}'))=={'status':'invalid_arguments'};assert store.reads==[]
 for _ in range(4):owner.run('j',ARGS)
 with pytest.raises(ValueError):owner.run('j',ARGS)
 for n in range(18):owner.run(f'x{n}',ARGS)
 with pytest.raises(ValueError):owner.run('full',ARGS)
 for value in ['x'*2049,'\ud800']:
  with pytest.raises(ValueError):LookupGraph(Principal('t','u'),store).run('new',value)

def test_operational_error_is_preserved():
 class Broken:
  def get(self,source_id):raise StoreUnavailable('private')
 owner=LookupGraph(Principal('t','u'),Broken());assert json.loads(owner.run('j',ARGS))=={'status':'temporary_failure'}
