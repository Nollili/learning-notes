# A08 — DynamoDB and RDS application integration

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [databases](../../aws/databases.md).

## A08.1 — DynamoDB — repeating P04

- [ ] Create a table such as `User` with partition key `id`; inspect configuration and console sections.
- [ ] Insert differently shaped records through console and CLI. Delete and recreate a disposable table through CLI.
- [ ] Configure a global-table replica in another Region, create records and observe replication.
- [ ] Write a Node.js SDK v3 CRUD script. Compare relevant libraries/tools and explain their roles without installing every listed library.
- [ ] **Promoted from optional:** inspect the `feat/dynamodb-lab` course backend, connect it to the table and deploy it on EC2. Verify real API reads/writes. Use the supplied DynamoDB/EC2 PDF walkthrough as support.
- [ ] **Promoted from optional:** define the table, stream and global-table replicas in a suitable CloudFormation resource; parameterize the requested name/Region values, deploy, inspect and remove the disposable stack. Validate the chosen resource's actual replica configuration rather than assuming a normal table gains replicas from a flag.
- [ ] **Promoted from optional; repeating infrastructure through CDK:** investigate and demonstrate management of the relevant DynamoDB resources with CDK.

## A08.2 — RDS — repeating P08, with EC2 deployment

- [ ] Provision an eligible PostgreSQL instance, or the source-permitted selected engine, in a suitable DB subnet group in the A07 VPC. Check actual account eligibility/cost rather than assume a free instance.
- [ ] Connect with DBeaver/pgAdmin or an SSH tunnel through the bastion, depending on the selected topology. Create tables/data and run DDL, DML and CRUD operations.
- [ ] Connect using `psql` from the bastion (for PostgreSQL), repeat CRUD and investigate CLI/SDK RDS management operations. Distinguish managing an RDS instance from querying SQL through a database driver.
- [ ] Compare relevant ORMs and inspect the supplied application example. **Promoted from optional:** connect/deploy the database-backed application on EC2 and verify persistence, using the RDS/EC2 PDF guide as support.
- [ ] **Promoted from optional:** create RDS Proxy for a compatible selected database configuration, connect through it and compare the connection path with direct access.
- [ ] **Promoted from optional; repeating infrastructure through CDK:** investigate and demonstrate RDS resource management through CDK.
- [ ] Stop eligible instances only for short idle periods under current service rules; remove unused resources, snapshots and both global-table Regions when the learning dependency is finished.


## Completion evidence

- [ ] Record observed results for every section, including all promoted extensions.
- [ ] Retain configuration/code, successful and denied/failing cases where specified, and actual cleanup state.
- [ ] Link earlier evidence for repeating work and add the new interface/behavior comparison.

Use the [shared evidence rules](./index.md#evidence-for-every-required-module); never claim screenshots or sample code complete independent work.
