---
outline: [2, 3]
---

# Cloud fundamentals for Node.js services

AWS is the primary provider, following the existing [AWS service slice](../aws-service-slice.md): HTTPS load balancer → private ECS Fargate tasks → private RDS PostgreSQL, with selected S3 report objects. That slice contains the infrastructure template and prerequisites. This chapter develops the concepts, VM alternative and practice plan. **No cloud resources or costs were created by writing these notes.** Provider references were checked on 2026-11-05; check regional features, quotas and prices before execution.

## How do VMs, containers and managed services change your responsibilities? {#t30-q01}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A VM gives you a guest operating system; a container packages a process environment; a managed service delegates selected operating tasks to a provider. **Managed does not mean someone else owns your application, data policy or access controls.**

</div>

A VM such as EC2 gives control over OS packages, runtime and processes, with corresponding patching, capacity and recovery work. Containers provide repeatable process packaging; ECS Fargate runs those containers without making you manage individual worker hosts. RDS manages selected database operations, but you still own schema, SQL permissions, workload and recovery requirements.

| Service model | Example | You still decide |
|---|---|---|
| IaaS | EC2 VM, virtual network and block volumes | Guest OS, runtime, application and patching |
| PaaS | Managed application platform | Runtime configuration, dependencies, data and application behavior |
| SaaS | Hosted business application | Users, access policy, data use and integration |
| FaaS | Lambda handler triggered by events | Handler, triggers, permissions, retry/concurrency and state |

Service categories overlap at the edges; name the actual responsibility boundary instead of forcing every product into one label. Horizontal scaling adds instances; vertical scaling changes the resources of an instance. Stateless API replicas need shared authoritative state and sessions. Autoscaling must respect database connections, downstream quotas, startup time, minimum/maximum and cost.

<span class="notes-section-label">**Practice and acceptance**</span>

Compare one VM, Fargate and a function for an API plus a report job. Accept with OS/patch owner, deployment artifact, state location, health/recovery, scaling limit and cost drivers for each. Reference: [AWS shared responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/), [EC2 instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Instances.html).

---

## How do you configure and recover a VM? {#t30-q02}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Treat a VM as a reproducible configuration of image, CPU/memory, identity, network interfaces and storage. Create a tested recovery path before storing important data there. **A snapshot is useful backup input, not proof that the application restores consistently.**

</div>

For an owned practice VM, select a maintained OS image and architecture matching Node/native dependencies; restrict ingress, attach a narrow instance role and use a controlled management path such as Systems Manager. Do not expose SSH to every address or put long-lived cloud keys in user data. Bootstrap nonsecret packages/service configuration repeatably; cloud-init/user-data logs and metadata are not secret vaults.

Virtual devices include the virtual NIC/security groups, EBS block devices, CPU/memory and optional instance-store disks. The device name requested at attachment may differ from the guest's actual NVMe device. Inspect device identity before partitioning/formatting; formatting the wrong device destroys data. Mount via stable filesystem identifiers, apply permissions and verify reboot behavior. Instance-store storage is ephemeral and has different loss rules from EBS.

An EBS snapshot captures blocks at a point in time and is incremental. Coordinate writes or use an application/database-consistent backup process; a snapshot of several independently changing disks is not automatically a valid multi-volume database backup. Encrypt and restrict snapshots, define retention, and test restoring to a **new isolated volume/VM**. Record data-loss window and time to a verified application read, not just time until an instance boots.

A reusable machine image helps rebuild OS/application state; a database backup restores data. Keep those concepts separate. Stopping a VM can leave charged volumes, snapshots, IP resources and load balancers. Teardown needs an inventory and retention owner.

<span class="notes-section-label">**Practice and acceptance**</span>

In a sandbox account, configure one small VM from a saved specification, attach an owned volume, create a harmless file and restore a snapshot onto a different owned volume. Verify content/ownership/mount after reboot. Accept with resource IDs, redacted configuration, measured restore and complete cleanup/retention evidence. Execution is still required; these notes do not create the VM. References: [EBS snapshots](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html), [EBS volume attachment](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-attaching-volume.html), [Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html).

---

## When should storage be object, block or file based? {#t30-q03}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Object storage exposes keys and object APIs, block storage exposes disk-like blocks and file storage exposes a shared filesystem interface. **Choose the interface and consistency boundary the workload needs**, rather than treating all storage as a mounted folder.

</div>

S3 is appropriate for immutable exports, uploads and assets. EBS is block storage for a VM's filesystem/database under its attachment constraints. EFS provides a shared file interface for workloads that need filesystem semantics. Compare latency, throughput, availability zone/region behavior, access controls, encryption, retention, lifecycle and egress/request costs.

For a Products report, commit a report row/status in PostgreSQL, produce an object at a server-selected tenant key and mark the report ready with its exact key/version. The object write and SQL commit are separate systems: failures require an idempotent workflow and reconciliation/cleanup. Do not announce a report as ready before the referenced object exists.

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

