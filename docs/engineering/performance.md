# Performance: measure a user journey

**Prerequisites:** Working browser path, async ownership and basic network/resource concepts. Review baseline: 2026-10-27. All learner practice remains outstanding.

## Declare the experiment

[Investigation ledger](../senior_growth/Web_Performance/How_would_you_start_the_investigation%2C_what_are_your_steps_after_the_customer%27s_feedback_is_that_the_application_is_really_slow.md) → [Metrics and tools](../senior_growth/Web_Performance/Which_tools_and_metrics_would_you_use_to_profile_and_measure_performance.md). Fix artifact, route/data/device/input, cache and network conditions; retain distributions and raw traces. Lab throttling is not a physical-device equivalence proof.

## Find the causal dependency

[URL-to-pixels](../senior_growth/Web_Performance/Can_you_describe_the_process_from_time_you_type_appliaction_url%2C_to_it_finished_state_on_your_screen.md) → [Critical path](../senior_growth/Web_Performance/What_is_the_critical_rendering_path%2C_how_to_measure_and_optimize.md) → [Request topology](../senior_growth/Web_Performance/What_if_we_are_facing_performance_issues_because_we_have_lots_of_requests.md). Overlapping spans cannot simply be summed. Fewer requests and smaller bundles are intermediate signals, not user outcomes.

## Change the right cost

[Read/write layout](../senior_growth/Web_Performance/What_is_reflow_and_repaint%2C_what_causes_those_events%2C_why_is_it_important_to_have_them_in_mind.md); [Debounce/throttle](../senior_growth/Web_Performance/Can_you_describe_an_idea_of_debouncing%2C_throttling_When_we_need_them%2C_what_is_the_difference.md); [Retention owners](../senior_growth/Web_Performance/What_is_the_memory_leak._Any_real_world_example_How_would_you_find_memory_leaks.md). Cancel/ignore obsolete results, bound caches/work and inspect roots. Memoization cannot repair an identity or resource-lifetime defect.

## Interpret delivery and interaction

[Legacy TTI/current interaction guidance](../senior_growth/Web_Performance/What_is_TTFI_%28Time_to_first_interaction%29._How_can_we_improve_TTFI.md); [Production module graph](../senior_growth/Web_Performance/What_are_some_general_practices_and_techniques_to_optimize_in_the_area_Explain_tree_shaking%2C_code_splitting_and_bundling%2C_minimizing%2C_data_caching..md); [SSR trade-offs](../senior_growth/Web_Performance/Can_SSR_improve_first_render.md). Current Core Web Vitals are LCP, INP and CLS; field percentiles and lab diagnostics answer different questions. No improvement is claimed without a comparable measurement.

## Practice and verification

Use [the shared increments](../practice/engineering/) and linked focused requirements. [Workbench](../workbench/engineering/) contains canonical references; [verification](../review/verification.md) distinguishes current checks, preserved historical evidence and unperformed integrations.
