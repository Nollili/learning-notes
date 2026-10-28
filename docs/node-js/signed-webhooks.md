# Verify signed webhooks before applying effects

A webhook is an untrusted HTTP request until the integration's authentication contract is verified. HMAC proves knowledge of a shared secret and protects signed bytes; it is not encryption and does not prove the sender's business data is true. Use a maintained provider SDK when integrating a real provider. This worked protocol is deliberately local: it is not compatible with Stripe's header format or any other provider by analogy.

## Define the protocol and persistence boundary

Node24/Express5.3/Zod4.6/pg8.23/PostgreSQL16. A trusted catalogue provider sends one each of `X-Hook-Key`, `X-Hook-Time` and `X-Hook-Signature`, plus an application/json body. The key ID selects a deployment-owned active key; it is not a URL or path. Time is exactly10 decimal Unix seconds. The signature is lowercase hex HMAC-SHA256 over the ASCII timestamp, a dot and **the exact raw request bytes**. Reject a timestamp more than300seconds in the past or future; synchronize server clocks and monitor skew. The body limit is16KiB with compression disabled. Rate/concurrency/header limits belong at ingress too.

The event schema is `{id: UUID, kind: 'catalogue.updated', entity: UUID}`. A fixed integration owns its own authorized catalogue scope. In a multi-tenant integration resolve provider/account→tenant through server configuration and include that tenant in effect queries; never accept arbitrary signed tenant IDs as global authority. The small effect table below models a local projection only.

Source in `docs/workbench/node-js/security/webhook-lab/webhook.mjs`:

<<< ../workbench/node-js/security/webhook-lab/webhook.mjs

Copy this into an isolated ESM exercise, install the pinned dependencies and execute `schema` in a disposable database. Generate each key with `randomBytes(32)`; load real keys from a secret manager and never commit/print them. Instantiate `webhookApp(pool, new Map([['current',key]]))`, listen on loopback, and close the HTTP server and bounded pool when done. Set connection/statement deadlines, as in the other PostgreSQL labs. Mount this raw parser before any global JSON parser at the webhook route. `JSON.stringify(JSON.parse(body))` is not the original signed byte sequence: whitespace and key order can change it.

Verification rejects missing/duplicate signature headers before framework header collapsing can hide ambiguity, unknown key IDs, malformed hex, stale/future timestamps and invalid signatures. `timingSafeEqual` is used only with equal-length decoded digests; surrounding parsing/lookup is not promised constant-time. Verify before interpreting JSON, then require the runtime event schema. Return only fixed errors; never echo signatures, body text, keys or raw database errors. A generic parser415/413 is separate from authentication401; validly signed invalid business JSON is400.

## Rotation, duplicates and recovery

During rotation keep current and previous trusted keys for a bounded overlap agreed with the provider, then remove the previous key and monitor failure categories. A request-selected key ID cannot add a key. Emergency revocation may deliberately break old retries. Use a different secret per integration/environment; a global shared secret expands the blast radius. If the provider's official SDK signs a different timestamp/header structure, follow that exact contract instead of reusing this example.

A timestamp window blocks old captured packets; it does not prevent two copies within the window or a provider retry signed with a fresh timestamp. A durable `(source,eventID)` receipt is therefore inserted in the same PostgreSQL transaction as the projection effect. Concurrent duplicates wait on uniqueness and return204 without a second effect. Reusing the same ID with different bytes returns409 for investigation. This byte-level identity intentionally treats semantically equal but differently serialized bodies as conflicts; a real provider contract may require a validated semantic identity instead.

If commit succeeds and the response is lost, the provider retries; the receipt makes the local effect safe. If the transaction fails, it rolls back and503 permits bounded provider retry. Acknowledging before the durable commit loses work. For an external email/payment, persist an outbox intent in this transaction, return quickly and let an idempotent worker execute/reconcile it. Do not claim this local transaction covers an external network effect.

Keep receipts at least as long as the provider's documented event-ID replay/redelivery horizon and your restoration window; unlimited receipt retention is simple but needs a budget. Deleting receipts blindly after300seconds defeats long-lived ID deduplication.

A webhook path is not a browser cookie endpoint and normally uses its provider signature instead of browser CSRF. Do not globally disable CSRF on unrelated routes. Restrict accepted provider integrations, current business authority, TLS, request budgets and alerts separately. A provider IP allowlist can be defense in depth; it is not signature verification.

## Run the checks, then extend the integration

The persisted `webhook-lab/check.mjs` recreates only its study tables and requires `STUDY_DATABASE_URL` pointing to a disposable database. Run it from an isolated directory beside `webhook.mjs`. It starts a loopback HTTP server and closes that server/pool.

**Actually checked2026-10-26:** successful request; repeated/concurrent delivery with one effect per event; altered raw whitespace with old signature rejected; past/future301second skew rejected; valid previous key during overlap then rejected after removal; unknown key denied; signed malformed JSON400; same-ID/different-body409. These are real HTTP/PostgreSQL checks, not a real provider delivery or TLS deployment. No live provider account was used.

[Related practice](../practice/node-js/signed-webhooks.md).

Official references checked2026-10-26: [Stripe raw-body signature guidance](https://docs.stripe.com/webhooks/signature), [Node HMAC/timing-safe comparison](https://nodejs.org/api/crypto.html), [PostgreSQL uniqueness and ON CONFLICT](https://www.postgresql.org/docs/16/sql-insert.html). Stripe is an authoritative example of provider-specific raw-body requirements, not this fixture's protocol.
