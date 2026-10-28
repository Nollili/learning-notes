// release-compatibility.mjs — a model of column contracts, not a database driver
function required(row, field) {
  if (!Object.hasOwn(row, field)) throw new Error(`Missing column: ${field}`);
  return row[field];
}
export function readLabel(version, row) {
  return required(row, version <= 2 ? 'name' : 'display_name');
}
export function writeLabel(version, row, value) {
  const fields = version === 1 ? ['name'] : version === 4 ? ['display_name'] : ['name', 'display_name'];
  for (const field of fields) required(row, field);
  const result = { ...row };
  for (const field of fields) result[field] = value;
  return result;
}
export function backfillWithoutConcurrentWriters(row) {
  return { ...row, display_name: required(row, 'name') };
}
export function contract(row) {
  required(row, 'display_name');
  const { name, ...remaining } = row;
  return remaining;
}
