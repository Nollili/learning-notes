// Shared by the site, generated catalogues and content checks.
export const presentation = Object.freeze({
  numberSections: true,
  numberSidebar: false
})

export const categoryTitles = Object.freeze({
  senior_growth: 'Senior Growth',
  A11y: 'Accessibility',
  CD_CI: 'Continuous integration and delivery',
  Clean_code_and_Code_Quality: 'Clean code and code quality',
  Coding_principles_patterns_conventions: 'Coding principles, patterns and conventions',
  Communication_and_Security: 'Communication and security',
  EngX_Quality: 'Engineering practices and architecture',
  General_ES6: 'JavaScript and ECMAScript',
  State_management_and_Redux: 'State management and Redux',
  Web_Performance: 'Web performance',
  Other: 'Additional engineering topics'
})

const emojiPattern = /(?:\p{Regional_Indicator}{2}|[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}[\uFE0E\uFE0F]?[\u{1F3FB}-\u{1F3FF}]?(?:\u200D\p{Extended_Pictographic}[\uFE0E\uFE0F]?[\u{1F3FB}-\u{1F3FF}]?)*)/gu
const textSymbols = new Map([
  [0x25b6, '>'], [0x25c0, '<'], [0x2194, '<->'],
  [0x2197, 'up-right'], [0x2198, 'down-right'],
  [0x21a9, '<-'], [0x21aa, '->'],
  [0xa9, '(c)'], [0xae, '(R)'], [0x2122, 'TM']
])

export function removeEmoji(value) {
  return value.replace(emojiPattern, match => textSymbols.get(match.codePointAt(0)) ?? '')
}

export function hasEmoji(value) {
  return value !== removeEmoji(value)
}

export function stripSectionNumber(value) {
  return value.replace(/^\s*(?:\d+(?:\.\d+)*[.)]\s+|(?:chapter|section|step)\s+\d+\s*[:.\u2014-]\s*)/i, '')
}

export function cleanTitle(value) {
  let title = removeEmoji(value).replace(/\s*\{#[^}]+\}\s*$/, '').trim()
  title = title.replace(/\*\*/g, '').replace(/\s*#{1,6}\s*$/, '')
  title = stripSectionNumber(title)
  title = title.replace(/(?:[ _-]+)?[a-f0-9]{32}(?=\s*(?:\.md)?$)/i, '').replace(/\.md$/i, '')
  if (categoryTitles[title]) return categoryTitles[title]
  // Backticks distinguish API names such as child_process from exported prose.
  return title.split(/(`[^`]*`)/g).map(part => part.startsWith('`') ? part.slice(1, -1) : part.replace(/_/g, ' ')).join('').replace(/\s+/g, ' ').trim()
}

export function getPageTitle(source, fallback = '') {
  let fence = null
  let frontmatter = source.startsWith('---\n')
  for (const [index, line] of source.split('\n').entries()) {
    if (frontmatter) {
      if (index > 0 && /^---\s*$/.test(line)) frontmatter = false
      continue
    }
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (marker) {
      if (!fence) fence = marker[1]
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null
      continue
    }
    if (fence) continue
    const heading = line.match(/^#{1,6}\s+(.+)/)
    if (heading) return cleanTitle(heading[1])
  }
  return cleanTitle(fallback)
}

export function applyContentPolicy(config) {
  const cleanItems = (items, parent = []) => items.map((item, index) => {
    const sequence = [...parent, index + 1]
    return {
      ...item,
      ...(item.text ? { text: `${presentation.numberSidebar ? sequence.join('.') + ' ' : ''}${cleanTitle(item.text)}` } : {}),
      ...(item.items ? { items: cleanItems(item.items, sequence) } : {})
    }
  })
  return {
    ...config,
    themeConfig: {
      ...config.themeConfig,
      sidebar: Object.fromEntries(Object.entries(config.themeConfig.sidebar).map(([route, items]) => [route, cleanItems(items)]))
    }
  }
}
