// traversals.ts
export type Graph = ReadonlyMap<string, readonly string[]>;
function checkGraph(graph: Graph, start: string): void {
  if (graph.size > 200 || !graph.has(start)) throw new Error('Invalid graph/start');
  let edges = 0;
  for (const [vertex, neighbors] of graph) {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(vertex) || !Array.isArray(neighbors)
      || neighbors.length > 200 || new Set(neighbors).size !== neighbors.length) throw new Error('Invalid adjacency');
    edges += neighbors.length;
    if (edges > 2000) throw new Error('Graph edge budget exceeded');
    for (let i = 0; i < neighbors.length; i++) {
      const next = neighbors[i];
      if (typeof next !== 'string' || !graph.has(next)) throw new Error('Missing vertex');
    }
  }
}
export function breadthFirst(graph: Graph, start: string) {
  checkGraph(graph, start);
  const queue = [start];
  const distance = new Map<string, number>([[start, 0]]);
  const order: string[] = [];
  for (let head = 0; head < queue.length; head++) {
    const vertex = queue[head];
    if (vertex === undefined) throw new Error('Invalid queue invariant');
    order.push(vertex);
    const depth = distance.get(vertex);
    if (depth === undefined) throw new Error('Invalid distance invariant');
    for (const next of graph.get(vertex) ?? []) {
      if (distance.has(next)) continue; // Mark at enqueue, not after processing.
      distance.set(next, depth + 1);
      queue.push(next);
    }
  }
  return { order, distance };
}
export function depthFirst(graph: Graph, start: string) {
  checkGraph(graph, start);
  const visited = new Set([start]);
  const preorder = [start];
  const postorder: string[] = [];
  const stack = [{ vertex: start, nextIndex: 0 }];
  while (stack.length) {
    const frame = stack[stack.length - 1];
    if (!frame) throw new Error('Invalid stack invariant');
    const neighbors = graph.get(frame.vertex) ?? [];
    if (frame.nextIndex >= neighbors.length) { postorder.push(frame.vertex); stack.pop(); continue; }
    const next = neighbors[frame.nextIndex++];
    if (next === undefined) throw new Error('Invalid adjacency invariant');
    if (!visited.has(next)) {
      visited.add(next); preorder.push(next); stack.push({ vertex: next, nextIndex: 0 });
    }
  }
  return { preorder, postorder };
}
export type TreeNode = { value: number; left: TreeNode | null; right: TreeNode | null };
export function inorder(root: TreeNode | null): number[] {
  const output: number[] = [];
  const stack: TreeNode[] = [];
  const seen = new Set<TreeNode>();
  let current = root;
  while (current !== null || stack.length) {
    while (current !== null) {
      if (seen.has(current) || seen.size >= 200 || !Number.isFinite(current.value)) throw new Error('Invalid/big tree');
      seen.add(current); stack.push(current); current = current.left;
    }
    const node = stack.pop();
    if (!node) throw new Error('Invalid tree stack');
    output.push(node.value); current = node.right;
  }
  return output;
}
