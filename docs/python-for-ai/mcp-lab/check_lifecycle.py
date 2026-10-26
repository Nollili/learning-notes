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
