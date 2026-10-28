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
