// counter-store.ts
import { configureStore, createAction, createReducer, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';

export type CounterApi = Readonly<{ nextDelta: () => Promise<unknown> }>;
export const incremented = createAction<number>('counter/incremented');
export const themeChanged = createAction<'light' | 'dark'>('preferences/themeChanged');
export const ticked = createAction('telemetry/ticked');

const counter = createReducer({ value: 0 }, builder => {
  builder.addCase(incremented, (state, action) => { state.value += action.payload; });
});
const preferences = createReducer({ theme: 'light' as 'light' | 'dark' }, builder => {
  builder.addCase(themeChanged, (state, action) => { state.theme = action.payload; });
});
const telemetry = createReducer({ ticks: 0 }, builder => {
  builder.addCase(ticked, state => { state.ticks += 1; });
});

export function createCounterStore(api: CounterApi) {
  return configureStore({
    reducer: { counter, preferences, telemetry },
    middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: { extraArgument: api } }),
  });
}
export type RootState = ReturnType<ReturnType<typeof createCounterStore>['getState']>;
export type AppDispatch = ReturnType<typeof createCounterStore>['dispatch'];
export type AppThunk<Result = void> = ThunkAction<Result, RootState, CounterApi, UnknownAction>;

export const loadIncrement = (): AppThunk<Promise<void>> => async (dispatch, getState, api) => {
  let value: unknown;
  try { value = await api.nextDelta(); }
  catch { throw new Error('Counter service unavailable'); }
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || Math.abs(value) > 1000) {
    throw new Error('Invalid counter service result');
  }
  if (!Number.isSafeInteger(getState().counter.value + value)) throw new Error('Counter range exceeded');
  dispatch(incremented(value));
};
