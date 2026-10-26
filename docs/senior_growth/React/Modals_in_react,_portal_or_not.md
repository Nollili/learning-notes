# Modals in react, portal or not.md

In React, the `<App />` component is typically rendered inside a single `<div>` element with the id `root`. Nesting modals within other components can cause issues such as conflicting CSS styles—like padding, margins, or positioning—that may distort the modal’s appearance or behavior.

Choose placement based on containing blocks/clipping/layer ownership. A portal can escape an unsuitable DOM ancestor; a native dialog opened with showModal uses the top layer and often needs no portal. Placement alone does not provide accessibility or CSS/script isolation.

React offers a feature called **React Portals** to handle this use case effectively.
---
### What Are React Portals?

React Portals allow you to render a component outside of its parent DOM hierarchy. This is particularly useful for modals, tooltips, and other UI elements that need to "float" above the rest of the application.

#### Benefits of Using React Portals

- Can change which DOM ancestors clip/position the content; global styles and inherited values still apply.
- Allows a shared overlay host, but focus, semantics, Escape, inert background and recovery still need an owner.
- Keeps React context/ownership while changing physical DOM placement; test actual layering/interaction.

---

### 🧠 **Short explanation for interviews**

> “Yes — we still use **React Portals** for modals when we need them to render outside the normal component hierarchy, for example under a dedicated overlay host.
> A portal lets you render a React component into a different DOM node — typically a `div` like `<div id="modal-root"></div>` that sits next to your app root.
>
> However, many UI libraries (like MUI, Radix, or Headless UI) handle this internally, so you often use their `<Modal>` or `<Dialog>` components instead of writing your own portal. Their implementation may use portals or native top-layer primitives; verify the installed library contract.”

---

### 🧩 Example:

```tsx
import { createPortal } from 'react-dom';
import { useEffect, useState, type ReactNode } from 'react';
export function OverlayHost({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    const element = document.getElementById('modal-root');
    if (element) setHost(element); else setMissing(true);
  }, []);
  if (missing) return <p role="alert">Overlay host unavailable.</p>;
  return host ? createPortal(children, host) : null;
}
```

This is a placement primitive, not a complete dialog. Server and initial client output are both null; document access happens after mount. The host must exist before creating the portal and remain stable; changing hosts recreates content/state. Define a hydration/loading policy for important content rather than making it portal-only by accident.

And in `index.html`:

```html
<body>
  <div id="root"></div>
  <div id="modal-root"></div>
</body>
```

---

### Use cases of React Portals
- **Tooltips:** Like modals, tooltips need to "float" above other UI elements. Portals help position tooltips contextually to their trigger while avoiding issues with overflow or clipping.
- **Notifications or Toasts:** These should appear above other content, often at the top or bottom of the viewport. Portals prevent z-index and nesting problems, making it easier to manage multiple notifications.
- **Fullscreen overlays:** For components that expand to fullscreen (e.g., images, videos), portals allow rendering outside the normal hierarchy, simplifying implementation.
- **Third-party widget integrations:** When adding widgets like chatbots, portals place them in a chosen host; they do not isolate JavaScript or all styles.
- **Drag-and-Drop components:** Draggable elements can be clipped by containers; a suitable portal host can escape clipping; its stacking context still determines paint order.

---

### 🧠 When to use portals today

✅ Still standard when:

* You need modals, tooltips, dropdowns, or popovers that escape parent `overflow:hidden` or `z-index` issues.
* You’re building your own UI library or want full control.

🚫 Often not needed when:

* You use modern UI libraries (Radix UI, Material UI, Chakra UI, etc.) — the selected component may already own placement and modality; verify its implementation.

---

### 🗣️ **Interview-ready 30-second answer**

> “Yes, we still use React Portals for modals — they can render an overlay under a suitable DOM host while preserving the React tree. Native top-layer dialog behavior or a tested component library may supply the modal primitive.
> In practice, though, most UI libraries like MUI or Radix handle that internally, so the application often delegates placement and focus/modality ownership to that tested primitive.”

---



## Controlled native dialog: one owner for modality and recovery

