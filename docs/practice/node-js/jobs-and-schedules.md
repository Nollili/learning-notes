# Durable jobs and scheduled work — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/jobs-and-schedules.md) · [Node.js practice map](./index.md)

**Practice acceptance:** run independent producer/consumer processes; kill a consumer after effect commit/before ack and retain one effect after restart. Interrupt the relay after confirmed publication/before marking published. Break retry routing and distinguish confirmed queue admission from eventual delivery. Prove malformed/oversize messages never invoke effects. Record failed drain and deadline behavior; demonstrate controlled dead-letter repair/replay with a stable logical ID. Run two scheduler processes, fail a batch, restart and show the same UTC slot completes once. Add a bounded catch-up policy and a real local-calendar DST test before claiming calendar scheduling. These observations remain learner practice.
