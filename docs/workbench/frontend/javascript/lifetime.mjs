function asyncLesson(log) {
  log('start');
  let cancelled = false;
  const timer = setTimeout(() => { if (!cancelled) log('timer'); }, 0);
  Promise.resolve().then(() => { if (!cancelled) log('promise'); });
  log('end');
  return () => { cancelled = true; clearTimeout(timer); };
}

export { asyncLesson };
