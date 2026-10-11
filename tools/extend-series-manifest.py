from pathlib import Path
import json,base64,hashlib,sys
root=Path(__file__).resolve().parents[1];p=Path(sys.argv[1]);manifest=json.loads(p.read_text());known={f['path'] for f in manifest}
files=[x for x in (root/'tests').glob('series-*') if x.suffix in ['.cjs','.json']]+[x for x in (root/'tests').glob('*-live-*.jpg')]
for x in files:
 rel=str(x.relative_to(root))
 if rel in known:continue
 data=x.read_bytes();enc='base64' if x.suffix=='.jpg' else 'utf-8';s=base64.b64encode(data).decode() if enc=='base64' else data.decode();transport=p.parent/(p.stem+'-extra-'+str(len(manifest))+'.txt');transport.write_text(s);sha=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest();manifest.append({'path':rel,'transport':str(transport),'encoding':enc,'chars':len(s),'sha':sha,'reuse':False})
p.write_text(json.dumps(manifest));print(json.dumps({'files':len(manifest)}))
