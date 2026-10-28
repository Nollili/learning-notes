// entry.js
import { dependencyReady } from './dependency.js';
if (!dependencyReady) throw new Error('Module dependency missing');
window.scriptTrace.push('module-start');
await new Promise(resolve => setTimeout(resolve, 50));
window.scriptTrace.push('module-continuation');
