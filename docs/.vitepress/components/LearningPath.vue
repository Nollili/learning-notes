<script setup>
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { useProgress } from '../composables/progress.mjs'

const props = defineProps({ pathId: { type: String, required: true } })
const { theme } = useData()
const { completed, ready, warning, update } = useProgress()
const path = computed(() => theme.value.techCheckLevels.find(level => level.id === props.pathId))
const count = computed(() => path.value.tasks.filter(task => completed.value[task.id] === true).length)
const next = computed(() => path.value.tasks.find(task => completed.value[task.id] !== true))
const confirming = ref(false)
const feedback = ref('')

function reset() {
  update(path.value.tasks.map(task => task.id), false)
  confirming.value = false
  feedback.value = `${path.value.title} progress reset.`
}
</script>

<template>
  <section v-if="path" class="learning-path" :aria-label="`${path.title} study sequence`">
    <template v-if="ready">
      <p>{{ count }} of {{ path.tasks.length }} completed · {{ Math.round(count / path.tasks.length * 100) }}%</p>
      <progress :value="count" :max="path.tasks.length" :aria-label="`${path.title}: ${count} of ${path.tasks.length} completed`" />
      <p v-if="next"><a :href="withBase(next.href)">{{ count ? 'Continue learning' : 'Start learning' }}: {{ next.title }}</a></p>
      <p v-else>All items completed. Revisit any topic below or continue to the next level.</p>
    </template>
    <ol>
      <li v-for="item in path.items" :key="item.id">
        <span class="learning-path__type">{{ item.type }}</span>
        <a :href="withBase(item.href)">{{ item.title }}</a>
      </li>
    </ol>
    <template v-if="ready">
      <button v-if="!confirming" type="button" @click="confirming = true">Reset progress</button>
      <div v-else class="learning-path__reset">
        <p>Reset all {{ path.tasks.length }} items in {{ path.title }}? Other completion records will stay unchanged.</p>
        <button type="button" @click="reset">Confirm reset</button>
        <button type="button" @click="confirming = false">Cancel</button>
      </div>
      <p role="status" class="learning-path__type">{{ warning || feedback }}</p>
    </template>
  </section>
</template>
