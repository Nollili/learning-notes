<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { compareTableCells } from '../lib/table-sort.mjs'

const props = defineProps({
  label: { type: String, required: true },
  columnTypes: { type: Array, default: () => [] }
})
const region = ref(null)
const status = ref(null)
const cleanup = []

// Enhance the server-rendered Markdown table after hydration. Sorting moves the
// existing rows, preserving their source anchors and the no-JavaScript table.
onMounted(() => {
  const table = region.value.querySelector('table')
  const body = table?.tBodies[0]
  if (!body || !table.tHead) return
  const rows = [...body.rows].map((element, index) => ({
    element, index, cells: [...element.cells].map(cell => cell.textContent)
  }))
  let activeColumn = -1
  let direction = 'ascending'
  const headers = [...table.tHead.rows[0].cells].map((cell, index) => {
    const title = cell.textContent.trim()
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'notes-table-sort'
    button.append(...cell.childNodes)
    const indicator = document.createElement('span')
    indicator.setAttribute('aria-hidden', 'true')
    button.append(indicator)
    cell.append(button)
    cell.scope = 'col'
    const sort = () => {
      direction = activeColumn === index && direction === 'ascending' ? 'descending' : 'ascending'
      activeColumn = index
      const ordered = [...rows].sort((a, b) =>
        compareTableCells(a.cells[index], b.cells[index], props.columnTypes[index], direction) || a.index - b.index)
      body.append(...ordered.map(row => row.element))
      updateHeaders()
      status.value.textContent = `Sorted by ${title}, ${direction}.`
    }
    button.addEventListener('click', sort)
    cleanup.push(() => button.removeEventListener('click', sort))
    return { cell, button, indicator, title }
  })
  function updateHeaders() {
    headers.forEach(({ cell, button, indicator, title }, index) => {
      const active = index === activeColumn
      cell.setAttribute('aria-sort', active ? direction : 'none')
      const next = active && direction === 'ascending' ? 'descending' : 'ascending'
      button.setAttribute('aria-label', `${title}: sort ${next}`)
      indicator.textContent = active ? direction === 'ascending' ? ' \u2191' : ' \u2193' : ' \u2191\u2193'
    })
  }
  updateHeaders()
})
onBeforeUnmount(() => cleanup.forEach(remove => remove()))
</script>

<template>
  <div ref="region" class="notes-table-scroll" role="region" :aria-label="label" tabindex="0">
    <slot />
    <p ref="status" class="notes-table-sort-status" role="status" aria-live="polite" />
  </div>
</template>
