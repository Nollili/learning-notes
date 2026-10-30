# TypeScript catalogue: bug and feature reference

This small repository supports [bug fixing](../../../../ai-assisted-engineering/bug-fixing.md) and [feature development](../../../../ai-assisted-engineering/feature-development.md). It is separate from the chatbot and illustrates ordinary software work with an assistant.

Copy the complete directory into a learner project, then:

```sh
npm ci --ignore-scripts
npm run build
npm run test
```

The project pins TypeScript 5.9.3 and includes its lockfile. Build emits JavaScript to the ignored `build/` directory; test imports that actual output. Run build before test after changes. No real application, server, model or account is involved.

## Worked correction and feature

<<< ./src/catalogue.ts

`sortNotes` returns a new array with title/ID ordering. `listNotes` adds normalized substring filtering and a checked 0–50 limit, defaulting only undefined to ten. The typed record is not a decoder for arbitrary HTTP JSON; an endpoint needs its own external-input boundary. Sorting copies the array, not nested objects.

## Acceptance checks

<<< ./checks/catalogue.test.mjs

The frozen fixture catches in-place sorting. Other checks require exact IDs/order, normalized matching, no matches, preserved zero, invalid runtime options and the default bound. These are worked passing references, not historical failing-baseline evidence. Create a disposable broken candidate for the independent exercise, record the failure, then correct your own copy.

Build and checks were exercised on Node 24.18.0 on 2026-10-28. Separate temporary fault candidates using in-place sorting and a truthy zero-limit default compiled but failed the regression checks; the reference remained unchanged. Learner work and independent human review remain outstanding. The older [retry example](../index.md) remains part of the deeper course.
