# lab_tests/test_vector_store.py — outside any Autocode src/tests directory
from pathlib import Path
import sqlite3
from dataclasses import replace
import pytest
from study_ai.vector_store import VectorStore
from study_ai.vector_search import Principal, VectorSpace

SPACE = VectorSpace('fixture-v1', 2, 'whole-text-v1')
ALICE = Principal('t', 'alice')

@pytest.fixture
def store(tmp_path: Path):
    owner = VectorStore(tmp_path / 'index.sqlite')
    yield owner
    owner.close()

def seed(store: VectorStore):
    a = store.publish_source('t', 'a', 'Allowed evidence', ['alice'])
    b = store.publish_source('t', 'b', 'Private best match', ['bob'])
    c = store.publish_source('other', 'c', 'Other tenant', ['alice'])
    store.generation('g1', SPACE)
    for t, s, v, vector in [('t','a',a,[0.8,0.2]),('t','b',b,[1.0,0.0]),('other','c',c,[1.0,0.0])]:
        store.index('g1',t,s,v,vector,space=SPACE)
    store.activate('g1')
    return a,b,c

def test_authorization_before_topk_and_current_revocation(store: VectorStore):
    seed(store)
    assert [r[0] for r in store.search([1,0],principal=ALICE,space=SPACE,top_k=1)] == ['a']
    assert [r[0] for r in store.search([1,0],principal=Principal('t','bob'),space=SPACE)] == ['b']
    store.publish_source('t','a','Allowed evidence',[])
    assert store.search([1,0],principal=ALICE,space=SPACE) == ()

def test_update_hides_stale_then_reindex_restores(store: VectorStore):
    old,_,_ = seed(store)
    current=store.publish_source('t','a','Updated evidence',['alice'])
    assert store.search([1,0],principal=ALICE,space=SPACE) == ()
    with pytest.raises(ValueError):store.index('g1','t','a',old,[1,0],space=SPACE)
    store.index('g1','t','a',current,[1,0],space=SPACE)
    assert store.search([1,0],principal=ALICE,space=SPACE)[0][:2] == ('a',current)

def test_reopen_and_delete_all_generations(tmp_path: Path):
    path=tmp_path/'durable.sqlite';store=VectorStore(path);seed(store);store.close()
    store=VectorStore(path)
    try:
        assert len(store.search([1,0],principal=ALICE,space=SPACE)) == 1
        store.delete_source('t','a');store.delete_source('t','a')
        assert store.search([1,0],principal=ALICE,space=SPACE) == ()
        assert store.db.execute("SELECT count(*) FROM vectors WHERE tenant='t' AND source='a'").fetchone() == (0,)
        assert store.db.execute("SELECT count(*) FROM acl WHERE tenant='t' AND source='a'").fetchone() == (0,)
    finally:store.close()

def test_staged_generation_complete_and_space_switch(store: VectorStore):
    a,b,c=seed(store);new=replace(SPACE,model_revision='fixture-v2')
    store.generation('g2',new)
    store.index('g2','t','a',a,[1,0],space=new)
    with pytest.raises(ValueError):store.activate('g2')
    assert store.search([1,0],principal=ALICE,space=SPACE)
    store.index('g2','t','b',b,[1,0],space=new)
    store.index('g2','other','c',c,[1,0],space=new)
    # A source update after staging invalidates activation; refresh exactly that row.
    a2=store.publish_source('t','a','Raced update',['alice'])
    with pytest.raises(ValueError):store.activate('g2')
    store.index('g2','t','a',a2,[1,0],space=new);store.activate('g2')
    with pytest.raises(ValueError):store.search([1,0],principal=ALICE,space=SPACE)
    assert store.search([1,0],principal=ALICE,space=new)[0][1] == a2
    with pytest.raises(ValueError):store.activate('g1')  # old generation is stale, rollback is not blind

@pytest.mark.parametrize('vector', [[0,0],[float('nan'),1],[True,0],[1,2,3]])
def test_invalid_vectors(store: VectorStore,vector):
    a,_,_=seed(store)
    with pytest.raises(ValueError):store.index('g1','t','a',a,vector,space=SPACE)

def test_space_duplicates_and_ties(store: VectorStore):
    a,b,_=seed(store)
    with pytest.raises(sqlite3.IntegrityError):store.generation('g1',SPACE)
    with pytest.raises(ValueError):store.index('g1','t','a',a,[1,0],space=replace(SPACE,model_revision='wrong'))
    store.publish_source('t','b','Private best match',['alice'])
    store.index('g1','t','a',a,[1,0],space=SPACE);store.index('g1','t','b',b,[1,0],space=SPACE)
    assert [r[0] for r in store.search([1,0],principal=ALICE,space=SPACE)] == ['a','b']
    assert store.db.execute("SELECT count(*) FROM vectors WHERE generation='g1' AND tenant='t' AND source='a'").fetchone() == (1,)

def test_atomic_acl_rollback_and_lock(tmp_path: Path):
    path=tmp_path/'locks.sqlite';store=VectorStore(path);seed(store);other=VectorStore(path)
    try:
        store.db.execute("CREATE TRIGGER reject_acl BEFORE INSERT ON acl WHEN NEW.subject='reject' BEGIN SELECT RAISE(ABORT,'fixture'); END")
        with pytest.raises(sqlite3.IntegrityError):store.publish_source('t','a','Do not commit',['reject'])
        assert store.search([1,0],principal=ALICE,space=SPACE)
        store.db.execute('BEGIN IMMEDIATE')
        try:
            with pytest.raises(sqlite3.OperationalError):other.delete_source('t','a')
        finally:store.db.execute('ROLLBACK')
        other.delete_source('t','a');assert store.search([1,0],principal=ALICE,space=SPACE) == ()
    finally:other.close();store.close()

def test_scan_budget_fails_without_partial_topk(store: VectorStore):
    store.generation('g',SPACE)
    for n in range(501):
        name=f's{n}';v=store.publish_source('t',name,'x',['alice']);store.index('g','t',name,v,[1,0],space=SPACE)
    store.activate('g')
    with pytest.raises(ValueError,match='budget'):store.search([1,0],principal=ALICE,space=SPACE)
