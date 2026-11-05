import { ref, onMounted, onUnmounted } from 'vue'
const key = 'learning-hub-completion-v1'
const completed = ref({})
const warning = ref('')
export function useProgress() {
  const ready = ref(false)
  function restore(event) {
    if (event?.type === 'storage' && event.key !== key && event.key !== null) return
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}')
      completed.value = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
    } catch { warning.value = 'Progress cannot be restored. You can keep learning.' }
  }
  onMounted(() => {
    restore(); ready.value = true
    window.addEventListener('storage', restore)
    window.addEventListener('learning-progress-changed', restore)
  })
  onUnmounted(() => {
    window.removeEventListener('storage', restore)
    window.removeEventListener('learning-progress-changed', restore)
  })
  function update(ids, value) {
    const records = { ...completed.value }
    for (const id of ids) { if (value) records[id] = true; else delete records[id] }
    completed.value = records
    try {
      localStorage.setItem(key, JSON.stringify(records))
      warning.value = ''
      window.dispatchEvent(new Event('learning-progress-changed'))
    } catch { warning.value = 'Progress cannot be saved. Your selections last for this visit only.' }
  }
  return { completed, warning, ready, update }
}
