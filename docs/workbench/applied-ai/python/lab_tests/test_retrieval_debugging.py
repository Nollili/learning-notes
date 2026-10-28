# lab_tests/test_retrieval_debugging.py
from pathlib import Path
import pytest
from study_ai.retrieval_debugging import Candidate, distinct_content
from study_ai.retrieval_metrics import score_retrieval
from study_ai.vector_store import VectorStore
from study_ai.vector_search import Principal, VectorSpace
from study_ai.extraction import extract, chunk
from study_ai.evidence import SourceSnapshot, EvidenceRejected, resolve_evidence, check_answer

SPACE=VectorSpace('fixture-v1',2,'whole-text-v1')
P=Principal('t','alice')

def test_duplicate_crowding_and_measured_change(tmp_path: Path):
    store=VectorStore(tmp_path/'duplicates.sqlite')
    try:
        versions={}
        for name,text,vector in [('a','Topic one',[1.0,0.0]),('a_copy','Topic one',[1.0,0.0]),('b','Topic two',[0.8,0.2])]:
            versions[name]=store.publish_source('t',name,text,['alice'])
        store.generation('g',SPACE)
        for name,vector in [('a',[1.0,0.0]),('a_copy',[1.0,0.0]),('b',[0.8,0.2])]:
            store.index('g','t',name,versions[name],vector,space=SPACE)
        store.activate('g')
        ranked=store.search([1,0],principal=P,space=SPACE,top_k=3)
        candidates=[Candidate(name,version) for name,version,_score in ranked]
        assert [c.source_id for c in candidates] == ['a','a_copy','b']
        selected=distinct_content(candidates,limit=2)
        assert [c.source_id for c in selected] == ['a','b']
        # Labels judge one representative per content/evidence group for this fixture.
        grades={'a':3,'b':1}
        before=score_retrieval([c.source_id for c in candidates[:2]],grades,k=2)
        after=score_retrieval([c.source_id for c in selected],grades,k=2)
        assert before.recall_at_k == 0.5 and after.recall_at_k == 1.0
        assert before.reciprocal_rank_at_k == after.reciprocal_rank_at_k == 1.0
        assert after.ndcg_at_k == 1.0
        # Removing duplicates from only the original top2 cannot recover missing b.
        assert len(distinct_content(candidates[:2],limit=2)) == 1
    finally:store.close()


def test_stale_coverage_and_incident_becomes_regression(tmp_path: Path):
    store=VectorStore(tmp_path/'stale.sqlite')
    try:
        raw=b'Cancellation closes the client.'
        old=store.publish_source('t','a',raw.decode(),['alice'])
        store.generation('g',SPACE);store.index('g','t','a',old,[1,0],space=SPACE);store.activate('g')
        candidate=chunk(extract(raw,source_id='a',kind='text'))[0]
        assert store.search([1,0],principal=P,space=SPACE)[0][1] == old
        current=b'Cancellation stops the client wait; it does not undo a committed write.'
        store.publish_source('t','a',current.decode(),['alice'])
        # Scope health to the authorized operator/user; no foreign source list leaks.
        current_count,ready_count=store.db.execute('''SELECT count(*),sum(CASE WHEN EXISTS(
          SELECT 1 FROM vectors v JOIN active a ON a.generation=v.generation
          WHERE v.tenant=s.tenant AND v.source=s.source AND v.version=s.version) THEN 1 ELSE 0 END)
          FROM sources s WHERE s.tenant=? AND EXISTS(SELECT 1 FROM acl x
          WHERE x.tenant=s.tenant AND x.source=s.source AND x.subject=?)''',('t','alice')).fetchone()
        assert (current_count,ready_count)==(1,0)
        assert store.search([1,0],principal=P,space=SPACE)==()
        snapshot=SourceSnapshot('t',frozenset({'alice'}),'a','text',current)
        # Synthetic regression RAG-STALE-001: never fall back to the old cached excerpt.
        with pytest.raises(EvidenceRejected,match='version'):
            resolve_evidence(candidate,principal=P,snapshot=snapshot)
        checked=check_answer({'status':'insufficient_evidence','answer':'','citations':[]},evidence=[])
        assert checked.answer=='' and checked.citations==()
    finally:store.close()


def test_oracle_evidence_separates_citation_from_support():
    raw=b'Cancellation does not undo a committed write.'
    snapshot=SourceSnapshot('t',frozenset({'alice'}),'a','text',raw)
    e=resolve_evidence(chunk(extract(raw,source_id='a',kind='text'))[0],principal=P,snapshot=snapshot)
    wrong=check_answer({'status':'answered','answer':'Cancellation undoes the committed write.',
      'citations':[{'chunk_id':e.chunk_id,'quote':'committed write'}]},evidence=[e])
    assert wrong.status=='answered'  # mechanical checks pass; human support rubric must fail
    assert 'does not undo' in e.text and 'undoes' in wrong.answer


@pytest.mark.parametrize('items,limit', [([Candidate('a','0'*64),Candidate('a','1'*64)],2),([Candidate('a','bad')],2),([],True),([],9)])
def test_invalid_dedup_contract(items,limit):
    with pytest.raises(ValueError):distinct_content(items,limit=limit)
