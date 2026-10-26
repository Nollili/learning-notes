# Build Artifacts and Database Rollback Compatibility

This senior delivery/intermediate backend lab turns the [release compatibility matrix](../senior_growth/CD_CI/Release_strategies._What_strategy_do_you_use_on_project_How_will_you_build_a_release_strategy_for_open_source_project.md) into an actual PostgreSQL16.13 experiment. Node24.18 loads four packaged storage adapters from extracted artifacts. They use an application-owned SQL port; this is not a complete server/container or a deployed CI pipeline.

## Separate job state from shared artifacts

CI jobs normally have separate filesystems/process state. A previous job's npm install or build directory does not implicitly exist in the next. Each consumer checks out the required source/config and installs its own tooling from the reviewed lockfile when needed, or downloads the explicit immutable artifact it consumes. npm ci needs the matching lockfile/package manifest and fails rather than update a mismatched lock. A cache accelerates installation; it is not the authoritative release artifact or a substitute for required installation.

| Stage | Required inputs and output | Gate |
|---|---|---|
| Build | Known source/config/toolchain/dependency lock; one artifact plus manifest/digest | Build/tests appropriate to source; inspect contents; exclude secrets/tests/dev-only material when not required |
| Isolated artifact verification | Download artifact and trusted expected identity; own test tooling/runtime | Verify digest/provenance, extract only trusted bounded artifacts and test the packaged bytes, not a fresh rebuild |
| Migration/compatibility | Current schema state, versioned migration, old/bridge/new artifacts, isolated data | Old/new reader/writer matrix, constraints, lock bounds, interrupted backfill and explicit rollback window |
| Staging/promotion | Exact verified artifact identity plus environment configuration/secrets | Smoke/health/load/security gates and appropriate approval; promote the same bytes |
| Recovery | Known compatible artifact allowlist and current data/migration state | Roll back only within the verified window; otherwise forward repair/reconciliation |

Do not deploy a freshly rebuilt “same version” after testing another archive: time/dependency/build differences can change bytes. A SHA256 binds bytes, not authorship or permission; the expected identity must come from a trusted build/provenance channel. Do not extract arbitrary user archives because a digest string exists. The fixture's fixed archive allowlist contains only manifest.json/storage.mjs, with no path traversal or dependency installation.

## Four real storage contracts

The SQL strings are fixed application code selected by one of four trusted fixture releases, not generated/client SQL. A real route still validates inputs/current identity and authorizes records. Values are parameter-bound; SQL syntax binding does not itself supply authorization. V1 writes/reads name, V2 bridges with dual writes while reading name, V3 reads display_name while dual-writing, and V4 writes/reads only display_name.

```js
// storage.mjs
const contracts = new Map([
  ['v1', { read: 'SELECT name AS label FROM release_people WHERE id=$1',
    write: 'UPDATE release_people SET name=$2 WHERE id=$1' }],
  ['v2', { read: 'SELECT name AS label FROM release_people WHERE id=$1',
    write: 'UPDATE release_people SET name=$2,display_name=$2 WHERE id=$1' }],
  ['v3', { read: 'SELECT display_name AS label FROM release_people WHERE id=$1',
    write: 'UPDATE release_people SET name=$2,display_name=$2 WHERE id=$1' }],
  ['v4', { read: 'SELECT display_name AS label FROM release_people WHERE id=$1',
    write: 'UPDATE release_people SET display_name=$2 WHERE id=$1' }],
]);
export function storage(version, query) {
  const contract = contracts.get(version);
  if (!contract) throw new Error('Unknown release');
  return {
    async read(id) { const result = await query(contract.read, [id]); return result.rows[0]?.label; },
    async write(id, label) { return query(contract.write, [id, label]); },
  };
}
```

## Package once and inspect what is delivered

```js
// build-artifacts.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const source = await fs.readFile(new URL('./storage.mjs', import.meta.url));
const root = process.argv[2];
if (!root) throw Error('Provide an owned output directory');
await fs.mkdir(root,{recursive:true});
for (const version of ['v1','v2','v3','v4']) {
  const dir=path.join(root,version);await fs.mkdir(dir); // fresh directory; do not overwrite an existing artifact
  await fs.writeFile(path.join(dir,'storage.mjs'),source);
  await fs.writeFile(path.join(dir,'manifest.json'),JSON.stringify({version,node:'24',source_sha256:createHash('sha256').update(source).digest('hex')}));
  const archive=path.join(root,version+'.tgz');
  execFileSync('tar',['-czf',archive,'-C',dir,'manifest.json','storage.mjs']);
  const digest=createHash('sha256').update(await fs.readFile(archive)).digest('hex');
  await fs.writeFile(archive+'.sha256',digest+'\n');
}
```

