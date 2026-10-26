# Model Task Economics and Shared Reservations

Continue [usage/latency measurement](./evaluation-measurements.md) and [bounded workflows](./tool-workflow-state.md). This intermediate Python lesson compares complete task policies, not model token prices alone. All money examples use **hypothetical integer micro-USD**, not current provider rates, a real invoice or a purchasing recommendation. The existing Decimal usage calculator remains the accounting source; do not add cached/reasoning subsets twice.

## Count the whole user task

A task may include query rewriting, retrieval/embedding, generation, tool calls, retries, reranking, verification/judge calls and storage/network work. Attach each attempted operation to the job and policy version. Aggregate failed/cancelled/partial work and unknown usage; a missing final stream usage record is not a free call. Reconcile estimated spend against the actual selected provider contract and billing. Include background indexing/evaluation separately and decide how shared overhead is allocated before comparing products.

The earlier fixture costs2500 micro-USD per attempt. A three-stage planner→worker→judge workflow at that same fictional per-call cost is7500 before retries. If each stage allows up to three attempts, its **maximum** is9 calls/22500; the observed count may be lower. Branching to two workers and judging each branch changes the call tree again. A loop that repeatedly includes growing history can increase input cost per call, so call count alone is not a cost ceiling. Bound route/depth/attempts, payload/context/output, provider time and tool fees together; do not infer a safe maximum from average usage.

Define denominators explicitly: total known spend across all tasks, unknown-charge tasks, accepted/successful task count, cost per accepted task, failure cost and deferred work. Four scheduled tasks with three accepted outcomes and spend24000 have observed cost per accepted task8000, but one failed task remains a quality loss. Reporting only the three successful call costs would hide it. Small synthetic samples do not estimate a real workload's expected cost.

## Route only within a measured capability envelope

Keep one capable default configuration and a cheaper alternative for an explicitly bounded task slice. For example, a deterministic validated classification may use a smaller model, while a multi-source comparison uses the capable route or human review. Risk, required modality/context/tools, permissions, latency and expected task difficulty shape routing. Do not send private data to another provider just because its price is lower. Routing classification can itself be wrong and costly; include that stage and evaluate its mistakes.

A schema failure can trigger a bounded fallback; a plausible but false schema-valid answer often cannot. Model self-reported confidence is not a calibrated correctness detector. Use reviewed development labels, explicit uncertainty/coverage policy and a held-out confirmation set. Fallbacks consume additional cost and latency; a deadline may leave no budget for the second route. Apply the same current access and safety gates to every route. Never downgrade authorization or output validation to make a cheap route pass.

| Authored four-task policy | Hypothetical total micro-USD | Reviewed accepted tasks | Decision under all4-correct gate |
|---|---:|---:|---|
| Capable baseline:4×10000 |40000|4|Reference |
| Cheap-first:4×1000 plus2×10000 fallbacks |24000|3|Reject despite lower spend; one fluent error escaped fallback |
| Reviewed slice route:2×1000 plus2×10000 |22000|4|Eligible for further held-out testing, not established superiority |

These labels are hand-authored to teach the decision. No live model accuracy or real savings were measured. Use paired cases/slices, repeat policy, denial/leakage hard gates and rollback configuration from the evaluation lesson. Quality is a prerequisite; then compare cost/latency within an acceptable quality envelope rather than average them into a score that hides a security failure.

## Reserve before starting work

A post-hoc sum does not stop two concurrent jobs from spending the same local allocation. The following real-file SQLite fixture reserves an integer maximum atomically across connections. A fixed account/allocation owns the file; initialization is a privileged one-time operation. Job IDs are application-owned stable identities bound to immutable workflow/configuration, not arbitrary model text or a client-controlled way to reuse another job's reservation. It is local concurrency control, not a provider-side hard spend cap.

