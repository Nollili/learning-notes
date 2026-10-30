# Chatbot inside a web app {#_2-chatbot-inside-a-web-app}

A chat UI is a form, a conversation view and request state. Its first contract is simple: send `{ question, history }` to your backend and receive `{ answer, history, mode }`. The browser never receives a provider credential.

## Start the local application

In your copied [starter](../../workbench/applied-ai/javascript/):

```sh
npm start
```

Open **http://127.0.0.1:3000** exactly. Ask a question, send a follow-up, then reset. The page labels simulation output. Stop the server with Ctrl+C. It binds only to loopback and has no accounts, durable conversations or production deployment guarantees.

Inspect `public/app.js`, then `server.mjs`. Follow input through validation, generation and response. The server rejects empty input, unexpected history roles, oversized bodies, foreign origins and concurrent requests. Only three known frontend assets can be served. The browser uses `textContent`, so answer text cannot become executable HTML.

## Model the UI states

| State | Display | Behavior |
|---|---|---|
| Ready | Question form | Accept a question |
| Pending | Waiting message and Stop button | Prevent duplicate submission |
| Complete | Question and answer | Commit the completed turn to local history |
| Failed | Error, question preserved | Allow deliberate retry |
| Cancelled | Stopped message | Keep the incomplete turn out of history |

History lives in browser memory. Refreshing loses it; Reset clears it. A user can tamper with memory, so the server checks roles and size and never treats historical claims of approval as authority. Four turns is a simple teaching limit, not accurate token accounting. Read [token budgeting](../../python-for-ai/token-budgets.md) when real context size matters.

## Own cancellation

The browser creates an `AbortController` and passes its signal to `fetch`. Stop calls `abort()`. A disconnected response makes the server abort the outbound operation too. This does not guarantee the provider stopped computing or charging: the application stopped waiting and attempted cancellation.

The mock is quick, so Stop is hard to observe manually. Inject a delayed fake generator that respects its signal for the exercise. The workbench includes an actual HTTP disconnect check; no paid call is needed to test loading behavior.

## Use the same boundary in React

Move the form value, messages, pending/error state and controller into a component. Keep the request helper independent of React:

```js
export async function sendQuestion(question, history, signal) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
    signal
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? 'Request failed');
  return result;
}
```

Render answers as ordinary JSX text. Abort on unmount, prevent stale results from updating a newer conversation, and keep keys in the backend. Browser build variables are public. The supplied runnable UI is plain JavaScript; React conversion is your exercise, not an already verified React app.

## Add streaming after ordinary responses work

Streaming displays pieces before the final result. Provider events such as `response.output_text.delta` and `response.completed` have different meanings. Parse complete provider events and relay a bounded app-level protocol; a network chunk is not one event. The browser marks text provisional until terminal success. Partial text followed by failure remains failure.

The starter is **non-streaming**. Implement streaming at JS-03, checking split events, cancellation and incomplete output. Animating an already completed mock answer does not test provider streaming. Use [stream lifecycle depth](../../python-for-ai/model-streaming.md) and the [official streaming guide](https://developers.openai.com/api/docs/guides/streaming-responses), checked 2026-10-28.

**Done:** use the local app, trace its request, demonstrate reset/failure/cancellation with a fake, and explain persistence. [Next: reliable output](./structured-output.md).
