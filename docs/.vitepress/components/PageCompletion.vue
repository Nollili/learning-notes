<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { useProgress } from '../composables/progress.mjs'
const { page, theme } = useData()
const { completed, ready, warning, update } = useProgress()
const items = computed(() => {
  const current = '/' + page.value.relativePath.replace(/\.md$/, '').replace(/\/index$/, '/')
  return [...new Map((theme.value.learningPaths ?? []).flatMap(path => path.items)
    .filter(item => item.href.split('#')[0] === current).map(item => [item.id, item])).values()]
})
</script>
<template>
  <div v-if="ready && items.length" class="page-completion">
    <label v-for="item in items" :key="item.id">
      <input type="checkbox" :checked="completed[item.id] === true" @change="update([item.id], $event.target.checked)">
      Completed<span v-if="items.length > 1">: {{ item.title }}</span>
      <span v-else class="visually-hidden">: {{ item.title }}</span>
    </label>
    <p v-if="warning" role="status">{{ warning }}</p>
  </div>
</template>