```python
# study_ai/spend_ledger.py
from __future__ import annotations
import sqlite3
from pathlib import Path
from typing import Literal

class BudgetDenied(Exception):
    pass

class SpendLedger:
    """Local fixture: integer micro-units, one serialized connection owner."""
    def __init__(self, path: Path):
        self.db=sqlite3.connect(path,timeout=0.2,isolation_level=None)
        self.db.executescript('''
        CREATE TABLE IF NOT EXISTS budget(id INTEGER PRIMARY KEY CHECK(id=1), available INTEGER NOT NULL CHECK(available>=0));
        CREATE TABLE IF NOT EXISTS reservations(job TEXT NOT NULL PRIMARY KEY,
          reserved INTEGER NOT NULL CHECK(reserved>0), used INTEGER CHECK(used>=0 AND used<=reserved));
        ''')

    def close(self) -> None:
        self.db.close()

    def initialize(self, available: int) -> None:
        if type(available) is not int or not 1 <= available <= 1_000_000_000:
            raise ValueError('Invalid fixture allocation')
        self.db.execute('INSERT INTO budget VALUES(1,?)',(available,))

    def reserve(self, job: str, maximum: int) -> Literal['new', 'pending', 'settled']:
        if not job or len(job)>128 or type(maximum) is not int or not 1<=maximum<=1_000_000_000:
            raise ValueError('Invalid reservation')
        self.db.execute('BEGIN IMMEDIATE')
        try:
            existing=self.db.execute('SELECT reserved,used FROM reservations WHERE job=?',(job,)).fetchone()
            if existing:
                if existing[0]!=maximum:raise BudgetDenied('Reservation identity conflict')
                status: Literal['new', 'pending', 'settled'] = 'pending' if existing[1] is None else 'settled'
            else:
                status='new'
                row=self.db.execute('UPDATE budget SET available=available-? WHERE id=1 AND available>=? RETURNING available',
                                    (maximum,maximum)).fetchone()
                if row is None:raise BudgetDenied('Allocation unavailable')
                self.db.execute('INSERT INTO reservations VALUES(?,?,NULL)',(job,maximum))
            self.db.execute('COMMIT')
            return status
        except BaseException:
            self.db.execute('ROLLBACK')
            raise

    def settle(self, job: str, used: int | None) -> None:
        # Unknown usage keeps the full reservation; do not infer zero from cancellation.
        if used is not None and (type(used) is not int or not 0<=used<=1_000_000_000):
            raise ValueError('Invalid usage')
        self.db.execute('BEGIN IMMEDIATE')
        try:
            row=self.db.execute('SELECT reserved,used FROM reservations WHERE job=?',(job,)).fetchone()
            if row is None:raise BudgetDenied('Unknown reservation')
            maximum,settled=row
            if used is not None:
                if settled is not None:
                    if used!=settled:raise BudgetDenied('Settlement identity conflict')
                else:
                    if used>maximum:raise BudgetDenied('Estimate overrun: manual reconciliation required')
                    self.db.execute('UPDATE reservations SET used=? WHERE job=?',(used,job))
                    self.db.execute('UPDATE budget SET available=available+? WHERE id=1',(maximum-used,))
            self.db.execute('COMMIT')
        except BaseException:
            self.db.execute('ROLLBACK')
            raise
```

Only `new` authorizes starting the associated job **once** through the durable workflow owner. `pending` means a reservation already exists and work may be in flight or its outcome unknown; reconcile the existing job, do not launch another provider call. `settled` means reuse the stored job result/state, not grant another execution. The ledger deliberately does not implement job result persistence, a lease, human identity or distributed provider idempotency. Combine it with the existing checkpoint/approved-write patterns through a tested service contract rather than treating a return value as a complete runner.

A crash after reserving but before calling leaves held capacity. Releasing it safely requires evidence no remote work started, or reconciliation under the provider's actual request/idempotency/status contract. A timeout, local abort, lease expiry or absent usage does not establish that. Unknown usage stays fully reserved. A known usage at or below the bound releases only the difference, exactly once. A reported overrun is rejected with capacity held for manual reconciliation; actual external spend can exceed an underestimated bound. Alert and stop new work under an overrun policy instead of silently refunding or rounding down.

The maximum must cover the complete bounded workflow and selected verified rate version/fees, conservatively rounding fractional micro-units upward at reservation. Token/output caps and local admission do not control every provider billing dimension. Cost caps must come from enforceable workload limits plus reconciled usage, not a prompt saying “be cheap.” A shared PostgreSQL/service adapter may replace this local file when several machines participate; two independent files cannot share a global budget.

One serialized owner uses each SQLite connection. Close it explicitly. Treat schema initialization or failed rollback as fatal to the owner and discard the connection; CREATE IF NOT EXISTS is not a migration strategy. Protect the database/parent directory and do not expose the fixture's `db` attribute through an API. The0.2-second lock timeout is not the overall job deadline. Production tenant/account/day allocation, rollover, currency/rate version, administration, audit/retention and overrun reconciliation are separate required design decisions; do not reset the allocation on every startup or midnight while uncertain old jobs still exist.

## Executable acceptance

```python
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
```

Run strict mypy for the module and pytest for this file plus the existing `test_eval_measurements.py`. The two-connection test creates each connection in its own thread and shows one6000 reservation succeeds from a10000 allocation, leaving4000. File reopen preserves replay state. A trigger injects failure between settlement and refund: both changes roll back together. This tests local ledger atomicity; no provider calls are made.

**Practice:** implement a bounded job that reserves before its first call, persists stage/results and reconciles known/unknown usage after injected failures. Acceptance: competing jobs cannot exceed the local allocation; replay cannot run a settled job again; ambiguous outcomes never refund automatically; settlement replay is exact; estimate overrun blocks promotion and records an operational incident. Build a versioned per-task cost ledger including all calls/unknowns and compare the three routing policies on a learner-authored labeled workload. Reject a cheaper policy with a required slice regression. Learner implementation, current price verification, actual provider bills and routing evaluation remain required.

**Validation performed:** exact ledger passed strict mypy. Seventeen offline tests passed:9 ledger/routing cases and8 existing usage/latency cases. They cover reservation/settlement replay, two-thread independent connections, insufficient allocation, identity conflicts, unknown/zero usage, overrun, atomic refund rollback, bounds and the declared synthetic quality gate. No external spend cap, deployed shared ledger, live route/model/provider usage or invoice reconciliation was tested.

Official references checked2026-10-25: [cost optimization](https://developers.openai.com/api/docs/guides/cost-optimization), [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization), [Python SQLite transactions](https://docs.python.org/3.13/library/sqlite3.html). Use current official model/endpoint pricing for an actual rate schedule; this lesson intentionally supplies none.
