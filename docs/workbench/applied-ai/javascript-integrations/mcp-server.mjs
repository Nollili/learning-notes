import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getNote } from '../javascript/core.mjs';

const server = new McpServer({ name: 'public-learning-notes', version: '1.0.0' });
server.registerTool('get_note', {
  description: 'Read one public synthetic study note. No private files or writes.',
  inputSchema: { id: z.enum(['n1', 'n2', 'n3']) }
}, async ({ id }) => ({ content: [{ type: 'text', text: JSON.stringify(getNote({ id })) }] }));

server.registerResource('study-guide', 'study://guide', {
  description: 'Public guide for this synthetic note catalogue.', mimeType: 'text/plain'
}, async uri => ({ contents: [{ uri: uri.href, mimeType: 'text/plain', text: 'Use n1 for cancellation, n2 for keys and n3 for history.' }] }));

server.registerPrompt('explain-note', {
  description: 'Ask for a beginner explanation of a public note.', argsSchema: { id: z.enum(['n1', 'n2', 'n3']) }
}, async ({ id }) => ({ messages: [{ role: 'user', content: { type: 'text', text: `Explain this public study note simply: ${getNote({ id }).text}` } }] }));

// stdout belongs to the JSON-RPC transport. Diagnostics, if any, go to stderr.
await server.connect(new StdioServerTransport());
