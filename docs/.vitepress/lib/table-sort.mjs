const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
const proficiency = ['Novice', 'Intermediate', 'Advanced']

function value(text, type) {
  const trimmed = text.trim()
  if (!trimmed || trimmed === '—' || trimmed === '-') return null
  if (type === 'proficiency') return [proficiency.indexOf(trimmed)]
  if (type === 'stars') return [...trimmed.matchAll(/\u2B50+/gu)].map(match => match[0].length)
  return trimmed
}

// Empty source cells stay at the end in either direction. Multi-level star groups
// compare numerically from left to right; Related does not change their level.
export function compareTableCells(left, right, type = 'text', direction = 'ascending') {
  const a = value(left, type)
  const b = value(right, type)
  if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1
  let result = 0
  if (Array.isArray(a)) {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      result = (a[i] ?? 0) - (b[i] ?? 0)
      if (result) break
    }
  } else result = collator.compare(a, b)
  return direction === 'descending' ? -result : result
}
