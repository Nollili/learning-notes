import hashlib
import json
import re
import sqlite3

SCHEMA = '''CREATE TABLE documents(tenant TEXT,id TEXT,revision INTEGER,digest TEXT,body TEXT,PRIMARY KEY(tenant,id));
CREATE TABLE checkpoints(tenant TEXT PRIMARY KEY,sequence INTEGER NOT NULL);'''

def ingest(db: sqlite3.Connection, tenant: str, raw: bytes) -> int:
    if re.fullmatch(r'[a-z0-9-]{1,64}', tenant) is None or len(raw) > 262144:
        raise ValueError('Input budget/scope')
    lines = raw.decode('utf-8', errors='strict').splitlines()
    if not 1 <= len(lines) <= 100:
        raise ValueError('Batch count')
    records = []
    previous = 0
    for line in lines:
        row = json.loads(line)
        if (type(row) is not dict or set(row) != {'seq','id','revision','body','deleted'}
            or type(row['seq']) is not int or not previous < row['seq'] <= 10**9
            or type(row['id']) is not str or re.fullmatch(r'[a-z0-9-]{1,64}',row['id']) is None
            or type(row['revision']) is not int or not 1 <= row['revision'] <= 10**6
            or type(row['body']) is not str or not len(row['body']) <= 8192
            or type(row['deleted']) is not bool or (row['deleted'] and row['body'])):
            raise ValueError('Invalid source record')
        previous = row['seq'];records.append(row)
    # Own one default-isolation SQLite connection and serialize calls. with db commits/rolls back.
    with db:
        db.execute('INSERT INTO checkpoints VALUES(?,0) ON CONFLICT DO NOTHING',(tenant,))
        last = db.execute('SELECT sequence FROM checkpoints WHERE tenant=?',(tenant,)).fetchone()[0]
        for row in records:
            if row['seq'] <= last:
                continue  # Re-delivery at/before the durable source cursor.
            digest = hashlib.sha256(json.dumps([row['body'],row['deleted']],ensure_ascii=True).encode()).hexdigest()
            old = db.execute('SELECT revision,digest FROM documents WHERE tenant=? AND id=?',(tenant,row['id'])).fetchone()
            if old and (row['revision'] < old[0] or (row['revision'] == old[0] and digest != old[1])):
                raise ValueError('Source revision conflict')
            # Keep a tombstone revision so an older update cannot resurrect a deletion.
            db.execute('INSERT INTO documents VALUES(?,?,?,?,?) ON CONFLICT(tenant,id) DO UPDATE SET revision=excluded.revision,digest=excluded.digest,body=excluded.body',
                       (tenant,row['id'],row['revision'],digest,None if row['deleted'] else row['body']))
            last = row['seq']
        db.execute('UPDATE checkpoints SET sequence=? WHERE tenant=?',(last,tenant))
    return last
