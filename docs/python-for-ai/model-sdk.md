# A Typed Model SDK Boundary

Use the official OpenAI Python SDK3.35.1 with its HTTPX2 transport2.16.0 in the Python3.13.11 learner project. This differs from the HTTPX0.28.1 client in the generic HTTP lesson: their clients, timeouts, transports and response classes are different types. Keep both explicit rather than passing an old HTTPX mock/client into the new SDK. Verify an SDK upgrade against its installed signatures and official documentation.

```bash
uv add 'openai==3.35.1'
uv run --locked python -m mypy --strict basics.py study_ai
uv run --locked python -m pytest
```

## One backend task and one schema

The worked task proposes a study-note category and a short supporting quotation. The application retains deterministic input validation, access control, storage, error mapping and publication decisions. The model proposes data; it does not choose credentials, URLs, tenant scope or database operations. A valid category/quotation is not proof that classification is correct. No automatic write is attached to a successful result.

A backend SDK hides wire serialization but does not remove network failures, model refusals, output limits or semantic errors. Keep the provider credential on the server. The implementation pins the provider origin in its composition root and accepts the model identifier only from trusted startup configuration. Do not accept a request-supplied base URL or use a model key in a browser bundle. A project/account must independently have access to the configured model; these offline tests prove no model availability or quality.

The client is owned by an async context, pooled across requests within that lifetime, then closed. Retries are disabled deliberately to make one attempt observable; a separate bounded retry policy can be added later. Phase timeouts plus an overall deadline protect different waits. A timeout/cancellation does not prove the remote provider stopped processing or incurred no charge. Do not automatically replay a timed-out generation as if it never happened.

<<< ../workbench/applied-ai/python/study_ai/model_sdk.py


The [token-budget lesson](./token-budgets.md) reuses validate_label_input, label_messages and label_text_format for preflight counting; keep those builders deterministic when changing the prompt/schema. output_cap is an explicit bounded application argument, not a provider limit lookup.

## Schema shape and application validation

Structured Outputs uses a supported JSON Schema subset. This simple object requires all three fields, rejects extra keys and limits category to an enum. Pydantic generates the schema; inspect it in tests. Avoid assuming every arbitrary Pydantic validator can be enforced by the provider. The exact quote limit/source-membership rule is an application check after parsing. A JSON-only mode promises JSON syntax, not this application contract.

The example uses responses.create with an explicit schema, then validates the completed message using model_validate_json. The SDK's responses.parse(text_format=LabelDecision) is an alternative that combines schema generation and parsing. Here manual post-status parsing makes incomplete/refusal handling explicit before attempting to interpret the output as a LabelDecision. Never repair truncated JSON and call it a successful decision. A model refusal is a distinct outcome, not an empty successful object.

Reasoning items may accompany a final message; they are not treated as user-facing JSON. The adapter accepts one final output-text item and rejects unexpected tool/action outputs. It does not execute model-proposed tools. Only the final typed decision can reach the next application step; do not persist/return the whole SDK response, raw refusal text or exception body to callers. Cancellation propagates because it is not caught as a normal model failure.

The fixed instruction/source role split clarifies intent but is not a security guarantee against prompt injection. A source can still influence category/evidence selection. Source authorization happens before this function, and human review/evaluation determines whether the result is useful. The quote membership check catches invented substrings, not misleading quotations or wrong labels. store=False is an API storage setting, not a claim that every provider/system retains no data; verify the applicable data policy before sending sensitive notes.

## Offline integration with the real SDK

The test transport intercepts every request before network I/O. The synthetic key never leaves the process. It checks the exact URL, auth header, schema, roles, storage and output settings, then returns representative provider envelopes. This executes the installed SDK's serialization, response construction and the application's validation, rather than mocking propose_label itself. Synthetic responses are not evidence of model quality or live compatibility.

<<< ../workbench/applied-ai/python/lab_tests/test_model_sdk.py


### Cancellation and invalid-output regressions

These additional checks keep early rejection free of transport calls and prove caller cancellation reaches the awaiting transport before the owner closes. They use only fake content. The model-output token cap is not a hard HTTP response-byte/memory cap; the ordinary SDK call buffers a response, so deployment memory limits and a separately tested streaming/transport policy are needed for hostile or unexpectedly large envelopes.

<<< ../workbench/applied-ai/python/lab_tests/test_model_sdk_edges.py


## Troubleshooting and alternatives

- A401/403 means investigate backend credential/project permissions and the configured endpoint/model. Do not ask an end user to paste the provider key into the browser or retry forever. A429 can indicate different provider constraints; inspect protected operational evidence and the actual account policy before choosing retry behavior.
- Schema rejection is a request/configuration problem. Compare the generated schema with current model/schema support. Do not weaken application authorization or silently accept arbitrary JSON to make the error disappear.
- An incomplete result needs an explicit retry/reduce-context/review outcome under a cost budget. Output-token settings can cover reasoning as well as visible output on applicable models;1024 is a teaching cap, not a guarantee of enough usable text.
- A valid JSON decision with an irrelevant quote is an evaluation failure even if every unit test passes. Keep representative labeled fixtures and compare model/prompt versions before adoption. Keep prompt/model/schema versions in protected job metadata without raw source/secret logs.
- Reuse the async client within one event loop/lifespan; do not share it across closed loops or create a new connection pool for every token/request. Put bounded admission in front of model work; pool limits alone do not cap all queued application tasks.

