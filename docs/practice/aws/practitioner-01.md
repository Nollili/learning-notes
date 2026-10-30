# P01 — Account setup

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [account and tools](../../aws/account-and-tools.md). **Overlap:** Recheck account/MFA/CLI/billing in A01; no second account is needed.

## Task 1.1 — Set up your AWS account

- [ ] Create and verify an AWS account. Protect the root user and enable MFA.
- [ ] Create an everyday-work IAM user with `AdministratorAccess` and MFA, as required by this course exercise. See [the distinction from the recommended temporary-credential setup](./source-notes.md).
- [ ] Install and configure AWS CLI with the exercise user's credentials and a deliberate Region. Confirm account access, for example:

```bash
aws iam get-user --user-name=MyUser
```

- [ ] Enable applicable Free Tier usage notifications and configure AWS Budget alerts. Record recipients and thresholds without publishing private details. Alerts do not impose a universal hard spending cap.

## Task 1.2 — Understand the template repository

- [ ] Read the course [template repository](https://autocode.git.epam.com/ld-autocode-js-programs/cloudx-aws-practitioner-for-js/cloudx-aws-practitioner-for-js-template) README and its setup/submission workflow.
- [ ] Let Autocode create the learner fork when starting Module 2; do not manually fork or clone the template ahead of that workflow. Read “check out the template” as reviewing it at this stage.

## Evaluation criteria

Account created and verified; root MFA enabled; exercise administrator IAM user created with MFA; CLI installed and authenticated; applicable Free Tier notifications enabled; Budget alerts configured. Record actual results, not just a configuration intention.


## Completion evidence

Record each required task, the observed acceptance results, applicable test output, all promoted extensions, and cleanup. Original Autocode checks do not automatically verify the promoted extensions. See the [shared evidence rules](./index.md#evidence-for-every-required-module).
