import { hasEmoji, presentation, stripSectionNumber } from '../content-policy.mjs'

export function sectionNumberingPlugin(md) {
  // Old emoji-containing fragments remain valid without storing icons in sources.
  md.core.ruler.before('anchor', 'hub-legacy-anchor-ids', state => {
    for (const token of state.tokens) {
      const id = token.type === 'heading_open' && token.attrGet('id')
      if (!id || !id.includes('%')) continue
      try {
        const decoded = decodeURIComponent(id)
        if (hasEmoji(decoded)) token.attrSet('id', decoded)
      } catch { /* A literal percent sign is a valid custom ID. */ }
    }
  })
  // Run after anchor generation: presentation must never change a saved URL.
  md.core.ruler.after('anchor', 'hub-section-numbering', state => {
    const stack = []
    let topic = 0
    for (let index = 0; index < state.tokens.length; index++) {
      const heading = state.tokens[index]
      if (heading.type !== 'heading_open') continue
      const inline = state.tokens[index + 1]
      if (!inline?.children) continue
      const level = Number(heading.tag.slice(1))
      // Remove handwritten numbering even when it is wrapped in emphasis.
      const firstText = inline.children.find(token => token.type === 'text' && token.content.trim())
      if (firstText) firstText.content = stripSectionNumber(firstText.content)
      if (level === 1) {
        stack.length = 0
        topic = 0
        continue
      }
      if (heading.level !== 0) continue
      while (stack.length && stack.at(-1).level >= level) stack.pop()
      const parent = stack.at(-1)
      const sequence = parent ? [...parent.sequence, ++parent.children] : [++topic]
      stack.push({ level, sequence, children: 0 })
      if (presentation.numberSections) {
        const open = new state.Token('span_open', 'span', 1)
        open.attrSet('class', 'hub-section-number')
        const number = new state.Token('text', '', 0)
        number.content = `${sequence.join('.')} `
        const close = new state.Token('span_close', 'span', -1)
        inline.children.unshift(open, number, close)
      }
      const label = inline.children.filter(token => ['text', 'code_inline'].includes(token.type)).map(token => token.content).join('').trim()
      for (const token of inline.children) {
        if (token.type === 'link_open' && token.attrGet('class') === 'header-anchor') {
          token.attrSet('aria-label', `Permalink to “${label}”`)
        }
      }
    }
  })
}
