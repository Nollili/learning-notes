import assert from 'node:assert/strict';
import { dateNumber, scheduleErrors } from './forms/schedule';
import { wizardTransition, type Wizard } from './forms/wizard';
import { acceptConfirmed, projectPending } from './forms/note-projection';
import { resolveActiveItem } from './composition/composition-contracts';
import { saveNote } from './forms/note-api';
assert.equal(dateNumber('2024-02-29'),Date.UTC(2024,1,29));
for(const value of ['2023-02-29','2026-13-01','2026-01-32','01/02/2026','2026-1-01']) assert.equal(dateNumber(value),null);
assert.deepEqual(scheduleErrors('2026-01-02','2026-01-01'),{end:'End date must be on or after start'});
const base:Wizard={step:'details',values:{title:'Course',slug:'course',start:'2026-01-01',end:'2026-01-02'},dirty:true,submission:'idle',errors:{}};
const schedule=wizardTransition(base,{type:'next'}),review=wizardTransition(schedule,{type:'next'}),saving=wizardTransition(review,{type:'save'});
assert.equal(schedule.step,'schedule');assert.equal(review.step,'review');assert.equal(saving.submission,'saving');assert.equal(base.step,'details');
assert.equal(wizardTransition(saving,{type:'save'}),saving);assert.equal(wizardTransition(saving,{type:'failure'}).dirty,true);assert.equal(wizardTransition(saving,{type:'success'}).dirty,false);
const current={id:'a',title:'Confirmed',version:3};assert.equal(acceptConfirmed(current,{...current,version:2}),current);assert.throws(()=>acceptConfirmed(current,{...current,id:'b'}));
assert.equal(projectPending(current,[{title:'Old',version:2,sequence:100},{title:'New',version:3,sequence:2}]).title,'New');assert.equal(current.title,'Confirmed');
assert.throws(()=>resolveActiveItem([{id:'x',label:'X',panel:null},{id:'x',label:'Duplicate',panel:null}],'x'));
assert.equal(resolveActiveItem([{id:'a',label:'A',panel:null,disabled:true},{id:'b',label:'B',panel:null}],'a')?.id,'b');
const original=globalThis.fetch;const id='00000000-0000-4000-8000-000000000001';
try{
 for(const record of [{id:'00000000-0000-4000-8000-000000000002',title:'Wrong',version:2},{id,title:'Old',version:1}]){
  globalThis.fetch=async()=>Response.json(record);await assert.rejects(saveNote({id,title:'Valid',version:1}),/Unconfirmed/);
 }
 globalThis.fetch=async()=>Response.json({id,title:'Valid',version:2});assert.equal((await saveNote({id,title:'Valid',version:1})).version,2);
}finally{globalThis.fetch=original;}
console.log('Date validity, wizard transitions/duplicate guard, monotonic projection, tab identities and save-response identity/version passed; HTTP mocked.');