Provider-specific request fields, model names, authentication, errors, schema subsets and token accounting are not universally interchangeable. Keep this adapter provider-specific and expose the small typed decision to the rest of the app. Orchestration frameworks are alternatives when a measured workflow needs them; they do not replace these boundaries.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/model-sdk.md).

Official references checked2026-10-21: [Python SDK clients/transports/retries/ownership](https://developers.openai.com/api/reference/python), [Responses create request and statuses](https://developers.openai.com/api/reference/python/resources/responses/methods/create), [Structured Outputs and edge cases](https://developers.openai.com/api/docs/guides/structured-outputs), [provider error categories](https://developers.openai.com/api/docs/guides/error-codes), [SDK installation](https://developers.openai.com/api/docs/libraries). The executable SDK version above is pinned from the temporary project; it is not a claim that your account has a particular model enabled.

## Operational contract: credentials, roles and recovery

Provision provider credentials through the backend's secret configuration, with separate deployment/project ownership and only required permissions. Avoid source control, public environment variables bundled into frontend code, prompts, fixtures, screenshots and raw SDK/HTTP debug logs. The fake test credential above is deliberately not a real secret. If a credential is exposed, revoke/rotate it in the provider account, replace deployment configuration and investigate usage; deleting the visible string from a current file does not invalidate historical copies. Rotation/revocation cannot be proved with an offline mock.

Use an organization-approved secret manager and restricted deployment access; an environment variable is a delivery mechanism, not encryption or an authorization policy.

The developer message expresses the application's classifier contract. The user message carries the supplied note. Assistant output is a proposal, not a trusted application instruction. Tool calls/results, if introduced later, need a separate authorized loop with call identity/schema checks; this adapter currently rejects tool output. Never promote retrieved text, OCR, a previous generated answer or user-supplied role names into application instructions. Role separation reduces ambiguity but cannot replace authorization/output validation. The [versioned prompt lesson](./prompting-and-modalities.md) provides an alternative builder with demonstrations; compare it as a new configuration rather than mixing old evaluation scores.

| Typed outcome | User-facing recovery | Operational decision |
|---|---|---|
| `invalid_input` | Correct the supplied content or reject it clearly | No provider request should have occurred |
| `refused` | Explain that this automated classification could not be provided; offer manual classification where appropriate | Do not automatically rephrase/retry to evade refusal |
| `incomplete` | Keep the note unclassified; allow a bounded retry or manual review | Inspect input/output budgets under policy; never publish repaired partial JSON |
| `invalid_output` | Offer manual review; retain no fabricated successful label | Compare schema/version and semantic checks; quarantine the bad result |
| `timeout` / `provider_unavailable` | Show a recoverable unavailable state and retain the user's local work | One failure does not establish that the remote attempt was unprocessed; retry requires a separate budget/policy |
| `provider_rejected` | Show a generic configuration/service failure | Investigate protected account/model/schema evidence; do not expose provider bodies or retry bad credentials forever |
| Caller cancellation | Remove obsolete pending UI state under its owner | Propagate cancellation, close owned resources and ignore stale results |

These are application choices, not universal HTTP status mappings. A frontend owns its current request identity and loading/error state; a backend error code must not let a late request overwrite newer user work. A refusal is not lack of relevant evidence, an authorization denial or an outage. The existing empty `other`/`needs_review` decision is the classifier's insufficient-evidence outcome, separate from a provider refusal. Manual correction should record the reviewed decision through the ordinary authorized write path; it must not persist a raw SDK object or silently treat `needs_review` as an approval.

## Compare provider adapters by tested capabilities

Keep the application-facing label decision and error vocabulary small. A replacement adapter must establish its own request/response contract rather than merely change `base_url`:

| Boundary | Evidence required before replacement |
|---|---|
| Instruction/input format | Map actual role/content semantics; verify how examples, image inputs and tool results are represented |
| Structured output | Confirm model support and schema subset; inspect refusal/truncation/status handling and validate locally |
| Resource accounting | Measure input/output/reasoning/tool tokens, timeouts, retries and rate/cost behavior in that service |
| Identity/data policy | Verify credential scope, tenant handling, region/retention and permitted use under the actual contract |
| Lifecycle/errors | Test actual client/transport types, pooling/closure/cancellation and safe status mapping |
| Quality | Compare representative labels, quote support, ambiguity and review cases on the same held-out task |

An “OpenAI-compatible” HTTP shape or passing synthetic responses proves neither semantic equivalence nor support for every field. Hosted versus self-managed has additional operational costs described in [model foundations](./model-foundations.md). Keep this course on one primary provider; a second live integration is an optional comparison, not a requirement to learn every SDK.

[Related learner criteria](../practice/applied-ai/chapters/model-sdk.md).

Official references checked2026-10-22: [provider key safety](https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety), [structured-output refusal/incomplete edges](https://developers.openai.com/api/docs/guides/structured-outputs). The original exact SDK implementation/tests above remain the executable primary path.
