# AI app practice: JavaScript first, then deeper integration

**New to AI development? Start with [the JavaScript assistant milestones](./javascript-assistant.md).** They pair with [Build AI Apps — JavaScript First](../../applied-ai/); Python is not a prerequisite. The deeper sequence below remains available after the relevant beginner project.

**All learner practice remains outstanding.** These specifications refine the existing P-334/P-335 projects and add one bounded n8n integration. Supplied workbench passes are reference verification, not evidence that you implemented or mastered the projects.

Use one synthetic notes catalogue: tenant `study`, user `alice`, note `public` describing timeout/cancellation; tenant `other` with a forbidden note; and one instruction-like source line. Reuse the existing [corpus/case seed](../ai-lab/README.md), reviewed source/version/span records and permission adapters. The seed is development material, not a held-out quality benchmark. Never copy real private notes or credentials into fixtures.

| Sequence | Deliverable / specification | Prerequisites |
|---|---|---|
| 1 / P-334 | [Access-aware cited assistant](./rag-assistant.md) | Typed Python, validation, owned async I/O and shared model/evaluation/security boundaries |
| 2 / P-335 | [Resumable approved tool workflow](./resumable-workflow.md) | Checked tools and current identity; a RAG result grants no permission |
| 3 / N8N-P01 | [Refresh event integration](./n8n-integration.md) | JSON/HTTP, scoped synthetic service identity and manual/test-only n8n setup |

Start each stage with a pure or local deterministic fixture. A live provider, published workflow, external notification, hosted vector service and paid account are not prerequisites to begin. Any later real integration needs its own authorized credentials/data/budget; do not describe it as tested because a mock passed.

## Evidence for every stage

Retain actual source/lock/runtime, case/corpus/ACL/prompt/model/parser/index/configuration versions; expected versus observed results; failing counterexample and correction; allowed/denied call/effect counts; resource cleanup; and commands with exit results. For recovery record checkpoint revision, artifact references, original operation ID and authoritative receipt or explicit unknown outcome. Exclude raw credentials/private evidence from ordinary logs.

Separate deterministic schema/access/state/receipt checks from human claim-support judgments and model-quality measurements. Label fake transports/authored proposals as synthetic. Count all attempts, failures, cancellations, waits and known/unknown cost. Record the dataset split/seed/rubric and do not tune on the final confirmation set.

Use the existing [evidence record](../learning-projects.md#retain-a-real-evidence-record). Never prefill success. Preserve Autocode template/scripts/database configuration where applicable; never modify `src/tests`. Relevant builds/type checks/tests must terminate naturally. [Chapter requirements](./chapters/index.md) retain the more focused exercises without creating dozens of unrelated projects.
