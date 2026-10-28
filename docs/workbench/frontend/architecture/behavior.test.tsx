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
