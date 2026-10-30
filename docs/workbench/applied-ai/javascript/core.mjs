export class InputError extends Error {}

export function question(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 1000) {
    throw new InputError('Use a question of 1–1000 characters.');
  }
  return value.trim();
}

export function history(value = []) {
  if (!Array.isArray(value) || value.length > 8 || value.length % 2 !== 0) {
    throw new InputError('History must contain at most four complete turns.');
  }
  return value.map((message, i) => {
    if (!message || message.role !== (i % 2 === 0 ? 'user' : 'assistant') ||
        typeof message.content !== 'string' || !message.content.trim() || message.content.length > 4000) {
      throw new InputError('Invalid history message.');
    }
    return { role: message.role, content: message.content };
  });
}

export function nextHistory(previous, user, assistant) {
  return [...history(previous), { role: 'user', content: question(user) },
    { role: 'assistant', content: assistant }].slice(-8);
}

// Representative data only. Public fixture means no real identity/tenant system.
export const notes = Object.freeze([
  Object.freeze({ id: 'n1', title: 'Cancellation', text: 'AbortController cancels a pending fetch request.' }),
  Object.freeze({ id: 'n2', title: 'Secrets', text: 'Keep API keys on the server, outside browser code.' }),
  Object.freeze({ id: 'n3', title: 'History', text: 'Send relevant previous messages to provide conversation context.' })
]);

export function getNote(args) {
  if (!args || typeof args !== 'object' || Object.keys(args).length !== 1 || typeof args.id !== 'string') {
    throw new InputError('Expected exactly one string field: id.');
  }
  const note = notes.find(item => item.id === args.id);
  if (!note) throw new InputError('Unknown public note.');
  return { ...note };
}

export function dispatch(name, args) {
  if (name !== 'get_note') throw new InputError('Unknown tool.');
  return getNote(args);
}

const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'to', 'for', 'of', 'in', 'on', 'i', 'do', 'how', 'who', 'what']);
const terms = text => new Set((text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(word => !stopWords.has(word)));
export function retrieve(input, catalogue = notes) {
  const words = terms(question(input));
  return catalogue.map(note => ({ ...note, score: [...terms(`${note.title} ${note.text}`)]
    .filter(word => words.has(word)).length }))
    .filter(note => note.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 2);
}

export function validateDecision(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).sort().join(',') !== 'category,quote' ||
      !['ai', 'other', 'review'].includes(value.category) ||
      typeof value.quote !== 'string' || value.quote.length > 200) {
    throw new InputError('Invalid classification.');
  }
  return value;
}

export function validateQuote(decision, source) {
  validateDecision(decision);
  if (typeof source !== 'string' || (decision.category !== 'review' &&
      (!decision.quote || !source.includes(decision.quote)))) throw new InputError('Unsupported quote.');
  return decision;
}

// A proposal-only state machine: no mutation, persistence or trusted approval UI.
export function proposeRename(id, title) {
  getNote({ id });
  if (typeof title !== 'string' || !title.trim() || title.length > 80) throw new InputError('Invalid title.');
  return Object.freeze({ status: 'awaiting_review', noteId: id, title: title.trim() });
}

export function reviewProposal(proposal, approved) {
  if (proposal?.status !== 'awaiting_review' || typeof approved !== 'boolean') {
    throw new InputError('Expected pending proposal and explicit boolean decision.');
  }
  return { ...proposal, status: approved ? 'reviewed' : 'rejected' };
}
