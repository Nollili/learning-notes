# MCP schemas, discovery and connection ownership

Continue [the pinned primitive lab](./mcp-primitives.md). Primary versions remain Python3.13.11, MCP SDK2.3.0, Pydantic2.14.1, protocol2026-07-28. This lesson adds a real **stdio subprocess** test; it does not claim an HTTP/OAuth deployment.

## Contracts at three different boundaries

1. The **protocol envelope** identifies a JSON-RPC method/request and carries version/capability metadata. An invalid method/envelope is different from a valid tool whose business operation fails.
2. The **tool's input/output schemas** describe data shape. The catalogue tool requires `note_id` from a closed enum; the output publishes a bounded `StudyNote`. A model seeing a schema does not guarantee its next JSON obeys it. Validate on the server; validate the result again before the application uses it.
3. **Application policy** decides who may read which current record or execute a write. A syntactically valid ID, a declared capability or an authenticated connection does not establish this permission.

The SDK uses snake-case Python properties such as `input_schema`, `output_schema`, `structured_content` and `is_error`; wire schemas use their protocol-defined field names. Do not copy a v1 or TypeScript property spelling into a v2 Python program. Input constraints should describe lengths, ranges, enums, required/optional fields and extra-field policy. JSON Schema defaults are not a universal promise that every validator fills missing values; the adapter's actual behavior matters. Our function has no optional ID and rejects the tested malformed/out-of-enum inputs. Its output model rejects extra fields. Do not assume every decorator-generated input model forbids all unknown fields: inspect and test that policy explicitly when it matters.

