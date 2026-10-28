if(!process.env.STUDY_AMQP_URL)throw new Error('Use an isolated STUDY_AMQP_URL');
if(!process.env.STUDY_DATABASE_URL)throw new Error('Use a disposable STUDY_DATABASE_URL; this check recreates its study tables');
import assert from 'node:assert/strict';import {randomUUID}from'node:crypto';import{setTimeout as pause}from'node:timers/promises';import pg from'pg';import{connect,applyOnce,relayOne}from'./rabbit.mjs';import{tick,scheduleSchema}from'./schedule.mjs';
const pool=new pg.Pool({connectionString:process.env.STUDY_DATABASE_URL,statement_timeout:2000,max:4});
let broker,worker;
async function until(test){const end=Date.now()+6000;while(Date.now()<end){if(await test())return;await pause(25);}throw new Error('CHECK_DEADLINE');}
try{
 await pool.query('DROP TABLE IF EXISTS job_receipts,job_effects,job_outbox,study_schedules,study_runs');
 await pool.query('CREATE TABLE job_receipts(id uuid PRIMARY KEY);CREATE TABLE job_effects(id uuid PRIMARY KEY,tenant text NOT NULL);CREATE TABLE job_outbox(id uuid PRIMARY KEY,payload jsonb NOT NULL,published_at timestamptz)');await pool.query(scheduleSchema);
 await pool.query("INSERT INTO study_schedules(name,next_run) VALUES('hourly',statement_timestamp()-interval '1 minute')");
 const first=tick(pool,async client=>{await client.query('SELECT pg_sleep(0.15)');});await pause(30);assert.equal(await tick(pool,async()=>{throw new Error('overlap');}),false);assert.equal(await first,true);
 assert.equal(await tick(pool,async()=>{}),false);
 await pool.query("UPDATE study_schedules SET next_run=statement_timestamp()-interval '1 minute'");
 await assert.rejects(tick(pool,async()=>{throw new Error('failed batch');}));assert.equal((await pool.query('SELECT count(*)::int n FROM study_runs')).rows[0].n,1);assert.equal(await tick(pool,async()=>{}),true);
 broker=await connect(process.env.STUDY_AMQP_URL,'study-'+randomUUID());
 const success={id:randomUUID(),kind:'catalogue.refresh',tenant:'t'},retry={...success,id:randomUUID()},poison={...success,id:randomUUID()};const attempts=new Map();
 worker=await broker.worker(async job=>{const n=(attempts.get(job.id)??0)+1;attempts.set(job.id,n);if(job.id===retry.id&&n<3)throw n===1?null:new Error('temporary');if(job.id===poison.id)throw new Error('poison');await applyOnce(pool,job);});
 await pool.query('INSERT INTO job_outbox(id,payload) VALUES($1,$2)',[success.id,success]);assert.equal(await relayOne(pool,broker.publish),true);assert.equal(await relayOne(pool,broker.publish),false);
 await broker.publish(success);await broker.publish(retry);await broker.publish(poison);
 await until(async()=> (await pool.query('SELECT count(*)::int n FROM job_effects')).rows[0].n===2);
 let dead;await until(async()=>{dead=await broker.publisher.get(broker.dead,{noAck:true});return !!dead;});assert.equal(JSON.parse(dead.content).id,poison.id);assert.equal(attempts.get(retry.id),3);assert.equal(attempts.get(poison.id),3);
 await worker.stop();worker=undefined;
 const redeliver={...success,id:randomUUID()};await broker.publish(redeliver);const ch=await broker.connection.createChannel();const unacked=await ch.get(broker.main,{noAck:false});assert.equal(JSON.parse(unacked.content).id,redeliver.id);await ch.close();
 let replay;await until(async()=>{replay=await broker.publisher.get(broker.main,{noAck:false});return !!replay;});assert.equal(replay.fields.redelivered,true);broker.publisher.ack(replay);
 let started;const began=new Promise(r=>started=r);worker=await broker.worker(async job=>{started();await pause(100);await applyOnce(pool,job);});const drainJob={...success,id:randomUUID()};await broker.publish(drainJob);await began;const before=Date.now();await worker.stop();worker=undefined;assert.ok(Date.now()-before>=70);assert.equal((await pool.query('SELECT count(*)::int n FROM job_effects WHERE id=$1',[drainJob.id])).rows[0].n,1);
 console.log('real RabbitMQ confirms/outbox/duplicate DB effect/retry3/DLQ/redelivery/shutdown; PostgreSQL schedule overlap/rollback/checkpoint passed');
}finally{if(worker)await worker.stop();if(broker){for(const q of[broker.main,broker.retry,broker.dead])await broker.publisher.deleteQueue(q);await broker.close();}await pool.end();}
