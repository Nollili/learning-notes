# Frontend coverage and ownership map

Review date: **2026-10-27**. This map reconciles the essential frontend path against audit R2-01/05/06/09/10/11. Coverage evidence comes from explanations, worked code and stated failure contracts—not a heading count. Existing reference URLs stay in place; the new frontend home orders them instead of making duplicate textbook copies.

## Essential concept records

Depth: foundational explanation plus a worked boundary/counterexample unless otherwise stated. Each record names its prerequisite and a separate practice stage. Live integration, performance, assistive and learner evidence remain distinct from material completion.

### Document semantics, forms and names

**Prerequisite:** HTML basics. **Teaching owner:** [Native form/table/disclosure](../senior_growth/A11y/What_is_semantic_HTML.md).

**Inspected explanation/worked boundary:** Native validation, FormData, name/description precedence, numeric table sort, cleanup. **Practice:** F01 in [the sequence](../practice/frontend/).

### Focus, modal and async feedback

**Prerequisite:** Native controls. **Teaching owner:** [Dialog/media/form notifications](../senior_growth/A11y/Can_you_provide_some_examples_for_a11y.md).

**Inspected explanation/worked boundary:** Heading versus field focus, associated errors and surviving success region; no reader pass inferred. **Practice:** F01 in [the sequence](../practice/frontend/).

### Accessibility evaluation

**Prerequisite:** Semantics/input model. **Teaching owner:** [Evaluation and evidence](../senior_growth/A11y/Can_we_test%2C_measure_a11y_somehow.md).

**Inspected explanation/worked boundary:** Rule scans versus keyboard/reader/reflow; scoped findings and retests. **Practice:** F01 in [the sequence](../practice/frontend/).

### Browser processing and security

**Prerequisite:** HTML/URLs. **Teaching owner:** [Browser lifecycle](./html-browser.md) and [HTML-first search](../senior_growth/Other/Cross_Browser_Progressive_Enhancement.md).

**Inspected explanation/worked boundary:** Parser/script/render distinction; no-JS GET, failure fallback, owned optional fetch. **Practice:** F01/F03 in [the sequence](../practice/frontend/).

### Box model, layout and responsive sizing

**Prerequisite:** Document flow. **Teaching owner:** [Layout mechanisms](../senior_growth/CSS/layout-and-responsive-design.md).

**Inspected explanation/worked boundary:** 200/244/156 boxes, flex/grid intrinsic minimums, stacking, container fallback and CLS limits. **Practice:** F02 in [the sequence](../practice/frontend/).

### Cascade, selectors and interaction states

**Prerequisite:** CSS rules. **Teaching owner:** [Cascade/specificity](../senior_growth/CSS/Can_you_describe_what_is_CSS_Specificity.md).

**Inspected explanation/worked boundary:** Layers before tuples, important reversal, where/is/has, visible focus and forced colors. **Practice:** F02 in [the sequence](../practice/frontend/).

### Units, themes and styling ownership

**Prerequisite:** Sizing/cascade. **Teaching owner:** [Units](../senior_growth/CSS/Difference_between_pixels%2C_ems_or_rems_Which_one_we_should_use.md); [Runtime themes](../senior_growth/CSS/styling_react_apps.md); [Architecture](../senior_growth/CSS/How_would_you_organize_CSS_on_huge_project.md).

**Inspected explanation/worked boundary:** Relative units, nested variable aliases, Sass versus runtime and SSR first-theme agreement. **Practice:** F02/F06 in [the sequence](../practice/frontend/).

### Bindings, closures and this

**Prerequisite:** JS functions. **Teaching owner:** [Execution](../senior_growth/General_ES6/Explain_JavaScript_Code_Execution_177e8106c24d80a0817df62da9bac253.md); [Lexical TDZ](../senior_growth/General_ES6/What_is_the_temporal_dead_zone_Why_is_this_happeni_177e8106c24d80d991b7caa84eaad6b6.md).

**Inspected explanation/worked boundary:** Worked binding fixture, retained lexical state and event-time/current-value ownership. **Practice:** F03 in [the sequence](../practice/frontend/).

### Identity, equality and pure updates

**Prerequisite:** Objects/functions. **Teaching owner:** [Equality/nullish](../senior_growth/General_ES6/What_is_the_difference_between_%27null%27_and_%27undefin_177e8106c24d80f98ff8c802efb7ff70.md); [Pure/effect shell](../senior_growth/General_ES6/What_are_pure_impure_functions_177e8106c24d80d19ebde80bcd1b5b50.md).

**Inspected explanation/worked boundary:** Object.is/SameValueZero distinctions, shallow copying and alias limits; CS owns collection cost. **Practice:** F03 in [the sequence](../practice/frontend/).

### Promises, scheduling and lifetime

