# Testing, review and maintainable design

**Prerequisites:** A stated input/output contract and an owned small project. Review baseline: 2026-10-27. All learner practice remains outstanding.

## Observe a real defect

[Red/green/refactor fixture](../senior_growth/Testing/TDD_-_pros_and_cons%28red%2C_green%2C_refactor%29.md) → [Fixture and cleanup discipline](../senior_growth/Testing/FIRST_principles_-_how_a_good_unit_test_looks_like.md) → [Coverage counterexample](../senior_growth/Testing/What_is_code_coverage%2C_how_do_you_measure_it%2C_what_kinds_do_you_know_What_do_you_think_is_the_ideal_amount.md). Red must fail for the intended behavioral reason, not a missing tool. Coverage counts execution; a weak assertion can cover a defect.

## Choose evidence by boundary

[Serialization versus pixels](../senior_growth/Testing/What_is_snapshot_testing_When_should_we_avoid_using_it.md); [frontend behavior checks](../frontend/verification.md); [real Node/database tests](../node-js/module-04-testing.md). Mocked adapters cannot establish SQL isolation or native focus/announcement behavior.

## Enforce a focused policy

[Minimal executable standard](../senior_growth/Clean_code_and_Code_Quality/What_is_code_standard_What_code_standard_is_on_your_current_project_Should_we_always_work_by_code_standard_Have_you_used_linters_and_do_you_have_any_experience_in_configuring_them.md) → [Gate limits](../senior_growth/Clean_code_and_Code_Quality/What_does_quality_gate_mean_for_you_%E2%80%93_an_ideal_set_up_of_quality_gates.md) → [Contract-based review](../senior_growth/Clean_code_and_Code_Quality/Why_code_review_is_important_and_how_does_it_work_on_your_project%2C_what_is_your_own_work_flow_for_it.md). Required compiler/lint/test/build checks need independent failure evidence; hooks are bypassable and scanners are incomplete.

## Use a pattern only for a real variation

[Behavioral substitution](../senior_growth/Coding_principles_patterns_conventions/Can_you_decipher_SOLID_acronym_What_is_%22L%22.md) → [Injected strategy](../senior_growth/Coding_principles_patterns_conventions/Please_describe_Strategy_design_pattern._What_are_the_valid_use_cases_for_it.md) → [Owned notifications/history](../senior_growth/Coding_principles_patterns_conventions/What_design_patterns_do_you_use_on_daily_basis_in_JS%2C_why_are_they_useful.md). Preserve effects, identity and error contracts; avoid speculative abstraction. [Refactor seam](../senior_growth/EngX_Quality/How_would_you_approach_significant_refactoring.md) supplies characterization and a bounded debt decision.

## Practice and verification

Use [the shared increments](../practice/engineering/) and linked focused requirements. [Workbench](../workbench/engineering/) contains canonical references; [verification](../review/verification.md) distinguishes current checks, preserved historical evidence and unperformed integrations.
