# Can you provide some examples for accessibility?

## 🔹 Accessibility (a11y) Examples

Accessibility (a11y) ensures that **all users, including those with disabilities**, can access and interact with your website. Here are concrete examples of implementing accessibility in web development.

---

## 1️⃣ Text Alternatives

**Problem:** Blind or visually impaired users can’t see images.  
**Solution:** Provide **`alt` attributes** for images.

```html
<!-- Good -->
<img src="logo.png" alt="Company Logo">

<!-- Bad -->
<img src="logo.png">
```

* `alt=""` can be used for decorative images.

---

## 2️⃣ Keyboard Navigation

**Problem:** Users with motor disabilities rely on keyboard instead of a mouse.
**Solution:** Prefer native controls with their built-in keyboard behavior. Composite widgets may have a single Tab stop with internal arrow navigation; do not add tabindex indiscriminately.

```html
<button>Submit</button>
<a href="/home">Home</a>
```

* Avoid non-semantic clickable `<div>`s.
* Provide **focus styles** for visible indicators.

---

## 3️⃣ ARIA Roles and Labels

**Problem:** Screen readers may not understand custom components.
**Solution:** Use **ARIA attributes** to convey roles, states, and labels.

```html
<p role="status">Form submitted successfully!</p>
<button aria-label="Close notification">X</button>
```

* Use a pre-existing `role="status"` region for routine polite updates. Reserve assertive alerts for urgent information; avoid announcing the same message through multiple mechanisms.
* aria-label supplies an accessible name on elements/roles that permit naming; aria-describedby supplies a description. Prefer visible native labels, and keep any overriding name consistent with visible control text.

---

## 4️⃣ Color Contrast & Visual Accessibility

**Problem:** Low contrast text is unreadable for users with visual impairments.
**Solution:** Ensure **sufficient contrast** (WCAG recommends ≥ 4.5:1 for normal text).

```css
/* Good contrast */
body {
  color: #222; /* dark text */
  background-color: #fff; /* light background */
}

/* Bad contrast */
body {
  color: #aaa; /* light gray text */
  background-color: #fff;
}
```

---

## 5️⃣ Form Accessibility

**Problem:** Forms are confusing without proper labels.
**Solution:** Use `<label>` elements and associate them with inputs.

```html
<label for="email">Email Address</label>
<input type="email" id="email" name="email" />
```

* Use `aria-describedby` for error messages or hints.

---

## 6️⃣ Responsive & Scalable Text

**Problem:** Users with low vision may need to **resize text**.
**Solution:** use font-relative sizing and flexible layout, then test text/page zoom. CSS pixels also scale under page zoom; rem alone does not prevent clipping.

```css
body {
  font-size: 1rem; /* scalable */
}
h1 {
  font-size: 2rem;
}
```

---

## 7️⃣ Captions & Transcripts

**Problem:** Deaf or hard-of-hearing users cannot access audio content.
**Solution:** Supply captions, transcripts and audio description as required by the media content and applicable criteria; they are not universally interchangeable.

```html
<video controls>
  <source src="lecture.mp4" type="video/mp4">
  <track src="lecture.vtt" kind="captions" srclang="en" label="English">
</video>
```

---

## 8️⃣ Semantic HTML

**Problem:** Screen readers need to understand page structure.
**Solution:** Use proper semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).

```html
<header>
  <h1>Blog Title</h1>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
<footer>...</footer>
```

---

## 9️⃣ Focus Management for Modals

**Problem:** Users using keyboard or screen readers may lose context when modals open.
**Solution:** Trap focus inside the modal and restore focus when closed.

Use native `<dialog>.showModal()` where the supported browser matrix permits it. A portal changes DOM placement; it does not implement modal behavior. The following single-page example is a client-side validation demo; successful output does not mean data was saved to a server.

