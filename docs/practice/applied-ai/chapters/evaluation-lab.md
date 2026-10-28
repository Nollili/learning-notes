# A Versioned Evaluation Lab for the Document Assistant — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/evaluation-lab.md)

## Practice and acceptance

Strict-typecheck and test the loader against the exact manifest: all six slices, unique IDs, stable exact-byte digest, wrong version, unknown/extra fields, missing slice, malformed/coerced labels, blank questions, answer-without-text, nonanswer-with-text, invalid Unicode and byte cap. These are dataset-format checks only. Review labels/source ledger with another reader and expand distribution/splits before using it to choose a model.

Wire the source fixture adapters through the real tool/provenance/answer gates. For ordinary/injected/Unicode cases require the supported intended answer with valid citation; missing evidence abstains, foreign access stays denied without hidden content and store failure remains operational. Add at least one deliberate validator/ACL/budget mutation and show the corresponding test fails. Record result categories even when a provider call never happens. A local synthetic output fixture cannot prove that a model handles the attack or language correctly.

**Material acceptance for25.01–25.05:** clear task success and failure categories, a versioned bounded manifest and source/label ledger, representative-set limitations, edge/adversarial outcome criteria and executable deterministic validation. Real representative collection/label review, split leakage analysis, live model runs and independent learner implementation remain required. Later sections expand semantic/rubric/regression/cost analysis; do not treat this six-case fixture as final evaluation coverage.


**Acceptance:** strict-typecheck and test exact recall/MRR/nDCG calculation, ideal/poor ordering, one/many/no hits, empty ranking, no-relevant labels, duplicate IDs, invalid/bool k/grades, ID bounds and graded ties. Rerun actual evidence/pipeline tests for stale/foreign/unknown/duplicate/misquoted citations, malformed outputs, correct abstention and a mechanically valid contradiction. Retain a claim-level support/correctness rubric with examples of partial support, omitted negation and outdated source. Then measure a labeled real retrieval set and answer outputs; synthetic metric arithmetic cannot establish system quality. Learner corpus judgments, semantic/human evaluation and live retrieval/provider comparison remain required.

**Acceptance:** test compare_judge exact counts, all-accept/all-reject, missing/extra IDs, non-bool labels and empty bounds; test repeated-success all/none/mixed outcomes and invalid data. Review the worked two-part cancellation task with the0–2 anchors and adjudicate one disagreement using source evidence. Rerun actual tool/approval/graph state cases for argument/authorization/receipt correctness. Before a real judge gates releases, retain held-out human comparisons and position/length/language/injection bias checks; simulated arithmetic does not establish judge quality. Independent ratings, live repeated provider runs, calibrated semantic judge and learner evaluation practice remain required.
