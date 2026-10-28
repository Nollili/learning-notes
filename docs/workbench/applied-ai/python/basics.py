# basics.py
import re

_ID = re.compile(r"[A-Za-z0-9_-]{1,64}")


def clean_tags(raw: object, /) -> tuple[str, ...]:
    if not isinstance(raw, list) or len(raw) > 10:
        raise ValueError("tags must be a list of at most10 strings")
    result: list[str] = []
    seen: set[str] = set()
    for value in raw:
        if not isinstance(value, str):
            raise ValueError("tag must be text")
        tag = value.strip().casefold()
        if not 1 <= len(tag) <= 40:
            raise ValueError("tag length out of range")
        if tag not in seen:
            seen.add(tag)
            result.append(tag)
    return tuple(result)


def normalize_document(raw: object) -> dict[str, object]:
    if not isinstance(raw, dict) or not set(raw) <= {"id", "body", "tags"}:
        raise ValueError("unexpected document shape")
    identity = raw.get("id")
    body = raw.get("body")
    if not isinstance(identity, str) or _ID.fullmatch(identity) is None:
        raise ValueError("invalid document id")
    if not isinstance(body, str) or not 1 <= len(body.strip()) <= 20000:
        raise ValueError("invalid document body")
    return {"id": identity, "body": body.strip(), "tags": clean_tags(raw.get("tags", []))}


def normalize_documents(raw: object, *, max_records: int = 100) -> list[dict[str, object]]:
    if type(max_records) is not int or not 1 <= max_records <= 1000:
        raise ValueError("invalid record budget")
    if not isinstance(raw, list) or len(raw) > max_records:
        raise ValueError("document batch exceeds budget or is not a list")
    result: list[dict[str, object]] = []
    seen: set[str] = set()
    for candidate in raw:
        document = normalize_document(candidate)
        identity = str(document["id"])  # normalize_document already established a string ID.
        if identity in seen:
            raise ValueError("duplicate document id")
        seen.add(identity)
        result.append(document)
    return result


def add_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    # A fresh default per call; existing input is copied rather than mutated.
    result = [] if tags is None else list(tags)
    result.append(tag)
    return result
