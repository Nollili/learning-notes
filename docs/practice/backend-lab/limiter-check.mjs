import assert from'node:assert/strict';import{mapWithConcurrency}from'./limiter.js';
let rejectFirst,finishSecond;let secondSignal;const started=[];let finished=false;
const task=mapWithConcurrency([0,1,2,3],2,(value,signal)=>{started.push(value);if(value===0)return new Promise((_,reject)=>{rejectFirst=reject;});secondSignal=signal;return new Promise(resolve=>{finishSecond=resolve;});});
const outcome=task.then(value=>({ok:true,value}),error=>({ok:false,error})).finally(()=>{finished=true;});
assert.deepEqual(started,[0,1]);rejectFirst(undefined);await new Promise(r=>setImmediate(r));assert.equal(secondSignal.aborted,true);assert.equal(finished,false);assert.deepEqual(started,[0,1]);finishSecond('done');assert.deepEqual(await outcome,{ok:false,error:undefined});assert.deepEqual(started,[0,1]);console.log('canonical limiter: failure stops assignment, aborts active work, drains before rejection and preserves undefined reason');
