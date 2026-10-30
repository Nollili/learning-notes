import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { answer, settings } from './model.mjs';
import { nextHistory } from './core.mjs';

const config = settings();
const rl = createInterface({ input: stdin, output: stdout });
let previous = [];
console.log(`Mode: ${config.mode}. Type /exit to stop; /reset to clear history.`);
try {
  while (true) {
    const input = await rl.question('You: ');
    if (input === '/exit') break;
    if (input === '/reset') { previous = []; continue; }
    try {
      const text = await answer(input, previous, { config });
      previous = nextHistory(previous, input, text);
      console.log(`Assistant: ${text}`);
    } catch { console.log('Request failed. Check input, mode and server configuration.'); }
  }
} finally { rl.close(); }
