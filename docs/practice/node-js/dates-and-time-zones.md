# Dates, Instants, Time Zones and Calendar Rules — practice

**Learner status: still required.** These tasks were separated from the textbook; no completion is credited.

[Textbook explanation](../../node-js/dates-and-time-zones.md) · [Node.js practice map](./index.md)

## Practice and failure diagnosis

**Acceptance:** execute the exact helpers and SQL above. Reject invalid leap days, impossible month/day/hour fields, offset-free instant input, unexpected precision and unsupported years. Prove2024-02-28 plus one calendar day becomes February29;2026's becomes March1. Arithmetic preserves its input object. Repeat under process TZ=UTC, Europe/Budapest and America/New_York: explicit-zone outputs and strict UTC/calendar helpers stay the same; demonstrate how an offset-free date-time changes its epoch under different process zones.

Test the two autumn instants independently rather than only their identical clock labels. Check the spring gap by displaying instants before/after it, and explain why this does not itself implement a local-time resolver.

Assert formatToParts hour/date/offset relationships, not locale punctuation. Record process.versions ICU/tz/runtime data with the test result. Exercise a23-hour and25-hour business-day range with events exactly on the inclusive start/exclusive next-start boundaries. Ensure DATE remains a date through the API/driver mapping rather than a browser-local midnight Date; inspect the chosen driver's mapping instead of assuming every driver returns the same type. Freeze/inject the wall clock for “now” rules, and keep duration measurements monotonic. Learner scheduling/appointment implementation remains required; these study examples do not establish production scheduling correctness.

References checked2026-10-21: [ECMAScript Date parsing](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.parse), [Intl DateTimeFormat specification](https://tc39.es/ecma402/#datetimeformat-objects), [Node internationalization/ICU](https://nodejs.org/download/release/v24.18.0/docs/api/intl.html), [PostgreSQL16 date/time types](https://www.postgresql.org/docs/16/datatype-datetime.html), [intervals and AT TIME ZONE](https://www.postgresql.org/docs/16/functions-datetime.html). The TC39 pages are living specifications; the execution baseline remains the actual Node24 runtime, not every feature in the latest draft.
