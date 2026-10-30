import { dispatch, retrieve, validateQuote, proposeRename, reviewProposal } from './core.mjs';

console.log('Validated classification:', validateQuote({ category: 'ai', quote: 'API keys' }, 'Keep API keys on the server.'));
console.log('Read tool:', dispatch('get_note', { id: 'n1' }));
const matches = retrieve('How do I cancel fetch?');
console.log('Lexical retrieval (not embeddings):', matches.map(({ id, text }) => ({ id, text })));
console.log('Unsupported question:', retrieve('Who won the tennis tournament?'));
const proposal = proposeRename('n1', 'Cancelling a request');
console.log('Proposal:', proposal);
console.log('Reviewed proposal (no write performed):', reviewProposal(proposal, true));
