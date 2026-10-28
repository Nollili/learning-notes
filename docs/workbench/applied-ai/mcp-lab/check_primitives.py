import asyncio
from mcp import Client
from mcp.types import TextContent, TextResourceContents
from server import mcp, StudyNote

async def check() -> None:
    async with Client(mcp, read_timeout_seconds=2) as client:
        tools = (await client.list_tools()).tools
        assert [tool.name for tool in tools] == ['get_note']
        assert tools[0].input_schema['properties']['note_id']['enum'] == ['n1', 'n2']
        good = await client.call_tool('get_note', {'note_id': 'n1'})
        assert not good.is_error
        note = StudyNote.model_validate(good.structured_content)
        assert note.id == 'n1' and note.title == 'Cancellation'
        assert any(isinstance(item, TextContent) and 'timeout' in item.text for item in good.content)
        missing = await client.call_tool('get_note', {'note_id': 'n2'})
        assert missing.is_error
        malformed = await client.call_tool('get_note', {'note_id': 1})
        assert malformed.is_error
        resources = (await client.list_resources()).resources
        assert [str(item.uri) for item in resources] == ['study://guide']
        result = await client.read_resource('study://guide')
        assert len(result.contents) == 1
        content = result.contents[0]
        assert isinstance(content, TextResourceContents) and 'owned fixture' in content.text
        prompts = (await client.list_prompts()).prompts
        assert [item.name for item in prompts] == ['plan']
        prompt = await client.get_prompt('plan', {'topic': 'cancellation'})
        assert len(prompt.messages) == 1 and prompt.messages[0].role == 'user'
        message = prompt.messages[0].content
        assert isinstance(message, TextContent) and 'cancellation' in message.text
        print('MCP2.3 in-memory roles/tool/schema/error/resource/prompt checks passed:', client.protocol_version)

if __name__ == '__main__':
    asyncio.run(check())
