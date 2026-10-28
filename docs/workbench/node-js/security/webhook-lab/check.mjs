if(!process.env.STUDY_DATABASE_URL)throw new Error('Use disposable STUDY_DATABASE_URL; recreates webhook study tables');
import assert from'node:assert/strict';import{randomBytes,randomUUID}from'node:crypto';import{once}from'node:events';import pg from'pg';import{schema,signature,webhookApp}from'./webhook.mjs';
const pool=new pg.Pool({connectionString:process.env.STUDY_DATABASE_URL,max:4,connectionTimeoutMillis:2000,statement_timeout:2000});const old=randomBytes(32),current=randomBytes(32),keys=new Map([['old',old],['current',current]]);const now=1793020000;let server;
try{
 await pool.query('DROP TABLE IF EXISTS webhook_inbox,webhook_effects');await pool.query(schema);
 server=webhookApp(pool,keys,()=>now).listen(0,'127.0.0.1');await once(server,'listening');const url=`http://127.0.0.1:${server.address().port}/webhook`;
 const event={id:randomUUID(),kind:'catalogue.updated',entity:randomUUID()},bytes=Buffer.from(JSON.stringify(event));
 async function send(body=bytes,time=String(now),kid='current',sig=signature(keys.get(kid)??current,time,body)){return fetch(url,{method:'POST',headers:{'content-type':'application/json','x-hook-time':time,'x-hook-key':kid,'x-hook-signature':sig},body});}
 assert.equal((await send()).status,204);assert.equal((await send()).status,204);assert.equal((await pool.query('SELECT updates FROM webhook_effects')).rows[0].updates,1);
 const race={...event,id:randomUUID()};assert.deepEqual(await Promise.all([send(Buffer.from(JSON.stringify(race))),send(Buffer.from(JSON.stringify(race))) ]).then(rs=>rs.map(r=>r.status)),[204,204]);assert.equal((await pool.query('SELECT updates FROM webhook_effects')).rows[0].updates,2);
 assert.equal((await send(Buffer.from(' '+bytes),String(now),'current',signature(current,String(now),bytes))).status,401);
 assert.equal((await send(bytes,String(now-301))).status,401);assert.equal((await send(bytes,String(now+301))).status,401);
 assert.equal((await send(bytes,String(now),'unknown')).status,401);assert.equal((await send(bytes,String(now),'old')).status,204);keys.delete('old');assert.equal((await send(bytes,String(now),'old')).status,401);
 assert.equal((await send(Buffer.from('{invalid'))).status,400);assert.equal((await send(Buffer.from(JSON.stringify({...event,entity:randomUUID()})))).status,409);
 console.log('webhook raw bytes/time skew/rotation/schema/durable duplicate/concurrency/conflict passed');
}finally{if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}await pool.end();}
