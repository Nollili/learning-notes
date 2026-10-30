# A02 — IAM groups, policies and roles

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [iam and security](../../aws/iam-and-security.md).

## A02.1 — Groups and console users

- [ ] Create `CoordinatorsGroup`, `MentorsGroup` and `StudentsGroup`.
- [ ] Create a console user for each group. Sign in before attaching policies and observe the initial lack of permissions.
- [ ] Attach `AdministratorAccess`, `SupportUser` and `PowerUserAccess`, respectively. Recheck visible resources and allowed/denied operations under each user.

## A02.2 — Policies, service roles and named profiles

- [ ] Create `EC2FullAccessPolicy`, `S3FullAccessPolicy` and `S3ReadOnlyAccessPolicy` with the source's EC2-wide, S3-wide and S3 read/list scopes. These broad lab policies are not production defaults.
- [ ] Create EC2-trusted roles `EC2FullAccessRole`, `S3FullAccessRole`, `S3ReadOnlyAccessRole` and attach the corresponding policies.
- [ ] Create `EC2FullAccessGroup`, `S3FullAccessGroup` and `S3ReadOnlyAccessGroup`; attach the matching policies.
- [ ] Create exercise users with programmatic access, assign each to its group and configure separate CLI named profiles. Never commit their keys.
- [ ] Compare allowed and denied operations through those profiles; retain actual outcomes, not just screenshots of policy attachment.

## A02.3 — CLI identity management — promoted from optional; repeating A02.1–2 through CLI

- [ ] With an authorized admin profile, create a group, attach a managed policy, create a user and assign membership through CLI.
- [ ] Complete the supplied IAM guide's bonus: create exercise access credentials, inspect the result and remove the temporary keys, policy attachment, group membership, user and group in a valid dependency order.
- [ ] Keep required roles/profiles for later labs; remove disposable bonus identities and record what remains.


## Completion evidence

- [ ] Record observed results for every section, including all promoted extensions.
- [ ] Retain configuration/code, successful and denied/failing cases where specified, and actual cleanup state.
- [ ] Link earlier evidence for repeating work and add the new interface/behavior comparison.

Use the [shared evidence rules](./index.md#evidence-for-every-required-module); never claim screenshots or sample code complete independent work.
