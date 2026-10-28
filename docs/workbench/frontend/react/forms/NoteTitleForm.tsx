// NoteTitleForm.tsx — parent keys by record.id, not every background version change.
import { useId, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { titleFormSchema, type Note } from './note-contract';
import { SaveError } from './note-api';
export function NoteTitleForm({ record, save }: {
  record: Note; save: (title: string, version: number) => Promise<Note>
}) {
  const id = useId();
  const baseVersion = useRef(record.version);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(titleFormSchema), defaultValues: { title: record.title }
  });
  async function submit(values: { title: string }) {
    try {
      const confirmed = await save(values.title, baseVersion.current);
      baseVersion.current = confirmed.version;
      reset({ title: confirmed.title }); // Intentional successful-save baseline; input is disabled while saving.
    } catch (error) {
      setError('root.save', { message: error instanceof SaveError && error.status === 409
        ? 'This note changed or is unavailable. Your draft is preserved; refresh and review before saving.'
        : 'Could not confirm save. Your draft is preserved; check the current note before retrying.' });
    }
  }
  return <form noValidate onSubmit={handleSubmit(submit)}>
    <fieldset disabled={isSubmitting}><legend>Edit note title</legend>
      <label htmlFor={id}>Title</label>
      <input id={id} {...register('title')} aria-invalid={!!errors.title}
        aria-describedby={errors.title ? `${id}-error` : undefined} />
      {errors.title && <p id={`${id}-error`} role="alert">{errors.title.message}</p>}
      <button type="submit">Save title</button>
    </fieldset>
    {errors.root?.save && <p role="alert">{errors.root.save.message}</p>}
    <p role="status">{isSubmitting ? 'Saving title…' : 'Ready to edit'}</p>
  </form>;
}
