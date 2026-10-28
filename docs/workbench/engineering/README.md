# Running the engineering references

Copy the engineering collection plus `frontend/react/forms/note-projection.ts` with the same workbench-relative layout. Install the pinned engineering manifest in that isolated copy, then run `npm run typecheck` and `npm run check:reference`. The compiler scope is explicit in tsconfig; Next/bundler/typed-lint consumer fragments are outside that runtime set.

Nested quality/standard and ai-engineering/retry are separate packages with their own build/test scripts. config-tdd uses Node directly. External services, browser behavior and deployment remain separate practice; see the current verification ledger.
