# study_ai/secure_note_reader.py
from __future__ import annotations

import hashlib
import html
import re
import sqlite3
from pathlib import Path

from .evidence import CheckedAnswer
from .note_tool import StoredNote, StoreUnavailable, dispatch_note_tool
from .task_scope import TaskNoteStore
from .vector_search import Principal


class SecureNoteReader:
    """Fixed principal/task scope, read-only connection; exclusively owned, then closed."""
    def __init__(self, path: Path, principal: Principal, sources: frozenset[str]):
        if any(re.fullmatch(r'[A-Za-z0-9_-]{1,64}', value) is None
               for value in (principal.tenant, principal.subject)):
            raise ValueError('Invalid identity')
        self.principal = principal
        self.scoped = TaskNoteStore(self, sources)
        self.db = sqlite3.connect(path.resolve().as_uri() + '?mode=ro', uri=True, timeout=0.2)
        try:
            self.db.execute('PRAGMA query_only=ON')
        except BaseException:
            self.db.close()
            raise

    def close(self) -> None:
        self.db.close()

    def get(self, source_id: str) -> StoredNote | None:
        try:
            row = self.db.execute('''SELECT s.revision,s.text,s.approved_digest FROM reviewed_sources s
              WHERE s.tenant=? AND s.source=? AND s.state='published'
              AND s.reviewed_by IS NOT NULL AND s.reviewed_by<>s.submitted_by
              AND EXISTS(SELECT 1 FROM source_acl a WHERE a.tenant=s.tenant
              AND a.source=s.source AND a.subject=?)''',
              (self.principal.tenant, source_id, self.principal.subject)).fetchone()
            if row is None:
                return None
            revision, text, approved_digest = row
            if (not all(isinstance(v, str) for v in row) or len(text) > 2000
                    or hashlib.sha256(text.encode('utf-8', errors='strict')).hexdigest() != approved_digest
                    or revision != approved_digest):
                raise ValueError('Invalid approved snapshot')
            return StoredNote(self.principal.tenant, frozenset({self.principal.subject}),
                              source_id, revision, text)
        except (sqlite3.Error, ValueError, UnicodeError):
            raise StoreUnavailable('Source service unavailable') from None

    def run(self, name: str, arguments: str) -> str:
        return dispatch_note_tool(name, arguments, principal=self.principal, store=self.scoped)


def render_checked_answer(answer: CheckedAnswer) -> str:
    # HTML text sink only. This function never interprets Markdown, code or URLs.
    if len(answer.answer) > 1200 or len(answer.citations) > 4:
        raise ValueError('Display budget exceeded')
    if any(len(quote) > 160 for _evidence, quote in answer.citations):
        raise ValueError('Display budget exceeded')
    answer.answer.encode('utf-8', errors='strict')
    body = '<pre>' + html.escape(answer.answer, quote=True) + '</pre><ul>'
    for evidence, quote in answer.citations:
        if len(evidence.source_id) > 64:
            raise ValueError('Display budget exceeded')
        body += '<li>' + html.escape(evidence.source_id + ': ' + quote, quote=True) + '</li>'
    return body + '</ul>'
