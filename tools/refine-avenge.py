from pathlib import Path
p=Path(__file__).resolve().parents[1]/'store/avengefps/core.js';s=p.read_text()
s=s.replace('p.gunLevel=0;','p.gunLevel=0;p.loadout={};')
s=s.replace("p.weapon=id;p.ammo=this.getWeapon(p).mag;p.reloading=0;", "p.loadout[p.weapon]=p.ammo;p.weapon=id;p.ammo=p.loadout[id]??this.getWeapon(p).mag;p.reloading=0;")
s=s.replace("p.grapple=null;p.yaw=", "p.grapple=null;p.loadout={};p.yaw=")
s=s.replace("fire(p,yaw=p.yaw,pitch=p.pitch){super.fire(p,yaw,pitch);", "fire(p,yaw=p.yaw,pitch=p.pitch){if(p.dead||p.cooldown>0||p.reloading||!p.ammo){super.fire(p,yaw,pitch);return;}if(p.curse>0){yaw+=(this.r()-.5)*.18;pitch+=(this.r()-.5)*.1;}super.fire(p,yaw,pitch);")
a=s.index('if(p.grapple){const g=');b=s.index('super.move(p,dt,input);}',a)
s=s[:a]+"if(p.grapple){const g=p.grapple,dx=g.x-p.x,dy=g.y-p.y,dz=g.z-p.z,len=Math.hypot(dx,dy,dz),step=Math.min(len,dt*20),old={x:p.x,y:p.y,z:p.z};g.life-=dt;p.y=Math.max(0,p.y+dy/Math.max(.01,len)*step);for(const axis of ['x','z']){p[axis]+=(axis==='x'?dx:dz)/Math.max(.01,len)*step;for(const b of this.boxes)if(p.y<b.y1-.05&&p.x+p.r>b.x0&&p.x-p.r<b.x1&&p.z+p.r>b.z0&&p.z-p.r<b.z1)p[axis]=old[axis];}p.vy=3;p.vx=p.vz=0;p.grounded=false;if(len<1||g.life<=0)p.grapple=null;return;}"+s[b:]
p.write_text(s)
