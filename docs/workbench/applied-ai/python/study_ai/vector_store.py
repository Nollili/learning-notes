# study_ai/vector_store.py
from __future__ import annotations

import hashlib
import json
import sqlite3
from collections.abc import Iterator, Sequence
from contextlib import contextmanager
from pathlib import Path

from .vector_search import Principal, VectorSpace, cosine, unit_vector


def identifier(value: str) -> None:
    if not value or len(value) > 128 or not value.isascii() or not all(c.isalnum() or c in '_-.' for c in value):
        raise ValueError('Invalid identifier')


def space_key(space: VectorSpace) -> str:
    identifier(space.model_revision)
    identifier(space.preprocessing_version)
    if type(space.dimensions) is not int or not 1 <= space.dimensions <= 4096:
        raise ValueError('Invalid dimension')
    return json.dumps([space.model_revision, space.dimensions, space.preprocessing_version], separators=(',', ':'))


class VectorStore:
    """One serialized owner/connection; one text chunk per source in this lab."""
    def __init__(self, path: Path):
        self.db = sqlite3.connect(path, timeout=0.2, isolation_level=None)
        self.db.execute('PRAGMA foreign_keys=ON')
        self.db.executescript('''
        CREATE TABLE IF NOT EXISTS sources(tenant TEXT NOT NULL, source TEXT NOT NULL, version TEXT NOT NULL,
          text TEXT NOT NULL, PRIMARY KEY(tenant,source));
        CREATE TABLE IF NOT EXISTS acl(tenant TEXT NOT NULL, source TEXT NOT NULL, subject TEXT NOT NULL,
          PRIMARY KEY(tenant,source,subject), FOREIGN KEY(tenant,source) REFERENCES sources ON DELETE CASCADE);
        CREATE TABLE IF NOT EXISTS generations(id TEXT NOT NULL PRIMARY KEY, space TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS vectors(generation TEXT NOT NULL, tenant TEXT NOT NULL, source TEXT NOT NULL,
          version TEXT NOT NULL, vector TEXT NOT NULL, PRIMARY KEY(generation,tenant,source),
          FOREIGN KEY(generation) REFERENCES generations(id) ON DELETE CASCADE,
          FOREIGN KEY(tenant,source) REFERENCES sources ON DELETE CASCADE);
        CREATE TABLE IF NOT EXISTS active(singleton INTEGER PRIMARY KEY CHECK(singleton=1),
          generation TEXT NOT NULL REFERENCES generations(id));
        ''')

    def close(self) -> None:
        self.db.close()

    @contextmanager
    def write(self) -> Iterator[None]:
        self.db.execute('BEGIN IMMEDIATE')
        try:
            yield
            self.db.execute('COMMIT')
        except BaseException:
            self.db.execute('ROLLBACK')
            raise

    def publish_source(self, tenant: str, source: str, text: str, subjects: Sequence[str]) -> str:
        # Trusted ingestion/admin port: callers must already have write authority.
        identifier(tenant)
        identifier(source)
        if not text.strip() or len(text) > 2000 or len(subjects) > 100 or len(set(subjects)) != len(subjects):
            raise ValueError('Invalid source')
        for subject in subjects:
            identifier(subject)
        version = hashlib.sha256(text.encode('utf-8', errors='strict')).hexdigest()
        with self.write():
            self.db.execute('INSERT INTO sources VALUES(?,?,?,?) ON CONFLICT(tenant,source) '
                            'DO UPDATE SET version=excluded.version,text=excluded.text', (tenant, source, version, text))
            self.db.execute('DELETE FROM acl WHERE tenant=? AND source=?', (tenant, source))
            self.db.executemany('INSERT INTO acl VALUES(?,?,?)', [(tenant, source, s) for s in subjects])
        return version

    def generation(self, name: str, space: VectorSpace) -> None:
        identifier(name)
        self.db.execute('INSERT INTO generations VALUES(?,?)', (name, space_key(space)))

    def index(self, generation: str, tenant: str, source: str, version: str,
              vector: Sequence[float], *, space: VectorSpace) -> None:
        expected = space_key(space)
        if len(vector) != space.dimensions:
            raise ValueError('Dimension mismatch')
        normalized = unit_vector(vector)
        with self.write():
            if self.db.execute('SELECT space FROM generations WHERE id=?', (generation,)).fetchone() != (expected,):
                raise ValueError('Space mismatch')
            if self.db.execute('SELECT version FROM sources WHERE tenant=? AND source=?',
                               (tenant, source)).fetchone() != (version,):
                raise ValueError('Source changed or unavailable')
            self.db.execute('INSERT INTO vectors VALUES(?,?,?,?,?) ON CONFLICT(generation,tenant,source) '
                            'DO UPDATE SET version=excluded.version,vector=excluded.vector',
                            (generation, tenant, source, version, json.dumps(normalized, allow_nan=False)))

    def activate(self, generation: str) -> None:
        # All current sources must have exactly one current vector, checked under the writer lock.
        with self.write():
            if not self.db.execute('SELECT 1 FROM generations WHERE id=?', (generation,)).fetchone():
                raise ValueError('Unknown generation')
            missing = self.db.execute('''SELECT 1 FROM sources s WHERE NOT EXISTS(
              SELECT 1 FROM vectors v WHERE v.generation=? AND v.tenant=s.tenant
              AND v.source=s.source AND v.version=s.version) LIMIT 1''', (generation,)).fetchone()
            if missing:
                raise ValueError('Incomplete generation')
            self.db.execute('INSERT INTO active VALUES(1,?) ON CONFLICT(singleton) '
                            'DO UPDATE SET generation=excluded.generation', (generation,))

    def delete_source(self, tenant: str, source: str) -> None:
        with self.write():
            self.db.execute('DELETE FROM sources WHERE tenant=? AND source=?', (tenant, source))

    def search(self, vector: Sequence[float], *, principal: Principal, space: VectorSpace,
               top_k: int = 3) -> tuple[tuple[str, str, float], ...]:
        identifier(principal.tenant)
        identifier(principal.subject)
        if type(top_k) is not int or not 1 <= top_k <= 20 or len(vector) != space.dimensions:
            raise ValueError('Invalid search budget')
        unit_vector(vector)
        expected = space_key(space)
        # One SQL statement gives a consistent active-space/ACL/source-version snapshot.
        rows = self.db.execute('''SELECT g.space, v.source, v.version, v.vector FROM active a
          JOIN generations g ON g.id=a.generation
          LEFT JOIN vectors v ON v.generation=g.id AND v.tenant=?
          AND EXISTS(SELECT 1 FROM sources s WHERE s.tenant=v.tenant AND s.source=v.source AND s.version=v.version)
          AND EXISTS(SELECT 1 FROM acl x WHERE x.tenant=v.tenant AND x.source=v.source AND x.subject=?)
          WHERE a.singleton=1 LIMIT 501''', (principal.tenant, principal.subject)).fetchall()
        if not rows or any(row[0] != expected for row in rows):
            raise ValueError('Active space unavailable')
        if len(rows) > 500:
            raise ValueError('Exact scan budget exceeded')
        scored: list[tuple[str, str, float]] = []
        for _space, source, version, encoded in rows:
            if source is None:
                continue
            raw: object = json.loads(encoded)
            if not isinstance(raw, list) or len(raw) != space.dimensions:
                raise ValueError('Corrupt vector')
            components: list[float] = []
            for value in raw:
                if isinstance(value, bool) or not isinstance(value, (int, float)):
                    raise ValueError('Corrupt vector')
                components.append(float(value))
            scored.append((str(source), str(version), cosine(vector, components)))
        scored.sort(key=lambda row: (-row[2], row[0]))
        return tuple(scored[:top_k])
