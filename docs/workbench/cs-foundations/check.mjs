import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
const build = process.env.CS_REFERENCE_BUILD;
if (!build || !path.isAbsolute(build)) throw new Error('CS_REFERENCE_BUILD must name an absolute compiled source directory');
const require = createRequire(import.meta.url);
const { lowerBound, binarySearchFirst } = require(path.join(build, 'search.js'));
const { quickSortTrace } = require(path.join(build, 'sort.js'));
const { BoundedQueue } = require(path.join(build, 'queue.js'));
const { MinPriorityQueue } = require(path.join(build, 'heap.js'));
const { breadthFirst, depthFirst, inorder } = require(path.join(build, 'traversals.js'));
let seed = 47219;
function random(n) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; }
let arrays = 0;
function checkArray(input) {
  arrays++;
  const original = [...input];
  const expected = [...input].sort((a, b) => a - b);
  const sorted = quickSortTrace(input);
  assert.deepEqual(sorted.values, expected); assert.deepEqual(input, original);
  assert.notEqual(sorted.values, input);
  for (const target of [-2, -1, 0, 1, 2]) {
    let reads = 0;
    const observed = new Proxy(expected, { get(array, key) {
      if (typeof key === 'string' && /^\d+$/.test(key)) reads++;
      return Reflect.get(array, key);
    } });
    let boundary = expected.findIndex(value => value >= target);
    if (boundary < 0) boundary = expected.length;
    assert.equal(lowerBound(observed, target), boundary);
    assert(reads <= (input.length ? Math.floor(Math.log2(input.length)) + 1 : 0));
    assert.equal(binarySearchFirst(expected, target), expected.findIndex(value => value === target));
  }
}
function enumerate(prefix, length) {
  if (prefix.length === length) return checkArray(prefix);
  for (const value of [-1, 0, 1]) enumerate([...prefix, value], length);
}
for (let length = 0; length <= 6; length++) enumerate([], length);
assert.equal(lowerBound([2,4,4,9], 4), 1);
for (const bad of [NaN, Infinity, -Infinity]) assert.throws(() => lowerBound([], bad));
for (let n = 1; n <= 128; n++) {
  for (const input of [Array.from({length:n}, (_,i)=>i), Array(n).fill(2)]) {
    const result = quickSortTrace(input);
    assert.equal(result.comparisons, n * (n - 1) / 2);
    assert.equal(result.partitionSlots, result.comparisons);
    assert.equal(result.maxDepth, n);
  }
}
for (const invalid of [[NaN], [Infinity], new Array(2), Array(257).fill(0)]) assert.throws(() => quickSortTrace(invalid));
const wrap = new BoundedQueue(3);
for (const x of ['A','B','C']) wrap.enqueue(x);
assert.throws(() => wrap.enqueue('lost'));
assert.equal(wrap.dequeue(),'A');wrap.enqueue('D');
assert.deepEqual([wrap.dequeue(),wrap.dequeue(),wrap.dequeue()],['B','C','D']);
assert.throws(() => wrap.dequeue());
for (const capacity of [1, 3, 11]) {
  const queue = new BoundedQueue(capacity), model = [];
  for (let i = 0; i < 3000; i++) {
    if (random(2)) {
      const value = i % 4 ? {i} : undefined;
      if (model.length === capacity) assert.throws(() => queue.enqueue(value));
      else { model.push(value); queue.enqueue(value); }
    } else if (!model.length) assert.throws(() => queue.dequeue());
    else assert.equal(queue.dequeue(), model.shift());
    assert.equal(queue.size, model.length);
  }
  while (model.length) assert.equal(queue.dequeue(), model.shift());
  assert.throws(() => queue.dequeue());
}
for (const capacity of [0, -1, 1.5, NaN, 10001]) {
  assert.throws(() => new BoundedQueue(capacity));
  assert.throws(() => new MinPriorityQueue(capacity));
}
for (const capacity of [1, 3, 40]) {
  const heap = new MinPriorityQueue(capacity), model = [];
  let sequence = 0;
  function checkHeap() {
    const data = heap.snapshot();
    assert.equal(data.length, model.length);
    for (let i = 1; i < data.length; i++) {
      const parent = data[Math.floor((i - 1) / 2)], child = data[i];
      assert(parent.priority < child.priority || (parent.priority === child.priority && parent.sequence < child.sequence));
    }
    if (model.length) assert.equal(heap.peek(), model[0].value);
    else { assert.throws(() => heap.peek()); assert.throws(() => heap.pop()); }
  }
  for (let i = 0; i < 3000; i++) {
    if (random(3)) {
      const value = {i}, priority = random(7) - 3;
      if (model.length === capacity) assert.throws(() => heap.push(value, priority));
      else {
        heap.push(value, priority); model.push({value, priority, sequence: sequence++});
        model.sort((a,b)=>a.priority-b.priority || a.sequence-b.sequence);
      }
    } else if (model.length) assert.equal(heap.pop(), model.shift().value);
    checkHeap();
  }
  while (model.length) { assert.equal(heap.pop(), model.shift().value); checkHeap(); }
  for (const bad of [NaN, Infinity, -Infinity]) assert.throws(() => heap.push({}, bad));
  checkHeap();
}
// Independent all-pairs relaxation: unlike BFS, no frontier or discovery queue.
let graphs = 0;
function checkGraph(graph) {
  graphs++;
  const keys = [...graph.keys()], n = keys.length;
  const distances = Array.from({length:n}, (_,i)=>Array.from({length:n},(_,j)=>i===j?0:Infinity));
  for(let i=0;i<n;i++) for(const next of graph.get(keys[i])) {
    const j=keys.indexOf(next); distances[i][j]=Math.min(distances[i][j],1);
  }
  for(let k=0;k<n;k++) for(let i=0;i<n;i++) for(let j=0;j<n;j++)
    distances[i][j]=Math.min(distances[i][j],distances[i][k]+distances[k][j]);
  const before=JSON.stringify([...graph]);
  for(let i=0;i<n;i++) {
    const bfs=breadthFirst(graph, keys[i]), dfs=depthFirst(graph, keys[i]);
    const reachable=keys.filter((_,j)=>Number.isFinite(distances[i][j]));
    assert.deepEqual([...bfs.distance.keys()].sort(),[...reachable].sort());
    for(let j=0;j<n;j++) assert.equal(bfs.distance.get(keys[j]),Number.isFinite(distances[i][j])?distances[i][j]:undefined);
    assert.deepEqual([...dfs.preorder].sort(),[...reachable].sort());
    assert.deepEqual([...dfs.postorder].sort(),[...reachable].sort());
    assert.equal(new Set(bfs.order).size,bfs.order.length);
  }
  assert.equal(JSON.stringify([...graph]),before);
}
for(let mask=0;mask<512;mask++) {
  const keys=['a','b','c'];
  checkGraph(new Map(keys.map((key,i)=>[key,keys.filter((_,j)=>mask&(1<<(i*3+j)))])));
}
for(let trial=0;trial<100;trial++) {
 const keys=['a','b','c','d','z'];
 checkGraph(new Map(keys.map(key=>[key,keys.filter(()=>random(3)===0)])));
}
const fixture=new Map([['a',['b','c']],['b',['d']],['c',['d']],['d',['a']],['z',[]]]);
assert.deepEqual(breadthFirst(fixture,'a').order,['a','b','c','d']);
assert.deepEqual([...breadthFirst(fixture,'a').distance.values()],[0,1,1,2]);
assert.deepEqual(depthFirst(fixture,'a'),{preorder:['a','b','d','c'],postorder:['d','b','c','a']});
for(const bad of [new Map(),new Map([['a',['missing']]]),new Map([['a',['a','a']]]),new Map([['a',[]],['bad\n',[]]]),new Map([['a',[]],['bad\r',[]]]),new Map([['a',[]],['!bad',[]]])])
 for(const traverse of [breadthFirst,depthFirst]) assert.throws(()=>traverse(bad,'a'));
