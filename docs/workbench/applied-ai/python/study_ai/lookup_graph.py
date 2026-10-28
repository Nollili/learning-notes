# study_ai/lookup_graph.py
from __future__ import annotations

import hashlib
import json
import re
from typing import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph

from .note_tool import NoteStore, dispatch_note_tool
from .vector_search import Principal


class LookupState(TypedDict):
    arguments: str
    result: str


class LookupGraph:
    # One authenticated principal and serialized caller per owner; never a global shared user capture.
    def __init__(self, principal: Principal, store: NoteStore) -> None:
        self._principal = principal
        self._runs: dict[str, int] = {}
        self._memory = InMemorySaver()

        def lookup(state: LookupState) -> dict[str, str]:
            return {"result": dispatch_note_tool("lookup_note", state["arguments"],
                                                principal=principal, store=store)}

        builder = StateGraph(LookupState)
        builder.add_node("lookup", lookup)
        builder.add_edge(START, "lookup")
        builder.add_edge("lookup", END)
        self._graph = builder.compile(checkpointer=self._memory)

    def _key(self, job_id: str) -> str:
        if re.fullmatch(r"[A-Za-z0-9_-]{1,64}", job_id) is None:
            raise ValueError("Invalid job ID")
        scope = json.dumps([self._principal.tenant, self._principal.subject, job_id],
                           ensure_ascii=False, separators=(",", ":"))
        return hashlib.sha256(scope.encode("utf-8")).hexdigest()

    def run(self, job_id: str, arguments: str) -> str:
        key = self._key(job_id)
        if (key not in self._runs and len(self._runs) >= 20) or self._runs.get(key, 0) >= 4:
            raise ValueError("Graph fixture budget exhausted")
        # Validate bounds before checkpointing arbitrary input; dispatcher checks JSON/schema.
        if len(arguments) > 2048 or len(arguments.encode("utf-8", errors="strict")) > 2048:
            raise ValueError("Argument limit")
        self._runs[key] = self._runs.get(key, 0) + 1
        output = self._graph.invoke({"arguments": arguments, "result": ""},
                    {"configurable": {"thread_id": key}, "recursion_limit": 5})
        return str(output["result"])

    def snapshot(self, job_id: str) -> dict[str, object]:
        state = self._graph.get_state({"configurable": {"thread_id": self._key(job_id)}})
        return dict(state.values)

    def forget(self, job_id: str) -> None:
        key = self._key(job_id)
        self._memory.delete_thread(key)
        self._runs.pop(key, None)
