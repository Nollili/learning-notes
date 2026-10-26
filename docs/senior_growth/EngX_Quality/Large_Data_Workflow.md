# Large-data UI: a bounded, testable workflow

This worked client-side slice complements [the architecture comparison](./Could_you_suggest_architectural_approaches_for_showing_thousands_of_data_sets_on_UI.md). It uses React 19.3, TypeScript 5.9 and Zod 4.6; the primary choice is a native table with server pagination. Virtualization remains an alternative for measured scrolling needs, not a substitute for bounded transfer or database queries.

## Decision record: one page and explicit view persistence

**Context:** a course catalogue may contain millions of rows. Users filter, select records on visited pages and return to a saved filter. Requests can finish out of order, identities change, and the underlying catalogue changes during browsing.

**Decision:** retain at most one page of 50 rows and 100 selected IDs. Apply filters explicitly; keep draft filters separate from the accepted result. Use stable row IDs, server-issued cursor/snapshot tokens and an epoch guard as well as cancellation. Persist one versioned filter/sort view per account/tenant scope only after an explicit action. Do not persist rows, cursors or selected IDs. A scope change remounts the owner and discards in-memory state.

**Alternatives:** infinite scroll needs a retention/eviction and focus policy; virtualization reduces DOM cost but not server work, transfer size or client filtering. Offset pagination can support page numbers but large offsets cost work and concurrent writes can move boundaries. Keyset pagination needs a unique ordering and has no cheap arbitrary-page jump. A cache library can provide request deduplication and cache lifetime; this small example makes ownership visible instead of adding a second application architecture.

**Consequences:** forward navigation is deliberately simple; Previous/history, editing drafts and bulk mutation are outside this slice. Selection means explicit IDs from visited pages, not “all matching results.” A backend must reauthorize selected IDs at action time. On a new query, scope or expired snapshot, selection is cleared; a user-requested accepted page moves focus to the result heading, while initial mount does not steal focus.

## API and security contract

`Api` receives a typed view, an opaque cursor, an optional snapshot and an AbortSignal; it returns unknown JSON. Its real HTTP adapter must bound bytes before parsing, enforce a deadline, reject non-success status and map a documented snapshot-expired response to `SnapshotExpired`. The 50-row schema limits accepted data, not bytes already downloaded. Keep the `api` function identity stable; replacing it intentionally restarts the initial query.

The server validates filters and sort, authorizes the current tenant, caps page size and binds cursors to tenant, filters, sort and snapshot. Use parameterized SQL and an allowlisted sort mapping, with an ID tie-breaker. A signed cursor prevents tampering; it does not grant permission. A snapshot token only gives consistency if the server implements that promise (for example a bounded materialized ID list with TTL). Merely echoing a token or filtering by creation time does not freeze edits/deletes. Never hold a database transaction open indefinitely for a browser session. On expiry, reject the cursor and offer a fresh first page. Cross-page duplicate IDs or inconsistent ordering remain server-contract failures; this component rejects duplicates within a page and mismatched snapshots.

Storage partitioning is organization, not access control: all same-origin scripts can read localStorage. Filters can contain sensitive search terms. Use this device-persistence option only for non-sensitive views permitted by product policy, explain shared-device risks, clear scoped data on logout/account removal and offer deletion in the integrated app. A memory-only store is an appropriate alternative. No credentials belong in the view. Invalid versions, oversized stored text, blocked storage and malformed responses produce fixed recovery messages.

## Complete component

Put this in `course-screen.tsx` in an owned React/TypeScript project with `react`, `react-dom`, `zod` and their TypeScript types. Inject the HTTP adapter and a scoped storage policy from the application boundary. The worked tests below use controlled deferred responses, not a live backend.

```tsx
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
```

## Behavior checks

