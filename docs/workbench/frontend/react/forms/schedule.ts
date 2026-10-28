// schedule.ts — pure validation; no external package needed.
export function dateNumber(value: string): number | null {
  const match = /^(20[2-9][0-9]|2100)-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date.getTime() : null;
}
export function scheduleErrors(start: string, end: string): Record<string, string> {
  const first = dateNumber(start), last = dateNumber(end);
  const errors: Record<string, string> = {};
  if (first === null) errors.start = 'Enter a valid start date';
  if (last === null) errors.end = 'Enter a valid end date';
  if (first !== null && last !== null && last < first) errors.end = 'End date must be on or after start';
  return errors;
}
