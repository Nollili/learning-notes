# Model Families, Training and Inference

Read this conceptual foundation alongside the Python SDK project. You need enough model literacy to choose a useful boundary, detect a wrong assumption and troubleshoot an application. Training a large foundation model is not a prerequisite for implementing the intermediate applied-AI path.

## Categories describe different dimensions

"AI model" is not a synonym for a chat completion endpoint. Distinguish what the model predicts, what inputs it accepts, how it was trained and how you access it. These dimensions can overlap.

| Category | Input/output example | Application responsibility |
|---|---|---|
| Regression | Features → predicted numeric value | Units, feature validation, acceptable error and out-of-distribution behavior |
| Classification | Note → label/scores | Label meaning, class imbalance, thresholds and review/abstention |
| Embedding/representation | Text/image → vector | Version-compatible indexing, similarity choice and permission filtering |
| Generative language | Context → generated token sequence | Input selection, schema/semantic checks, supported evidence and safe downstream actions |
| Generative image/audio | Prompt/reference → generated media | Modality-specific limits, provenance, review and intended-use quality |
| Speech recognition | Audio → transcript, possibly timestamps | Noise/language/accent testing, timing and error correction |
| Reranking | Query plus candidate passages → relevance scores/order | Candidate recall, latency and independent ground-truth relevance |

A multimodal model can accept more than one modality; text input alone does not establish image/audio support. A reasoning-oriented model may spend extra inference computation on a task, but that label does not prove correctness. An agent is an application control loop using a model and tools/state/policy, not a separate guarantee that the underlying model is authorized to act. An instruction-tuned chat model and a base language model can have very different prompting/response behavior despite sharing an architecture family.

For the study-note classifier, keep deterministic schema/source checks in Python. A supervised classifier or simple lexical baseline may be enough for stable categories; a generative model is useful when flexible semantic interpretation justifies its cost/error profile. For "find passages about cancellation", an embedding/retrieval pipeline is a candidate; producing new answer text is a different task. Do not attach a general generator to a problem solved reliably by a direct database predicate.

## Training changes parameters; inference uses them

Parameters/weights are learned numeric values inside a model. Training uses examples and an objective to fit those values. A loss measures the mismatch according to that objective; optimization adjusts parameters. Gradient-based optimization is common for neural models, but not every learner needs gradients. Hyperparameters configure training/model behavior; they are not the learned weights themselves.

Pretraining learns broad patterns from a training distribution. Post-training can change instruction-following or other behavior using additional data/objectives. Supervised fine-tuning uses examples of desired behavior to update a pretrained model. These are processes that produce a model artifact/version. They are not the same operation as adding a paragraph to one request.

Inference computes outputs from a selected model's parameters and current input. An ordinary generation call does not update that model's weights. Extra context can change its answer during this request without teaching a permanent fact into the weights. A provider's separate retention/improvement policy is a different data-handling question; verify it explicitly rather than infer it from the word "inference".

A cache stores prior work, a retrieval index stores representations/references, conversation state stores request history and a model checkpoint stores learned parameters (plus possible training state). Replacing one does not automatically replace the others. Keep their versions and ownership separate in an application deployment.

## A tiny executable training/inference distinction

This intentionally small regression example fits slope/intercept from labeled pairs. It is not a neural network, language model or realistic accuracy benchmark. It demonstrates a learned parameter artifact and pure inference with no GPU, network, model download or paid job. The closed-form solution minimizes squared error for this two-parameter model.

<<< ../workbench/applied-ai/python/study_ai/model_basics.py


The model class is an internal trained artifact here; loading arbitrary external numeric weights would need its own finite/schema/shape/version checks. A frozen dataclass stops ordinary field reassignment; it does not authenticate a downloaded artifact. Near-constant features can make even this simple fit numerically sensitive; a real pipeline needs scaling/conditioning diagnostics and representative validation. A bounded input range alone is not a proof of statistical adequacy.

