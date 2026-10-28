# Typed Modules and Explicit Errors

Continue the same [locked Python learner project](./setup-and-basics.md). Keep its tested basics.py normalizer; this lesson adds a typed application boundary around it. The baseline is Python3.13.11, pytest9.1.1 and mypy2.4.0. Static checking, runtime validation and execution tests answer different questions and all remain useful.

## Modules and package entry points

A module is an importable Python file. A regular package is a directory with __init__.py. Imports execute module-level statements and normally cache that module in the interpreter; reload and separate processes can execute it again. Keep network calls, environment-dependent startup, file writes and application execution out of ordinary imports.

```text
python-notes-lab/
  basics.py                    # Previous lesson, preserved.
  study_ai/
    __init__.py                # Empty: importing the package starts no application.
    domain.py
    service.py
    cli.py
    __main__.py
  lab_tests/
    test_basics.py
    test_typed_boundary.py
```

Use module execution from the project root: `uv run --locked python -m study_ai`. This resolves package imports correctly and deliberately runs study_ai.__main__. Directly executing a nested file as a path can give it a different import context. Avoid sys.path hacks and circular imports; domain definitions should not import transport/startup adapters that depend on them. This is a flat learner layout, not yet a distributable installed package; packaging/deployment gets a separate lesson.

Add and lock the type checker once, then use locked commands:

```bash
uv add --dev 'mypy==2.4.0'
uv run --locked python -m mypy --strict basics.py study_ai
uv run --locked python -m pytest
uv run --locked python -m study_ai
```

## Type information versus runtime facts

`object` means any runtime value whose operations must first be narrowed. `Any` disables useful checking where it spreads. Prefer object at untrusted input boundaries, validate/narrow, then create a domain type. An annotation, TypedDict, NewType constructor or cast is not a parser.

Use list[str] for mutable collections, tuple[str,...] for immutable sequences of strings, str|None for explicit absence and collections.abc.Sequence/Mapping for read-only interfaces when callers need not expose mutation. These interfaces do not deeply freeze referenced values. A type alias supplies another name for the same type; NewType lets the checker distinguish nominal IDs, but its runtime value is still the underlying object.

A dataclass generates record conveniences. frozen=True prevents ordinary field reassignment; it is not a security boundary or a recursive freezer. Here all fields are strings or tuples of strings, so callers do not retain an inner mutable list. A Protocol states required operations structurally; an adapter need not inherit from it. Runtime protocol checks, where enabled, do not prove method parameter/return types or authorization.

<<< ../workbench/applied-ai/python/study_ai/domain.py


DocumentPayload documents the producer's intended JSON-like shape; passing a dict to an annotated parameter does not verify its fields. parse_document performs actual validation through the existing normalizer, then checks its representation before constructing Document. The redundant tag type filter is a checker-visible narrowing after the preceding all-strings invariant check; it does not silently drop an invalid tag.

NewType prevents a plain str from being accepted where a DocumentId is required by the checker. It does not prevent DocumentId("../invalid") at runtime; only the validated construction path establishes the domain ID contract. Keep that distinction explicit. A later Pydantic boundary can replace repetitive validation while preserving the application-facing domain interface.

## Inject an adapter and keep failures distinct

<<< ../workbench/applied-ai/python/study_ai/service.py


The use case has no knowledge of HTTP, a database client or a model SDK. The adapter supplies persistence behavior. This memory adapter has a finite capacity, no await gap in save and no durable multi-process uniqueness guarantee. A database implementation must enforce uniqueness atomically; copying this dictionary into each replica would not do that. Capacity exhaustion is an internal teaching-adapter failure, not malformed customer input.

Only catch failures when the current layer can translate/recover meaningfully. InvalidDocument and DuplicateDocument are expected categories. StoreUnavailable is operational: a service might return503, retry under a bounded idempotent policy or mark an operation pending, but it must not claim input validation failed. Unexpected programming errors propagate to the process/API boundary for safe reporting and a failing outcome. Do not catch Exception and return None, which would collapse failure into “document absent.”

Use `raise NewError(...) from original` to preserve a meaningful safe cause when translating infrastructure failures internally. Use `from None` only when deliberately suppressing irrelevant/sensitive context in a known public-facing input error. Raw chained messages can contain SQL, content or secrets; public responses and ordinary logs need an explicit safe projection. A bare raise inside except preserves the current exception. A finally block is for cleanup; returning from finally can replace a successful result or hide an exception, so avoid that pattern. Context-manager cleanup receives a deeper resource lesson.

## Deliberate process boundary

<<< ../workbench/applied-ai/python/study_ai/cli.py


<<< ../workbench/applied-ai/python/study_ai/__main__.py


Importing study_ai.cli defines main without executing it. The __main__ module is an explicit execution entry point and is expected to run the application. main returns an exit status instead of calling sys.exit deep inside a library. The demo prints a selected ID/tag projection, not raw content or credentials; a real CLI needs its own validated input and output policy. Unexpected failures still produce a nonzero process outcome rather than a misleading success.

## Runtime tests and negative static examples

<<< ../workbench/applied-ai/python/lab_tests/test_typed_boundary.py


For an independent static-check exercise, put the following in a separate negative_types.py fixture outside the production package. It must fail mypy; do not silence it with Any/cast or include it in the successful package check.

```python
# negative_types.py — intentionally rejected by static checking
from study_ai.domain import Document, DocumentId, DocumentRepository

bad_document = Document(id="plain-string", body="text", tags=["mutable"])


class WrongRepository:
    def save(self, document: str) -> None:
        pass


bad_repository: DocumentRepository = WrongRepository()
```

Expected failures include incompatible plain-string ID, list-versus-tuple tags and the adapter method signature. Running the program without a checker can still construct bad_document, demonstrating why annotations alone are not runtime validation. Production code should use parse_document on untrusted input. Literal/union narrowing, generics and typed external-library schemas can build on these same principles; do not add type sophistication that hides the boundary.

## Practice and acceptance

[Separate exercises and acceptance criteria](../practice/applied-ai/chapters/typed-modules-and-errors.md).

References checked2026-10-21: [Python3.13 modules](https://docs.python.org/3.13/tutorial/modules.html), [__main__](https://docs.python.org/3.13/library/__main__.html), [typing runtime limits/NewType/TypedDict/Protocol](https://docs.python.org/3.13/library/typing.html), [dataclasses](https://docs.python.org/3.13/library/dataclasses.html), [exception handling/chaining](https://docs.python.org/3.13/tutorial/errors.html), [mypy protocols](https://mypy.readthedocs.io/en/stable/protocols.html).
