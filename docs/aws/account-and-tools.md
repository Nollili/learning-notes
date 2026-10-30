# Account, development tools and cost awareness

An AWS account owns resources and their billing. Before deploying anything, understand which identity, account and Region your tools will use.

## Account creation and everyday access

Use the [official account creation guidance](https://repost.aws/knowledge-center/create-and-activate-aws-account). Registration involves email verification, contact and payment details, and identity verification; exact screens and available plans change. Read the current terms rather than reproduce an older screenshot's choices blindly.

Protect the root identity with MFA and use it only for tasks that require it. Prefer federated everyday access through IAM Identity Center and temporary role credentials. The supplied course's long-lived administrator access keys explain a historical setup, but should not be the default for new learning notes. AWS recommends temporary credentials for people and workloads. [IAM security guidance](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

Keep credentials out of source code, screenshots, frontend bundles and committed environment files. An example credential in a tutorial is not a value to reuse.

## Console, CLI, SDK and infrastructure as code

| Interface | Useful for | Important boundary |
|---|---|---|
| Console | Inspect resources and understand configuration | Manual changes are easy to forget |
| CLI | Repeatable commands and diagnostics | Selected profile and Region determine the target |
| SDK | Application code calling AWS APIs | Calls use the application's credentials and permissions |
| CDK / CloudFormation | Declare infrastructure in versioned files | Deployment can create, replace or delete resources |

A named profile separates account/role settings. For an Identity Center profile, a typical authentication and identity check is:

```bash
aws configure sso --profile learning
aws sso login --profile learning
aws sts get-caller-identity --profile learning
aws configure get region --profile learning
```

These commands do not deploy infrastructure. The account ID and role in the identity response help detect an accidental production target. A Region may be supplied through a profile, environment or an individual command, so inspect overrides when results differ from expectations.

SDK clients use a credential provider chain. In Lambda, use the execution role; locally, use your configured development identity. Never embed secret access keys in code merely to make the SDK work.

## Budgets and current pricing

Use [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html), [Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/) and the [Pricing Calculator](https://calculator.aws/) for different purposes: alerts, spending analysis and estimates. Check the [current Free Tier](https://aws.amazon.com/free/) and your account's eligibility before using a service.

Budget information and notifications can lag usage. An alert does not undo charges or automatically stop every resource. Automated budget actions are a separate configuration with their own scope.

Resource tags such as `Project=learning-store` and `Environment=learning` make ownership and cost attribution easier. Tags do not themselves restrict access or guarantee that every resource appears in one inventory.

## Resource lifetime

| Action | What may remain |
|---|---|
| Stop an EC2 instance | EBS volumes, snapshots, allocated addresses |
| Delete an application stack | Retained resources, snapshots, resources made outside the stack |
| Delete a versioned S3 object's current version | Previous versions and possibly a delete marker |
| Remove a Lambda | Log groups and separately owned integrations |
| Delete a database | Retained backups or a final snapshot |

Use [delivery and operations](./delivery-and-operations.md) for cleanup order. Cleanup is part of resource ownership, and should be planned when a resource is created.

Next: [IAM and security](./iam-and-security.md).
