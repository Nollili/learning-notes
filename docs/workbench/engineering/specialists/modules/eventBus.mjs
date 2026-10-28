// eventBus.mjs — local, trusted application notification contract
export function createBus() {
  const events = new Map();
  return {
    on(event, handler) {
      if (typeof event !== 'string' || !event || event.length > 80 || typeof handler !== 'function') throw new TypeError('Invalid subscription');
      let listeners = events.get(event);
      if (!listeners) {
        if (events.size >= 20) throw new RangeError('Event budget');
        listeners = new Set(); events.set(event, listeners);
      }
      if (listeners.size >= 50) throw new RangeError('Listener budget');
      const entry = {handler}; listeners.add(entry);
      return () => {
        listeners.delete(entry);
        if (events.get(event) === listeners && listeners.size === 0) events.delete(event);
      };
    },
    async emit(event, data) {
      const snapshot = [...(events.get(event) ?? [])], failures = [];
      for (const {handler} of snapshot) {
        try { await handler(data); } catch (error) { failures.push(error); }
      }
      if (failures.length) throw new AggregateError(failures, 'Notification failed');
    },
    clear() { events.clear(); }
  };
}
