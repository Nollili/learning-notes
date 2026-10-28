// route-projects.tsx
import { useEffect, useState } from 'react';
export type Route = { tenantId: string; accountId: string; sessionRevision: string };
export type Project = { id: string; title: string };
export type ProjectApi = {
  account: (route: Route, signal: AbortSignal) => Promise<unknown>;
  projects: (route: Route, accountId: string, signal: AbortSignal) => Promise<unknown>;
};
type State = { kind: 'loading' } | { kind: 'ready'; items: Project[] }
  | { kind: 'failed'; reason: 'timeout' | 'unavailable' };
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function accountId(value: unknown, expected: string): string {
  if (!record(value) || value.id !== expected) throw new Error('Invalid account');
  return expected;
}
function projectList(value: unknown): Project[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error('Invalid projects');
  const seen = new Set<string>();
  return value.map((item: unknown) => {
    if (!record(item) || typeof item.id !== 'string' || item.id.length < 1 || item.id.length > 80
      || typeof item.title !== 'string' || item.title.trim().length < 1 || item.title.length > 160
      || seen.has(item.id)) throw new Error('Invalid project');
    seen.add(item.id);
    return { id: item.id, title: item.title };
  });
}
export function RouteProjects({ route, api }: { route: Route; api: ProjectApi }) {
  return <RequestOwner key={JSON.stringify([route.tenantId, route.accountId, route.sessionRevision])}
    tenantId={route.tenantId} accountId={route.accountId} sessionRevision={route.sessionRevision} api={api} />;
}
function RequestOwner({ tenantId, accountId: requestedId, sessionRevision, api }: Route & { api: ProjectApi }) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => {
      active = false;
      controller.abort();
      setState({ kind: 'failed', reason: 'timeout' });
    }, 5000);
    setState({ kind: 'loading' });
    async function load() {
      const requestRoute = { tenantId, accountId: requestedId, sessionRevision };
      try {
        const rawAccount = await api.account(requestRoute, controller.signal);
        if (!active) return;
        const id = accountId(rawAccount, requestedId);
        const rawProjects = await api.projects(requestRoute, id, controller.signal);
        if (!active) return;
        setState({ kind: 'ready', items: projectList(rawProjects) });
      } catch {
        if (active) setState({ kind: 'failed', reason: 'unavailable' });
      } finally { clearTimeout(timer); }
    }
    void load();
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [tenantId, requestedId, sessionRevision, api]);
  if (state.kind === 'loading') return <p role="status">Loading projects…</p>;
  if (state.kind === 'failed') return <p role="alert">{state.reason === 'timeout'
    ? 'Loading timed out.' : 'Unable to load projects.'}</p>;
  return state.items.length === 0 ? <p>No projects.</p>
    : <ul aria-label="Projects">{state.items.map(item => <li key={item.id}>{item.title}</li>)}</ul>;
}
