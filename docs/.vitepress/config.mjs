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
      .filter(file => file.endsWith('.md') && file !== 'index.md')
      .map(file => {
        if (folder === 'Other' && file === 'What_is_Big_O_notation_How_can_it_be_used_to_optimize_JS_code.md') {
          return { text: 'Complexity and cost models', link: '/cs-foundations/complexity-and-cost' }
        }
        if (folder === 'Other' && file === 'Please_describe_quick_sort_algorithm._What_complexity_does_it_have.md') {
          return { text: 'Sorting and quicksort', link: '/cs-foundations/sorting' }
        }
        return {
          text: (fs.readFileSync(path.join(folderFullPath, file), 'utf8').match(/^#{1,3}\s+(.+)$/m)?.[1] ?? file.replace(/_[a-f0-9]{32}\.md$/, '').replace(/_/g, ' ')).replace(/\*\*|`/g, '').trim(),
          link: `/${dir}/${folder}/${file.replace('.md', '')}`
        }
      })

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
      { text: 'Hub map', link: '/review/' },
      { text: 'Learning paths', items: [
        { text: 'Frontend', link: '/frontend/' },
        { text: 'CS foundations', link: '/cs-foundations/' },
        { text: 'Node.js', link: '/node-js/' },
        { text: 'Applied AI', link: '/applied-ai/' },
        { text: 'AI Engineering', link: '/ai-assisted-engineering/' },
        { text: 'Engineering foundations', link: '/engineering/' }
      ] },
      { text: 'Practice projects', link: '/practice/learning-projects' },
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
"/review/": [
  {
    "text": "Hub reconciliation",
    "items": [
      {
        "text": "Current inventory",
        "link": "/review/"
      },
      {
        "text": "Verification and limitations",
        "link": "/review/verification"
      },
      {
        "text": "Engineering reading order",
        "link": "/engineering/"
      },
      {
        "text": "State",
        "link": "/engineering/state"
      },
      {
        "text": "Performance",
        "link": "/engineering/performance"
      },
      {
        "text": "Security",
        "link": "/engineering/security"
      },
      {
        "text": "Quality",
        "link": "/engineering/quality"
      },
      {
        "text": "Delivery",
        "link": "/engineering/delivery"
      },
      {
        "text": "Design",
        "link": "/engineering/design"
      },
      {
        "text": "Shared practice",
        "link": "/practice/engineering/"
      },
      {
        "text": "Workbench",
        "link": "/workbench/engineering/"
      }
    ]
  }
],
"/engineering/": [
  {
    "text": "Hub reconciliation",
    "items": [
      {
        "text": "Current inventory",
        "link": "/review/"
      },
      {
        "text": "Verification and limitations",
        "link": "/review/verification"
      },
      {
        "text": "Engineering reading order",
        "link": "/engineering/"
      },
      {
        "text": "State",
        "link": "/engineering/state"
      },
      {
        "text": "Performance",
        "link": "/engineering/performance"
      },
      {
        "text": "Security",
        "link": "/engineering/security"
      },
      {
        "text": "Quality",
        "link": "/engineering/quality"
      },
      {
        "text": "Delivery",
        "link": "/engineering/delivery"
      },
      {
        "text": "Design",
        "link": "/engineering/design"
      },
      {
        "text": "Shared practice",
        "link": "/practice/engineering/"
      },
      {
        "text": "Workbench",
        "link": "/workbench/engineering/"
      }
    ]
  }
],
"/practice/engineering/": [
  {
    "text": "Hub reconciliation",
    "items": [
      {
        "text": "Current inventory",
        "link": "/review/"
      },
      {
        "text": "Verification and limitations",
        "link": "/review/verification"
      },
      {
        "text": "Engineering reading order",
        "link": "/engineering/"
      },
      {
        "text": "State",
        "link": "/engineering/state"
      },
      {
        "text": "Performance",
        "link": "/engineering/performance"
      },
      {
        "text": "Security",
        "link": "/engineering/security"
      },
      {
        "text": "Quality",
        "link": "/engineering/quality"
      },
      {
        "text": "Delivery",
        "link": "/engineering/delivery"
      },
      {
        "text": "Design",
        "link": "/engineering/design"
      },
      {
        "text": "Shared practice",
        "link": "/practice/engineering/"
      },
      {
        "text": "Workbench",
        "link": "/workbench/engineering/"
      }
    ]
  }
],
"/workbench/engineering/": [
  {
    "text": "Hub reconciliation",
    "items": [
      {
        "text": "Current inventory",
        "link": "/review/"
      },
      {
        "text": "Verification and limitations",
        "link": "/review/verification"
      },
      {
        "text": "Engineering reading order",
        "link": "/engineering/"
      },
      {
        "text": "State",
        "link": "/engineering/state"
      },
      {
        "text": "Performance",
        "link": "/engineering/performance"
      },
      {
        "text": "Security",
        "link": "/engineering/security"
      },
      {
        "text": "Quality",
        "link": "/engineering/quality"
      },
      {
        "text": "Delivery",
        "link": "/engineering/delivery"
      },
      {
        "text": "Design",
        "link": "/engineering/design"
      },
      {
        "text": "Shared practice",
        "link": "/practice/engineering/"
      },
      {
        "text": "Workbench",
        "link": "/workbench/engineering/"
      }
    ]
  }
],
"/frontend/": [
  {
    "text": "Frontend path",
    "items": [
      {
        "text": "Reading order",
        "link": "/frontend/"
      },
      {
        "text": "Coverage and ownership",
        "link": "/frontend/coverage-map"
      },
      {
        "text": "HTML and browser",
        "link": "/frontend/html-browser"
      },
      {
        "text": "JavaScript",
        "link": "/frontend/javascript"
      },
      {
        "text": "TypeScript",
        "link": "/frontend/typescript"
      },
      {
        "text": "React",
        "link": "/frontend/react"
      },
      {
        "text": "Next and UI architecture",
        "link": "/frontend/next"
      },
      {
        "text": "Verification and limits",
        "link": "/frontend/verification"
      }
    ]
  },
  {
    "text": "Worked collections and practice",
    "items": [
      {
        "text": "Workbench",
        "link": "/workbench/frontend/"
      },
      {
        "text": "React references",
        "link": "/workbench/frontend/react/"
      },
      {
        "text": "Next references",
        "link": "/workbench/frontend/next/"
      },
      {
        "text": "UI architecture",
        "link": "/workbench/frontend/architecture/"
      },
      {
        "text": "Staged practice",
        "link": "/practice/frontend/"
      }
    ]
  }
],
"/workbench/frontend/": [
  {
    "text": "Frontend path",
    "items": [
      {
        "text": "Reading order",
        "link": "/frontend/"
      },
      {
        "text": "Coverage and ownership",
        "link": "/frontend/coverage-map"
      },
      {
        "text": "HTML and browser",
        "link": "/frontend/html-browser"
      },
      {
        "text": "JavaScript",
        "link": "/frontend/javascript"
      },
      {
        "text": "TypeScript",
        "link": "/frontend/typescript"
      },
      {
        "text": "React",
        "link": "/frontend/react"
      },
      {
        "text": "Next and UI architecture",
        "link": "/frontend/next"
      },
      {
        "text": "Verification and limits",
        "link": "/frontend/verification"
      }
    ]
  },
  {
    "text": "Worked collections and practice",
    "items": [
      {
        "text": "Workbench",
        "link": "/workbench/frontend/"
      },
      {
        "text": "React references",
        "link": "/workbench/frontend/react/"
      },
      {
        "text": "Next references",
        "link": "/workbench/frontend/next/"
      },
      {
        "text": "UI architecture",
        "link": "/workbench/frontend/architecture/"
      },
      {
        "text": "Staged practice",
        "link": "/practice/frontend/"
      }
    ]
  }
],
"/practice/frontend/": [
  {
    "text": "Frontend path",
    "items": [
      {
        "text": "Reading order",
        "link": "/frontend/"
      },
      {
        "text": "Coverage and ownership",
        "link": "/frontend/coverage-map"
      },
      {
        "text": "HTML and browser",
        "link": "/frontend/html-browser"
      },
      {
        "text": "JavaScript",
        "link": "/frontend/javascript"
      },
      {
        "text": "TypeScript",
        "link": "/frontend/typescript"
      },
      {
        "text": "React",
        "link": "/frontend/react"
      },
      {
        "text": "Next and UI architecture",
        "link": "/frontend/next"
      },
      {
        "text": "Verification and limits",
        "link": "/frontend/verification"
      }
    ]
  },
  {
    "text": "Worked collections and practice",
    "items": [
      {
        "text": "Workbench",
        "link": "/workbench/frontend/"
      },
      {
        "text": "React references",
        "link": "/workbench/frontend/react/"
      },
      {
        "text": "Next references",
        "link": "/workbench/frontend/next/"
      },
      {
        "text": "UI architecture",
        "link": "/workbench/frontend/architecture/"
      },
      {
        "text": "Staged practice",
        "link": "/practice/frontend/"
      }
    ]
  }
],
      "/applied-ai/": [
  {
    "text": "Applied AI",
    "items": [
      {
        "text": "Reading order",
        "link": "/applied-ai/"
      },
      {
        "text": "Coverage and ownership",
        "link": "/applied-ai/coverage-map"
      },
      {
        "text": "Shared foundations",
        "link": "/applied-ai/shared/"
      },
      {
        "text": "RAG",
        "link": "/applied-ai/rag/"
      },
      {
        "text": "Answering and failures",
        "link": "/applied-ai/rag/answering-and-failures"
      },
      {
        "text": "Agent workflows",
        "link": "/applied-ai/workflows/"
      },
      {
        "text": "Resumable runs",
        "link": "/applied-ai/workflows/resumable-runs"
      },
      {
        "text": "n8n fundamentals",
        "link": "/applied-ai/n8n/"
      },
      {
        "text": "n8n integration",
        "link": "/applied-ai/n8n/integration"
      },
      {
        "text": "n8n errors and operations",
        "link": "/applied-ai/n8n/operations"
      }
    ]
  },
  {
    "text": "Detailed shared lessons",
    "collapsed": true,
    "items": [
      {
        "text": "Python prerequisites",
        "link": "/python-for-ai/"
      },
      {
        "text": "Model SDK",
        "link": "/python-for-ai/model-sdk"
      },
      {
        "text": "Tokens and context",
        "link": "/python-for-ai/token-budgets"
      },
      {
        "text": "Streaming",
        "link": "/python-for-ai/model-streaming"
      },
      {
        "text": "Tool contracts",
        "link": "/python-for-ai/tool-boundaries"
      },
      {
        "text": "History and summaries",
        "link": "/python-for-ai/history-and-workflows"
      },
      {
        "text": "Admission and retries",
        "link": "/python-for-ai/model-work-budgets"
      },
      {
        "text": "Task economics",
        "link": "/python-for-ai/model-economics"
      },
      {
        "text": "Evaluation",
        "link": "/python-for-ai/evaluation-lab"
      },
      {
        "text": "Measurements",
        "link": "/python-for-ai/evaluation-measurements"
      },
      {
        "text": "Injection scope",
        "link": "/python-for-ai/prompt-injection-boundaries"
      },
      {
        "text": "Source/output security",
        "link": "/python-for-ai/source-and-output-security"
      },
      {
        "text": "Audit and oversight",
        "link": "/python-for-ai/provenance-and-oversight"
      },
      {
        "text": "Provider lifecycle",
        "link": "/python-for-ai/provider-data-lifecycle"
      }
    ]
  },
  {
    "text": "Detailed RAG lessons",
    "collapsed": true,
    "items": [
      {
        "text": "Extraction/chunk provenance",
        "link": "/python-for-ai/document-processing"
      },
      {
        "text": "Embeddings and hybrid",
        "link": "/python-for-ai/embeddings-and-similarity"
      },
      {
        "text": "Vector storage/lifecycle",
        "link": "/python-for-ai/vector-storage-lifecycle"
      },
      {
        "text": "Evidence and citations",
        "link": "/python-for-ai/retrieval-context"
      },
      {
        "text": "Retrieval/context pipeline",
        "link": "/python-for-ai/retrieval-pipeline"
      },
      {
        "text": "Retrieval debugging",
        "link": "/python-for-ai/retrieval-debugging"
      },
      {
        "text": "Cache and batch",
        "link": "/python-for-ai/cache-and-batch"
      }
    ]
  },
  {
    "text": "Detailed workflow lessons",
    "collapsed": true,
    "items": [
      {
        "text": "State and revisions",
        "link": "/python-for-ai/tool-workflow-state"
      },
      {
        "text": "Approval and receipts",
        "link": "/python-for-ai/approved-writes"
      },
      {
        "text": "Graph/memory optional",
        "link": "/python-for-ai/graph-memory"
      },
      {
        "text": "Workflow diagnostics",
        "link": "/python-for-ai/workflow-diagnostics"
      }
    ]
  },
  {
    "text": "References and practice",
    "items": [
      {
        "text": "Workbench",
        "link": "/workbench/applied-ai/"
      },
      {
        "text": "Staged projects",
        "link": "/practice/applied-ai/"
      },
      {
        "text": "Chapter exercises",
        "link": "/practice/applied-ai/chapters/"
      }
    ]
  },
  {
    "text": "Optional reference depth",
    "collapsed": true,
    "items": [
      {
        "text": "Model foundations",
        "link": "/python-for-ai/model-foundations"
      },
      {
        "text": "Attention/sampling",
        "link": "/python-for-ai/attention-and-sampling"
      },
      {
        "text": "Prompting/modalities",
        "link": "/python-for-ai/prompting-and-modalities"
      },
      {
        "text": "MCP primitives",
        "link": "/python-for-ai/mcp-primitives"
      },
      {
        "text": "MCP connections",
        "link": "/python-for-ai/mcp-connections"
      },
      {
        "text": "MCP security",
        "link": "/python-for-ai/mcp-security"
      },
      {
        "text": "MCP lifecycle",
        "link": "/python-for-ai/mcp-lifecycle"
      },
      {
        "text": "Operations/ETL/UI",
        "link": "/python-for-ai/operations-and-data"
      },
      {
        "text": "Graphs/adaptation",
        "link": "/python-for-ai/graphs-and-adaptation"
      }
    ]
  }
],
      "/workbench/applied-ai/": [
  {
    "text": "Applied-AI workbench",
    "items": [
      {
        "text": "Overview",
        "link": "/workbench/applied-ai/"
      },
      {
        "text": "Python sources and checks",
        "link": "/workbench/applied-ai/python/"
      },
      {
        "text": "n8n transform/adapter",
        "link": "/workbench/applied-ai/n8n/"
      },
      {
        "text": "Textbook",
        "link": "/applied-ai/"
      },
      {
        "text": "Practice",
        "link": "/practice/applied-ai/"
      }
    ]
  }
],
      "/practice/applied-ai/": [
  {
    "text": "Applied-AI practice",
    "items": [
      {
        "text": "Sequence and evidence",
        "link": "/practice/applied-ai/"
      },
      {
        "text": "P-334 RAG stages",
        "link": "/practice/applied-ai/rag-assistant"
      },
      {
        "text": "P-335 resumable workflow",
        "link": "/practice/applied-ai/resumable-workflow"
      },
      {
        "text": "N8N-P01 integration",
        "link": "/practice/applied-ai/n8n-integration"
      },
      {
        "text": "Chapter requirements",
        "link": "/practice/applied-ai/chapters/"
      }
    ]
  }
],
      "/cs-foundations/": [
  {
    "text": "CS foundations",
    "items": [
      {
        "text": "Course and reading order",
        "link": "/cs-foundations/"
      },
      {
        "text": "Coverage map",
        "link": "/cs-foundations/coverage-map"
      },
      {
        "text": "Complexity and cost",
        "link": "/cs-foundations/complexity-and-cost"
      },
      {
        "text": "Correctness and recursion",
        "link": "/cs-foundations/reasoning-and-recursion"
      },
      {
        "text": "Data structures",
        "link": "/cs-foundations/data-structures"
      },
      {
        "text": "Binary search",
        "link": "/cs-foundations/binary-search"
      },
      {
        "text": "Sorting and quicksort",
        "link": "/cs-foundations/sorting"
      },
      {
        "text": "Trees, graphs and traversal",
        "link": "/cs-foundations/trees-graphs-traversal"
      },
      {
        "text": "Priority queues",
        "link": "/cs-foundations/priority-queues"
      },
      {
        "text": "Worked sources and checks",
        "link": "/workbench/cs-foundations/"
      },
      {
        "text": "Independent practice",
        "link": "/practice/cs-foundations/"
      }
    ]
  }
],
      "/workbench/cs-foundations/": [
  {
    "text": "CS workbench",
    "items": [
      {
        "text": "Sources and run instructions",
        "link": "/workbench/cs-foundations/"
      },
      {
        "text": "Queue and heap",
        "link": "/workbench/cs-foundations/collections"
      },
      {
        "text": "Traversal sources",
        "link": "/workbench/cs-foundations/traversals"
      },
      {
        "text": "CS textbook",
        "link": "/cs-foundations/"
      },
      {
        "text": "Independent practice",
        "link": "/practice/cs-foundations/"
      }
    ]
  }
],
      "/practice/cs-foundations/": [
  {
    "text": "CS independent practice",
    "items": [
      {
        "text": "Sequence and evidence",
        "link": "/practice/cs-foundations/"
      },
      {
        "text": "Cost and search",
        "link": "/practice/cs-foundations/cost-and-search"
      },
      {
        "text": "Sorting and recursion",
        "link": "/practice/cs-foundations/sorting"
      },
      {
        "text": "Collections and queues",
        "link": "/practice/cs-foundations/collections-and-queues"
      },
      {
        "text": "Explorer and scheduler",
        "link": "/practice/cs-foundations/dependency-explorer"
      },
      {
        "text": "Retained requirements",
        "link": "/practice/cs-foundations/retained-exercises"
      }
    ]
  }
],
      '/': [
        { text: 'Node.js', link: '/node-js/' },
        { text: 'Materials', link: '/materials' },
        { text: 'Technical Checks', link: '/knowledge_testing' },
        { text: 'Assessment', link: '/assessment' },
        { text: 'ASMT materials', link: '/senior_growth/' },
      ],
      '/node-js/': [
        {
                "text": "Node.js runtime course",
                "items": [
                        {
                                "text": "Overview and reading order",
                                "link": "/node-js/"
                        },
                        {
                                "text": "Prerequisites and boundaries",
                                "link": "/node-js/prerequisites-and-boundaries"
                        },
                        {
                                "text": "1. Runtime and modules",
                                "link": "/node-js/module-01-nodejs-foundations"
                        },
                        {
                                "text": "2. Standard library and ownership",
                                "link": "/node-js/module-02-standard-library"
                        },
                        {
                                "text": "3. Events, buffers and streams",
                                "link": "/node-js/module-03-events-buffers-streams"
                        },
                        {
                                "text": "4. Testing",
                                "link": "/node-js/module-04-testing"
                        },
                        {
                                "text": "5. HTTP and networking",
                                "link": "/node-js/module-05-networking"
                        },
                        {
                                "text": "6. Runtime diagnostics",
                                "link": "/node-js/module-11-performance-diagnostics"
                        },
                        {
                                "text": "7. Lifecycle and operations",
                                "link": "/node-js/module-10-production-ready-applications"
                        }
                ]
        },
        {
                "text": "Backend and persistence continuation",
                "items": [
                        {
                                "text": "Express and architecture",
                                "link": "/node-js/module-06-express-architecture"
                        },
                        {
                                "text": "PostgreSQL and MikroORM",
                                "link": "/node-js/module-08-postgresql-mikroorm"
                        },
                        {
                                "text": "Authentication and authorization",
                                "link": "/node-js/module-09-authentication-authorization"
                        },
                        {
                                "text": "MongoDB: optional alternative",
                                "link": "/node-js/module-07-mongodb-mongoose"
                        },
                        {
                                "text": "Cursor pagination",
                                "link": "/node-js/cursor-pagination"
                        },
                        {
                                "text": "Dates and time zones",
                                "link": "/node-js/dates-and-time-zones"
                        },
                        {
                                "text": "Bounded text uploads",
                                "link": "/node-js/safe-text-uploads"
                        },
                        {
                                "text": "Retention and deletion",
                                "link": "/node-js/retention-and-deletion"
                        },
                        {
                                "text": "Signed webhooks",
                                "link": "/node-js/signed-webhooks"
                        },
                        {
                                "text": "Browser CSP",
                                "link": "/node-js/browser-csp"
                        },
                        {
                                "text": "OIDC and CSRF alternatives",
                                "link": "/node-js/oidc-and-csrf-lab"
                        },
                        {
                                "text": "SSE, polling and gRPC",
                                "link": "/node-js/realtime-transports"
                        },
                        {
                                "text": "GraphQL: optional alternative",
                                "link": "/node-js/graphql-basics"
                        },
                        {
                                "text": "Redis: optional adapter",
                                "link": "/node-js/redis-adapters"
                        }
                ]
        },
        {
                "text": "Delivery and distribution continuation",
                "items": [
                        {
                                "text": "Distributed failure concepts",
                                "link": "/node-js/module-12-resilient-distributed-systems"
                        },
                        {
                                "text": "Jobs and schedules",
                                "link": "/node-js/jobs-and-schedules"
                        },
                        {
                                "text": "Containers",
                                "link": "/node-js/container-deployment-lab"
                        },
                        {
                                "text": "Database recovery",
                                "link": "/node-js/database-recovery"
                        },
                        {
                                "text": "Release compatibility",
                                "link": "/node-js/release-artifact-compatibility"
                        },
                        {
                                "text": "Full-stack local deployment",
                                "link": "/node-js/full-stack-deployment"
                        },
                        {
                                "text": "AWS: optional awareness",
                                "link": "/node-js/aws-service-slice"
                        }
                ]
        },
        {
                "text": "Examples and independent practice",
                "items": [
                        {
                                "text": "Node.js workbench",
                                "link": "/workbench/node-js/"
                        },
                        {
                                "text": "Small runtime project",
                                "link": "/practice/node-js/core-project"
                        },
                        {
                                "text": "All Node exercises",
                                "link": "/practice/node-js/"
                        },
                        {
                                "text": "Backend integration projects",
                                "link": "/practice/backend-project"
                        }
                ]
        }
],
      "/workbench/node-js/": [
        {
                "text": "Node.js workbench",
                "items": [
                        {
                                "text": "Overview",
                                "link": "/workbench/node-js/"
                        },
                        {
                                "text": "Runtime sources and checks",
                                "link": "/workbench/node-js/runtime/"
                        },
                        {
                                "text": "Module interoperability",
                                "link": "/workbench/node-js/runtime/modules"
                        },
                        {
                                "text": "Products API",
                                "link": "/workbench/node-js/backend/products-api"
                        },
                        {
                                "text": "Session application",
                                "link": "/workbench/node-js/backend/session-app"
                        },
                        {
                                "text": "REST/OpenAPI contract",
                                "link": "/workbench/node-js/backend/rest-contracts"
                        },
                        {
                                "text": "SQL query collection",
                                "link": "/workbench/node-js/database/sql-queries"
                        },
                        {
                                "text": "Node textbook",
                                "link": "/node-js/"
                        },
                        {
                                "text": "Practice",
                                "link": "/practice/node-js/"
                        }
                ]
        }
],
      "/practice/": [
        {
                "text": "Independent practice",
                "items": [
                        {
                                "text": "Project hub",
                                "link": "/practice/learning-projects"
                        },
                        {
                                "text": "CS foundations sequence",
                                "link": "/practice/cs-foundations/"
                        },
                        {
                                "text": "Node.js practice map",
                                "link": "/practice/node-js/"
                        },
                        {
                                "text": "Small Node.js project",
                                "link": "/practice/node-js/core-project"
                        },
                        {
                                "text": "Backend integration",
                                "link": "/practice/backend-project"
                        },
                        {
                                "text": "Frontend integration",
                                "link": "/practice/frontend-project"
                        },
                        {
                                "text": "AI/Python integration",
                                "link": "/practice/ai-project"
                        }
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
  {
    "text": "Python prerequisites",
    "items": [
      {
        "text": "Overview",
        "link": "/python-for-ai/"
      },
      {
        "text": "Setup and functions",
        "link": "/python-for-ai/setup-and-basics"
      },
      {
        "text": "Typed boundaries",
        "link": "/python-for-ai/typed-modules-and-errors"
      },
      {
        "text": "Settings and logs",
        "link": "/python-for-ai/configuration-and-logging"
      },
      {
        "text": "Bounded streams",
        "link": "/python-for-ai/bounded-document-streams"
      },
      {
        "text": "Async HTTP",
        "link": "/python-for-ai/async-http"
      },
      {
        "text": "FastAPI",
        "link": "/python-for-ai/fastapi-boundaries"
      },
      {
        "text": "Deployment",
        "link": "/python-for-ai/deployment"
      }
    ]
  },
  {
    "text": "Applied AI",
    "items": [
      {
        "text": "Reading order",
        "link": "/applied-ai/"
      },
      {
        "text": "Coverage and ownership",
        "link": "/applied-ai/coverage-map"
      },
      {
        "text": "Shared foundations",
        "link": "/applied-ai/shared/"
      },
      {
        "text": "RAG",
        "link": "/applied-ai/rag/"
      },
      {
        "text": "Answering and failures",
        "link": "/applied-ai/rag/answering-and-failures"
      },
      {
        "text": "Agent workflows",
        "link": "/applied-ai/workflows/"
      },
      {
        "text": "Resumable runs",
        "link": "/applied-ai/workflows/resumable-runs"
      },
      {
        "text": "n8n fundamentals",
        "link": "/applied-ai/n8n/"
      },
      {
        "text": "n8n integration",
        "link": "/applied-ai/n8n/integration"
      },
      {
        "text": "n8n errors and operations",
        "link": "/applied-ai/n8n/operations"
      }
    ]
  },
  {
    "text": "Detailed shared lessons",
    "collapsed": true,
    "items": [
      {
        "text": "Python prerequisites",
        "link": "/python-for-ai/"
      },
      {
        "text": "Model SDK",
        "link": "/python-for-ai/model-sdk"
      },
      {
        "text": "Tokens and context",
        "link": "/python-for-ai/token-budgets"
      },
      {
        "text": "Streaming",
        "link": "/python-for-ai/model-streaming"
      },
      {
        "text": "Tool contracts",
        "link": "/python-for-ai/tool-boundaries"
      },
      {
        "text": "History and summaries",
        "link": "/python-for-ai/history-and-workflows"
      },
      {
        "text": "Admission and retries",
        "link": "/python-for-ai/model-work-budgets"
      },
      {
        "text": "Task economics",
        "link": "/python-for-ai/model-economics"
      },
      {
        "text": "Evaluation",
        "link": "/python-for-ai/evaluation-lab"
      },
      {
        "text": "Measurements",
        "link": "/python-for-ai/evaluation-measurements"
      },
      {
        "text": "Injection scope",
        "link": "/python-for-ai/prompt-injection-boundaries"
      },
      {
        "text": "Source/output security",
        "link": "/python-for-ai/source-and-output-security"
      },
      {
        "text": "Audit and oversight",
        "link": "/python-for-ai/provenance-and-oversight"
      },
      {
        "text": "Provider lifecycle",
        "link": "/python-for-ai/provider-data-lifecycle"
      }
    ]
  },
  {
    "text": "Detailed RAG lessons",
    "collapsed": true,
    "items": [
      {
        "text": "Extraction/chunk provenance",
        "link": "/python-for-ai/document-processing"
      },
      {
        "text": "Embeddings and hybrid",
        "link": "/python-for-ai/embeddings-and-similarity"
      },
      {
        "text": "Vector storage/lifecycle",
        "link": "/python-for-ai/vector-storage-lifecycle"
      },
      {
        "text": "Evidence and citations",
        "link": "/python-for-ai/retrieval-context"
      },
      {
        "text": "Retrieval/context pipeline",
        "link": "/python-for-ai/retrieval-pipeline"
      },
      {
        "text": "Retrieval debugging",
        "link": "/python-for-ai/retrieval-debugging"
      },
      {
        "text": "Cache and batch",
        "link": "/python-for-ai/cache-and-batch"
      }
    ]
  },
  {
    "text": "Detailed workflow lessons",
    "collapsed": true,
    "items": [
      {
        "text": "State and revisions",
        "link": "/python-for-ai/tool-workflow-state"
      },
      {
        "text": "Approval and receipts",
        "link": "/python-for-ai/approved-writes"
      },
      {
        "text": "Graph/memory optional",
        "link": "/python-for-ai/graph-memory"
      },
      {
        "text": "Workflow diagnostics",
        "link": "/python-for-ai/workflow-diagnostics"
      }
    ]
  },
  {
    "text": "References and practice",
    "items": [
      {
        "text": "Workbench",
        "link": "/workbench/applied-ai/"
      },
      {
        "text": "Staged projects",
        "link": "/practice/applied-ai/"
      },
      {
        "text": "Chapter exercises",
        "link": "/practice/applied-ai/chapters/"
      }
    ]
  },
  {
    "text": "Optional reference depth",
    "collapsed": true,
    "items": [
      {
        "text": "Model foundations",
        "link": "/python-for-ai/model-foundations"
      },
      {
        "text": "Attention/sampling",
        "link": "/python-for-ai/attention-and-sampling"
      },
      {
        "text": "Prompting/modalities",
        "link": "/python-for-ai/prompting-and-modalities"
      },
      {
        "text": "MCP primitives",
        "link": "/python-for-ai/mcp-primitives"
      },
      {
        "text": "MCP connections",
        "link": "/python-for-ai/mcp-connections"
      },
      {
        "text": "MCP security",
        "link": "/python-for-ai/mcp-security"
      },
      {
        "text": "MCP lifecycle",
        "link": "/python-for-ai/mcp-lifecycle"
      },
      {
        "text": "Operations/ETL/UI",
        "link": "/python-for-ai/operations-and-data"
      },
      {
        "text": "Graphs/adaptation",
        "link": "/python-for-ai/graphs-and-adaptation"
      }
    ]
  }
],
      '/senior_growth/': generateSidebar('senior_growth', '/senior_growth/')
    }
  }
})
