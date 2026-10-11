from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1];configs=json.loads((root/'tools/game-series.json').read_text());s=(root/'store.js').read_text()
for id,c in configs.items():
 d=root/'store'/id;c['id']=id;c['source']='./store/'+id+'/';c['root']='/home/user/Downloads/'+c['name'];c['saveKey']='pocketvm.game.'+id;c['pinKey']='pocketvm.store.'+id+'.desktop';c['files']=[{'name':n,'size':(d/n).stat().st_size,'mime':'text/html' if n.endswith('.html') else 'text/javascript' if n.endswith('.js') else 'text/plain'} for n in c['package']];c['total']=sum(f['size'] for f in c['files'])+(d/'icon-512.png').stat().st_size+len(c['name'])
block='  // SERIES_CONFIG_START\n  const SERIES_GAMES=Object.freeze('+json.dumps(configs,separators=(',',':'))+');\n'
for id,c in configs.items():
 core=(root/'store'/id/'core.js').read_text();clean=core[core.index(' function clean('):core.index(' function rng(')].strip();clean=clean.replace('function clean(','function seriesClean_'+id+'(').replace('const d=','const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const d=',1)
 if id=='shoot':clean=clean.replace('WEAPONS.map(w=>w.id)',json.dumps(['rifle','sniper','smg','shotgun','lmg','revolver']))
 block+='  '+clean+'\n'
block+='  const SERIES_CLEAN={'+','.join(id+':seriesClean_'+id for id in configs)+'};\n  // SERIES_CONFIG_END\n'
if '// SERIES_CONFIG_START' in s:s=re.sub(r'  // SERIES_CONFIG_START[\s\S]*?  // SERIES_CONFIG_END\n',lambda m:block,s)
else:
 s=s.replace('  const KNOCKOUT_ID=',block+'\n  const KNOCKOUT_ID=',1)
 helper=(root/'tools/series-store.js').read_text();s=s.replace('  async function knockoutInstalled()',helper+'\n  async function knockoutInstalled()',1)
 s=s.replace("    async function gameState(id){","    async function gameState(id){\n      if(SERIES_GAMES[id])return seriesGameState(id);")
 s=s.replace("function featureCopy(id){const arr=","function featureCopy(id){const arr=SERIES_GAMES[id]?SERIES_GAMES[id].variants:")
 s=s.replace("const control=f.id===","const control=SERIES_GAMES[f.id]?SERIES_GAMES[f.id].controls:f.id===",1)
 s=s.replace("const visual=f.id===","const visual=SERIES_GAMES[f.id]?seriesPreview(f.id):f.id===",1)
 s=s.replace("const features=f.id===","const features=SERIES_GAMES[f.id]?SERIES_GAMES[f.id].features.map((item,i)=>'<article><span>0'+(i+1)+'</span><div><strong>'+item[0]+'</strong><p>'+item[1]+'</p></div></article>').join(''):f.id===",1)
 s=s.replace('&&!path.startsWith(KNOCKOUT_ROOT))','&&!path.startsWith(KNOCKOUT_ROOT)&&!seriesOwnPath(path))')
 s=s.replace('syncKnockoutShell();render();','syncKnockoutShell();syncSeriesShell();render();').replace('syncKnockoutShell(ctx).catch(()=>{});','syncKnockoutShell(ctx).catch(()=>{});syncSeriesShell(ctx).catch(()=>{});')
 s=s.replace('Object.freeze({ init, syncKnockoutShell','Object.freeze({ init, buildSeries, installSeriesGame, uninstallSeriesGame, seriesInstalled, syncSeriesShell, syncKnockoutShell')
 s=s.replace('  const ARCADE_GAMES=Object.freeze({','  const ARCADE_GAMES=Object.freeze({\n    ...Object.fromEntries(Object.values(SERIES_GAMES).map(c=>[c.id,{name:c.name,root:c.root,saveKey:c.saveKey}])),')
