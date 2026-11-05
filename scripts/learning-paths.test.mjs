import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import config from '../docs/.vitepress/config.mjs'
import { nodeTechCheckPaths } from '../docs/.vitepress/data/node-tech-check.mjs'

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

test('Tech Check cards reuse existing completion IDs without counting shared items twice', () => {
  const path = paths.find(path => path.href === '/node-js/tech-check/')
  const ids = new Set(nodeTechCheckPaths.flatMap(level => level.items.map(item => item.id)))
  assert.deepEqual(new Set(path.items.map(item => item.id)), ids)
  const course = paths.find(path => path.href === '/node-js/')
  assert(course.items.every(item => !item.href.startsWith('/node-js/tech-check/')))
})
