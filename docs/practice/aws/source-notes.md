# Homework source notes, corrections and provenance

The task status in this repository is deliberate: **all supplied optional and bonus work is required locally**. Original course grading may still omit it. No task specification authorizes this assistant to create accounts, deploy cloud resources, send notifications, push or perform other live lab actions.

## Technical corrections before implementation

| Source issue | Interpretation in this learning path |
|---|---|
| CloudFront task combines static website endpoint with OAC/OAI | Use a bucket REST origin for private OAC/OAI delivery. A website endpoint is a custom origin and cannot use OAC/OAI. Preserve website hosting as a separate comparison. |
| Alias `latest` is told to point to `$LATEST` | Publish a numbered version and move the alias to that version. Alias name and unpublished `$LATEST` are different concepts. |
| Normal successful orders expected in DLQ | Induce a controlled processing failure; demonstrate successful and failed paths separately. |
| Public subnet alone described as granting public reachability | Check actual public accessibility/addressing, route and security configuration. Public-subnet Lambda placement does not give the function a public IP. |
| A public DB and “Lambdas only” ingress plus local migration | Temporarily permit only the learner's IP for migration as specified, then remove that ingress before final evaluation. Do not make the DB generally open. |
| “Micro” or fixed service prices imply free use | Verify account/Region/service eligibility and current pricing. No lab promises zero charges. Budgets notify; they are not universal spending caps. |
| CloudFormation sample opens SSH to everyone | Restrict administrative SSH to the learner's IP and document the deviation from the broad historical example. Keep public web access distinct. |
| IAM long-lived administrator keys | Preserve the source exercise with synthetic learning scope; understand temporary credentials as the preferred broader pattern. Never create root access keys or publish keys. |
| S3 public object demonstration assumes ACLs | Check Object Ownership/Block Public Access and use supported explicit policy settings. Restore private access after the disposable demonstration. |
| Module 7 dependency explanation reverses the reference | Import depends on Authorization because it receives its Lambda. An automatically attached Lambda permission can introduce a reverse reference; the explicit invocation role is intended to avoid that cycle. Inspect the synthesized dependency graph. |
| AI text limit says 5,000 characters | Validate the Comprehend API's UTF-8 byte limit for the selected operation; characters are not interchangeable with bytes. |
| AI sample architecture includes API Gateway but deployment omits it | Add and verify the actual HTTP integration, event parsing, response contract and permissions. Direct Lambda invocation alone does not demonstrate the advertised API. |
| AI sample mixes ES imports with incomplete package configuration | Configure ESM or a build output deliberately and include required package metadata/dependencies. Choose a currently supported runtime instead of copying Node.js 18 unchanged. |
| Two labs numbered 11 | A11 is CI/CD; A12 is the supplied Q/AI lab. Original names remain source context. |
| Source CLI snippets contain typographic dashes or broken arguments | Use valid ASCII command options and verify each variable's meaning; source screenshots are not executable specifications. |
| RDS lab's aggregation explanation suggests items need not transfer | The API still returns items. Compute `SUM` in SQL as required, without claiming the complete response no longer includes item rows. |

These notes clarify outcomes without silently changing exact Practitioner API fields, exported names or Autocode assertions. For a live-version conflict with a required engine/runtime, report it and preserve the original acceptance requirement; do not invent an unapproved replacement and claim it passes.

Official behavior references: [CloudFront private origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html), [Lambda aliases](https://docs.aws.amazon.com/lambda/latest/dg/configuration-aliases.html), [SQS DLQs](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html), [Comprehend sentiment input](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DetectSentiment.html), [IAM security](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html). These key behaviors were checked during the homework assessment on 28 October 2026; service availability and exact console screens still require current verification when implementing.

## Source register

- Practitioner P01: inline account/template assignment supplied in chat. P02–P08: seven supplied text attachments, preserved beside the readable pages as downloadable source text.
- Associate A01/A02/A04/A05/A07/A08/A09/A10: inline task lists supplied in chat, organized into the required checklists without making alternatives into separate mandatory implementations.
- Associate A03/A06/A11/A12: supplied text attachments retained as downloadable source text; A03 is also summarized as a structured checklist.
- Supporting PDFs: IAM Practice Guide (76 pages), EC2 Practice Guide (58), S3 Practice Guide (83), CloudFront Practice Guide (45), CloudFormation Practice Guide (101), VPC Practice Guide (58), RDS/PostgreSQL-to-EC2 Guide (39), DynamoDB-to-EC2 Guide (32), SNS/SQS Practice Guide (41), Serverless Practice Guide (39), CI/CD Practice Guide (113).

The PDFs supplied by the learner remain the original screenshot walkthroughs; they are not duplicated into this site. Their substantive bonuses are included here: CLI IAM lifecycle (A02), S3 role switching and version-aware deletion (A04), endpoint/flow-log work and cleanup (A07), and CLI pipeline tuning/parallelization (A11). Database deployment walkthroughs support the now-required A08 deployments. Incidental “optionally add tags” UI choices are not separate projects.

## Evidence boundaries

No AWS account changes, emails/SMS, deployments, submissions or homework implementations have been performed while preparing these pages. Documentation build/link checks establish that the learning site works, not that learner solutions pass Autocode. Raw source files may retain original “optional,” submission or outdated technical wording; use the interpreted module page and corrections above for this path.
