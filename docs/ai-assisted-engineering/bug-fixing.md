# Reproduce and fix a bug {#_2-reproduce-and-fix-a-bug}

The study issue is specific: “After sorting notes for the menu, the original catalogue order changes elsewhere.” The trigger is calling a helper; the unwanted effect is mutation of the caller's array.

## Understand the defect before asking for a fix

This tiny baseline demonstrates the cause:

```js
const original = [{ id: 'z', title: 'Zebra' }, { id: 'a', title: 'API' }];
const before = original.map(note => note.id);
original.sort((a, b) => a.title < b.title ? -1 : a.title > b.title ? 1 : 0);
console.log(before, original.map(note => note.id));
// Before: ['z', 'a']; after: ['a', 'z'].
```

`Array.prototype.sort` changes its receiver. A second view holding the same array sees the new order. A model might suggest resetting that view, but the owning contract belongs to the sorting helper: return a sorted copy.

The correction sorts a new array:

```ts
return [...notes].sort(compareNotes);
```

This is a shallow copy. It protects array order; it does not clone or protect nested note objects. State that limitation rather than claiming deep immutability.

## Verify the behavior, not the spelling

The [catalogue reference](../workbench/engineering/ai-engineering/catalogue/) supplies strict TypeScript code and acceptance checks. In a learner copy:

```sh
npm ci --ignore-scripts
npm run build
npm run test
```

Its frozen input fixture catches an attempted in-place sort. Checks also assert returned ordering and the explicit ID tie break. Predict the result, then inspect the worked function. The reference is already corrected; it does not supply your personal before/after evidence.

For your own baseline, create a disposable function that accepts a mutable array and directly calls `.sort`. Demonstrate both normal-array mutation and failure with a frozen array. Correct only that copy and retain actual failing/passing output. Never introduce the defect into unrelated user work merely to create a red test.

## Ask the assistant useful questions

Ask which call mutates state, which callers share it and whether copying the array preserves the declared behavior. Require a regression case that fails against the baseline. Challenge an unnecessary proposal to deep-clone every note: does the task require object mutation, or only order isolation?

If the assistant changes the test to expect mutation, it has changed the requirement. If it changes sort order or drops duplicate titles, it has introduced a separate behavior change. Review these before accepting the patch.

**Your exercise:** independently reproduce and fix the mutation. Then explain why passing the frozen-array case alone is insufficient: the returned list still needs correct order and content.

**Done:** retain a failing baseline, passing focused correction and actual diff explanation. Continue to [feature development](./feature-development.md). For a different worked defect, use the retained [zero-retry issue](./issue-to-reviewed-change.md).
