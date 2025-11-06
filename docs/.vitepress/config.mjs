import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

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
  themeConfig: {
    hero: {
      name: 'My notes for bench learning',
      actions: [
        { theme: 'alt', text: 'Materials', link: '/materials' },
        { theme: 'alt', text: 'Technical checks', link: '/knowledge_testing' },
        { theme: 'alt', text: 'Assessment', link: '/assessment' },
        { theme: 'alt', text: 'Senior growth', link: '/senior_growth/' }
      ]
    },
    sidebar: {
      '/': [
        { text: 'Materials', link: '/materials' },
        { text: 'Technical Checks', link: '/knowledge_testing' },
        { text: 'Assessment', link: '/assessment' },
        { text: 'ASMT materials', link: '/senior_growth' },
      ],
      '/senior_growth/': generateSidebar('senior_growth', '/senior_growth/')
    }
  }
})
