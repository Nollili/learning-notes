---
outline: [2, 3]
---

# Cloud fundamentals for Node.js services

<span class="notes-section-label">**Section 3 reading path:**</span> Map the container, database, identity and report storage you already know to one AWS design. Prepare its network, permission, cost and recovery plan locally. Creating VM, S3, ECS or RDS resources belongs to the separate live-cloud checkpoint. You can complete Project 3’s local/design release without cloud spending. Mark deployment/recovery checks as not executed until you actually run them.

For unfamiliar technical terms, use the [Section 3 vocabulary guide](./index.md#section-3-vocabulary).

AWS is the primary provider, following the existing [AWS service slice](../aws-service-slice.md): HTTPS load balancer → private ECS Fargate tasks → private RDS PostgreSQL, with selected S3 report objects. That slice contains the infrastructure template and prerequisites. This chapter develops the concepts, VM alternative and practice plan. **No cloud resources or costs were created by writing these notes.** Provider references were checked on 2026-11-05; check regional features, quotas and prices before execution.

<!-- tech-check: t30-q01; level: 3 -->

## How do VMs, containers and managed services change your responsibilities?

*Study depth: Foundational*

Level Up: L1 — Junior\
Tech Check level: ⭐⭐⭐

Source mapping: [R140](./requirements.md#r140), [R141](./requirements.md#r141), [R181](./requirements.md#r181).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A virtual machine gives you a guest operating system to configure and maintain. A container packages the environment for a process; who runs its hosts depends on the chosen platform. A managed service hands specified operating tasks to the provider, such as parts of database maintenance.

**“Managed” does not transfer responsibility for your application's behavior, data rules or access permissions.** Identify what the provider handles and what your team must still configure, monitor and recover.

</div>

A VM such as EC2 gives control over OS packages, runtime and processes, with corresponding patching, capacity and recovery work. Containers provide repeatable process packaging; ECS Fargate runs those containers without making you manage individual worker hosts. RDS manages selected database operations, but you still own schema, SQL permissions, workload and recovery requirements.

| Service model | Example | You still decide |
|---|---|---|
| IaaS | EC2 VM, virtual network and block volumes | Guest OS, runtime, application and patching |
| PaaS | Managed application platform | Runtime configuration, dependencies, data and application behavior |
| SaaS | Hosted business application | Users, access policy, data use and integration |
| FaaS | Lambda handler triggered by events | Handler, triggers, permissions, retry/concurrency and state |

These service categories can overlap. Describe the actual responsibilities instead of forcing each product into one category. Horizontal scaling adds application copies; vertical scaling gives one instance more resources. API copies need shared persistent state and sessions. Automatic scaling must account for database connections, dependency quotas, startup time, minimum/maximum size and cost.

<span class="notes-section-label">**Practice and acceptance**</span>

Compare one VM, Fargate and a function for an API plus a report job. Accept with OS/patch owner, deployment artifact, state location, health/recovery, scaling limit and cost drivers for each. Reference: [AWS shared responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/), [EC2 instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Instances.html).

---

<!-- tech-check: t30-q02; level: 3 -->

## How do you configure and recover a VM?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐

Source mapping: [R140](./requirements.md#r140), [R147](./requirements.md#r147).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Save a repeatable specification for the VM's base image, CPU, memory, identity, networking and storage. This lets you rebuild it rather than rely on undocumented manual setup. **Test how you will recover before storing important data there.**

A snapshot saves storage state at a point in time, but the application or database may need coordinated writes for that state to be usable. **A completed snapshot is not proof of a successful application restore.** Restore to an isolated target, verify the data and measure how long recovery actually takes.

</div>

For your practice VM, choose a maintained OS image and architecture compatible with Node and native dependencies. Limit incoming access and the instance role’s permissions. Use a controlled management tool such as Systems Manager. Do not open SSH to all addresses or put long-lived keys in startup user data. Make non-secret package/configuration setup repeatable. Startup logs and machine metadata are not secret stores.

VM resources include virtual network interfaces, security groups, EBS disks, CPU, memory and optional instance-store disks. A disk’s configured name can differ from its NVMe name inside the VM. Check the actual device before partitioning or formatting it; choosing the wrong one destroys data. Mount using stable filesystem identifiers, set permissions and test after reboot. Instance-store data is temporary and has different loss behavior from EBS.

An EBS snapshot saves disk blocks at a point in time and stores later changes incrementally. Coordinate writes or use an application-consistent backup process. Snapshots of several independently changing disks are not automatically a consistent database backup. Encrypt snapshots, restrict access and define how long to keep them. Test restoration to a **new isolated volume/VM**. Measure recoverable data loss and the time until the application can read verified data, not only until the VM starts.

A machine image helps rebuild the OS and application. A database backup restores data. Stopping a VM may leave chargeable disks, snapshots, IP resources and load balancers. List all resources during cleanup and decide who manages anything retained.

<span class="notes-section-label">**Practice and acceptance**</span>

In a sandbox account, configure one small VM from a saved specification, attach an owned volume, create a harmless file and restore a snapshot onto a different owned volume. Verify content/ownership/mount after reboot. Accept with resource IDs, redacted configuration, measured restore and complete cleanup/retention evidence. Execution is still required; these notes do not create the VM. References: [EBS snapshots](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html), [EBS volume attachment](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-attaching-volume.html), [Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html).

---

<!-- tech-check: t30-q03; level: 3 -->

## When should storage be object, block or file based?

*Study depth: Intermediate*

Level Up: L1 — Junior\
Tech Check level: ⭐⭐⭐

Source mapping: [R140](./requirements.md#r140).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Object storage keeps objects under keys and exposes APIs for reading and writing them. Block storage provides disk-like blocks, usually used through a filesystem or database. File storage exposes files and directories through a shared filesystem interface.

**Choose the storage interface and guarantees your workload needs.** Consider how data is read, updated and shared, and what must remain consistent. These services are not interchangeable folders; saving an object and committing a database row are separate operations that need a coordinated failure policy.

</div>

S3 is appropriate for immutable exports, uploads and assets. EBS is block storage for a VM's filesystem/database under its attachment constraints. EFS provides a shared file interface for workloads that need filesystem semantics. Compare latency, throughput, availability zone/region behavior, access controls, encryption, retention, lifecycle and egress/request costs.

For a Products report, save a report/status row in PostgreSQL. Write the object under a tenant key chosen by the server. Mark the report ready only after that exact object/key/version exists. SQL and object storage cannot commit together automatically. Define safe retries and a way to reconcile failures or remove incomplete objects.

```js [report-object-key.mjs]
import assert from 'node:assert/strict';

function reportKey(tenant, reportId) {
  const part = /^[a-z0-9][a-z0-9-]{0,39}$/;
  if (
    typeof tenant !== 'string' ||
    typeof reportId !== 'string' ||
    !part.test(tenant) ||
    !part.test(reportId)
  ) {
    throw new TypeError('invalid server-selected storage identifier');
  }
  return `tenants/${tenant}/reports/${reportId}.json`;
}
assert.equal(reportKey('acme', 'r-1'), 'tenants/acme/reports/r-1.json');
assert.throws(() => reportKey('../other', 'r-1'));
assert.throws(() => reportKey(undefined, 'r-1'));
assert.throws(() => reportKey('acme', null));
```

Both arguments come from authorized server state. A correctly formatted key does not prove permission. The [AWS example](../aws-service-slice.md#three-identities-with-different-purposes) limits a tenant-specific task role to selected report objects. A service handling several tenants also needs checks on each request. Use workload credentials with the AWS SDK instead of embedded keys. Anyone holding a presigned URL can use its permitted operation until expiry. Authorize before creating it, keep expiry short and avoid logging it. Validate upload size, type and key, and safely process untrusted content.

S3's documented strong consistency for object operations is not an atomic transaction across several objects and PostgreSQL. Versioning helps recover overwritten/deleted objects but can retain chargeable versions indefinitely. Lifecycle rules, encryption keys and deletion policy need deliberate review.

<span class="notes-section-label">**Practice and acceptance**</span>

In an owned private bucket, upload one authorized report, retrieve it, reject another tenant and test an expired capability. Record checksum/key/version, lifecycle and deletion of all owned versions. Accept only with observed IAM denial as well as app denial. Reference: [S3 concepts and consistency](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html), [presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).

---

<!-- tech-check: t30-q04; level: 3 -->

## How does an application reach a managed database securely?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R145](./requirements.md#r145).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

The application needs an allowed network route to the database, database credentials with limited privileges and a TLS connection that verifies the intended server. **Networking, identity and encryption solve different parts of the connection problem.** Configure all of them.

**An IAM permission or a private subnet alone is not enough.** The database still needs the correct SQL permissions, endpoint, credentials and certificate checks. Limit the combined connection pools across all replicas so a secure connection setup does not become an overload problem.

</div>

In this design, RDS is private and accepts PostgreSQL traffic only from the API security group. The task also needs correct routes and DNS. The database does not need a public endpoint. A timeout may indicate a network, DNS, routing or capacity problem. Authentication errors point to database credentials/permissions. Certificate errors require the correct hostname and CA chain; do not disable verification.

The ECS execution role retrieves the startup secret. The application task role separately controls SDK actions, and the SQL role controls database permissions. Updating a secret does not automatically change an already-running connection pool. Plan how new credentials are adopted and old credentials retired, including restarts or reconnection. Test both steps.

Use [verified driver TLS settings](./17-databases.md#t17-q02), a separate migration identity and a controlled schema rollout. Configure backup retention and test restore/reconnection. Point-in-time recovery (PITR) restores data to a chosen supported time. Replicas can lag behind the primary, so decide how a user reads their own recent write. A database proxy can manage connections but does not provide unlimited capacity or remove transaction/session rules.

<span class="notes-section-label">**Practice and acceptance**</span>

In the owned AWS slice, verify task→DB connectivity, denial from an unapproved source, certificate/hostname validation, role privileges and combined pool limits. Restore a backup to an isolated target and validate data. Accept with sanitized evidence and no public DB rule. References: [RDS TLS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html), [RDS VPC access](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.html).

---

<!-- tech-check: t30-q05; level: 3 -->

## Which identities and network boundaries does the cloud service need?

*Study depth: Intermediate*

Level Up: L3 — Senior\
Tech Check level: ⭐⭐⭐

Source mapping: [R142](./requirements.md#r142), [R147](./requirements.md#r147).


<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Use separate identities for deploying the system, running the platform's setup tasks and performing the application's runtime actions. **Give each identity only the actions and resources it needs.** For example, permission to fetch a startup secret differs from permission to deploy a new service.

**A compromised application should not inherit administrator access to deployment or all secrets.** Network boundaries restrict which systems can connect; application authentication and authorization still control what callers may do. Configure those protections separately.

</div>

The CI/deployment role changes the selected infrastructure and may pass only approved roles. The ECS execution role pulls the image, sends logs and reads its startup secret. The task role grants the application its required S3 actions. Prefer short-lived role credentials over cloud keys stored in a repository. Protect `PassRole`, role trust rules and deployment environments.

IAM evaluates identity/resource policies and explicit denies alongside other account controls. A wildcard action/resource is not a harmless convenience. Test the exact action/key boundary and inspect denied access safely. Encrypt at rest and in transit with a managed key policy/rotation plan, while remembering encryption does not compensate for an overbroad authorized role.

Subnets, routes, security groups, network endpoints and application authentication protect different boundaries. A private task may need VPC endpoints or NAT to reach image, log, secret and storage services. Both choices have costs and access rules. Security groups do not validate JWTs. HTTPS encrypts a request but does not grant permission. Keep access logs with sensitive values removed and assign responsibility for reviewing them.

<span class="notes-section-label">**Practice and acceptance**</span>

Write an access matrix for operator, execution role, task role, SQL app role and end user. Show one allowed and one denied action for each. Accept only when denial is tested in the sandbox and no principal receives blanket admin to fix configuration. References: [IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html), [ECS task roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html), [shared responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/).

---

<!-- tech-check: t30-q06; level: 3 -->

## What constitutes a complete first cloud exercise?

*Study depth: Intermediate*

Level Up: L2 — Software Engineer\
Tech Check level: ⭐⭐⭐

Source mapping: [R144](./requirements.md#r144), [R147](./requirements.md#r147).



<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A complete cloud exercise tests a reviewed change in the intended environment. **Show both that allowed work succeeds and that forbidden access fails.** Observe health checks, failures and recovery, control costs, and remove or explicitly retain the resources afterward.

**A template that parses locally is only preparation.** It does not prove that the deployed application can reach its database, enforce permissions or recover from a failure. Keep evidence of what actually ran, its results and cleanup.

</div>

**This is the live-cloud checkpoint.** For Project 3’s required [local/design checkpoint](./progressive-projects.md#project-3-checkpoint-levels), prepare the plan and mark the execution results not assessed. Proceed with the following live steps only when doing the separate authorized sandbox exercise.

Follow the [AWS example](../aws-service-slice.md) in one sandbox account and region. It requires an existing VPC, subnets, RDS database, load balancer, certificate, endpoints and compatible image. Do not assume its template creates all of them. Record the account/region, resources, expected costs and maximum test duration first. Set budgets and alerts, but remember that an alert does not automatically stop spending.

Prepare a change set and inspect which resources it creates, replaces or deletes, including permission/network changes. Deploy through the approved process. Test HTTPS, authentication, tenant separation, report storage and database access. Check readiness and replacement behavior, not just the stack’s status. Retain the release digest, test results and outputs with secrets removed.

Estimate costs for compute, load balancer, database, storage/requests, logs, endpoints/NAT, data transfer and backups using current regional prices. Supporting resources may cost more than a small task. During cleanup, also list retained backups, object versions, logs and disks. Record why each retained resource is needed, when it expires and who will remove it.

<span class="notes-section-label">**Practice and acceptance**</span>

Produce a redacted evidence folder containing reviewed plan, identity/network matrix, positive/negative smoke, bounded failure/recovery, actual cost review and cleanup inventory. Until these are executed, your cloud checkpoint stays “not assessed.” References: [CloudFormation change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html), [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html), [AWS Pricing Calculator](https://calculator.aws/).

## Revision and practical checkpoint

Explain what the provider manages, what your team manages and which evidence supports each claim. Implement one coherent AWS slice before exploring another provider. VM restore and managed-service deployment remain separate practice tasks; neither is established by the local storage-key example or infrastructure lint.

### Mixed practice

1. A task role permits S3 reads, but the private task cannot pull its image. Which boundary do you inspect?
2. A snapshot completed. Can you claim a ten-minute recovery objective?

<span class="notes-section-label">**Answer guide — read after attempting both cases**</span>

1. Inspect the execution role and the ECR/S3/DNS/network endpoint path. The application task role is a separate authority; do not grant blanket admin to both.
2. No. Restore to an isolated target, make the application usable and verify data; measure that elapsed time and the recoverable data timestamp. Snapshot completion alone does not test application consistency.
