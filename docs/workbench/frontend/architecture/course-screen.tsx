import {useCallback,useEffect,useRef,useState} from 'react';
import {z} from 'zod';
const ViewSchema=z.object({version:z.literal(1),q:z.string().max(100),sort:z.enum(['title-asc','title-desc','created-desc'])}).strict();
export type View=z.infer<typeof ViewSchema>;
const initial:View={version:1,q:'',sort:'created-desc'};
const PageSchema=z.object({snapshot:z.string().min(1).max(128),nextCursor:z.string().min(1).max(256).nullable(),
 rows:z.array(z.object({id:z.string().regex(/^[A-Za-z0-9_-]{1,80}$/),title:z.string().max(200)}).strict()).max(50)
}).strict().refine(p=>new Set(p.rows.map(r=>r.id)).size===p.rows.length);
type Page=z.infer<typeof PageSchema>;
export type Request={view:View;cursor:string|null;snapshot:string|null};
export type Api=(request:Request,signal:AbortSignal)=>Promise<unknown>;
export class SnapshotExpired extends Error {}
type Store=Pick<Storage,'getItem'|'setItem'>;
function viewKey(scope:string){if(!scope||scope.length>128)throw Error('Invalid view scope');return 'course-view:v1:'+encodeURIComponent(scope);}
export function writeView(store:Store,scope:string,value:unknown){store.setItem(viewKey(scope),JSON.stringify(ViewSchema.parse(value)));}
export function readView(store:Store,scope:string):View{
 const raw=store.getItem(viewKey(scope));if(raw===null)throw Error('No saved view');
 if(raw.length>2048)throw Error('Invalid view');return ViewSchema.parse(JSON.parse(raw));
}
export function CourseScreen(props:{scope:string;api:Api;store:Store}){return <Owner key={props.scope} {...props}/>;}
function Owner({scope,api,store}:{scope:string;api:Api;store:Store}){
 const [draft,setDraft]=useState<View>(initial),[result,setResult]=useState<{request:Request;page:Page}|null>(null);
 const [status,setStatus]=useState('Loading'),[pending,setPending]=useState(false),[selected,setSelected]=useState<Set<string>>(()=>new Set());
 const epoch=useRef(0),active=useRef<AbortController|null>(null),focusWanted=useRef(false),heading=useRef<HTMLHeadingElement>(null);
 const load=useCallback(async(request:Request,reset:boolean,focus:boolean)=>{
  const version=++epoch.current;active.current?.abort();const controller=new AbortController();active.current=controller;
  if(reset)setSelected(new Set());setResult(null);setPending(true);setStatus('Loading');focusWanted.current=focus;
  try{
   const raw=await api(request,controller.signal);
   if(version!==epoch.current)return;
   const page=PageSchema.parse(raw);
   if(request.snapshot!==null&&page.snapshot!==request.snapshot)throw new SnapshotExpired();
   setResult({request,page});setStatus(`${page.rows.length} rows loaded`);
  }catch(error){if(version===epoch.current){setStatus(error instanceof SnapshotExpired?'Results changed. Restart with these filters.':'Could not load results.');if(error instanceof SnapshotExpired)setSelected(new Set());}}
  finally{if(version===epoch.current){setPending(false);active.current=null;}}
 },[api]);
 useEffect(()=>{setDraft(initial);void load({view:initial,cursor:null,snapshot:null},true,false);
  return()=>{++epoch.current;active.current?.abort();};},[load]);
 useEffect(()=>{if(result&&focusWanted.current){heading.current?.focus();focusWanted.current=false;}},[result]);
 const apply=()=>{void load({view:{...draft,q:draft.q.trim()},cursor:null,snapshot:null},true,true);};
 return <section>
  <form onSubmit={e=>{e.preventDefault();apply();}}>
   <label>Filter<input maxLength={100} value={draft.q} onChange={e=>setDraft({...draft,q:e.currentTarget.value})}/></label>
   <label>Sort<select value={draft.sort} onChange={e=>setDraft({...draft,sort:ViewSchema.shape.sort.parse(e.currentTarget.value)})}>
    <option value="created-desc">Newest</option><option value="title-asc">Title A–Z</option><option value="title-desc">Title Z–A</option>
   </select></label><button>Apply filters</button>
  </form>
  <button onClick={()=>{try{writeView(store,scope,draft);setStatus('Filters saved on this device.');}catch{setStatus('Could not save filters.');}}}>Save filters on this device</button>
  <button onClick={()=>{try{const view=readView(store,scope);setDraft(view);void load({view,cursor:null,snapshot:null},true,true);}catch{setStatus('Could not restore filters.');}}}>Restore filters</button>
  <p>Saved filters include query text. No rows, selected IDs or cursors are saved.</p>
  <p role="status">{status}</p><p>{selected.size} selected on visited pages</p>
  <button onClick={()=>setSelected(new Set())}>Clear selection</button>
  <h2 tabIndex={-1} ref={heading}>Course results</h2>
  {result&&<table><caption>Current page for “{result.request.view.q}”; {result.request.view.sort}</caption>
   <thead><tr><th scope="col">Select</th><th scope="col">Title</th></tr></thead>
   <tbody>{result.page.rows.map(row=><tr key={row.id}>
    <td><input type="checkbox" aria-label={`Select ${row.title}`} checked={selected.has(row.id)} disabled={!selected.has(row.id)&&selected.size>=100}
     onChange={e=>{const checked=e.currentTarget.checked;setSelected(old=>{const next=new Set(old);if(checked&&next.size<100)next.add(row.id);else if(!checked)next.delete(row.id);return next;});}}/></td>
    <th scope="row">{row.title}</th></tr>)}</tbody></table>}
  <button disabled={pending||!result?.page.nextCursor} onClick={()=>{if(result?.page.nextCursor)void load({view:result.request.view,cursor:result.page.nextCursor,snapshot:result.page.snapshot},false,true);}}>Next page</button>
  <button onClick={apply}>Restart with these filters</button>
 </section>;
}
