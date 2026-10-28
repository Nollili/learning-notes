# Typed Modules and Explicit Errors — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/typed-modules-and-errors.md)

## Practice and acceptance

**Acceptance:** strict-check basics.py and the complete package successfully, run both lessons' tests and execute python -m study_ai with exit0 and the selected JSON projection. Confirm importing study_ai/domain/service/cli produces no output or external side effect; do not import __main__ as if it were an inert library. Run the separate negative fixture and retain the expected checker errors. Explain why changing annotations does not reject a malformed runtime dict.

Add a second repository adapter that records saves in a test-owned object and satisfies the Protocol without inheritance. Test known duplicate, operational rejection and an unexpected RuntimeError separately; none may silently become an absent document. Verify a rejected save does not yield a successful use-case result. Explain the immutability limits of frozen dataclasses and the runtime limits of NewType/TypedDict/Protocol. Keep transport error mapping and safe diagnostics separate from domain behavior. Learner implementation and explanations remain required.
