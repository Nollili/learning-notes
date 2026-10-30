import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'
import { mermaidPlugin } from './plugins/mermaid.mjs'
import { applyContentPolicy, cleanTitle, getPageTitle } from './content-policy.mjs'
import { sectionNumberingPlugin } from './plugins/section-numbering.mjs'

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
          text: getPageTitle(fs.readFileSync(path.join(folderFullPath, file), 'utf8'), file),
          link: `/${dir}/${folder}/${file.replace('.md', '')}`
        }
      })

    return {
      text: cleanTitle(folder),
      collapsed: true,
      items: [
        { text: 'Overview', link: `/${dir}/${folder}/` },
        ...files
      ]
    }
  })
}

const performanceLearningSidebar = {
  text: 'Frontend performance',
  items: [
    { text: 'Reading order and outcomes', link: '/frontend/performance/' },
    { text: 'Metrics and investigation', link: '/frontend/performance/measurement' },
    { text: 'Loading, scripts and bundles', link: '/frontend/performance/delivery' },
    { text: 'Responsive images', link: '/frontend/performance/images' },
    { text: 'Critical CSS and fonts', link: '/frontend/performance/css-fonts' },
    { text: 'Runtime responsiveness', link: '/frontend/performance/runtime' },
    { text: 'Caching and repeat visits', link: '/frontend/performance/caching' },
    { text: 'Sources and corrections', link: '/frontend/performance/sources' },
    { text: 'Author verification', link: '/frontend/performance/verification' }
  ]
}
const performanceHomeworkSidebar = {
  text: 'Performance hometasks',
  items: [
    { text: 'Core sequence and extensions', link: '/practice/frontend/performance/' },
    { text: 'H1 — Investigate', link: '/practice/frontend/performance/01-investigate' },
    { text: 'H2 — Improve', link: '/practice/frontend/performance/02-improve' },
    { text: 'H3 — Verify and prevent regressions', link: '/practice/frontend/performance/03-verify' }
  ]
}

const aiAppSidebar = [
  {
    "text": "Build AI Apps — JavaScript First",
    "items": [
      {
        "text": "Start here: JavaScript first",
        "link": "/applied-ai/"
      },
      {
        "text": "0. Understand the pieces",
        "link": "/applied-ai/javascript/orientation"
      },
      {
        "text": "1. First request and console",
        "link": "/applied-ai/javascript/first-call"
      },
      {
        "text": "2. Chatbot inside an app",
        "link": "/applied-ai/javascript/chatbot"
      },
      {
        "text": "3. Structured output",
        "link": "/applied-ai/javascript/structured-output"
      },
      {
        "text": "4. Tools and workflows",
        "link": "/applied-ai/javascript/tools-workflows"
      },
      {
        "text": "5. RAG from your notes",
        "link": "/applied-ai/javascript/rag"
      },
      {
        "text": "6. Build an MCP server",
        "link": "/applied-ai/javascript/mcp"
      },
      {
        "text": "7. Stateful graph workflows",
        "link": "/applied-ai/javascript/stateful-workflows"
      },
      {
        "text": "8. Choose an extension",
        "link": "/applied-ai/javascript/extensions"
      },
      {
        "text": "JavaScript workbench",
        "link": "/workbench/applied-ai/javascript/"
      },
      {
        "text": "MCP and graph workbench",
        "link": "/workbench/applied-ai/javascript-integrations/"
      },
      {
        "text": "Practice milestones",
        "link": "/practice/applied-ai/javascript-assistant"
      },
      {
        "text": "Company course mapping",
        "link": "/applied-ai/javascript/company-course"
      },
      {
        "text": "Verification and limits",
        "link": "/applied-ai/javascript/verification"
      }
    ]
  }
]

