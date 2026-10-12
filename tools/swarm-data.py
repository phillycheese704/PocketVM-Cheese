from pathlib import Path
import json
r=Path(__file__).resolve().parents[1];facts=json.loads((r/'tools/swarm-reference-facts.json').read_text());data={g:[] for g in ['workers','army']}
for x in facts:
 kind='workers' if x['category']=='meat' else 'army';data[kind].append({'id':x['id'],'name':x['name'].title(),'tier':int(x['tier']),'output':x['output'][1],'meat':next(c[1] for c in x['cost'] if c[0]=='meat'),'sacrifice':next((c[1] for c in x['cost'] if c[0] not in ['meat','larva']),0)})
data['workers'].sort(key=lambda d:d['tier']);data['army'].sort(key=lambda d:d['tier'])
p=r/'store/swarmsim/data.js';p.write_text("(function(root){const data="+json.dumps(data,separators=(',',':'))+";if(typeof module==='object'&&module.exports)module.exports=data;else root.SwarmData=data;})(typeof globalThis!=='undefined'?globalThis:this);\n")
