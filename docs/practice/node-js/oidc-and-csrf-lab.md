# OIDC Login Transactions and Signed CSRF Tokens — practice

**Learner status: still required.**

[Textbook](../../node-js/oidc-and-csrf-lab.md) · [Practice map](./index.md)

Build the shared PostgreSQL transaction adapter and wire the flow into a disposable copy of the runnable application. Acceptance: two parallel callbacks yield one local session; the wrong browser cannot consume the correct transaction; expiry, provider denial and lost exchange response require a new start; session regeneration invalidates old login and CSRF credentials. Check exact configured redirect and current local account disablement. For the double-submit alternative, separately prove missing/duplicate/malformed/tampered/cross-session tokens fail and that cookie injection cannot forge a valid HMAC. Test the actual cookie parser and HTTPS browser behavior, not only the pure function.
