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
