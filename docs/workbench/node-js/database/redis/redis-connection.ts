// redis-connection.ts
import { createClient } from 'redis';
export async function openRedis(url: string) {
  const client = createClient({
    url, socket: { connectTimeout: 1000, socketTimeout: 1000, reconnectStrategy: false },
    disableOfflineQueue: true, commandsQueueMaxLength: 64,
  });
  client.on('error', () => console.warn('redis.connection_error'));
  try { await client.connect(); } catch (error) {
    if (client.isOpen) client.destroy();
    throw error;
  }
  return {
    client,
    async close(): Promise<void> {
      if (!client.isOpen) return;
      const deadline = setTimeout(() => { if (client.isOpen) client.destroy(); }, 1000);
      try { await client.close(); } finally { clearTimeout(deadline); }
    },
  };
}
export type OwnedRedis = Awaited<ReturnType<typeof openRedis>>['client'];
