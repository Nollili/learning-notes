# Practice: What are hooks good for? What are the rules of hooks?

**Status: outstanding learner practice.** Author checks do not complete these requirements.

Prerequisite: study the [worked lesson](../../../senior_growth/React/What_Are_React_Hooks_Good_For_Rules_of_Hooks.md) and its linked foundations. Apply these focused cases to [P-328/P-329/P-330](../../frontend-project.md); retain only the cases relevant to the chosen increment.

## Scope and observable criteria

**Decision exercise:** classify filtering a list, sending an order on click, subscribing to a socket, and synchronizing a document title. Acceptance: pure derivation stays in render; order write stays in the event action; synchronization has complete dependencies/cleanup; SSR produces no window access or differing initial markup; rapid source changes and Strict Mode leave no stale listener/timer. Confirm interval updates and cleanup with controlled timers, then verify hydration in a real SSR app. Material completion does not imply the exercise ran.

**Exercise:** compose two providers, dispatch-only controls, a count display and focus control. Acceptance: reducer bounds/no-op identity/previous-state preservation verified; missing-provider error is understandable; two providers don't share state; ref mutation alone doesn't update displayed state; external subscription setup/cleanup and SSR snapshot behavior are explained. Compare combined versus split context subscriptions with actual profiling, without claiming every rerender is waste. The existing fetch/timer hooks supply cancellation/cleanup failure cases; reusable hooks still need complete dependencies and an explicit API.

**Scheduling acceptance:** profile typing and result rendering in a production/profiling build, compare urgent-only versus transition/deferred variants under the same bounded data, verify latest input/result correctness and stale feedback. Explain a monolithic expensive callback that still blocks despite a transition. Test slow/failed async results with the existing identity/cancellation contract. No measured responsiveness win follows from the code listing alone.

## Evidence

Record source revision, runtime/browser versions, expected versus observed result, one reproduced failure, correction and retest. Include exact commands or input sequence and artifacts. Mark unperformed keyboard, screen-reader, zoom, device and integration checks explicitly. Never record a supplied example as your completed practice.
