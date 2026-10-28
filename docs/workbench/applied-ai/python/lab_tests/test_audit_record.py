# lab_tests/test_audit_record.py
from pathlib import Path
import json,sqlite3
import pytest
from pydantic import ValidationError
from study_ai.audit_record import AuditEvent,initialize_audit,append_audit

def event(**changes):
    return AuditEvent(**{**dict(event_id='a'*32,job_id='job1',actor_ref='b'*32,action='source_verified',source_version='c'*64),**changes})

def test_reopen_exact_replay_and_append_only(tmp_path: Path):
    path=tmp_path/'audit.sqlite';db=sqlite3.connect(path,timeout=.2);initialize_audit(db)
    one=append_audit(db,event());assert append_audit(db,event())==one;db.close();db=sqlite3.connect(path,timeout=.2)
    try:
        assert append_audit(db,event())==one
        with pytest.raises(ValueError):append_audit(db,event(source_version='d'*64))
        for sql in ['DELETE FROM audit_events','UPDATE audit_events SET payload=\'changed\'']:
            with pytest.raises(sqlite3.IntegrityError):db.execute(sql)
            db.rollback()
        row=db.execute('SELECT recorded_at,payload FROM audit_events').fetchone()
        assert '+00:00' in row[0] and json.loads(row[1])['source_version']=='c'*64
    finally:db.close()

@pytest.mark.parametrize('changes',[dict(prompt='PRIVATE'),dict(action='approve_anything'),dict(source_version=None),
    dict(action='execution_committed',command_hash='c'*64),dict(action='access_denied',receipt_ref='c'*32),dict(actor_ref='email@example.test'),dict(event_id='a'*32+'\n')])
def test_projection_and_reference_contract(changes):
    with pytest.raises(ValidationError):event(**changes)

def test_commit_unknown_distinction_and_failure_rollback(tmp_path: Path):
    db=sqlite3.connect(tmp_path/'failure.sqlite',timeout=.2);initialize_audit(db)
    try:
        unknown=event(action='execution_unknown',source_version=None,command_hash='d'*64)
        append_audit(db,unknown)
        committed=event(event_id='e'*32,action='execution_committed',source_version=None,command_hash='d'*64,receipt_ref='f'*32)
        db.execute("CREATE TRIGGER reject_event BEFORE INSERT ON audit_events WHEN NEW.event_id='"+'e'*32+"' BEGIN SELECT RAISE(ABORT,'fixture'); END")
        with pytest.raises(sqlite3.IntegrityError):append_audit(db,committed)
        assert db.execute('SELECT count(*) FROM audit_events').fetchone()==(1,)
        db.execute('DROP TRIGGER reject_event');append_audit(db,committed)
        assert db.execute('SELECT count(*) FROM audit_events').fetchone()==(2,)
    finally:db.close()