```html
<button id="open-editor" type="button">Edit contact</button>
<p id="save-status" role="status"></p>
<dialog id="editor" aria-labelledby="editor-title">
  <h2 id="editor-title">Edit contact</h2>
  <form id="contact-form" novalidate>
    <div id="error-summary" tabindex="-1" hidden>
      <h3>Check your email address</h3>
      <a href="#editor-email">Enter a valid email address</a>
    </div>
    <label for="editor-email">Email address</label>
    <input id="editor-email" name="email" type="email" required
           autocomplete="email" aria-describedby="email-hint" autofocus>
    <p id="email-hint">Used for your requested receipt.</p>
    <p id="email-error" hidden>Enter a valid email address.</p>
    <button type="submit">Validate contact</button>
    <button id="cancel-editor" type="button">Cancel</button>
  </form>
</dialog>
```

```js
// Load as a separate deferred/module script after the HTML fixture.
const opener = document.querySelector('#open-editor');
const dialog = document.querySelector('#editor');
const form = document.querySelector('#contact-form');
const email = document.querySelector('#editor-email');
const summary = document.querySelector('#error-summary');
const error = document.querySelector('#email-error');
const status = document.querySelector('#save-status');
let returnFocus = null;
function clearErrors() {
  email.removeAttribute('aria-invalid');
  email.setAttribute('aria-describedby', 'email-hint');
  error.hidden = true;
  summary.hidden = true;
}
opener.addEventListener('click', () => {
  returnFocus = document.activeElement;
  clearErrors();
  status.textContent = '';
  dialog.showModal(); // Focus enters; outside content becomes inert.
});
document.querySelector('#cancel-editor').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus();
}); // Native Escape cancel behavior closes unless deliberately prevented.
form.addEventListener('submit', event => {
  event.preventDefault();
  clearErrors();
  if (!email.validity.valid) {
    email.setAttribute('aria-invalid', 'true');
    email.setAttribute('aria-describedby', 'email-hint email-error');
    error.hidden = false;
    summary.hidden = false;
    summary.focus(); // Summary is programmatically focusable, not an extra Tab stop.
    return;
  }
  dialog.close();
  status.textContent = 'Contact format validated; no data was sent.';
});
```

Initial focus goes to the email field for this short form; long/structured dialog content may need a focusable introductory heading instead. Do not add tabindex to the dialog element itself. Ensure focus has a visible style; do not hide outlines. `show()` creates a nonmodal dialog, while `showModal()` adds native modality/top-layer behavior. An open attribute alone does not reproduce it.

**Failure cases:** if the trigger is removed, choose a logical surviving focus target; nested dialogs need stack-aware ownership. Async server submission additionally needs pending/error/retry handling, cancellation and stale-result protection; only close on actual success. Do not announce success before persistence. A custom dialog requires explicit focus containment, background inertness, Escape and restore logic; prefer native behavior or a tested library over an incomplete hand-written trap. Plain dropdown navigation/disclosures should not trap focus.

**Exercise — complete contact flow:** implement this example with visible focus and responsive dialog sizing. Acceptance: the dialog's name and input label are exposed; Tab/Shift+Tab stay within the modal; Escape/Cancel restore focus; background cannot be operated; invalid submission focuses a readable summary and associates the error; valid submission announces the truthful outcome; zoom400% and long text do not obscure essential controls. Verify with a real screen reader/browser pair and record results. Add a server adapter only after distinguishing validation success from saving success. This exercise remains learner practice.

---

### ✅ Summary

**Accessibility examples include:**

1. Alt text for images
2. Keyboard navigation & focus indicators
3. ARIA roles and labels
4. Sufficient color contrast
5. Accessible forms with labels
6. Scalable text (rem/em)
7. Captions and transcripts for media
8. Semantic HTML for page structure
9. Focus management in dynamic content

> 💡 Senior Tip:
> Accessibility should be **integrated from the beginning** of the project. Test with **screen readers, keyboard-only navigation, and contrast tools** to catch issues early.

## References and audit scope

