# Deploy, restore and roll back a small complete stack — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/full-stack-deployment.md) · [Node.js practice map](./index.md)

**Practice acceptance:** deploy the authenticated frontend/API/database to an authorized environment, keep a real TLS/domain and release receipt, exercise two users and forbidden cross-tenant IDs, break the candidate and restore the exact previous compatible artifacts. Restore a recent backup to an isolated target and verify through the app. Retain actual recovery times, data-loss window, redacted logs and costs. The local fixture and this runbook complete study material; they do not establish that you have performed these operations.

**Introductory operator exercise:** in a disposable authorized cluster, review `kubectl diff`, server-side dry-run, then apply the adapted manifest; inspect Deployment/Pods/Service endpoints, events and logs. Observe image-pull failure, readiness failure and rollout status with a bounded timeout; restore the retained prior digest. `rollout undo` changes Deployment history, not schema or external state, and history may be pruned. Never print secret values while diagnosing. Base64 in a Secret manifest is encoding, not encryption; use RBAC, encryption at rest and a secret-manager integration. NetworkPolicy enforcement depends on the installed network provider; its presence alone proves nothing.

**Acceptance:** explain resource/controller/traffic ownership, verify selector matching and API contract, show readiness versus restart behavior and a failed rollout/recovery. Advanced cluster administration, operators and high-availability databases are explicitly optional/deferred; no cluster deployment is claimed from the static manifest.
