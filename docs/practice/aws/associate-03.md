# A03 — EC2, EBS, load balancing and Auto Scaling

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [compute and scaling](../../aws/compute-and-scaling.md).

[Original supplied text](/aws-homework/sources/associate-03.txt).

## A03.1 — Static website on EC2

- [ ] Create `CloudX-Web-SG`: public HTTP/HTTPS, SSH only from your current IP, and the specified outbound access.
- [ ] Create `CloudX-App-Private-SG` allowing the source-specified traffic from `CloudX-Web-SG`.
- [ ] Launch a suitable Linux instance with a key pair and user data installing Apache or your selected Nginx equivalent. Verify the initial HTTP page.
- [ ] Transfer sample static content to the server directory; verify the changed page. Build/deploy one supplied shop frontend or a compatible chosen app.
- [ ] Use the IAM profiles from A02 to compare permission to stop/start the instance.

## A03.2 — CLI launch and changing SSH source — promoted from optional; repeating A03.1

- [ ] Launch an instance with user data through CLI, verify it and terminate that disposable instance.
- [ ] Write a script for your chosen OS that updates the SSH ingress source when your public IP changes. Replace the pasted source's malformed dash/argument examples with valid commands. Remove obsolete ingress instead of accumulating old allowed IPs.

## A03.3 — Custom Node.js AMI

- [ ] Launch an instance, install Node.js and selected process tools for the intended OS user, and create `CloudXNodejsAMI`.
- [ ] After image creation, terminate the source instance and launch a replacement from that AMI. Verify the tools survive through the image, not an undeclared manual reinstall.

## A03.4 — Backend and frontend integration

- [ ] Deploy the course backend (the `feat/ec2-lab` branch where applicable) or a compatible chosen backend and verify its port-80 endpoint.
- [ ] **Promoted from optional:** point the frontend at that backend, rebuild/redeploy and verify real browser API requests, including correct CORS behavior. **Repeating P03's HTTP capability through EC2 hosting.**

## A03.5 — EBS persistence

- [ ] Create/attach a volume, prepare/mount it appropriately, write test files, safely unmount/detach it and attach it to another compatible instance. Verify the files, then delete the disposable volume. Keep attachment AZ requirements in mind.

## A03.6 — ALB and Auto Scaling

- [ ] Create `CloudX-ALB-SG` for public HTTP and `CloudX-EC2-SG` permitting HTTP from the ALB security group.
- [ ] Create `CloudXWebAMI` from a web-server instance and use it in `CloudXALBLaunchConfig` as the course launch template/configuration reference. Preserve the task name while using the supported template mechanism.
- [ ] Create `CloudX-ALB` in two AZs and `CloudXTargetGroup` with `/index.html` health checks.
- [ ] Configure `CloudX-ASG` with minimum 2, maximum 4 and CPU target 75%; inspect healthy targets and traffic distribution.
- [ ] **Promoted from optional:** enable stickiness and compare traffic distribution. Repeated requests must be distinguishable by target to demonstrate the effect.
- [ ] After verification, reduce capacity to the source's idle 0–1 range with desired 0, or remove the disposable group. Remove unused load balancers, volumes and AMIs/snapshots; stopping an instance alone is not complete cleanup.


## Completion evidence

- [ ] Record observed results for every section, including all promoted extensions.
- [ ] Retain configuration/code, successful and denied/failing cases where specified, and actual cleanup state.
- [ ] Link earlier evidence for repeating work and add the new interface/behavior comparison.

Use the [shared evidence rules](./index.md#evidence-for-every-required-module); never claim screenshots or sample code complete independent work.
