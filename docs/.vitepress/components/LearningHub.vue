<script setup>
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { useProgress } from '../composables/progress.mjs'
const { theme } = useData()
const { completed, ready, warning, update } = useProgress()
const confirming = ref('')
const feedback = ref('')
const groups = computed(() => ['Learning paths', 'Senior Growth'].map(title => ({ title, paths: theme.value.learningPaths.filter(path => path.group === title) })))
const count = path => path.items.filter(item => completed.value[item.id] === true).length
const next = path => path.items.find(item => completed.value[item.id] !== true)
const percent = path => path.items.length ? Math.round(count(path) / path.items.length * 100) : 0
function shared(path) {
  return theme.value.learningPaths.filter(other => other.id !== path.id && other.items.some(item => path.items.some(own => own.id === item.id))).map(other => other.title).join(', ')
}
function reset(path) {
  update(path.items.map(item => item.id), false)
  confirming.value = ''
  feedback.value = `${path.title} progress reset.`
}
</script>

<template>
  <div class="learning-hub">
    <header class="learning-hub__intro">
      <h1>What will you learn next?</h1>
      <p>Choose a path, build your understanding and keep track of what you’ve studied.</p>
    </header>
    <section v-for="group in groups" :key="group.title" :aria-label="group.title" class="learning-hub__group">
      <h2>{{ group.title }}</h2>
      <div class="learning-hub__grid">
        <article v-for="path in group.paths" :key="path.id" class="path-card">
          <h3><a :href="withBase(path.href)">{{ path.title }}</a></h3>
          <p class="path-card__description">{{ path.description }}</p>
          <template v-if="ready">
            <p class="path-card__count">{{ count(path) }} of {{ path.items.length }} completed · {{ percent(path) }}%</p>
            <progress :value="count(path)" :max="path.items.length || 1" :aria-label="`${path.title}: ${count(path)} of ${path.items.length} completed`" />
          </template>
          <p v-else class="path-card__count">Loading saved progress…</p>
          <a class="path-card__action" :href="withBase(ready && count(path) && next(path) ? next(path).href : path.href)">{{ ready && path.items.length && count(path) === path.items.length ? 'Review learning' : ready && count(path) ? 'Continue learning' : 'Start learning' }} <span aria-hidden="true">→</span></a>
          <button v-if="ready && count(path) && confirming !== path.id" class="path-card__reset" type="button" :aria-label="`Reset progress: ${path.title}`" @click="confirming = path.id">Reset progress</button>
          <div v-if="confirming === path.id" class="path-card__confirmation">
            <p>Reset all {{ path.items.length }} items in {{ path.title }}? Unrelated progress stays saved.</p>
            <p v-if="shared(path)">Shared items will also update: {{ shared(path) }}.</p>
            <button type="button" @click="reset(path)">Confirm reset</button>
            <button type="button" @click="confirming = ''">Cancel</button>
          </div>
        </article>
      </div>
    </section>
    <p role="status">{{ warning || feedback }}</p>
  </div>
</template>
