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

// Curriculum placement is explicit: source stars may be related or span several levels.
export function collectTasks(page, source) {
  const tasks = []
  let projectLevel
  const headings = [...source.matchAll(/^(?:<!-- tech-check: (t\d+-q\d+); level: ([1-5]) -->\r?\n\r?\n)?(#{2,3}) ([^\n]+?)(?: \{#([^}\s]+)\})?\r?$/gm)]
  for (const match of headings) {
    const [, questionId, questionLevel, heading, title, legacyAnchor] = match
    const anchor = questionId ?? legacyAnchor
    if (!anchor) continue
    const projectMarker = source.slice(0, match.index).match(/<!-- tech-check-level: ([1-5]) -->\s*$/)?.[1]
    const assigned = questionLevel ?? projectMarker
    if (page === projectPage && heading === '##' && /^Project [1-5] — /.test(title)) {
      projectLevel = assigned && Number(assigned)
      continue
    }
    const level = page === projectPage && /^(Increment [1-4] — |Project [1-5] release check$)/.test(title)
      ? projectLevel
      : assigned ? Number(assigned) : practiceLevels.get(anchor)
    if (!level) continue
    const href = `${page}#${anchor}`
    tasks.push({ id: href, href, title: cleanTitle(title), level })
  }
  return tasks
}

const lessonPages = [...new Set(nodeTechCheckPaths.flatMap(path => path.items.map(item => item.href.split('#')[0])))]
const companionPages = fs.readdirSync('docs' + techCheckRoute)
  .filter(file => file.endsWith('.md') && /<!-- tech-check: t\d+-q\d+;/.test(fs.readFileSync('docs' + techCheckRoute + file, 'utf8')))
  .map(file => techCheckRoute + file.slice(0, -3))
const patternPages = fs.readdirSync('docs' + techCheckRoute + 'patterns')
  .filter(file => file.endsWith('.md'))
  .map(file => techCheckRoute + 'patterns/' + file.slice(0, -3))
const tasksByPage = new Map([...new Set([...lessonPages, ...companionPages, ...patternPages])].map(page => [
  page, collectTasks(page, fs.readFileSync(`docs${page}.md`, 'utf8'))
]))

export const techCheckLevels = nodeTechCheckPaths.map((path, index) => ({
  ...path,
  tasks: [...tasksByPage.values()].flat().filter(task => task.level === index + 1)
}))

export function techCheckCompletionPlugin(md) {
  // Source headings stay clean; hidden metadata preserves saved question URLs.
  md.core.ruler.before('anchor', 'tech-check-stable-question-ids', state => {
    for (let index = 0; index < state.tokens.length; index++) {
      const marker = state.tokens[index]
      const match = marker.type === 'html_block' && marker.content.trim().match(/^<!-- tech-check: (t\d+-q\d+); level: [1-5] -->$/)
      const heading = state.tokens[index + 1]
      if (match && heading?.type === 'heading_open') heading.attrSet('id', match[1])
    }
  })
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
