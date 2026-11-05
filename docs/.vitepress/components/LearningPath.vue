<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { nodeTechCheckPaths } from '../data/node-tech-check.mjs'
const props = defineProps({ pathId: { type: String, required: true } })
const path = computed(() => nodeTechCheckPaths.find(path => path.id === props.pathId))
const key = 'learning-hub-completion-v1'
const completed = ref({})
const ready = ref(false)
const warning = ref('')
const feedback = ref('')
const confirming = ref(false)
const count = computed(() => path.value.items.filter(item => completed.value[item.id]).length)
const next = computed(() => path.value.items.find(item => !completed.value[item.id]))
const shared = computed(() => nodeTechCheckPaths.filter(other => other.id !== props.pathId && other.items.some(item => path.value.items.some(own => own.id === item.id))))
function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}')
    completed.value = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
  } catch { warning.value = 'Progress cannot be restored. You can keep learning and use checkboxes for this visit.' }
}
function sync(event) { if (!event || event.key === key || event.key === null) restore() }
onMounted(() => {
  restore()
  ready.value = true
  window.addEventListener('storage', sync)
  window.addEventListener('learning-progress-changed', sync)
})
onUnmounted(() => {
  window.removeEventListener('storage', sync)
  window.removeEventListener('learning-progress-changed', sync)
})
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(completed.value))
    window.dispatchEvent(new Event('learning-progress-changed'))
  } catch { warning.value = 'Progress cannot be saved. Your selections last for this visit only. You can keep learning.' }
}
function toggle(item, value) {
  completed.value = { ...completed.value, [item.id]: value }
  save()
  feedback.value = `${item.title}: ${value ? 'completed' : 'unfinished'}.`
}
function reset() {
  const records = { ...completed.value }
  for (const item of path.value.items) delete records[item.id]
  completed.value = records
  save()
  confirming.value = false
  feedback.value = `${path.value.title} progress reset.`
}
</script>

<template>
  <section v-if="path" class="learning-path" :aria-label="`${path.title} study sequence`">
    <template v-if="ready">
      <p>{{ count }} of {{ path.items.length }} completed · {{ Math.round(count / path.items.length * 100) }}%</p>
      <progress :value="count" :max="path.items.length" :aria-label="`${path.title}: ${count} of ${path.items.length} completed`" />
      <p v-if="next"><a :href="withBase(next.href)">{{ count ? 'Continue learning' : 'Start learning' }}: {{ next.title }}</a></p>
      <p v-else>All items completed. Revisit any topic below or continue to the next level.</p>
    </template>
    <ol>
      <li v-for="item in path.items" :key="item.id">
        <span class="learning-path__type">{{ item.type }}</span>
        <div class="learning-path__item">
          <input v-if="ready" type="checkbox" :aria-label="`Completed: ${item.title}`" :checked="completed[item.id] === true" @change="toggle(item, $event.target.checked)">
          <a :href="withBase(item.href)">{{ item.title }}</a>
        </div>
      </li>
    </ol>
    <template v-if="ready">
      <button v-if="!confirming" type="button" @click="confirming = true">Reset progress</button>
      <div v-else class="learning-path__reset">
        <p>Reset all {{ path.items.length }} items in {{ path.title }}? Other completion records will stay unchanged.</p>
        <p v-if="shared.length">Shared items also update these paths: {{ shared.map(path => path.title).join(', ') }}.</p>
        <button type="button" @click="reset">Confirm reset</button>
        <button type="button" @click="confirming = false">Cancel</button>
      </div>
      <p role="status" class="learning-path__type">{{ warning || feedback }}</p>
    </template>
  </section>
</template>
