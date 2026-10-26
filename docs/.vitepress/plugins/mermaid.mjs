export function mermaidPlugin(md) {
  const defaultFence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, index, options, environment, renderer) => {
    const token = tokens[index]
    const language = token.info.trim().split(/\s+/)[0]

    if (language === 'mermaid') {
      const encodedSource = encodeURIComponent(token.content.trim())
      return `<MermaidDiagram encoded-source="${encodedSource}" />\n`
    }

    return defaultFence(tokens, index, options, environment, renderer)
  }
}