A tool list can be paginated in a larger integration. Cap discovery work and follow the documented cursor instead of assuming the first page is complete. Cache discovery only under a version/server/principal-aware policy; metadata can change and is not a long-lived grant to call everything discovered. Keep a reviewed application allowlist of the capabilities needed for the current task. The [official tool schema guide](https://py.sdk.modelcontextprotocol.io/servers/tools/) and [structured-output guide](https://py.sdk.modelcontextprotocol.io/servers/structured-output/) describe the pinned APIs.

## Discovery and capabilities are versioned

The 2026-07-28 protocol carries version and client capability metadata per request. It does **not** require the old initialize handshake. The SDK's default `Client` performs discovery and compatibility handling for the application; its resulting `protocol_version` is a dated protocol revision, not the Python package version. Earlier protocol eras use a connection-scoped initialize exchange. Record the actual peer version instead of narrating one lifecycle as universal. See [dated versioning rules](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning).

Capability presence tells the host a feature family is available; it does not imply that every optional extension, action or argument is supported or authorized. A server can expose tools without resources, or prompts without tools. Check the negotiated/discovered feature and implement an explicit fallback or useful error for unsupported features. An annotation saying “read-only” is a hint from the server, not enforcement of filesystem/database access. The fixture asserts only tools/resources/prompts that it actually exposes; it does not advertise or exercise sampling, elicitation or optional extensions.

## Choose a transport deliberately

| Transport | Useful for | What remains to own |
|---|---|---|
| In-process SDK client | Fast protocol/handler tests | Does not verify process framing, inherited environment, network, TLS or auth |
| stdio | A reviewed local child launched by a host | Exact executable/arguments, safe environment, protocol-only stdout, stderr projection and child cleanup |
| Streamable HTTP | A service shared by authorized remote clients | TLS/origin/token validation, request/body/deadline budgets, proxy behavior and per-request authorization |
| Legacy HTTP+SSE | Compatibility with older peers where required | Explicit old-protocol support and migration; do not choose it merely because a dated tutorial does |

In the current binding, stdio uses newline-delimited UTF-8 JSON-RPC over the child streams. Streamable HTTP carries messages to one endpoint with a JSON response or request-scoped SSE stream. HTTP semantics are version-sensitive; a WebSocket is not a mandatory built-in transport. Use the SDK rather than inventing ad-hoc framing. [Official transport bindings](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports) define the current wire contract.

Starting a local stdio server runs code under an OS account. Protocol schemas and roots are not an operating-system sandbox. Prefer an absolute reviewed executable, structured arguments without a shell, and only required files/network authority. Do not launch an arbitrary command suggested in server text. Secrets should never be placed in command arguments, discovery descriptions, resources or public logs. The SDK2.3 stdio launcher uses a minimal inherited environment plus explicit overrides; this is a versioned behavior to verify, not a reason to assume any SDK/process launcher filters secrets.

## Actual subprocess integration

The repository lab `docs/python-for-ai/mcp-lab/` contains this added `check_connections.py`. Copy the entire lab to an owned directory, run `uv sync --locked`, then `uv run --locked python check_connections.py`.

```python
import asyncio
import json
import os
from pathlib import Path
import sys
import tempfile
from mcp import Client, StdioServerParameters
from mcp.client.stdio import get_default_environment
from server import StudyNote

async def check() -> None:
    source = Path(__file__).with_name('server.py').resolve()
    # Synthetic canary, never a real credential. Restore owned process state afterwards.
    key = 'MCP_FIXTURE_CANARY'
    previous = os.environ.get(key)
    os.environ[key] = 'synthetic-do-not-forward'
    try:
        assert key not in get_default_environment()
        with tempfile.TemporaryDirectory(prefix='mcp-owned-') as directory:
            root = Path(directory)
            launcher = root / 'launch.py'
            receipt = root / 'child.json'
            launcher.write_text(
                'import json,os,runpy,sys\n'
                'from pathlib import Path\n'
                'Path(sys.argv[1]).write_text(json.dumps({"pid":os.getpid(),"canary_visible":"MCP_FIXTURE_CANARY" in os.environ}))\n'
                'runpy.run_path(sys.argv[2],run_name="__main__")\n'
            )
            params = StdioServerParameters(command=sys.executable,
                args=[str(launcher), str(receipt), str(source)], cwd=directory, env={})
            async with Client(params, read_timeout_seconds=2) as client:
                child = json.loads(receipt.read_text())
                assert child['canary_visible'] is False
                assert client.protocol_version == '2026-07-28'
                capabilities = client.server_capabilities
                assert capabilities.tools is not None
                assert capabilities.resources is not None
                assert capabilities.prompts is not None
                tool = (await client.list_tools()).tools[0]
                assert tool.input_schema['required'] == ['note_id']
                assert tool.input_schema['properties']['note_id']['enum'] == ['n1', 'n2']
                assert tool.output_schema is not None
                assert 'text' in tool.output_schema['properties']
                result = await client.call_tool('get_note', {'note_id': 'n1'})
                assert not result.is_error
                assert StudyNote.model_validate(result.structured_content).id == 'n1'
                wrong = await client.call_tool('get_note', {'note_id': '../private'})
                assert wrong.is_error
                resource = await client.read_resource('study://guide')
                assert len(resource.contents) == 1
                prompt = await client.get_prompt('plan', {'topic': 'schema validation'})
                assert len(prompt.messages) == 1
            try:
                os.kill(child['pid'], 0)  # Existence check only; no signal is sent.
            except ProcessLookupError:
                pass
            else:
                raise AssertionError('Owned stdio child still exists after connection exit')
        print('Actual stdio schema/capability/call/resource/prompt/child-cleanup/canary checks passed')
    finally:
        if previous is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = previous

if __name__ == '__main__':
    asyncio.run(check())
```

The launcher is generated only in the test's owned temporary directory. It writes a PID and whether a **synthetic** canary environment key reached the child, then runs the exact known server. The parent neither forwards real credentials nor inspects unrelated processes. After connection exit, signal0 checks that this owned child no longer exists; it sends no signal. The SDK context handles child shutdown, and the temporary directory is removed. This verifies the actual local lifecycle, not arbitrary hostile-child containment.

**Observed 2026-10-25:** strict mypy passes all three lab Python files. The stdio exchange discovers protocol2026-07-28, the expected capability families and input/output schemas; validates a successful projected result; rejects `../private`; reads the guide; renders the prompt; confirms the canary is absent and confirms child termination. No HTTP endpoint, TLS chain, OAuth issuer, desktop host UI or remote account was tested. A two-second call read timeout is not a payload-size cap, an aggregate task budget or proof a remote write was rolled back.

## Debugging and practice acceptance

- If discovery fails, verify executable, working directory, interpreter/environment and stdout contamination before changing schemas. Preserve a safe diagnostic code; redact paths/arguments/tokens as policy requires.
- If a tool result is an error, classify protocol failure, argument validation, business denial/missing data and transport failure separately. Never treat a transport-level successful response as permission to use failed tool output.
- If schemas change, version the reviewed tool contract and rerun compatibility/negative checks. Do not silently widen allowed arguments or trust a cached server description after the server changes.

Exercise: reproduce both in-process and stdio checks; add malformed input and rejected output cases, implement one server without resources and verify the host handles the missing capability, and document a bounded discovery policy. Connect an owned HTTP service only after specifying auth/TLS/body/deadline/origin controls; record those results separately. Demonstrate process cleanup on success and a failed call. Learner practice remains required.

Official references: [SDK client lifecycle](https://py.sdk.modelcontextprotocol.io/client/), [stdio/HTTP transport ownership](https://py.sdk.modelcontextprotocol.io/client/transports/), [SDK protocol modes](https://py.sdk.modelcontextprotocol.io/protocol-versions/). The lab's source-level checks and actual SDK exchanges complement, rather than replace, the application security exercises in [tool boundaries](./tool-boundaries.md).
