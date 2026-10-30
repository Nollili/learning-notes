import { Annotation, Command, END, interrupt, MemorySaver, START, StateGraph } from '@langchain/langgraph';
import { proposeRename } from '../javascript/core.mjs';

const State = Annotation.Root({
  noteId: Annotation(), title: Annotation(), proposal: Annotation(), status: Annotation()
});

export function createReviewGraph() {
  return new StateGraph(State)
    .addNode('draft', state => ({ proposal: proposeRename(state.noteId, state.title), status: 'awaiting_review' }))
    .addNode('review', () => {
      const decision = interrupt({ question: 'Accept this proposal for the exercise? No note will be changed.' });
      if (!decision || typeof decision.approved !== 'boolean' || Object.keys(decision).length !== 1) {
        throw new Error('Expected exactly { approved: boolean }.');
      }
      return { status: decision.approved ? 'reviewed' : 'rejected' };
    })
    .addNode('finish', () => ({ status: 'finished_without_write' }))
    .addEdge(START, 'draft')
    .addEdge('draft', 'review')
    .addConditionalEdges('review', state => state.status === 'reviewed' ? 'finish' : END)
    .addEdge('finish', END)
    .compile({ checkpointer: new MemorySaver() });
}

export { Command };
