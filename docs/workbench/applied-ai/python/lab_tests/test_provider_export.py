# lab_tests/test_provider_export.py
from dataclasses import replace
import json
import pytest
from study_ai.provider_export import ExportPolicy,prepare_export
from study_ai.note_tool import StoredNote
from study_ai.vector_search import Principal

P=Principal('t','alice');POLICY=ExportPolicy('t','openai-api','study-classification',200,frozenset({'public'}))
NOTE=StoredNote('t',frozenset({'alice'}),'private_catalog_id','a'*64,'React renders components.')

def test_only_alias_and_needed_text_leave_projection():
    out=prepare_export(NOTE,principal=P,policy=POLICY,classification='public',now=100,ref='e1')
    assert json.loads(out.model_dump_json())=={'ref':'e1','text':NOTE.text}
    for value in ['private_catalog_id','alice','subjects','tenant','revision']:
        assert value not in out.model_dump_json()

@pytest.mark.parametrize('kind',['tenant','subject','policy','expired','classification','large','ref','clock'])
def test_current_export_policy_and_bounds(kind):
    note=NOTE;principal=P;policy=POLICY;classification='public';ref='e1';now=100
    if kind=='tenant':note=replace(note,tenant='other')
    if kind=='subject':note=replace(note,subjects=frozenset())
    if kind=='policy':policy=replace(policy,tenant='other')
    if kind=='expired':now=200
    if kind=='classification':classification='restricted'
    if kind=='large':note=replace(note,text='x'*501)
    if kind=='ref':ref='https://attacker.invalid'
    if kind=='clock':now=True
    with pytest.raises(ValueError):prepare_export(note,principal=principal,policy=policy,classification=classification,now=now,ref=ref)
