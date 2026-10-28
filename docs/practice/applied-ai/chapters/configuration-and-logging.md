# Python Configuration, Safe Logs and pytest Fixtures — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/configuration-and-logging.md)

## Practice and acceptance

**Acceptance:** strict-check the package and run all learner tests. Show that missing/invalid settings fail before a client is created, boolean false stays false and URL credentials/unknown destinations are rejected without echoing values. Verify no settings/handler configuration happens at import. Test default values, valid explicit443/trailing slash, bounds and an invalid numeric port. Explain why repr=False is not a general redaction tool.

Show that reconfiguration cannot duplicate handlers, close can be called twice, and a new owner can configure after release. Prove an existing unrelated root handler receives no raw application record while the owned sink is active. Test DEBUG filtering at INFO and ensure an invalid count/job ID is not logged. Make a test fail after a yield fixture acquires a handler, and demonstrate cleanup still removes it. Prefer a small separate fixture self-test/subprocess so the normal suite remains green; do not mark a known failing test as passed or weaken its assertion. Review captured JSON bytes for secret/path/body/exception sentinels.

This material and its tests do not establish remote logging delivery, production retention or learner practice completion.
