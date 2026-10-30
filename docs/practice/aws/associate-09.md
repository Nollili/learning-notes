# A09 — SQS orders, DynamoDB streams and SNS

**Learner status: not started. All supplied tasks on this page are mandatory in this learning path**, including items originally labelled optional or bonus. Repeating tasks still require the stated action or comparison; reuse earlier resources and code where suitable, and record the new evidence. Source optional labels describe the original course only.

**Read first:** [messaging](../../aws/messaging.md).

Use the client/backend `feat/sns-sqs-lab` branches and supplied handler samples. This lab repeats P06's queue/notification concepts but adds a DynamoDB-stream transition.

## A09.1 — Queue-to-notification path — repeating P06

- [ ] Create Standard `OrdersQueue`, SNS `OrderPlaced` and confirmed email subscriptions plus a permitted phone-number subscription. Send sample notifications and verify delivery using only destinations you control.
- [ ] Create `OrderNotifier` with queue consumption and SNS publishing permissions; configure the actual topic ARN.
- [ ] Connect SQS with batch size 10/window 5 seconds, or document the source-permitted chosen values.
- [ ] Run both apps locally, configure `sqs.ordersQueueUrl` and the intended profile, place an order from the cart and verify notification delivery.

## A09.2 — Persist before notification

- [ ] Remove the original notifier's SQS trigger; create DynamoDB `Orders`.
- [ ] Create `OrderWriter` with queue and table permissions and an SQS mapping. Submit an order and inspect persisted items.
- [ ] Enable the table's `NEW_IMAGE` stream, attach `OrderNotifier` with batch size 5, adapt it to stream records and grant stream-reading permissions.
- [ ] Place another order and verify notification follows database persistence. Avoid leaving competing SQS consumers from the prior topology active unintentionally.

## A09.3 — Dead-letter path — repeating P06 with controlled failure

- [ ] Create `OrdersDLQ`, connect it through `OrdersQueue`'s redrive policy and demonstrate the source's maximum-receive value of 1 as a deliberately sensitive lab setting.
- [ ] Create `UnprocessedOrderNotifier`, configure its topic and queue permissions and attach the DLQ mapping.
- [ ] Deliberately produce an isolated processing failure to demonstrate DLQ delivery, and compare with a successfully processed order. A normal successful order need not enter the DLQ; do not rely on random retries to demonstrate it.
- [ ] Raise the threshold and explain retry tolerance. Clean the synthetic failure and record any side effects before replay/removal.

## A09.4 — Deploy and filter — promoted from optional; repeating P06

- [ ] Deploy the apps and verify the complete cloud-hosted order flow.
- [ ] Add message attributes such as high/low price classifications; configure email/SMS subscription filtering and demonstrate matching and non-matching messages.
- [ ] Remove unused queues, topics, subscriptions, functions, tables and instances after evidence collection. Check notification and SMS costs for the actual destination/service configuration.


## Completion evidence

- [ ] Record observed results for every section, including all promoted extensions.
- [ ] Retain configuration/code, successful and denied/failing cases where specified, and actual cleanup state.
- [ ] Link earlier evidence for repeating work and add the new interface/behavior comparison.

Use the [shared evidence rules](./index.md#evidence-for-every-required-module); never claim screenshots or sample code complete independent work.
