import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import config from '../docs/.vitepress/config.mjs'
import { createMarkdownRenderer } from 'vitepress'

const paths = config.themeConfig.learningPaths

test('every advertised path and Senior Growth topic has trackable content', () => {
  const advertised = config.themeConfig.nav.find(entry => entry.text === 'Learning paths').items
  for (const entry of advertised.filter(entry => entry.link !== '/senior_growth/')) {
    assert(paths.some(path => path.href === entry.link), entry.text)
  }
  assert.equal(paths.filter(path => path.group === 'Senior Growth').length, config.themeConfig.sidebar['/senior_growth/'].length)
  assert.equal(new Set(paths.map(path => path.id)).size, paths.length)
  for (const path of paths) {
    assert(path.description?.length > 20, path.title)
    assert(path.items.length > 0, path.title)
    assert.equal(new Set(path.items.map(item => item.id)).size, path.items.length)
    for (const item of path.items) {
      const file = item.href.split('#')[0].replace(/^\//, '') + '.md'
      assert(fs.existsSync('docs/' + file), item.href)
      assert(!config.srcExclude.includes(file), item.href)
    }
  }
})

test('Tech Check totals count each under-heading completion control once', async () => {
  const path = paths.find(path => path.href === '/node-js/tech-check/')
  const levels = config.themeConfig.techCheckLevels
  const tasks = levels.flatMap(level => level.tasks)
  assert.deepEqual(path.items, tasks)
  assert.equal(new Set(tasks.map(task => task.id)).size, tasks.length)
  assert.equal(tasks.filter(task => task.href.includes('/progressive-projects#')).length, 25)
  const markdown = await createMarkdownRenderer('docs', config.markdown)
  const byPage = new Map()
  for (const task of tasks) {
    const [page] = task.href.split('#')
    if (!byPage.has(page)) byPage.set(page, [])
    byPage.get(page).push(task)
  }
  for (const [page, pageTasks] of byPage) {
    const file = `docs${page}.md`
    const source = fs.readFileSync(file, 'utf8')
    const html = await markdown.renderAsync(source, { path: file })
    assert.doesNotMatch(html, /\{#t\d+-q\d+\}/, file)
    assert.equal((html.match(/<\/h[23]>\s*<TechCheckCompletion /g) ?? []).length, pageTasks.length, file)
    for (const task of pageTasks) assert.ok(html.includes(`item-id="${task.id}"`), task.href)
    for (const [, anchor] of source.matchAll(/^<!-- tech-check: (t\d+-q\d+); level: [1-5] -->$/gm)) {
      assert.ok(pageTasks.some(task => task.href === `${page}#${anchor}`), anchor)
    }
  }
  const course = paths.find(path => path.href === '/node-js/')
  assert(course.items.every(item => !item.href.startsWith('/node-js/tech-check/')))
})
