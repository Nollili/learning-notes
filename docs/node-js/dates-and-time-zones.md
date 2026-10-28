# Dates, Instants, Time Zones and Calendar Rules

Use this lesson for JavaScript/TypeScript and PostgreSQL boundaries. The executable baseline is Node24 with its installed ICU/time-zone data and PostgreSQL16. A date bug is often a domain-model bug: first decide what the value means, then choose parsing, storage, arithmetic and display rules.

## Four different values

| Domain value | Example | Appropriate representation |
|---|---|---|
| Instant on a timeline | Request accepted at a precise moment | UTC timestamp/epoch; PostgreSQL timestamptz |
| Calendar date | Birthday, invoice due date | Validated YYYY-MM-DD; PostgreSQL date |
| Local date and time | Appointment requested for09:00 | Calendar/time fields plus the intended zone and resolution policy |
| Elapsed duration | Timeout of500ms | Numeric elapsed units; monotonic clock for measurement |

An offset such as +02:00 identifies one displacement from UTC; Europe/Budapest identifies a rule set that can use different offsets across dates. TIMESTAMPTZ preserves the instant, not the original IANA zone or original offset. Store the zone separately when future local-time intent matters. A birthday is not midnight UTC: converting it to another zone can move it onto the previous date.

JavaScript Date stores epoch milliseconds and has no per-instance IANA zone. Local getters/setters use the runtime's zone; UTC getters/setters use UTC. A Date is mutable, and invalid dates hold NaN. PostgreSQL can retain microseconds, so converting through Date loses precision; keep exact text for cursor ordering as in [cursor pagination](./cursor-pagination.md).

## Define narrow input contracts

Do not use Date.parse as a permissive validator for arbitrary human-entered text. Nonstandard strings can be implementation-dependent; ambiguous day/month order is a product input problem. Standard date-only text is interpreted as UTC, while a standard date-time without an offset is local time. Neither behavior makes an offset-free timestamp suitable for a cross-system instant contract.

<<< ../workbench/node-js/runtime/dates/date-boundaries.ts

These contracts accept years1000–9999 and UTC instants with exactly three fractional digits. Rejecting other legitimate ISO forms is intentional input policy, not a claim those forms are invalid standards. If an API accepts offsets or microseconds, implement and test that broader grammar without silently truncating. Round-trip validation catches normalized impossible dates such as February30. The calendar helper handles leap days and month/year boundaries; adding months requires a separate clamp/reject/rollover policy. January31 plus one month has no universal business answer.

Use Date.now for wall-clock timestamps, not reliable elapsed timings: clock synchronization can move wall time. Use performance.now or process.hrtime.bigint for duration measurement within the same process; monotonic readings are not portable persisted instants.

## Format explicitly with Intl

<<< ../workbench/node-js/runtime/dates/zoned-display.ts

Construct and reuse formatters for a bounded set of validated locale/zone preferences. Invalid locale/zone options can throw RangeError; handle that at the preference boundary and choose an explicit fallback. Do not use an unbounded formatter cache keyed by arbitrary caller strings. Locale support can fall back, so inspect supportedLocalesOf/resolvedOptions when the product requires particular locales. Default-zone formatting on the server can disagree with the browser; pass an explicit display zone and preserve it for server/client rendering.

Intl is a display API, not a parser for its own formatted output and not an inverse resolver from local clock fields to an instant. Punctuation, spaces and names can change with ICU/locale data. Assert formatToParts fields for semantic tests rather than hard-code one full localized sentence. Record Node/ICU/tz versions for reproducibility and update time-zone data when legal rules change.

## Daylight-saving gaps and repeated times

For the installed Europe/Budapest rules in2026:

- On March29 the local clock jumps from02:00 to03:00. Local02:30 does not exist.
- On October25 the local02:00–02:59 interval repeats. Local02:30 can mean00:30Z (summer offset+02) or01:30Z (standard offset+01).

<<< ../workbench/node-js/runtime/dates/dst-cases.ts

Expected hours: springBefore01, springAfter03; both autumn values02 with different offset parts. Noon on March28 plus24 elapsed hours is13:00 on March29, not local noon. The two local noons are23 elapsed hours apart. Across the autumn transition they can be25 hours apart. A “daily09:00” rule and “every24 hours” are different schedules.

For user-entered appointments, explicitly choose what happens to nonexistent times (reject, shift or skip) and repeated times (ask the user, choose earlier or choose later). Record the selected instant and zone; retain local intent/rule version where rescheduling or audit requires it. Do not pretend splitting a string, formatting to parts or calling local Date setters implements arbitrary IANA-zone resolution. Use a maintained zone-aware resolver when that feature is required.

Temporal can offer explicit plain/instant/zoned types and disambiguation, but verify runtime availability and the selected implementation before adopting it; the primary examples here require only Date/Intl. No mastery of several competing date libraries is required.

## PostgreSQL boundary and calendar intervals

TIMESTAMPTZ input with an explicit offset resolves an instant. Its display uses the session zone. TIMESTAMP WITHOUT TIME ZONE is a local date-time label; converting it to TIMESTAMPTZ requires a zone/policy. PostgreSQL's implicit resolution of an ambiguous local time is not an adequate substitute for a product disambiguation decision.

```sql
BEGIN;
SET LOCAL TIME ZONE 'Europe/Budapest';
SELECT
  timestamptz '2026-10-25 02:30:00+02' AT TIME ZONE 'Europe/Budapest' AS first_local,
  timestamptz '2026-10-25 02:30:00+01' AT TIME ZONE 'Europe/Budapest' AS second_local,
  EXTRACT(EPOCH FROM (
    timestamptz '2026-10-25 02:30:00+01' - timestamptz '2026-10-25 02:30:00+02'
  )) AS apart_seconds;
SELECT
  EXTRACT(EPOCH FROM ((timestamptz '2026-03-28 12:00:00+01' + interval '1 day')
                    - timestamptz '2026-03-28 12:00:00+01')) AS calendar_day_seconds,
  EXTRACT(EPOCH FROM ((timestamptz '2026-03-28 12:00:00+01' + interval '24 hours')
                    - timestamptz '2026-03-28 12:00:00+01')) AS elapsed_day_seconds;
ROLLBACK;
```

The repeated local labels both show2026-10-25 02:30 but their instants differ by3600 seconds. Spring calendar-day arithmetic in this explicit session zone yields82800 seconds;24 hours yields86400. Session zone is a dependency of calendar operations, not a harmless display setting. Use DATE plus integer days for plain date arithmetic, and explicit zones for business-calendar operations. A database pool can reuse sessions; transaction-local settings prevent an accidentally persistent test zone from leaking into unrelated work.

For user-day reports, derive the start and next calendar-day boundary in the intended zone, then query `instant >= start AND instant < nextStart`. Do not assume the range is always24 hours, and do not use an inclusive23:59:59.999 endpoint that loses finer precision. Keep the timestamp column unwrapped in range predicates when that enables the intended index. Choose tenant/business zone explicitly rather than depend on whichever server received the request.

## Practice and failure diagnosis

[Exercises and learner checklist](../practice/node-js/dates-and-time-zones.md).
