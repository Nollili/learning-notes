if(!process.env.STUDY_DATABASE_URL)throw new Error('Use a disposable STUDY_DATABASE_URL; this check recreates its study tables');
import assert from 'node:assert/strict';import {Readable} from 'node:stream';import pg from 'pg';import {once} from 'node:events';import {schema,parseNote,multipartApp,sweepExpired} from './multipart.mjs';
const headers={'content-type':'multipart/form-data; boundary=study'};
function multipart(bytes,name='note'){return Buffer.concat([Buffer.from(`--study\r\nContent-Disposition: form-data; name="${name}"; filename="../../private.txt"\r\nContent-Type: text/plain\r\n\r\n`),bytes,Buffer.from('\r\n--study--\r\n')]);}
assert.equal((await parseNote(Readable.from(multipart(Buffer.from('hello notes π'))),headers)).toString(),'hello notes π');
for(const bytes of [Buffer.alloc(8193,65),Buffer.from([0xff]),Buffer.from(' \n'),Buffer.from([0])])await assert.rejects(parseNote(Readable.from(multipart(bytes)),headers));
await assert.rejects(parseNote(Readable.from(multipart(Buffer.from('ok'),'wrong')),headers));
await assert.rejects(parseNote(Readable.from(Buffer.from('--broken')),headers));
const twoParts=Buffer.from(multipart(Buffer.from('ok')).toString().replace('--study--\r\n','--study\r\nContent-Disposition: form-data; name=\"extra\"\r\n\r\nx\r\n--study--\r\n'));
await assert.rejects(parseNote(Readable.from(twoParts),headers));
await assert.rejects(parseNote(Readable.from(multipart(Buffer.from('ok'))),{...headers,'content-encoding':'gzip'}));
const pool=new pg.Pool({connectionString:process.env.STUDY_DATABASE_URL,statement_timeout:2000,max:3});
let server;
try{
 await pool.query('DROP TABLE IF EXISTS multipart_notes');await pool.query(schema);
 const app=multipartApp(pool,async(req)=>{const who=req.get('x-study-actor');if(!['a','b'].includes(who))throw Object.assign(new Error('denied'),{status:401});return{tenant:'t',subject:who};});
 server=app.listen(0,'127.0.0.1');await once(server,'listening');const url=`http://127.0.0.1:${server.address().port}`;
 const send=await fetch(url+'/notes',{method:'POST',headers:{...headers,'x-study-actor':'a'},body:multipart(Buffer.from('<b>inert text</b>'))});assert.equal(send.status,201);const{id}=await send.json();
 const owner=await fetch(url+'/notes/'+id,{headers:{'x-study-actor':'a'}});assert.equal(owner.status,200);assert.equal(await owner.text(),'<b>inert text</b>');assert.equal(owner.headers.get('x-content-type-options'),'nosniff');
 assert.equal((await fetch(url+'/notes/'+id,{headers:{'x-study-actor':'b'}})).status,404);
 assert.equal((await fetch(url+'/notes/'+id)).status,401);
 await pool.query("UPDATE multipart_notes SET expires_at=statement_timestamp()-interval '1 second'");assert.equal((await fetch(url+'/notes/'+id,{headers:{'x-study-actor':'a'}})).status,404);
 assert.equal((await sweepExpired(pool)).rowCount,1);assert.equal((await sweepExpired(pool)).rowCount,0);
 console.log('multipart parser negatives, real HTTP/PG ownership/expiry/cleanup passed');
}finally{if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}await pool.end();}
