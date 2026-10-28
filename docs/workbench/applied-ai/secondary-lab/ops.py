from dataclasses import dataclass
from math import isfinite

@dataclass(frozen=True)
class Release:
    version: str
    dataset: str
    outcomes: dict[str, str]  # Application-owned fixture data: ok / miss / unsafe.
    p95_ms: float
    cost_units: float | None

def eligible(baseline: Release, candidate: Release) -> bool:
    for run in (baseline, candidate):
        if not run.version or not run.dataset or not 1 <= len(run.outcomes) <= 10000:
            raise ValueError('Invalid release identity/count')
        if any(value not in {'ok', 'miss', 'unsafe'} for value in run.outcomes.values()):
            raise ValueError('Invalid outcome')
        if type(run.p95_ms) not in (int, float) or not isfinite(run.p95_ms) or run.p95_ms < 0:
            raise ValueError('Invalid latency')
        if run.cost_units is not None and (type(run.cost_units) not in (int, float) or not isfinite(run.cost_units) or run.cost_units < 0):
            raise ValueError('Invalid cost')
    if baseline.dataset != candidate.dataset or baseline.outcomes.keys() != candidate.outcomes.keys():
        raise ValueError('Incomparable evaluations')
    return ('unsafe' not in candidate.outcomes.values()
            and sum(v == 'ok' for v in candidate.outcomes.values()) >= sum(v == 'ok' for v in baseline.outcomes.values())
            and candidate.p95_ms <= 1500 and candidate.cost_units is not None and candidate.cost_units <= 10)
