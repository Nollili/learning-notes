// profile-race.ts
import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
export type Profile = { id: string; name: string };
export type ProfileApi = { load: (id: string, signal: AbortSignal) => Promise<unknown> };
type Failure = 'invalid_input' | 'unavailable';
type ProfileState = { status: 'idle' | 'loading' | 'ready' | 'failed' | 'cancelled';
  requestId: string | null; profile: Profile | null; error: Failure | null };
export const loadProfile = createAsyncThunk<Profile, { id: string },
  { extra: { api: ProfileApi }; rejectValue: Failure }>('profile/load', async ({ id }, api) => {
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return api.rejectWithValue('invalid_input');
  try {
    const raw = await api.extra.api.load(id, api.signal);
    if (!raw || typeof raw !== 'object' || !('id' in raw) || raw.id !== id
      || !('name' in raw) || typeof raw.name !== 'string' || raw.name.length > 80 || !raw.name.trim()) {
      return api.rejectWithValue('unavailable');
    }
    return { id, name: raw.name };
  } catch { return api.rejectWithValue('unavailable'); }
});
const initialState: ProfileState = { status: 'idle', requestId: null, profile: null, error: null };
const slice = createSlice({ name: 'profile', initialState, reducers: {}, extraReducers: builder => {
  builder.addCase(loadProfile.pending, (state, action) => {
    state.status = 'loading'; state.requestId = action.meta.requestId; state.profile = null; state.error = null;
  }).addCase(loadProfile.fulfilled, (state, action) => {
    if (state.requestId !== action.meta.requestId) return;
    state.status = 'ready'; state.profile = action.payload; state.requestId = null;
  }).addCase(loadProfile.rejected, (state, action) => {
    if (state.requestId !== action.meta.requestId) return;
    state.status = action.meta.aborted ? 'cancelled' : 'failed';
    state.error = action.meta.aborted ? null : action.payload ?? 'unavailable'; state.requestId = null;
  });
}});
export const profileReducer = slice.reducer;
export function createProfileStore(api: ProfileApi) {
  return configureStore({ reducer: { profile: profileReducer }, devTools: false,
    middleware: defaults => defaults({ thunk: { extraArgument: { api } } }) });
}
