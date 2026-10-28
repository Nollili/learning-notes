import amqp from 'amqplib';
import {z} from 'zod';
const Job=z.object({id:z.string().uuid(),kind:z.literal('catalogue.refresh'),tenant:z.string().min(1).max(64)}).strict();
export async function connect(url,prefix){
 if(!/^[a-z0-9-]{1,60}$(?![\s\S])/.test(prefix))throw new Error('QUEUE_CONFIG');
 const connection=await amqp.connect(url,{timeout:5000});
 connection.on('error',()=>{}); // Owner observes operations/close; never log connection credentials.
 let publisher;
 try {
 publisher=await connection.createConfirmChannel();publisher.on('error',()=>{});
 const main=prefix, retry=prefix+'-retry',dead=prefix+'-dead';
 await publisher.assertQueue(main,{durable:true});
 await publisher.assertQueue(dead,{durable:true});
 await publisher.assertQueue(retry,{durable:true,arguments:{'x-message-ttl':200,'x-dead-letter-exchange':'','x-dead-letter-routing-key':main}});
 } catch(error) {
  if(publisher)await publisher.close().catch(()=>{});
  await connection.close().catch(()=>{});
  throw error;
 }
 const main=prefix, retry=prefix+'-retry',dead=prefix+'-dead';
 async function publish(queue,body,attempt=0){
  const bytes=Buffer.from(JSON.stringify(body));if(bytes.length>8192)throw new Error('MESSAGE_SIZE');
  await new Promise((resolve,reject)=>{
   let timer;
   const finish=error=>{clearTimeout(timer);publisher.off('return',returned);error?reject(error):resolve();};
   const returned=()=>finish(new Error('UNROUTABLE'));
   publisher.once('return',returned);
   timer=setTimeout(()=>{publisher.close().catch(()=>{});finish(new Error('CONFIRM_TIMEOUT'));},5000);
   try {publisher.sendToQueue(queue,bytes,{persistent:true,mandatory:true,messageId:body.id,headers:{attempt}},finish);}
   catch(error){finish(error);}
  });
 }
 // Single publisher owner: serialize publish/relay calls; do not concurrently use this channel.
 async function worker(effect){
  const consumer=await connection.createChannel();consumer.on('error',()=>{});
  try {
  await consumer.prefetch(1);
  const active=new Set();let failure;
  async function handle(message){
   let body;
   try{if(message.content.length>8192)throw new Error('MESSAGE_SIZE');body=Job.parse(JSON.parse(message.content.toString('utf8')));}catch{
    await publish(dead,{id:message.properties.messageId??'invalid',reason:'INVALID_SCHEMA'});consumer.ack(message);return;
   }
   const attempt=message.properties.headers?.attempt??0;
   if(!Number.isInteger(attempt)||attempt<0||attempt>2){await publish(dead,{id:body.id,reason:'INVALID_ATTEMPT'});consumer.ack(message);return;}
   try{await effect(body);}catch(error){
    if(error?.permanent===true||attempt===2)await publish(dead,{id:body.id,reason:'JOB_FAILED'});
    else await publish(retry,body,attempt+1);
   }
   consumer.ack(message); // Effect committed, or replacement confirmed before removing original.
  }
  const{consumerTag}=await consumer.consume(main,message=>{
   if(!message)return;
   const task=handle(message).catch(error=>{failure=error;return consumer.close().catch(()=>{});}).finally(()=>active.delete(task));active.add(task);
  },{noAck:false});
  return{async stop(){
   try{await consumer.cancel(consumerTag);}catch{ /* channel may already have failed */ }
   let timer;
   try{await Promise.race([Promise.all([...active]),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('DRAIN_TIMEOUT')),5000);})]);}
   finally{clearTimeout(timer);await consumer.close().catch(()=>{});}
   if(failure)throw failure;
  }};
  } catch(error){await consumer.close().catch(()=>{});throw error;}
 }
 return{main,retry,dead,publisher,connection,publish:body=>publish(main,Job.parse(body)),worker,
  async close(){await publisher.close().catch(()=>{});await connection.close();}};
}
export async function applyOnce(pool,job){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const inserted=await client.query('INSERT INTO job_receipts(id) VALUES($1) ON CONFLICT DO NOTHING RETURNING id',[job.id]);
  if(inserted.rowCount)await client.query('INSERT INTO job_effects(id,tenant) VALUES($1,$2)',[job.id,job.tenant]);
  await client.query('COMMIT');
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
export async function relayOne(pool,publish){
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const row=(await client.query('SELECT id,payload FROM job_outbox WHERE published_at IS NULL ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED')).rows[0];
  if(row){await publish(row.payload);await client.query('UPDATE job_outbox SET published_at=statement_timestamp() WHERE id=$1',[row.id]);}
  await client.query('COMMIT');return !!row;
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
