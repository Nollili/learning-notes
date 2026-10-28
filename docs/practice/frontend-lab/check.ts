import assert from 'node:assert/strict';import{parseView,parsePage,description,type Load}from'./contracts.js';
assert.deepEqual(parseView('?q=%C3%A1rv%C3%ADz&sort=title-asc'),{q:'árvíz',sort:'title-asc',cursor:null});
for(const input of ['?sort=unknown','?q=a&q=b','?tenant=other','?cursor=','?q='+ 'x'.repeat(101)])assert.throws(()=>parseView(input));
const row={id:'00000000-0000-4000-8000-000000000001',title:'One'};
assert.equal(parsePage({rows:[row],nextCursor:null}).kind,'ready');
for(const input of [null,{rows:[row,row],nextCursor:null},{rows:[{...row,secret:'private'}],nextCursor:null},{rows:Array(51).fill(row),nextCursor:null}])assert.deepEqual(parsePage(input),{kind:'failed',code:'INVALID_DATA'});
assert.equal(description({kind:'failed',code:'NETWORK'}),'NETWORK');
// @ts-expect-error A ready state cannot contain an unvalidated value of the wrong type.
const wrong:Load<number>={kind:'ready',value:'text'};
void wrong;
console.log('URL duplicate/unknown/budget and unknown-JSON schema cases passed; negative type case checked by tsc');
