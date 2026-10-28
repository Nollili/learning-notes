// counter-selectors.tsx
import { createSelector } from '@reduxjs/toolkit';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './counter-store.js';

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const selectCount = (state: RootState) => state.counter.value;
export const selectTheme = (state: RootState) => state.preferences.theme;
export const selectFreshSummary = (state: RootState) => ({ count: selectCount(state), theme: selectTheme(state) });
export const selectMemoSummary = createSelector([selectCount, selectTheme], (count, theme) => ({ count, theme }));

export function CounterSummary() {
  const count = useAppSelector(selectCount);
  const summary = useAppSelector(selectMemoSummary);
  const fieldCompared = useAppSelector(selectFreshSummary, shallowEqual);
  return <section aria-label="Counter summary">
    <p>{count} / {summary.theme} / {fieldCompared.theme}</p>
  </section>;
}
