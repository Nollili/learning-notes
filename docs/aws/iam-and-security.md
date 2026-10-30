# IAM: identities, roles and permissions

IAM controls access to AWS resources. Start with a concrete question: **which principal may perform which action on which resource, under which conditions?** A principal is the identity making the request.

## Identities and credentials

| Concept | Purpose |
|---|---|
| Root user | Account identity reserved for exceptional account tasks |
| IAM user | An identity that can have long-lived credentials |
| IAM group | A way to attach permissions to a collection of IAM users |
| IAM role | An assumable identity with a trust policy and permissions |
| STS | Issues temporary security credentials for supported session operations |
| Identity Center | Workforce access to accounts and applications through managed sign-in |

Temporary AWS credentials contain an access key ID, secret access key, session token and expiration. A role's session duration is configurable within applicable limits; it is not a universal fixed duration. SDKs can obtain and refresh supported role credentials without you copying keys into the application.

An **ARN** identifies an AWS resource. Its structure depends on the service. S3 bucket ARNs look different from Lambda ARNs; do not invent an ARN by assuming every service uses the same fields.

## Policies are permission statements

This illustrative identity policy permits reads under one S3 prefix:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::example-learning-assets/public/*"
  }]
}
```

`Effect` allows or denies, `Action` names API operations, `Resource` scopes the target, and optional `Condition` elements constrain the circumstances. The `Version` is a policy-language version, not today's date. `Principal` identifies who is allowed in relevant resource and trust policies; it does not belong in a normal identity policy.

Listing a bucket and reading an object are separate actions on different resource types. A policy permitting object reads does not automatically permit `ListBucket`.

## Trust versus permission

A role has two separate questions:

- **Trust policy:** who may assume this role?
- **Permissions policies:** what may a resulting session do?

A Lambda execution role trusts the Lambda service. Its permissions might allow reading one bucket and writing one table. The person deploying that Lambda is a different principal with deployment permissions.

`sts:AssumeRole` creates a role session. **`iam:PassRole` permits assigning an approved role to a service**, such as configuring a Lambda to use its execution role; it does not give the caller a session as that role. Unrestricted role passing can let someone configure a powerful service even when their own direct permissions are limited. [AWS role-passing explanation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_passrole.html).

## How a denial happens

Access is denied unless an applicable permission allows it, and an applicable explicit deny overrides an allow. Organization controls, session policies, permissions boundaries and resource policies can further affect the result. A permissions boundary limits possible permissions; it does not grant permissions by itself.

For an unexpected denial, inspect the actual caller, action, resource and conditions. Then inspect the relevant identity policy and resource policy, including a KMS key policy when encryption is involved. Changing the application role to administrator may hide the cause and enlarge the damage possible from a bug.

## Security beyond IAM

TLS protects traffic; encryption at rest protects stored data. KMS controls encryption keys and their usage permissions. Secrets Manager stores sensitive configuration with access control and rotation features. Environment variables are configuration delivery, not a reason to commit a password.

CloudTrail supports investigation of AWS API activity. CloudWatch provides application and infrastructure telemetry. Neither should receive raw passwords or bearer tokens in log messages.

Prefer small permissions scoped to workload responsibilities, and review public and cross-account access with IAM Access Analyzer. [AWS security practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

Next: [S3 and CloudFront](./storage-and-frontend.md).
