import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'
import { mermaidPlugin } from './plugins/mermaid.mjs'

// helper to generate sidebar dynamically
function generateSidebar(dir, baseRoute) {
  const folderPath = path.resolve(process.cwd(), 'docs', dir)
  const folders = fs
    .readdirSync(folderPath)
    .filter(f => fs.statSync(path.join(folderPath, f)).isDirectory())

  return folders.map(folder => {
    const folderFullPath = path.join(folderPath, folder)
    const files = fs
      .readdirSync(folderFullPath)
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        text: file.replace('.md', '').replace(/_/g, ' ').replace(/\d+.*/, '').trim(),
        link: `/${dir}/${folder}/${file.replace('.md', '')}`
      }))

    return {
      text: folder.replace(/_/g, ' '),
      collapsed: true,
      items: [
        { text: 'Overview', link: `/${dir}/${folder}/` },
        ...files
      ]
    }
  })
}

export default defineConfig({
  title: 'My Notes for Bench Learning',
  description: 'Professional growth and technical notes.',
  outDir: '../dist',
  markdown: {
    config(md) {
      md.use(mermaidPlugin)
    }
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Node.js', link: '/node-js/' },
      { text: 'Python for AI', link: '/python-for-ai/' },
      { text: 'AI Engineering', link: '/ai-assisted-engineering/' },
      { text: 'Senior Growth', link: '/senior_growth/' },
      { text: 'Materials', link: '/materials' }
    ],
    hero: {
      name: 'My notes for bench learning',
      actions: [
        { theme: 'alt', text: 'Materials', link: '/materials' },
        { theme: 'alt', text: 'Technical checks', link: '/knowledge_testing' },
        { theme: 'alt', text: 'Assessment', link: '/assessment' },
        { theme: 'alt', text: 'Senior growth', link: '/senior_growth/' },
        { theme: 'brand', text: 'Node.js', link: '/node-js/' }
      ]
    },
    sidebar: {
      '/': [
        { text: 'Node.js', link: '/node-js/' },
        { text: 'Materials', link: '/materials' },
        { text: 'Technical Checks', link: '/knowledge_testing' },
        { text: 'Assessment', link: '/assessment' },
        { text: 'ASMT materials', link: '/senior_growth' },
      ],
      '/node-js/': [
        {
          text: 'Node.js: Zero to Strong Medior',
          items: [
            { text: 'Course overview', link: '/node-js/' },
            { text: '1. Node.js Foundations', link: '/node-js/module-01-nodejs-foundations' },
            { text: '2. Standard Library', link: '/node-js/module-02-standard-library' },
            { text: '3. Events, Buffers, and Streams', link: '/node-js/module-03-events-buffers-streams' },
            { text: '4. Testing', link: '/node-js/module-04-testing' },
            { text: '5. Networking', link: '/node-js/module-05-networking' },
            { text: '6. Express and Architecture', link: '/node-js/module-06-express-architecture' },
            { text: '7. MongoDB and Mongoose', link: '/node-js/module-07-mongodb-mongoose' },
            { text: '8. PostgreSQL and MikroORM', link: '/node-js/module-08-postgresql-mikroorm' },
            { text: '9. Authentication and Authorization', link: '/node-js/module-09-authentication-authorization' },
            { text: '10. Production-Ready Applications', link: '/node-js/module-10-production-ready-applications' },
            { text: '11. Performance and Diagnostics', link: '/node-js/module-11-performance-diagnostics' },
            { text: '12. Resilient and Distributed Systems', link: '/node-js/module-12-resilient-distributed-systems' }
          ]
        }
      ],
      '/ai-assisted-engineering/': [
        { text: 'AI-Assisted Engineering', items: [
          { text: 'Overview', link: '/ai-assisted-engineering/' },
          { text: 'Issue to Local Change', link: '/ai-assisted-engineering/issue-to-reviewed-change' },
          { text: 'Verification and Permissions', link: '/ai-assisted-engineering/verification-and-permissions' },
          { text: 'Local Workflow and Git', link: '/ai-assisted-engineering/local-workflow-and-git' },
          { text: 'Traceability and Evaluation', link: '/ai-assisted-engineering/traceability-and-evaluation' }
        ] }
      ],
      '/python-for-ai/': [
        { text: 'Python for Applied AI', items: [
          { text: 'Overview', link: '/python-for-ai/' },
          { text: 'Setup and Basics', link: '/python-for-ai/setup-and-basics' },
          { text: 'Typed Modules and Errors', link: '/python-for-ai/typed-modules-and-errors' },
          { text: 'Configuration and Logging', link: '/python-for-ai/configuration-and-logging' },
          { text: 'Bounded Document Streams', link: '/python-for-ai/bounded-document-streams' },
          { text: 'Async HTTP', link: '/python-for-ai/async-http' },
          { text: 'Pydantic and FastAPI', link: '/python-for-ai/fastapi-boundaries' },
          { text: 'Document Processing', link: '/python-for-ai/document-processing' },
          { text: 'Deployment', link: '/python-for-ai/deployment' },
          { text: 'Model SDK', link: '/python-for-ai/model-sdk' },
          { text: 'Token Budgets', link: '/python-for-ai/token-budgets' },
          { text: 'Model Foundations', link: '/python-for-ai/model-foundations' },
          { text: 'Attention and Sampling', link: '/python-for-ai/attention-and-sampling' },
          { text: 'Embeddings and Similarity', link: '/python-for-ai/embeddings-and-similarity' },
          { text: 'Evidence and Citations', link: '/python-for-ai/retrieval-context' },
          { text: 'Retrieval Pipeline', link: '/python-for-ai/retrieval-pipeline' },
          { text: 'Prompting and Modalities', link: '/python-for-ai/prompting-and-modalities' },
          { text: 'Model Streaming', link: '/python-for-ai/model-streaming' },
          { text: 'Model Work Budgets', link: '/python-for-ai/model-work-budgets' },
          { text: 'History and Workflows', link: '/python-for-ai/history-and-workflows' },
          { text: 'Typed Tool Boundaries', link: '/python-for-ai/tool-boundaries' },
          { text: 'Tool Workflow State', link: '/python-for-ai/tool-workflow-state' },
          { text: 'Approved Writes', link: '/python-for-ai/approved-writes' },
          { text: 'Graph and Memory', link: '/python-for-ai/graph-memory' },
          { text: 'Workflow Diagnostics', link: '/python-for-ai/workflow-diagnostics' },
          { text: 'Evaluation Lab', link: '/python-for-ai/evaluation-lab' },
          { text: 'Evaluation Measurements', link: '/python-for-ai/evaluation-measurements' },
          { text: 'Vector Storage and Lifecycles', link: '/python-for-ai/vector-storage-lifecycle' },
          { text: 'Retrieval Debugging', link: '/python-for-ai/retrieval-debugging' },
          { text: 'Model Economics', link: '/python-for-ai/model-economics' },
          { text: 'Caching and Batch Work', link: '/python-for-ai/cache-and-batch' },
          { text: 'Prompt Injection Boundaries', link: '/python-for-ai/prompt-injection-boundaries' },
          { text: 'Source and Output Security', link: '/python-for-ai/source-and-output-security' },
          { text: 'Provenance and Oversight', link: '/python-for-ai/provenance-and-oversight' },
          { text: 'Provider Data Lifecycle', link: '/python-for-ai/provider-data-lifecycle' }
        ] }
      ],
      '/senior_growth/': generateSidebar('senior_growth', '/senior_growth/')
    }
  }
})
