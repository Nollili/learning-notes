<template>
  <figure
    ref="container"
    class="mermaid-diagram"
    :aria-busy="isRendering"
    tabindex="0"
    aria-label="Diagram. Scroll horizontally if it does not fit."
  >
    <figcaption v-if="svg && diagramWidth > containerWidth" class="mermaid-diagram__controls">
      <button type="button" :aria-pressed="actualSize" @click="actualSize = !actualSize">
        {{ actualSize ? 'Fit to page' : 'Actual size' }}
      </button>
      <span v-if="actualSize">Scroll horizontally to see the full diagram.</span>
    </figcaption>
    <div
      v-if="svg"
      class="mermaid-diagram__canvas"
      :class="{ 'is-actual-size': actualSize }"
      :style="{ '--diagram-width': `${diagramWidth}px` }"
      v-html="svg"
    />

    <div v-else-if="error" class="mermaid-diagram__error">
      <strong>Diagram could not be rendered.</strong>
      <pre><code>{{ source }}</code></pre>
    </div>

    <div v-else class="mermaid-diagram__placeholder" aria-hidden="true" />
  </figure>
</template>

<script>
let nextDiagramId = 0
</script>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  encodedSource: {
    type: String,
    required: true
  }
})

const source = computed(() => decodeURIComponent(props.encodedSource))
const svg = ref('')
const diagramWidth = ref(0)
const container = ref(null)
const containerWidth = ref(Infinity)
const actualSize = ref(false)
const error = ref(null)
const isRendering = ref(true)
const { isDark } = useData()

let renderSequence = 0
const diagramInstanceId = ++nextDiagramId
let resizeObserver

async function renderDiagram() {
  const currentRender = ++renderSequence
  isRendering.value = true
  error.value = null

  try {
    const { default: mermaid } = await import('mermaid')

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark.value ? 'dark' : 'default',
      securityLevel: 'strict',
      flowchart: {
        htmlLabels: true,
        useMaxWidth: true
      }
    })

    const diagramId = `mermaid-diagram-${diagramInstanceId}-${currentRender}`
    const result = await mermaid.render(diagramId, source.value)

    if (currentRender === renderSequence) {
      // Preserve the layout's native width so labels remain readable on small screens.
      // Mermaid's HTML labels may contain HTML-only entities, so parse as HTML.
      const document = new DOMParser().parseFromString(result.svg, 'text/html')
      diagramWidth.value = Number(document.querySelector('svg')?.getAttribute('viewBox')?.split(/\s+/)[2]) || 640
      svg.value = result.svg
    }
  } catch (renderError) {
    if (currentRender === renderSequence) {
      svg.value = ''
      error.value = renderError
      console.error('Mermaid rendering failed:', renderError)
    }
  } finally {
    if (currentRender === renderSequence) {
      isRendering.value = false
    }
  }
}

onMounted(() => {
  resizeObserver = new ResizeObserver(([entry]) => {
    containerWidth.value = entry.contentRect.width
  })
  resizeObserver.observe(container.value)
  watch([source, isDark], renderDiagram, { immediate: true })
})

onBeforeUnmount(() => resizeObserver?.disconnect())
</script>
