# CS workbench

Canonical worked sources support the [textbook](../../cs-foundations/index.md). [Independent practice](../../practice/cs-foundations/index.md) has separate requirements; these checks do not award learner completion.

| Source | Contract / teaching page |
|---|---|
| `search.ts` | Dense sorted finite numbers, lower-bound/first-match; [binary search](../../cs-foundations/binary-search.md) |
| `sort.ts` | At most 256 dense finite numbers; last-pivot allocating sort with limited counters; [sorting](../../cs-foundations/sorting.md) |
| `queue.ts`, `heap.ts` | Bounded FIFO and stable min-priority admission; [rendered collection sources](./collections.md) |
| `traversals.ts` | Original bounded application-owned graph/tree implementations; [rendered sources](./traversals.md) |
| `check.mjs` | Deterministic exhaustive/generated reference checks, plus exact textbook fixtures |

## Run the checks

From the repository root, use the retained Node example's locked development dependencies (`npm ci` in `examples/node-textbook` if needed). Choose a new owned output directory:

```sh
node examples/node-textbook/node_modules/typescript/bin/tsc \
  docs/workbench/cs-foundations/*.ts \
  --target ES2022 --module NodeNext --moduleResolution NodeNext \
  --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes \
  --types node --typeRoots examples/node-textbook/node_modules/@types \
  --skipLibCheck --outDir /tmp/my-cs-reference-build
CS_REFERENCE_BUILD=/tmp/my-cs-reference-build node docs/workbench/cs-foundations/check.mjs
```

`skipLibCheck` skips dependency declarations, not strict source checks. The runner uses the emitted sources and Node standard library only; no database/network/service is required. The root project has a documentation build, not an algorithm test script. Preserve any separate Autocode task's supplied build/test/coverage configuration and tests.

The checks use linear search, a sorted-list priority model and an all-pairs distance oracle rather than reproducing each algorithm. Exhaustive small arrays/graphs and deterministic mixed queue/heap operations supplement exact failure fixtures. Operation counts are evidence under the documented cost model, not a benchmark or proof of all JavaScript engines.
