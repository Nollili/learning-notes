import json
from pathlib import Path
import pytest
from study_ai.eval_cases import load_dataset,dataset_digest
RAW=Path('eval-fixture-v1.json').read_bytes()

def test_exact_manifest_versions_slices_and_digest():
 dataset=load_dataset(RAW);assert len(dataset.cases)==6
 assert len({c.slice for c in dataset.cases})==6 and dataset.version==1
 assert dataset_digest(RAW)==dataset_digest(RAW) and len(dataset_digest(RAW))==64
 assert dataset_digest(RAW)!=dataset_digest(RAW+b'\n')

@pytest.mark.parametrize('version',[2,'1',True])
def test_wrong_version(version):
 data=json.loads(RAW);data['version']=version
 with pytest.raises(ValueError):load_dataset(json.dumps(data).encode())

@pytest.mark.parametrize('kind',['duplicate','missing','extra','blank','answer-empty','nonanswer-text','unicode','coerced'])
def test_rejected_manifest(kind):
 data=json.loads(RAW)
 if kind=='duplicate':data['cases'][1]['id']=data['cases'][0]['id']
 if kind=='missing':data['cases'].pop()
 if kind=='extra':data['cases'][0]['permission']=True
 if kind=='blank':data['cases'][0]['question']='  '
 if kind=='answer-empty':data['cases'][0]['expected_text']=''
 if kind=='nonanswer-text':data['cases'][1]['expected_text']='invented'
 if kind=='unicode':data['cases'][0]['expected_text']='\ud800'
 if kind=='coerced':data['cases'][0]['expected']=1
 with pytest.raises(ValueError):load_dataset(json.dumps(data).encode())

def test_byte_and_parse_bounds():
 for raw in [b'x'*65537,b'bad',b'[]',b'null']:
  with pytest.raises(ValueError):load_dataset(raw)
