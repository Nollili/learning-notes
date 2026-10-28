import Busboy from 'busboy';
import express from 'express';
import {Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {randomUUID} from 'node:crypto';
export const schema = `CREATE TABLE multipart_notes(
 id uuid PRIMARY KEY, tenant text NOT NULL, subject text NOT NULL,
 body bytea NOT NULL CHECK(octet_length(body) BETWEEN 1 AND 8192),
 expires_at timestamptz NOT NULL);
 CREATE INDEX multipart_notes_expiry ON multipart_notes(expires_at);`;
export async function parseNote(input,headers){
 if(headers['content-encoding'] && headers['content-encoding']!=='identity') throw new Error('FORMAT');
 const parser=Busboy({headers,limits:{fileSize:8192,files:1,fields:0,parts:2}});
 let chunks=[],valid=true,count=0,total=0;
 parser.on('file',(name,file,info)=>{
  count++;
  if(name!=='note'||info.mimeType!=='text/plain'||info.encoding!=='7bit') valid=false;
  file.on('limit',()=>{valid=false;});
  file.on('data',chunk=>chunks.push(chunk));
 });
 for(const event of ['filesLimit','fieldsLimit','partsLimit']) parser.on(event,()=>{valid=false;});
 const cap=new Transform({transform(chunk,_encoding,done){total+=chunk.length;done(total>16384?new Error('LIMIT'):null,chunk);}});
 await pipeline(input,cap,parser,{signal:AbortSignal.timeout(5000)});
 const body=Buffer.concat(chunks);
 if(!valid||count!==1||body.length<1||body.length>8192) throw new Error('FORMAT');
 const text=new TextDecoder('utf-8',{fatal:true}).decode(body);
 if(!text.trim()||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) throw new Error('CONTENT');
 return body;
}
// guard must authenticate, check per-intent permission and cookie CSRF/Origin on writes.
export function multipartApp(sql,guard){
 const app=express();app.disable('x-powered-by');
 app.post('/notes',async(req,res)=>{
  const actor=await guard(req,'write');
  let body;
  try{body=await parseNote(req,req.headers);}catch{
   if(!res.destroyed)res.status(400).json({error:'INVALID_NOTE'});return;
  }
  const id=randomUUID();
  await sql.query(`INSERT INTO multipart_notes VALUES($1,$2,$3,$4,statement_timestamp()+interval '1 day')`,[id,actor.tenant,actor.subject,body]);
  res.status(201).json({id});
 });
 app.get('/notes/:id',async(req,res)=>{
  const actor=await guard(req,'read');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$(?![\s\S])/.test(req.params.id)){res.sendStatus(404);return;}
  const result=await sql.query(`SELECT body FROM multipart_notes WHERE id=$1 AND tenant=$2 AND subject=$3 AND expires_at>statement_timestamp()`,[req.params.id,actor.tenant,actor.subject]);
  if(!result.rows[0]){res.sendStatus(404);return;}
  res.set({'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="note.txt"','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}).send(result.rows[0].body);
 });
 app.use((error,_req,res,_next)=>{res.status(error.status===401||error.status===403?error.status:503).json({error:'NOTE_UNAVAILABLE'});});
 return app;
}
export async function sweepExpired(sql){
 return sql.query(`WITH expired AS(SELECT id FROM multipart_notes WHERE expires_at<=statement_timestamp() ORDER BY expires_at,id LIMIT 100 FOR UPDATE SKIP LOCKED) DELETE FROM multipart_notes n USING expired e WHERE n.id=e.id RETURNING n.id`);
}
