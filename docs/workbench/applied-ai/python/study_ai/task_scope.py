# study_ai/task_scope.py
from __future__ import annotations
import re
from dataclasses import dataclass
from .note_tool import NoteStore, StoredNote

@dataclass(frozen=True, slots=True)
class TaskNoteStore:
    underlying: NoteStore
    allowed_sources: frozenset[str]

    def __post_init__(self) -> None:
        if (not isinstance(self.allowed_sources, frozenset) or len(self.allowed_sources)>8
                or any(re.fullmatch(r'[A-Za-z0-9_-]{1,64}',value) is None for value in self.allowed_sources)):
            raise ValueError('Invalid task scope')

    def get(self, source_id: str) -> StoredNote | None:
        # Fixed task capability restricts lookup before reading broader user-accessible storage.
        if source_id not in self.allowed_sources:
            return None
        return self.underlying.get(source_id)
