import {readFile} from 'node:fs/promises';
const invalid = () => new RangeError('Limit must be an integer from 1 to 50');
export function parseLimit(raw) {
  if (raw === undefined) return 20;
  if (typeof raw !== 'string' || raw.trim() !== raw || !/^[1-9][0-9]?$/.test(raw)) throw invalid();
  const value = Number(raw);
  if (value > 50) throw invalid();
  return value;
}
export async function readPageLimit(file, load = readFile) {
  const value = JSON.parse(await load(file, 'utf8'));
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new TypeError('Invalid config');
  return parseLimit(value.limit);
}
