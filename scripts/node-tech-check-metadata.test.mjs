import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { collectTasks, techCheckLevels } from '../docs/.vitepress/data/tech-check-completion.mjs'

const root = 'docs/node-js/tech-check'
const snapshot = JSON.parse(fs.readFileSync('docs/.vitepress/data/node-tech-check-requirements.json', 'utf8'))
const requirements = new Map(snapshot.requirements.map(row => [row.id, row]))
const reference = fs.readFileSync(`${root}/requirements.md`, 'utf8')
const questions = []
for (const folder of [root, `${root}/patterns`]) {
  for (const file of fs.readdirSync(folder).filter(name => name.endsWith('.md'))) {
    if (['js-tech-check.md', 'react-tech-check.md', 'progress.md', 'coverage.md'].includes(file)) continue
    const filename = path.join(folder, file)
    const source = fs.readFileSync(filename, 'utf8')
    assert.doesNotMatch(source, /^#{2,3} [^\n]+ \{#t\d+-q\d+\}/m, filename)
    const headings = [...source.matchAll(/^<!-- tech-check: (t\d+-q\d+); level: ([1-5]) -->\n\n#{2,3} [^\n]+$/gm)]
    for (const [index, heading] of headings.entries()) {
      questions.push({ filename, id: heading[1], body: source.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? source.length) })
    }
  }
}

test('the published reference retains all source rows and four career cells', () => {
  assert.equal(requirements.size, 193)
  assert.match(snapshot.sha256, /^[a-f0-9]{64}$/)
  for (const row of requirements.values()) {
    assert.equal(row.proficiency.length, 4, row.id)
    assert(row.proficiency.every(cell => ['—', 'Novice', 'Intermediate', 'Advanced'].includes(cell)), row.id)
    const levels = row.levels.map(level => '⭐'.repeat(level)).join(', ')
    const expected = `| <span id="${row.id.toLowerCase()}"></span>${row.id} | ${[row.topic, row.requirement, row.chart, ...row.proficiency, levels].join(' | ')} |`
    assert(reference.includes(expected), row.id)
  }
  assert.deepEqual(requirements.get('R069').proficiency, ['—', '—', '—', 'Advanced'])
  assert.deepEqual(requirements.get('R136').proficiency, ['—', 'Intermediate', 'Intermediate', 'Intermediate'])
})

test('every question has one career target, hidden ID and supported source mappings', () => {
  assert.equal(questions.length, 233)
  const cited = new Set()
  for (const { filename, id, body } of questions) {
    const label = `${filename}#${id}`
    assert.match(body, /^\n\n\*Study depth: .+\*\n/, label)
    assert.match(body, /^Level Up: (?:L1 — Junior|L2 — Software Engineer|L3 — Senior|L4 — Lead)\\$/m, label)
    assert.doesNotMatch(body, /^Study audience:|^Learning path level:/m, label)
    const links = body.match(/^Source mapping: (.+)$/m)?.[1]
    assert(links, label)
    const ids = [...links.matchAll(/\[(R\d{3})\]\(([^)]+)\)/g)]
    assert(ids.length, label)
    const rows = ids.map(([, rid, href]) => {
      cited.add(rid)
      assert(requirements.has(rid), `${label}: ${rid}`)
      assert.equal(href.split('#')[1], rid.toLowerCase(), label)
      assert.equal(path.resolve(path.dirname(filename), href.split('#')[0]), path.resolve(root, 'requirements.md'), label)
      return requirements.get(rid)
    })
    const stars = body.match(/^Tech Check level: (.+)$/m)?.[1]
    assert(stars, label)
    const allowed = rows.flatMap(row => row.levels)
    for (const group of stars.split(', ')) {
      assert.match(group, /^⭐{1,5}$/u, label)
      assert(allowed.includes(group.length), `${label}: unsupported level ${group.length}`)
    }
  }
  assert.equal(cited.size, 193, 'Every supplied source row remains traceable from a lesson')
})

test('hidden curriculum placement is independent of the visible career target and source stars', () => {
  const sample = `<!-- tech-check: t06-q01; level: 2 -->\n\n### Emitter\n\n*Study depth: Intermediate*\n\nLevel Up: L3 — Senior\\\nTech Check level: ⭐, ⭐⭐\n`
  const original = collectTasks('/node-js/tech-check/events', sample)
  const revised = collectTasks('/node-js/tech-check/events', sample.replace('⭐, ⭐⭐', '⭐⭐⭐⭐').replace('L3 — Senior', 'L1 — Junior'))
  assert.deepEqual(revised, original)
  assert.equal(original[0].level, 2)
  assert.equal(original[0].href, '/node-js/tech-check/events#t06-q01')
  const tasks = techCheckLevels.flatMap(level => level.tasks)
  assert.equal(tasks.length, 266)
  assert.equal(tasks.find(task => task.href.endsWith('06-events-and-event-loop#t06-q01')).level, 2)
  assert.equal(tasks.find(task => task.href.endsWith('09-concurrency#t09-q05')).level, 3)
  assert.equal(tasks.filter(task => task.href.includes('16-framework-alternatives#')).length, 4)
})
