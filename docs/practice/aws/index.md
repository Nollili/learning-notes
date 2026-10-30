# AWS homework: required course tracks and optional extensions

The two course tracks now form the required AWS practice path. **Every supplied task is mandatory here**, including original optional tasks, bonus challenges and guide extensions. This is a local learning-path decision; it does not change EPAM's original grading criteria.

All learner work remains **not started** until independently completed and evidenced. Writing these specifications does not create AWS resources or complete any lab.

## Reading and implementation order

Start with the [AWS beginner guide](../../aws/beginner-guide.md) and [account/tool setup](../../aws/account-and-tools.md). Follow Practitioner P01–P08 in order to build the integrated store. Follow Associate A01–A12 in order for infrastructure and delivery depth; A12 denotes the AI lab, which the source also calls “Lab 11.” Keep the two Lab 11s distinct.

| Track | Required work | Main contribution |
|---|---|---|
| [Practitioner](./practitioner.md) | P01–P08, including promoted extensions | One integrated CDK application |
| [Associate](./associate.md) | A01–A12, including promoted extensions and guide bonuses | Infrastructure, networking, alternate interfaces and delivery |
| [Optional additions](./optional-extensions.md) | X01–X12, newly proposed here | Failure recovery, security, performance and operational gaps |

## What “repeating” means

**Repeating** marks material already practiced in another module or track. It does not mean “skip.” Reuse a verified resource when compatible, then demonstrate the new interface, configuration or behavior. For example, provisioning a bucket manually and later with CloudFormation repeats the service but adds reproducibility. Do not create a second account simply to satisfy the second account-setup task; recheck the existing account and record current evidence.

The [repeat map](./repeat-map.md) records these overlaps. Within a task, alternative platforms or apps remain alternatives: choose one supported OS, IDE, frontend and database option unless an explicit comparison is requested. “Investigate packages” does not require building an application with every package. Generic “next steps” suggestions are not additional deliverables beyond the enumerated tasks.

## Preserve the course contracts

Practitioner uses the course template and exact file paths, exported classes, prop interfaces, environment variable names, resource settings and API shapes. The module pages retain these details. Do not modernize away a tested contract simply because the conceptual notes show a different example.

Use the template's actual validation scripts. The supplied Practitioner specifications use Node.js 22, TypeScript, `npm run sync-tests -- module-N`, `npm run deploy`, `npm run test:unit`, `npm run test:e2e` and `npm test`. E2E checks contact deployed resources; mocks alone do not satisfy them. Also run the applicable build and coverage commands required by the submission instructions. Do not invent or rewrite template scripts to hide failures.

Never modify predefined test files or rely on changing tests for acceptance. The supplied homework calls its synced directory `src/test/`, while the repository guidelines also protect `src/tests`; preserve the template's actual layout and treat predefined tests in either location as read-only. Test synchronization belongs to the course workflow, not permission to edit test assertions.

**Only the user may push.** Course references to pushing, remote submission and merging describe learner-owned submission steps, not actions for an assistant to execute. The template's required `task-N` branch names take precedence over a generic branch naming preference when implementing those assignments.

## Evidence for every required module

Record the source revision, runtime and lockfile; account/Region with sensitive values redacted; actual commands and outcomes; infrastructure and endpoint observations; a failure or denial where specified; cleanup and remaining charges/resources. Never include credentials, session tokens, passwords or full presigned URLs in public evidence.

Keep status separate from documentation: `not_started → in_progress → evidence_ready → reviewed`. A supplied PDF walkthrough or passing example is not independent completion. See the existing [evidence-record format](../learning-projects.md#retain-a-real-evidence-record).

## Corrections and safe scope

Read the [source corrections](./source-notes.md) before live work. They distinguish original course requirements from technical errors, dated prices and lab-only configurations. Use an owned learning environment and synthetic data for public-access and deletion demonstrations. Cleanup must account for resources needed by later modules; recreate from infrastructure definitions when needed.

The [source register](./source-notes.md#source-register) identifies the supplied documents. Original text attachments are retained as downloadable references; the Associate inline tasks are organized into actionable checklists. PDF guides remain supporting walkthroughs, with their substantive bonus exercises mapped into required pages.
