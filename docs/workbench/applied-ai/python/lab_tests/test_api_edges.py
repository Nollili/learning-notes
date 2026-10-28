# lab_tests/test_api_edges.py
import asyncio
from contextlib import asynccontextmanager
import httpx
import pytest
from study_ai.api import create_app

KEY = 'k' * 40

def test_boundary_edges():
    calls = []
    class BrokenRepository:
        def save(self, document):
            calls.append(document)
            raise RuntimeError('PRIVATE_FAILURE')
    @asynccontextmanager
    async def scope():
        try:
            yield BrokenRepository()
        finally:
            calls.append('closed')
    async def run():
        app = create_app(inbound_key=KEY, repository_scope=scope)
        async with app.router.lifespan_context(app):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app, raise_app_exceptions=False), base_url='http://fixture') as client:
                for headers in [{}, {'X-Study-Key': 'x' * 40}, [('X-Study-Key', KEY), ('X-Study-Key', KEY)]]:
                    response = await client.post('/documents', headers=headers, content=b'PRIVATE_INVALID_JSON')
                    assert response.status_code == 401
                client.headers['X-Study-Key'] = KEY
                for headers in [{'content-type': 'text/plain'}, {'content-type': 'application/json', 'content-encoding': 'gzip'}]:
                    assert (await client.post('/documents', headers=headers, content=b'{}')).status_code == 415
                for raw in [b'{"id":"x","body":NaN}', b'\xff', b'{"id":"x","body":"\\ud800"}', b'{"id":"x","id":"y","body":"x"}']:
                    response = await client.post('/documents', headers={'content-type': 'application/json'}, content=raw)
                    assert response.status_code == (422 if b'\\ud800' in raw else 400)
                    assert 'PRIVATE' not in response.text
                response = await client.post('/documents', json={'id':'x','body':'PRIVATE_BODY','PRIVATE_FIELD':'PRIVATE_VALUE'})
                assert response.status_code == 422 and 'PRIVATE' not in response.text
                async def chunks():
                    for _ in range(17):
                        yield b'x' * 4096
                response = await client.post('/documents', headers={'content-type': 'application/json'}, content=chunks())
                assert response.status_code == 413 and calls == []
                response = await client.post('/documents', json={'id':'x','body':'text'})
                assert response.status_code == 500 and response.json() == {'error':'internal_error'}
                assert len(calls) == 1
        assert calls[-1] == 'closed' and app.state.ready is False
    asyncio.run(run())

def test_startup_and_app_isolation():
    @asynccontextmanager
    async def failed_scope():
        raise RuntimeError('startup failure')
        yield
    async def run():
        failed = create_app(inbound_key=KEY, repository_scope=failed_scope)
        with pytest.raises(RuntimeError, match='startup failure'):
            async with failed.router.lifespan_context(failed):
                pytest.fail('must not start')
        assert failed.state.ready is False and failed.state.repository is None
        first, second = create_app(inbound_key=KEY), create_app(inbound_key=KEY)
        async with first.router.lifespan_context(first), second.router.lifespan_context(second):
            for app in [first, second]:
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://fixture', headers={'X-Study-Key': KEY}) as client:
                    assert (await client.post('/documents', json={'id':'same','body':'text'})).status_code == 201
    asyncio.run(run())
