// eslint.config.mjs
export default [{
  files: ['src/**/*.js'],
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: { 'no-undef': 'error', 'no-unused-vars': 'error', eqeqeq: ['error', 'always'] },
}];
