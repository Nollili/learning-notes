# lab_tests/test_model_sdk_edges.py
import asyncio
import httpx2
import pytest
from study_ai.model_sdk import ModelFailure, open_model_client, propose_label
from lab_tests.test_model_sdk import KEY, MODEL, SOURCE, VALID, envelope, text_item

@pytest.mark.parametrize('payload', [
    envelope([{'type':'output_text','text':'{PRIVATE_MALFORMED','annotations':[]}]),
    envelope([text_item({**VALID,'evidence_quote':'x'*161})]),
    envelope([text_item({'category':'frontend','evidence_quote':'React'})]),
    {**envelope([text_item(VALID)]),'output':[]},
    {**envelope([text_item(VALID)]),'output':envelope([text_item(VALID)])['output']*2},
    {**envelope([text_item(VALID)]),'output':[{'type':'function_call','name':'delete','arguments':'{}','call_id':'c1'}]},
])
def test_invalid_output_edges(payload):
    async def run():
        async with open_model_client(KEY,transport=httpx2.MockTransport(lambda request:httpx2.Response(200,json=payload))) as client:
            with pytest.raises(ModelFailure,match='invalid_output') as caught:
                await propose_label(client,model=MODEL,source=SOURCE)
            assert 'PRIVATE' not in str(caught.value)
    asyncio.run(run())

def test_no_io_invalid_input_and_explicit_review_result():
    calls=[]
    def handler(request):
        calls.append(request)
        return httpx2.Response(200,json=envelope([text_item({'category':'other','evidence_quote':'','needs_review':True})]))
    async def run():
        async with open_model_client(KEY,transport=httpx2.MockTransport(handler)) as client:
            for source,model in [('',MODEL),('x'*4001,MODEL),('🧠'*2001,MODEL),('\ud800',MODEL),(SOURCE,'../model')]:
                with pytest.raises(ModelFailure,match='invalid_input'):
                    await propose_label(client,model=model,source=source)
            assert calls==[]
            assert (await propose_label(client,model=MODEL,source=SOURCE)).needs_review
    asyncio.run(run())
    assert len(calls)==1

def test_timeout_and_caller_cancellation():
    async def timeout_handler(request):
        raise httpx2.ReadTimeout('PRIVATE_TIMEOUT',request=request)
    async def run():
        async with open_model_client(KEY,transport=httpx2.MockTransport(timeout_handler)) as client:
            with pytest.raises(ModelFailure,match='timeout'):
                await propose_label(client,model=MODEL,source=SOURCE)
        assert client.is_closed()
        entered=asyncio.Event();closed=asyncio.Event()
        async def handler(request):
            entered.set()
            try:await asyncio.Event().wait()
            finally:closed.set()
            raise AssertionError('unreachable')
        async with open_model_client(KEY,transport=httpx2.MockTransport(handler)) as other:
            task=asyncio.create_task(propose_label(other,model=MODEL,source=SOURCE))
            await asyncio.wait_for(entered.wait(),1)
            task.cancel()
            with pytest.raises(asyncio.CancelledError):await task
            assert closed.is_set()
        assert other.is_closed()
    asyncio.run(run())
