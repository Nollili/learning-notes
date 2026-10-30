# First request and console chat {#_1-first-request-and-console-chat}

Your first goal is small: pass a question into a function, receive text, and display it. Run the offline example first. Then inspect the live adapter without enabling a paid call by accident.

## Run the worked example

Use Node 22 or newer. Copy the **whole** `docs/workbench/applied-ai/javascript` directory into a separate learner project. No dependency installation is needed for this starter. In that copied directory:

```sh
node --version
npm run build
npm run test
npm run console
```

`build` checks JavaScript syntax; it does not compile TypeScript or bundle an application. `test` includes a temporary loopback server, so your environment must permit local listening. Checks live in `checks/`, not a protected Autocode `src/tests` directory.

Ask `What is an API?`. The answer starts `[Offline simulation]`, echoes the question and reports zero previous turns. Ask another question: the count increases. Enter `/reset`, then `/exit`. This demonstrates **data flow**, not conversational intelligence.

## Find the model boundary

The console owns input/output and closes readline in `finally`. It calls:

```js
const text = await answer(input, previous, { config });
previous = nextHistory(previous, input, text);
console.log(text);
```

`answer` validates input, builds the request and selects the simulation or provider. `nextHistory` retains four complete user/assistant turns. Failed calls do not enter history. Read [the complete adapter](../../workbench/applied-ai/javascript/#model-adapter) after tracing these three lines.

A live request has a model identifier, application instructions, input messages and an output limit. The adapter makes one attempt with a deadline and bounds the response body. Connection failure, refusal and incomplete response are distinct from a successful answer.

## Optional: make one intentional live call

Use a provider/model you are authorized to access, verify its endpoint and choose a small experiment budget. A chat subscription does not itself configure API access. Select a model from your actual available options rather than an old course catalogue.

Copy `.env.example` to `.env` in your **learner copy**. Set `AI_MODE=openai`, `OPENAI_API_KEY` and `OPENAI_MODEL`. Keep the file private and ignored by Git. Run:

```sh
node --env-file=.env console.mjs
```

This adapter sends to OpenAI's public Responses endpoint. It is **not an EPAM DIAL adapter**: DIAL deployments, keys, VPN and API behavior require a separate implementation following your supplied template. Renaming an environment variable does not change providers.

The request uses `store: false`; that is not a promise of zero provider retention. Check your account policy before sending sensitive data. Local checks use fake transport data and cannot establish model access, quality or billing.

## Debug the first problems

| Symptom | Check |
|---|---|
| Script not found | You are in the copied starter, not the hub root |
| Always simulation text | `.env` needs the explicit `--env-file` launch and live mode |
| Live configuration rejected | Both key and model identifier are required |
| Provider unavailable | Account/model access, endpoint, limits and connectivity; never print a key or raw provider body |
| Console will not exit | Use `/exit`; preserve readline cleanup |

**Your exercise:** independently write a single-question script with an injected fake answer function. Return the result as well as displaying it. Check empty input and a rejected promise before adding a real provider.

**Done:** show actual offline output, explain the request fields and key location, and exit cleanly. [Next: chatbot inside an app](./chatbot.md).

API references checked 2026-10-28: [official quickstart](https://developers.openai.com/api/docs/quickstart) and [Responses reference](https://developers.openai.com/api/reference/resources/responses/methods/create). Recheck model capability for live work.
