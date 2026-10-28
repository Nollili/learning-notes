// No live broker: exercise ownership when startup or publication fails.
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import amqp from 'amqplib';
import { connect } from './rabbit.mjs';
const original = amqp.connect;
let connectionClosed, publisherClosed, consumerClosed;
function fixture(stage) {
  connectionClosed = publisherClosed = consumerClosed = 0;
  const publisher = Object.assign(new EventEmitter(), {
    async assertQueue() { if (stage === 'queue') throw new Error('queue'); },
    async close() { publisherClosed++; },
    sendToQueue() { throw new Error('send'); },
  });
  const consumer = Object.assign(new EventEmitter(), {
    async prefetch() { throw new Error('prefetch'); },
    async close() { consumerClosed++; },
  });
  const connection = Object.assign(new EventEmitter(), {
    async createConfirmChannel() { if (stage === 'channel') throw new Error('channel'); return publisher; },
    async createChannel() { return consumer; },
    async close() { connectionClosed++; },
  });
  amqp.connect = async () => connection;
  return publisher;
}
try {
  fixture('channel');
  await assert.rejects(connect('unused', 'owned'), /channel/);
  assert.equal(connectionClosed, 1);
  fixture('queue');
  await assert.rejects(connect('unused', 'owned'), /queue/);
  assert.equal(connectionClosed, 1); assert.equal(publisherClosed, 1);
  const publisher = fixture('send');
  const owner = await connect('unused', 'owned');
  await assert.rejects(owner.publish({ id: '123e4567-e89b-42d3-a456-426614174000', kind: 'catalogue.refresh', tenant: 'test' }), /send/);
  assert.equal(publisher.listenerCount('return'), 0);
  await assert.rejects(owner.worker(async () => {}), /prefetch/);
  assert.equal(consumerClosed, 1);
  await owner.close();
  assert.equal(connectionClosed, 1); assert.equal(publisherClosed, 1);
  console.log('Messaging ownership checks passed; live broker delivery remains a separate check.');
} finally { amqp.connect = original; }
