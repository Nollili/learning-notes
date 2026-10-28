from pathlib import Path
import secrets
root=Path(__file__).resolve().parent
if any((root/p).exists() for p in ['secrets','.env','.lab-project']):
    raise SystemExit('Refusing to overwrite existing fixture settings/secrets')
project='learning-notes-study-'+secrets.token_hex(4)
secret_dir=root/'secrets';secret_dir.mkdir(mode=0o700)
for name in ['admin_password','app_password']:
    p=secret_dir/name;p.write_text('disposable-'+secrets.token_hex(24));p.chmod(0o444)
image='learning-notes-study-api:'+project
(root/'.env').write_text((root/'.env.example').read_text()+'APP_IMAGE='+image+'\n')
(root/'.lab-project').write_text(project+'\n')
print('Owned project:',project)
print('Owned image:',image)
print('Disposable credentials created; values are not printed.')
