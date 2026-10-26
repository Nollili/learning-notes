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

```ts
// date-boundaries.ts — deliberately narrow study contracts
export function parseUtcInstant(value: unknown): Date {
  if (typeof value !== 'string' ||
      !/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/.test(value)) {
    throw new Error('Expected UTC instant with milliseconds');
  }
  const result = new Date(value);
  if (!Number.isFinite(result.getTime()) || result.toISOString() !== value) {
    throw new Error('Invalid UTC instant');
  }
  return result;
}
export function parseCalendarDate(value: unknown): string {
  if (typeof value !== 'string' || !/^[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}$/.test(value)) {
    throw new Error('Expected calendar date');
  }
  const result = new Date(value + 'T00:00:00.000Z');
  if (!Number.isFinite(result.getTime()) || result.toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid calendar date');
  }
  return value;
}
export function addCalendarDays(value: string, days: number): string {
  parseCalendarDate(value);
  if (!Number.isSafeInteger(days) || Math.abs(days) > 36600) throw new Error('Invalid day count');
  // UTC is a calculation device for a plain Gregorian date, not an appointment's zone.
  const result = new Date(value + 'T00:00:00.000Z');
  result.setUTCDate(result.getUTCDate() + days);
  return parseCalendarDate(result.toISOString().slice(0, 10));
}
export function addElapsedMilliseconds(value: Date, milliseconds: number): Date {
  if (!Number.isFinite(value.getTime()) || !Number.isSafeInteger(milliseconds)) {
    throw new Error('Invalid elapsed arithmetic');
  }
  const result = new Date(value.getTime() + milliseconds);
  if (!Number.isFinite(result.getTime())) throw new Error('Instant outside supported range');
  return result; // Never mutate the caller's Date.
}
```

These contracts accept years1000–9999 and UTC instants with exactly three fractional digits. Rejecting other legitimate ISO forms is intentional input policy, not a claim those forms are invalid standards. If an API accepts offsets or microseconds, implement and test that broader grammar without silently truncating. Round-trip validation catches normalized impossible dates such as February30. The calendar helper handles leap days and month/year boundaries; adding months requires a separate clamp/reject/rollover policy. January31 plus one month has no universal business answer.

Use Date.now for wall-clock timestamps, not reliable elapsed timings: clock synchronization can move wall time. Use performance.now or process.hrtime.bigint for duration measurement within the same process; monotonic readings are not portable persisted instants.

## Format explicitly with Intl

```ts
// zoned-display.ts
export function makeDateDisplay(locale: string, timeZone: string) {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone, calendar: 'gregory', numberingSystem: 'latn',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'shortOffset',
  });
  return {
    text(instant: Date): string { return formatter.format(instant); },
    parts(instant: Date): Record<string, string> {
      return Object.fromEntries(formatter.formatToParts(instant)
        .filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
    },
    resolved: formatter.resolvedOptions(),
  };
}
```

Construct and reuse formatters for a bounded set of validated locale/zone preferences. Invalid locale/zone options can throw RangeError; handle that at the preference boundary and choose an explicit fallback. Do not use an unbounded formatter cache keyed by arbitrary caller strings. Locale support can fall back, so inspect supportedLocalesOf/resolvedOptions when the product requires particular locales. Default-zone formatting on the server can disagree with the browser; pass an explicit display zone and preserve it for server/client rendering.

Intl is a display API, not a parser for its own formatted output and not an inverse resolver from local clock fields to an instant. Punctuation, spaces and names can change with ICU/locale data. Assert formatToParts fields for semantic tests rather than hard-code one full localized sentence. Record Node/ICU/tz versions for reproducibility and update time-zone data when legal rules change.

## Daylight-saving gaps and repeated times

For the installed Europe/Budapest rules in2026:

- On March29 the local clock jumps from02:00 to03:00. Local02:30 does not exist.
- On October25 the local02:00–02:59 interval repeats. Local02:30 can mean00:30Z (summer offset+02) or01:30Z (standard offset+01).

```ts
// dst-cases.ts — import helpers from the preceding modules
import { parseUtcInstant, addElapsedMilliseconds } from './date-boundaries.js';
import { makeDateDisplay } from './zoned-display.js';
const budapest = makeDateDisplay('hu-HU', 'Europe/Budapest');
export const springBefore = budapest.parts(parseUtcInstant('2026-03-29T00:30:00.000Z'));
export const springAfter = budapest.parts(parseUtcInstant('2026-03-29T01:30:00.000Z'));
export const autumnFirst = budapest.parts(parseUtcInstant('2026-10-25T00:30:00.000Z'));
export const autumnSecond = budapest.parts(parseUtcInstant('2026-10-25T01:30:00.000Z'));
const noonBeforeSpring = parseUtcInstant('2026-03-28T11:00:00.000Z');
export const after24Hours = budapest.parts(addElapsedMilliseconds(noonBeforeSpring, 86400000));
```

Expected hours: springBefore01, springAfter03; both autumn values02 with different offset parts. Noon on March28 plus24 elapsed hours is13:00 on March29, not local noon. The two local noons are23 elapsed hours apart. Across the autumn transition they can be25 hours apart. A “daily09:00” rule and “every24 hours” are different schedules.

For user-entered appointments, explicitly choose what happens to nonexistent times (reject, shift or skip) and repeated times (ask the user, choose earlier or choose later). Record the selected instant and zone; retain local intent/rule version where rescheduling or audit requires it. Do not pretend splitting a string, formatting to parts or calling local Date setters implements arbitrary IANA-zone resolution. Use a maintained zone-aware resolver when that feature is required. Temporal can offer explicit plain/instant/zoned types and disambiguation, but verify runtime availability and the selected implementation before adopting it; the primary examples here require only Date/Intl. No mastery of several competing date libraries is required.

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

**Acceptance:** execute the exact helpers and SQL above. Reject invalid leap days, impossible month/day/hour fields, offset-free instant input, unexpected precision and unsupported years. Prove2024-02-28 plus one calendar day becomes February29;2026's becomes March1. Arithmetic preserves its input object. Repeat under process TZ=UTC, Europe/Budapest and America/New_York: explicit-zone outputs and strict UTC/calendar helpers stay the same; demonstrate how an offset-free date-time changes its epoch under different process zones. Test the two autumn instants independently rather than only their identical clock labels. Check the spring gap by displaying instants before/after it, and explain why this does not itself implement a local-time resolver.

Assert formatToParts hour/date/offset relationships, not locale punctuation. Record process.versions ICU/tz/runtime data with the test result. Exercise a23-hour and25-hour business-day range with events exactly on the inclusive start/exclusive next-start boundaries. Ensure DATE remains a date through the API/driver mapping rather than a browser-local midnight Date; inspect the chosen driver's mapping instead of assuming every driver returns the same type. Freeze/inject the wall clock for “now” rules, and keep duration measurements monotonic. Learner scheduling/appointment implementation remains required; these study examples do not establish production scheduling correctness.

References checked2026-10-21: [ECMAScript Date parsing](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.parse), [Intl DateTimeFormat specification](https://tc39.es/ecma402/#datetimeformat-objects), [Node internationalization/ICU](https://nodejs.org/download/release/v24.18.0/docs/api/intl.html), [PostgreSQL16 date/time types](https://www.postgresql.org/docs/16/datatype-datetime.html), [intervals and AT TIME ZONE](https://www.postgresql.org/docs/16/functions-datetime.html). The TC39 pages are living specifications; the execution baseline remains the actual Node24 runtime, not every feature in the latest draft.
