# How the company AI course fits your hub

The supplied **GenAI Practical Application Development using JavaScript** material is an external company learning path. The hub now uses its useful incremental progression while preserving stronger local validation, evaluation and recovery material. It is not a copy of the company's submission template.

## Map topics, not branch numbers

| Supplied company module | Beginner hub route | Further depth |
|---|---|---|
| OpenAI essentials: first call, roles, parameters, chat/history, tokens | [Orientation](./orientation.md) → [first request](./first-call.md) → [app chatbot](./chatbot.md) → [structured output](./structured-output.md) | Existing token, SDK, prompt and modality lessons |
| Embeddings and Pinecone | [RAG](./rag.md), JS-06 then optional JS-06B | Vector lifecycle, hybrid retrieval, filtering and evaluation |
| LangChain: prompts, parsers and RAG composition | Plain request/schema/retrieval composition first | LangChain.js as an optional adapter after the boundaries make sense |
| LangGraph: state, tools, search, memory, Calendar and HITL | [Tools](./tools-workflows.md) → [actual graph](./stateful-workflows.md) | Durable state, exact write approval and outcome recovery |
| MCP and A2A | [Actual local MCP](./mcp.md), then [optional A2A exercise](./extensions.md#learn-a2a-after-one-agent-works) | Existing MCP lifecycle/security references |

The other hub path, [AI for Software Development](../../ai-assisted-engineering/), teaches how to use an assistant for bugs, features, testing and PR preparation. It does not require completing the company AI-app course first.

## Preserve official submission requirements

Work in the exact company template/branch required by each actual assignment. The hub's JS-00–09 milestones are independent learning IDs, not replacements for those branches, exports or tests. Keep original configuration and provider/database settings. Never modify or add to `src/tests`; Autocode replaces that directory. Run the required build/test commands and Module 4 coverage where applicable. Only the user may push any changes.

The no-dependency hub starter uses a fixed public OpenAI Responses REST adapter. EPAM DIAL uses its supplied key, deployment, connectivity and API contract; implement that separately when the real assignment requires it. The offline reference uses no course credentials or internal services.

## Correct dated examples before adopting them

- Use the actual embedding output dimension and match the index. `text-embedding-3-large` defaults to 3072, with a supported explicit dimension override; 768 is not its default. [Official embeddings guide](https://developers.openai.com/api/docs/guides/embeddings).
- Use the pinned SDK's real graph methods. The new graph uses `addEdge`, `addConditionalEdges`, `compile`, `invoke`, `interrupt` and `Command`; illustrative `setEdges`/`connect`/`run` snippets are not its API. [Graph API](https://docs.langchain.com/oss/javascript/langgraph/graph-api), [interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts).
- State/checkpoints do not automatically supply context to an LLM or create durable memory in a RAM-only process.
- Ask for concise checkable explanations and evidence rather than hidden thought transcripts. [Reasoning guidance](https://developers.openai.com/api/docs/guides/reasoning-best-practices).
- Treat A2A as a named versioned protocol when that is the assignment. Ordinary same-process agent routing is a different mechanism. [A2A specification](https://a2a-protocol.org/v1.0.0/specification/).

References and supplied-material comparison checked 2026-10-28. Company account limits, VPN status, available deployments, exact Autocode tests and internal course access were not exercised here. Follow the current assignment and official API documentation when they differ from an illustrative e-book snippet.
