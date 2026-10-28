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
