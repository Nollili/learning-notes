# 🗄️ LocalStorage vs SessionStorage — Advantages and Disadvantages

Both **LocalStorage** and **SessionStorage** are part of the **Web Storage API**, allowing browsers to store key-value data on the client side. They differ in **lifetime, scope, and usage patterns**.

---

## 1️⃣ LocalStorage

- **Scope:** Shared across all tabs/windows of the same origin.
- **Persistence:** Usually survives sessions, subject to user clearing, private-mode policies, partitioning, quota/eviction and browser settings; not durable backup.
- **Storage Limit:** Implementation/policy-dependent quota; handle access/write failures rather than assuming an available fixed capacity.
- **Accessible From:** JavaScript (`window.localStorage`).

### ✅ Advantages
- Persistent storage → useful for remembering settings or user preferences.
- Simple key-value API (`setItem`, `getItem`, `removeItem`, `clear`).
- No server round-trip → improves frontend performance for non-sensitive data.
- Same-origin tabs can access the applicable shared area; an application still needs synchronization/conflict handling.

### ❌ Disadvantages
- Vulnerable to **XSS attacks** → any JS code can access it.
- Not suitable for sensitive data (auth tokens, passwords).
- Synchronous API → can block the main thread for large data.
- Bounded storage and possible quota/permission failures.

---

## 2️⃣ SessionStorage

- **Scope:** Partitioned by origin and top-level browsing context; cross-origin iframes do not automatically share one storage area. An opener can initially copy a session area under relevant browser rules; it is not live shared-tab state.
- **Persistence:** Page-session storage, surviving reloads; browser session restoration can preserve it. Do not use tab closure as a security revocation guarantee.
- **Storage Limit:** Browser/policy-dependent; handle unavailable storage and failed writes.
- **Accessible From:** JavaScript (`window.sessionStorage`).

### ✅ Advantages
- Tab-scoped workflow data reduces accidental cross-tab draft mixing; it does not enforce authentication isolation.
- Simple API like LocalStorage (`setItem`, `getItem`).
- Useful for temporary state (e.g., wizard forms, unsaved drafts).

### ❌ Disadvantages
- Page-session lifetime is not a durable guarantee; closing/restoring behavior depends on the browser and policy.
- Still vulnerable to **XSS attacks**.
- Not shared across tabs → may require extra logic for multi-tab apps.
- Synchronous API → can block main thread with large data.

---

## ⚖️ Comparison Table

| Feature                  | LocalStorage        | SessionStorage       |
|---------------------------|------------------|-------------------|
| Lifetime                 | Persistent        | Tab/session only  |
| Scope | Same origin/storage partition | Origin plus top-level browsing context |
| Use Case                 | User preferences, settings | Temporary form data, session info |
| Shared Across Tabs        | ✅ Yes            | ❌ No             |
| Security Risk            | XSS               | XSS               |
| Storage Size Limit | Browser/policy dependent | Browser/policy dependent |
| Synchronous API          | ✅ Yes            | ✅ Yes             |

---

### 🧠 Best Practices
- **Never store sensitive data** (auth tokens, passwords) in LocalStorage or SessionStorage.
- Use an appropriate server session/secure HttpOnly cookie contract; in-memory client data is still accessible to running script and is not an XSS boundary.
- Prefer **SessionStorage** for temporary state within a tab.
- Treat stored strings as untrusted: validate the expected shape and render with safe text/context handling. Sanitize only when intentionally supporting HTML through a suitable policy; do not insert stored values into innerHTML.

---

> **Rule of Thumb:**  
> LocalStorage → persistent, non-sensitive data across sessions.  
> SessionStorage → temporary data tied to the current tab.

## Versioned draft recovery: explicit scope, expiry and partial data

A draft can legitimately be incomplete/invalid for final submission. Validate its storage shape/size separately from business rules, then revalidate every wizard step on restoration. Persist only a justified safe subset with explicit user opt-in when appropriate; do not dump the form/store or treat local data as authorized. Prefer server-owned drafts for sensitive records or cross-device recovery. This training fixture stores public course-edit fields only, never credentials/private note contents.

