import { h } from 'vue'
import LearningHub from '../components/LearningHub.vue'
import PageCompletion from '../components/PageCompletion.vue'
import DefaultTheme from 'vitepress/theme'
import MermaidDiagram from '../components/MermaidDiagram.vue'
import LearningPath from '../components/LearningPath.vue'
import './styles.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'doc-before': () => h(PageCompletion)
  }),
  enhanceApp({ app }) {
    app.component('MermaidDiagram', MermaidDiagram)
    app.component('LearningPath', LearningPath)
    app.component('LearningHub', LearningHub)
  }
}
