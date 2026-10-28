// checks/retry-read.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retryRead} from '../build/retry-read.js';
test('zero retries means exactly one attempt',async()=>{
 let calls=0;const original=Error('transient');
 await assert.rejects(retryRead(async()=>{calls++;throw original},{maxRetries:0,retryable:()=>true}),e=>e===original);assert.equal(calls,1);
});
test('omitted limit permits two additional attempts',async()=>{
 let calls=0;const result=await retryRead(async()=>{if(++calls<3)throw Error('temporary');return 'ready'},{retryable:()=>true});assert.equal(result,'ready');assert.equal(calls,3);
});
test('hard cap terminates persistent failure',async()=>{
 let calls=0;await assert.rejects(retryRead(async()=>{calls++;throw Error('temporary')},{maxRetries:3,retryable:()=>true}));assert.equal(calls,4);
});
test('nonretryable and falsy original failures are preserved',async()=>{
 let calls=0;let caught=Symbol();try{await retryRead(async()=>{calls++;throw 0},{maxRetries:3,retryable:()=>false})}catch(e){caught=e}assert.equal(calls,1);assert.equal(caught,0);
});
test('invalid limits cause no read',async()=>{
 let calls=0;for(const maxRetries of [-1,4,1.5,NaN,Infinity,'2',true,null]){await assert.rejects(retryRead(async()=>{calls++;return 1},{maxRetries,retryable:()=>true}),RangeError)}assert.equal(calls,0);
});
test('preabort prevents work',async()=>{
 const c=new AbortController();const reason=Error('stop');c.abort(reason);let calls=0;await assert.rejects(retryRead(async()=>{calls++;return 1},{retryable:()=>true,signal:c.signal}),e=>e===reason);assert.equal(calls,0);
});
test('abort while read runs discards late result without retry',async()=>{
 const c=new AbortController();let release;const pending=new Promise(r=>{release=r});let calls=0;
 const result=retryRead(async()=>{calls++;await pending;return 'late'},{retryable:()=>true,signal:c.signal});c.abort('stop');release();let caught;try{await result}catch(e){caught=e}assert.equal(caught,'stop');assert.equal(calls,1);
});
