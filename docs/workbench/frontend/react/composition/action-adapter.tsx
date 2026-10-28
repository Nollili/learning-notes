// action-adapter.tsx
import type { ComponentPropsWithRef, ComponentType, MouseEventHandler } from 'react';

export type ActionButtonProps = Omit<ComponentPropsWithRef<'button'>, 'aria-busy'> & { pending?: boolean; 'aria-busy'?: never };
export function ActionButton({ pending = false, disabled, type = 'button', ...props }: ActionButtonProps) {
  return <button {...props} type={type} disabled={Boolean(disabled || pending)} aria-busy={pending} />;
}
export function withActionTelemetry(Wrapped: ComponentType<ActionButtonProps>, record: () => undefined) {
  function TrackedAction(props: ActionButtonProps) {
    const onClick: MouseEventHandler<HTMLButtonElement> = event => {
      props.onClick?.(event);
      if (!event.defaultPrevented) {
        try { record(); } catch { /* Best-effort synchronous telemetry must not break the action. */ }
      }
    };
    return <Wrapped {...props} onClick={onClick} />;
  }
  TrackedAction.displayName = `WithActionTelemetry(${Wrapped.displayName ?? Wrapped.name ?? 'Action'})`;
  return TrackedAction;
}
// Create component types once, outside rendering. Replace this no-op with an owned sync sink.
export const TrackedActionButton = withActionTelemetry(ActionButton, () => undefined);
