// latest-validation.js — one owner for a dependent value (e.g. course scope + normalized slug).
export function createLatestValidation(check, budgetMs = 2000) {
  if (!Number.isFinite(budgetMs) || budgetMs <= 0) throw new RangeError('Finite positive budget required');
  let generation = 0;
  let active;
  return {
    async run(value) {
      const mine = ++generation;
      active?.abort();
      const controller = new AbortController();
      active = controller;
      let timer;
      const deadline = new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new Error('Validation deadline')); }, budgetMs);
      });
      try {
        const available = await Promise.race([Promise.resolve().then(() => check(value, controller.signal)), deadline]);
        if (mine !== generation || controller.signal.aborted) return { kind: 'stale' };
        if (typeof available !== 'boolean') throw new Error('Invalid validation response');
        return { kind: available ? 'available' : 'unavailable', value };
      } catch {
        return mine !== generation ? { kind: 'stale' } : { kind: 'error', value };
      } finally { clearTimeout(timer); if (mine === generation) active = undefined; }
    },
    cancel() { ++generation; active?.abort(); active = undefined; }
  };
}
