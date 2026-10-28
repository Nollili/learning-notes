// composition-contracts.tsx
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

export type TabItem = Readonly<{ id: string; label: string; panel: ReactNode; disabled?: boolean }>;

export function resolveActiveItem(items: readonly TabItem[], value: string): TabItem | undefined {
  const ids = new Set<string>();
  for (const item of items) {
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(item.id) || ids.has(item.id)) throw new Error('Invalid tab identity');
    ids.add(item.id);
  }
  return items.find(item => item.id === value && !item.disabled) ?? items.find(item => !item.disabled);
}

export function WorkspaceCard({ title, actions, children }: Readonly<{
  title: string; actions?: ReactNode; children: ReactNode
}>) {
  const heading = useId();
  return <section aria-labelledby={heading}>
    <header><h2 id={heading}>{title}</h2>{actions}</header>
    <div>{children}</div>
  </section>;
}

export function ControlledTabs({ label, items, value, onValueChange }: Readonly<{
  label: string; items: readonly TabItem[]; value: string; onValueChange: (id: string) => void
}>) {
  const prefix = useId();
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const active = resolveActiveItem(items, value);
  if (!active) return <p>No available sections.</p>;
  const enabled = items.filter(item => !item.disabled);
  function activate(id: string) {
    onValueChange(id);
    buttons.current.get(id)?.focus();
  }
  function move(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    const index = enabled.findIndex(item => item.id === id);
    let next: TabItem | undefined;
    if (event.key === 'ArrowRight') next = enabled[(index + 1) % enabled.length];
    else if (event.key === 'ArrowLeft') next = enabled[(index - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled[enabled.length - 1];
    if (next) { event.preventDefault(); activate(next.id); }
  }
  return <div dir="ltr">
    <div role="tablist" aria-label={label} aria-orientation="horizontal">
      {items.map(item => <button key={item.id} type="button" role="tab"
        id={`${prefix}-${item.id}-tab`} aria-controls={`${prefix}-${item.id}-panel`}
        aria-selected={active.id === item.id} disabled={item.disabled}
        tabIndex={active.id === item.id ? 0 : -1}
        ref={node => { if (node) buttons.current.set(item.id, node); else buttons.current.delete(item.id); }}
        onClick={() => activate(item.id)} onKeyDown={event => move(event, item.id)}>{item.label}</button>)}
    </div>
    {items.map(item => <div key={item.id} role="tabpanel" id={`${prefix}-${item.id}-panel`}
      aria-labelledby={`${prefix}-${item.id}-tab`} hidden={active.id !== item.id} tabIndex={0}>
      {item.panel}
    </div>)}
  </div>;
}

export function WorkspaceDemo() {
  const [section, setSection] = useState('details');
  const items: readonly TabItem[] = [
    { id: 'overview', label: 'Overview', panel: <p>Workspace overview.</p> },
    { id: 'details', label: 'Details', panel: <p>Workspace details.</p> },
  ];
  return <WorkspaceCard title="Project workspace" actions={<button type="button">Export notes</button>}>
    <ControlledTabs label="Workspace sections" items={items} value={section} onValueChange={setSection} />
  </WorkspaceCard>;
}
