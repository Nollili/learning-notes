<script setup>
import { useProgress } from '../composables/progress.mjs'

defineProps({
  itemId: { type: String, required: true },
  title: { type: String, required: true }
})
const { completed, ready, update } = useProgress()
</script>

<template>
  <label class="tech-check-completion">
    <input type="checkbox" :aria-label="`Completed: ${title}`" :disabled="!ready"
      :checked="completed[itemId] === true" @change="update([itemId], $event.target.checked)">
    Completed
  </label>
</template>