Run this only with a fresh owned output directory: node build-artifacts.mjs /absolute/path/to/owned-build. The consumer imports storage.mjs from a separate extracted directory, with no source-tree import. The lab uses the existing isolated node-postgres test driver to supply the SQL port. There are no runtime imports inside this tiny adapter artifact, so it needs no runtime npm install; that is not representative of a full Express/MikroORM app. A real app must package/install its production dependency tree using its actual lockfile/runtime/platform contract. Do not copy a host-specific node_modules blindly into another OS/architecture.

The tar output is fixed for a built release and identified by its saved digest, not promised byte-reproducible across separate builds. Keep runtime/OS/toolchain, source revision, lock and schema compatibility metadata with a real artifact. Never include .env, provider keys, database dumps or private logs. Use least-privilege secret injection at runtime, not build-time secret files embedded in the archive.

## Real database exercise

```js
// check.mjs — run with an owned private PostgreSQL fixture root
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import pg from 'pg';
const root=process.argv[2],build=path.join(root,'build-job'),consumer=path.join(root,'test-job');await fs.mkdir(consumer);
execFileSync(process.execPath,[new URL('./build-artifacts.mjs',import.meta.url).pathname,build]);
const clients={};
for(const version of ['v1','v2','v3','v4']){
 const archive=path.join(build,version+'.tgz'),bytes=await fs.readFile(archive);const expected=(await fs.readFile(archive+'.sha256','utf8')).trim();
 assert.equal(createHash('sha256').update(bytes).digest('hex'),expected);
 const listing=execFileSync('tar',['-tzf',archive],{encoding:'utf8'}).trim().split('\n').sort();assert.deepEqual(listing,['manifest.json','storage.mjs']);
 const dest=path.join(consumer,version);await fs.mkdir(dest);execFileSync('tar',['-xzf',archive,'-C',dest]);
 const manifest=JSON.parse(await fs.readFile(path.join(dest,'manifest.json'),'utf8'));assert.equal(manifest.version,version);
 assert.equal(createHash('sha256').update(await fs.readFile(path.join(dest,'storage.mjs'))).digest('hex'),manifest.source_sha256);
 clients[version]=(await import(pathToFileURL(path.join(dest,'storage.mjs')).href)).storage;
}
// Corruption is rejected by digest verification before any extraction/use.
const original=await fs.readFile(path.join(build,'v3.tgz'));const bad=Buffer.from(original);bad[10]^=1;
assert.notEqual(createHash('sha256').update(bad).digest('hex'),(await fs.readFile(path.join(build,'v3.tgz.sha256'),'utf8')).trim());
const pool=new pg.Pool({host:root,port:55472,user:'learning_lab',database:'postgres',max:4,connectionTimeoutMillis:1000,options:'-c statement_timeout=2000'});
let old;
try{
 await pool.query('CREATE TABLE release_people(id integer PRIMARY KEY,name text NOT NULL)');await pool.query("INSERT INTO release_people VALUES(1,'A')");
 await pool.query('CREATE ROLE old_writer');await pool.query('GRANT SELECT(id,name),UPDATE(name) ON release_people TO old_writer');
 old=await pool.connect();await old.query('SET ROLE old_writer');
 const v1=clients.v1('v1',(sql,args)=>old.query(sql,args));const current=Object.fromEntries(['v2','v3','v4'].map(v=>[v,clients[v](v,(sql,args)=>pool.query(sql,args))]));
 assert.equal(await v1.read(1),'A');await pool.query('ALTER TABLE release_people ADD COLUMN display_name text');
 await v1.write(1,'B');assert.equal(await current.v2.read(1),'B');assert.equal(await current.v3.read(1),null);
 await current.v2.write(1,'C');await v1.write(1,'D');assert.equal(await current.v3.read(1),'C');assert.equal(await current.v2.read(1),'D');
 // Block new old-only write statements, then reconcile. Production must also drain in-flight writers.
 await pool.query('REVOKE UPDATE(name) ON release_people FROM old_writer');await assert.rejects(v1.write(1,'forbidden'),e=>e.code==='42501');
 const stale=(await pool.query('SELECT name FROM release_people WHERE id=1')).rows[0].name;
 await current.v2.write(1,'E');const guarded=await pool.query('UPDATE release_people SET display_name=$2 WHERE id=$1 AND name=$2',[1,stale]);assert.equal(guarded.rowCount,0);
 await pool.query('UPDATE release_people SET display_name=name WHERE display_name IS DISTINCT FROM name');
 assert.equal(await current.v3.read(1),'E');await current.v3.write(1,'F');assert.equal(await current.v2.read(1),'F');
 await current.v4.write(1,'G');assert.equal(await current.v2.read(1),'F');assert.equal(await current.v4.read(1),'G');
 await pool.query('ALTER TABLE release_people DROP COLUMN name');await assert.rejects(v1.read(1),e=>e.code==='42703');await assert.rejects(current.v3.write(1,'bad'),e=>e.code==='42703');
 await current.v4.write(1,'H');assert.equal(await current.v4.read(1),'H');
 console.log('Four immutable tar artifacts verified/extracted/imported in separate job directories; real PostgreSQL expand/old-writer block/stale-backfill guard/dual-write rollback/V4 stale-reader boundary/contract checks passed.');
}finally{if(old)old.release();await pool.end();}
```

