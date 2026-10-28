import express from 'express';import{createHmac,createHash,timingSafeEqual}from'node:crypto';import{z}from'zod';
const Event=z.object({id:z.string().uuid(),kind:z.literal('catalogue.updated'),entity:z.string().uuid()}).strict();
export const schema=`CREATE TABLE webhook_inbox(source text NOT NULL,id uuid NOT NULL,digest text NOT NULL,PRIMARY KEY(source,id));CREATE TABLE webhook_effects(entity uuid PRIMARY KEY,updates integer NOT NULL DEFAULT 0);`;
export function signature(key,timestamp,bytes){return createHmac('sha256',key).update(timestamp+'.').update(bytes).digest('hex');}
export function webhookApp(pool,keys,clock=()=>Math.floor(Date.now()/1000)){
 // keys is a trusted deployment-owned Map; never discover a key from the request.
 for(const key of keys.values())if(!Buffer.isBuffer(key)||key.length<32)throw new Error('KEY_CONFIG');
 const app=express();
 app.post('/webhook',express.raw({type:'application/json',limit:'16kb',inflate:false}),async(req,res)=>{
  const one=name=>{let values=[];for(let i=0;i<req.rawHeaders.length;i+=2)if(req.rawHeaders[i].toLowerCase()===name)values.push(req.rawHeaders[i+1]);return values.length===1?values[0]:undefined;};
  const timestamp=one('x-hook-time'),sig=one('x-hook-signature'),kid=one('x-hook-key');
  const key=keys.get(kid);
  if(!Buffer.isBuffer(req.body)||!timestamp||!/^\d{10}$(?![\s\S])/.test(timestamp)||Math.abs(clock()-Number(timestamp))>300||!sig||!/^[a-f0-9]{64}$(?![\s\S])/.test(sig)||!key||!timingSafeEqual(Buffer.from(sig,'hex'),Buffer.from(signature(key,timestamp,req.body),'hex'))){res.sendStatus(401);return;}
  let event;try{event=Event.parse(JSON.parse(req.body.toString('utf8')));}catch{res.sendStatus(400);return;}
  const digest=createHash('sha256').update(req.body).digest('hex');const client=await pool.connect();
  try{
   await client.query('BEGIN');
   const inserted=await client.query("INSERT INTO webhook_inbox VALUES('catalogue-provider',$1,$2) ON CONFLICT DO NOTHING RETURNING id",[event.id,digest]);
   if(inserted.rowCount){await client.query('INSERT INTO webhook_effects(entity,updates) VALUES($1,1) ON CONFLICT(entity) DO UPDATE SET updates=webhook_effects.updates+1',[event.entity]);}
   else{const old=(await client.query("SELECT digest FROM webhook_inbox WHERE source='catalogue-provider' AND id=$1",[event.id])).rows[0];if(old.digest!==digest){await client.query('ROLLBACK');res.sendStatus(409);return;}}
   await client.query('COMMIT');res.sendStatus(204);
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
 });
 app.use((error,_req,res,_next)=>{res.status(error.type==='entity.too.large'?413:error.type==='encoding.unsupported'?415:503).json({error:'WEBHOOK_UNAVAILABLE'});});return app;
}
