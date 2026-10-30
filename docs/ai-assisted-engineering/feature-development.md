# Develop a feature from acceptance criteria {#_3-develop-a-feature-from-acceptance-criteria}

Now add a small feature to the same catalogue: search titles and return a bounded result list. Unlike a bug fix, a feature needs you to agree on behavior that did not exist before. Resolve the contract before choosing a library.

## Make the request testable

For this study task, the declared contract is:

| Criterion | Example |
|---|---|
| Query is optional; trim it and match titles case-insensitively | `' api '` matches `'API'` |
| Empty query includes all notes | `query: ''` keeps every candidate before limiting |
| Sort by title, then ID, before applying the limit | Equal titles have predictable order |
| Default limit is 10; explicit zero means no results | `limit: 0` returns `[]` |
| Limit must be an integer from 0 to 50 | Reject negative, fractional, null and string values at runtime |
| Preserve the original array and objects | Searching does not change another view |
| No match and empty input return an empty array | No invented fallback note |

This example uses simple lowercase substring matching and code-unit sort order. It does not promise locale-aware ranking or semantic search. Those would require a different contract and examples.

## Plan a narrow implementation

Reuse the corrected sorter. Validate options, normalize the query, filter titles, sort candidates and apply the limit. A new vector database, web framework or model is unnecessary for this feature.

Read the [reference source and checks](../workbench/engineering/ai-engineering/catalogue/). The undefined-only default is deliberate:

```ts
const limit = options.limit === undefined ? 10 : options.limit;
```

Using `options.limit || 10` would turn the valid zero into ten. This resembles the older retry defect, but the new requirement is a list feature with its own acceptance cases.

## Use the assistant in increments

Ask it to map criteria to checks, identify affected callers and propose the smallest public API. Implement the pure helper first. Only then connect it to a UI or endpoint, where external JSON needs validation and an authenticated note catalogue. TypeScript types are not runtime checks for HTTP input.

Keep the diff focused: helper, meaningful checks and a short behavior explanation. Preserve the supplied compiler/test configuration and restricted test directories. Avoid unrelated “cleanup” that obscures the new feature.

## Review edge cases explicitly

Check `limit: 0`, matching after whitespace normalization, two notes with the same title, no matches and invalid options. A result count test alone could pass while the wrong notes are returned. Assert identities/order where the contract requires them.

**Your exercise:** implement `listNotes` independently in the learner repository before inspecting the reference. Retain requirement-to-check mapping and one failed candidate, such as limiting before sorting. Explain its correction.

**Done:** all declared criteria have observed evidence, callers receive the intended behavior and the actual diff remains scoped. [Next: testing and debugging](./testing-debugging.md).
