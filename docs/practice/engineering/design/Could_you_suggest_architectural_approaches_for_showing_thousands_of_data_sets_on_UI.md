# Practice: Could you suggest architectural approaches for showing thousands of data sets on UI?

**Learner status: outstanding.** Author verification does not complete these criteria.

Prerequisite: [the worked lesson](../../../senior_growth/EngX_Quality/Could_you_suggest_architectural_approaches_for_showing_thousands_of_data_sets_on_UI.md) and [the shared sequence](../index.md). Reuse the mapped existing project rather than build an application per note.

## Scope, observable acceptance and failure cases

**Page acceptance:** test empty/one/full/final pages, missing/expired/malformed cursor, equal timestamps, inserts/deletes between requests, rapid filters and failed next-page loads. Retain server query plan/call counts and client page/byte bounds. Explain offset/keyset choice and what consistency is promised. Actual DB/Query/browser tests remain required.

**Virtualization acceptance:** compare the same dataset with/without it, inspect mounted row count, heap/page retention and interaction traces. Test variable heights, prepend/eviction, font/viewport changes, RTL, zoom, keyboard scrolling and return navigation. Retain actual per-browser evidence; no measured FPS or accessibility conformance is supplied here.

**View acceptance:** round-trip public intent into URL/from URL with Unicode, percent/ampersand and missing/unknown fields, reject future schema, remove unavailable columns, reset cursor after filter change, and verify two users cannot read each other's saved view. No arbitrary sort expression reaches SQL.

**Chart acceptance:** confirm aggregate math/units/missing values, identical chart/table/filter data, meaningful nonvisual description and keyboard/touch interactions. Retain source/aggregation fixtures and real browser/screen-reader results. No chart-library or user benchmark is claimed here.

## Evidence

Record source/runtime/tool versions, prerequisites and input, expected versus actual behavior, at least one failure→fix→retest, commands/exit status and retained artifacts. Distinguish local/mocked/source checks from native browser, external-service and deployment results. Screen-reader, zoom, real-device and cross-engine checks remain open unless actually performed. No remote push or paid-service activation.
