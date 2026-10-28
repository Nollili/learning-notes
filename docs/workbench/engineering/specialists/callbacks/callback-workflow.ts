// callback-workflow.ts
export type Completion<T> = (...result: [error: Error] | [error: null, value: T]) => void;
export function fromCallback<T>(start: (done: Completion<T>) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const done: Completion<T> = (...result) => {
      if (settled) return;
      settled = true;
      if (result[0] === null) resolve(result[1]); else reject(result[0]);
    };
    try { start(done); }
    catch (error) { if (!settled) { settled = true; reject(error); } }
  });
}
export type OrderApi = {
  user: (id: string) => Promise<{ id: string }>;
  orders: (userId: string) => Promise<readonly { id: string }[]>;
  details: (orderId: string) => Promise<{ id: string }>;
  notify: (details: { id: string }) => Promise<void>;
};
export type NotificationResult = { kind: 'no_orders' } | { kind: 'notified'; orderId: string };
export async function notifyFirstOrder(userId: string, api: OrderApi): Promise<NotificationResult> {
  const user = await api.user(userId);
  const orders = await api.orders(user.id);
  const first = orders[0];
  if (first === undefined) return { kind: 'no_orders' };
  const details = await api.details(first.id);
  await api.notify(details);
  return { kind: 'notified', orderId: details.id };
}
