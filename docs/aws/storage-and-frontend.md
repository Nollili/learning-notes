# S3 and CloudFront: storage and frontend delivery

S3 stores objects. CloudFront delivers cached content through a CDN. Together they can serve a browser application without running a dedicated web server for its static files.

## Choose the right storage model

| Model | How an application sees it | Typical AWS service |
|---|---|---|
| Object | Retrieve or replace a value by key through an API | S3 |
| Block | Disk blocks exposed to an operating system | EBS |
| File | A shared filesystem with paths and filesystem operations | EFS |

An S3 object consists of content, a key and metadata; versioning can add a version ID. `images/product-1.jpg` is an object key whose prefix looks like a directory. In general purpose buckets this is not a normal filesystem directory. A bucket has a Region even though S3 is accessed through a global service brand.

## Versioning, lifecycle and consistency

Versioning preserves object versions; deleting a current object can create a delete marker. Older versions can still occupy storage and incur charges. Lifecycle rules can expire objects or transition them between storage classes. Their effects depend on which versions and prefixes the rules cover.

S3 provides strong read-after-write consistency for object writes, overwrites and deletes. The supplied older S3 slides' claim that overwrites and deletes are eventually consistent is outdated. CloudFront can still serve an older cached representation independently of S3's consistency. [S3 data model and consistency](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html).

Choose storage classes using access frequency, required retrieval latency, resilience scope and total cost. Standard, Intelligent-Tiering, infrequent-access and Glacier classes solve different problems. Retrieval fees, minimum storage duration and monitoring charges can matter as much as the storage price. Use current class documentation rather than an old slide's price or limit.

## Private assets behind a public delivery endpoint

```mermaid
flowchart LR
    Viewer[Viewer] -->|HTTPS| CDN[CloudFront distribution]
    CDN -->|Signed origin request| Bucket[Private S3 bucket]
```

A distribution identifies origins and cache behaviors. A behavior can select an origin by path and control methods, cache policy and viewer protocol handling. For a private S3 origin, use **Origin Access Control (OAC)** and the corresponding bucket policy. OAI appears in older material; AWS recommends OAC for new designs. An S3 **website endpoint** is a custom origin and cannot use OAC. [CloudFront origin access](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html).

S3 website hosting is a separate mechanism from using a private S3 REST origin. The former does not provide HTTPS directly at the website endpoint. Managed hosting such as Amplify is another option when a simpler deployment workflow is preferable. [AWS static hosting overview](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html).

## Cache keys and deployment behavior

A cache key decides which requests may reuse a response. If a response varies by a parameter that the cache ignores, different callers may receive an inappropriate response. If every request has a unique cache key, cache reuse disappears.

A TTL controls how long cached content can remain fresh. Invalidations remove selected cached paths; they are distinct from uploading new objects. Content-hashed assets such as `app.a1b2.js` can have long cache lifetimes, while the HTML entry point needs a strategy that allows it to reference the latest assets.

For an SPA, opening `/products/123` directly needs a deliberate route fallback. Returning `index.html` for every error can hide missing images, broken JavaScript paths and permission errors. Separate navigation fallback from genuine asset and API failures.

## CORS does not grant access

CORS tells browsers which cross-origin responses scripts may read. It does not replace IAM, bucket policy or application authorization. A command-line client is not constrained by browser CORS enforcement. Configure browser origins and headers for the actual application instead of treating `*` as a security fix.

For temporary upload access, see [file imports](./file-imports.md). For SQL and records, see [databases](./databases.md).