const aiDevelopmentSidebar = [
  {
    "text": "AI for Software Development",
    "items": [
      {
        "text": "Start here",
        "link": "/ai-assisted-engineering/"
      },
      {
        "text": "1. Get started",
        "link": "/ai-assisted-engineering/getting-started"
      },
      {
        "text": "2. Fix a bug",
        "link": "/ai-assisted-engineering/bug-fixing"
      },
      {
        "text": "3. Develop a feature",
        "link": "/ai-assisted-engineering/feature-development"
      },
      {
        "text": "4. Test and debug",
        "link": "/ai-assisted-engineering/testing-debugging"
      },
      {
        "text": "5. Review and prepare a PR",
        "link": "/ai-assisted-engineering/review-pr"
      },
      {
        "text": "6. Workflows and tools",
        "link": "/ai-assisted-engineering/reusable-tools"
      },
      {
        "text": "7. Advanced coordination",
        "link": "/ai-assisted-engineering/advanced-coordination"
      },
      {
        "text": "Independent projects",
        "link": "/practice/engineering/ai-engineering/development-project"
      },
      {
        "text": "TypeScript catalogue workbench",
        "link": "/workbench/engineering/ai-engineering/catalogue/"
      }
    ]
  },
  {
    "text": "Deeper engineering references",
    "collapsed": true,
    "items": [
      {
        "text": "Issue to reviewed change",
        "link": "/ai-assisted-engineering/issue-to-reviewed-change"
      },
      {
        "text": "Verification and permissions",
        "link": "/ai-assisted-engineering/verification-and-permissions"
      },
      {
        "text": "Local workflow and Git",
        "link": "/ai-assisted-engineering/local-workflow-and-git"
      },
      {
        "text": "Traceability and evaluation",
        "link": "/ai-assisted-engineering/traceability-and-evaluation"
      }
    ]
  }
]

