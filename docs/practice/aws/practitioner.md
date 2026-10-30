# Practitioner homework: one integrated AWS application

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

Use the course-created template fork and implement P01–P08 in order. Preserve each module's exact contract; do not substitute a generic tutorial implementation. Module pages retain the supplied assignment text, with formatting and explicit source corrections.

| Module | Required result | Promoted work / repetition |
|---|---|---|
| [P01](./practitioner-01.md) | Account, MFA, CLI, alerts and template orientation | Repeating in A01 |
| [P02](./practitioner-02.md) | Private S3 + OAC CloudFront + automatic invalidation | Repeating in A04–A06 |
| [P03](./practitioner-03.md) | Mock product list and by-id REST API | Repeating in A10 |
| [P04](./practitioner-04.md) | Products/stock persistence, seeding and creation | **Required extension:** atomic DynamoDB transaction; repeating in A08 |
| [P05](./practitioner-05.md) | Presigned upload, streamed CSV parsing and file move | Repeating in A04/A10 |
| [P06](./practitioner-06.md) | Import queue, partial failures, persistence and filtered SNS | **Required extension:** DLQ alarm; repeating in A09 |
| [P07](./practitioner-07.md) | Salted credentials and custom import authorizer | **Required extension:** Cognito exercise and its specified removal |
| [P08](./practitioner-08.md) | Transactional PostgreSQL orders and SQL totals | **Required extensions:** status transitions and user order listing; repeating in A08 |

Do not replace the required source API contracts with extra fields from extensions. When an extension changes response shapes, keep its boundary explicit and verify the original evaluated endpoints against the original tests. Optional new robustness tasks are listed separately in [X01–X12](./optional-extensions.md).
