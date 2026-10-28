// action-adapter-types.tsx — typecheck only; do not run rejected calls.
import { withActionTelemetry, ActionButton } from './action-adapter.js';
// @ts-expect-error Async telemetry cannot be silently ignored.
withActionTelemetry(ActionButton, async () => {});
// @ts-expect-error Native disabled must be boolean, not string.
const bad = <ActionButton disabled="yes" />;
// @ts-expect-error aria-busy is owned by the pending contract.
const collision = <ActionButton aria-busy="true" />;
