# REST contracts: OpenAPI, runtime schemas and drift checks

Keep the primary Express/TypeScript/PostgreSQL route. This focused JavaScript fixture makes one HTTP contract executable before adding real persistence. OpenAPI describes paths, parameters, responses and security schemes; it does not install an authenticator or prove that a server obeys its description. Swagger UI is a documentation/interface tool, not the contract itself.

Versions checked2026-10-25: Node24.18.0; express5.3.0, zod4.6.7, ajv8.20.0, @apidevtools/swagger-parser13.1.0. The document intentionally targets **OpenAPI3.1.2** and JSON Schema2020-12 for the tested validator compatibility; it does not claim3.1.2 is the newest OpenAPI revision. [The official3.1.2 specification](https://spec.openapis.org/oas/v3.1.2.html) defines this dialect.

## Endpoint and boundary

`GET /courses?limit=1&after=c1` returns only the established principal's course IDs/titles and a next cursor. Page size is1–20, default10. Unknown/duplicate query keys, noncanonical limits, invalid/foreign cursors and overlong IDs reject. The in-memory fixture's raw ID cursor is not a signed production cursor; apply [the scoped cursor lesson](../../../node-js/cursor-pagination.md) to the database adapter and define live-feed versus snapshot semantics.

The auth adapter is injected and defaults to denial. The check supplies **public synthetic tokens** mapped to trusted subjects/tenants/scopes; it does not implement JWT/OAuth verification. Scope denial is separate from missing identity. Never replace that adapter with a Bearer-prefix check or accept tenant identity from a query/body. Private responses use `private, no-store`;401 includes a Bearer challenge. A real service still needs its verifier, ingress/resource bounds, database authorization, cancellation and operational lifecycle.

## Generate from the runtime contract

`contract.mjs` defines strict public response/error schemas in Zod and generates their JSON Schema forms. OpenAPI path/security/parameter metadata remains explicit. Runtime normalization/business permission cannot be inferred solely from JSON Schema. Avoid unsupported transforms/custom validators silently degrading to “any”; inspect generated output and check behaviors as well as shapes. The ID pattern also prevents a final newline being accepted at JavaScript's permissive `$` boundary.

```js
import {z} from 'zod';
export const Id = z.string().min(1).max(40).regex(/^[a-z0-9-]+$(?![\s\S])/);
export const Page = z.object({items:z.array(z.object({id:Id,title:z.string().min(1).max(100)}).strict()).max(20),nextCursor:Id.nullable()}).strict();
export const ApiError = z.object({error:z.object({code:z.enum(['BAD_QUERY','NOT_AUTHENTICATED','FORBIDDEN','INTERNAL_ERROR','NOT_FOUND']),message:z.string().max(120)}).strict()}).strict();
const jsonSchema = schema => {const {$schema,...value}=z.toJSONSchema(schema,{target:'draft-2020-12'});return value};
export const document = {
 openapi:'3.1.2',info:{title:'Owned catalogue fixture',version:'1.0.0'},
 jsonSchemaDialect:'https://json-schema.org/draft/2020-12/schema',
 servers:[{url:'http://127.0.0.1:3000'}],
 paths:{'/courses':{get:{operationId:'listCourses',summary:'Read the current principal’s courses',
  security:[{bearerAuth:[]}], 'x-required-scopes':['catalogue:read'],
  parameters:[{in:'query',name:'limit',schema:{type:'integer',minimum:1,maximum:20,default:10}},
   {in:'query',name:'after',schema:jsonSchema(Id)}],
  responses:Object.fromEntries([['200','Course page','Page'],['400','Invalid query','ApiError'],['401','Missing or invalid identity','ApiError'],['403','Permission denied','ApiError'],['500','Unexpected failure','ApiError']].map(([status,description,schema])=>[status,{description,content:{'application/json':{schema:{$ref:`#/components/schemas/${schema}`}}}}]))
 }}},
 components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer'}},schemas:{Page:jsonSchema(Page),ApiError:jsonSchema(ApiError)}}
};
```

The generated document is retained as `docs/workbench/node-js/backend/contract-lab/catalogue.openapi.json`:

<<< ./contract-lab/catalogue.openapi.json

A bearer security scheme says how a client presents a credential; it does not verify its issuer/lifetime/audience. `x-required-scopes` is application metadata here, not a rule automatically enforced by an OpenAPI viewer. The server below performs the scope check. Declare intended401/403/400/500 behavior and keep machine codes stable; errors carry no raw parser/config/database detail.

## Minimal executable adapter

```js
import express from 'express';
import {Page,Id} from './contract.mjs';
const fixtureRows=[{id:'c1',tenant:'a',title:'One',internal:'not-public'},{id:'c2',tenant:'a',title:'Two',internal:'not-public'},{id:'b1',tenant:'b',title:'Other private',internal:'not-public'}];
const sendError=(res,status,code,message)=>res.status(status).json({error:{code,message}});
export function createApp(authenticate=async()=>null,loadRows=async()=>fixtureRows){
 const app=express();app.disable('x-powered-by');app.use((_req,res,next)=>{res.set('Cache-Control','private, no-store');next()});
 app.get('/courses',async(req,res)=>{
  const viewer=await authenticate(req); // Trusted verifier adapter; never a tenant from query JSON.
  if(!viewer){res.set('WWW-Authenticate','Bearer realm="catalogue"');sendError(res,401,'NOT_AUTHENTICATED','Authentication required');return}
  if(!viewer.scopes.includes('catalogue:read')){sendError(res,403,'FORBIDDEN','Permission denied');return}
  const query=new URL(req.originalUrl,'http://owned.invalid').searchParams;
  const raw=query.get('limit')??'10',after=query.get('after');
  if([...query.keys()].some(key=>key!=='limit'&&key!=='after')||query.getAll('limit').length>1||query.getAll('after').length>1||
    raw.trim()!==raw||!/^[1-9][0-9]?$/.test(raw)||Number(raw)>20||
    (after!==null&&(after.trim()!==after||!Id.safeParse(after).success))){sendError(res,400,'BAD_QUERY','Invalid query');return}
  const rows=(await loadRows(viewer)).filter(row=>row.tenant===viewer.tenant).sort((a,b)=>a.id.localeCompare(b.id,'en'));
  const index=after===null?-1:rows.findIndex(row=>row.id===after);
  if(after!==null&&index<0){sendError(res,400,'BAD_QUERY','Invalid query');return}
  const limit=Number(raw),page=rows.slice(index+1,index+1+limit);
  const response=Page.parse({items:page.map(({id,title})=>({id,title})),nextCursor:rows.length>index+1+limit?page.at(-1).id:null});
  res.json(response);
 });
 app.use((_req,res)=>sendError(res,404,'NOT_FOUND','Route not found'));
 app.use((_error,_req,res,next)=>{if(res.headersSent){next(_error);return}sendError(res,500,'INTERNAL_ERROR','Unexpected failure')});
 return app;
}
```

The array repository is deliberately small synthetic storage, not the PostgreSQL implementation. Scope is applied before cursor lookup/slicing. Public fields are projected explicitly and validated before serialization; a later internal storage field is not automatically exposed. Output-validation failure is an internal500, not blame assigned to the client. The real repository should filter authorization in SQL before pagination and enforce its own deadlines/invariants.

## Check specification, actual behavior and drift

```js
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
```

Copy the repository folder `docs/workbench/node-js/backend/contract-lab/` into an owned scratch directory with an explicit ESM package/lockfile and the exact dependencies listed above. Initially generate the reviewed JSON with `node check.mjs --write`; inspect the resulting contract change. Normal checks/CI run **`node check.mjs` without --write**, so stale generated artifacts fail instead of being silently overwritten. Keep Autocode's existing build/Jest configuration and restricted test directory intact; adapt these acceptance cases into the approved test mechanism.

**Actual observed:** specification validation passes; generated-file equality passes; real loopback Express responses satisfy the declared success/error schemas, permission/query/cursor/status expectations, cache policy and Bearer challenge. Deliberately adding a required contract field rejects the captured response; adding an internal field or newline ID fails public-schema validation. An injected dependency exception returns a safe500. Owned HTTP servers close after the checks. This is a real local contract/API test, not token-issuer, PostgreSQL or deployed-client evidence.

Generation from shared schemas reduces drift but does not prove backward compatibility: old clients can depend on meaning, nullability, codes, ordering and normalization. A regenerated contract and server can change together while breaking those clients. Review the semantic diff, retain representative older-client/consumer checks and version a breaking operation. Do not loosen `additionalProperties` or optionality merely to make a drift test green.

## Practice acceptance

[Exercises and learner checklist](../../../practice/node-js/rest-contract-workbench.md).
