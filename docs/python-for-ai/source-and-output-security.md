# Tenant-Scoped Sources and Safe Output Sinks

Continue [task-scoped injection containment](./prompt-injection-boundaries.md), [evidence verification](./retrieval-context.md) and [approved writes](./approved-writes.md). This intermediate Python3.13/SQLite lab narrows the actual source-read and display boundaries. It does not execute model code, submit a provider request or claim that an approved document is factually correct.

## Isolation is a property of every artifact

A source ID such as `shared_id` can exist in two tenants. Resolve it using the current authenticated tenant and subject in the database predicate, not by reading an unscoped record and hoping later code remembers to filter it. Task scope is an additional restriction; it never overrides tenant/ACL checks. Tenant identity comes from the server-owned session/token mapping, not a generated tool argument or request body. Missing and inaccessible resources have the same safe unavailable response.

Apply the same scope to source bytes, chunks/vectors, job state/checkpoints, approvals/receipts, caches, histories, batch manifests, traces and citation-open routes. The existing vector lifecycle, scoped graph memory, approval executor and cache identity lessons implement different parts of this contract; a source query alone cannot secure the whole application. A shared privileged connection also needs narrow query APIs, current authorization and credential isolation. Database row-level policy or separate stores can add defense in depth, but have their own provisioning/connection-pool/context tests; this SQLite fixture does not implement them.

## Separate publication authority from model reads

The scratch source catalog uses the following schema. Run setup/seeding only on an owned disposable database through a trusted administrative connection. The runtime reader opens that existing database read-only; it has no publish/review/ACL tool. Schema initialization and publication are deliberately absent from its public API.

```sql
CREATE TABLE reviewed_sources(
  tenant TEXT NOT NULL, source TEXT NOT NULL, revision TEXT NOT NULL,
  text TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN('pending','published','quarantined')),
  submitted_by TEXT NOT NULL, reviewed_by TEXT, approved_digest TEXT,
  PRIMARY KEY(tenant,source)
);
CREATE TABLE source_acl(
  tenant TEXT NOT NULL, source TEXT NOT NULL, subject TEXT NOT NULL,
  PRIMARY KEY(tenant,source,subject)
);
```

The catalog's reviewed identity/digest/state fields must be written by an authenticated authorized governance workflow. A client or model setting `reviewed_by="reviewer"` is not a real review. The two-identity check below is a small policy invariant, not an authentication system. In a deployed service enforce separate submit/review permissions, exact-revision approval, audit and publication/revocation transactions in the trusted write service. The fixture tests seed these records; no person is credited with approving them.

```python
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
```

Construct one reader from the authenticated principal and server-reviewed source-selection set, and call only `run(name, arguments)` from the model dispatcher. Close it in `finally`. Its synchronous SQLite access needs an owned serialized execution context; do not share the connection across arbitrary FastAPI threads or block an async event loop with large scans. The0.2-second SQLite timeout is not a complete request deadline. The store path and parent directory are deployment-owned, never model-selected; failure to open an existing database must not create a new empty one.

The `mode=ro` connection refuses writes even if a caller turns off query_only. This is narrower than handing the model a generic database executor. It is not an OS sandbox: a compromised Python process with filesystem authority could reopen the file differently. Deploy separate read credentials/process/file permissions where needed and minimize what the process can access. Do not make arbitrary SQL, shell, file paths or network tools available as a “fallback.” `get` and `db` are adapter internals/test seams, not public model capabilities.

## Treat a model result according to its destination

The renderer consumes the checked answer DTO, enforces a display budget and escapes text into fixed HTML text nodes. Code fences, Markdown links, script/image tags and proposed commands stay literal text. The renderer does not auto-link URLs, execute Python/JavaScript/SQL or interpret Markdown. Serve the result with a correct HTML content type and the application's CSP; this function is only the body fragment, not a complete HTTP/security-header implementation. In React, render strings as ordinary JSX text; do not insert raw model output with dangerouslySetInnerHTML. The existing streaming UI accepts a validated terminal result rather than treating partial tokens as successful output.

