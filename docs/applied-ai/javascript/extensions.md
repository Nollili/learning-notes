# Choose the next useful extension {#_8-choose-the-next-useful-extension}

Finish a small working chatbot and a checked tool before expanding the stack. Choose an extension because you can explain the problem it solves. There is no need to install every AI product to complete the beginner route.

## A practical tool map

| Need you can now recognize | First choice to investigate | What to compare |
|---|---|---|
| Repeated prompt/model/parser composition | LangChain.js, after plain functions work | Does the abstraction reduce your actual integration code and debugging cost? |
| Branching, interruptions and checkpoints | The pinned LangGraph.js lab | Does it improve your state/control representation? |
| Reusable capabilities across AI hosts | MCP | Does another host need discovery and access to your tool/resource? |
| Hosted semantic search | A Pinecone or database vector adapter | Quality, dimensions, current access, update/deletion and operating cost |
| Event-driven visual automation | [n8n](../n8n/) | Trigger ownership, credentials, retries, duplicate effects and deployment |
| Document/data tooling suited to Python | [Python deep dive](../../python-for-ai/) | Which concrete processing/integration task becomes easier? |

These are decision prompts, not claims that every package is needed or that each service was exercised here. Keep installed versions, provider features and costs in your own evidence record.

## Introduce Python when useful

Keep your JavaScript frontend and API while exploring a Python document-processing job or service. First learn its syntax/functions, typed records, environment management and async I/O through the retained [Python prerequisite order](../../python-for-ai/). Port one pure operation such as chunk normalization before introducing a second deployed service.

For example, let the Node app own users and chat, while a bounded Python worker extracts text from an approved file. Agree on input/output JSON, file size/type limits, deadlines and error vocabulary. Check malformed documents and cancellation. Python does not automatically make PDF parsing safe or accurate.

You can read the existing RAG, workflow and security explanations without completing a second language curriculum. Use the Python source when implementing that version, rather than translating every example just to keep two stacks synchronized.

## Learn A2A after one agent works

MCP connects a host to capabilities. **A2A** is a separate standardized protocol for communication between independent agent systems. An Agent Card describes identity, skills, interfaces and security requirements; messages/tasks describe work and outcomes. Calling another JavaScript function in the same graph is not evidence of A2A interoperability.

An optional exercise: run a public notes lookup agent and a separate glossary agent, publish their Agent Cards, and make a parent client discover/delegate to them using a pinned compatible SDK/specification. Use synthetic replies first. Retain discovery, message/task IDs, failed-agent behavior, deadlines and actual result routing. A capability card does not authorize access or make a peer's claims true. The current hub supplies this exercise design, **not an implemented A2A service**.

See the [official A2A specification](https://a2a-protocol.org/v1.0.0/specification/), reviewed 2026-10-28; select the version supported by your actual SDK rather than mixing examples across releases.

## Keep multimedia optional

Image generation, image understanding, transcription and text-to-speech are distinct tasks. Try one with synthetic content, an authorized model and a small budget. Record supported formats, size/duration limits, refusal/error behavior, output handling and deletion. Do not assume the model used for chat supports all modalities. [Prompting and modalities](../../python-for-ai/prompting-and-modalities.md) explains the existing deeper boundaries; no multimedia API run is claimed by the beginner workbench.

## Your final project choice

Choose **one**: improve the cited notes assistant, build a durable review workflow, connect a host to your MCP server, or implement a bounded n8n refresh integration. Keep a baseline and show one failure you fixed. Use [the practice milestones](../../practice/applied-ai/javascript-assistant.md) and the [software-development path](../../ai-assisted-engineering/) to investigate, implement, test and prepare the local handoff.

You have finished a meaningful increment when you can run it, explain it, diagnose a failure and state what remains untested. Reading all the optional links is not a prerequisite.
