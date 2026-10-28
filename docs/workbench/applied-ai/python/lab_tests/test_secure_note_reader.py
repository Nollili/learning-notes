# lab_tests/test_secure_note_reader.py
from pathlib import Path
from html.parser import HTMLParser
from dataclasses import replace
import hashlib,json,sqlite3
import pytest
from study_ai.secure_note_reader import SecureNoteReader,render_checked_answer
from study_ai.vector_search import Principal
from study_ai.evidence import CheckedAnswer,Evidence

@pytest.fixture
def database(tmp_path: Path):
    path=tmp_path/'sources.sqlite';db=sqlite3.connect(path)
    db.executescript('''CREATE TABLE reviewed_sources(tenant TEXT NOT NULL,source TEXT NOT NULL,
      revision TEXT NOT NULL,text TEXT NOT NULL,state TEXT NOT NULL CHECK(state IN('pending','published','quarantined')),
      submitted_by TEXT NOT NULL,reviewed_by TEXT,approved_digest TEXT,PRIMARY KEY(tenant,source));
      CREATE TABLE source_acl(tenant TEXT NOT NULL,source TEXT NOT NULL,subject TEXT NOT NULL,
      PRIMARY KEY(tenant,source,subject));''')
    for tenant,text in [('one','ONE_PRIVATE'),('two','TWO_PRIVATE')]:
        digest=hashlib.sha256(text.encode()).hexdigest()
        db.execute('INSERT INTO reviewed_sources VALUES(?,?,?,?,?,?,?,?)',
          (tenant,'shared_id',digest,text,'published','author','reviewer',digest))
        db.execute('INSERT INTO source_acl VALUES(?,?,?)',(tenant,'shared_id','alice'))
    db.commit()
    try:yield path,db
    finally:db.close()

def call(reader):return json.loads(reader.run('lookup_note','{"source_id":"shared_id"}'))

def test_same_source_id_is_scoped_to_current_tenant(database):
    path,_db=database
    one=SecureNoteReader(path,Principal('one','alice'),frozenset({'shared_id'}))
    two=SecureNoteReader(path,Principal('two','alice'),frozenset({'shared_id'}))
    bob=SecureNoteReader(path,Principal('one','bob'),frozenset({'shared_id'}))
    try:
        assert call(one)['excerpt']=='ONE_PRIVATE' and call(two)['excerpt']=='TWO_PRIVATE'
        assert call(bob)=={'status':'unavailable'}
        assert 'TWO_PRIVATE' not in json.dumps(call(one))
        assert json.loads(one.run('lookup_note','{"source_id":"shared_id","tenant":"two"}'))=={'status':'invalid_arguments'}
        with pytest.raises(sqlite3.OperationalError):one.db.execute("UPDATE reviewed_sources SET text='changed'")
        with pytest.raises(sqlite3.OperationalError):one.db.execute('DROP TABLE source_acl')
        assert json.loads(one.run('run_sql','{"sql":"DROP TABLE source_acl"}'))=={'status':'unknown_tool'}
    finally:one.close();two.close();bob.close()

def test_current_revocation_quarantine_review_and_integrity(database):
    path,db=database;reader=SecureNoteReader(path,Principal('one','alice'),frozenset({'shared_id'}))
    try:
        assert call(reader)['status']=='ok'
        db.execute("DELETE FROM source_acl WHERE tenant='one'");db.commit();assert call(reader)=={'status':'unavailable'}
        db.execute("INSERT INTO source_acl VALUES('one','shared_id','alice')")
        for state in ['pending','quarantined']:
            db.execute("UPDATE reviewed_sources SET state=? WHERE tenant='one'",(state,));db.commit();assert call(reader)=={'status':'unavailable'}
        db.execute("UPDATE reviewed_sources SET state='published',reviewed_by=submitted_by WHERE tenant='one'");db.commit();assert call(reader)=={'status':'unavailable'}
        db.execute("UPDATE reviewed_sources SET reviewed_by='reviewer',text='TAMPERED_PRIVATE' WHERE tenant='one'");db.commit()
        assert call(reader)=={'status':'temporary_failure'}
        assert 'TAMPERED' not in json.dumps(call(reader))
    finally:reader.close()

class Parsed(HTMLParser):
    def __init__(self):super().__init__();self.tags=[];self.text=[]
    def handle_starttag(self,tag,attrs):self.tags.append((tag,attrs))
    def handle_data(self,data):self.text.append(data)

@pytest.mark.parametrize('text',['<script>alert(1)</script>','<img src="https://attacker.invalid/x" onerror="alert(1)">',
    '[click](javascript:alert(1))','```python\n__import__("os").system("echo unsafe")\n```','<a href="https://attacker.invalid">private</a>'])
def test_model_output_remains_display_text(text):
    evidence=Evidence('a'*64,'source','b'*64,'line:1',0,len(text),text)
    answer=CheckedAnswer('answered',text,((evidence,text[:160]),))
    page=render_checked_answer(answer);parser=Parsed();parser.feed(page)
    assert all(tag in ['pre','ul','li'] and not attrs for tag,attrs in parser.tags)
    assert text in ''.join(parser.text)

def test_display_bounds_and_missing_file(database,tmp_path: Path):
    with pytest.raises(ValueError):render_checked_answer(CheckedAnswer('answered','x'*1201,()))
    with pytest.raises(sqlite3.OperationalError):SecureNoteReader(tmp_path/'absent.sqlite',Principal('one','alice'),frozenset())