<<< ../workbench/applied-ai/python/lab_tests/test_model_basics.py


Repeating inference above is deterministic because this simple implementation has no sampling. A language-model serving stack can vary outputs even when weights are unchanged; decoding, numerical/runtime behavior and service changes matter. Do not generalize this toy's repeatability to a hosted generator or treat temperature0 as a universal reproducibility promise.

## Evaluate the learned behavior rather than the training story

Separate training, validation and held-out test data. Use validation to choose features/hyperparameters/thresholds; use an untouched test set for a final estimate after decisions. Split related documents/users/time ranges so near duplicates or future information cannot leak across the boundary. A clean train/test split of rows can still leak if preprocessing learns vocabulary/statistics from the whole dataset first.

The perfect line above is constructed, so its zero error is not evidence of real-world generalization. Add noisy/out-of-range examples and compare a constant/lexical baseline with the learned model. Report error distribution and failure slices, not just a single average. Classifiers need per-class false-positive/negative costs; generators need task/citation/semantic evaluation rather than regression loss alone. A lower training loss can coexist with worse unseen performance or unsafe behavior.

In the study-note project, an answer can be wrong because extraction lost text, retrieval selected the wrong passage, the prompt omitted a constraint, the model generated unsupported content, or the application accepted a bad result. "Train a better model" is not the first diagnosis for every failure. Keep a small labeled corpus and inspect concrete failure categories before changing the model or collecting training data.

## Hosted versus open-weight is an operational choice

A hosted API supplies inference through a service contract. You own application authorization, data policy, budgets, request state, retries and output handling; the provider operates the inference infrastructure under its contract. Account availability, rate limits, model revisions, network outages and retirement still affect your application. An SDK package is not the model's weights and installing it does not install local inference.

An open-weight release makes model parameter artifacts available under its particular terms. It may run locally, on your own servers or through a third-party hosted service. Thus "hosted" and "open-weight" are not opposites. Weight availability does not imply that all training data, training code, permitted uses or reproducibility evidence are available. Check the actual release license/model card and artifact provenance. Do not equate every open-weight release with the same open-source definition or rights.

As one concrete current example, the official gpt-oss-20b page identifies an open-weight model and its Apache2.0 license. That fact does not establish a blanket license/patent assurance for every model, dataset, adapter or downstream use. This course does not require installing it; our primary implemented path remains the typed hosted-provider adapter with offline tests.

| Decision | Hosted inference | Self-managed open-weight inference |
|---|---|---|
| Startup effort | Integrate a reviewed API and account policy | Select/verify artifacts, tokenizer/template, runtime and hardware |
| Capacity/latency | Account limits plus provider/network behavior | Your batching, memory/KV-cache pressure, cold start and scheduler |
| Data boundary | Contract, region/retention and service egress | Your serving/logging/telemetry/storage configuration and network |
| Versions | Pin supported snapshots and regression-test changes | Pin weight/tokenizer/runtime/quantization artifacts and retest |
| Failure ownership | Handle provider outages and policy changes | Also own GPU/runtime crashes, patching, scaling and recovery |
| Cost | Request/token/service charges under current contract | Compute, utilization, storage, operations and maintenance |

Self-management is not automatically private or cheaper: telemetry, logs, exposed endpoints and idle hardware change the result. Quantization can reduce parameter memory but may change quality and requires compatible runtime support; parameter memory alone omits KV cache, activations and runtime overhead. Do not size a serving host by dividing parameter count by a single bytes-per-weight number and stop there. Benchmark the actual context/concurrency workload before procurement or a migration decision.

## Training options do not need to become the primary project

Start from the deterministic/lexical baseline and the evaluated existing model. Improve extraction, relevant context and prompt/task definition before deciding that weight updates are necessary. Fine-tuning is a candidate for repeated behavior/style/task patterns with high-quality representative examples and separate evaluation. Rapidly changing facts, permissions and deletable private source knowledge usually need explicit application data/retrieval ownership rather than assuming a weight update behaves like a database write/delete.

