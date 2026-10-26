import asyncio
import httpx2
from mcp import Client
from mcp.client.streamable_http import streamable_http_client
from secure_server import mcp, RESOURCE, GRANTS, REVOKED, PublicNote

async def check() -> None:
    app = mcp.streamable_http_app(json_response=True, max_request_body_size=8192)
    async with app.router.lifespan_context(app):
        async with httpx2.AsyncClient(transport=httpx2.ASGITransport(app=app), base_url='http://127.0.0.1:8000', timeout=2) as http:
            for token, status in [(None, 401), ('unknown', 401), ('fixture-expired', 401), ('fixture-wrong-audience', 401), ('fixture-no-scope', 403)]:
                headers = {} if token is None else {'Authorization': f'Bearer {token}'}
                response = await http.post('/mcp', headers=headers, json={})
                assert response.status_code == status, (token, response.status_code)
            metadata = await http.get('/.well-known/oauth-protected-resource/mcp')
            assert metadata.status_code == 200 and metadata.json()['resource'] == RESOURCE
            async with httpx2.AsyncClient(transport=httpx2.ASGITransport(app=app), headers={'Authorization': 'Bearer fixture-a'}, timeout=2) as authorized:
                transport = streamable_http_client(RESOURCE, http_client=authorized)
                async with Client(transport, read_timeout_seconds=2, cache=None) as client:
                    assert [tool.name for tool in (await client.list_tools()).tools] == ['private_note']
                    good = await client.call_tool('private_note', {'note_id': 'n1'})
                    assert not good.is_error
                    projection = PublicNote.model_validate(good.structured_content)
                    assert 'UNTRUSTED' in projection.text
                    assert 'internal_debug' not in str(good.model_dump())
                    # An injection-like instruction is data; a proposed cross-tenant call is still denied.
                    denied = await client.call_tool('private_note', {'note_id': 'n2'})
                    assert denied.is_error and 'Tenant B data' not in str(denied.model_dump())
                    GRANTS['alice'].clear()
                    revoked_record = await client.call_tool('private_note', {'note_id': 'n1'})
                    assert revoked_record.is_error
            REVOKED.add('fixture-a')
            response = await http.post('/mcp', headers={'Authorization': 'Bearer fixture-a'}, json={})
            assert response.status_code == 401
    GRANTS['alice'] = {'n1'}
    REVOKED.clear()
    print('ASGI HTTP auth middleware: missing/invalid/expired/audience/scope/revocation and real SDK principal/ACL/projection/trust checks pass')

if __name__ == '__main__':
    asyncio.run(check())
