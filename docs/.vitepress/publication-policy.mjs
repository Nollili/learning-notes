import path from 'node:path'

// Authoring records stay in Git, outside the learning app and its search corpus.
export const repositoryOnlyPages = Object.freeze([
  'review/index.md',
  'review/verification.md',
  'frontend/coverage-map.md',
  'frontend/verification.md',
  'frontend/performance/verification.md',
  'applied-ai/coverage-map.md',
  'applied-ai/javascript/verification.md',
  'cs-foundations/coverage-map.md',
  'node-js/tech-check/coverage.md',
  'node-js/tech-check/progress.md',
  'learner-guide/verification.md',
  'learner-guide/support.md',
  'learner-guide/topics.md',
  'workbench/frontend/verification/index.md',
  'workbench/node-js/runtime/historical-verification.md'
])
const repositoryOnly = new Set(repositoryOnlyPages)
const authorRecords = new Set([
  'REVIEW_PROGRESS.md', 'FURTHER_TOPICS_PROGRESS.md', 'REVIEW_ROUND_2_PROGRESS.md',
  'LEARNING_NOTES_REVIEW.md', 'GAP_REMEDIATION_PROGRESS.md', 'LEARNING_NOTES_ROUND_2_AUDIT.md',
  'ROUND_2_INVENTORY.json', 'ROUND_2_INVENTORY.csv'
])

export function isRepositoryOnlyLink(href, from = 'index.md') {
  if (!href || href.startsWith('#')) return false
  let target = href
  if (/^https?:\/\//i.test(target)) {
    const url = new URL(target)
    if (!['localhost', '127.0.0.1'].includes(url.hostname)) return false
    target = url.pathname
  } else if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return false
  try { target = decodeURIComponent(target.split(/[?#]/, 1)[0]) } catch { return false }
  const local = target.startsWith('/') ? target.slice(1) : path.posix.join(path.posix.dirname(from), target)
  const normalized = path.posix.normalize(local)
  if (normalized === 'review' || /^review\//.test(normalized)) return true
  if (authorRecords.has(path.posix.basename(normalized))) return true
  const page = normalized.endsWith('/') ? `${normalized}index.md`
    : /\.(?:md|html)$/.test(normalized) ? normalized.replace(/\.(?:md|html)$/, '.md')
      : `${normalized}.md`
  return repositoryOnly.has(page)
}

function visibleItems(items) {
  return items.flatMap(item => {
    if (item.link && isRepositoryOnlyLink(item.link)) return []
    const next = { ...item }
    if (item.items) {
      next.items = visibleItems(item.items)
      if (!next.items.length && !next.link) return []
    }
    return [next]
  })
}

export function applyPublicationPolicy(config) {
  return {
    ...config,
    srcExclude: [...(config.srcExclude ?? []), ...repositoryOnlyPages],
    themeConfig: {
      ...config.themeConfig,
      nav: visibleItems(config.themeConfig.nav ?? []),
      sidebar: Object.fromEntries(Object.entries(config.themeConfig.sidebar ?? {})
        .filter(([route]) => !isRepositoryOnlyLink(route))
        .map(([route, items]) => [route, visibleItems(items)]))
    }
  }
}

// Remove author-record references at rendering time. The Markdown remains useful
// to maintainers in Git; fenced examples and genuine learning checks are untouched.
export function visibleInline(content, from) {
  const marker = '\uE000'
  const marked = content.replace(/(?<!!)\[([^\]\n]+)\]\((<?[^\s)]+>?)(?:\s+"[^"]*")?\)/g,
    (match, label, href) => isRepositoryOnlyLink(href.replace(/^<|>$/g, ''), from) ? marker : match)
  if (!marked.includes(marker)) return content
  return marked.split(/\s*[·]\s*/).map(part => part.split(/(?<=[.!?;])\s+/)
    .filter(sentence => !sentence.includes(marker)).join(' '))
    .filter(part => part.trim()).join(' · ').trim()
}

function sourcePage(env) {
  const filename = (env.relativePath ?? env.path ?? 'index.md').replaceAll('\\', '/')
  return filename.includes('/docs/') ? filename.split('/docs/').at(-1) : filename
}

export function repositoryOnlyDevGuard() {
  return {
    name: 'repository-only-authoring-routes',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!isRepositoryOnlyLink(req.url)) return next()
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end('<!doctype html><html><head><title>Page not found</title></head><body><h1>Page not found</h1></body></html>')
      })
    }
  }
}

export function publicationPlugin(md) {
  md.core.ruler.before('block', 'repository-only-pages', state => {
    if (isRepositoryOnlyLink('/' + sourcePage(state.env))) state.src = '# Page not found\n'
  })
  md.core.ruler.before('inline', 'repository-only-references', state => {
    const from = sourcePage(state.env)
    const tokens = state.tokens
    const authorHeadings = new Set(['Complete hub inventory', 'Hub inventory and review', 'Material generation progress', 'Authoring progress'])
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'heading_open') continue
      const title = tokens[i + 1]?.content.replace(/\s*\{#[^}]+\}$/, '').trim()
      if (!authorHeadings.has(title)) continue
      const level = Number(tokens[i].tag.slice(1))
      let end = i + 3
      while (end < tokens.length && !(tokens[end].type === 'heading_open' && Number(tokens[end].tag.slice(1)) <= level)) end++
      tokens.splice(i, end - i); i--
    }
    // A hidden reference in a catalogue row must not leave its description orphaned.
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'tr_open') continue
      let end = i + 1
      while (end < tokens.length && tokens[end].type !== 'tr_close') end++
      if (tokens.slice(i, end).some(t => t.type === 'inline' && visibleInline(t.content, from) !== t.content)) {
        tokens.splice(i, end - i + 1); i--
      }
    }
    for (const token of tokens) {
      if (token.type === 'inline') token.content = visibleInline(token.content, from)
    }
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'list_item_open') continue
      let depth = 1, end = i + 1
      for (; end < tokens.length && depth; end++) {
        if (tokens[end].type === 'list_item_open') depth++
        if (tokens[end].type === 'list_item_close') depth--
      }
      const substantive = tokens.slice(i, end).some(t =>
        ['inline', 'fence', 'code_block', 'html_block'].includes(t.type) && t.content.trim())
      if (!substantive) { tokens.splice(i, end - i); i-- }
    }
    for (let i = 0; i < tokens.length - 2; i++) {
      if (tokens[i].type === 'paragraph_open' && tokens[i + 1].type === 'inline' &&
          !tokens[i + 1].content.trim() && tokens[i + 2].type === 'paragraph_close') {
        tokens.splice(i, 3); i--
      }
    }
  })
}