Provider capability is version-sensitive. As checked2026-10-21, OpenAI's model-optimization guidance says its fine-tuning platform is winding down and is not accessible to new users; existing-user availability and model lifetime need separate verification. Treat the supervised-fine-tuning guide as useful conceptual workflow, not a promise that a new learner account can start that hosted job. No upload, training job, model download or inference-provider call is required by this lesson.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/model-foundations.md).

References checked2026-10-21: [model optimization and current fine-tuning availability](https://developers.openai.com/api/docs/guides/model-optimization), [supervised training/evaluation workflow](https://developers.openai.com/api/docs/guides/supervised-fine-tuning), [concrete open-weight model release](https://developers.openai.com/api/docs/models/gpt-oss-20b), [hosted SDK boundary](./model-sdk.md), [context and inference budgets](./token-budgets.md). The small regression implementation uses only Python3.13 standard-library arithmetic and is deliberately independent of these hosted products.

## Hallucinations: separate fluent output from supported facts

A hallucination is plausible generated content that is incorrect or unsupported for the task: an invented API, citation, number or explanation. It need not be deliberate deception. A statement can be true in the world but unsupported by the supplied sources; for a source-grounded task that is still a failure of the contract. A citation ID existing in the retrieved set proves reference validity, not that the cited passage entails the claim. Conversely, copying a source faithfully can reproduce a false or outdated source. Track source quality, version and scope as well as answer faithfulness.

The study-note application should distinguish failures by stage: extraction loses a negation; retrieval misses the relevant chunk; permissions remove evidence; the context budget drops it; generation guesses; the validator accepts malformed output; the UI presents partial output as final. Inspect the actual permitted evidence and request configuration before changing the model. Adding more context can add noise, contradictions or injected instructions. RAG and fine-tuning can improve particular failures but neither guarantees truth.

Use explicit “insufficient evidence” outcomes, supported claims/citations, deterministic schema checks and human review for consequential claims. Treat source text as data rather than new application instructions. Evaluate answerable and unanswerable examples together: a model that always abstains has no hallucinated answers but does not serve the task. Keep refusal, lack of evidence, authorization denial, timeout and invalid output distinct operationally; do not convert all into a fabricated successful answer.

## Confidence is a signal requiring validation

An answer saying “99% confident” is generated text, not an authenticated probability of correctness. Token log probabilities, when the model/endpoint supports them, concern token choices under that context; a likely token sequence is not proof of factual truth. Retrieval similarity measures representation proximity, not calibrated answer correctness. Agreement among repeated generations can repeat the same systematic error, and another model judging the answer can share that error.

For a narrow classification task, a score may become useful after calibration against held-out labels. Calibration asks whether events assigned probability0.8 occur about80% of the time over comparable examples. Measure reliability by score bands and task slices, sample size and error costs; ten examples are too few to establish stable calibration. A proper scoring rule such as Brier score can assess probability predictions, but good aggregate calibration can hide poor subgroup performance or fail under distribution shift. Do not tune a threshold on the final test set or compare raw confidence scales across unrelated models/prompts.

Choose an abstention threshold from validation data and the cost of wrong answers versus missed answers; freeze it before held-out evaluation. Measure coverage alongside accuracy among answered cases and unsupported-answer rate. The following small evaluator intentionally ignores self-reported confidence and scores observable task outcomes. It is an exact-answer classroom fixture, not a semantic truth detector or confidence calibrator.

<<< ../workbench/applied-ai/python/study_ai/selection_eval.py


All inputs here are typed, application-owned fixture data; external JSON needs runtime parsing and string/collection bounds before constructing them. The exact-answer oracle deliberately accepts only authored strings. Paraphrases can be marked wrong and a valid source ID can still accompany a false statement in a real free-text answer. Human-reviewed claim/source support or a calibrated semantic grader belongs in a broader evaluation; never call this function an entailment verifier. Its `unsupported` count combines incorrect text, missing/wrong/duplicate citations and answers where abstention was required. Retain separate failure labels in a production analysis.

## Worked comparison and model selection

Construct four questions: c1 asks the documented debounce delay (acceptable`300 ms`, source`notes-v1`); c2 asks which action disposes pending work (acceptable`cancel`, source`notes-v1`); c3 asks for an undocumented release date; c4 asks about a document outside the authorized corpus. c3/c4 have no acceptable answers or allowed citations. The labels were authored for this fixture; no model was called.

A synthetic “guesser” answers all four, with two correct supported answers and two invented answers. Coverage=1, selective accuracy=0.5 and unsupported=2. A synthetic “careful” configuration answers c1/c2 correctly and abstains on c3/c4: coverage=0.5, selective accuracy=1 and unsupported=0. An always-abstaining configuration has coverage0 and undefined selective accuracy, not perfect answer accuracy. Add an answerable question it misses to see that the careful system still loses utility when it abstains unnecessarily.

The selector imposes **illustrative study gates**, not industry safety thresholds: at least50% coverage, at least95% selective accuracy, zero observed unsupported outputs, p95≤1500ms and cost≤10 declared fixture units. It selects the lowest-cost eligible configuration, breaking ties by latency then ID, or returns None when no candidate qualifies. Zero failures in four fixtures gives no reliable bound on unseen failure rate. A real selection needs enough independent representative cases, repeated runs and uncertainty estimates. Do not translate the synthetic cost units into current provider prices or infer these fake timings describe a model.

Start with the deterministic/lexical baseline and a capable model configuration to establish a quality reference; compare smaller/faster candidates on the same frozen task set once the task is understood. Select on quality gates first, then cost/latency under expected load. Test required modalities, context/output capacity, structured-output/tool compatibility, supported region/data policy and operational limits separately: a high score cannot waive a hard capability or privacy constraint. Reasoning effort, prompts, retrieval versions and decoding settings are part of the candidate. Parameter count or a public leaderboard alone does not choose an application model.

Record versioned case IDs, corpus snapshot, label policy, model snapshot/alias, prompt hash, SDK and inference settings, token/tool usage, timeout/retry policy, hardware/region where applicable and warm/cold concurrency conditions. Report p50/p95/end-to-end latency, failures and actual declared cost units; token price alone omits repeated attempts, retrieval, tools, storage and operations. Keep a validation set for selection and an untouched held-out set for confirmation; shadow/canary a changed configuration and retain rollback. An unsupported model snapshot or deprecated service requires requalification, not a silent alias swap.

## Practice: outcome gates rather than persuasive answers

Implement the four synthetic configurations above and test identical case coverage, unknown/missing/duplicate IDs, invalid abstentions, absent/foreign/duplicate citations, empty inputs, always-abstain accuracy None, cost/latency gate rejection and deterministic tie-breaking. Add a wrong answer with a valid citation and a correct answer with a foreign citation; both must fail the classroom contract. Demonstrate that changing a model's claimed confidence alone cannot change these metrics. Freeze a validation threshold, then inspect results on a separately authored held-out set containing paraphrases and missing evidence, reporting this exact-match grader's false negatives.

[Separate learner criteria](../practice/applied-ai/chapters/model-foundations.md).

References checked2026-10-22: [OpenAI model selection](https://developers.openai.com/api/docs/guides/model-selection), [task-specific evaluation and human calibration](https://developers.openai.com/api/docs/guides/evaluation-best-practices), [token-logprob example and confidence limitations](https://developers.openai.com/cookbook/examples/using_logprobs). Optional parameters are model/endpoint-specific; this offline evaluator requests none. OpenAI's hosted Evals platform is being deprecated (official guide currently lists read-only2026-10-31 and shutdown2026-11-30); the local evaluator here does not depend on that service. Recheck availability before planning a hosted evaluation workflow. Preserve privacy by retaining approved/redacted evidence and metrics, rather than copying a provider guide's broad logging advice into raw prompt/secret logging.
