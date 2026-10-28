# Tokens, Context and Explicit Budget Rejection

Continue the pinned Python/OpenAI SDK3.35.1 project. A token is a model-tokenizer unit, not a word, character, UTF-8 byte or grapheme. A word can span several tokens; punctuation, whitespace, code, uncommon names and different languages change segmentation. Token IDs are vocabulary-specific. Do not store character offsets from the extraction lesson as if they were token offsets, or compare token IDs from different tokenizers as semantic similarity.

## Distinguish the limits

| Limit | What it bounds | What it does not prove |
|---|---|---|
| Source/request bytes | Transport/parser allocation and accepted upload size | Model input-token count |
| Input tokens | The actual serialized model input, including relevant structure | Enough output capacity or good retrieval |
| Context window | The model's supported combined context under its accounting rules | Maximum useful output or perfect recall |
| Output-token cap | Generated output budget, including applicable non-visible tokens | A requested number of visible words or valid complete JSON |
| Application deadline | How long this caller waits | Remote cancellation or zero charge |
| Spend/request budget | Account/application resource policy | Accuracy, authorization or data privacy |

Configure context and output limits from the selected model/snapshot's current official contract. No real model limit is hardcoded below; the tests use a fictional2048-token window. Large advertised context is not reliable recall of every fact. Test questions whose supporting evidence occurs early/middle/late and measure citation quality. Sending all available notes can increase irrelevant/conflicting content and prompt-injection exposure while raising cost and latency.

A simple conservative admission rule is:

`counted_input + reserved_output + safety_margin <= configured_context_window`

Also require reserved_output <= the model's separate output limit. Do not add reasoning twice when the selected API already counts it inside the output cap. For this application the output reserve is also the actual generation max_output_tokens value. Example:2048 total,1024 output and128 margin leaves896 input. An input count of896 fits;897 is rejected. These numbers teach the arithmetic, not a model recommendation.

## Count the actual payload

A local tokenizer is useful for plain-text exploration when its encoding matches the selected model. `len(text)`, word splitting and a universal characters/4 rule are not exact counters. Message boundaries, instructions, tools, schemas and multimodal representations can add costs beyond the visible source text. Use the provider's counting interface for the actual reviewed payload when exact admission matters; counting itself sends the input to that provider and needs the same data/credential/network policy as generation.

The implementation reuses the SDK lesson's deterministic message/schema builders, then counts and generates with the same model/source/schema. There is no mutable remote conversation, previous-response chain, file URL or tool state in this exercise. If you add those, counting a stale state and generating against a changed state is not a stable admission proof. Snapshot/version the state or serialize its ownership, then count the exact final request again.

<<< ../workbench/applied-ai/python/study_ai/token_budgets.py


The count endpoint does not accept every generation option; pass the shared context-affecting fields it supports, not an unfiltered create payload. No output cap/store field is sent to the count request. Its truncation parameter is deprecated in the checked reference, so this example omits it there; the generation call still explicitly disables automatic input truncation. Review both endpoint schemas when upgrading.

The dataclass's upper bounds are teaching application caps, not provider limits. Runtime validation rejects bool even though Python considers it an int subclass. A malformed negative/non-integer returned count becomes invalid_output; over-budget input has a distinct recoverable outcome before any generation call. Provider count failure stops the workflow instead of silently falling back to an unsafe estimate. Count and generation both use the owned no-retry client; a later policy can add bounded retries without hiding additional attempts.

## Exact-limit and SDK integration checks

<<< ../workbench/applied-ai/python/lab_tests/test_token_budgets.py


## Truncation and recovery are product decisions

Distinguish input overflow from generated-output incompleteness. Automatic input truncation can discard earlier facts/instructions; users need a deliberate reduce/retrieve/summarize policy. Keep the current user request, required constraints, provenance and authorized evidence. A generated summary is a lossy derived artifact: version it, retain source references and check that it did not drop constraints or introduce instructions from untrusted content. Do not compact all history and claim nothing was lost.

When output ends because its generation budget is exhausted, preserve a non-success job state. A UI can offer reduce scope, increase a reviewed cap within budget, or retry explicitly. Do not append braces to partial JSON, execute partial tool arguments or display a partly generated answer as a completed verified result. If streaming is later added, separate provisional display from validated final persistence. The SDK lesson already converts status=incomplete before parsing into a distinct failure.

A "continue" request does not guarantee a model will resume at the exact missing byte or avoid duplicating earlier content. Reconstruct the task from a stable checkpoint and validate the complete result. Bound attempts and total resource usage. A context-fit check is not a financial reservation: multiple simultaneous jobs can all pass while exceeding a shared account limit. Admission quotas and a shared spend ledger require separate concurrency/atomicity rules.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/token-budgets.md).

Official references checked2026-10-21: [provider token counting and non-visible usage](https://developers.openai.com/api/docs/guides/token-counting), [count endpoint fields](https://developers.openai.com/api/reference/python/resources/responses/subresources/input_tokens/methods/count), [conversation/context boundaries](https://developers.openai.com/api/docs/guides/conversation-state), [Responses generation controls](https://developers.openai.com/api/reference/python/resources/responses/methods/create). No context-window number in this lesson represents a current model's specification.
