# study_ai/cli.py
import json
import sys

from .domain import DuplicateDocument, InvalidDocument
from .service import InMemoryDocuments, prepare_and_save


def main() -> int:
    repository = InMemoryDocuments()
    try:
        document = prepare_and_save(
            {"id": "demo-1", "body": "Example content", "tags": [" AI "]}, repository
        )
    except (InvalidDocument, DuplicateDocument):
        print("Document rejected", file=sys.stderr)
        return 2
    print(json.dumps({"id": document.id, "tags": document.tags}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