base=['snake','deadwave','blockblast','crumbclicker','pvz','flappy','penguinpull','apexrush','wobblebay','gradeschool','ballvsball','stickwar','boostleague','knockout'];current=sys.argv[1] if len(sys.argv)>1 else list(configs)[-1];s=re.sub(r'const featureIds=\[.*?\];let featured=\'.*?\';',lambda m:'const featureIds='+json.dumps(base+list(configs),separators=(',',':')).replace('"',"'")+";let featured='"+current+"';",s)
mods={}
for id,c in configs.items():
 for m in c['mods']:
  key=m[0];mods[key]={'id':key,'game':id,'name':m[1],'file':id+'-'+key+'.pvmod','icon':m[2],'tagline':m[3],'description':m[3]+' Uses a separate modded save.'}
modtext='    // SERIES_MODS_START\n'+''.join('    '+k+':'+json.dumps(v,separators=(',',':'))+',\n' for k,v in mods.items())+'    // SERIES_MODS_END\n'
if '// SERIES_MODS_START' in s:s=re.sub(r'    // SERIES_MODS_START[\s\S]*?    // SERIES_MODS_END\n',lambda m:modtext,s)
else:s=s.replace('  const ARCADE_MODS=Object.freeze({','  const ARCADE_MODS=Object.freeze({\n'+modtext)
(root/'store.js').write_text(s)
p=root/'app.js';s=p.read_text();registry='    // SERIES_APPS_START\n'+''.join("    "+id+": { name: "+json.dumps(c['name'])+", icon: "+json.dumps(c['symbol'])+", width: 1300, height: 860, singleton: true, build: (win, options) => PocketStoreApp.buildSeries('"+id+"', win, options, storeAppContext()) },\n" for id,c in configs.items())+'    // SERIES_APPS_END\n'
if '// SERIES_APPS_START' in s:s=re.sub(r'    // SERIES_APPS_START[\s\S]*?    // SERIES_APPS_END\n',lambda m:registry,s)
else:s=s.replace('    knockout: {',registry+'    knockout: {',1)
s=re.sub(r"\|\| /^(?:shoot\|?[a-z]*)*\$/.test\(appId\)", '',s) if False else s
if '// SERIES_MAX_START' in s:s=re.sub(r'/\* SERIES_MAX_START \*/[\s\S]*?/\* SERIES_MAX_END \*/',lambda m:"/* SERIES_MAX_START */ || "+json.dumps(list(configs))+".includes(appId) /* SERIES_MAX_END */",s)
else:s=s.replace("|| appId === 'knockout';","|| appId === 'knockout' /* SERIES_MAX_START */ || "+json.dumps(list(configs))+".includes(appId) /* SERIES_MAX_END */;")
s=re.sub(r"'boostleague','knockout'(?:,'[a-z]+')*\].includes\(w.appId\)","'boostleague','knockout',"+','.join("'"+id+"'" for id in configs)+"].includes(w.appId)",s);p.write_text(s)
p=root/'sw.js';sw=p.read_text();old=int(re.search(r'pocketvm-shell-v(\d+)',sw)[1]);rev=old+1;sw=sw.replace('pocketvm-shell-v'+str(old),'pocketvm-shell-v'+str(rev)).replace('./app.js?v='+str(old),'./app.js?v='+str(rev)).replace('./store.js?v='+str(old),'./store.js?v='+str(rev));assets=[]
for id,c in configs.items():
 for name in c['package']+['icon.svg','favicon-32.png','icon-180.png','icon-512.png']:assets.append('./store/'+id+'/'+name)
 for f in c['files']:
  if f['name'].endswith(('.html','.js')):assets.append('./store/'+id+'/'+f['name']+'?v='+c['revision'])
 assets.append('./store/'+id+'/icon.svg?v=illustrated-v1')
cache='  // SERIES_CACHE_START\n'+''.join('  '+json.dumps(a)+',\n' for a in assets)+'  // SERIES_CACHE_END\n'
if '// SERIES_CACHE_START' in sw:sw=re.sub(r'  // SERIES_CACHE_START[\s\S]*?  // SERIES_CACHE_END\n',lambda m:cache,sw)
else:sw=sw.replace('const ASSETS = [','const ASSETS = [\n'+cache,1)
p.write_text(sw);p=root/'index.html';p.write_text(p.read_text().replace('app.js?v='+str(old),'app.js?v='+str(rev)).replace('store.js?v='+str(old),'store.js?v='+str(rev)))
print(json.dumps({'games':list(configs),'shell':rev,'newMods':len(mods)}))
