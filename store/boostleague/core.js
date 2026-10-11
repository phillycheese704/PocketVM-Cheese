/* Boost League — fixed-step 3D car / ball simulation. No network dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BoostLeague=api;})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),lerp=(a,b,t)=>a+(b-a)*t,TAU=Math.PI*2;
 const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));
 const FIELD={x:41,z:56,height:24,goal:15,goalHeight:12,depth:12,ball:2.15};
 const ARENAS=[{id:'champions',name:'Champions Field',sky:'#172b47',horizon:'#879da2',grass:'#28785e',stripe:'#236c56',light:'#69e8ff'},{id:'neon',name:'Neon District',sky:'#100e2c',horizon:'#52417c',grass:'#184b54',stripe:'#153f49',light:'#ed7aff'},{id:'frost',name:'Frostline',sky:'#203348',horizon:'#b7d6e6',grass:'#628e99',stripe:'#577f8e',light:'#b1ffff'}];
 const COLORS=['#3cafff','#ef6b35','#bd73ff','#52e2b1','#f4d45d','#e8edf5'];
 function clean(raw={}){const d=raw&&typeof raw==='object'?raw:{},p=d.prefs||{},num=v=>Math.floor(clamp(Number.isFinite(Number(v))?Number(v):0,0,999999));return{version:1,matches:num(d.matches),wins:Math.min(num(d.wins),num(d.matches)),goals:num(d.goals),saves:num(d.saves),demos:num(d.demos),bestGoals:num(d.bestGoals),prefs:{teamSize:[1,2,3,'random'].includes(p.teamSize)?p.teamSize:2,difficulty:['rookie','pro','allstar','random'].includes(p.difficulty)?p.difficulty:'pro',arena:ARENAS.some(a=>a.id===p.arena)||p.arena==='random'?p.arena:'champions',minutes:[2,3,5,'random'].includes(p.minutes)?p.minutes:3,color:/^#[0-9a-f]{6}$/i.test(p.color||'')?p.color:COLORS[0],body:['striker','vector','bulldog'].includes(p.body)?p.body:'striker',decal:['stripe','bolt','clean'].includes(p.decal)?p.decal:'stripe',sound:p.sound!==false,ballCam:p.ballCam!==false,touch:['auto','on','off'].includes(p.touch)?p.touch:'auto',quality:['high','low'].includes(p.quality)?p.quality:'high'}};}
 function random(seed=1){let s=seed>>>0;return()=>{s=(s+0x6d2b79f5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};}
 function ground(x,z){const sx=Math.max(0,Math.abs(x)-(FIELD.x-7)),sz=Math.abs(x)<FIELD.goal-1?0:Math.max(0,Math.abs(z)-(FIELD.z-7));return .13*Math.max(sx*sx,sz*sz);}
 function surface(x,z){const h=ground(x,z),e=.1;let nx=(h-ground(x+e,z))/e,nz=(h-ground(x,z+e))/e,n=Math.hypot(nx,1,nz);return{h,nx:nx/n,ny:1/n,nz:nz/n};}
 function car(id,team,index,color,body){return{id,team,index,color,body,x:0,y:.85,z:0,vx:0,vy:0,vz:0,yaw:team?Math.PI:0,pitch:0,roll:0,boost:33,boosting:false,grounded:true,jumps:0,jumpAge:0,lastJump:false,flip:0,flipDir:0,respawn:0,touches:0,goals:0,saves:0,demos:0,thought:0,botInput:{},trail:[],speed:0};}
 class Match{
  constructor(options={},seed=Date.now()){
   this.rng=random(seed);const pick=a=>a[Math.floor(this.rng()*a.length)];this.options={teamSize:options.teamSize==='random'?pick([1,2,3]):[1,2,3].includes(options.teamSize)?options.teamSize:2,difficulty:options.difficulty==='random'?pick(['rookie','pro','allstar']):['rookie','pro','allstar'].includes(options.difficulty)?options.difficulty:'pro',arena:options.arena==='random'?pick(ARENAS.map(a=>a.id)):ARENAS.some(a=>a.id===options.arena)?options.arena:'champions',minutes:options.minutes==='random'?pick([2,3,5]):[2,3,5].includes(options.minutes)?options.minutes:3,freeplay:!!options.freeplay,color:/^#[0-9a-f]{6}$/i.test(options.color||'')?options.color:COLORS[0],body:options.body||'striker',decal:options.decal||'stripe'};
   this.arena=ARENAS.find(a=>a.id===this.options.arena);this.score=[0,0];this.time=this.options.minutes*60;this.elapsed=0;this.overtime=false;this.phase=this.options.freeplay?'playing':'kickoff';this.phaseTime=this.options.freeplay?0:3;this.events=[];this.particles=[];this.lastTouch=null;this.winner=null;this.goalTeam=null;this.goalName='';this.cars=[];
   const n=this.options.freeplay?1:this.options.teamSize;for(let team=0;team<(this.options.freeplay?1:2);team++)for(let i=0;i<n;i++)this.cars.push(car(team*n+i,team,i,team?'#ff913d':i===0?this.options.color:'#5fe0ff',i===0?this.options.body:'striker'));
   this.player=this.cars[0];this.pads=[];for(const x of [-33,33])for(const z of [-43,0,43])this.pads.push({x,z,big:true,cool:0});for(const z of [-35,-18,0,18,35])for(const x of [-20,0,20])if(x!==0||Math.abs(z)!==35)this.pads.push({x,z,big:false,cool:0});this.resetPositions();
  }
  resetPositions(){const n=this.options.teamSize;for(const c of this.cars){const sign=c.team?-1:1;Object.assign(c,{x:n===1?0:(c.index-(n-1)/2)*15,y:.85,z:-sign*(c.index===0?37:44),vx:0,vy:0,vz:0,yaw:c.team?Math.PI:0,pitch:0,roll:0,boost:33,boosting:false,jumps:0,jumpAge:0,lastJump:false,flip:0,respawn:0,grounded:true,trail:[],thought:0,botInput:{}});}this.ball={x:0,y:FIELD.ball,z:0,vx:0,vy:0,vz:0,spin:0,trail:[]};this.lastTouch=null;this.pads.forEach(p=>p.cool=0);}
  resetBall(){if(!this.options.freeplay)return;this.ball={x:0,y:FIELD.ball,z:0,vx:0,vy:0,vz:0,spin:0,trail:[]};const p=this.player;Object.assign(p,{x:0,y:.85,z:-25,vx:0,vy:0,vz:0,yaw:0,grounded:true,jumps:0,pitch:0,roll:0});}
  emit(type,data={}){this.events.push({type,...data});}
  burst(x,y,z,color,count=20,power=12){for(let i=0;i<count;i++){const a=this.rng()*TAU,b=this.rng();this.particles.push({x,y,z,vx:Math.cos(a)*power*b,vy:power*(.3+this.rng()),vz:Math.sin(a)*power*b,life:.6+this.rng()*.8,color,size:.12+this.rng()*.22});}if(this.particles.length>220)this.particles.splice(0,this.particles.length-220);}
  goal(team){if(this.phase!=='playing')return;this.score[team]++;this.goalTeam=team;const last=this.lastTouch&&this.cars.find(c=>c.id===this.lastTouch.id);this.goalName=last&&last.team===team?(last.id===0?'YOU':['MICA','RIFT','NOVA','AXEL','ECHO'][last.id-1]||'TEAMMATE'):team===0?'BLUE TEAM':'ORANGE TEAM';if(last&&last.team===team)last.goals++;this.burst(this.ball.x,4,this.ball.z,team?'#ff9849':'#62d5ff',100,25);this.emit('goal',{team,name:this.goalName,player:last?.id===0&&last.team===team});if(this.options.freeplay){this.phase='goal';this.phaseTime=2;}else if(this.overtime||this.time<=0){this.finish();}else{this.phase='goal';this.phaseTime=2.6;}}
  finish(){this.phase='finished';this.winner=this.score[0]===this.score[1]?null:this.score[0]>this.score[1]?0:1;this.emit('finish',{winner:this.winner});}
  bot(c,dt){
   const skill=this.options.difficulty==='rookie'?.57:this.options.difficulty==='pro'?.83:1;c.thought-=dt;if(c.thought>0)return c.botInput;c.thought=lerp(.32,.055,skill);
   const b=this.ball,sign=c.team?-1:1,team=this.cars.filter(a=>a.team===c.team&&a.respawn<=0);team.sort((a,d)=>Math.hypot(a.x-b.x,a.z-b.z)-Math.hypot(d.x-b.x,d.z-b.z));let x,z;
   if(team[0]===c){const prediction=clamp(Math.hypot(c.x-b.x,c.z-b.z)/40,0,.65)*skill,bx=clamp(b.x+b.vx*prediction,-36,36),bz=clamp(b.z+b.vz*prediction,-51,51),dx=-bx,dz=sign*FIELD.z-bz,l=Math.hypot(dx,dz)||1; x=bx-dx/l*4.5;z=bz-dz/l*4.5;
    if(Math.hypot(c.x-x,c.z-z)<7){x=bx+dx/l*4;z=bz+dz/l*4;}
   }else{const role=team.indexOf(c);x=clamp(b.x*(role===1?.65:.3)+(c.index%2?8:-8),-27,27);z=role===1?clamp(b.z-sign*18,-38,38):-sign*43;}
   if(b.z*sign<-38&&Math.abs(b.x)<24){x=b.x+b.vx*.13;z=b.z-sign*3;}
   const dx=x-c.x,dz=z-c.z,dist=Math.hypot(dx,dz),a=angle(Math.atan2(dx,dz)-c.yaw),ballDist=Math.hypot(b.x-c.x,b.z-c.z),jump=ballDist<8&&b.y>2.9&&b.y<8&&Math.abs(a)<.55&&skill>.6||!c.grounded&&c.jumps===1&&c.jumpAge>.19&&ballDist<5&&b.y<5;
   c.botInput={steer:clamp(a*1.6,-1,1),throttle:dist<2?.15:Math.abs(a)>2.5&&dist<11?-.7:lerp(.63,1,skill),boost:Math.abs(a)<.23&&dist>15&&c.boost>5&&skill>.65,slide:Math.abs(a)>.95&&c.speed>13,jump};return c.botInput;
  }
  updateCar(c,input,dt){
   if(c.respawn>0){c.respawn-=dt;if(c.respawn<=0){Object.assign(c,{x:(c.index-1)*8,y:.85,z:c.team?43:-43,vx:0,vy:0,vz:0,yaw:c.team?Math.PI:0,boost:33,grounded:true,jumps:0,pitch:0,roll:0});this.emit('respawn',{id:c.id});}return;}
   const steer=clamp(Number(input.steer)||0,-1,1),throttle=clamp(Number(input.throttle)||0,-1,1),jump=!!input.jump,boost=!!input.boost&&(c.boost>0||this.options.freeplay),fX=Math.sin(c.yaw),fZ=Math.cos(c.yaw),rightX=fZ,rightZ=-fX;
   let forward=c.vx*fX+c.vz*fZ,lateral=c.vx*rightX+c.vz*rightZ;
   if(c.grounded){const turn=(.4+Math.min(Math.abs(forward),22)/22*1.75)*(input.slide?1.35:1);c.yaw+=steer*turn*(forward<-.8?-1:1)*dt;forward+=throttle*25*dt;if(!throttle)forward*=Math.exp(-.8*dt);if(throttle*forward<0)forward*=Math.exp(-3*dt);lateral*=Math.exp(-(input.slide?1.8:10)*dt);if(boost){forward+=40*dt;c.boost=Math.max(0,c.boost-30*dt);}forward=clamp(forward,-17,boost?51:Math.max(34,forward*Math.exp(-.9*dt)));c.vx=Math.sin(c.yaw)*forward+Math.cos(c.yaw)*lateral;c.vz=Math.cos(c.yaw)*forward-Math.sin(c.yaw)*lateral;c.pitch=lerp(c.pitch,0,1-Math.exp(-8*dt));c.roll=lerp(c.roll,-steer*Math.min(.12,c.speed*.004),1-Math.exp(-8*dt));}
   else{c.yaw+=steer*1.7*dt;c.pitch=clamp(c.pitch+throttle*.95*dt,-1.05,1.05);c.roll=lerp(c.roll,input.slide?steer*.9:0,1-Math.exp(-3*dt));if(boost){c.vx+=Math.sin(c.yaw)*Math.cos(c.pitch)*37*dt;c.vz+=Math.cos(c.yaw)*Math.cos(c.pitch)*37*dt;c.vy+=Math.sin(c.pitch)*37*dt;c.boost=Math.max(0,c.boost-30*dt);}c.jumpAge+=dt;}
   if(jump&&!c.lastJump){if(c.grounded){c.vy=14.5;c.grounded=false;c.jumps=1;c.jumpAge=0;this.emit('jump',{id:c.id});}else if(c.jumps===1&&c.jumpAge<1.5){c.jumps=2;if(Math.abs(throttle)+Math.abs(steer)>.2){const a=c.yaw+Math.atan2(steer,throttle||.001);c.vx+=Math.sin(a)*14;c.vz+=Math.cos(a)*14;c.vy=Math.max(c.vy,3.5);c.flip=.55;c.flipDir=throttle<0?-1:1;this.emit('dodge',{id:c.id});}else{c.vy+=11;this.emit('jump',{id:c.id});}}}c.lastJump=jump;c.flip=Math.max(0,c.flip-dt);c.boosting=boost;if(this.options.freeplay)c.boost=100;
   if(!c.grounded)c.vy-=27*dt;c.x+=c.vx*dt;c.z+=c.vz*dt;c.y+=c.vy*dt;
   const h=ground(c.x,c.z)+.85;if(c.grounded)c.y=h;if(c.y<=h&&c.vy<=Math.max(0,(h-(ground(c.x-c.vx*dt,c.z-c.vz*dt)+.85))/dt)){if(!c.grounded&&c.vy<-3)this.emit('land',{id:c.id});c.y=h;c.vy=0;c.grounded=true;c.jumps=0;c.jumpAge=0;}
   if(Math.abs(c.x)>FIELD.x-1.45){c.x=Math.sign(c.x)*(FIELD.x-1.45);c.vx*=-.38;if(c.id===0)this.emit('bump',{speed:Math.abs(c.vx)});}
   const inGoal=Math.abs(c.x)<FIELD.goal-2&&c.y<FIELD.goalHeight-2,limit=inGoal?FIELD.z+FIELD.depth-2:FIELD.z-1.5;
   if(Math.abs(c.z)>limit){c.z=Math.sign(c.z)*limit;c.vz*=-.38;}
   if(c.y>FIELD.height-1){c.y=FIELD.height-1;c.vy=-Math.abs(c.vy)*.4;}
   c.speed=Math.hypot(c.vx,c.vz);if(c.speed>56){c.vx*=56/c.speed;c.vz*=56/c.speed;c.speed=56;}
   for(const p of this.pads)if(p.cool<=0&&c.y<2&&Math.hypot(c.x-p.x,c.z-p.z)<(p.big?3.2:2.5)&&c.boost<99){c.boost=p.big?100:Math.min(100,c.boost+12);p.cool=p.big?10:4;this.emit('pad',{id:c.id,big:p.big});}
  }
  carBall(c){
   if(c.respawn>0)return;const b=this.ball,fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),dx=b.x-c.x,dz=b.z-c.z,localX=dx*fz-dz*fx,localZ=dx*fx+dz*fz,localY=b.y-c.y,nearX=clamp(localX,-1.4,1.4),nearZ=clamp(localZ,-2.35,2.35),nearY=clamp(localY,-.75,.75);let nx=(localX-nearX)*fz+(localZ-nearZ)*fx,ny=localY-nearY,nz=-(localX-nearX)*fx+(localZ-nearZ)*fz,l=Math.hypot(nx,ny,nz);if(l>=FIELD.ball)return;
   if(l<.001){nx=fx;ny=.25;nz=fz;l=Math.hypot(nx,ny,nz);}nx/=l;ny/=l;nz/=l;const pen=FIELD.ball-l;b.x+=nx*pen*.91;b.y+=ny*pen*.91;b.z+=nz*pen*.91;c.x-=nx*pen*.09;c.z-=nz*pen*.09;
   const rvx=b.vx-c.vx,rvy=b.vy-c.vy,rvz=b.vz-c.vz,closing=rvx*nx+rvy*ny+rvz*nz;if(closing<0){const power=-closing*1.28+Math.min(c.speed,30)*.13+1.8,before=b.vz;b.vx+=nx*power;b.vy+=ny*power+(c.grounded?Math.min(7,c.speed*.19):1.5);b.vz+=nz*power;c.vx-=nx*power*.09;c.vz-=nz*power*.09;c.touches++;this.lastTouch={id:c.id,team:c.team,time:this.elapsed};this.emit('hit',{id:c.id,power});if(c.id===0&&b.z<-37&&before<-8&&b.vz>before+8){c.saves++;this.emit('save',{id:0});}this.burst(b.x,b.y,b.z,c.team?'#ffb474':'#b1ecff',Math.min(12,Math.ceil(power/3)),5);}
  }
  carCars(){for(let i=0;i<this.cars.length;i++)for(let j=i+1;j<this.cars.length;j++){const a=this.cars[i],b=this.cars[j];if(a.respawn>0||b.respawn>0||Math.abs(a.y-b.y)>1.6)continue;let dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);if(l>=3.2)continue;if(l<.001){dx=1;dz=0;l=1;}const nx=dx/l,nz=dz/l,close=(b.vx-a.vx)*nx+(b.vz-a.vz)*nz;if(a.team!==b.team&&close<-32&&(a.boosting&&a.speed>40||b.boosting&&b.speed>40)){const attacker=a.boosting&&a.speed>=b.speed?a:b,victim=attacker===a?b:a;victim.respawn=3;attacker.demos++;this.burst(victim.x,2,victim.z,'#ffa95e',35,17);this.emit('demo',{id:attacker.id,victim:victim.id});continue;}const overlap=3.2-l;a.x-=nx*overlap*.5;a.z-=nz*overlap*.5;b.x+=nx*overlap*.5;b.z+=nz*overlap*.5;if(close<0){const impulse=-close*.63;a.vx-=nx*impulse;a.vz-=nz*impulse;b.vx+=nx*impulse;b.vz+=nz*impulse;this.emit('bump',{speed:-close});}}}
  updateBall(dt){
   const b=this.ball,r=FIELD.ball;b.vy-=21*dt;b.vx*=Math.exp(-.055*dt);b.vz*=Math.exp(-.055*dt);b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.spin+=Math.hypot(b.vx,b.vz)*dt/r;
   const s=surface(b.x,b.z);if(b.y<s.h+r){b.y=s.h+r;const v=b.vx*s.nx+b.vy*s.ny+b.vz*s.nz;if(v<-.8){b.vx-=1.73*v*s.nx;b.vy-=1.73*v*s.ny;b.vz-=1.73*v*s.nz;if(-v>5)this.emit('bounce',{power:-v});}else{b.vy=0;b.vx*=Math.exp(-.6*dt);b.vz*=Math.exp(-.6*dt);}}
   if(Math.abs(b.x)>FIELD.x-r){b.x=Math.sign(b.x)*(FIELD.x-r);b.vx=-Math.sign(b.x)*Math.abs(b.vx)*.82;this.emit('bounce',{power:Math.abs(b.vx)});}
   const aperture=Math.abs(b.x)<FIELD.goal-r&&b.y<FIELD.goalHeight-r;
   if(Math.abs(b.z)>FIELD.z-r&&!aperture){b.z=Math.sign(b.z)*(FIELD.z-r);b.vz=-Math.sign(b.z)*Math.abs(b.vz)*.82;this.emit('bounce',{power:Math.abs(b.vz)});}
   if(aperture&&Math.abs(b.z)>FIELD.z+r){this.goal(b.z>0?0:1);return;}
   if(b.y>FIELD.height-r){b.y=FIELD.height-r;b.vy=-Math.abs(b.vy)*.7;}
   const speed=Math.hypot(b.vx,b.vy,b.vz);if(speed>72){b.vx*=72/speed;b.vy*=72/speed;b.vz*=72/speed;}
  }
  step(dt,input={}){
   dt=clamp(dt,0,1/30);this.elapsed+=dt;for(const p of this.particles){p.life-=dt;p.vy-=15*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;}this.particles=this.particles.filter(p=>p.life>0);
   if(this.phase==='finished')return;if(this.phase==='kickoff'||this.phase==='goal'){this.phaseTime-=dt;if(this.phaseTime<=0){if(this.phase==='goal'){this.resetPositions();this.phase=this.options.freeplay?'playing':'kickoff';this.phaseTime=this.options.freeplay?0:3;}else{this.phase='playing';this.emit('go');}}return;}
   this.pads.forEach(p=>p.cool=Math.max(0,p.cool-dt));for(const c of this.cars)this.updateCar(c,c.id===0?input:this.bot(c,dt),dt);this.carCars();this.updateBall(dt);for(const c of this.cars)this.carBall(c);
   if(this.phase==='playing'&&!this.options.freeplay){if(this.overtime)this.time+=dt;else{this.time=Math.max(0,this.time-dt);if(this.time===0&&this.ball.y<=ground(this.ball.x,this.ball.z)+FIELD.ball+.12){if(this.score[0]===this.score[1]){this.overtime=true;this.time=0;this.emit('overtime');this.resetPositions();this.phase='kickoff';this.phaseTime=3;}else this.finish();}}}
  }
 }
 return{Match,FIELD,ARENAS,COLORS,clean,ground,surface,clamp,lerp,angle,random};
});
