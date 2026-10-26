const { spawnSync } = require('node:child_process');
const path = require('node:path');
test('Task Board database, browser security, rotation and lifecycle acceptance', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'acceptance.mjs')], {
    cwd: path.join(__dirname, '..'), env: process.env, encoding: 'utf8', timeout: 90000,
  });
  if (result.status !== 0) throw new Error(result.stdout + result.stderr);
}, 95000);
