import asyncio,json
import httpx2,pytest
from study_ai.model_sdk import ModelFailure,open_model_client
from study_ai.model_streaming import stream_label
from lab_tests.test_model_sdk import envelope,text_item,VALID
TEXT=json.dumps(VALID)
def delta(text,**changes):return {'type':'response.output_text.delta','sequence_number':1,'item_id':'msg_fixture','output_index':0,'content_index':0,'delta':text,'logprobs':[],**changes}
def completed(text=TEXT):return {'type':'response.completed','sequence_number':3,'response':envelope([{'type':'output_text','text':text,'annotations':[]}])}
def sse(events):return b''.join(('event: '+e['type']+'\ndata: '+json.dumps(e,ensure_ascii=False)+'\n\n').encode() for e in events)
class Body(httpx2.AsyncByteStream):
 def __init__(self,data,*,pause=None,forever=False):self.data=data;self.pause=pause;self.forever=forever;self.closed=False;self.entered=asyncio.Event()
 async def __aiter__(self):
  self.entered.set()
  if self.pause is not None:await asyncio.sleep(self.pause)
  for i in range(0,len(self.data),3):yield self.data[i:i+3]
  while self.forever:
   await asyncio.sleep(.001)
   yield sse([{'type':'response.in_progress','sequence_number':2,'response':envelope([],status='in_progress')}])
 async def aclose(self):self.closed=True
async def run_body(body,**options):
 def handler(request):
  data=json.loads(request.content);assert data['stream'] is True and data['store'] is False;assert data['max_output_tokens']==1024
  return httpx2.Response(200,headers={'content-type':'text/event-stream'},stream=body)
 async with open_model_client('fake_offline_key',transport=httpx2.MockTransport(handler)) as client:
  try:return await stream_label(client,model='fixture-model',source='React renders a tree of components.',**options)
  finally:assert body.closed

def test_actual_sdk_sse_split_bytes_and_deltas():
 # Unicode is in a harmless metadata event; JSON delta is split across two events.
 events=[{'type':'response.created','sequence_number':0,'response':{**envelope([]),'metadata':{'fixture':'árvíz 🧠'}}},delta(TEXT[:17]),delta(TEXT[17:]),completed()]
 assert asyncio.run(run_body(Body(sse(events)))).category=='frontend'
@pytest.mark.parametrize('events,code',[
 ([delta(TEXT)],'incomplete'),
 ([delta(TEXT),completed(TEXT+' ')],'invalid_output'),
 ([delta(TEXT,item_id='other'),completed()],'invalid_output'),
 ([delta(TEXT,content_index=1)],'invalid_output'),
 ([delta('x'*8193)],'invalid_output'),
 ([delta('')]*1000,'invalid_output'),
 ([delta(TEXT),{'type':'response.incomplete','sequence_number':2,'response':envelope([],status='incomplete')}],'incomplete'),
 ([{'type':'response.refusal.delta','delta':'PRIVATE','item_id':'msg_fixture','output_index':0,'content_index':0,'sequence_number':1}],'refused'),
 ([{'type':'response.failed','sequence_number':2,'response':{**envelope([],status='failed'),'error':{'code':'server_error','message':'PRIVATE'}}}],'provider_unavailable'),
 ([{'type':'error','sequence_number':1,'code':'server_error','message':'PRIVATE','param':None}],'provider_unavailable'),
 ([delta(json.dumps({**VALID,'evidence_quote':'invented'})),completed(json.dumps({**VALID,'evidence_quote':'invented'}))],'invalid_output'),
])
def test_stream_failures_never_publish_partial(events,code):
 with pytest.raises(ModelFailure) as caught:asyncio.run(run_body(Body(sse(events))))
 assert caught.value.code==code and 'PRIVATE' not in str(caught.value)
@pytest.mark.parametrize('options,body',[
 ({'idle':.01,'overall':1},lambda:Body(b'',pause=.2)),
 ({'idle':1,'overall':.02},lambda:Body(b'',forever=True)),
])
def test_idle_and_active_overall_timeout(options,body):
 with pytest.raises(ModelFailure,match='timeout'):asyncio.run(run_body(body(),**options))
def test_caller_cancellation_closes_and_propagates():
 async def run():
  body=Body(b'',pause=5)
  task=asyncio.create_task(run_body(body))
  await body.entered.wait();task.cancel()
  with pytest.raises(asyncio.CancelledError):await task
  assert body.closed
 asyncio.run(run())
def test_invalid_input_has_no_io():
 calls=[]
 async def run():
  async with open_model_client('fake_offline_key',transport=httpx2.MockTransport(lambda request:calls.append(request))) as client:
   for args in [{'source':''},{'source':'React','idle':0},{'source':'React','overall':float('nan')},{'source':'React','idle':True}]:
    with pytest.raises(ModelFailure,match='invalid_input'):await stream_label(client,model='fixture-model',**args)
 asyncio.run(run());assert calls==[]
@pytest.mark.parametrize('error,code',[(httpx2.ReadError('PRIVATE'),'provider_unavailable'),(httpx2.ReadTimeout('PRIVATE'),'timeout')])
def test_midstream_transport_errors_are_safe_and_closed(error,code):
 class Failing(Body):
  async def __aiter__(self):
   yield sse([delta(TEXT)])
   raise error
 with pytest.raises(ModelFailure) as caught:asyncio.run(run_body(Failing(b'')))
 assert caught.value.code==code and str(caught.value)==code

def test_terminal_refusal_and_unexpected_tools():
 response=envelope([{'type':'refusal','refusal':'PRIVATE'}])
 tool={**envelope([]),'output':[{'type':'function_call','name':'delete','arguments':'{}','call_id':'c1','id':'fc1','status':'completed'}]}
 for value,code in [(response,'refused'),(tool,'invalid_output')]:
  with pytest.raises(ModelFailure) as caught:asyncio.run(run_body(Body(sse([{'type':'response.completed','sequence_number':3,'response':value}]))))
  assert caught.value.code==code
