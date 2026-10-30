# Reliable structured output {#_3-reliable-structured-output}

Free text works for conversation. Application logic often needs fields. A note classifier might return `{ category: 'ai', quote: 'API keys' }` so the UI can display a category and supporting evidence.

“Respond in JSON” does not enforce your rules. Check three things: can the result be parsed, does it match the schema, and is the meaning supported?

## Work through the checks

Run `npm run demo` in the [starter](../../workbench/applied-ai/javascript/). The classifier validates a synthetic object against `Keep API keys on the server.` No model is called.

```js
validateQuote(
  { category: 'ai', quote: 'API keys' },
  'Keep API keys on the server.'
);
```

`validateDecision` accepts exactly `category` and `quote`, one of three labels and a bounded string. `validateQuote` requires a non-review decision to include an actual source quote. Change it to `browser credentials`: validation fails. Add an unexpected field: validation fails.

| Candidate | Shape | Evidence | Outcome |
|---|---|---|---|
| `{ category: 'ai', quote: 'API keys' }` | Valid | Exact substring | Eligible for semantic review |
| `{ category: 'ai', quote: 'invented' }` | Valid | Missing | Reject |
| `{ category: 'finance', quote: 'API keys' }` | Invalid label | Present | Reject |
| `{ category: 'review', quote: '' }` | Valid | Insufficient evidence allowed | Route to review |

A genuine quote still does not prove the category is right. A note can mention AI only to explain what it does not cover. Write category definitions and review borderline cases.

## Define a useful prompt

Specify the task, label meanings, output fields and missing-evidence behavior. Separate source text from application instructions. Give a positive and ambiguous example if they clarify the boundary. Ask for checkable evidence or a short rationale; hidden reasoning is not an audit log.

For live work use your provider's supported structured-output mechanism, then validate locally. For Responses this is a `text.format` JSON-schema contract. Refusal and incomplete output still need handling. Start with a small schema; arbitrary validator features are not necessarily supported remotely.

## Compare with a baseline

Prepare ten synthetic notes: clear AI, clear other, ambiguous, empty, quoted instructions and misleading keywords. Write expected labels **before** changing prompts. Keep some cases aside for final confirmation. Record invalid-shape rate, unsupported-quote rate and actual category judgments separately. Passing JSON checks does not establish accuracy.

**Your exercise:** implement the classifier with injected fake outputs first. Add a live adapter only if useful. Keep a failing counterexample and explain the correction without changing the expected answer to hide the error.

**Common mistakes:** treating `JSON.parse` as validation, accepting extra fields, trusting claimed confidence, and retrying invalid output without a limit. Do not “repair” a refusal into a positive classification.

**Done:** invalid shapes and fabricated quotes fail, ambiguous cases reach review, and you can explain exact quote checking's limits. [Next: tools](./tools-workflows.md). Deeper material: [schemas](../../python-for-ai/model-sdk.md) and [evaluation](../../python-for-ai/evaluation-lab.md).
