import { StrictMode, useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ControlledTabs } from '../composition/composition-contracts';
import { TrackedActionButton } from '../composition/action-adapter';
import { NativeDialog } from '../composition/native-dialog';
import { CourseWizard } from '../forms/CourseWizard';

function QueueDemo() {
  const [count, setCount] = useState(0);
  return <section aria-label="State queue"><output aria-label="Count">{count}</output>
    <button type="button" onClick={() => { setCount(count + 1); setCount(count + 1); }}>Replace twice</button>
    <button type="button" onClick={() => { setCount(n => n + 1); setCount(n => n + 1); }}>Update twice</button>
  </section>;
}
function DraftRow({ id, title }: { id: string; title: string }) {
  const [draft, setDraft] = useState(title);
  return <li><label>Draft {id}<input value={draft} onChange={event => setDraft(event.target.value)} /></label></li>;
}
function IdentityDemo() {
  const [rows, setRows] = useState([{id:'A',title:'Alpha'},{id:'B',title:'Beta'}]);
  return <section aria-label="Entity identity"><button type="button" onClick={() => setRows(old => [...old].reverse())}>Reverse rows</button>
    <ul>{rows.map(row => <DraftRow key={row.id} {...row} />)}</ul></section>;
}
// A controlled local adapter makes settlement order observable. It intentionally ignores abort.
const pending = new Map<string, (value: string) => void>();
function localRead(id: string, _signal: AbortSignal): Promise<string> {
  return new Promise(resolve => { pending.set(id, resolve); });
}
let owners = 0;
function OwnedResult({ id }: { id: string }) {
  const [text, setText] = useState('Waiting');
  useEffect(() => {
    let current = true; const controller = new AbortController(); ++owners;
    setText('Waiting');
    // The controlled fixture can be settled by buttons; production adapters require deadlines.
    void localRead(id, controller.signal).then(value => { if (current) setText(value); });
    return () => { current = false; controller.abort(); --owners; };
  }, [id]);
  return <p role="status">{text}</p>;
}
function RaceDemo() {
  const [id, setId] = useState('A'); const [mounted, setMounted] = useState(true);
  return <section aria-label="Request owner">
    <button type="button" onClick={() => setId('B')}>Request B</button>
    <button type="button" onClick={() => { pending.get('B')?.('Accepted B'); pending.delete('B'); }}>Resolve B</button>
    <button type="button" onClick={() => { pending.get('A')?.('Obsolete A'); pending.delete('A'); }}>Resolve A</button>
    <button type="button" onClick={() => { setMounted(false); }}>Unmount result</button>
    <button type="button" onClick={() => { document.querySelector('#owner-count')!.textContent = String(owners); }}>Inspect owners</button>
    <output id="owner-count" aria-label="Live owners">Unchecked</output>
    {mounted && <OwnedResult id={id} />}
  </section>;
}
function App() {
  const [tab, setTab] = useState('overview');
  const [open, setOpen] = useState(false);
  const fallback = useRef<HTMLHeadingElement>(null);
  return <main><h1>Frontend ownership reference</h1>
    <p>Local controlled examples; no network, private data or persisted saves.</p>
    <section><h2 ref={fallback} tabIndex={-1}>Dialog reference</h2><button type="button" onClick={() => setOpen(true)}>Open reference dialog</button>
    <NativeDialog open={open} title="Reference instructions" fallbackFocus={fallback} onRequestClose={() => setOpen(false)}><p>Local instructions; no save or external action.</p></NativeDialog></section>
    <QueueDemo /><IdentityDemo /><RaceDemo />
    <ControlledTabs label="Reference sections" value={tab} onValueChange={setTab} items={[
      {id:'overview',label:'Overview',panel:<p>Immediate local panel.</p>},
      {id:'disabled',label:'Unavailable',disabled:true,panel:<p>Unavailable.</p>},
      {id:'details',label:'Details',panel:<p>Second local panel.</p>}
    ]} />
    <TrackedActionButton onClick={() => { document.querySelector('#action-status')!.textContent = 'Action activated'; }}>Reference action</TrackedActionButton>
    <p id="action-status" role="status" />
    <CourseWizard save={async () => { await Promise.resolve(); }} />
  </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
