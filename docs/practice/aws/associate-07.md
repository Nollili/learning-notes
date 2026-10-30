# A07 — Custom VPC and connectivity

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [networking](../../aws/networking.md).

## A07.1 — Required network layout

| Resource | Required name / address |
|---|---|
| VPC | `CloudX-VPC`, `10.0.0.0/16` |
| Internet gateway | `CloudX-IGW`, attached to the VPC |
| Public subnet A | `CloudX-PublicSubnet-A`, AZ A, `10.0.10.0/24` |
| Public subnet B | `CloudX-PublicSubnet-B`, AZ B, `10.0.20.0/24` |
| Public route table | `CloudX-Public-RT`, local route and `0.0.0.0/0` → internet gateway |
| Private subnet A | `CloudX-PrivateSubnet-A`, AZ A, `10.0.11.0/24` |
| Private route table | `CloudX-Private-RT-A`, local route and default route → NAT |
| DB subnet A | `CloudX-DbSubnet-A`, AZ A, `10.0.13.0/24` |
| DB route table | `CloudX-Db-RT-A`, local route only |
| NAT gateway | `CloudX-Nat-GW-A`, public subnet A, allocated Elastic IP |

- [ ] Create these resources and explicit subnet/route-table associations. Configure public address assignment as required; the internet-gateway route is what makes the public subnet's routing public.
- [ ] Place a bastion in public subnet B with SSH only from your IP. Adapt the earlier EC2 CloudFormation template.
- [ ] Deploy a static web application on an instance in public subnet A, with public HTTP/HTTPS permission.
- [ ] Create one instance in the private subnet and one in the DB subnet. Apply the source's shared, self-referencing security group to the intended instances. Keep that broad internal group identified as a lab topology.
- [ ] Verify public website access, bastion-mediated private/DB access, public/bastion outbound internet access, private outbound internet through NAT, public/private access to the DB instance, and absence of DB internet access. Distinguish routing restrictions from OS/firewall responses; failed ping alone is not a full connectivity diagnosis.

## A07.2 — Rebuild through CloudFormation — promoted from optional; repeating A07.1/A06

- [ ] Define the same VPC topology in CloudFormation, create the stack, inspect resources, compare against the manual topology and destroy the disposable stack after verification.

## A07.3 — Guide bonuses: endpoints, flow logs and cleanup — mandatory

- [ ] Configure the supplied guide's S3 VPC endpoint scenario and demonstrate the private service path with appropriate routes and permissions.
- [ ] Configure a VPC flow log and inspect accepted/rejected traffic metadata in the selected destination. Configure the needed publishing permissions; do not interpret flow logs as HTTP payload logs.
- [ ] Stop unused instances, delete unused NAT gateways and release their addresses. Inspect and remove/update stale routes rather than leaving them as an unexplained final state.

**Repeating:** EC2, SSH, security groups and web hosting repeat A03; automation repeats A06. This lab's new evidence is the traffic-path matrix across public, private and isolated subnets.


## Completion evidence

- [ ] Record observed results for every section, including all promoted extensions.
- [ ] Retain configuration/code, successful and denied/failing cases where specified, and actual cleanup state.
- [ ] Link earlier evidence for repeating work and add the new interface/behavior comparison.

Use the [shared evidence rules](./index.md#evidence-for-every-required-module); never claim screenshots or sample code complete independent work.