**Prerequisite:** Execution/closures. **Teaching owner:** [Promises](../senior_growth/General_ES6/What_is_a_Promise_177e8106c24d80b3989df334146152f6.md); [Async lifetimes](../senior_growth/General_ES6/Understanding_async_await_in_JavaScript_177e8106c24d806fb457f53520e2c087.md); [Checkpoints](../senior_growth/General_ES6/What_are_the_tasks_microtasks_177e8106c24d804f94a8c0f84060cdf2.md).

**Inspected explanation/worked boundary:** Resolution versus completion, peer cancellation/draining, deadline/body limits and starvation. **Practice:** F03 in [the sequence](../practice/frontend/).

### Browser state and API cleanup

**Prerequisite:** Events/async. **Teaching owner:** [DOM/events/origin](../senior_growth/General_ES6/Could_you_please_describe_with_which_Browser_APIs__177e8106c24d802caa88e9916f01fc53.md); [Offline draft reference](../senior_growth/General_ES6/Browser_Storage_and_Offline_Drafts.md).

**Inspected explanation/worked boundary:** Delegation/message schema, storage scope/expiry/conflict and IndexedDB connection ownership. **Practice:** F03; optional native-IDB extension in [the sequence](../practice/frontend/).

### Strict narrowing and runtime boundaries

**Prerequisite:** JS values. **Teaching owner:** [Structural/unknown types](../senior_growth/TypeScript/What_are_the_different_types_of_TypeScript_%28Built-in_%26_User-defined%29.md); [Presence](../senior_growth/TypeScript/What_%22Strict_NULL_check_mode%22_means.md); [Exhaustive states](../senior_growth/TypeScript/Explain_the_purpose_of_the_%22never%22_type_in_TypeScript_How_it%27s_different_from_%22void%22.md).

**Inspected explanation/worked boundary:** Truthful guards, absence versus undefined, erased/shallow readonly, unknown JSON and never. **Practice:** F04/P-330 in [the sequence](../practice/frontend/).

### Generics, modules and compatibility

**Prerequisite:** Strict basic types. **Teaching owner:** [Generic relations](../senior_growth/TypeScript/Generics.md); [Target/API policy](../senior_growth/TypeScript/Can_we_write_code_in_TS_if_we_would_like_to_support_older_browsers.md).

**Inspected explanation/worked boundary:** Dependent key result, expected-invalid calls; advanced conditional/variance examples optional. **Practice:** F04 in [the sequence](../practice/frontend/).

### React render, queue and key identity

**Prerequisite:** JS/TS snapshots. **Teaching owner:** [Render owner](../senior_growth/React/Change_Detection_in_React.md); [Entity-identity companion](../senior_growth/React/Could_you_explain_how_change_detection_mechanism_works_in_React%2C_tradeoffs_and_benefits.md).

**Inspected explanation/worked boundary:** Replacement versus updater queue, commit versus paint, keyed draft through reorder. **Practice:** F05/P-329 in [the sequence](../practice/frontend/).

### Effects, refs, state ownership and races

**Prerequisite:** React rendering. **Teaching owner:** [Hooks](../senior_growth/React/What_Are_React_Hooks_Good_For_Rules_of_Hooks.md); [Lifetimes](../senior_growth/React/Lifecycle_Methods_and_the_Virtual_DOM.md).

**Inspected explanation/worked boundary:** Pure reducer, context scope, external-store contract, cleanup and ignored-abort ownership. **Practice:** F05 in [the sequence](../practice/frontend/).

### Forms, remote state and mutations

**Prerequisite:** Hooks/validation. **Teaching owner:** [Forms/drafts](../senior_growth/React/complex-forms-and-data.md); [Submission intent](../senior_growth/React/Submission_Idempotency.md).

**Inspected explanation/worked boundary:** Monotonic confirmed record plus pending overlay, shared keys, wizard validation/focus and uncertain commit. **Practice:** F05/P-328 in [the sequence](../practice/frontend/).

### Composition, HOCs and dialogs

**Prerequisite:** Native semantics + React state. **Teaching owner:** [Slots/tabs/adapter](../senior_growth/React/Composition_and_Higher-Order_Components_%28HOCs%29_in.md); [Native dialog](../senior_growth/React/Modals_in_react%2C_portal_or_not.md).

**Inspected explanation/worked boundary:** Controlled ID selection/keyboard model, forwarded ref/props, stable component type and focus recovery. **Practice:** F05 in [the sequence](../practice/frontend/).

### Memoization and performance

**Prerequisite:** Correct identity first. **Teaching owner:** [Mechanism owner](../senior_growth/React/What_is_memoization_and_how_to_achieve_it_in_React.md); [Comparator companion](../senior_growth/React/react_memo.md); [Experiment companion](../senior_growth/React/performance_potimization.md).

