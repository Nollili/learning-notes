function checkpointFixture(log) {
  log('start');
  setTimeout(() => log('timer'), 0);
  queueMicrotask(() => { log('micro-1'); queueMicrotask(() => log('micro-3')); });
  Promise.resolve().then(() => log('micro-2'));
  log('end');
}

export { checkpointFixture };