Local verification on 2026-10-25: strict compilation with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`; Vitest 5.0.5, Testing Library 16.3.3 and JSDOM 30.1.3: six tests passed. These cover cancellation ownership despite a non-cooperative adapter, first-page restoration, scope replacement, safe failures and pagination focus. DOM focus in JSDOM is not evidence of native screen-reader announcements, browser layout or actual paint time.

```tsx
import React,{StrictMode} from 'react';import {afterEach,it,expect,vi} from 'vitest';import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import {CourseScreen,readView,writeView,type Api,type Request} from './course-screen.js';
afterEach(()=>{cleanup();localStorage.clear()});
const page=(id='a',next:string|null=null,snapshot='s1')=>({rows:[{id,title:id.toUpperCase()}],nextCursor:next,snapshot});
const change=(q:string)=>{fireEvent.change(screen.getByLabelText('Filter'),{target:{value:q}});fireEvent.click(screen.getByRole('button',{name:'Apply filters'}));};
it('paginates one native page, preserves ID selection and focuses user-requested results',async()=>{
 const requests:Request[]=[];const api:Api=async r=>{requests.push(r);return r.cursor?page('b'):page('a','next')};
 render(<StrictMode><CourseScreen scope="alice" api={api} store={localStorage}/></StrictMode>);
 fireEvent.click(await screen.findByRole('checkbox',{name:'Select A'}));fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 await screen.findByRole('checkbox',{name:'Select B'});expect(screen.queryByText('A')).toBeNull();expect(screen.getByText('1 selected on visited pages')).toBeTruthy();
 expect(requests.at(-1)?.snapshot).toBe('s1');await waitFor(()=>expect(document.activeElement).toBe(screen.getByRole('heading',{name:'Course results'})));
 change('new');await screen.findByRole('checkbox',{name:'Select A'});expect(requests.at(-1)?.cursor).toBeNull();expect(screen.getByText('0 selected on visited pages')).toBeTruthy();
});
it('rejects stale completion even when API ignores abort',async()=>{
 let resolveOld!:(x:unknown)=>void;let oldSignal!:AbortSignal;
 const api:Api=async(r,s)=>r.view.q==='old'?(oldSignal=s,await new Promise(resolve=>{resolveOld=resolve})):page(r.view.q||'initial');
 render(<CourseScreen scope="alice" api={api} store={localStorage}/>);await screen.findByText('INITIAL');change('old');change('new');await screen.findByText('NEW');
 resolveOld(page('stale'));await new Promise(r=>setTimeout(r,0));expect(oldSignal.aborted).toBe(true);expect(screen.queryByText('STALE')).toBeNull();expect(screen.getByText('NEW')).toBeTruthy();
});
it('saves only intent, restores first page, rejects another user/future/oversized view',async()=>{
 const calls:Request[]=[];const api:Api=async r=>{calls.push(r);return page()};render(<CourseScreen scope="alice" api={api} store={localStorage}/>);await screen.findByText('A');
 fireEvent.change(screen.getByLabelText('Filter'),{target:{value:'árvíz & course'}});fireEvent.click(screen.getByRole('button',{name:'Save filters on this device'}));
 expect(readView(localStorage,'alice').q).toBe('árvíz & course');expect(()=>readView(localStorage,'bob')).toThrow();
 fireEvent.change(screen.getByLabelText('Filter'),{target:{value:'other'}});fireEvent.click(screen.getByRole('button',{name:'Restore filters'}));await waitFor(()=>expect(calls.at(-1)?.view.q).toBe('árvíz & course'));expect(calls.at(-1)?.snapshot).toBeNull();
 expect(()=>writeView(localStorage,'alice',{version:2,q:'',sort:'created-desc'})).toThrow();
 localStorage.setItem('course-view:v1:alice','x'.repeat(2049));expect(()=>readView(localStorage,'alice')).toThrow();
});
it('fails closed on changed cursor snapshot, malformed and oversized pages',async()=>{
 let mode='first';const api:Api=async r=>mode==='big'?{rows:Array.from({length:51},(_,i)=>({id:String(i),title:'x'})),snapshot:'s1',nextCursor:null}:r.cursor?page('b',null,'s2'):page('a','next');
 render(<CourseScreen scope="alice" api={api} store={localStorage}/>);await screen.findByText('A');fireEvent.click(screen.getByRole('button',{name:'Next page'}));await screen.findByText('Results changed. Restart with these filters.');expect(screen.queryByText('B')).toBeNull();
 mode='big';fireEvent.click(screen.getByRole('button',{name:'Restart with these filters'}));await screen.findByText('Could not load results.');expect(screen.queryByRole('table')).toBeNull();
});
it('scope replacement clears rows and selection; unmount aborts active read',async()=>{
 let signal!:AbortSignal;const api=vi.fn<Api>(async(_r,s)=>{signal=s;return page()});const v=render(<CourseScreen scope="alice" api={api} store={localStorage}/>);fireEvent.click(await screen.findByRole('checkbox'));v.rerender(<CourseScreen scope="bob" api={api} store={localStorage}/>);await screen.findByRole('checkbox');expect(screen.getByText('0 selected on visited pages')).toBeTruthy();
 const pending:Api=(_r,s)=>{signal=s;return new Promise(()=>{})};v.rerender(<CourseScreen scope="bob" api={pending} store={localStorage}/>);v.unmount();expect(signal.aborted).toBe(true);
});
it('storage outage gives a fixed recovery message',async()=>{const broken={getItem(){throw Error('PRIVATE')},setItem(){throw Error('PRIVATE')}};render(<CourseScreen scope="alice" api={async()=>page()} store={broken}/>);await screen.findByText('A');fireEvent.click(screen.getByRole('button',{name:'Restore filters'}));expect(screen.getByText('Could not restore filters.')).toBeTruthy();expect(screen.queryByText('PRIVATE')).toBeNull();});
```

Use a Vitest config with `test: { environment: 'jsdom', include: ['behavior.test.tsx'] }`, then run `vitest run`. Compile the component with strict TypeScript and React JSX enabled. These are standalone learning fixtures; preserve any submission template's required test configuration and never put helpers into restricted `src/tests`.

## Debugging and practice acceptance

1. Connect an authorized, byte-bounded HTTP adapter and a real database endpoint. Seed at least 10,000 records including equal sort values. Prove stable ordering, cursor filter/tenant binding and snapshot expiry using integration tests. Record your chosen consistency policy instead of assuming keyset pagination freezes data.
2. Return query A after query B, including an adapter that ignores abort; B must remain visible. Unmount during a read and verify cancellation plus no later state commit. Return duplicate IDs, 51 rows, invalid JSON and an expired snapshot; reject safely and provide a restart route. Test the 100-ID cap across at least three pages and a selected ID that disappears server-side before action.
3. Save a Unicode query, restore after reload, change account/tenant and deny storage access. Restore must fetch a fresh authorized first page; no stale cursor or row may be restored. Implement “delete saved view” and logout cleanup before enabling device persistence for users.
4. Use keyboard and a screen reader in a native browser: labels, caption/header associations, selected state, status and heading focus must remain understandable across load/error/restart. Test zoom/reflow and return focus behavior. Record observations; fix failures rather than inferring accessibility from semantic markup alone.
5. Define a device/network/workload and measure input responsiveness, transferred bytes, page rendering and heap after repeated navigation. Proposed budgets: at most 50 rendered data rows, 100 selected IDs, and no accumulation of old page arrays; choose a measured p95 interaction target and payload byte limit with product stakeholders. Automated fixture tests establish behavior, not those runtime performance results.

Learner implementation and evidence are still required. The local fixture neither deploys the application nor establishes professional readiness.

## Official references

- [React useEffect: cleanup, dependencies, race protection and Strict Mode](https://react.dev/reference/react/useEffect).
- [WAI tables: captions and explicit row/column header relationships](https://www.w3.org/WAI/tutorials/tables/).
- [PostgreSQL 16 LIMIT/OFFSET: unique ordering and skipped-row cost](https://www.postgresql.org/docs/16/queries-limit.html).
