from pathlib import Path
import json,sys
root=Path(__file__).resolve().parents[1];id,commit=sys.argv[1:3];proof=json.loads((root/'tests'/f'{id}-live-results.json').read_text());p=root/'tools/game-series-progress.json';data=json.loads(p.read_text());checks=0
for file in (root/'tests').glob(id+'-*-results.json'):
 result=json.loads(file.read_text());checks+=result.get('checks',0) if isinstance(result.get('checks'),int) else 0
data['completed'][id]={'commit':commit,'url':proof['url'],'checks':checks,'layouts':len(proof.get('layouts',[])),'proof':'tests/'+proof['proof']}
index=data['order'].index(id);data['active']=data['order'][index+1] if index+1<len(data['order']) else 'existing-mods';p.write_text(json.dumps(data,indent=2)+'\n');print(json.dumps(data['completed'][id]))
