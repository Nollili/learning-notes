// relational-state.ts
import { configureStore, createEntityAdapter, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
type User = { id: string; name: string };
type Project = { id: string; title: string; ownerId: string };
type Snapshot = { users: User[]; projects: Project[] };
const users = createEntityAdapter<User>();
const projects = createEntityAdapter<Project>();
const initialState = { users: users.getInitialState(), projects: projects.getInitialState() };
const slice = createSlice({
  name: 'catalogue', initialState,
  reducers: {
    replaced(state, { payload }: PayloadAction<Snapshot>) {
      const userIds = new Set(payload.users.map(user => user.id));
      const projectIds = new Set(payload.projects.map(project => project.id));
      if (userIds.size !== payload.users.length || projectIds.size !== payload.projects.length
        || payload.projects.some(project => !userIds.has(project.ownerId))) throw new Error('Invalid relationships');
      users.setAll(state.users, payload.users);
      projects.setAll(state.projects, payload.projects);
    },
    userRenamed(state, { payload }: PayloadAction<{ id: string; name: string }>) {
      const current = state.users.entities[payload.id];
      if (current && current.name !== payload.name) users.updateOne(state.users, { id: payload.id, changes: { name: payload.name } });
    },
    userRemoved(state, { payload: id }: PayloadAction<string>) {
      users.removeOne(state.users, id);
      const owned = state.projects.ids.filter(projectId => state.projects.entities[projectId]?.ownerId === id);
      projects.removeMany(state.projects, owned);
    }
  }
});
export const { replaced, userRenamed, userRemoved } = slice.actions;
export const makeStore = () => configureStore({ reducer: { catalogue: slice.reducer }, devTools: false });
export type RootState = ReturnType<ReturnType<typeof makeStore>['getState']>;
export const userSelectors = users.getSelectors((state: RootState) => state.catalogue.users);
export const projectSelectors = projects.getSelectors((state: RootState) => state.catalogue.projects);
// A selector factory avoids sharing one parameterized view owner across unrelated lists.
export const makeSelectOwnerProjects = () => createSelector(
  [projectSelectors.selectAll, (_state: RootState, ownerId: string) => ownerId],
  (all, ownerId) => all.filter(project => project.ownerId === ownerId)
);
