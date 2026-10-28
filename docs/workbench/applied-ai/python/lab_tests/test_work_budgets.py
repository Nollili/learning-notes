import asyncio
import pytest
from study_ai.work_admission import AdmissionRejected,Gate,RequestBucket
from study_ai.work_retries import TemporaryRejection,RetryDeferred,run_budgeted

def test_bucket_burst_refill_cap_and_clock():
 b=RequestBucket(per_second=1,burst=2,now=0)
 assert b.take(0) and b.take(0) and not b.take(0)
 assert not b.take(.5) and b.take(1) and not b.take(1)
 assert b.take(100) and b.take(100) and not b.take(100)
 for now in [99,float('nan'),float('inf'),True]:
  with pytest.raises(ValueError):b.take(now)
@pytest.mark.parametrize('args',[(0,0),(True,0),(101,0),(1,-1),(1,101),(1,True)])
def test_gate_configuration(args):
 with pytest.raises(ValueError):Gate(*args)

def test_gate_active_waiting_overflow_cancel_timeout_and_reuse():
 async def run():
  gate=Gate(2,1);release=asyncio.Event();entered=0;peak=0
  async def worker():
   nonlocal entered,peak
   async with gate.slot():
    entered+=1;peak=max(peak,gate.active);await release.wait()
  a=asyncio.create_task(worker());b=asyncio.create_task(worker());await asyncio.sleep(0)
  assert entered==2 and gate.active==2
  waiter=asyncio.create_task(worker());await asyncio.sleep(0);assert gate.waiting==1
  with pytest.raises(AdmissionRejected,match='full'):
   async with gate.slot():pytest.fail()
  waiter.cancel()
  with pytest.raises(asyncio.CancelledError):await waiter
  assert gate.waiting==0
  with pytest.raises(AdmissionRejected,match='deadline'):
   async with gate.slot(wait_seconds=.01):pytest.fail()
  assert gate.waiting==0
  a.cancel()
  with pytest.raises(asyncio.CancelledError):await a
  assert gate.active==1
  release.set();await b
  assert gate.active==gate.waiting==0 and peak==2
  with pytest.raises(RuntimeError):
   async with gate.slot():raise RuntimeError('owned')
  async with gate.slot():assert gate.active==1
  assert gate.active==0
 asyncio.run(run())

def test_no_waiting_policy():
 async def run():
  gate=Gate(1,0)
  async with gate.slot():
   with pytest.raises(AdmissionRejected):
    async with gate.slot():pytest.fail()
  assert gate.active==gate.waiting==0
 asyncio.run(run())

def ports():
 now=[0.];waits=[]
 async def sleep(value):waits.append(value);now[0]+=value
 return now,waits,sleep

def test_retry_backoff_server_minimum_and_success():
 async def run():
  now,waits,sleep=ports();gate=Gate(1,0);bucket=RequestBucket(per_second=100,burst=10,now=0);calls=0
  async def call():
   nonlocal calls;calls+=1
   assert gate.active==1
   if calls<=2:raise TemporaryRejection()
   return 'ok'
  assert await run_budgeted(call,gate=gate,bucket=bucket,jitter=lambda:.5,clock=lambda:now[0],sleep=sleep)=='ok'
  assert calls==3 and waits==pytest.approx([.15,.25]) and gate.active==0
  calls=0;now,waits,sleep=ports()
  async def hinted():
   nonlocal calls;calls+=1
   if calls==1:raise TemporaryRejection(1)
   return 'hinted'
  assert await run_budgeted(hinted,gate=gate,bucket=RequestBucket(per_second=100,burst=10,now=0),jitter=lambda:.5,clock=lambda:now[0],sleep=sleep)=='hinted'
  assert waits==[1.05]
 asyncio.run(run())

def test_attempt_cap_defer_and_permanent_error():
 async def run():
  for error,expected,count in [(TemporaryRejection(),TemporaryRejection,3),(TemporaryRejection(3),RetryDeferred,1),(RuntimeError('permanent'),RuntimeError,1)]:
   now,waits,sleep=ports();calls=0;gate=Gate(1,0)
   async def call():
    nonlocal calls;calls+=1;raise error
   with pytest.raises(expected):await run_budgeted(call,gate=gate,bucket=RequestBucket(per_second=100,burst=10,now=0),clock=lambda:now[0],sleep=sleep,jitter=lambda:0)
   assert calls==count and gate.active==0
 asyncio.run(run())

def test_each_retry_consumes_rate_budget():
 async def run():
  now,waits,sleep=ports();calls=0;gate=Gate(1,0)
  async def call():
   nonlocal calls;calls+=1;raise TemporaryRejection()
  with pytest.raises(AdmissionRejected):await run_budgeted(call,gate=gate,bucket=RequestBucket(per_second=.01,burst=1,now=0),clock=lambda:now[0],sleep=sleep,jitter=lambda:0)
  assert calls==1 and len(waits)==1 and gate.active==0
 asyncio.run(run())

def test_cancellation_during_backoff_and_overall_during_attempt():
 async def run():
  gate=Gate(1,0);sleeping=asyncio.Event();closed=asyncio.Event()
  async def call():raise TemporaryRejection()
  async def sleep(_):
   sleeping.set()
   try:await asyncio.Event().wait()
   finally:closed.set()
  task=asyncio.create_task(run_budgeted(call,gate=gate,bucket=RequestBucket(per_second=1,burst=1,now=0),clock=lambda:0,sleep=sleep))
  await sleeping.wait();task.cancel()
  with pytest.raises(asyncio.CancelledError):await task
  assert closed.is_set() and gate.active==gate.waiting==0
  async def blocked():await asyncio.Event().wait()
  with pytest.raises(TimeoutError):await run_budgeted(blocked,gate=gate,bucket=RequestBucket(per_second=1,burst=1,now=0),clock=lambda:0,deadline=.01)
  assert gate.active==gate.waiting==0
 asyncio.run(run())
