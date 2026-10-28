// wizard.ts — UI-independent transition core; import scheduleErrors from './schedule'.
import { scheduleErrors } from './schedule';
export type Values = { title: string; slug: string; start: string; end: string };
export type Wizard = {
  step: 'details' | 'schedule' | 'review'; values: Values; dirty: boolean;
  submission: 'idle' | 'saving' | 'done'; errors: Record<string, string>;
};
type Event = { type: 'edit'; field: keyof Values; value: string } |
  { type: 'next' | 'back' | 'save' | 'success' | 'failure' };
export function detailErrors(values: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.title.trim() || values.title.trim().length > 100) errors.title = 'Enter a title of1–100characters';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug) || values.slug.length > 80) errors.slug = 'Use a short lowercase slug';
  return errors;
}
export function wizardTransition(state: Wizard, event: Event): Wizard {
  if (event.type === 'success') return state.submission === 'saving'
    ? { ...state, submission: 'done', dirty: false, errors: {} } : state;
  if (event.type === 'failure') return state.submission === 'saving'
    ? { ...state, submission: 'idle', errors: { root: 'Save not confirmed; draft retained' } } : state;
  if (state.submission !== 'idle') return state;
  if (event.type === 'edit') return { ...state, values: { ...state.values, [event.field]: event.value }, dirty: true, errors: {} };
  if (event.type === 'back') return { ...state, step: state.step === 'review' ? 'schedule' : 'details', errors: {} };
  const details = detailErrors(state.values);
  const schedule = scheduleErrors(state.values.start, state.values.end);
  if (event.type === 'save') {
    if (state.step !== 'review') return state;
    const errors = { ...details, ...schedule };
    return Object.keys(errors).length ? { ...state, step: Object.keys(details).length ? 'details' : 'schedule', errors }
      : { ...state, submission: 'saving', errors: {} };
  }
  if (event.type === 'next') {
    const errors = state.step === 'details' ? details : schedule;
    return Object.keys(errors).length ? { ...state, errors }
      : { ...state, step: state.step === 'details' ? 'schedule' : 'review', errors: {} };
  }
  return state;
}
