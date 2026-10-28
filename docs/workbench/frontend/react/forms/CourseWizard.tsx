// CourseWizard.tsx — combine with the pure transition/validation module above.
import { useEffect, useId, useReducer, useRef, type FormEvent } from 'react';
import { wizardTransition, detailErrors, type Values, type Wizard } from './wizard';
import { scheduleErrors } from './schedule';
export function CourseWizard({ save }: { save: (values: Values) => Promise<void> }) {
  const initial: Wizard = { step: 'details', values: { title: '', slug: '', start: '', end: '' },
    dirty: false, submission: 'idle', errors: {} };
  const [state, dispatch] = useReducer(wizardTransition, initial);
  const busy = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const completion = useRef<HTMLParagraphElement>(null);
  const id = useId();
  useEffect(() => { heading.current?.focus(); }, [state.step]);
  useEffect(() => {
    if (Object.keys(state.errors).length) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state.errors]);
  useEffect(() => { if (state.submission === 'done') completion.current?.focus(); }, [state.submission]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current || state.submission !== 'idle') return;
    if (state.step !== 'review') { dispatch({ type: 'next' }); return; }
    const errors = { ...detailErrors(state.values), ...scheduleErrors(state.values.start, state.values.end) };
    dispatch({ type: 'save' });
    if (Object.keys(errors).length) return;
    busy.current = true; // Immediate local duplicate-event guard; server still needs integrity rules.
    try { await save({ ...state.values }); dispatch({ type: 'success' }); }
    catch { dispatch({ type: 'failure' }); }
    finally { busy.current = false; }
  }
  if (state.submission === 'done') return <p ref={completion} tabIndex={-1} role="status">Course save confirmed.</p>;
  const fields = state.step === 'details' ? ['title', 'slug'] as const : ['start', 'end'] as const;
  return <form ref={form} noValidate onSubmit={submit}>
    <h2 ref={heading} tabIndex={-1}>Course: {state.step}</h2>
    <p>Step {state.step === 'details' ? 1 : state.step === 'schedule' ? 2 : 3} of3</p>
    <fieldset disabled={state.submission === 'saving'}><legend>{state.step === 'review' ? 'Review all values' : 'Course fields'}</legend>
      {state.step === 'review' ? <dl>{Object.entries(state.values).map(([key, value]) =>
        <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl> : fields.map(field => <div key={field}>
        <label htmlFor={`${id}-${field}`}>{field}</label>
        <input id={`${id}-${field}`} type={field === 'start' || field === 'end' ? 'date' : 'text'}
          maxLength={field === 'slug' ? 80 : field === 'title' ? 100 : undefined}
          value={state.values[field]} aria-invalid={!!state.errors[field]}
          aria-describedby={state.errors[field] ? `${id}-${field}-error` : undefined}
          onChange={event => dispatch({ type: 'edit', field, value: event.target.value })} />
        {state.errors[field] && <p role="alert" id={`${id}-${field}-error`}>{state.errors[field]}</p>}
      </div>)}
      {state.step !== 'details' && <button type="button" onClick={() => dispatch({ type: 'back' })}>Back</button>}
      <button type="submit">{state.step === 'review' ? 'Save course' : 'Next'}</button>
    </fieldset>
    {state.errors.root && <p role="alert">{state.errors.root}</p>}
    <p role="status">{state.submission === 'saving' ? 'Saving course…' : state.dirty ? 'Unsaved draft' : ''}</p>
  </form>;
}
