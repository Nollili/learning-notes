import fs from 'node:fs'
import path from 'node:path'
import { nodeTechCheckPaths } from './node-tech-check.mjs'

const descriptions = {
  '/frontend/performance/': 'Measure loading and runtime performance, find bottlenecks and verify improvements.',
  '/cs-foundations/': 'Understand algorithms, data structures and the cost of solving problems.',
  '/node-js/': 'Learn the Node.js runtime, then build backend services with databases and deployment.',
  '/node-js/tech-check/': 'Prepare for technical discussions through five levels of explanations and practical projects.',
  '/aws/': 'Learn cloud foundations and build secure applications with AWS services.',
  '/applied-ai/': 'Build JavaScript AI applications with chat, tools, retrieval and workflows.',
  '/ai-assisted-engineering/': 'Use AI to investigate, implement and verify software changes.',
  '/engineering/': 'Develop practical skills in architecture, testing, security and engineering workflows.'
}
const seniorDescriptions = {
  A11y: 'Make interfaces accessible with semantic HTML, keyboard support and useful checks.',
  CD_CI: 'Understand delivery pipelines and automate reliable software releases.',
  CSS: 'Deepen your understanding of layout, styling and maintainable CSS.',
  Clean_code_and_Code_Quality: 'Improve readability and maintainability through clean code and review.',
  Coding_principles_patterns_conventions: 'Apply design principles, patterns and conventions to everyday decisions.',
  Communication_and_Security: 'Understand browser communication and security boundaries.',
  EngX_Quality: 'Explore architecture and engineering practices for sustainable software.',
  General_ES6: 'Strengthen your knowledge of JavaScript execution and modern language features.',
  Git: 'Work confidently with version history, branches and collaboration.',
  Other: 'Explore additional engineering concepts and problem-solving techniques.',
  React: 'Understand React rendering, components, hooks and application design.',
  State_management_and_Redux: 'Choose state boundaries and manage predictable application updates.',
  Testing: 'Design meaningful tests and choose appropriate testing techniques.',
  TypeScript: 'Use types to describe contracts and prevent mistakes.',
  Web_Performance: 'Understand browser performance and investigate slow experiences.'
}

export function withLearningPaths(config) {
  const sidebar = config.themeConfig.sidebar
  function items(groups, prefix) {
    const found = new Map()
    function visit(entries) {
      for (const entry of entries) {
        const href = entry.link
        if (href?.startsWith(prefix) && !href.endsWith('/') && !href.includes('#')) {
          const file = href.replace(/^\//, '').replace(/\.html$/, '').replace(/\.md$/, '') + '.md'
          if (fs.existsSync(path.resolve('docs', file)) && !config.srcExclude.includes(file)) {
            const id = '/' + file.slice(0, -3)
            found.set(id, { id, href: id, title: entry.text })
          }
        }
        if (entry.items) visit(entry.items)
      }
    }
    visit(groups)
    return [...found.values()]
  }
  const paths = config.themeConfig.nav.find(entry => entry.text === 'Learning paths').items
    .filter(entry => entry.link !== '/senior_growth/')
    .map(entry => ({
      id: entry.link, title: entry.text, href: entry.link,
      description: descriptions[entry.link], group: 'Learning paths',
      items: entry.link === '/node-js/tech-check/'
        ? [...new Map(nodeTechCheckPaths.flatMap(level => level.items).map(item => [item.id, item])).values()]
        : items(sidebar[entry.link] ?? [], entry.link)
    }))
  for (const group of sidebar['/senior_growth/']) {
    const href = group.items.find(entry => entry.link?.endsWith('/'))?.link
    if (!href) continue
    const folder = href.split('/').filter(Boolean).at(-1)
    paths.push({ id: href, title: group.text, href, group: 'Senior Growth',
      description: seniorDescriptions[folder], items: items([group], href) })
  }
  return { ...config, themeConfig: { ...config.themeConfig, learningPaths: paths } }
}
