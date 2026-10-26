import fs from'node:fs';import http from'node:http';import{once}from'node:events';import assert from'node:assert/strict';import SwaggerParser from'@apidevtools/swagger-parser';import Ajv2020 from'ajv/dist/2020.js';import{document}from'./contract.mjs';import{createApp}from'./app.mjs';
await SwaggerParser.validate(structuredClone(document));
const ajv=new Ajv2020({strict:true});const page=ajv.compile(document.components.schemas.Page),error=ajv.compile(document.components.schemas.ApiError);
const generated=JSON.stringify(document,null,2)+'\n';const target=new URL('./catalogue.openapi.json',import.meta.url);
if(process.argv.includes('--write'))fs.writeFileSync(target,generated);else assert.equal(fs.readFileSync(target,'utf8'),generated,'Generated contract drift');
const authenticate=async req=>req.headers.authorization==='Bearer fixture-a'?{subject:'alice',tenant:'a',scopes:['catalogue:read']}:req.headers.authorization==='Bearer fixture-no-scope'?{subject:'alice',tenant:'a',scopes:[]}:null;
async function withServer(app,work){const server=http.createServer(app);try{server.listen(0,'127.0.0.1');await once(server,'listening');await work('http://127.0.0.1:'+server.address().port)}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}}
let captured;
await withServer(createApp(authenticate),async base=>{
 for(const [path,token,status]of[['/courses',null,401],['/courses','fixture-no-scope',403],['/courses?limit=1','fixture-a',200],['/courses?limit=1&after=c1','fixture-a',200],['/courses?limit=21','fixture-a',400],['/courses?limit=1&limit=2','fixture-a',400],['/courses?tenant=b','fixture-a',400],['/courses?after=b1','fixture-a',400],['/courses?limit=2%0A','fixture-a',400]]){
  const response=await fetch(base+path,{headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.timeout(2000)});assert.equal(response.status,status);assert.equal(response.headers.get('cache-control'),'private, no-store');if(status===401)assert.match(response.headers.get('www-authenticate'),/^Bearer/);const body=await response.json();assert((status===200?page:error)(body),JSON.stringify(body));assert(!JSON.stringify(body).includes('internal'));if(status===200&&path==='/courses?limit=1')captured=body;
 }
});
await withServer(createApp(authenticate,async()=>{throw Error('SYNTHETIC-PRIVATE')}),async base=>{const response=await fetch(base+'/courses',{headers:{Authorization:'Bearer fixture-a'},signal:AbortSignal.timeout(2000)});assert.equal(response.status,500);const body=await response.json();assert(error(body));assert(!JSON.stringify(body).includes('SYNTHETIC-PRIVATE'))});
const drift=structuredClone(document.components.schemas.Page);drift.properties.items.items.required.push('priceCents');assert.equal(new Ajv2020({strict:false}).compile(drift)(captured),false);
assert.equal(page({items:[{id:'c1',title:'One',internal:'leak'}],nextCursor:null}),false);
console.log('OpenAPI3.1.2 specification/generation drift + real Express response/auth/scope/query/page/error validation and deliberate contract/extra-field drift checks pass.');

assert.equal(page({items:[{id:'c1\n',title:'One'}],nextCursor:null}),false);
