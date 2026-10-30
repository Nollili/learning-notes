# Repeating tasks and reusable evidence

Repeating means another required application of a topic, not an exemption. Resource reuse is encouraged when compatible. Never reuse a stale URL or removed stack as if it still demonstrated working behavior.

| Capability | First practice | Required repetition | What must be new |
|---|---|---|---|
| Account, MFA, CLI, alerts | P01 | A01 | Recheck state; add exact budget thresholds |
| Permissions | P01/P03–P08 | A02, A04, A11 | Compare identities, denied actions and deployment/service roles |
| Static files | P02 | A03, A04 | EC2 server vs S3 website behavior |
| Private CDN hosting | P02 | A05, A06, A11 | Manual/CLI configuration, alternate origins, templates and pipeline |
| Resource creation | Practitioner CDK | Associate console, CLI and CloudFormation | Repeatability and interface differences |
| Product APIs | P03/P04 | A03, A10, A11 | EC2 vs Lambda; HTTP vs REST API; SAM delivery |
| DynamoDB | P04 | A08, A09 | Global tables, SDK CRUD and stream-triggered notification |
| S3 upload/events | P05 | A04, A10 | SDK/presign boundaries and minimal trigger observations |
| Messaging | P06 | A09 | Orders flow, stream transition and deliberate DLQ failure |
| RDS | P08 | A08 | Bastion/client access, EC2 backend and proxy comparison |
| VPC/EC2 | P08/A03 | A06/A07/A08 | Explicit network matrix, IaC rebuild and database integration |
| Deployment | P02/P03 | A05/A06/A11 | CLI updates, change sets, quality gates and pipeline dependencies |
| Serverless API scaffolding | P03/A10 | A12 | AI service behavior and evidence of reviewing generated code |

## Repetition within one module

- A02 repeats console identity management through CLI.
- A03 repeats instance creation through CLI, tests an AMI through replacement and compares ALB behavior with/without stickiness.
- A04 repeats object operations through console, CLI, SDK and different IAM identities.
- A05 repeats distribution management through CLI and compares cache configurations.
- A06 repeats earlier resources through CloudFormation, then CDK; the nested stack and diagram remain required.
- A07 repeats the manual network through CloudFormation.
- A08 repeats persistence operations through console, CLI, SDK, application and IaC; PostgreSQL driver operations differ from RDS management APIs.
- A10 repeats product behavior through HTTP API and REST API.
- A11 repeats deployment manually and through the pipeline, then tunes its CLI definition.

Each record should state the prior artifact reused, the change made and the additional result observed. Original optional actions remain identifiable on the module pages, but are required under this learning path.
