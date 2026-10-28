# Typed Tool Arguments, Authorization and Results — practice

**Learner status: still required.** These requirements were separated from the textbook. Use the [integrated sequence](../index.md) and shared evidence record; running reference checks is not independent completion.

[Textbook](../../../python-for-ai/tool-boundaries.md)

## Practice and acceptance

Run strict typing, inspect the exact definition schema and test valid/current success; unknown name; missing/extra/coerced/invalid ID; duplicate keys; scalar/nested/non-JSON/invalid-Unicode/over-budget input; same-tenant allowed/denied and foreign tenant; missing/mismatched record; explicit store outage; unexpected programmer error; malicious source instructions;500-character prefix/truncation and Unicode bounds. Assert rejected arguments/unknown tools cause zero reads, unauthorized results contain no protected text or metadata, and outage is distinct from unavailable.

Build a separate fake-model loop only after these tests pass. Supply a call asking for a foreign source, an extra tenant argument and an unknown tool; no model output may choose the principal or execute a fallback. Test correct call_id/result association, repeated calls, malformed/partial arguments and exhausted loop budget. Then add a reviewed real provider run if authorized, recording model/schema/tool versions and task outcomes. Full loop transport, durable authorization race, real provider quality and learner implementation remain required. Later write tools require an additional idempotency/confirmation/recovery contract; read-only success is not permission to implement them ad hoc.