If a product needs rich Markdown, define a constrained renderer, sanitize generated HTML with a maintained sanitizer, disable raw HTML where possible, control URL protocols/remote images, and test the actual browser sink. HTML escaping is context-specific: it cannot make a string safe inside JavaScript, CSS, SQL or a shell. For database changes use fixed parameterized commands and current resource checks; for writes retain the exact human approval/version/idempotency contract. A fenced code block is a proposal to review, not authorization to run it. A schema-valid tool call still needs capability and business-policy checks.

Citation text here has no clickable link. A real citation route constructs an application-owned target from a checked source identity and reauthorizes on open. Never use a generated URL as trusted navigation or load a model-suggested remote image to display an answer. Escaping blocks active HTML in this sink; it does not detect false claims, phishing in plain language or secrets already allowed into the answer.

## Poisoning and integrity are different questions

Training-data poisoning changes what a model learns; RAG corpus poisoning changes the evidence a retrieval system supplies without retraining weights. An injected false “official policy” can produce a well-cited but wrong answer even when the model follows its instructions. Attackers may target source ownership, ingestion, ranking, duplicate crowding or review artifacts. A content hash detects a change relative to an approved snapshot; it does not establish that the snapshot is true, safe or current.

Use pending→reviewed publication→quarantine/replacement with accountable source owners, exact version/provenance, change review and regression labels. A new revision must not inherit approval from the old one just because the source ID stayed the same. The reader requires the published text's hash to match its approved digest/revision; tampering becomes an operational failure, not a cached-text fallback. Quarantine or ACL revocation removes current access. Derived vectors/caches and in-flight publication need the source-version checks described in the lifecycle/evidence lessons.

Worked case: a submitted note says “disable authentication to fix the login issue.” A reviewer must assess source authority and the claim; valid UTF-8, a stable hash and a plausible title are insufficient. Leave it pending or quarantine it with a fixed reason category; preserve the last accepted **current and authorized** version only under an explicit version policy, never silently resurrect revoked content. Investigate affected queries/citations, compare the reviewed corpus snapshot, repair the ingestion/review boundary and add a minimized regression. Do not automatically train on model feedback or retrieved text that has not passed its own data-governance process. This lab tests state/integrity enforcement, not automatic truth/poisoning detection.

## Real-file and parser checks

```python
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
```

**Practice acceptance:** reproduce the same-ID two-tenant case, revoked subject, pending/quarantined source, self-review rejection, changed bytes without new review and read-only write/drop denial. Wire the reader through actual authenticated routes and prove model owner fields cannot select identity. Feed hostile script/image/Markdown/code strings to the real UI and verify text rendering, keyboard/citation behavior and no unexpected network fetch. Build an authenticated publisher/reviewer workflow and prove a changed revision needs a new review; a fabricated model approval must fail. Record a poisoning threat case and which controls enforce integrity versus factual judgment. Retain source/cache/checkpoint isolation tests and evidence of cleanup. Learner integration and browser/security review remain required.

**Validation performed:** exact reader/renderer passed strict mypy. Eleven offline tests passed:8 real-file/parser cases plus3 existing task-scope cases. They cover same source ID in two tenants, current ACL/revocation, forbidden owner override, read-only mutation denial, missing-file behavior, publication/review/digest gates and fixed-tag HTML parsing for hostile output. The initial fixture had an incorrect INSERT placeholder count; it was corrected before the final successful run and before embedding. No browser, real authentication/governance UI, OS sandbox, deployed multi-tenant service or semantic poisoning detector was tested.

Authoritative references checked2026-10-25: [OWASP improper output handling](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/), [data/model poisoning](https://genai.owasp.org/llmrisk/llm042025-data-and-model-poisoning/), [excessive agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/), [Python SQLite URI/connection documentation](https://docs.python.org/3.13/library/sqlite3.html). The implemented fixture supplies the local measurements above.
