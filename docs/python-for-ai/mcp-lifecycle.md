# MCP errors, cancellation and compatibility

Use the same locked Python3.13.11/MCP2.3.0 lab as [the primitives](./mcp-primitives.md). Error classification, resource lifetime and protocol compatibility need observable checks, not just a successful happy-path call.

## Classify failure before recovery

| Boundary | Example | Host response |
|---|---|---|
| HTTP/token policy | Missing/expired/wrong-audience token, absent scope | Handle401/403 according to the owned auth flow; do not ask a model to invent a token |
| Protocol request | Explicit unsupported request/capability/version | Surface a safe structured protocol failure; negotiate/fallback only under a reviewed compatibility policy |
| Tool operation | Authorized read unavailable or invalid tool arguments | Inspect `is_error`; preserve a safe message and offer bounded appropriate recovery |
| Transport/deadline | Connection closes or caller stops waiting | Record failed versus unknown outcome; close owned resources and avoid blind write retries |
| Unexpected defect | Driver/program exception | Project a safe error externally; retain a redacted diagnostic code internally and investigate |

In this SDK, expected tool-operation failures can raise `ToolError` with an intentionally public message. Do not return a string saying “error” while leaving the result successful. `MCPError` produces a protocol error and forwards its supplied code/message/data: never include raw private exception text. Unexpected exception sanitization and logging differ by SDK/version/configuration; the application still owns secret-safe logs. A client must narrow result content types and validate structured output even when `is_error` is false. [Official error handling](https://py.sdk.modelcontextprotocol.io/servers/handling-errors/) documents the two explicit paths.

Do not automatically retry every tool failure: a denied/missing record is not transient; argument repair needs a bounded attempt count; authentication recovery is an owned flow; a timed-out write can already have committed. Use exact idempotency/recovery contracts from [approved writes](./approved-writes.md). Protocol error codes should come from observed/pinned behavior and the documented contract, not assumptions about a generic exception name.

## Cancellation owns work, not just waiting

Cancellation must reach the handler and its downstream I/O. A caller that abandons a promise without cancelling the owned work leaves resource use behind. Async handlers should release resources in `finally` and let cancellation propagate. With AnyIO cancellation scopes, cleanup that awaits needs bounded shielding: protect the cleanup, give it its own finite budget and report incomplete cleanup rather than blocking forever.

A synchronous `def` handler can run in a thread; cancellation does not forcibly stop arbitrary thread work. Cooperative checkpoints between bounded units and explicit downstream budgets remain necessary. Nor does cancellation reverse an already committed database/API write. Keep separate states for “cancel requested,” “handler stopped,” “cleanup complete” and “effect outcome known.”

**Version-sensitive caveat:** SDK2.3's modern HTTP `json_response=True` mode does not propagate client abandonment to the handler; legacy `stateless_http=True` has a related limitation. The short auth fixture uses JSON responses for middleware tests, not long-running cancellation. Use a cancellation-capable transport/mode for interactive long calls and still bound downstream work. The [official cancellation guide](https://py.sdk.modelcontextprotocol.io/handlers/cancellation/) explains async cleanup, thread checkpoints and transport settings.

## Executed error/cancellation/legacy fixture

Copy the repository lab `docs/python-for-ai/mcp-lab/` into an owned directory, run `uv sync --locked`, then `uv run --locked python check_lifecycle.py`. The direct AnyIO dependency is now recorded explicitly in its lock/manifest.

```python
import asyncio
import anyio
from contextlib import suppress
from mcp import Client, MCPError
from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from mcp.types import TextContent

async def check() -> None:
    server = MCPServer('Owned lifecycle fixture')
    started = asyncio.Event()
    released = asyncio.Event()
    @server.tool()
    async def owned_wait() -> str:
        """Wait until the caller cancels this synthetic read."""
        started.set()
        try:
            await asyncio.Event().wait()
            return 'unreachable'
        finally:
            with anyio.move_on_after(0.2, shield=True):
                await asyncio.sleep(0)  # Yield during bounded asynchronous cleanup.
                released.set()
    @server.tool()
    def safe_failure() -> str:
        """Report a projected business failure."""
        try:
            raise RuntimeError('SYNTHETIC-INTERNAL-DETAIL')
        except RuntimeError:
            raise ToolError('Read unavailable') from None
    @server.tool()
    def unsupported_request() -> str:
        """Demonstrate a safe explicit protocol rejection."""
        raise MCPError(code=-32602, message='Unsupported request')
    @server.tool()
    def ping() -> str:
        """Return a synthetic healthy value."""
        return 'ok'
    async with Client(server, read_timeout_seconds=2, cache=None) as client:
        result = await client.call_tool('safe_failure', {})
        assert result.is_error
        assert 'SYNTHETIC-INTERNAL-DETAIL' not in str(result.model_dump())
        assert any(isinstance(block, TextContent) and 'Read unavailable' in block.text for block in result.content)
        try:
            await client.call_tool('unsupported_request', {})
        except MCPError as error:
            assert error.code == -32602 and error.message == 'Unsupported request'
        else:
            raise AssertionError('Expected explicit protocol rejection')
        task = asyncio.create_task(client.call_tool('owned_wait', {}))
        await asyncio.wait_for(started.wait(), 1)
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task
        await asyncio.wait_for(released.wait(), 1)
        assert (await client.call_tool('ping', {})).structured_content == {'result': 'ok'}
    async with Client(server, mode='legacy', read_timeout_seconds=2) as legacy:
        assert legacy.protocol_version == '2025-11-25'
        assert not (await legacy.call_tool('ping', {})).is_error
    print('Projected failure, actual caller cancellation/finally cleanup/continued connection and explicit legacy mode pass')

if __name__ == '__main__':
    asyncio.run(check())
```

The gate establishes that the handler actually started before cancellation; no guessed sleep decides when to cancel. `asyncio.sleep(0)` yields inside cleanup, not a timing-based test assertion. The one-second waits are failure bounds for this tiny local fixture, not application latency SLOs. The safe failure projects a synthetic internal detail away; explicit protocol rejection is caught separately. The next ping proves the client remains usable after the cancelled call.

**Observed 2026-10-25:** strict mypy passes the lifecycle file. Actual in-memory SDK calls verify tool error content/flag without the synthetic internal detail, explicit protocol rejection, caller cancellation reaching the waiting handler, bounded asynchronous finally cleanup, continued connection use and a successful explicit legacy-mode call. The default modern fixture and earlier real stdio checks report2026-07-28; the explicit legacy fixture reports2025-11-25. These tests do not cover an actual old SDK binary, HTTP stream cancellation, a thread that ignores cancellation or external write compensation.

An initial test assumed an unknown prompt would produce InvalidParams; this pinned path returned a safe InternalError instead. The final fixture tests an explicit documented protocol rejection rather than inventing a universal unknown-prompt code. Retain concrete error details when debugging compatibility and classify the actual SDK behavior.

## Version and migration decisions

| Version axis | Record/verify |
|---|---|
| Python runtime | Actual interpreter/patch and platform |
| SDK/package graph | Exact mcp/mcp-types/Pydantic/HTTP dependencies and lock |
| Protocol revision | Observed peer revision, capabilities and selected fallback |
| Application contract | Reviewed tool names, input/output schemas, authorization and result meaning |
| Transport settings | stdio versus HTTP mode, deadlines/body limits and cancellation behavior |

A dated protocol revision is not the package semver. SDK2's `Client(mode='legacy')` can exercise a handshake-era path while the installed SDK stays2.3; it is not evidence that every v1 peer works. The 2026 protocol uses per-request metadata/discovery, while older peers use initialization. Do not hand-code one exchange for every peer or silently enable arbitrary optional extensions. [Current versioning rules](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning) and [SDK modes](https://py.sdk.modelcontextprotocol.io/protocol-versions/) define these differences.

Before upgrading, run the same contract/negative/auth/lifetime fixtures in an isolated locked environment, compare discovery/output schemas and transport behavior, and keep a known-good rollback environment. Decide whether a schema change needs a new tool version rather than quietly widening authority. Revalidate required scopes/resources after reconnect; cached discovery is not renewed permission. One successful legacy-mode ping is a narrow compatibility result, not a whole migration certification.

## Practice acceptance

Reproduce the fixture, add a cooperative downstream operation and prove cancellation plus resource cleanup. Test a real HTTP streaming call in the correct mode and separately demonstrate the documented JSON-response limitation. Add one non-cooperative/synchronous unit with its own deadline/checkpoints. Inject safe tool, protocol and transport failures and assert distinct recovery without leaking raw arguments/tokens. Compare one actual older peer or isolated SDK version before claiming interoperability. Retain cancelled versus completed/unknown write evidence and do not equate a supplied test passing with independent mastery. Learner practice remains **still required**.
