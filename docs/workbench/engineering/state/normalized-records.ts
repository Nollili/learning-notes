// normalized-records.ts
import { createEntityAdapter } from '@reduxjs/toolkit';
export type RecordItem = { id: string; title: string };
export const records = createEntityAdapter<RecordItem>();
export const emptyRecords = records.getInitialState();
export const initialRecords = records.setAll(emptyRecords, [
  { id: 'a', title: 'First' }, { id: 'b', title: 'Second' },
]);
export const revisedRecords = records.updateOne(initialRecords,
  { id: 'a', changes: { title: 'Revised' } });
