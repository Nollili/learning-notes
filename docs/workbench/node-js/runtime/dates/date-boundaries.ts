// date-boundaries.ts — deliberately narrow study contracts
export function parseUtcInstant(value: unknown): Date {
  if (typeof value !== 'string' ||
      !/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/.test(value)) {
    throw new Error('Expected UTC instant with milliseconds');
  }
  const result = new Date(value);
  if (!Number.isFinite(result.getTime()) || result.toISOString() !== value) {
    throw new Error('Invalid UTC instant');
  }
  return result;
}
export function parseCalendarDate(value: unknown): string {
  if (typeof value !== 'string' || !/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}$/.test(value)) {
    throw new Error('Expected calendar date');
  }
  const result = new Date(value + 'T00:00:00.000Z');
  if (!Number.isFinite(result.getTime()) || result.toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid calendar date');
  }
  return value;
}
export function addCalendarDays(value: string, days: number): string {
  parseCalendarDate(value);
  if (!Number.isSafeInteger(days) || Math.abs(days) > 36600) throw new Error('Invalid day count');
  // UTC is a calculation device for a plain Gregorian date, not an appointment's zone.
  const result = new Date(value + 'T00:00:00.000Z');
  result.setUTCDate(result.getUTCDate() + days);
  return parseCalendarDate(result.toISOString().slice(0, 10));
}
export function addElapsedMilliseconds(value: Date, milliseconds: number): Date {
  if (!Number.isFinite(value.getTime()) || !Number.isSafeInteger(milliseconds)) {
    throw new Error('Invalid elapsed arithmetic');
  }
  const result = new Date(value.getTime() + milliseconds);
  if (!Number.isFinite(result.getTime())) throw new Error('Instant outside supported range');
  return result; // Never mutate the caller's Date.
}