React19 baseline, checked2026-10-21. This primary example deliberately supports **one active modal** and a stable fallback focus ref. A multi-dialog application needs coordinated stack/scroll/focus ownership or a tested library; don't copy a single boolean body lock into many independent overlays.

```tsx
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
```

```css
dialog { max-inline-size: min(90vw, 40rem); max-block-size: 80dvh; overflow: auto; }
dialog::backdrop { background: rgb(0 0 0 / .5); }
```

Keep fallbackFocus identity stable (a useRef object), so unrelated renders don't close/reopen the dialog. Effects don't run on the server; an initially open prop becomes modal after the client commit under this API. If first-response content must already be visible/operable, choose a compatible nonmodal/server-rendered fallback or framework strategy rather than asserting that open=true on the server runs showModal. An open attribute or aria-modal alone does not implement top-layer modality. Browser support, mobile scroll/keyboard and the single-owner scroll lock require real testing.

Native cancel is prevented so the controlled owner decides closure; close events also reconcile an unexpected native close. StrictMode setup/cleanup/setup must leave one open dialog and restore owned styles on final close/unmount. Initial heading focus supports structured content without flattening it through a giant aria-describedby; the visible heading supplies the name. A short form may intentionally focus its first field; a destructive confirmation may choose the least destructive action. A missing opener restores to the logical surviving fallback, not an arbitrary body focus. Maintain visible focus and a usable scrollable area at zoom.

React events still bubble through the React owner tree across a portal, and context remains available. An ancestor click-to-close can therefore fire for a click inside the overlay; distinguish actual backdrop interaction instead of stopping every event indiscriminately. DOM inheritance changes with the host, so a theme class/token on an app wrapper may not reach a sibling portal root even though React Context does. Passing an overlay through body is not a Shadow DOM/security boundary. Native modal top-layer behavior can escape ordinary clipping without moving React ownership at all.

For an async form inside the dialog, keep pending/server errors visible and close only after confirmed persistence. Cancelling UI/request does not necessarily undo a committed server write; preserve/reconcile the draft and use the mutation contract. A disclosure, navigation dropdown or nonmodal panel should not trap the user in a modal loop. Prefer native controls/semantics to a custom div trap; complex library alternatives still need acceptance testing rather than a blanket accessibility guarantee.

**Exercise acceptance:** open/Tab/Shift+Tab/Escape/Close, click inside versus backdrop, remove the trigger before close, long/translated content, repeated mount/StrictMode, SSR first paint/hydration and zoom400%. Verify name, focus entry/containment/return, inert background, scroll lock restoration and no stale async success after route change. Retain browser/OS/screen-reader versions and actual results; this code has not received a manual accessibility pass. Test a missing/changed portal host and theme inheritance explicitly. No library installation or browser verification is implied by syntax checks.

Official references: [React portal ownership/events](https://react.dev/reference/react-dom/createPortal), [HTML dialog](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element), [WAI modal focus pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [React Effect cleanup](https://react.dev/reference/react/useEffect). Checked2026-10-21.


## Verify closure events without confusing placement and modality

The controlled native example above is the complete primary focus/semantics/keyboard workflow for this lesson; OverlayHost is only the placement alternative. Native close events can be queued. During StrictMode effect cleanup/setup or a fast close/reopen, an old close event can arrive after showModal has reopened the element. The onClose handler checks the element's current open state before requesting owner closure, avoiding that stale event closing the new modal. A genuine native close leaves open=false and still reconciles the controlled owner.

**Focused regression acceptance:** simulate showModal/close and queued close-event delivery to prove that reopening survives an old event, a genuine current close requests closure, controlled cleanup restores owned overflow and the heading/opener/fallback policy is followed. These are control-flow tests only; a DOM shim does not implement the top layer, actual focus trapping, inertness, native Escape or mobile scrolling. Complete the existing native browser/reader matrix separately. For a mutation form, use the [worked async form/dialog contracts](./complex-forms-and-data.md) and preserve pending/errors/drafts until confirmed server success. Learner/browser practice remains required.
