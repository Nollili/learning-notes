import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createReviewGraph, Command } from './graph.mjs';

const transport = new StdioClientTransport({ command: process.execPath,
  args: [fileURLToPath(new URL('mcp-server.mjs', import.meta.url))],
  env: {}, stderr: 'pipe' });
const client = new Client({ name: 'study-check', version: '1.0.0' });
try {
  await client.connect(transport);
  assert.equal((await client.listTools()).tools[0].name, 'get_note');
  const result = await client.callTool({ name: 'get_note', arguments: { id: 'n1' } });
  assert.equal(JSON.parse(result.content[0].text).id, 'n1');
  const bad = await client.callTool({ name: 'get_note', arguments: { id: '../private' } });
  assert.equal(bad.isError, true);
  const resources = await client.listResources();
  assert.equal(resources.resources[0].uri, 'study://guide');
  assert.match((await client.readResource({ uri: 'study://guide' })).contents[0].text, /cancellation/);
  assert.equal((await client.listPrompts()).prompts[0].name, 'explain-note');
  assert.equal((await client.getPrompt({ name: 'explain-note', arguments: { id: 'n2' } })).messages[0].role, 'user');
} finally { await client.close(); }
console.log('Actual SDK stdio discovery, allowed/invalid tool, resource and prompt checks passed.');

const graph = createReviewGraph();
const config = { configurable: { thread_id: 'synthetic-review-1' }, recursionLimit: 8 };
const pending = await graph.invoke({ noteId: 'n1', title: 'Cancelling fetch' }, config);
assert.equal(pending.status, 'awaiting_review');
assert.ok(pending.__interrupt__.length);
const done = await graph.invoke(new Command({ resume: { approved: true } }), config);
assert.equal(done.status, 'finished_without_write');
const second = { configurable: { thread_id: 'synthetic-review-2' }, recursionLimit: 8 };
await graph.invoke({ noteId: 'n2', title: 'Server secrets' }, second);
assert.equal((await graph.invoke(new Command({ resume: { approved: false } }), second)).status, 'rejected');
assert.equal((await graph.getState(config)).values.proposal.noteId, 'n1');
console.log('Actual LangGraph branching, interruption, resume and separate RAM thread checks passed. No model or write.');
