import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createFixture,fixtureToken} from './service.mjs';
const transform=new Function('$input',readFileSync(new URL('./normalize-code.js',import.meta.url),'utf8'));
const event={event_id:'evt_1',source_id:'public',revision:1,action:'refresh'};
assert.deepEqual(transform({all:()=>[]}),[]);
const output=transform({all:()=>[{json:{body:event}},{json:{body:{...event,tenant:'forged'}}}]});
assert.equal(output[0].json.accepted,true);assert.equal(output[1].json.accepted,false);
assert.deepEqual(output.map(x=>x.pairedItem.item),[0,1]);
for(const body of [null,[],{}, {...event,revision:true},{...event,action:'delete'},{...event,event_id:'bad\n'}])
 assert.equal(transform({all:()=>[{json:{body}}]})[0].json.accepted,false);
assert.throws(()=>transform({all:()=>Array(21).fill({json:{body:event}})}));
const fixture=createFixture({failFirst:true});
await new Promise(resolve=>fixture.server.listen(0,'127.0.0.1',resolve));
const address=fixture.server.address();
const url=`http://127.0.0.1:${address.port}/refresh`;
const post=(body,token=fixtureToken)=>fetch(url,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify(body)});
try {
 assert.equal((await post(event,'wrong')).status,401);
 assert.equal((await post({...event,tenant:'forged'})).status,400);
 assert.equal((await post({...event,source_id:'private'})).status,403);
 assert.equal((await post({...event,revision:2})).status,403);
 assert.equal((await post(event)).status,503);assert.equal(fixture.effects,0);
 const first=await (await post(event)).json();
 assert.deepEqual(await (await post(event)).json(),first);assert.equal(fixture.effects,1);
 assert.equal((await post({padding:'x'.repeat(2049)})).status,413);
 assert.equal((await post({...event,source_id:'public_copy'})).status,409);assert.equal(fixture.effects,1);
 // Unsupported actions still fail before the receipt boundary.
 assert.equal((await post({...event,action:'delete'})).status,400);
 console.log('n8n transform and owned HTTP adapter checks passed; n8n engine/import/credential delivery were NOT exercised.');
} finally {
 await new Promise(resolve=>{fixture.server.close(resolve);fixture.server.closeAllConnections();});
}
