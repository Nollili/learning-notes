import fs from 'node:fs'
import path from 'node:path'
import { cleanTitle } from '../content-policy.mjs'
import { nodeTechCheckPaths } from './node-tech-check.mjs'

export const techCheckRoute = '/node-js/tech-check/'
const projectPage = techCheckRoute + 'progressive-projects'
const practiceLevels = new Map([
  ['b08-practice--learner-work-remains-required', 1],
  ['b10-practice--learner-work-remains-required', 2],
  ['b12-practice--learner-work-remains-required', 1],
  ['b13-practice--learner-work-remains-required', 1],
  ['b15-practice--learner-work-remains-required', 2],
  ['small-batch-learner-practice', 2],
  ['one-question-learner-exercise', 3],
  ['learner-exercise', 3]
])

function collectTasks(page, source) {
  const tasks = []
  let projectLevel
  for (const match of source.matchAll(/^(#{2,3}) (.+) \{#([^}\s]+)\}\r?\n(?:\r?\n(?:\*Study depth: [^\n]+\r?\n\r?\n)?Level Up: L[1-4]\\\r?\nTech Check level: (\u2B50{1,5})$)?/gmu)) {
    const [, heading, title, anchor, stars] = match
    if (page === projectPage && heading === '##') {
      projectLevel = stars?.length
      continue
    }
    const level = page === projectPage && /^(Increment [1-4] — |Project [1-5] release check$)/.test(title)
      ? projectLevel
      : stars?.length ?? practiceLevels.get(anchor)
    if (!level) continue
    const href = `${page}#${anchor}`
    tasks.push({ id: href, href, title: cleanTitle(title), level })
  }
  return tasks
}

const lessonPages = [...new Set(nodeTechCheckPaths.flatMap(path => path.items.map(item => item.href.split('#')[0])))]
const patternPages = fs.readdirSync('docs' + techCheckRoute + 'patterns')
  .filter(file => file.endsWith('.md'))
  .map(file => techCheckRoute + 'patterns/' + file.slice(0, -3))
const tasksByPage = new Map([...lessonPages, ...patternPages].map(page => [
  page, collectTasks(page, fs.readFileSync(`docs${page}.md`, 'utf8'))
]))

export const techCheckLevels = nodeTechCheckPaths.map((path, index) => ({
  ...path,
  tasks: [...tasksByPage.values()].flat().filter(task => task.level === index + 1)
}))

export function techCheckCompletionPlugin(md) {
  md.core.ruler.after('anchor', 'tech-check-completion', state => {
    const file = (state.env.relativePath || state.env.path || '').split(path.sep).join('/')
    const start = file.indexOf(techCheckRoute.slice(1))
    if (start < 0) return
    const tasks = tasksByPage.get('/' + file.slice(start).replace(/\.md$/, ''))
    if (!tasks?.length) return

    const tasksByAnchor = new Map(tasks.map(task => [task.href.split('#')[1], task]))
    state.tokens = state.tokens.flatMap((token, index, tokens) => {
      if (token.type !== 'heading_close') return [token]
      const task = tasksByAnchor.get(tokens[index - 2]?.attrGet('id'))
      if (!task) return [token]
      const control = new state.Token('html_block', '', 0)
      control.content = `<TechCheckCompletion item-id="${md.utils.escapeHtml(task.id)}" title="${md.utils.escapeHtml(task.title)}" />\n`
      return [token, control]
    })
  })
}
