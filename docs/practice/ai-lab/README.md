# Authored contract seed

Python3.13 with pytest9.0.2: run `python -m pytest check.py` in an isolated copy.
`cases.json` and `corpus.json` are synthetic development data. The trusted fixture
maps user-a/user-b to different tenants; the production principal must come from
authentication. Scenario names describe fault injections the learner must implement.

The check validates a manually authored expected status/citation ledger and rejects
known wrong/missing results. It does not run retrieval, a model, tools, approvals,
semantic grading, streaming or a production permission system. No product-quality,
held-out evaluation or learner completion is inferred from its passing result.