```js
// course-draft.js — storage codec; now is injectable for deterministic expiry tests.
export function decodeCourseDraft(raw, userId, now = Date.now()) {
  if (raw === null) return null;
  if (typeof raw !== 'string' || raw.length > 8192 || !Number.isFinite(now)) throw new Error('Invalid draft envelope');
  let value = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid draft');
  if (value.version === 1) { // An explicit former field-name migration.
    value = { ...value, version: 2, values: { title: value.subject, slug: value.slug, start: value.start, end: value.end } };
  }
  if (value.version !== 2) throw new Error('Unsupported draft version');
  if (typeof value.userId !== 'string' || !Number.isFinite(value.expiresAt)) throw new Error('Invalid draft scope');
  if (value.userId !== userId || value.expiresAt <= now) return null;
  if (value.expiresAt > now + 7 * 86400000) throw new Error('Invalid draft lifetime');
  if (!Number.isSafeInteger(value.baseVersion) || value.baseVersion < 1) throw new Error('Invalid record version');
  const fields = value.values;
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) throw new Error('Invalid draft values');
  for (const [key, max] of [['title', 100], ['slug', 80], ['start', 10], ['end', 10]]) {
    if (typeof fields[key] !== 'string' || fields[key].length > max) throw new Error('Invalid draft field');
  }
  return { baseVersion: value.baseVersion, values: { title: fields.title, slug: fields.slug, start: fields.start, end: fields.end } };
}
export function encodeCourseDraft(userId, baseVersion, values, now = Date.now()) {
  const raw = JSON.stringify({ version: 2, userId, baseVersion, expiresAt: now + 86400000,
    values: { title: values.title, slug: values.slug, start: values.start, end: values.end } });
  if (!decodeCourseDraft(raw, userId, now)) throw new Error('Draft could not be encoded');
  return raw;
}
```

The24-hour default and7-day maximum are exercise product policies, not browser/security guarantees. Device clocks can change; expiration is a usability/privacy bound here, not server authorization. Unknown/future schemas fail without silent downgrade. Extra properties/actions are projected away; bounded strings can still contain markup and must render as text. A restored baseVersion is compared to the current authorized server record; a mismatch needs review/rebase rather than overwriting newer work.

At the workflow owner, obtain sessionStorage inside try/catch after mount, use a key containing app/schema/user/resource scope (encode components), and offer Restore/Discard. Restore starts at details, retains partial strings and runs current validation; do not restore saving/done/error/authorization flags. Save bounded snapshots during normal editing with a modest debounce and flush policy, cancel the timer on disposal, and surface storage failures without claiming recovery is guaranteed. Do not perform an awaited save during beforeunload. Browser storage is synchronous and quota availability is not guaranteed.

Clear only the matching draft after confirmed server success or explicit discard. If a new edit can happen while save is in flight, do not clear a newer snapshot based on an old submission. LocalStorage read/compare/remove is not an atomic cross-tab transaction; use a transaction-capable store/server revision or isolated per-tab draft identity for stronger concurrency. Multiple tabs editing the same server resource still need the server version predicate. On logout/account change, dispose private work, remove scoped drafts per policy and never restore another user's payload.

**Exercise acceptance:** integrate this codec with the [worked multistep wizard](../React/complex-forms-and-data.md), test blank/partial values, v1 migration, v2 round-trip, malformed/future/oversized payloads, expiry boundary, other-user data, disabled/quota storage, restored version conflicts, two tabs and save-response ambiguity. Show Restore/Discard/recovery failure UI and associated validation errors; no token/private fields persisted. Native/browser/session-restoration behavior needs actual platform tests; a pure codec test does not prove end-to-end recovery.

Official references checked2026-10-21: [WHATWG Web Storage lifetime/scope/security](https://html.spec.whatwg.org/multipage/webstorage.html), [OWASP HTML5 storage risks](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html). Learner practice remains required.


## Reuse tested persistence owners, not just codecs

For access/read/write exceptions, serialization, migration and cross-tab events, use the [shared preference persistence owner](../React/React_state_management_and_tools.md) and [storage budget/recovery lesson](../General_ES6/Could_you_please_describe_with_which_Browser_APIs__177e8106c24d802caa88e9916f01fc53.md#browser-storage-budgets-and-recoverable-persistence). A storage event is not a database transaction or a guaranteed event in its writing tab; the owner rereads current state and suppresses echo writes. The [IndexedDB draft transaction lesson](../General_ES6/Browser_Storage_and_Offline_Drafts.md) provides commit/abort, migration, connection and local-revision conflict handling for structured data.

The course codec above is a different, scoped wizard example; do not create a competing persisted preference schema. **Acceptance:** exercise access denial, quota failure, malformed/future formats, migration, cached partial drafts and two-tab conflicts while preserving in-memory editing. Native quota/eviction/session restoration and cross-tab behavior remain unperformed until tested in the selected browsers. Neither shorter storage lifetime nor later clearing creates an XSS or authorization boundary.
