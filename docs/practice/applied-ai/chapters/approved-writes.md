# Approved Writes, Idempotency and Interrupted Recovery — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/approved-writes.md)

## Practice and acceptance

Create a temporary SQLite file; seed one authorized note/approval through fixture code. Execute, close/reopen and replay: require the same receipt and exactly one version increment. Change title/version under the same operation ID and require rejection. Test missing/expired approval, stale version, foreign tenant/subject, revoked note/approval, malformed IDs/Unicode/bounds and storage lock failure. Inject a failure between note update and receipt update and verify both roll back; replay after a simulated lost response must not repeat the write. Test two competing connections/operations against the same expected version; only a compatible single mutation may commit.

Then implement the trusted user-confirmation route/UI in a separate practice app. Verify it shows exact command values, defends its authenticated mutation route, binds approval expiry/principal/digest and cannot be invoked through the model tool allowlist. A forged model “approved:true” field must have no authority. Retain evidence for denied/revoked/replayed/interrupted cases and safe recoverable UX. The local executor/material can be checked independently; real human approval, server/UI integration, concurrent worker deployment, external-effect idempotency and learner practice remain required.
