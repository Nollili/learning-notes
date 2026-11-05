import assert from 'node:assert/strict'
import test from 'node:test'
import path from 'node:path'
import { createMarkdownRenderer } from 'vitepress'
import config from '../docs/.vitepress/config.mjs'
import { isRepositoryOnlyLink, repositoryOnlyPages, visibleInline } from '../docs/.vitepress/publication-policy.mjs'

const renderer = await createMarkdownRenderer(path.resolve('docs'), { ...config.markdown, headers: true })

test('author pages are excluded while learning and practice remain published', () => {
  for (const file of repositoryOnlyPages) assert(config.srcExclude.includes(file), file)
  assert(isRepositoryOnlyLink('./progress.md#batch', 'node-js/tech-check/index.md'))
  assert(isRepositoryOnlyLink('http://localhost:5173/node-js/tech-check/progress.html'))
  assert(!isRepositoryOnlyLink('/learner-guide/progress'))
  assert(!isRepositoryOnlyLink('/aws/coverage-and-sources'))
  assert(!isRepositoryOnlyLink('/engineering/CODE_REVIEW.md'))
  assert(isRepositoryOnlyLink('../REVIEW_PROGRESS.md'))
  assert(!isRepositoryOnlyLink('/node-js/tech-check/progressive-projects'))
  assert(!isRepositoryOnlyLink('/ai-assisted-engineering/verification-and-permissions'))
  assert(!isRepositoryOnlyLink('https://example.com/review/'))
})

test('all configured navigation and sidebars omit author-only destinations', () => {
  function visit(items) {
    for (const item of items) {
      assert(!isRepositoryOnlyLink(item.link), item.link)
      if (item.items) { assert(item.items.length); visit(item.items) }
    }
  }
  visit(config.themeConfig.nav)
  Object.values(config.themeConfig.sidebar).forEach(visit)
})

test('rendering removes tracker references without deleting code or useful neighboring links', async () => {
  const source = '# Lesson\n\n[Workbench](../workbench/). [Author record](./verification.md) lists changes. [Practice](../practice/) is independent.\n\n```md\n[Author record](./verification.md)\n```\n\n| Link | Purpose |\n|---|---|\n| [Author record](./verification.md) | generation bookkeeping |\n| [Practice](../practice/) | your exercise |'
  const html = await renderer.renderAsync(source, { path: path.resolve('docs/frontend/example.md') })
  assert.match(html, /href="(?:\.\/)?\.\.\/workbench\//)
  assert.match(html, /href="(?:\.\/)?\.\.\/practice\//)
  assert.doesNotMatch(html, /href="\.\/verification/)
  assert.doesNotMatch(html, /generation bookkeeping|lists changes/)
  assert.match(html, /your exercise/)
  assert.match(html, /Author record/) // literal fenced teaching example survives
  assert.equal(visibleInline('[Coverage](./coverage-map.md) · [Practice](../practice/)', 'frontend/index.md'), '[Practice](../practice/)')
})

test('direct author-page rendering reveals no tracker contents', async () => {
  const html = await renderer.renderAsync('# Private author tracker\n\nGeneration checkpoint details', {
    path: path.resolve('docs/node-js/tech-check/progress.md')
  })
  assert.match(html, /Page not found/)
  assert.doesNotMatch(html, /Private author tracker|Generation checkpoint/)
})

test('hidden catalogue items leave no empty bullets or author-only homepage sections', async () => {
  const html = await renderer.renderAsync('# Home\n\n## Complete hub inventory\n\nAuthor counts and batch metadata.\n\n## Study\n\n- [Record](./verification.md)\n- [Practice](../practice/)\n', {
    path: path.resolve('docs/frontend/index.md')
  })
  assert.doesNotMatch(html, /Author counts|Complete hub inventory|<li>\s*<\/li>/)
  assert.match(html, /Practice/)
})

test('development requests block author routes and retain ordinary lessons', async () => {
  const { repositoryOnlyDevGuard } = await import('../docs/.vitepress/publication-policy.mjs')
  let middleware
  repositoryOnlyDevGuard().configureServer({ middlewares: { use(fn) { middleware = fn } } })
  for (const url of ['/node-js/tech-check/progress.html', '/frontend/verification.md?t=1', '/review/']) {
    const response = { setHeader() {}, end(value) { this.body = value } }
    middleware({ url }, response, () => assert.fail('author route passed through'))
    assert.equal(response.statusCode, 404)
    assert.match(response.body, /Page not found/)
  }
  let passed = false
  middleware({ url: '/learner-guide/progress.html' }, {}, () => { passed = true })
  assert(passed)
})
