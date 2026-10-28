# Bounded data-screen reference

Canonical component and six behavior checks from [the UI ownership lesson](../../../senior_growth/EngX_Quality/Large_Data_Workflow.md), displayed there through includes. Copy this folder to an isolated directory, install its pinned manifest, then run `npm run typecheck` and `npm test`.

The injected adapter uses deferred synthetic responses in tests. These checks do not implement HTTP authorization, DB cursor/snapshot semantics or a deployed screen. JSDOM focus assertions are not native keyboard/screen-reader observations. Apply [the separate UI architecture practice](../../../practice/frontend/ui-architecture.md) for those integrations.
