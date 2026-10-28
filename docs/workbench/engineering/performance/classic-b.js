// classic-b.js
if (!window.scriptTrace.includes('classic-a')) throw new Error('Classic dependency missing');
window.scriptTrace.push('classic-b');
