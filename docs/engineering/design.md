# Design decisions, operations and specialist boundaries

**Prerequisites:** One working frontend/backend slice and the shared topic foundations. Review baseline: 2026-10-27. All learner practice remains outstanding.

## Make the decision reviewable

[Vertical slice/ADR/estimate](../senior_growth/EngX_Quality/Name_all_steps_that_are_required_to_start_a_new_project%2C_what_kind_of_tools_do_you_suggest_to_use._What_would_you_consider_when_choosing_tech_stack%2C_library%2C_framework.md) → [Functional and quality scenarios](../senior_growth/EngX_Quality/Could_please_the_differentiate_between_Functional_and_Non-functional_reqs%28NFRs%29%2C_How_and_when_to_take_them_into_consideration.md) → [Reproduction and handoff](../senior_growth/EngX_Quality/How_would_you_onboard_new_people_on_a_project%2C_What_kind_of_documentation%2C_style_guide_would_you_use.md). Separate proposed budgets/owners from observed measurements and real participants; do not invent stakeholder approval.

## Map persistence explicitly

[PostgreSQL/SQL/MikroORM](../node-js/module-08-postgresql-mikroorm.md) and [query workbench](../node-js/sql-query-workbench.md) are the primary intermediate database path, reviewed in round two—not merely the original audit. [MongoDB](../node-js/module-07-mongodb-mongoose.md), [Redis](../node-js/redis-adapters.md) and [GraphQL](../node-js/graphql-basics.md) are bounded alternatives. [Data-model comparison](../senior_growth/EngX_Quality/Do_you_know_some_of_the_differences_of_non_relational_databases_and_relational_databases.md) must choose actual invariants, topology and isolation, not SQL/NoSQL stereotypes.

## Map distribution and operations explicitly

[Resilient systems](../node-js/module-12-resilient-distributed-systems.md), [jobs](../node-js/jobs-and-schedules.md), [database recovery](../node-js/database-recovery.md), [production lifecycle](../node-js/module-10-production-ready-applications.md) and [containers](../node-js/container-deployment-lab.md) own retries, idempotency, durable receipts, leases/fencing, recovery and deployment. Their local tests do not prove a production SLO, successful restore in your infrastructure or a multi-region system.

## Keep specialist depth bounded

AWS/IaC, Kubernetes awareness, microfrontends, historical jQuery/Flux/Incremental DOM, advanced RxJS, custom rendering and graph databases are optional introductions/alternatives. Every related local file is still inventoried; optional does not mean unaccounted. Use [primary browser/workflow patterns](../frontend/) before adopting an additional platform.

## Python and AI-assisted engineering

[Python prerequisites](../python-for-ai/) and [applied AI](../applied-ai/) retain their completed round-two maps and isolated workbench checks. [AI-assisted engineering](../ai-assisted-engineering/) is a distinct issue→diff→checks→handoff path, now given a standalone retry workbench and separate practice; it is not learner mastery or independent human approval.

## Practice and verification

Use [the shared increments](../practice/engineering/) and linked focused requirements. [Workbench](../workbench/engineering/) contains canonical references; [verification](../review/verification.md) distinguishes current checks, preserved historical evidence and unperformed integrations.
