import json
import sqlite3
from dataclasses import replace
from pathlib import Path
import pytest
from ops import Release, eligible
from etl import SCHEMA, ingest
from streamlit.testing.v1 import AppTest

def line(seq=1,revision=1,body='text',deleted=False):
    return json.dumps(dict(seq=seq,id='note',revision=revision,body=body,deleted=deleted)).encode()
def test_release_gate():
    baseline=Release('base','set-v1',{'a':'ok','b':'miss'},1000,2)
    assert eligible(baseline,replace(baseline,version='candidate'))
    assert not eligible(baseline,replace(baseline,outcomes={'a':'ok','b':'unsafe'}))
    assert not eligible(baseline,replace(baseline,cost_units=None))
    assert not eligible(baseline,replace(baseline,p95_ms=1501))
    with pytest.raises(ValueError):eligible(baseline,replace(baseline,dataset='other'))
def test_etl_atomic_cursor_scope_and_tombstone(tmp_path):
    with sqlite3.connect(tmp_path/'study.db') as db:
        db.executescript(SCHEMA)
        assert ingest(db,'a',line())==1;assert ingest(db,'a',line())==1
        assert ingest(db,'b',line(body='other'))==1
        with pytest.raises(ValueError):ingest(db,'a',line(2,2,'changed')+b'\n'+line(3,1,'conflict'))
        assert db.execute("SELECT body FROM documents WHERE tenant='a'").fetchone()==('text',)
        assert db.execute("SELECT sequence FROM checkpoints WHERE tenant='a'").fetchone()==(1,)
        ingest(db,'a',line(2,2,'',True))
        assert db.execute("SELECT body FROM documents WHERE tenant='a'").fetchone()==(None,)
        with pytest.raises(ValueError):ingest(db,'a',line(3,1,'resurrect'))
        with pytest.raises(ValueError):ingest(db,'a',b'{invalid')
def test_streamlit_form_and_rerun():
    app=AppTest.from_file(str(Path(__file__).with_name('app.py'))).run()
    assert not app.exception
    app.selectbox[0].select('Unsafe');app.button[0].click().run()
    assert len(app.error)==1 and not app.exception
    app.selectbox[0].select('Conservative');app.button[0].click().run()
    assert len(app.success)==1 and not app.exception