[WHATWG dialog](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element), [WAI modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), [WCAG2.2](https://www.w3.org/TR/WCAG22/). Checked2026-10-20. The native-dialog example targets browsers with showModal support; it still requires assistive-technology validation. No completed manual audit is implied by these notes.

## Responsive images: selection, art direction and layout stability

```html
<picture>
  <!-- A different crop for a narrow layout; dimensions describe that crop's ratio. -->
  <source media="(max-width:40rem)"
          srcset="/images/workshop-crop-640.jpg 640w, /images/workshop-crop-960.jpg 960w"
          sizes="calc(100vw - 2rem)" width="960" height="720">
  <img src="/images/workshop-1600.jpg"
       srcset="/images/workshop-800.jpg 800w, /images/workshop-1600.jpg 1600w"
       sizes="(min-width:74rem)72rem, calc(100vw - 2rem)"
       width="1600" height="900" alt="A mentor and two learners reviewing a browser trace"
       loading="eager" fetchpriority="high" style="max-width:100%;height:auto">
</picture>
```

Asset paths are exercise fixtures to provide, not files shipped with this note. The sizes values assume a layout capped at72rem with1rem margins; change them to match the real rendered slot. w descriptors are intrinsic source widths; the browser combines slot width, device density and policy to select a candidate. For a fixed slot, density candidates such as `icon.png 1x, icon@2x.png 2x` are an alternative; do not mix width and density descriptors in one srcset.

picture/source can choose a crop or supported format; img supplies the fallback and alternative text. Width/height reserve aspect ratio before decoding and reduce layout shifts. A high priority/eager hero is appropriate only when it is a measured likely LCP image; do not mark every image high priority. Offscreen images can use lazy loading with dimensions, while lazy-loading the main hero can delay LCP. CSS width alone does not choose a lower-byte source. Avoid preloading a mismatched candidate that causes a duplicate download.

Alternative text communicates purpose in context: a linked logo often needs the destination/organization name rather than “Company Logo”; a decorative image uses alt=""; a chart needs a textual summary/data equivalent. Repeating a nearby caption verbatim may add noise. Inspect which source was selected through currentSrc and the network trace; cached image selection and browser policies can affect repeated tests.

**Image exercise:** supply two sizes/crops and implement this in the matching layout. Acceptance: record viewport/density/currentSrc/transfer size; narrow crop and wide image communicate equivalent meaning; dimensions prevent avoidable shift; slow network does not delay the hero through lazy loading; meaningful alt and keyboard-linked-image names are verified. Do not infer selection from filename or DOM src alone.

## Audio/video: information equivalence and native controls

```html
<figure>
  <video controls preload="metadata" poster="/media/demo-poster.jpg" width="1280" height="720">
    <source src="/media/demo.mp4" type="video/mp4">
    <track kind="captions" src="/media/demo.en.vtt" srclang="en" label="English" default>
    <p><a href="/media/demo.mp4">Download the demo video</a>.</p>
  </video>
  <figcaption>Debugging an out-of-order request.</figcaption>
</figure>
<p><a href="/transcripts/demo">Read the descriptive transcript</a>.</p>
```

```text
WEBVTT

00:00:00.000 --> 00:00:03.000
[Keyboard typing] The second request finishes first.
```

Captions include relevant speech and non-speech audio; subtitles alone may omit the latter. A descriptive transcript also explains meaningful visual information. When audio description is required, plan a described version or equivalent appropriate to the content/criteria; a plain transcript is not automatically a substitute for every synchronized-media requirement. Audio-only content needs a transcript; silent video needs an equivalent way to access its visual information.

Native controls offer a strong baseline but still need keyboard/reader/device testing. preload is a browser hint, not a promise about downloaded bytes. Avoid unexpected autoplay/audio, provide pause/stop and respect reduced-motion needs for moving previews. Handle failed/unsupported media with a useful alternative. Cross-origin caption/media access may require the correct crossorigin/CORS setup; MIME type and actual asset encoding matter. Do not build an inaccessible custom player merely to match a visual design.

**Media exercise:** create a short recording, valid captions and a descriptive transcript, then test failed-media and keyboard paths. Acceptance: captions accurately synchronize and include meaningful sounds; essential visual actions are described; native controls have usable names/focus; no forced autoplay; alternatives remain available if video fails. Record the actual reader/browser checks. These assets/exercises are not claimed as completed by the learner.

Official references: [WHATWG responsive images](https://html.spec.whatwg.org/multipage/images.html), [WAI image decisions](https://www.w3.org/WAI/tutorials/images/), [WAI accessible media](https://www.w3.org/WAI/media/av/), [WebVTT](https://www.w3.org/TR/webvtt1/). Checked2026-10-20. The earlier dialog error description is attached only while invalid: hidden text explicitly referenced by aria-describedby can still contribute to its accessible description.

## Async form notifications: one error summary, associated fields and truthful success

This fixture is a separate two-field profile form, not an extension that silently changes the earlier client-validation-only dialog into a server save. The exercise supplies an authenticated, authorized server endpoint with bounded JSON and a safe result contract. The summary takes focus on failed submission; individual errors are descriptions rather than duplicate assertive live alerts. Routine progress/success uses one pre-existing status region.

```html
<form id="profile-form" novalidate>
  <section id="profile-summary" hidden tabindex="-1" aria-labelledby="profile-summary-title">
    <h2 id="profile-summary-title">Check your details</h2><ul></ul>
  </section>
  <fieldset><legend>Profile details</legend>
    <label for="profile-name">Name</label>
    <input id="profile-name" name="name" required maxlength="80" autocomplete="name">
    <p id="profile-name-error" hidden></p>
    <label for="profile-email">Email address</label>
    <input id="profile-email" name="email" type="email" required maxlength="254" autocomplete="email">
    <p id="profile-email-error" hidden></p>
    <button type="submit">Save profile</button>
  </fieldset>
  <button id="profile-cancel" type="button" disabled>Cancel request</button>
  <p id="profile-status" role="status"></p>
</form>
```

```js
// Pure projection from safe server codes to application-owned field messages.
export function profileFieldErrors(value) {
  if (!value || typeof value !== 'object' || !value.errors || typeof value.errors !== 'object' || Array.isArray(value.errors)) {
    throw new Error('Invalid validation response');
  }
  const definitions = [
    ['name', 'REQUIRED_NAME', 'Enter a name.'],
    ['email', 'INVALID_EMAIL', 'Enter a valid email address.']
  ];
  const errors = definitions.filter(([field, code]) => Object.hasOwn(value.errors, field) && value.errors[field] === code)
    .map(([field, , message]) => ({ field, message }));
  if (!errors.length) throw new Error('Unknown validation response');
  return errors;
}
```

```js
// Client transport; server implements session/authorization/validation/commit semantics.
async function saveProfile(data, signal) {
  const response = await fetch('/api/profile', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), signal
  });
  if (response.status === 422) return { kind: 'invalid', errors: profileFieldErrors(await response.json()) };
  if (!response.ok) { await response.body?.cancel(); throw new Error('Save unavailable'); }
  const value = await response.json();
  if (!value || value.saved !== true) throw new Error('Save confirmation missing');
  return { kind: 'saved' };
}
```

```js
// Install after the fixture markup; caller owns/disposes this registration.
export function installProfileForm(root, save) {
  const form = root.querySelector('#profile-form');
  const fieldset = form.querySelector('fieldset');
  const summary = root.querySelector('#profile-summary');
  const list = summary.querySelector('ul');
  const status = root.querySelector('#profile-status');
  const cancel = root.querySelector('#profile-cancel');
  const fields = { name: root.querySelector('#profile-name'), email: root.querySelector('#profile-email') };
  let generation = 0;
  let controller = null;
  function clearErrors() {
    summary.hidden = true; list.replaceChildren();
    for (const [field, input] of Object.entries(fields)) {
      input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby');
      root.querySelector(`#profile-${field}-error`).hidden = true;
    }
  }
  function showErrors(errors) {
    clearErrors();
    for (const { field, message } of errors) {
      const input = fields[field]; // Only client-owned or projected allowlisted fields reach here.
      const output = root.querySelector(`#profile-${field}-error`);
      output.textContent = message; output.hidden = false;
      input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', output.id);
      const item = document.createElement('li'), link = document.createElement('a');
      link.href = `#profile-${field}`; link.textContent = message;
      item.append(link); list.append(item);
    }
    summary.hidden = false; summary.focus();
  }
  async function submit(event) {
    event.preventDefault();
    if (controller) return; // Immediate in-flight guard; server still owns duplicate-write integrity.
    clearErrors(); status.textContent = '';
    const errors = [];
    if (!fields.name.value.trim() || fields.name.value.trim().length > 80) errors.push({ field: 'name', message: 'Enter a name of at most80characters.' });
    if (!fields.email.validity.valid || fields.email.value.length > 254) errors.push({ field: 'email', message: 'Enter a valid email address.' });
    if (errors.length) { showErrors(errors); return; }
    const data = { name: fields.name.value.trim(), email: fields.email.value };
    controller = new AbortController();
    const mine = ++generation;
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]);
    fieldset.disabled = true; cancel.disabled = false; form.setAttribute('aria-busy', 'true');
    status.textContent = 'Saving profile…';
    try {
      const result = await save(data, signal);
      if (mine !== generation) return;
      status.textContent = '';
      if (result.kind === 'invalid') showErrors(result.errors);
      else if (result.kind === 'saved') status.textContent = 'Profile saved.';
      else throw new Error('Invalid save result');
    } catch {
      if (mine === generation) status.textContent = 'Save result not confirmed. Your inputs remain; check the current profile before retrying.';
    } finally {
      if (mine === generation) {
        controller = null; fieldset.disabled = false; cancel.disabled = true; form.removeAttribute('aria-busy');
      }
    }
  }
  const cancelRequest = () => controller?.abort();
  const followError = event => {
    const link = event.target instanceof Element ? event.target.closest('a') : null;
    if (!link) return;
    const field = Object.values(fields).find(input => `#${input.id}` === link.getAttribute('href'));
    if (field) { event.preventDefault(); field.focus(); }
  };
  form.addEventListener('submit', submit); cancel.addEventListener('click', cancelRequest);
  summary.addEventListener('click', followError);
  return () => {
    ++generation; controller?.abort(); controller = null;
    form.removeEventListener('submit', submit); cancel.removeEventListener('click', cancelRequest);
    summary.removeEventListener('click', followError);
    fieldset.disabled = false; cancel.disabled = true; form.removeAttribute('aria-busy');
  };
}
// const dispose = installProfileForm(document, saveProfile);
// On route/owner disposal: dispose().
```

The registration assumes this unique fixture/initially enabled fieldset; multiple instances require instance-scoped IDs/roots. If fields also have hints, preserve their description IDs when adding/removing error IDs instead of removing all descriptions as this hint-free fixture does. The save adapter must return only the projected field list, consume cancellation and have bounded completion/body limits; a custom adapter ignoring its signal needs an independent deadline. Cancellation does not prove a server write was undone. Close a containing dialog only after kind=saved, then announce success in a surviving status region; don't place the only result inside removed dialog content.

Empty/malformed/unknown server error results become operational uncertainty, not an invented field error or false success. Preserve entered values for recovery and do not infer authorization from a client's validation. Disable normal controls only while pending, leave a usable cancel mechanism and re-enable before following an error link. A generation guard prevents stale responses changing a disposed form; a full application also scopes work across user/session changes. Longer forms need a sensible error-summary heading/count/order and links to every relevant error. On validation failure focus the summary once rather than asserting the same content through summary alert plus field alert plus live status.

### Manual evidence record: fill with actual observations

| Flow | Expected behavior | Required evidence |
|---|---|---|
| Open modal | Named dialog, intentional initial focus, background unavailable | Browser/OS/reader versions, focus/announcement observation |
| Keyboard close | Tab containment, Escape/Cancel, logical restore/fallback | Keyboard trace and removed-trigger case |
| Invalid local/server form | Summary focused, links focus fields, errors described | Actual announcement/reading order; no duplicate assertive announcements |
| Slow save/cancel/error | Truthful status, usable controls, draft retained, no false success | Adapter/HTTP result plus keyboard/reader observation |
| Confirmed success | Close only after persistence; surviving region announces result | Real committed result and observed announcement |
| Zoom/reflow/motion | Essential controls/errors visible/operable, no blocked focus | Narrow/400%/preferences test artifacts |

Every evidence cell is **unperformed learner practice**, not a pass. Automated DOM/name/role checks can detect some defects but cannot substitute for these observations. Record expected versus actual, severity, correction/retest and residual support limits. Avoid claiming an entire product conforms because this fixture works in one reader/browser pair.

Official references checked2026-10-21: [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), [WAI modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [AccName1.2 draft](https://www.w3.org/TR/accname-1.2/), [WCAG2.2](https://www.w3.org/TR/WCAG22/). Accessible names/descriptions and announcement timing need the declared platform matrix; syntax validation supplies no manual pass.