**Inspected explanation/worked boundary:** Discardable cache versus state, callback comparison, debounce cleanup and measured workloads. **Practice:** F05 in [the sequence](../practice/frontend/).

### Test boundaries

**Prerequisite:** Async component behavior. **Teaching owner:** [Component checks](../senior_growth/React/React_testing.md); [Bounded table](../senior_growth/EngX_Quality/Large_Data_Workflow.md).

**Inspected explanation/worked boundary:** Three SaveButton cases; six race/scope/pagination checks; real browser observations separate. **Practice:** F05/P-329 in [the sequence](../practice/frontend/).

### Next boundaries and route states

**Prerequisite:** React + HTTP. **Teaching owner:** [App Router](../senior_growth/React/next-app-router.md).

**Inspected explanation/worked boundary:** Safe DTO/type-only import, deterministic hydration, loading/absence/error and stable retry API. **Practice:** F06 in [the sequence](../practice/frontend/).

### Caches, assets and deployment

**Prerequisite:** Server/client boundary. **Teaching owner:** [Delivery](../senior_growth/React/next-deployment-and-assets.md); [cache-model decision](./next.md).

**Inspected explanation/worked boundary:** Previous cache model explicitly selected; public/private freshness, ISR versus cron, export limitations. **Practice:** F06 in [the sequence](../practice/frontend/).

### Authentication and mutation authority

**Prerequisite:** HTTP/cookies/SQL. **Teaching owner:** [Server security](../senior_growth/React/next-server-security.md).

**Inspected explanation/worked boundary:** Opaque session hash, owner/version write, Origin/CSRF checks, bounded body, safe errors. **Practice:** F06/P-330; real DB integration outstanding in [the sequence](../practice/frontend/).

### Component contracts and UI architecture

**Prerequisite:** State/accessibility. **Teaching owner:** [Contracts/tokens](../senior_growth/React/design-system-contracts.md); [Consumer release](../senior_growth/React/design-system-release.md); [Application ports](../senior_growth/React/application_struvture.md).

**Inspected explanation/worked boundary:** Native Button/ref API, deterministic token output, narrow migration, import-rule limits and rollback. **Practice:** F06 in [the sequence](../practice/frontend/).

## Duplication decisions

- **Render/queues versus identity:** retain both change-detection pages; the first owns scheduling/snapshots, the question companion owns editable keys and reconciliation trade-offs. Stable keys do not skip rendering automatically.
- **HOC versus composition:** the short HOC page remains a decision guide; the composition page owns controlled tabs and typed prop/ref transparency. Class integration, static fields, collisions and adapter lifetime are retained.
- **Memoization:** the mechanism page owns memo/useMemo/useCallback; the comparator page retains callback correctness; performance examples retain debounce/measurement context. CS owns algorithmic memoization and complexity. No blanket merge deletes distinct examples.
- **CSS:** the comparison page chooses tools, architecture owns layer/token migration, and React styling owns runtime theme/SSR agreement. Build-time Sass variables and runtime custom properties are different mechanisms.
- **Shared server/algorithm material:** link completed Node/CS explanations. No copies of database/stream/complexity courses were added. The applied-AI streaming UI port remains untouched.

## Scope and remaining catalogue

The essential reading lane covers HTML/CSS/browser/accessibility → JS/TS → React → Next/UI contracts. Existing interview summaries, framework comparisons, class/prototype/year catalogues and optional tools remain reference context, with focused prose/assignment cleanup. This is not a claim to have independently re-certified every external course, historical benchmark, package transitive dependency or optional platform adapter.

Optional extensions: native IndexedDB upgrade/concurrency runs, service-worker lifecycle, custom elements/Shadow DOM interop, advanced generic transformations, Cache Components migration, real multi-instance caching, virtualization/composite grids, design-system publishing and microfrontends. Choose them for an actual product need. Their retained procedures do not imply an executed integration.

[Reading order](./index.md) · [Workbench](../workbench/frontend/) · [Practice](../practice/frontend/) · [Executed checks and limits](./verification.md)

## Performance course merge — 2026-10-28

The [performance path](./performance/) now orders measurement, browser delivery, responsive images, critical CSS/fonts, runtime responsiveness and caching, with [three core hometasks](../practice/frontend/performance/). Existing senior-growth mechanisms/workbench fixtures remain canonical; these additions supply missing integrated teaching and exercises. [Source mapping](./performance/sources.md) records the EPAM module mapping, modern corrections and visual provenance; [merge verification](./performance/verification.md) separates author checks from outstanding learner/browser/production integrations. Service-worker implementation and differential builds remain optional specialist depth, while cache policies and dedicated-worker trade-offs are explained in the core reading.
