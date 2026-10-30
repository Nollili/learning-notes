# JavaScript AI starter workbench

This is the worked reference for [Build AI Apps — JavaScript First](../../../applied-ai/). It runs with Node 22+ and no third-party dependencies. Copy this entire directory into an owned learner project before experimenting. Do not modify an Autocode template's scripts or protected tests to match this separate fixture.

## Run it

```sh
npm run build
npm run test
npm run console
```

Use `/reset` and `/exit` in the console. Run `npm start` for the browser app at **http://127.0.0.1:3000**; stop with Ctrl+C. `npm run demo` demonstrates checked objects/tools, lexical retrieval and proposal-only review. The starter has no install step and therefore no dependency lockfile.

Default mode is an explicit offline simulation. For an intentional live experiment, copy `.env.example` to a private `.env`, set `AI_MODE=openai`, `OPENAI_API_KEY`, `OPENAI_MODEL`, then run `node --env-file=.env console.mjs` or `node --env-file=.env server.mjs`. The key and model are read only on the server. Never put a key in browser code. Live requests go only to the fixed OpenAI Responses endpoint; DIAL is a separate adapter.

## What the reference demonstrates

| Supplied and inspectable | Learner extension, not already complete |
|---|---|
| Console, validated HTTP backend, browser form and bounded history | Authenticated users, persisted chat and deployment |
| Complete response, failures, busy state and cancellation | Provider streaming and a React conversion |
| Small Responses REST adapter with fake transport checks | Actual account/model access, model quality and billing |
| Classification/quote checks over synthetic outputs | A generated classifier with representative evaluation |
| Allowed tool dispatch and proposal-only review | A model-selected tool loop and any approved write |
| Three public notes and lexical ranking | Full RAG composition, real embeddings and hosted vector storage |

The optional sibling [SDK integrations](../javascript-integrations/) add actual local MCP and LangGraph examples after their lessons. They are not dependencies of this starter.

## Model adapter

<<< ./model.mjs

The adapter uses one attempt, a 20-second outbound timeout, a response-body bound and a configured output limit. It checks completion/refusal and extracts text from raw REST output items. SDK-only convenience properties should not be assumed on a raw HTTP response. `store: false` is not a zero-retention guarantee. Caller history is untrusted and never includes accepted developer/system roles.

## Pure boundaries and fixture data

<<< ./core.mjs

The history limit counts turns/characters, not tokens. Lexical matching is a small English baseline, not a production tokenizer or semantic search model. Exact quote membership is necessary for this fixture but does not prove claim support. A reviewed proposal still has no effect.

## HTTP server

<<< ./server.mjs

The server binds to loopback, validates the expected host/origin for requests that can trigger generation, allows one active generation and serves fixed assets. This is not an authenticated production service or a global cost limiter. A local process can still call it. No provider credentials should be configured on a shared/untrusted machine without an appropriate access boundary.

## Browser controller

<<< ./public/app.js

The browser displays plain text, bounds visible entries and retains only completed turns. The UI is non-streaming. For a React implementation, retain the same request/state/cancellation boundary instead of moving provider access into the component.

## Meaningful checks

<<< ./checks/app.test.mjs

These checks cover forbidden history roles, complete-turn trimming, invalid tools, proposal immutability, absent retrieval evidence, quote rejection, no network in mock mode, provider serialization/error/body limits, real loopback input/origin/static-asset checks, concurrent admission and disconnect cancellation. They do not establish native browser interaction or live provider quality.

Source syntax and local checks were exercised on Node 24.18.0 on 2026-10-28; see [the redesign verification record](../../../applied-ai/javascript/verification.md) for exact observations and remaining gaps. All independent [learner milestones](../../../practice/applied-ai/javascript-assistant.md) remain outstanding.
