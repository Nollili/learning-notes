# A06 — CloudFormation and CDK infrastructure

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [infrastructure as code](../../aws/infrastructure-as-code.md).

[Original supplied text](/aws-homework/sources/associate-06.txt). All original optional tasks and bonus challenges below are **required** here; apply [source corrections](./source-notes.md).

Please read carefully instructions and complete all required tasks to finish the module.

## What’s given

Your AWS account.

The Node.js AMI from the EC2 module

S3 bucket for your static website and its CloudFront distribution from the CloudFront module

## What to save money on

Remove created CloudFormation stacks while not working on any practical tasks (a CF template should allow you to quickly re-create them in one shot as needed).

### Task 1. Create S3 bucket

Create a CloudFormation template in JSON or YAML (preferable) format. The template should accept a BucketName parameter. It should create a S3 bucket resource with a BucketName property, that will reference the input parameter accordingly. Bucket should be not publicly accessible. Bucket versioning should be enabled. Template should also have the Outputs section with the S3Bucket field referencing the bucket itself.

Create a stack and check created resources. Investigate stack's CloudFormation console sections and available actions over the stack.

Update your template to enable the Static website hosting on your bucket. Update bucket to be publicly accessible. Then create a bucket policy allowing public read of any bucket objects Add an output with bucket's website URL. Update your stack by creating and executing a change set.

Upload a simple static website to your bucket and check the website URL from the Outputs section. Investigate CloudFormation’s built-in intrinsic and condition functions, and their application in templates.

### Task 2. Create an EC2 instance

## Pre-requisite

In this task you should have a custom AMI with Node.js installed from EC2 module. If you removed the AMI, create one similarly you did it previously.

Create another CloudFormation template in your preferred format. As input parameters it should accept the following strings:

AmiId - AWS::EC2::Image::Id - the ID of your custom AMI with Node.js installed

VpcId - AWS::EC2::VPC::Id - the ID of your default VPC (Services > VPC > Your VPCs > DefaultVPC)

KeyPairName - AWS::EC2::KeyPair::KeyName - a name of your KeyPair you will use to connect to the instance or deploy the app

InstanceType - String - an instance type you'd like to create. Allowed values: t1.micro | t2.micro | t2.nano | t2.small | t3.large | t3.medium | t3.micro. Default value: t2.micro. It should create the following resources:

A Security Group which will get reference to your VpcId and allow inbound traffic on 80, 443 and 22 ports from anywhere.

An EC2 instance based on your AmiId, KeyPair, and InstanceType. The creation of EC2 instance should wait until the Security group is created. Use the SecurityGroupIds property of EC2 instance to reference to the Security Group's ID. Add outputs for instance's public IP and public DNS address

Create a new stack based on your template with all necessary input parameters. Check created resources. In the CloudFormation console investigate how you can modify your template and stack using the CloudFormation designer. Investigate AWS CLI operations over CloudFormation. Then Delete your stack with AWS CLI. After that try to create a new stack using the AWS CLI and your template.

Deploy the API back-end to the instance using this script. Check if it accepts incoming requests on 80 port via instances public IP or DNS address.

### Task 3. Create a CloudFront distribution

Update your template from the first task:

add/create an Origin Access Identity (OAI) resource

update bucket's policy to allow read (s3:GetObject, s3:ListBucket) actions to the bucket's objects only from the OAI

add/create a CloudFront distribution resource with S3 origin. It should depend on your S3 bucket.

Add outputs that will return an ID of the distributions and a domain name of distribution.

Update your stack by creating a Change Set and executing it. Troubleshoot the issues if necessary. Note, in some cases you'll need to delete a stack and create a new one to proceed. Check if your website is available through the CloudFront URL from Outputs.

### Task 4. Create ALB CloudFront origin and behavior

Using this CloudFormation template as a reference, update your template, and add to your Cloudfront distribution a custom origin and cache behavior which will direct request on api/* path to the load balancer that must be created accordingly.

Create a changes set for your stack and execute it to apply the changes.

Deploy the front-end app using this script. Check if the app works without any issues.

Required extension (originally optional): refactor your CloudFormation stack by splitting it into two templates and using a nested stack.

## Reference templates

HERE you can find templates for reference and self-check.

### Task 5. CDK stuff for S3 bucket + CF distribution

Install the AWS Cloud Development Kit (CDK) on your machine.

Initiate a new CDK project and try to implement simple infrastructure from task 1 or 2.

Deploy your CDK stack and check the created resources.

After you've done, delete your stack.

### Task 6. Document/visualise the infrastructure from the module

Using Draw.io or AWS CloudFormation Designer visualise the infrastructure of your stack after the task 4.

All supplied tasks and extensions in this section are required locally; the original course allowed some of them to be skipped.

## Required guide connection

**Repeating A04/A05 through CloudFormation; repeating P02 through a different IaC interface.** Complete the nested-stack refactor, CDK implementation and architecture visualization originally marked optional. Use a private bucket REST origin for OAC/OAI and restrict SSH to your IP; document the departure from the older public-SSH example.


## Completion evidence

- [ ] Record observed results for every section, including all promoted extensions.
- [ ] Retain configuration/code, successful and denied/failing cases where specified, and actual cleanup state.
- [ ] Link earlier evidence for repeating work and add the new interface/behavior comparison.

Use the [shared evidence rules](./index.md#evidence-for-every-required-module); never claim screenshots or sample code complete independent work.
