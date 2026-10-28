// note-contract.ts — safe to share types/schema; contains no database or credentials.
import { z } from 'zod';
export const titleFormSchema = z.object({ title: z.string().trim().min(1, 'Enter a title').max(100, 'Use at most100characters') });
export const renameSchema = z.strictObject({
  id: z.uuid(), title: titleFormSchema.shape.title,
  version: z.number().int().min(1).max(2147483646)
});
export const noteSchema = z.object({ id: z.uuid(), title: z.string(), version: z.number().int().positive() });
export type Note = z.infer<typeof noteSchema>;
export type Rename = z.infer<typeof renameSchema>;