The private fixture initializes PostgreSQL with TCP disabled, an owned Unix socket directory and short connection/statement timeouts, then always stops it. Its trust-auth role is appropriate only inside that disposable private local directory; do not copy that authentication configuration to a shared database. The test imports the packaged artifacts and exercises actual SQL semantics rather than only mutate a JavaScript object.

The key findings are: an old-only writer makes the new shadow stale; V2 still reads the canonical name correctly. A privilege revocation rejects new old-role update statements before the final reconciliation, but a real rollout must also drain/block in-flight/background writers and prevent old identities from returning. A captured stale backfill value with a guarded WHERE changes zero rows after a newer write; current-state backfill then reconciles. During V3 dual writes, V2 rollback reads the correct value. Once V4-only writes begin, V2 becomes stale **before** the old column is dropped. After contract, V1 reads and V3 dual writes fail, while V4 continues.

This fixture models one field/row and a controlled interleaving; larger backfills need bounded resumable batches, current invariants and tested concurrency/version ownership. Role revocation is not a complete deployment orchestrator, and statement timeouts do not prove all lock/drain behavior under production load. A snapshot restore may lose later valid writes and needs an isolated recovery point/reconciliation drill. No down migration or traffic switch can undo arbitrary committed external effects.

## CI integration and learner acceptance

In a real workflow declare build→artifact-test→migration/staging→promotion dependencies explicitly and upload/download the named artifact. Each job owns its own required installation and environment; use protected approvals/least-privilege credentials for deployment, never expose privileged secrets to untrusted PR code. Configure concurrency/rollout ownership so two migrations do not run independently. Pin/review third-party workflow actions and their permissions according to the actual CI policy; this lesson supplies no untested platform YAML or claim of a running hosted pipeline.

**Practice acceptance:** reproduce artifact inspection/digest/corruption detection and the entire old/bridge/new database matrix. Add more rows and a concurrent writer plus failed/restarted bounded backfill; require no lost newer data and an explicit last compatible rollback artifact. Wire real isolated jobs that consume the same archive and prove missing dependencies/artifacts fail clearly. Show the migration state/health gate before promotion and a recovery decision after V4-only writes. Keep deployment credentials out of artifacts/logs. Learner hosted pipeline, production-style backfill and recovery exercise remain required.

**Validation performed2026-10-25:** four actual tar archives were created, fixed contents and source/archive digests verified, extracted into a separate job directory and imported. Corrupted archive bytes produced a different digest. Real PostgreSQL16 passed expand, stale shadow, old-role write denial, guarded stale update, reconciliation, dual-write rollback and V4/contract boundary cases. Connections/pool and the private cluster were closed. No full app/container, hosted CI, traffic rollout, live migration or backup restore was performed.

Official references: [workflow artifact sharing](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci), [PostgreSQL16 REVOKE](https://www.postgresql.org/docs/16/sql-revoke.html), [transaction isolation](https://www.postgresql.org/docs/16/transaction-iso.html). Documentation checked2026-10-25; fixture measurements establish only the local behavior described.
