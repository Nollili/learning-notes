// title-seam.ts
export function legacyTitle(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ') || 'Untitled';
}
export function titleWords(raw: string): readonly string[] {
  return raw.trim().split(/\s+/).filter(Boolean);
}
export function renderTitle(words: readonly string[]): string {
  return words.join(' ') || 'Untitled';
}
// Public compatibility export: consumers keep one existing signature.
export function displayTitle(raw: string): string { return renderTitle(titleWords(raw)); }
