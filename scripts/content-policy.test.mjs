import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { createMarkdownRenderer } from 'vitepress'
import config from '../docs/.vitepress/config.mjs'
import { cleanTitle, getPageTitle, hasEmoji } from '../docs/.vitepress/content-policy.mjs'

const docs = path.resolve('docs')
const markdown = await createMarkdownRenderer(docs, { ...config.markdown, headers: true })

test('section numbers match the outline and retain stable fragments', async () => {
  const env = { path: path.join(docs, 'policy-example.md') }
  const html = await markdown.renderAsync([
    '# Example', '', '## **9. Topic** {#saved-topic}', '',
    '### Child', '', '#### Grandchild', '', '## Next topic', '',
    '```js', '// ## 9. Code remains code', '```'
  ].join('\n'), env)
  assert.match(html, /id="saved-topic"[^>]*><span class="hub-section-number">1 <\/span><strong>Topic<\/strong>/)
  assert.match(html, />1\.1 <\/span>Child /)
  assert.match(html, />1\.1\.1 <\/span>Grandchild /)
  assert.match(html, />2 <\/span>Next topic /)
  assert.match(html, /## 9\. Code remains code/)
  assert.equal(env.headers[0].title, '1 Topic')
  assert.equal(env.headers[0].link, '#saved-topic')
  assert.equal(env.headers[0].children[0].title, '1.1 Child')
  const second = await markdown.renderAsync('# Another page\n\n### First section', { path: env.path })
  assert.match(second, />1 <\/span>First section /)
  assert.doesNotMatch(second, />0\./)
})

test('legacy icon fragments still resolve without visible icons or emoji conversion', async () => {
  const env = { path: path.join(docs, 'legacy-example.md') }
  const legacy = '\u{1f511}-concepts'
  const html = await markdown.renderAsync(`# Example\n\n## Concepts {#${encodeURIComponent(legacy)}}\n\n:smile:`, env)
  assert.ok(html.includes(`id="${legacy}"`))
  assert.equal(env.headers[0].title, '1 Concepts')
  assert.match(html, /:smile:/)
  assert.equal(hasEmoji(html.replace(/<[^>]*>/g, '')), false)
})

test('catalogues recover titles without damaging technical identifiers or versions', () => {
  assert.equal(cleanTitle('General_ES6'), 'JavaScript and ECMAScript')
  assert.equal(cleanTitle('Complete_title_177e8106c24d808aa357dc7c02c8c467.md'), 'Complete title')
  assert.equal(cleanTitle('HTTP/2 and ES2024'), 'HTTP/2 and ES2024')
  assert.equal(cleanTitle('Using `child_process`'), 'Using child_process')
  assert.equal(getPageTitle('---\ntitle: Metadata\n---\n```py\n# Not a title\n```\n### Complete title'), 'Complete title')
})

test('hub sources and Senior Growth titles stay free of export debris and emojis', () => {
  let pages = 0
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (['cache', 'node_modules', '.git'].includes(entry.name)) continue
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) visit(file)
      else if (/\.(md|mjs|vue|css|js|ts|json|html|svg|txt)$/.test(entry.name)) {
        const source = fs.readFileSync(file, 'utf8')
        assert.equal(hasEmoji(source), false, `Emoji in ${file}`)
        if (file.endsWith('.md')) {
          const tokens = markdown.parse(source, { path: file })
          for (let index = 0; index < tokens.length; index++) {
            if (tokens[index].type !== 'heading_open') continue
            const prose = tokens[index + 1].children.filter(token => token.type === 'text').map(token => token.content).join('').trim()
            assert.doesNotMatch(prose, /_|[a-f0-9]{32}|\.md$/i, `Exported heading: ${file}`)
          }
        }
        if (file.includes(`${path.sep}senior_growth${path.sep}`) && file.endsWith('.md')) {
          const title = getPageTitle(source)
          assert.ok(title, `Missing title: ${file}`)
          assert.doesNotMatch(title, /_|[a-f0-9]{32}|\.md$/i, file)
          assert.match(source, /^# [^\n]+/m, file)
          pages++
        }
      }
    }
  }
  visit(docs)
  assert.ok(pages > 200)
  for (const file of fs.readdirSync('.').filter(name => name.endsWith('.md'))) {
    assert.equal(hasEmoji(fs.readFileSync(file, 'utf8')), false, `Emoji in ${file}`)
  }
  function inspect(items) {
    for (const item of items) {
      if (item.text) {
        assert.equal(hasEmoji(item.text), false)
        assert.doesNotMatch(item.text, /^\d+\.|[a-f0-9]{32}|\.md$/i)
      }
      if (item.items) inspect(item.items)
    }
  }
  for (const items of Object.values(config.themeConfig.sidebar)) inspect(items)
  const senior = config.themeConfig.sidebar['/senior_growth/']
  assert.ok(senior.some(group => group.text === 'JavaScript and ECMAScript'))
  assert.ok(senior.some(group => group.text === 'Continuous integration and delivery'))
  assert.doesNotMatch(fs.readFileSync(path.join(docs, 'senior_growth/index.md'), 'utf8'), /\[[^\]]*_[^\]]*\]\(/)
})
