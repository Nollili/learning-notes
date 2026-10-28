import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
export function NativeDialog({ open, title, onRequestClose, fallbackFocus, children }: {
  open: boolean; title: string; onRequestClose: () => void;
  fallbackFocus: RefObject<HTMLElement | null>; children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    if (!element.open) element.showModal();
    root.style.overflow = 'hidden';
    heading.current?.focus(); // Long/structured-content policy; short forms may choose their first control.
    return () => {
      if (element.open) element.close();
      root.style.overflow = previousOverflow;
      const target = opener?.isConnected ? opener : fallbackFocus.current;
      if (target?.isConnected && document.activeElement !== target) target.focus();
    };
  }, [open, fallbackFocus]);
  return <dialog ref={dialog} aria-labelledby={id}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const element = event.currentTarget;
      // Bounded light-DOM contract: no positive tabindex, nested frame or shadow widget.
      const stops = [...element.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]')]
        .filter(node => node.tabIndex >= 0 && !node.matches(':disabled') && !node.closest('[hidden], [inert]') &&
          node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden');
      const first = stops[0], last = stops.at(-1);
      if (!first || !last) { event.preventDefault(); heading.current?.focus(); return; }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !stops.includes(active as HTMLElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (active === last || !element.contains(active))) {
        event.preventDefault(); first.focus();
      }
    }}
    onCancel={event => { event.preventDefault(); onRequestClose(); }}
    onClose={event => { if (open && !event.currentTarget.open) onRequestClose(); }}>
    <h2 id={id} ref={heading} tabIndex={-1}>{title}</h2>
    {children}
    <button type="button" onClick={onRequestClose}>Close dialog</button>
  </dialog>;
}
export function DialogDemo() {
  const [open, setOpen] = useState(false);
  const fallback = useRef<HTMLHeadingElement>(null);
  return <><h1 ref={fallback} tabIndex={-1}>Contact workspace</h1>
    <button type="button" onClick={() => setOpen(true)}>Open contact instructions</button>
    <NativeDialog open={open} title="Contact instructions" fallbackFocus={fallback} onRequestClose={() => setOpen(false)}>
      <p>Review the requested contact details. This demonstration does not save data.</p>
    </NativeDialog></>;
}
