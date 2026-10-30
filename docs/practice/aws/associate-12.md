# A12 — Q Developer and AWS AI integrations

**Learner status: not started. All supplied tasks are mandatory here**, including every originally optional exploration and the bonus pipeline. This is the AI lab called “Lab 11” in the source; A11 here denotes CI/CD.

**Read first:** [AWS AI services](../../aws/ai-services.md), [serverless APIs](../../aws/serverless-and-apis.md), and [source corrections](./source-notes.md). [Original supplied text](/aws-homework/sources/associate-12.txt) retains the original instructions and examples.

**Repeating:** Lambda, API Gateway, IAM, SDK packaging and tests repeat P03/A10/A11. The new evidence is the AI service behavior, review of generated code and multi-service integration. Use a supported Node.js runtime and deliberate ESM/build configuration; do not copy the source's Node.js 18 deployment unchanged.

## A12.1 — Set up Amazon Q Developer

- [ ] Install Q Developer in one selected supported IDE: VS Code or JetBrains. Authenticate through the source's supported Builder ID or Identity Center option.
- [ ] Verify chat responds to a Lambda question and code suggestions work. Record installation/authentication evidence without exposing credentials.

## A12.2 — Build and deploy a sentiment-analysis API

The required architecture is **API Gateway → Lambda → Amazon Comprehend → HTTP response**. Direct Lambda invocation is additional evidence, not a replacement for the HTTP integration omitted from the source's deployment snippet.

- [ ] Initialize a Node.js project and install SDK v3's `@aws-sdk/client-comprehend` and required development types.
- [ ] Use Q to draft a Lambda handler, then review and understand it. Parse the chosen API Gateway event, call `DetectSentiment`, and return the sentiment classification and confidence scores in the correct HTTP integration response format.
- [ ] Add malformed-input and service-error handling. Implement the source's requested batch-analysis support with the appropriate API contract; verify both individual and batch paths.
- [ ] Validate non-empty text, supported language and the selected service operation's UTF-8 **byte** limit. The source's “1–5000 characters” rule is not a correct substitute for the 5 KB single-document API limit.
- [ ] Create local tests for positive, negative and neutral examples, invalid/oversized input and failure handling. Explain any nondeterministic service output instead of asserting invented exact confidence values.
- [ ] Give the function scoped Comprehend access and log permissions. Package the code, dependencies and required module metadata; deploy it to AWS.
- [ ] Create and configure the HTTP API integration, permissions, route and CORS if the selected client needs it. Test the deployed HTTP endpoint and the source's direct-invocation path, accounting for their different event shapes.
- [ ] Confirm the deployed function actually calls Comprehend and returns an appropriate response. Retain local and remote results.

## A12.3 — Review generated code and use Q features

- [ ] Request a code explanation and check it against the implementation.
- [ ] Run the available supported security-scanning workflow, inspect findings, review proposed fixes and record unresolved limitations. If the old IDE menu is unavailable, document the supported equivalent used.
- [ ] Generate unit tests, inspect their assertions, run them and record coverage without treating generated tests as inherently sufficient.
- [ ] Request performance suggestions, implement one justified optimization and explain its effect. Avoid claiming an improvement without evidence.
- [ ] Generate and review JSDoc and project documentation.

## A12.4 — Rekognition exploration — promoted from optional

- [ ] Use synthetic or provided sample images to investigate label detection, text detection, face detection and face comparison in the available console workflows.
- [ ] Record confidence scores, bounding boxes and multiple-object behavior. Explain an intended threshold, its tradeoff and a relevant application use case; do not treat confidence as proof of correctness.

## A12.5 — Polly exploration — promoted from optional

- [ ] Convert the source's welcome text to speech; compare available neural/standard voices and languages.
- [ ] Experiment with SSML pauses, emphasis and rate; download the generated audio and inspect speech marks for a synchronization use case.
- [ ] Explain the selected voice, integration approach and cost implications for higher usage. Feature support varies by voice/engine; record the actual supported choices.

## A12.6 — Translate exploration — promoted from optional

- [ ] Translate the source's technical paragraph from English into Spanish, French, German and Japanese; compare results.
- [ ] Test automatic source-language detection and domain terminology.
- [ ] Create/apply custom terminology, including preservation of a term such as Lambda where supported. Compare results with and without it.
- [ ] Explain unsupported-language handling and when custom terminology helps.

## A12.7 — Textract exploration — promoted from optional

- [ ] Analyze synthetic invoice/receipt, form and table samples with suitable text/form/table operations.
- [ ] Inspect extracted text, key-value pairs, table structure and confidence scores. Export the JSON and relate its structure to programmatic processing.
- [ ] Explain handling of low-confidence extraction, useful post-processing and integration into a workflow.

## A12.8 — Bedrock exploration and comparison — promoted from optional

- [ ] Select currently accessible foundation models and satisfy their current access prerequisites. Compare two available models; if a named historical model is unavailable, record the actual substitute for this exploration.
- [ ] Test code generation, summarization and JSON-to-SQL transformation prompts, plus one personal application use case with synthetic input.
- [ ] Vary temperature/top-p/max-token parameters where the selected model supports them. Record unsupported combinations instead of assuming identical APIs for all models.
- [ ] Produce a comparison table of outputs, parameter effects, suitability and cost considerations. Review generated SQL/code before any execution.

## A12.9 — Combined AI pipeline — promoted from bonus

- [ ] Build the required document flow: **uploaded image → Textract → Translate to English if needed → Comprehend sentiment → Bedrock summary**.
- [ ] Use Q to assist architecture work, then choose Step Functions or a Lambda orchestrator and implement each integration with the necessary scoped permissions.
- [ ] Test synthetic documents in different languages, inspect intermediate outputs and measure end-to-end latency. Explain what happens when an intermediate service fails rather than silently inventing a final result.

## A12.10 — All deliverables and cleanup

- [ ] Retain IDE setup evidence; complete implementation, validation, error handling, tests, reviewed documentation and the optimization explanation.
- [ ] Retain local/deployed results, security-scan results, service-exploration observations, Bedrock comparison, combined-pipeline code/results and reflection notes.
- [ ] Follow repository/submission rules: only the user may push. Source wording “all or some” deliverables is replaced by **all listed deliverables** in this path.
- [ ] Remove unused API/function/workflow/log/storage resources and record any remaining chargeable resources. Do not leave uploaded document data or generated artifacts without an explicit retention decision.

The source's generic “Next Steps” links are further reading, not additional unbounded deliverables. Use the [shared evidence rules](./index.md#evidence-for-every-required-module). Additional AI evaluation beyond these supplied tasks remains [optional X12](./optional-extensions.md#x12-ai-quality-and-failure-evaluation).
