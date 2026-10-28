from pathlib import Path
import subprocess,json,ssl,urllib.request,time,hashlib
root=Path(__file__).resolve().parent;project=(root/'.lab-project').read_text().strip()
assert project.startswith('learning-notes-study-'), 'Refusing non-study project'
def run(args,**kw):return subprocess.run(args,cwd=root,check=True,capture_output=True,**kw).stdout
base=['docker','compose','-p',project,'-f','compose.yaml','-f','full-stack.yaml']
def compose(*args):return run(base+list(args)).decode().strip()
compose('config','--quiet')
(root/'build.log').write_bytes(run(base+['build','api','frontend']))
compose('up','-d','--wait','--wait-timeout','60')
port=compose('port','frontend','8443').split(':')[-1]
ctx=ssl.create_default_context(cafile=str(root/'secrets/tls_cert'))
def get(path):
 with urllib.request.urlopen('https://localhost:'+port+path,context=ctx,timeout=4)as r:return r.status,r.read(),r.headers
status,html,headers=get('/');assert status==200 and b'Study counter' in html;assert "script-src 'self'" in headers['content-security-policy'];assert b'fetch' in get('/app.js')[1]
compose('exec','-T','db','psql','-U','postgres','-d','notes','-c','UPDATE counter SET value=0 WHERE id=1;')
assert get('/api/readyz')[0]==200;assert json.loads(get('/api/counter')[1])['value']==0
config=json.loads(run(['docker','inspect',compose('ps','-q','frontend')]))[0];assert config['Config']['User']=='10001:10001' and config['HostConfig']['ReadonlyRootfs']
compose('exec','-T','db','psql','-U','postgres','-d','notes','-c','UPDATE counter SET value=7 WHERE id=1;')
assert json.loads(get('/api/counter')[1])['value']==7
backup=run(base+['exec','-T','db','pg_dump','-U','postgres','-Fc','notes']);(root/'notes.dump').write_bytes(backup)
compose('exec','-T','db','createdb','-U','postgres','notes_restored')
run(base+['exec','-T','db','pg_restore','-U','postgres','-d','notes_restored'],input=backup)
assert compose('exec','-T','db','psql','-U','postgres','-d','notes_restored','-tAc','SELECT value FROM counter WHERE id=1;')=='7'
compose('exec','-T','db','dropdb','-U','postgres','notes_restored')
frontend_image=[l.split('=',1)[1] for l in(root/'.env').read_text().splitlines()if l.startswith('FRONTEND_IMAGE=')][0]
good_id=run(['docker','image','inspect',frontend_image,'--format','{{.Id}}']).decode().strip();run(['docker','tag',frontend_image,frontend_image+'-good']);source=(root/'frontend.mjs').read_bytes();(root/'frontend.mjs').write_bytes(source.replace(b'Study counter',b'Broken release'))
(root/'bad-build.log').write_bytes(run(base+['build','frontend']));bad_id=run(['docker','image','inspect',frontend_image,'--format','{{.Id}}']).decode().strip();compose('up','-d','--no-deps','frontend');port=compose('port','frontend','8443').split(':')[-1]
assert b'Study counter' not in get('/')[1] # expected smoke failure detected
run(['docker','tag',frontend_image+'-good',frontend_image]);compose('up','-d','--no-deps','frontend');port=compose('port','frontend','8443').split(':')[-1];assert get('/')[1]==html;assert json.loads(get('/api/counter')[1])['value']==7
(root/'frontend.mjs').write_bytes(source)
evidence={'project':project,'good_frontend':good_id,'bad_frontend':bad_id,'frontend_sha256':hashlib.sha256(source).hexdigest(),'backup_sha256':hashlib.sha256(backup).hexdigest(),'checks':['TLS certificate verification','frontend/script/CSP','proxy/database readiness/read','nonroot/read-only frontend','pg_dump restore into separate DB','failed semantic smoke detected','exact frontend rollback, database value retained'],'limitations':['local loopback fixture; no public DNS/cloud','no browser interaction observation','read-only frontend; no authentication','no cluster/Kubernetes apply']}
(root/'evidence.json').write_text(json.dumps(evidence,indent=2));print(json.dumps(evidence))
compose('down','--volumes','--remove-orphans')
api_image=[l.split('=',1)[1]for l in(root/'.env').read_text().splitlines()if l.startswith('APP_IMAGE=')][0]
for image in[frontend_image,frontend_image+'-good',bad_id,api_image]:run(['docker','image','rm',image])
for p in(root/'secrets').iterdir():p.unlink()
(root/'secrets').rmdir();print('Owned services, volume, app images and local credentials removed; base images/cache retained.')