const tooMany=new Map(Array.from({length:201},(_,i)=>['v'+i,[]]));
assert.throws(()=>breadthFirst(tooMany,'v0'));
const denseKeys=Array.from({length:50},(_,i)=>'v'+i);
assert.throws(()=>depthFirst(new Map(denseKeys.map(k=>[k,denseKeys])),'v0'));
assert.throws(()=>breadthFirst(fixture,'unknown'));
const leaf=value=>({value,left:null,right:null});
assert.deepEqual(inorder(null),[]);
assert.deepEqual(inorder({value:2,left:leaf(1),right:leaf(3)}),[1,2,3]);
assert.deepEqual(inorder({value:1,left:leaf(3),right:leaf(2)}),[3,1,2]);
const shared=leaf(1), cycle=leaf(2);cycle.left=cycle;
for(const invalid of [cycle,{value:2,left:shared,right:shared},leaf(NaN)]) assert.throws(()=>inorder(invalid));
let chain=null;for(let i=0;i<200;i++)chain={value:i,left:chain,right:null};
assert.equal(inorder(chain).length,200);assert.throws(()=>inorder({value:200,left:chain,right:null}));
// Execute the actual short textbook blocks, not a second copy of their functions.
const textbook=await readFile(new URL('../../cs-foundations/reasoning-and-recursion.md',import.meta.url),'utf8');
const blocks=[...textbook.matchAll(/```js\n([\s\S]*?)\n```/g)].map(match=>match[1]).join('\n');
const scope=vm.createContext({});vm.runInContext(blocks,scope,{timeout:1000});
for(const n of [0,1,5,100]) {
 let expected=1n;for(let k=2;k<=n;k++)expected*=BigInt(k);
 assert.equal(scope.factorial(n),expected);assert.equal(scope.factorialIterative(n),expected);
}
for(const bad of [-1,101,NaN,1.5]) {assert.throws(()=>scope.factorial(bad));assert.throws(()=>scope.factorialIterative(bad));}
const costText=await readFile(new URL('../../cs-foundations/complexity-and-cost.md',import.meta.url),'utf8');
const costBlock=costText.match(/```js\n([\s\S]*?)\n```/)[1];
const costScope=vm.createContext({});vm.runInContext(costBlock,costScope,{timeout:1000});
assert.equal(costScope.contains([NaN],NaN),true);
assert.equal(costScope.contains([-0],+0),false);
assert.equal(new Set([-0]).has(+0),true);
assert.equal(costScope.contains([],1),false);
assert.deepEqual([2,10].sort(),[10,2]);
console.log(`CS reference checks passed: ${arrays} exhaustive arrays, ${graphs} oracle graphs, mixed queue/heap traces, boundary and textbook recursion checks (seed 47219).`);
