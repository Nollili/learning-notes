# JavaScript-first AI redesign: verification and limits

Update: **2026-10-28**. This records author verification of the new course material, not completion of learner practice.

## Changes and ownership

- The selector distinguishes **Build AI Apps — JavaScript First** from **AI for Software Development**.
- Nine beginner app lessons cover orientation, first request, app chatbot, schemas, tools, RAG, MCP, stateful workflows and extensions. [Company mapping](./company-course.md) preserves the difference from official Autocode assignments.
- Seven beginner development lessons cover context, bug fixing, features, debugging/testing, review/PR preparation, reusable tools and coordination. The previous four engineering lessons remain linked as depth.
- Existing Python, RAG/workflow/n8n and workbench sources remain available at their original URLs. Python is now an optional implementation route, not a first-chatbot prerequisite.
- [JS-00–09](../../practice/applied-ai/javascript-assistant.md) and [DEV-01–05](../../practice/engineering/ai-engineering/development-project.md) are independent practice; earlier P-IDs remain intact.

## Executable references

| Collection | Verification scope |
|---|---|
| Dependency-free JavaScript starter | Syntax build, pure/fake-provider checks and real loopback HTTP tests; demo of validated synthetic objects, dispatch, lexical retrieval and proposal review |
| JavaScript SDK integrations | Syntax build; actual MCP SDK stdio child discovery/tool/resource/prompt/error/close checks; actual LangGraph accept/reject interruption/resume and separate RAM threads |
| TypeScript catalogue | Strict TypeScript build; emitted-JS tests for non-mutating sort, title/ID ties, normalized query, sort-before-limit, zero/invalid limits and empty/default results |

Runtime used: Node **24.18.0**. MCP SDK **1.32.2**, LangGraph.js **1.5.3**, Zod **3.25.76**, TypeScript **5.9.3** are pinned in their respective new integration/feature projects with lockfiles. Dependency installs used disabled lifecycle scripts. The starter needs no dependency install. Current API/framework docs were checked before writing the integration examples.

The sandbox initially denied loopback listening; the permitted rerun exercised the real HTTP checks. A graph candidate using a scalar false resume payload failed in the installed package; the fixture now uses and validates `{ approved: boolean }`, and both branches are checked. The first lexical demo exposed a stop-word false positive; the baseline now removes a small fixed stop-word list and keeps that question as a regression case. This does not make it semantic search.

## Intentionally separate observations

No real model, API key, DIAL account, Pinecone index, Calendar, Tavily, A2A service, paid multimedia endpoint, n8n engine or remote MCP host was invoked. Optional provider code was checked with fake transport responses. No model-quality, production-authentication, durable-conversation or remote-write guarantee follows.

The browser starter is plain JavaScript and non-streaming. React conversion, stream parsing/terminal states, model-selected tools, generated cited RAG and hosted vector adapters are explicitly learner projects. The MCP fixture is local stdio; the graph has RAM state and performs no write. A synthetic review payload is not authenticated human approval.

Documentation build and browser observations are recorded below. The older whole-hub inventory remains a dated snapshot; this update does not relabel its counts as current or rerun every retained Python project.

## Final checks

- Console smoke check: interactive question, `/reset` and `/exit` completed in offline mode with the readline resource closed.
- Starter: `npm run build`, `npm run test` (7 tests) and `npm run demo` passed after the lexical correction. Real HTTP tests used temporary loopback ports and closed their servers.
- SDK integrations: `npm run build` and `npm run test` passed, exercising actual MCP stdio and LangGraph branches rather than replacing them with mocks.
- Catalogue: strict `npm run build` and `npm run test` (4 tests) passed. In separate temporary copies, both a zero-limit fault and in-place-sort fault built successfully but were rejected by the meaningful checks; the reference source was not changed by those experiments.
- VitePress production build passed with the output directed to a temporary directory, preserving the pre-existing generated `dist` changes. The first build exposed duplicate sidebar keys, corrected before final verification; the existing large-bundle advisory is separate from content/link failures.
- Browser observations at the available narrow preview size: the learning-path menu shows both distinct AI names; selecting the development path opens its matching overview; the beginner orientation and ordered sidebar render. The offline chatbot displayed a first answer, a follow-up with one previous turn, literal script-like text and a successful Reset. Manual delayed-Stop and provider streaming were not exercised in that browser session; HTTP disconnect cancellation is covered by the automated check.

The local hub preview is for review, not deployment. No remote push or publication was performed. No independent learner milestone is marked complete.
