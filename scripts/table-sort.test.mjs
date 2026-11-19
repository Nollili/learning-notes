import assert from 'node:assert/strict'
import test from 'node:test'
import { compareTableCells } from '../docs/.vitepress/lib/table-sort.mjs'

test('career proficiency follows skill order, with absent cells last in both directions', () => {
  const cells = ['Advanced', '—', 'Novice', 'Intermediate', '']
  assert.deepEqual([...cells].sort((a, b) => compareTableCells(a, b, 'proficiency')),
    ['Novice', 'Intermediate', 'Advanced', '—', ''])
  assert.deepEqual([...cells].sort((a, b) => compareTableCells(a, b, 'proficiency', 'descending')),
    ['Advanced', 'Intermediate', 'Novice', '—', ''])
})

test('star groups sort by numeric levels regardless of Related prefix', () => {
  const star = String.fromCodePoint(0x2b50)
  const groups = [`Related ${star.repeat(5)}`, `${star}, ${star.repeat(4)}`, star.repeat(2), `${star}, ${star.repeat(2)}`]
  assert.deepEqual([...groups].sort((a, b) => compareTableCells(a, b, 'stars')),
    [groups[3], groups[1], groups[2], groups[0]])
  assert.equal(compareTableCells(star, `Related ${star}`, 'stars'), 0)
})

test('text sorting is case insensitive, natural for IDs, and reversible', () => {
  assert(compareTableCells('R2', 'R10') < 0)
  assert.equal(compareTableCells('Node.js', 'node.js'), 0)
  assert(compareTableCells('Alpha', 'Beta', 'text', 'descending') > 0)
})
