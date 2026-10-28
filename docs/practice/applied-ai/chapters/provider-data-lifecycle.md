# Data Minimization, Retention and Provider Boundaries — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/provider-data-lifecycle.md)

**Practice acceptance:** create an approved-data fixture and identify every derivative in the table. Verify minimal outbound serialization and current permission/export-policy expiry, including rejected restricted classes and oversized content. Inspect a controlled SDK request for accidental ACL/identity/metadata leakage. Implement a deletion ledger with injected local/remote failure and a restored-backup/tombstone drill; no stage may claim completion from a timeout. Verify an actual approved provider/account/feature policy through its authorized owner before sending real data, recording evidence/limitations without secrets. Keep rejected data local and show a useful fixed recovery message. Learner provider configuration, deletion integration and restore exercise remain required.
