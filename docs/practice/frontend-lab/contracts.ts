import {z} from 'zod';
const View=z.strictObject({q:z.string().max(100),sort:z.enum(['title-asc','created-desc']),cursor:z.string().min(1).max(256).nullable()});
export function parseView(search:string){
 const params=new URLSearchParams(search);
 for(const key of params.keys())if(!['q','sort','cursor'].includes(key)||params.getAll(key).length!==1)throw new Error('INVALID_VIEW');
 return View.parse({q:params.get('q')??'',sort:params.get('sort')??'created-desc',cursor:params.get('cursor')});
}
export const Page=z.strictObject({rows:z.array(z.strictObject({id:z.uuid(),title:z.string().min(1).max(100)})).max(50),nextCursor:z.string().min(1).max(256).nullable()}).refine(p=>new Set(p.rows.map(r=>r.id)).size===p.rows.length);
export type Load<T>={kind:'loading'}|{kind:'ready';value:T}|{kind:'failed';code:'NETWORK'|'INVALID_DATA'};
export function parsePage(raw:unknown):Load<z.infer<typeof Page>>{
 const parsed=Page.safeParse(raw);return parsed.success?{kind:'ready',value:parsed.data}:{kind:'failed',code:'INVALID_DATA'};
}
export function description<T>(state:Load<T>):string{
 switch(state.kind){case'loading':return'Loading';case'ready':return'Ready';case'failed':return state.code;default:return unreachable(state);}
}
export function unreachable(value:never):never{throw new Error('UNREACHABLE_STATE');}
