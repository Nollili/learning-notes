// tokens.mjs — build-time input, never populated from untrusted requests
export const palette = Object.freeze({
  white: '#ffffff', ink: '#17212f', blue: '#173d70', paleBlue: '#b7d3ff',
  paleInk: '#f5f7fa', deepBlue: '#102442', orange: '#a83500', yellow: '#ffca80'
});
export const themes = {
  light: { surface: 'white', text: 'ink', 'action-bg': 'blue',
    'action-text': 'white', 'focus-ring': 'orange' },
  dark: { surface: 'ink', text: 'paleInk', 'action-bg': 'paleBlue',
    'action-text': 'deepBlue', 'focus-ring': 'yellow' }
};
export function buildTokens(palette, themes) {
  const names = ['surface', 'text', 'action-bg', 'action-text', 'focus-ring'];
  const output = {};
  for (const mode of ['light', 'dark']) {
    const source = themes[mode];
    if (!source || Object.keys(source).length !== names.length)
      throw new Error(`Invalid theme ${mode}`);
    output[mode] = Object.fromEntries(names.map(name => {
      const alias = source[name];
      if (!Object.hasOwn(palette, alias)) throw new Error(`Unknown token ${name}`);
      const color = palette[alias];
      if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`Invalid color ${name}`);
      return [name, color];
    }));
  }
  const css = Object.entries(output).map(([mode, values]) =>
    `:root[data-theme="${mode}"] {\n` +
    Object.entries(values).map(([name, value]) => `  --${name}: ${value};`).join('\n') +
    '\n}').join('\n');
  // Generated TS retains literal theme/token keys for consumers.
  const ts = `export const colors = ${JSON.stringify(output, null, 2)} as const;\n`;
  return { css, ts };
}
