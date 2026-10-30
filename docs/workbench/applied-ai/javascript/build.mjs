import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

// Plain JS has no compilation stage; build verifies syntax, including browser JS.
for (const directory of ['.', 'public', 'checks']) {
  for (const file of await readdir(new URL(`${directory}/`, import.meta.url))) {
    if (!/\.(mjs|js)$/.test(file)) continue;
    const result = spawnSync(process.execPath, ['--check', `${directory}/${file}`], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(1);
  }
}
console.log('JavaScript syntax checks passed (no bundling or type checking).');