Here both arguments come from authorized server state. A valid key shape is not tenant authorization. The existing [AWS slice](../aws-service-slice.md#three-identities-with-different-purposes) scopes a per-tenant task role to selected report objects; a shared multi-tenant service needs per-request enforcement too. Use the AWS SDK with workload credentials rather than embedding keys. A presigned URL is a bearer capability for a specific operation/time; authorize first, keep expiry narrow and avoid logs. For uploads enforce size/type/key policy and process untrusted contents safely.

S3's documented strong consistency for object operations is not an atomic transaction across several objects and PostgreSQL. Versioning helps recover overwritten/deleted objects but can retain chargeable versions indefinitely. Lifecycle rules, encryption keys and deletion policy need deliberate review.

<span class="notes-section-label">**Practice and acceptance**</span>

In an owned private bucket, upload one authorized report, retrieve it, reject another tenant and test an expired capability. Record checksum/key/version, lifecycle and deletion of all owned versions. Accept only with observed IAM denial as well as app denial. Reference: [S3 concepts and consistency](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html), [presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).

---

## How does an application reach a managed database securely? {#t30-q04}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Provision an allowed network path, a least-privilege database identity and verified TLS, then budget pools across all replicas. **An IAM permission or private subnet alone does not make a SQL connection correct or secure.**

</div>

In the selected topology, RDS is private and accepts PostgreSQL traffic only from the API security group. The task needs correct subnet routes, DNS and security-group paths; the database need not be publicly reachable. A timeout suggests network/DNS/routing or saturation; authentication failure suggests the role/secret/database contract; certificate errors require the correct endpoint and CA chain rather than disabling checks.

The ECS execution role can retrieve the configured startup secret; the application task role separately controls SDK actions. The database role still needs SQL privileges. A connection URI injected at task start will not automatically rotate an already running pool when the secret changes. Plan rotation with overlapping credentials/restarts/reconnection and validate both old retirement and new success.

Use [the driver's verified TLS configuration](./17-databases.md#t17-q02), a separate migration identity and controlled schema rollout. Managed backup/PITR and failover features require configured retention and application reconnect behavior. Read replicas may lag; use the authoritative write path for an invariant and decide read-your-writes explicitly. A database proxy can improve connection management but does not grant infinite backend capacity or remove transaction/session constraints.

<span class="notes-section-label">**Practice and acceptance**</span>

In the owned AWS slice, verify task→DB connectivity, denial from an unapproved source, certificate/hostname validation, role privileges and combined pool limits. Restore a backup to an isolated target and validate data. Accept with sanitized evidence and no public DB rule. References: [RDS TLS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html), [RDS VPC access](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.html).

---

## Which identities and network boundaries does the cloud service need? {#t30-q05}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

Separate deployment authority, platform execution authority and application runtime authority. Give each only its required actions/resources. **A compromised runtime should not inherit the ability to redeploy the account or read every secret.**

</div>

The CI/deployment role changes the selected stack and passes only reviewed roles. The ECS execution role pulls the selected ECR image, emits logs and retrieves the designated startup secret. The task role grants the application's selected S3 operations. Use short-lived workload federation/roles, not repository-stored cloud access keys; protect `PassRole`, trust policies and deployment environments.

IAM evaluates identity/resource policies and explicit denies alongside other account controls. A wildcard action/resource is not a harmless convenience. Test the exact action/key boundary and inspect denied access safely. Encrypt at rest and in transit with a managed key policy/rotation plan, while remembering encryption does not compensate for an overbroad authorized role.

Subnets, routes, security groups, endpoints and application authentication have different roles. A private task may still need image/log/secret/storage access through reviewed VPC endpoints or NAT; either has costs and policy implications. A security group does not validate JWTs, and HTTPS does not stop a correctly encrypted unauthorized request. Retain audit logs with redaction and an owner.

<span class="notes-section-label">**Practice and acceptance**</span>

Write an access matrix for operator, execution role, task role, SQL app role and end user. Show one allowed and one denied action for each. Accept only when denial is tested in the sandbox and no principal receives blanket admin to fix configuration. References: [IAM best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html), [ECS task roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html), [shared responsibility](https://aws.amazon.com/compliance/shared-responsibility-model/).

---

## What constitutes a complete first cloud exercise? {#t30-q06}

<div class="notes-core-answer">

<p class="notes-core-answer__title">Core answer</p>

A complete exercise includes a reviewed change, working application path, denied access, observed health/failure behavior, cost controls and cleanup. **A template that parses locally is preparation, not a successful deployment.**

</div>

Follow the [existing AWS slice](../aws-service-slice.md) in one sandbox account/region. Its prerequisites include reviewed VPC/subnets/RDS/load balancer/certificate/endpoints and a compatible image. Do not assume the slice creates those foundations. First save the account/region, resource inventory, expected cost drivers and maximum test duration. Set budgets/alerts, but recognize alerts are not an automatic hard spending cap.

Prepare a change set and inspect creates/replacements/deletes and IAM/network effects. Deploy through controlled authority, then test HTTPS routing, application auth/tenant isolation, report storage and DB access. Measure readiness and graceful replacement, not only “stack complete.” Save release digest, redacted outputs, smoke results and observations.

Estimate compute, load balancer, database, storage/requests, logs, endpoints/NAT, transfer and backup retention using current regional pricing. A tiny task may cost less than its supporting endpoints/load balancer. Teardown should enumerate retained backups/versions/log groups/volumes as well as the main compute. Record intentional retention and an expiry owner instead of silently deleting evidence or leaving resources indefinitely.

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
