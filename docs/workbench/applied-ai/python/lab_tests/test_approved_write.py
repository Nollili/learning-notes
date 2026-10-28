import json,sqlite3
import pytest
from study_ai.approved_write import Rename,WriteRejected,initialize_writes,execute_approved_rename
from study_ai.vector_search import Principal
P=Principal('t','u');COMMAND=Rename('n1',0,'Approved title')

def setup(db,command=COMMAND,key='operation',expiry=100):
 initialize_writes(db)
 with db:
  db.execute('INSERT OR IGNORE INTO write_notes VALUES(?,?,?,?,?)',('t','u','n1','Before',0))
  db.execute('INSERT INTO approvals VALUES(?,?,?,?,?,NULL)',('t','u',key,command.digest(),expiry))

def run(db,command=COMMAND,key='operation',principal=P,now=1):
 return execute_approved_rename(db,principal=principal,operation_id=key,command=command,now=now)

def test_replay_after_reopen_and_expiry_without_second_write(tmp_path):
 path=tmp_path/'write.db';a=sqlite3.connect(path);setup(a);receipt=run(a);a.close()
 b=sqlite3.connect(path)
 try:
  assert run(b,now=200)==receipt
  assert json.loads(receipt)=={'status':'committed','note_id':'n1','version':1}
  assert b.execute('SELECT title,version FROM write_notes').fetchone()==('Approved title',1)
  for command in [Rename('n1',0,'Changed'),Rename('n1',1,'Approved title')]:
   with pytest.raises(WriteRejected):run(b,command)
 finally:b.close()

@pytest.mark.parametrize('principal',[Principal('other','u'),Principal('t','other')])
def test_scope(principal):
 db=sqlite3.connect(':memory:')
 try:
  setup(db)
  with pytest.raises(WriteRejected):run(db,principal=principal)
  assert db.execute('SELECT version FROM write_notes').fetchone()==(0,)
 finally:db.close()

def test_expiry_stale_missing_and_revocation():
 for change in ['expiry','version','missing','note','approval']:
  db=sqlite3.connect(':memory:')
  try:
   setup(db)
   with db:
    if change=='expiry':db.execute('UPDATE approvals SET expires_at=1')
    if change=='version':db.execute('UPDATE write_notes SET version=1')
    if change in ['missing','approval']:db.execute('DELETE FROM approvals')
    if change=='note':db.execute('DELETE FROM write_notes')
   with pytest.raises(WriteRejected):run(db)
  finally:db.close()

def test_failure_between_updates_rolls_back_both():
 db=sqlite3.connect(':memory:')
 try:
  setup(db)
  db.execute("CREATE TRIGGER fail_receipt BEFORE UPDATE ON approvals BEGIN SELECT RAISE(ABORT,'fixture failure'); END")
  with pytest.raises(sqlite3.IntegrityError):run(db)
  assert db.execute('SELECT title,version FROM write_notes').fetchone()==('Before',0)
  assert db.execute('SELECT receipt FROM approvals').fetchone()==(None,)
  db.execute('DROP TRIGGER fail_receipt');assert json.loads(run(db))['version']==1
 finally:db.close()

def test_competing_operations_and_busy(tmp_path):
 path=tmp_path/'writes.db';a=sqlite3.connect(path,timeout=0.01);b=sqlite3.connect(path,timeout=0.01)
 try:
  setup(a);setup(a,Rename('n1',0,'Second'),'second')
  a.execute('BEGIN IMMEDIATE')
  with pytest.raises(sqlite3.OperationalError):run(b)
  a.rollback();run(a)
  with pytest.raises(WriteRejected):run(b,Rename('n1',0,'Second'),'second')
  assert b.execute('SELECT version FROM write_notes').fetchone()==(1,)
 finally:a.close();b.close()

@pytest.mark.parametrize('changes',[{'note_id':'../secret'},{'expected_version':True},{'expected_version':-1},{'title':''},{'title':' padded '},{'title':'x'*81},{'title':'\ud800'}])
def test_invalid_command(changes):
 values=dict(note_id='n1',expected_version=0,title='Title');values.update(changes)
 with pytest.raises((ValueError,UnicodeError)):Rename(**values)
