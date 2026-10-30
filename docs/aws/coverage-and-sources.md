# Coverage, source notes and certification

These notes combine the supplied CloudX course extracts and slide decks into an ordered explanation. They are a synthesis with additional context, not a verbatim mirror or a record of completed practical work.

## How the two courses contribute

| Source area | Canonical chapter in this path |
|---|---|
| Cloud introduction and AWS essentials | [Beginner guide](./beginner-guide.md), [account and tools](./account-and-tools.md) |
| IAM, credentials and policies | [IAM and security](./iam-and-security.md) |
| Frontend deployment, S3 and CloudFront | [Storage and frontend](./storage-and-frontend.md) |
| CDK examples and CloudFormation theory | [Infrastructure as code](./infrastructure-as-code.md) |
| Lambda, API Gateway and serverless | [Serverless and APIs](./serverless-and-apis.md) |
| DynamoDB, RDS, SQL and NestJS/ORM | [Databases](./databases.md) |
| S3 file processing | [File imports](./file-imports.md) |
| Async communication, SQS and SNS | [Messaging](./messaging.md) |
| Authorization and Cognito | [Authentication](./authentication.md) |
| EC2, Auto Scaling and load balancing | [Compute](./compute-and-scaling.md) |
| VPC, DNS and network connectivity | [Networking](./networking.md) |
| Developer tools, monitoring and cleanup | [Delivery and operations](./delivery-and-operations.md) |
| AI tools and services | [AI services](./ai-services.md) |

The Practitioner material supplies application-building continuity. The Associate material broadens service and infrastructure understanding. Networking, compute, messaging and IAM contain deeper concepts even where a chapter is titled “Introduction.” Optional linked reading remains further depth, not proof that the course teaches every linked subject comprehensively.

The supplied S3 introduction, S3/CloudFront and database PDFs inform the storage and database explanations. Their diagrams and examples have been summarized rather than copied wholesale. Course assignments, grading criteria and practical lab deliverables are organized separately in the [AWS homework path](../practice/aws/index.md). Every supplied optional/bonus task is required locally; original grading boundaries remain explicit.

## Corrections and modernization

| Older or misleading source detail | Treatment in these notes |
|---|---|
| S3 overwrites/deletes described as eventually consistent | Explain strong object read-after-write consistency separately from CDN caching |
| OAI used as the frontend default | Explain OAC for a private S3 origin and its website-endpoint limitation |
| IAM PassRole conflated with AssumeRole | Distinguish service role assignment from creating a role session |
| Long-lived administrator keys as the primary setup | Prefer temporary credentials and separate deployment/workload identities |
| FIFO described as exactly-once business execution | Explain deduplication boundaries and duplicate-safe side effects |
| Queue handler reads only the first record | Explain all-record processing and the partial batch failure contract |
| SDK v2 and old runtime examples | Use SDK v3 as the development reference; verify runtime support before deployment |
| TypeScript files copied as Lambda code | Explain required compilation/bundling and handler alignment |
| Basic authentication described as encrypted/unencrypted without transport context | Separate reversible Base64 encoding from HTTPS encryption |
| API keys equated with OAuth client credentials | Explain their different purposes |
| Disabling database certificate verification to fix connectivity | Diagnose the failure and use proper CA verification |
| Fixed prices, quotas and Free Tier assumptions | Link current documentation rather than preserve historical numbers |
| Historical service names and screenshots | Prefer current concepts and service references over menu positions |

Official references for key corrected behaviors were checked on **28 October 2026**. This is not a guarantee that every historical source link, screenshot or feature remains current. No AWS resources were deployed or live-account behavior tested while writing these notes.

## Expected proficiency

A learner who only reads the chapters gains vocabulary and conceptual familiarity. An existing JavaScript developer who independently applies and explains the patterns can develop strong junior AWS application-development skills. Medior readiness additionally requires sound choices under incomplete requirements, unfamiliar failure investigation and ownership of releases and recovery.

These labels are contextual, not a universal AWS grading scale. A medior backend developer can be new to AWS; an AWS-certified learner can still need guidance in production work.

## Certification alignment

**Cloud Practitioner** validates broad cloud understanding. This path goes deeper in application implementation, but exam preparation also needs coverage of business value, compliance, support, billing and the Well-Architected perspective. See the [official Cloud Practitioner guide](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/).

**Developer – Associate** is the closest technical target. Development, security, testing/deployment and troubleshooting overlap strongly with these chapters. Compare the official guide for your intended exam version against what you can actually explain. Use official sample questions and current practice assessments to expose gaps; completing these notes alone is not an exam-readiness guarantee. Check the [current certification page](https://aws.amazon.com/certification/certified-developer-associate/) for version transitions before choosing preparation materials.

**Solutions Architect – Associate** has substantial service overlap but a different architectural emphasis. These notes are a foundation, not a complete architecture-exam curriculum. Certification is not equivalent to professional seniority, and Cloud Practitioner is not a required prerequisite for learning this developer path.

## Original course references

- [CloudX: AWS Practitioner for JS](https://ebook.learn.epam.com/cloudx-aws/docs/intro)
- [CloudX Associate: AWS JavaScript Developer](https://ebook.learn.epam.com/cloudx-associate-aws-js/docs/1.0.0/intro)

These course sites may require organizational access. The user-supplied extracts are the course evidence for this version; official AWS documentation is the reference for changing platform behavior. Each chapter links its relevant service documentation.
