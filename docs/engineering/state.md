# State ownership and Redux

**Prerequisites:** JavaScript snapshots, React effects and validated data. Review baseline: 2026-10-27. All learner practice remains outstanding.

## Choose owners first

[Local/shared/server-cache decisions](../senior_growth/State_management_and_Redux/When_should_we_use-not_use_centralized_stores.md) → [Toolkit selection](../senior_growth/State_management_and_Redux/Is_still_valid_to_use_Redux_in_a_new_project_nowadays.md). URL intent, dirty draft, accepted server data and preferences have different owners; Redux is not mandatory.

## Publish coherent snapshots

[Store/reducer/selector contracts](../senior_growth/State_management_and_Redux/How_does_Redux_work.md) → [Normalized relationships](../senior_growth/State_management_and_Redux/How_would_you_introduce_centralized_store_management_%28f.e._REDUX%29_on_a_project_which_does_not_use_it.md). Keep unchanged references, reject dangling replacement snapshots before publication, and use a store factory for request/account isolation.

## Own async work

[Middleware and bounded HTTP](../senior_growth/State_management_and_Redux/What_are_middlewares%2C_how_to_handle_asynchronous_actions.md) → [Request-ID race handling](../senior_growth/State_management_and_Redux/How_would_you_debug_an_application_using_Redux.md). A thunk return value, abort request and current request ID are separate contracts. Observe unwrap/rejection; do not automatically retry writes.

## Context and alternatives

[Context/theme/locale](../senior_growth/State_management_and_Redux/Have_you_heard_about_Context_in_React.md) and [Alternative stores](../senior_growth/State_management_and_Redux/Do_you_know_other_solutions_for_state_management.md). Context provides a scoped value; the provider owns updates. Flux and archived-tool comparisons are optional historical awareness, not another required stack.

## Practice and verification

Use [the shared increments](../practice/engineering/) and linked focused requirements. [Workbench](../workbench/engineering/) contains canonical references; [verification](../review/verification.md) distinguishes current checks, preserved historical evidence and unperformed integrations.