export default defineConfig(applyContentPolicy({
  title: 'My Notes for Bench Learning',
  description: 'Professional growth and technical notes.',
  outDir: '../dist',
  markdown: {
    config(md) {
      md.core.ruler.disable('emoji')
      md.use(mermaidPlugin)
      md.use(sectionNumberingPlugin)
    }
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Hub map', link: '/review/' },
      { text: 'Learning paths', items: [
        { text: 'Frontend performance', link: '/frontend/performance/' },
        { text: 'CS foundations', link: '/cs-foundations/' },
        { text: 'Node.js', link: '/node-js/' },
        { text: 'AWS Cloud', link: '/aws/' },
        { text: 'Build AI Apps — JavaScript First', link: '/applied-ai/' },
        { text: 'AI for Software Development', link: '/ai-assisted-engineering/' },
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
      "/workbench/applied-ai/javascript/": aiAppSidebar,
      "/workbench/applied-ai/javascript-integrations/": aiAppSidebar,
      "/workbench/engineering/ai-engineering/catalogue/": aiDevelopmentSidebar,
      "/practice/engineering/ai-engineering/": aiDevelopmentSidebar,

      "/practice/aws/": [
  {
    "text": "AWS homework",
    "items": [
      {
        "text": "Overview and evidence",
        "link": "/practice/aws/"
      },
      {
        "text": "Practitioner track",
        "link": "/practice/aws/practitioner"
      },
      {
        "text": "Associate track",
        "link": "/practice/aws/associate"
      },
      {
        "text": "Repeating tasks",
        "link": "/practice/aws/repeat-map"
      },
      {
        "text": "Optional additions",
        "link": "/practice/aws/optional-extensions"
      },
      {
        "text": "Source corrections",
        "link": "/practice/aws/source-notes"
      }
    ]
  },
  {
    "text": "Practitioner modules",
    "collapsed": true,
    "items": [
      {
        "text": "P01 \u2014 Account setup",
        "link": "/practice/aws/practitioner-01"
      },
      {
        "text": "P02 \u2014 Frontend hosting",
        "link": "/practice/aws/practitioner-02"
      },
      {
        "text": "P03 \u2014 Serverless product API",
        "link": "/practice/aws/practitioner-03"
      },
      {
        "text": "P04 \u2014 DynamoDB integration",
        "link": "/practice/aws/practitioner-04"
      },
      {
        "text": "P05 \u2014 S3 file imports",
        "link": "/practice/aws/practitioner-05"
      },
      {
        "text": "P06 \u2014 SQS and SNS integration",
        "link": "/practice/aws/practitioner-06"
      },
      {
        "text": "P07 \u2014 Authorization",
        "link": "/practice/aws/practitioner-07"
      },
      {
        "text": "P08 \u2014 RDS order service",
        "link": "/practice/aws/practitioner-08"
      }
    ]
  },
  {
    "text": "Associate labs",
    "collapsed": true,
    "items": [
      {
        "text": "A01 \u2014 Account, security, CLI and budgets",
        "link": "/practice/aws/associate-01"
      },
      {
        "text": "A02 \u2014 IAM groups, policies and roles",
        "link": "/practice/aws/associate-02"
      },
      {
        "text": "A03 \u2014 EC2, EBS, load balancing and Auto Scaling",
        "link": "/practice/aws/associate-03"
      },
      {
        "text": "A04 \u2014 S3 management, hosting and SDK access",
        "link": "/practice/aws/associate-04"
      },
      {
        "text": "A05 \u2014 CloudFront origins, behaviors and invalidation",
        "link": "/practice/aws/associate-05"
      },
      {
        "text": "A06 \u2014 CloudFormation and CDK infrastructure",
        "link": "/practice/aws/associate-06"
      },
      {
        "text": "A07 \u2014 Custom VPC and connectivity",
        "link": "/practice/aws/associate-07"
      },
      {
        "text": "A08 \u2014 DynamoDB and RDS application integration",
        "link": "/practice/aws/associate-08"
      },
      {
        "text": "A09 \u2014 SQS orders, DynamoDB streams and SNS",
        "link": "/practice/aws/associate-09"
      },
      {
        "text": "A10 \u2014 Serverless APIs, versions and S3 triggers",
        "link": "/practice/aws/associate-10"
      },
      {
        "text": "A11 \u2014 CI/CD, quality gates and SAM",
        "link": "/practice/aws/associate-11"
      },
      {
        "text": "A12 \u2014 Q Developer and AWS AI integrations",
        "link": "/practice/aws/associate-12"
      }
    ]
  },
  {
    "text": "Reading",
    "items": [
      {
        "text": "AWS chapters",
        "link": "/aws/"
      }
    ]
  }
],
      "/aws/": [
  {
    "text": "Cloud foundations",
    "items": [
      {
        "text": "Reading order",
        "link": "/aws/"
      },
      {
        "text": "Beginner guide: understand the cloud before the services",
        "link": "/aws/beginner-guide"
      },
      {
        "text": "Account, development tools and cost awareness",
        "link": "/aws/account-and-tools"
      },
      {
        "text": "IAM: identities, roles and permissions",
        "link": "/aws/iam-and-security"
      },
      {
        "text": "CDK and CloudFormation: infrastructure as code",
        "link": "/aws/infrastructure-as-code"
      }
    ]
  },
  {
    "text": "Application services",
    "items": [
      {
        "text": "S3 and CloudFront: storage and frontend delivery",
        "link": "/aws/storage-and-frontend"
      },
      {
        "text": "Lambda and API Gateway: serverless application boundaries",
        "link": "/aws/serverless-and-apis"
      },
      {
        "text": "DynamoDB and RDS: choose persistence by access pattern",
        "link": "/aws/databases"
      },
      {
        "text": "S3 uploads and event-driven imports",
        "link": "/aws/file-imports"
      },
      {
        "text": "SQS and SNS: asynchronous communication",
        "link": "/aws/messaging"
      },
      {
        "text": "Cognito and application access",
        "link": "/aws/authentication"
      }
    ]
  },
  {
    "text": "Infrastructure and operations",
    "items": [
      {
        "text": "VPC networking: trace the path before changing rules",
        "link": "/aws/networking"
      },
      {
        "text": "EC2, load balancing and scaling",
        "link": "/aws/compute-and-scaling"
      },
      {
        "text": "Delivery, observability and resource cleanup",
        "link": "/aws/delivery-and-operations"
      }
    ]
  },
  {
    "text": "Optional depth and references",
    "items": [
      {
        "text": "AWS AI services: optional integration",
        "link": "/aws/ai-services"
      },
      {
        "text": "Coverage, source notes and certification",
        "link": "/aws/coverage-and-sources"
      }
    ]
  },
  {
    "text": "Homework",
    "items": [
      {
        "text": "Required tracks and optional additions",
        "link": "/practice/aws/"
      }
    ]
  }
],
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
    "text": "Engineering foundations",
    "items": [
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
      }
    ]
  },
  {
    "text": "Examples and independent practice",
    "items": [
      {
        "text": "Workbench",
        "link": "/workbench/engineering/"
      },
      {
        "text": "Shared practice",
        "link": "/practice/engineering/"
      }
    ]
  },
  {
    "text": "Hub inventory and verification",
    "items": [
      {
        "text": "Current inventory",
        "link": "/review/"
      },
      {
        "text": "Verification and limitations",
        "link": "/review/verification"
      }
    ]
  }
],
"/practice/engineering/": [
  {
    "text": "Engineering foundations",
    "items": [
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
      }
    ]
  },
  {
    "text": "Examples and independent practice",
    "items": [
      {
        "text": "Workbench",
        "link": "/workbench/engineering/"
      },
      {
        "text": "Shared practice",
        "link": "/practice/engineering/"
      }
    ]
  },
  {
    "text": "Hub inventory and verification",
    "items": [
      {
        "text": "Current inventory",
        "link": "/review/"
      },
      {
        "text": "Verification and limitations",
        "link": "/review/verification"
      }
    ]
  }
],
"/workbench/engineering/": [
  {
    "text": "Engineering foundations",
    "items": [
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
      }
    ]
  },
  {
    "text": "Examples and independent practice",
    "items": [
      {
        "text": "Workbench",
        "link": "/workbench/engineering/"
      },
      {
        "text": "Shared practice",
        "link": "/practice/engineering/"
      }
    ]
  },
  {
    "text": "Hub inventory and verification",
    "items": [
      {
        "text": "Current inventory",
        "link": "/review/"
      },
      {
        "text": "Verification and limitations",
        "link": "/review/verification"
      }
    ]
  }
],
"/frontend/performance/": [performanceLearningSidebar, performanceHomeworkSidebar],
"/practice/frontend/performance/": [performanceHomeworkSidebar, performanceLearningSidebar],
"/senior_growth/Web_Performance/": [performanceLearningSidebar, performanceHomeworkSidebar, ...generateSidebar('senior_growth', '/senior_growth').filter(group => group.text === 'Web Performance')],
"/frontend/": [
  performanceLearningSidebar,
  performanceHomeworkSidebar,
  {
    "text": "Frontend foundations",
    "items": [
      {
        "text": "Reading order",
        "link": "/frontend/"
      },
      {
        "text": "HTML and browser",
        "link": "/frontend/html-browser"
      },
      {
        "text": "CSS layout and cascade",
        "link": "/senior_growth/CSS/"
      },
      {
        "text": "JavaScript",
        "link": "/frontend/javascript"
      },
      {
        "text": "TypeScript",
        "link": "/frontend/typescript"
      }
    ]
  },
  {
    "text": "Components and application architecture",
    "items": [
      {
        "text": "React",
        "link": "/frontend/react"
      },
      {
        "text": "Next and UI architecture",
        "link": "/frontend/next"
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
  },
  {
    "text": "Coverage and verification",
    "items": [
      {
        "text": "Coverage and ownership",
        "link": "/frontend/coverage-map"
      },
      {
        "text": "Verification and limits",
        "link": "/frontend/verification"
      }
    ]
  }
],
"/workbench/frontend/": [
  performanceHomeworkSidebar,
  {
    "text": "Frontend foundations",
    "items": [
      {
        "text": "Reading order",
        "link": "/frontend/"
      },
      {
        "text": "HTML and browser",
        "link": "/frontend/html-browser"
      },
      {
        "text": "CSS layout and cascade",
        "link": "/senior_growth/CSS/"
      },
      {
        "text": "JavaScript",
        "link": "/frontend/javascript"
      },
      {
        "text": "TypeScript",
        "link": "/frontend/typescript"
      }
    ]
  },
  {
    "text": "Components and application architecture",
    "items": [
      {
        "text": "React",
        "link": "/frontend/react"
      },
      {
        "text": "Next and UI architecture",
        "link": "/frontend/next"
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
  },
  {
    "text": "Coverage and verification",
    "items": [
      {
        "text": "Coverage and ownership",
        "link": "/frontend/coverage-map"
      },
      {
        "text": "Verification and limits",
        "link": "/frontend/verification"
      }
    ]
  }
],
"/practice/frontend/": [
  performanceHomeworkSidebar,
  {
    "text": "Frontend foundations",
    "items": [
      {
        "text": "Reading order",
        "link": "/frontend/"
      },
      {
        "text": "HTML and browser",
        "link": "/frontend/html-browser"
      },
      {
        "text": "CSS layout and cascade",
        "link": "/senior_growth/CSS/"
      },
      {
        "text": "JavaScript",
        "link": "/frontend/javascript"
      },
      {
        "text": "TypeScript",
        "link": "/frontend/typescript"
      }
    ]
  },
  {
    "text": "Components and application architecture",
    "items": [
      {
        "text": "React",
        "link": "/frontend/react"
      },
      {
        "text": "Next and UI architecture",
        "link": "/frontend/next"
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
  },
  {
    "text": "Coverage and verification",
    "items": [
      {
        "text": "Coverage and ownership",
        "link": "/frontend/coverage-map"
      },
      {
        "text": "Verification and limits",
        "link": "/frontend/verification"
      }
    ]
  }
],
      "/applied-ai/": [
  ...aiAppSidebar,
  {
    "text": "Applied AI foundations",
    "collapsed": true,
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
        "text": "Python — optional deep dive",
        "link": "/python-for-ai/"
      },
      {
        "text": "Shared foundations",
        "link": "/applied-ai/shared/"
      }
    ]
  },
  {
    "text": "Model integration and execution",
    "collapsed": true,
    "items": [
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
      }
    ]
  },
  {
    "text": "Security, evaluation and oversight",
    "collapsed": true,
    "items": [
      {
        "text": "Injection scope",
        "link": "/python-for-ai/prompt-injection-boundaries"
      },
      {
        "text": "Source/output security",
        "link": "/python-for-ai/source-and-output-security"
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
    "text": "RAG: ingestion, retrieval and answers",
    "items": [
      {
        "text": "RAG",
        "link": "/applied-ai/rag/"
      },
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
        "text": "Answering and failures",
        "link": "/applied-ai/rag/answering-and-failures"
      },
      {
        "text": "Retrieval debugging",
        "link": "/python-for-ai/retrieval-debugging"
      },
      {
        "text": "Cache and batch",
        "link": "/python-for-ai/cache-and-batch"
      }
    ],
    "collapsed": true
  },
  {
    "text": "Agent workflows and recovery",
    "items": [
      {
        "text": "Agent workflows",
        "link": "/applied-ai/workflows/"
      },
      {
        "text": "State and revisions",
        "link": "/python-for-ai/tool-workflow-state"
      },
      {
        "text": "Approval and receipts",
        "link": "/python-for-ai/approved-writes"
      },
      {
        "text": "Resumable runs",
        "link": "/applied-ai/workflows/resumable-runs"
      },
      {
        "text": "Workflow diagnostics",
        "link": "/python-for-ai/workflow-diagnostics"
      },
      {
        "text": "Graph/memory optional",
        "link": "/python-for-ai/graph-memory"
      }
    ],
    "collapsed": true
  },
  {
    "text": "n8n automation",
    "collapsed": true,
    "items": [
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
    ],
    "collapsed": true
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
  "text": "Beginner JavaScript project",
  "items": [
    {
      "text": "JS-00\u201309 milestones",
      "link": "/practice/applied-ai/javascript-assistant"
    },
    {
      "text": "JavaScript course",
      "link": "/applied-ai/"
    }
  ]
},
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
    "text": "Reasoning and representations",
    "items": [
      {
        "text": "Course and reading order",
        "link": "/cs-foundations/"
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
      }
    ]
  },
  {
    "text": "Algorithms and traversal",
    "items": [
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
      }
    ]
  },
  {
    "text": "Examples and independent practice",
    "items": [
      {
        "text": "Worked sources and checks",
        "link": "/workbench/cs-foundations/"
      },
      {
        "text": "Independent practice",
        "link": "/practice/cs-foundations/"
      }
    ]
  },
  {
    "text": "Coverage and boundaries",
    "items": [
      {
        "text": "Coverage map",
        "link": "/cs-foundations/coverage-map"
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
                                "text": "Runtime and modules",
                                "link": "/node-js/module-01-nodejs-foundations"
                        },
                        {
                                "text": "Standard library and ownership",
                                "link": "/node-js/module-02-standard-library"
                        },
                        {
                                "text": "Events, buffers and streams",
                                "link": "/node-js/module-03-events-buffers-streams"
                        },
                        {
                                "text": "Testing",
                                "link": "/node-js/module-04-testing"
                        },
                        {
                                "text": "HTTP and networking",
                                "link": "/node-js/module-05-networking"
                        },
                        {
                                "text": "Runtime diagnostics",
                                "link": "/node-js/module-11-performance-diagnostics"
                        },
                        {
                                "text": "Lifecycle and operations",
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
                ]
        },
        {
                "text": "Security and data handling",
                "items": [
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
                ]
        },
        {
                "text": "API transports and adapters",
                "items": [
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
      '/ai-assisted-engineering/': aiDevelopmentSidebar,
      '/python-for-ai/': [
  {
    "text": "Python — optional deep dive",
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
    "text": "Applied AI foundations",
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
      }
    ]
  },
  {
    "text": "Model integration and execution",
    "items": [
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
      }
    ],
    "collapsed": true
  },
  {
    "text": "Security, evaluation and oversight",
    "items": [
      {
        "text": "Injection scope",
        "link": "/python-for-ai/prompt-injection-boundaries"
      },
      {
        "text": "Source/output security",
        "link": "/python-for-ai/source-and-output-security"
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
        "text": "Audit and oversight",
        "link": "/python-for-ai/provenance-and-oversight"
      },
      {
        "text": "Provider lifecycle",
        "link": "/python-for-ai/provider-data-lifecycle"
      }
    ],
    "collapsed": true
  },
  {
    "text": "RAG: ingestion, retrieval and answers",
    "items": [
      {
        "text": "RAG",
        "link": "/applied-ai/rag/"
      },
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
        "text": "Answering and failures",
        "link": "/applied-ai/rag/answering-and-failures"
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
    "text": "Agent workflows and recovery",
    "items": [
      {
        "text": "Agent workflows",
        "link": "/applied-ai/workflows/"
      },
      {
        "text": "State and revisions",
        "link": "/python-for-ai/tool-workflow-state"
      },
      {
        "text": "Approval and receipts",
        "link": "/python-for-ai/approved-writes"
      },
      {
        "text": "Resumable runs",
        "link": "/applied-ai/workflows/resumable-runs"
      },
      {
        "text": "Workflow diagnostics",
        "link": "/python-for-ai/workflow-diagnostics"
      },
      {
        "text": "Graph/memory optional",
        "link": "/python-for-ai/graph-memory"
      }
    ]
  },
  {
    "text": "n8n automation",
    "items": [
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
  }
],
      '/senior_growth/': generateSidebar('senior_growth', '/senior_growth/')
    }
  }
}))
