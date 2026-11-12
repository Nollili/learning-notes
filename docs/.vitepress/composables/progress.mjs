import { ref, onMounted, onUnmounted } from 'vue'

const key = 'learning-hub-completion-v1'
const completed = ref({})
const warning = ref('')
const ready = ref(false)
let subscribers = 0
let hasUnsavedChanges = false

function restore(event) {
  if (event && event.key !== key && event.key !== null) return
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}')
    completed.value = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
    hasUnsavedChanges = false
    warning.value = ''
  } catch {
    warning.value = 'Progress cannot be restored. You can keep learning.'
  }
}

export function useProgress() {
  onMounted(() => {
    if (subscribers++ !== 0) return
    if (!hasUnsavedChanges) restore()
    ready.value = true
    window.addEventListener('storage', restore)
  })
  onUnmounted(() => {
    if (--subscribers === 0) window.removeEventListener('storage', restore)
  })

  function update(ids, value) {
    const records = { ...completed.value }
    for (const id of ids) {
      if (value) records[id] = true
      else delete records[id]
    }
    completed.value = records
    try {
      localStorage.setItem(key, JSON.stringify(records))
      hasUnsavedChanges = false
      warning.value = ''
    } catch {
      hasUnsavedChanges = true
      warning.value = 'Progress cannot be saved. Your selections last for this visit only.'
    }
  }
  return { completed, warning, ready, update }
}
