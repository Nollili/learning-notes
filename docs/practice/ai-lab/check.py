import json
from pathlib import Path

def check_ledger(cases,results):
    if type(results) is not dict or set(results)!={c['id']for c in cases}:
        raise ValueError('Case/output mismatch')
    for case in cases:
        result=results[case['id']]
        if type(result) is not dict or set(result)!={'status','citations'}:
            raise ValueError('Result schema')
        if result['status']!=case['status'] or result['citations']!=case['citations']:
            raise ValueError('Fixture contract failed')
    return True

def test_authored_fixture_and_counterexamples():
    cases=json.loads(Path(__file__).with_name('cases.json').read_text())
    assert len({c['id']for c in cases})==len(cases)
    assert {'normal','missing-evidence','cross-tenant','injection','tool-failure'}<={c['slice']for c in cases}
    results={c['id']:{'status':c['status'],'citations':c['citations']}for c in cases}
    assert check_ledger(cases,results)
    for key,bad in [('foreign',{'status':'answer','citations':['private:v1:line1']}),('tool-down',{'status':'answer','citations':[]}),('normal',{'status':'answer','citations':['invented']})]:
        changed=dict(results);changed[key]=bad
        try:check_ledger(cases,changed)
        except ValueError:pass
        else:raise AssertionError('counterexample accepted')
    try:check_ledger(cases,{})
    except ValueError:pass
    else:raise AssertionError('missing results accepted')
