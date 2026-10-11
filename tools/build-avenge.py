from pathlib import Path
import json,re,shutil
r=Path(__file__).resolve().parents[1];d=r/'store/avengefps';d.mkdir(exist_ok=True)
for n in ['three.min.js','software-renderer.js','THREE-LICENSE.txt']:shutil.copyfile(r/'store/shoot'/n,d/n)
s=(r/'store/shoot/core.js').read_text().replace('ShootCore','AvengeEngine')
weapons=[dict(id=i,name=n,className=c,hp=100,speed=10,damage=dam,rate=rate,mag=mag,reload=rel,spread=sp,recoil=rec,range=ran,auto=auto,**({'pellets':8} if i=='shotgun' else {})) for i,n,c,dam,rate,mag,rel,sp,rec,ran,auto in [('rifle','SCAR','Rifle',13,.06,25,2.2,.013,.019,90,True),('m4','M4','Rifle',13,.05,25,2.2,.018,.025,90,True),('ak','AK-47','Rifle',18,.09,30,2.2,.023,.028,90,True),('sniper','Sniper','Precision',38,.5,6,2.2,.005,.045,130,False),('awp','AWP','Precision',95,1.3,4,3,.008,.06,130,False),('shotgun','Shotgun','Scatter',9,.85,3,2.2,.07,.08,32,False),('smg','Tec-9','Handgun',12,.055,25,2.2,.025,.017,60,True),('revolver','Desert Eagle','Handgun',32,.24,7,2,.01,.04,85,False)]]
maps=[dict(id=i,name=n,floor=f,sky=sky,walls=w,accent=a,size=29,boxes=b,spawns=[[-24,-24],[24,24],[-24,24],[24,-24],[0,-24],[0,24],[-24,0],[24,0]]) for i,n,f,sky,w,a,b in [
('citrine','Citrine Town','#dcc691','#a6dfe9','#e9d6ad','#43aa82',[[-18,-13,9,15,7],[18,13,9,15,7],[-17,15,11,8,5],[17,-15,11,8,5],[-3,-15,9,6,3],[3,15,9,6,3],[-9,0,4,8,1.2],[9,0,4,8,1.2],[-20,0,4,4,1],[20,0,4,4,1]]),
('altar','Jungle Altar','#98ab79','#b1d3b7','#9bafa3','#e1b968',[[-17,-17,9,9,6],[17,17,9,9,6],[-17,17,9,9,6],[17,-17,9,9,6],[-8,0,3,9,3],[8,0,3,9,3],[0,-10,9,3,3],[0,10,9,3,3],[0,0,5,5,.65],[-21,0,4,4,1],[21,0,4,4,1]]),
('glacier','Glacier Docks','#dbe9ed','#9bbacb','#779cae','#b2e3f0',[[-17,-10,8,20,5],[17,10,8,20,5],[0,-18,12,6,3],[0,18,12,6,3],[-4,-3,5,5,1.2],[4,3,5,5,1.2],[-18,18,7,5,1],[18,-18,7,5,1],[-8,12,4,4,2],[8,-12,4,4,2]]),
('canyon','Canyon Bridge','#cfaa81','#b6dfd5','#d59e79','#76c88d',[[-17,-15,8,12,5],[17,15,8,12,5],[-17,15,8,12,5],[17,-15,8,12,5],[-9,-3,4,12,2.5],[9,3,4,12,2.5],[-4,-19,6,4,1.2],[4,19,6,4,1.2],[-21,0,4,7,1],[21,0,4,7,1]])]]
s=re.sub(r' const WEAPONS=.*?;\n',lambda m:' const WEAPONS='+json.dumps(weapons,separators=(',',':'))+';\n',s,count=1)
s=re.sub(r' const MAPS=.*?;\n',lambda m:' const MAPS='+json.dumps(maps,separators=(',',':'))+';\n',s,count=1)
s=s.replace('this.mods.shootbottomless','this.mods.avengeammo').replace('this.mods.shootoverdrive','false').replace('this.mods.shootmoon','this.mods.avengemoon')
(d/'engine.js').write_text(s)
