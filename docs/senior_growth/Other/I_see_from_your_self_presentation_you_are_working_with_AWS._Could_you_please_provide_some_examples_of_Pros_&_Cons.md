# I see from your self presentation you are working with AWS. Could you please provide some examples of Pros & Cons?

## AWS: Pros & Cons {#%F0%9F%94%B9-aws-pros-cons}

This is study material, not a claim of personal/employer AWS deployment experience. Use the [concrete service-slice lesson](../../node-js/aws-service-slice.md) for a locally linted topology/IAM/IaC and workload-cost example; cloud execution remains learner practice.

**Amazon Web Services (AWS)** is a leading **cloud computing platform** providing a wide range of services including **compute, storage, databases, networking, machine learning, and more**. While it’s extremely popular, there are trade-offs to consider.

---

## Pros of AWS {#_1%EF%B8%8F%E2%83%A3-pros-of-aws}

### 1.1 Scalability & Flexibility
- Scale capacity subject to startup time, configured policies, quotas and available resources; response is not instantaneous.
- Supports **auto-scaling** for applications.
- Variety of compute options: **EC2, Lambda (serverless), ECS, EKS**.

### 1.2 Global Infrastructure
- Data centers in **multiple regions and availability zones (AZs)**.
- Reduces latency by **serving users from nearby regions**.
- Availability/fault tolerance depend on the selected service, explicit multi-AZ design and tested recovery.

### 1.3 Broad Service Offering
- Compute: EC2, Lambda, Fargate  
- Storage: S3, EBS, Glacier  
- Databases: RDS, DynamoDB, Redshift  
- Networking: VPC, CloudFront, API Gateway  
- Security: IAM, KMS, WAF, Shield  
- DevOps: CodePipeline, CodeBuild, CloudWatch

### 1.4 Pay-as-You-Go
- Only pay for the **resources you use**.
- Supports **reserved instances** for predictable workloads to save costs.
- Reduces **upfront infrastructure investment**.

### 1.5 Security & Compliance
- Provides **strong security controls**: IAM, encryption at rest/in-transit, audit logging.
- Provides compliance attestations/programs for defined service scopes; customer application/configuration/data obligations remain under the shared-responsibility model.

### 1.6 High Reliability
- Some services provide multi-AZ behavior; other workloads require explicit multi-AZ provisioning.
- Storage durability targets vary by service/class and differ from availability or protection from bad writes/deletion.

---

## Cons of AWS {#_2%EF%B8%8F%E2%83%A3-cons-of-aws}

### 2.1 Cost Complexity
- Pay-as-you-go can be **hard to estimate**.
- Overprovisioning or leaving resources running can lead to **unexpected high bills**.
- Requires **cost monitoring and optimization**.

### 2.2 Learning Curve
- AWS has a broad and changing service catalog; focus on the workload's compute/storage/network/IAM needs rather than memorize a count.
- Requires understanding **IAM, networking, storage types, service limits**.
- Configuration mistakes can lead to **security or availability issues**.

### 2.3 Vendor Lock-in
- AWS-specific services and APIs may make it **hard to migrate** to another cloud provider.
- Using managed services like DynamoDB or Lambda can tie you heavily to AWS.

### 2.4 Complexity for Small Projects
- For small apps or startups, AWS can be **overkill**.
- Requires **architecture planning** even for simple deployments.

### 2.5 Service Limits & Quotas
- Some services have **soft limits** (API calls, EC2 instances).
- You may need to **request quota increases** for scaling.

---

## Example Use Cases {#_3%EF%B8%8F%E2%83%A3-example-use-cases}

| Use Case                        | AWS Service                     | Reason for Choosing                           |
|---------------------------------|---------------------------------|-----------------------------------------------|
| Web Application Hosting         | EC2 + RDS + S3                 | Scalable, durable storage, managed DB        |
| Static Website                   | S3 + CloudFront                 | Cheap, fast, global distribution             |
| Serverless API                   | Lambda + API Gateway            | No server management, auto-scaling           |
| Data Analytics                   | Redshift + Athena + S3          | Scalable queries on big datasets             |
| Machine Learning                 | SageMaker                       | Managed ML workflows                          |

---

### Summary {#%E2%9C%85-summary}

 **Pros:**
- Scalable, reliable, globally available  
- Broad range of services  
- Pay-as-you-go, strong security & compliance  

 **Cons:**
- Cost can grow unexpectedly  
- Steep learning curve  
- Vendor lock-in, service limits  

> Senior Tip:
> Always **monitor costs** and use **Infrastructure as Code (IaC)** like **Terraform** or **CloudFormation** to manage AWS resources safely and reproducibly.

## Concrete learning checkpoint

The [AWS service slice](../../node-js/aws-service-slice.md) selects private Fargate→PostgreSQL with distinct deployment/execution/application identities, one tenant S3 read prefix, digest-pinned images and explicitly owned network/secret prerequisites. Its CloudFormation schema/negative checks and hypothetical cost arithmetic have run locally. Effective account IAM, real deployment, region-specific quote, alerts and teardown have not. Complete the linked acceptance exercise and retain actual outcomes before describing personal implementation experience. CloudFormation is the chosen IaC example; Kubernetes administration is optional beyond awareness at this target depth.
