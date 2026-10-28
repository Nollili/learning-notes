// course-draft.js — storage codec; now is injectable for deterministic expiry tests.
export function decodeCourseDraft(raw, userId, now = Date.now()) {
  if (raw === null) return null;
  if (typeof raw !== 'string' || raw.length > 8192 || !Number.isFinite(now)) throw new Error('Invalid draft envelope');
  let value = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid draft');
  if (value.version === 1) { // An explicit former field-name migration.
    value = { ...value, version: 2, values: { title: value.subject, slug: value.slug, start: value.start, end: value.end } };
  }
  if (value.version !== 2) throw new Error('Unsupported draft version');
  if (typeof value.userId !== 'string' || !Number.isFinite(value.expiresAt)) throw new Error('Invalid draft scope');
  if (value.userId !== userId || value.expiresAt <= now) return null;
  if (value.expiresAt > now + 7 * 86400000) throw new Error('Invalid draft lifetime');
  if (!Number.isSafeInteger(value.baseVersion) || value.baseVersion < 1) throw new Error('Invalid record version');
  const fields = value.values;
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) throw new Error('Invalid draft values');
  for (const [key, max] of [['title', 100], ['slug', 80], ['start', 10], ['end', 10]]) {
    if (typeof fields[key] !== 'string' || fields[key].length > max) throw new Error('Invalid draft field');
  }
  return { baseVersion: value.baseVersion, values: { title: fields.title, slug: fields.slug, start: fields.start, end: fields.end } };
}
export function encodeCourseDraft(userId, baseVersion, values, now = Date.now()) {
  const raw = JSON.stringify({ version: 2, userId, baseVersion, expiresAt: now + 86400000,
    values: { title: values.title, slug: values.slug, start: values.start, end: values.end } });
  if (!decodeCourseDraft(raw, userId, now)) throw new Error('Draft could not be encoded');
  return raw;
}
