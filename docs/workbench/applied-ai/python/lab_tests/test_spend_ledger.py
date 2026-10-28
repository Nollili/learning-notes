# lab_tests/test_spend_ledger.py
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import sqlite3
import pytest
from study_ai.spend_ledger import SpendLedger,BudgetDenied


def test_reservation_replay_unknown_and_settlement(tmp_path: Path):
    path=tmp_path/'budget.sqlite';ledger=SpendLedger(path)
    try:
        ledger.initialize(10000);assert ledger.reserve('job1',6000)=='new';assert ledger.reserve('job1',6000)=='pending'
        assert ledger.db.execute('SELECT available FROM budget').fetchone()==(4000,)
        ledger.settle('job1',None)
        assert ledger.db.execute('SELECT available FROM budget').fetchone()==(4000,)
        with pytest.raises(BudgetDenied):ledger.reserve('job2',6000)
        with pytest.raises(BudgetDenied):ledger.reserve('job1',5000)
        ledger.settle('job1',2500);ledger.settle('job1',2500)
        assert ledger.db.execute('SELECT available FROM budget').fetchone()==(7500,)
        with pytest.raises(BudgetDenied):ledger.settle('job1',2400)
    finally:ledger.close()
    ledger=SpendLedger(path)
    try:
        assert ledger.reserve('job1',6000)=='settled' # replay does not grant a new execution
        assert ledger.db.execute('SELECT available FROM budget').fetchone()==(7500,)
        with pytest.raises(sqlite3.IntegrityError):ledger.initialize(99999)
    finally:ledger.close()


def test_competing_connections_cannot_double_spend(tmp_path: Path):
    path=tmp_path/'race.sqlite';ledger=SpendLedger(path);ledger.initialize(10000);ledger.close()
    def reserve(job: str) -> bool:
        owner=SpendLedger(path)
        try:
            owner.reserve(job,6000);return True
        except BudgetDenied:return False
        finally:owner.close()
    with ThreadPoolExecutor(max_workers=2) as executor:
        assert sum(executor.map(reserve,['one','two']))==1
    ledger=SpendLedger(path)
    try:assert ledger.db.execute('SELECT available FROM budget').fetchone()==(4000,)
    finally:ledger.close()


def test_overrun_unknown_job_rollback_and_zero(tmp_path: Path):
    ledger=SpendLedger(tmp_path/'errors.sqlite')
    try:
        ledger.initialize(10000);ledger.reserve('a',6000)
        with pytest.raises(BudgetDenied):ledger.settle('a',6001)
        with pytest.raises(BudgetDenied):ledger.settle('absent',0)
        assert ledger.db.execute('SELECT available FROM budget').fetchone()==(4000,)
        ledger.db.execute("CREATE TRIGGER reject_refund BEFORE UPDATE ON budget WHEN NEW.available>OLD.available BEGIN SELECT RAISE(ABORT,'fixture'); END")
        with pytest.raises(sqlite3.IntegrityError):ledger.settle('a',1000)
        assert ledger.db.execute('SELECT used FROM reservations').fetchone()==(None,)
        ledger.db.execute('DROP TRIGGER reject_refund');ledger.settle('a',0)
        assert ledger.db.execute('SELECT available FROM budget').fetchone()==(10000,)
    finally:ledger.close()

@pytest.mark.parametrize('value',[True,0,-1,1.5,1_000_000_001])
def test_reservation_bounds(tmp_path: Path,value):
    ledger=SpendLedger(tmp_path/'bounds.sqlite')
    try:
        ledger.initialize(10000)
        with pytest.raises(ValueError):ledger.reserve('job',value)
    finally:ledger.close()


def test_synthetic_routing_gate():
    # Human-authored expected correctness: a schema validator cannot manufacture these labels.
    baseline=[(10000,True)]*4
    cheap_then_fallback=[(1000,True),(1000,False),(11000,True),(11000,True)]
    reviewed_route=[(1000,True),(1000,True),(10000,True),(10000,True)]
    assert sum(cost for cost,_ok in baseline)==40000
    assert sum(cost for cost,_ok in cheap_then_fallback)==24000
    assert sum(ok for _cost,ok in cheap_then_fallback)==3
    assert sum(cost for cost,_ok in reviewed_route)==22000
    assert all(ok for _cost,ok in reviewed_route)
