// progress-socket.ts
export function openProgressSocket(url: string, consume: (completed: number) => undefined,
  status: (state: 'open' | 'closed' | 'error') => undefined,
  create: (url: string) => WebSocket = url => new WebSocket(url)) {
  const endpoint = new URL(url);
  if (endpoint.protocol !== 'wss:' || endpoint.username || endpoint.password || endpoint.hash)
    throw new TypeError('Expected credential-free WSS URL');
  const socket = create(endpoint.href);
  let stopped = false;
  const dispose = () => {
    if (stopped) return;
    stopped = true;
    socket.removeEventListener('open', opened);
    socket.removeEventListener('message', message);
    socket.removeEventListener('error', error);
    socket.removeEventListener('close', closed);
    if (socket.readyState < 2) socket.close(1000, 'Owner disposed');
  };
  const opened = () => { if (!stopped) status('open'); };
  const error = () => { if (!stopped) { dispose(); status('error'); } };
  const closed = () => { if (!stopped) { dispose(); status('closed'); } };
  const message = (event: MessageEvent<unknown>) => {
    if (stopped) return;
    let completed: number;
    try {
      if (typeof event.data !== 'string' || event.data.length > 4096)
        throw new TypeError('Unsupported message');
      const value: unknown = JSON.parse(event.data);
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError();
      const record = value as Record<string, unknown>;
      if (Object.keys(record).length !== 2 || record.type !== 'progress' ||
          typeof record.completed !== 'number' || !Number.isSafeInteger(record.completed) ||
          record.completed < 0) throw new TypeError('Invalid progress');
      completed = record.completed;
    } catch { error(); return; }
    consume(completed);
  };
  socket.addEventListener('open', opened);
  socket.addEventListener('message', message);
  socket.addEventListener('error', error);
  socket.addEventListener('close', closed);
  return {
    dispose,
    refresh(): boolean {
      if (stopped || socket.readyState !== 1) return false;
      const frame = '{"type":"refresh"}';
      // This ASCII frame's character count equals its UTF-8 byte count.
      if (socket.bufferedAmount + frame.length > 16_384) { error(); return false; }
      try { socket.send(frame); return true; }
      catch { error(); return false; }
    },
  };
}
