/* Ball vs Ball: original deterministic auto-battle simulation. */
(()=>{'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0)),len=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),TAU=Math.PI*2;
const WORLD=960,EDGE=40,CENTER=WORLD/2;
const overtimeMargin=time=>time>30?Math.min(170,(time-30)*5):0;
const spawn=(side,index=0,count=1)=>({x:side?WORLD-180:180,y:CENTER+(index-(count-1)/2)*150});
const specs=[
 ['classic','Classic','#f5d251','smile','A dependable bouncer. Every contact hits harder after a wall bounce.'],
 ['spike','Spike','#ec6975','spikes','Spikes deal 45% more collision damage.'],
 ['fire','Fire','#ed9a52','flame','Leaves burning patches and ignites opponents on contact.'],
 ['ice','Ice','#83d3e6','snow','Freezes opponents briefly on contact.'],
 ['laser','Laser','#dc7ddc','laser','Fires an accurate beam at the nearest enemy every 3.2 seconds.'],
 ['vampire','Vampire','#a985ce','fangs','Collision damage restores some of your health.'],
 ['shield','Shield','#7cadde','shield','A renewable shield absorbs incoming hits.'],
 ['bolt','Lightning','#f5cc67','bolt','Chain lightning arcs through nearby opponents.'],
 ['bomb','Bomb','#5c7189','bomb','Periodic explosions hurt nearby enemies.'],
 ['grow','Giant','#bf9c73','grow','Grows and gains impact power as the round progresses.'],
 ['heal','Medic','#8cd0a4','plus','Restores health every five seconds.'],
 ['poison','Poison','#a9c67f','skull','Contact applies stacking poison damage.'],
 ['shadow','Shadow','#83789a','crescent','Vanishes briefly, dodging damage, then strikes harder.'],
 ['split','Splitter','#96c7b5','split','Launches two little bouncing fragments.'],
 ['magnet','Magnet','#e78798','magnet','Pulls its nearest opponent closer for a heavy collision.'],
 ['gravity','Gravity','#9b9bd8','orbit','Creates a gravity well that bends enemy paths.'],
 ['rocket','Rocket','#edba89','rocket','Accelerates toward its target in explosive bursts.'],
 ['rubber','Rubber','#e69bce','swirl','Wall hits boost speed and restore a little health.'],
 ['stone','Stone','#8faaa8','rock','Heavy armour reduces all damage, but moves slowly.'],
 ['ghost','Ghost','#c1dce2','ghost','Phases through contact damage during spectral windows.'],
 ['thorn','Thorn','#85a883','thorn','Reflects a portion of collision damage back at the attacker.'],
 ['mirror','Mirror','#c0ccd7','diamond','A reflective barrier sends projectile hits back as damage.'],
 ['orbit','Orbiter','#78b4d1','orbit','Two orbiting satellites hurt enemies that come close.'],
 ['chain','Chain','#a6a8cb','chain','Every third wall hit lashes its nearest enemy.'],
 ['glacier','Glacier','#a9dce3','snow','Periodic frost waves slow the entire opposing team.'],
 ['phoenix','Phoenix','#e59782','wings','Returns once from defeat with 35% health.'],
 ['meteor','Meteor','#bf8b70','meteor','Calls a delayed meteor onto an enemy’s last position.'],
 ['water','Water','#72b7cf','drop','A healing splash washes away poison and fire.'],
 ['wind','Wind','#a1d6bf','wind','Air bursts push enemies away and increase your speed.'],
 ['sticky','Sticky','#cad79d','slime','Collision goo drains an opponent’s speed and cooldown.'],
 ['saw','Saw','#dca58c','saw','Spinning teeth stack collision power during sustained combat.'],
 ['sonic','Sonic','#ada8e4','wave','Periodic shock rings damage and knock enemies away.'],
 ['quake','Quake','#b99c76','quake','Wall slams send a tremor through the enemy team.'],
 ['swap','Switcher','#cab5e1','swap','Swaps velocity with its target, then releases a pulse.'],
 ['bee','Bee','#e2ca6b','bee','Sends homing stingers after its opponent.'],
 ['cactus','Cactus','#80b68e','cactus','Releases six needles whenever it hits a wall.'],
 ['crystal','Crystal','#a5c1ed','diamond','Launches a three-way crystal volley.'],
 ['sun','Sun','#f1bd70','sun','An expanding solar aura burns nearby enemies.'],
 ['moon','Moon','#a3b4d0','crescent','Charges between eclipses, then drains health at a distance.'],
 ['rainbow','Rainbow','#e9a9bc','rainbow','Cycles between fire, frost and healing pulses.'],
 ['void','Void','#8f91b8','void','Leaves dangerous void pools when it hits a wall.'],
 ['king','King','#e8cb89','crown','Commands a volley of three royal bolts and gains armour.'],
 ['bubble','Bubble','#8bd8d0','bubble','Gains a bubble shield on wall hits and releases a splash.'],
 ['dice','Dice','#efddba','dice','Rolls a different power: heal, shield, speed or a wild volley.'],
 ['comet','Comet','#efa293','comet','Dashes diagonally past its target and leaves a fiery wake.'],
 ['prism','Prism','#b7c9ea','prism','Splits light into five ricocheting coloured bolts.'],
 ['ninja','Ninja','#788fa8','ninja','Phases briefly and throws a fast pair of shuriken.'],
 ['boomerang','Boomerang','#deb375','boomerang','Sends curved homing blades that bounce twice.'],
 ['scorpion','Scorpion','#c08ea2','scorpion','A venom sting slows and poisons the closest opponent.'],
 ['angel','Angel','#e9dfba','angel','Heals every surviving ally and grants them a small shield.'],
 ['portal','Portal','#b290da','portal','Blinks to a safe random place, then bursts outward.'],
 ['drill','Drill','#bda68b','drill','Charges an enemy with a temporary boost to impact damage.'],
 ['tornado','Tornado','#93cfb8','tornado','A swirling vortex bends paths and flings nearby enemies.'],
 ['mushroom','Mushroom','#da9e9b','mushroom','Drops a spore patch that poisons and slows enemies.'],
 ['anchor','Anchor','#8da9bc','anchor','Drops an anchor pulse that freezes nearby opponents.'],
 ['neon','Neon','#97e0ce','neon','Rapid little laser pulses chain through nearby enemies.'],
 ['clock','Clockwork','#dcc794','clock','Delays enemy abilities while accelerating its own team.'],
 ['dragon','Dragon','#da907d','dragon','Breathes a fan of fireballs and burns nearby rivals.'],
 ['spark','Spark','#e8d88c','spark','Wall impacts release electric sparks toward an enemy.'],
 ['echo','Echo','#b4a8da','echo','Repeats its shockwave twice, with a delayed second hit.']
];
const BALLS=specs.map((a,i)=>{const rarity=i<8||i>=42&&i<46?0:i<22||i>=46&&i<50?1:i<36||i>=50&&i<56?2:3;return{id:a[0],name:a[1]+' Ball',color:a[2],art:a[3],description:a[4],rarity,price:[0,300,650,1100][rarity],hp:['stone','grow','king','anchor'].includes(a[0])?260:a[0]==='ghost'?190:220,mass:['stone','anchor'].includes(a[0])?1.6:a[0]==='grow'?1.3:1,speed:['stone','anchor'].includes(a[0])?145:a[0]==='rocket'?245:200,damage:a[0]==='spike'?30:a[0]==='stone'?25:21};});
const STARTERS=BALLS.filter(b=>b.rarity===0).map(b=>b.id),RARITIES=['Common','Uncommon','Rare','Legendary'];
const ARENAS=[{id:'classic',name:'Classic Court',floor:'#d5d9de',wall:'#737e8d',accent:'#a3b2c3',obstacles:[]},
 {id:'sky',name:'Sky Garden',floor:'#dae5d8',wall:'#879d8f',accent:'#b3cebd',obstacles:[{x:480,y:480,r:65}]},
 {id:'forge',name:'Neon Forge',floor:'#293849',wall:'#50627a',accent:'#e5a169',obstacles:[{x:350,y:320,r:40},{x:610,y:640,r:40}]},
 {id:'cosmic',name:'Moon Court',floor:'#d2cfdf',wall:'#8d839f',accent:'#b3a7ce',obstacles:[]},
 {id:'pinball',name:'Pinball Park',floor:'#dbd7c6',wall:'#979078',accent:'#c3a67a',obstacles:[{x:350,y:275,r:36},{x:610,y:275,r:36},{x:480,y:480,r:44},{x:350,y:685,r:36},{x:610,y:685,r:36}]},
 {id:'reef',name:'Coral Circuit',floor:'#c7dfdf',wall:'#729b9f',accent:'#95bab8',obstacles:[{x:335,y:420,r:48},{x:625,y:540,r:48}]}];
const fin=(n,d=0)=>Number.isFinite(Number(n))?Number(n):d;
function clean(raw={}){const d=raw&&typeof raw==='object'?raw:{},p=d.prefs||{},owned=[...new Set([...STARTERS,...(Array.isArray(d.owned)?d.owned:[]).filter(id=>BALLS.some(b=>b.id===id))])],stats={};for(const k of ['matches','wins','losses','rounds','knockouts','bestStreak','streak','packs'])stats[k]=Math.floor(clamp(fin(d.stats?.[k]),0,99999999));return{version:1,coins:Math.floor(clamp(fin(d.coins,300),0,999999999)),owned,selected:owned.includes(d.selected)?d.selected:'classic',stats,seed:Math.floor(clamp(fin(d.seed,951713),1,4294967295)),pity:Math.floor(clamp(fin(d.pity),0,4)),prefs:{music:p.music!==false,effects:p.effects!==false,volume:clamp(fin(p.volume,.35),0,1),difficulty:['easy','normal','hard','random'].includes(p.difficulty)?p.difficulty:'normal',arena:ARENAS.some(a=>a.id===p.arena)||p.arena==='random'?p.arena:'classic',motion:p.motion!==false,mode:['solo','team','chaos','local'].includes(p.mode)?p.mode:'solo'}};}
function rng(seed){let n=seed>>>0;return()=>{let t=n+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
class Round{
 constructor({types=['classic','spike'],angles=[0,Math.PI],team=false,teamSize,arena='classic',seed=1,difficulty='normal'}={}){this.random=rng(seed);const template=ARENAS.find(a=>a.id===arena)||ARENAS[0];this.arena={...template,obstacles:template.obstacles.map(o=>({...o,x:o.x+(this.random()-.5)*28,y:o.y+(this.random()-.5)*28}))};this.time=0;this.entities=[];this.projectiles=[];this.zones=[];this.effects=[];this.events=[];this.damageText=[];this.pairs=new Map();this.done=false;this.result=null;this.id=0;this.overtime=false;this.difficulty=difficulty;const count=Math.floor(clamp(teamSize??(team?2:1),1,4));for(let i=0;i<count*2;i++){const side=i%2,slot=Math.floor(i/2),type=types[i]||types[side]||'classic',def=BALLS.find(b=>b.id===type)||BALLS[0],baseAngle=angles[i]??(side?Math.PI:0),angle=baseAngle+(slot?((slot%2?1:-1)*(.18+this.random()*.3)):0),scale=side===1?(difficulty==='easy'?.9:difficulty==='hard'?1.08:1):1;this.entities.push({uid:this.id++,type:def.id,team:side,...spawn(side,slot,count),vx:Math.cos(angle)*def.speed,vy:Math.sin(angle)*def.speed,r:30,max:def.hp*scale,hp:def.hp*scale,mass:def.mass,speed:def.speed,damage:def.damage*scale,spin:0,cooldown:1.5+this.random()*2,shield:type==='shield'?45:0,slow:0,freeze:0,burn:0,poison:0,phased:0,flash:0,walls:0,hits:0,revived:false,boost:0});}}
 rebound(b,nx,ny){const speed=Math.hypot(b.vx,b.vy),normal=Math.atan2(ny,nx),relative=Math.atan2(Math.sin(Math.atan2(b.vy,b.vx)-normal),Math.cos(Math.atan2(b.vy,b.vx)-normal)),angle=normal+clamp(relative+(this.random()-.5)*.42,-1.28,1.28),next=clamp(speed*(.94+this.random()*.12),['stone','anchor'].includes(b.type)?140:175,['rocket','comet','drill'].includes(b.type)?410:315);b.vx=Math.cos(angle)*next;b.vy=Math.sin(angle)*next;}
 scatter(a,b){const mass=a.mass+b.mass,cx=(a.vx*a.mass+b.vx*b.mass)/mass,cy=(a.vy*a.mass+b.vy*b.mass)/mass,dx=b.vx-a.vx,dy=b.vy-a.vy,angle=(this.random()-.5)*.20,rx=dx*Math.cos(angle)-dy*Math.sin(angle),ry=dx*Math.sin(angle)+dy*Math.cos(angle);a.vx=cx-rx*b.mass/mass;a.vy=cy-ry*b.mass/mass;b.vx=cx+rx*a.mass/mass;b.vy=cy+ry*a.mass/mass;}

 enemies(b){return this.entities.filter(x=>x.team!==b.team&&x.hp>0)}
 target(b){return this.enemies(b).sort((a,c)=>len(a,b)-len(c,b))[0]}
 emit(type,data){this.events.push({type,...data});}
 effect(kind,x,y,color='#fff',r=40){this.effects.push({kind,x,y,color,r,t:0,life:kind==='beam'?.28:.6});}
 damage(b,amount,source,kind='hit'){
 if(this.done||b.hp<=0||b.phased>0&&kind==='hit')return 0;
 if(b.type==='stone'||b.type==='king')amount*=b.type==='stone'?.72:.88;
 if(b.shield>0){const absorb=Math.min(amount,b.shield);b.shield-=absorb;amount-=absorb;this.effect('shield',b.x,b.y,'#a8d8ed',34);}
 if(b.type==='mirror'&&kind==='projectile'&&source&&source.hp>0){source.hp=Math.max(0,source.hp-amount*.5);amount*=.5;this.effect('ring',b.x,b.y,'#dce9ff',44);}
 const dealt=Math.min(b.hp,amount);b.hp=Math.max(0,b.hp-amount);b.flash=.12;this.damageText.push({x:b.x,y:b.y-28,value:Math.ceil(dealt),life:.7,team:b.team});
 if(b.hp<=0&&b.type==='phoenix'&&!b.revived){b.hp=b.max*.35;b.revived=true;b.burn=b.poison=0;this.effect('burst',b.x,b.y,'#ffb57b',65);this.emit('revive',{ball:b.uid});}
 else if(b.hp<=0){this.effect('burst',b.x,b.y,BALLS.find(x=>x.id===b.type).color,65);this.emit('knockout',{team:b.team,source:source?.team});}
 return dealt;
 }
 heal(b,amount){if(b.hp<=0)return;b.hp=Math.min(b.max,b.hp+amount);this.effect('plus',b.x,b.y,'#b5ecc6',32)}
 bullet(b,angle,options={}){this.projectiles.push({uid:this.id++,x:b.x,y:b.y,vx:Math.cos(angle)*(options.speed||330),vy:Math.sin(angle)*(options.speed||330),r:options.r||6,damage:options.damage||15,owner:b.uid,team:b.team,life:options.life||3,bounces:options.bounces||0,homing:options.homing||false,color:BALLS.find(x=>x.id===b.type).color});}
 pulse(b,range,damage,color,force=0){this.effect('ring',b.x,b.y,color,range);for(const e of this.enemies(b)){if(len(b,e)<range+e.r){this.damage(e,damage,b,'ability');if(force){const a=Math.atan2(e.y-b.y,e.x-b.x);e.vx+=Math.cos(a)*force;e.vy+=Math.sin(a)*force;}}}}
 skill(b){const t=this.target(b);if(!t)return;const a=Math.atan2(t.y-b.y,t.x-b.x),type=b.type;let cd=4.5;
 if(type==='laser'){this.damage(t,23,b,'projectile');this.effects.push({kind:'beam',x:b.x,y:b.y,x2:t.x,y2:t.y,color:'#f5abf1',r:4,t:0,life:.3});cd=3.2;}
 else if(type==='bolt'){this.damage(t,18,b,'ability');for(const e of this.enemies(b))if(e!==t&&len(e,t)<200)this.damage(e,12,b,'ability');this.effects.push({kind:'beam',x:b.x,y:b.y,x2:t.x,y2:t.y,color:'#ffe2a4',r:3,t:0,life:.35});cd=4;}
 else if(type==='bomb')this.pulse(b,155,32,'#ffba7d',80);
 else if(type==='heal')this.heal(b,19);
 else if(type==='shield'){b.shield=Math.min(60,b.shield+26);this.effect('shield',b.x,b.y,'#a8d9f3',36);cd=5.5;}
 else if(type==='shadow'||type==='ghost'){b.phased=1.4;cd=5;}
 else if(type==='split'){this.bullet(b,a-.45,{bounces:3,r:10,damage:17});this.bullet(b,a+.45,{bounces:3,r:10,damage:17});}
 else if(type==='magnet'){const d=Math.max(1,len(b,t));t.vx+=(b.x-t.x)/d*180;t.vy+=(b.y-t.y)/d*180;this.effect('ring',b.x,b.y,'#f3abbd',160);}
 else if(type==='gravity'){this.zones.push({x:b.x,y:b.y,r:130,team:b.team,owner:b.uid,kind:'gravity',life:2.5,t:0});}
 else if(type==='rocket'){b.vx=Math.cos(a)*320;b.vy=Math.sin(a)*320;this.effect('burst',b.x,b.y,'#facb8a',35);cd=3.6;}
 else if(type==='orbit'){this.pulse(b,83,24,'#9acbe6');cd=2.2;}
 else if(type==='glacier'){for(const e of this.enemies(b)){e.slow=2.8;this.damage(e,10,b,'ability');}this.effect('ring',b.x,b.y,'#c4efff',240);cd=6;}
 else if(type==='meteor'){this.zones.push({x:t.x,y:t.y,r:80,team:b.team,owner:b.uid,kind:'meteor',life:1.15,t:0});cd=4;}
 else if(type==='water'){b.burn=b.poison=0;this.heal(b,16);this.pulse(b,115,9,'#a6e3ef',65);}
 else if(type==='wind'){this.pulse(b,155,10,'#d1f3d5',150);b.vx*=1.2;b.vy*=1.2;cd=3.8;}
 else if(type==='sonic')this.pulse(b,175,24,'#cbc7ff',100);
 else if(type==='swap'){const vx=b.vx,vy=b.vy;b.vx=t.vx;b.vy=t.vy;t.vx=vx;t.vy=vy;this.damage(t,12,b,'ability');this.effect('ring',t.x,t.y,'#d7bce9',45);}
 else if(type==='bee'){for(let n=0;n<2;n++)this.bullet(b,a+(n-.5)*.5,{speed:190,homing:true,damage:12,life:4});cd=4;}
 else if(type==='crystal'){for(const n of [-1,0,1])this.bullet(b,a+n*.24,{damage:13,bounces:1});cd=3.8;}
 else if(type==='sun'){this.pulse(b,150,14,'#ffe7a4');cd=2.4;}
 else if(type==='moon'){const dealt=this.damage(t,16,b,'ability');this.heal(b,dealt*.4);this.effect('ring',t.x,t.y,'#c1d8f7',45);cd=4;}
 else if(type==='rainbow'){const cycle=Math.floor(this.time/4)%3;if(cycle===0){t.burn=3;this.pulse(b,180,13,'#f3b3a4');}else if(cycle===1){t.slow=2;this.damage(t,14,b,'ability');this.effect('ring',t.x,t.y,'#a7e7ef',55);}else this.heal(b,18);cd=4;}
 else if(type==='king'){for(const n of [-1,0,1])this.bullet(b,a+n*.13,{damage:15,speed:350});cd=4.7;}
 else if(type==='fire'){this.zones.push({x:b.x,y:b.y,r:47,team:b.team,owner:b.uid,kind:'fire',life:3,t:0});cd=2.7;}
 else if(type==='poison'){this.bullet(b,a,{damage:12,r:9,speed:230});t.poison=Math.max(t.poison,1.5);cd=5;}
 else if(type==='grow'){b.r=Math.min(38,b.r+1.8);b.mass+=.08;b.damage+=1.2;this.heal(b,5);cd=5;}
 else if(type==='sticky'){t.slow=1.8;t.cooldown+=.6;this.effect('ring',t.x,t.y,'#d2e6a5',42);cd=5;}
 else if(type==='saw'){b.damage=Math.min(34,b.damage+1);this.effect('ring',b.x,b.y,'#eac2ad',38);cd=5;}
 else if(type==='vampire'){this.pulse(b,105,13,'#d9aadf');cd=5;}
 else if(type==='spike'){this.pulse(b,65,11,'#f09fae');cd=4;}
 else if(type==='ice'){t.freeze=.35;this.damage(t,9,b,'ability');this.effect('ring',t.x,t.y,'#bcebf4',38);cd=5;}
 else if(type==='thorn'){this.pulse(b,80,12,'#b5d4a0');cd=5;}
 else if(type==='bubble'){b.shield=Math.min(65,b.shield+20);this.pulse(b,140,15,'#b3f2e6',100);cd=4;}
 else if(type==='dice'){const roll=Math.floor(this.random()*4);if(roll===0)this.heal(b,24);else if(roll===1)b.shield=Math.min(60,b.shield+28);else if(roll===2){const a=this.random()*TAU;b.vx=Math.cos(a)*300;b.vy=Math.sin(a)*300;this.pulse(b,140,16,'#f5dfb1',70);}else for(let n=0;n<5;n++)this.bullet(b,this.random()*TAU,{damage:13,bounces:2});this.effect('ring',b.x,b.y,'#f5dfb1',50);cd=3.6;}
 else if(type==='comet'){b.vx=Math.cos(a+.35)*370;b.vy=Math.sin(a+.35)*370;this.zones.push({x:b.x,y:b.y,r:65,team:b.team,owner:b.uid,kind:'fire',life:3,t:0});cd=3.4;}
 else if(type==='prism'){for(let n=-2;n<=2;n++)this.bullet(b,a+n*.28,{damage:10,bounces:3,speed:320});cd=4.7;}
 else if(type==='ninja'){b.phased=.75;for(const n of [-.15,.15])this.bullet(b,a+n,{damage:16,speed:420,r:5});cd=4.5;}
 else if(type==='boomerang'){for(const n of [-.6,.6])this.bullet(b,a+n,{damage:15,speed:220,homing:true,bounces:2,life:4});cd=4.5;}
 else if(type==='scorpion'){t.poison=Math.min(7,t.poison+3);t.slow=1.5;this.damage(t,12,b,'ability');this.effect('ring',t.x,t.y,'#dab0cb',45);cd=5.5;}
 else if(type==='angel'){for(const ally of this.entities)if(ally.team===b.team&&ally.hp>0){this.heal(ally,10);ally.shield=Math.min(45,ally.shield+8);}cd=5.8;}
 else if(type==='portal'){const margin=overtimeMargin(this.time);for(let n=0;n<12;n++){const x=EDGE+margin+65+this.random()*(WORLD-2*(EDGE+margin+65)),y=EDGE+margin+65+this.random()*(WORLD-2*(EDGE+margin+65));if(this.entities.every(e=>e===b||e.hp<=0||Math.hypot(x-e.x,y-e.y)>b.r+e.r+8)&&this.arena.obstacles.every(o=>Math.hypot(x-o.x,y-o.y)>b.r+o.r+8)){this.effect('ring',b.x,b.y,'#d0b5ef',65);b.x=x;b.y=y;break;}}this.pulse(b,145,22,'#d0b5ef',85);cd=5;}
 else if(type==='drill'){b.boost=1.7;b.vx=Math.cos(a)*380;b.vy=Math.sin(a)*380;this.effect('burst',b.x,b.y,'#dbc5a8',40);cd=4.2;}
 else if(type==='tornado'){this.zones.push({x:b.x,y:b.y,r:170,team:b.team,owner:b.uid,kind:'vortex',life:2.5,t:0});this.pulse(b,115,15,'#b7e8d8',130);cd=5;}
 else if(type==='mushroom'){this.zones.push({x:b.x,y:b.y,r:95,team:b.team,owner:b.uid,kind:'spore',life:3.8,t:0});cd=4.6;}
 else if(type==='anchor'){this.pulse(b,190,20,'#c0d6e1',35);for(const e of this.enemies(b))if(len(e,b)<190)e.freeze=.45;cd=5;}
 else if(type==='neon'){this.damage(t,11,b,'projectile');for(const e of this.enemies(b))if(e!==t&&len(e,t)<170)this.damage(e,7,b,'ability');this.effects.push({kind:'beam',x:b.x,y:b.y,x2:t.x,y2:t.y,color:'#b2ffe5',r:2,t:0,life:.2});cd=2.4;}
 else if(type==='clock'){t.cooldown+=1.4;t.slow=1.2;this.damage(t,12,b,'ability');for(const ally of this.entities)if(ally.team===b.team&&ally!==b)ally.cooldown=Math.max(.2,ally.cooldown-.6);this.effect('ring',b.x,b.y,'#eadcae',160);cd=5;}
 else if(type==='dragon'){for(let n=-2;n<=2;n++)this.bullet(b,a+n*.17,{damage:12,speed:280,life:2.4,r:8});for(const e of this.enemies(b))if(len(e,b)<220)e.burn=2;cd=4.8;}
 else if(type==='spark'){this.bullet(b,a,{damage:16,bounces:4,speed:380,r:5});cd=4;}
 else if(type==='echo'){this.pulse(b,165,15,'#d2c6f0',80);this.zones.push({x:b.x,y:b.y,r:190,team:b.team,owner:b.uid,kind:'echo',life:.65,t:0});cd=4.8;}
 b.cooldown=cd;
 }
 wall(b){b.walls++;this.emit('wall',{ball:b.uid});this.effect('impact',b.x,b.y,'#e2e7ee',28);
 if(b.type==='bubble')b.shield=Math.min(65,b.shield+7);
 if(b.type==='spark'){const t=this.target(b);if(t)this.bullet(b,Math.atan2(t.y-b.y,t.x-b.x),{damage:8,speed:350,bounces:2,r:5});}
 if(b.type==='classic')b.damage=Math.min(29,b.damage+.8);
 if(b.type==='rubber'){b.vx*=1.045;b.vy*=1.045;this.heal(b,2);}
 if(b.type==='chain'&&b.walls%3===0){const t=this.target(b);if(t){this.damage(t,18,b,'ability');this.effects.push({kind:'beam',x:b.x,y:b.y,x2:t.x,y2:t.y,color:'#c7c9ea',r:3,t:0,life:.3});}}
 if(b.type==='quake'&&b.walls%2===0){for(const t of this.enemies(b))this.damage(t,9,b,'ability');this.effect('ring',b.x,b.y,'#d9c094',180);}
 if(b.type==='cactus'){for(let k=0;k<6;k++)this.bullet(b,k*TAU/6,{damage:9,speed:230,life:1.8,r:4});}
 if(b.type==='void')this.zones.push({x:b.x,y:b.y,r:58,team:b.team,owner:b.uid,kind:'void',life:3,t:0});
 }
 contact(a,b){if(a.team===b.team)return;const key=a.uid+'-'+b.uid;if((this.pairs.get(key)||0)>this.time)return;this.pairs.set(key,this.time+.34);const da=this.damage(b,a.damage*(a.boost>0?1.4:a.type==='shadow'?1.12:1),a),db=this.damage(a,b.damage*(b.boost>0?1.4:1),b);a.hits++;b.hits++;if(a.type==='vampire')this.heal(a,da*.38);if(b.type==='vampire')this.heal(b,db*.38);if(a.type==='thorn')this.damage(b,db*.28,a,'ability');if(b.type==='thorn')this.damage(a,da*.28,b,'ability');for(const [source,target]of[[a,b],[b,a]]){if(source.type==='fire')target.burn=3;if(source.type==='poison')target.poison=Math.min(7,target.poison+3);if(source.type==='ice')target.freeze=.55;if(source.type==='sticky')target.slow=2.2;}
 this.effect('impact',(a.x+b.x)/2,(a.y+b.y)/2,'#fff6dc',38);this.emit('hit',{x:(a.x+b.x)/2,y:(a.y+b.y)/2});}
 step(dt){if(this.done)return;dt=clamp(dt,0,.05);let left=dt;while(left>1e-7&&!this.done){const d=Math.min(left,1/120);this.tick(d);left-=d;}}
 tick(dt){this.time+=dt;this.overtime=this.time>30;const margin=overtimeMargin(this.time),low=EDGE+margin,high=WORLD-EDGE-margin;
 for(const b of this.entities){if(b.hp<=0)continue;for(const key of ['slow','freeze','burn','poison','phased','flash','boost'])b[key]=Math.max(0,b[key]-dt);if(b.burn>0)this.damage(b,dt*4,null,'status');if(b.poison>0)this.damage(b,dt*3.4,null,'status');if(this.overtime)this.damage(b,dt*(2+(this.time-30)*.25),null,'overtime');b.cooldown-=dt;if(b.cooldown<=0)this.skill(b);
 if(b.freeze<=0){const slow=b.slow>0?.62:1;b.x+=b.vx*dt*slow;b.y+=b.vy*dt*slow;b.spin+=Math.hypot(b.vx,b.vy)*dt*.009;}const speed=Math.hypot(b.vx,b.vy),max=['rocket','comet','drill'].includes(b.type)?410:315,min=['stone','anchor'].includes(b.type)?140:175;if(speed<min){const angle=speed<1?this.random()*TAU:Math.atan2(b.vy,b.vx);b.vx=Math.cos(angle)*min;b.vy=Math.sin(angle)*min;}else if(speed>max){b.vx*=max/speed;b.vy*=max/speed;}
 let bounced=false,nx=0,ny=0;if(b.x-b.r<low){b.x=low+b.r;b.vx=Math.abs(b.vx);nx++;bounced=true;}if(b.x+b.r>high){b.x=high-b.r;b.vx=-Math.abs(b.vx);nx--;bounced=true;}if(b.y-b.r<low){b.y=low+b.r;b.vy=Math.abs(b.vy);ny++;bounced=true;}if(b.y+b.r>high){b.y=high-b.r;b.vy=-Math.abs(b.vy);ny--;bounced=true;}if(bounced){const normal=Math.hypot(nx,ny);this.rebound(b,nx/normal,ny/normal);this.wall(b);}

 for(const o of this.arena.obstacles){let dx=b.x-o.x,dy=b.y-o.y,d=Math.hypot(dx,dy),r=b.r+o.r;if(d<r){if(d<.001){dx=1;dy=0;d=1;}const nx=dx/d,ny=dy/d;b.x=o.x+nx*r;b.y=o.y+ny*r;const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=2*vn*nx;b.vy-=2*vn*ny;this.rebound(b,nx,ny);this.wall(b);}}}}
 for(let i=0;i<this.entities.length;i++)for(let j=i+1;j<this.entities.length;j++){const a=this.entities[i],b=this.entities[j];if(a.hp<=0||b.hp<=0)continue;let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),sum=a.r+b.r;if(d>=sum)continue;if(d<.001){dx=1;dy=0;d=1;}const nx=dx/d,ny=dy/d,overlap=sum-d,invA=1/a.mass,invB=1/b.mass,total=invA+invB;a.x-=nx*overlap*invA/total;a.y-=ny*overlap*invA/total;b.x+=nx*overlap*invB/total;b.y+=ny*overlap*invB/total;const vel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(vel<0){const impulse=-2*vel/total;a.vx-=impulse*invA*nx;a.vy-=impulse*invA*ny;b.vx+=impulse*invB*nx;b.vy+=impulse*invB*ny;this.scatter(a,b);this.contact(a,b);}}
 for(const b of this.entities){b.x=clamp(b.x,low+b.r,high-b.r);b.y=clamp(b.y,low+b.r,high-b.r);}
 for(const p of this.projectiles){p.life-=dt;if(p.life<=0)continue;const owner=this.entities.find(b=>b.uid===p.owner);if(p.homing){const t=owner&&this.target(owner);if(t){const a=Math.atan2(t.y-p.y,t.x-p.x);p.vx+=(Math.cos(a)*240-p.vx)*dt*3;p.vy+=(Math.sin(a)*240-p.vy)*dt*3;}}p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<low||p.x>high||p.y<low||p.y>high){if(p.bounces-->0){if(p.x<low||p.x>high)p.vx=-p.vx;if(p.y<low||p.y>high)p.vy=-p.vy;p.x=clamp(p.x,low,high);p.y=clamp(p.y,low,high);}else p.life=0;}for(const b of this.entities)if(b.team!==p.team&&b.hp>0&&len(b,p)<b.r+p.r){this.damage(b,p.damage,owner,'projectile');this.effect('impact',p.x,p.y,p.color,26);p.life=0;break;}}
 for(const z of this.zones){z.t+=dt;z.life-=dt;const owner=this.entities.find(b=>b.uid===z.owner);if(z.kind==='meteor'||z.kind==='echo'){if(z.life<=0){for(const e of this.entities)if(e.team!==z.team&&e.hp>0&&len(e,z)<z.r+e.r)this.damage(e,z.kind==='echo'?13:37,owner,'ability');this.effect('burst',z.x,z.y,'#fbc18c',z.r);}}else for(const e of this.entities){if(e.team===z.team||e.hp<=0||len(e,z)>z.r+e.r)continue;if(z.kind==='gravity'||z.kind==='vortex'){const a=Math.atan2(z.y-e.y,z.x-e.x)+(z.kind==='vortex'?.9:0);e.vx+=Math.cos(a)*dt*120;e.vy+=Math.sin(a)*dt*120;}else if(z.kind==='spore'){e.poison=Math.max(e.poison,1);e.slow=Math.max(e.slow,.3);}else this.damage(e,dt*(z.kind==='void'?9:6),owner,'status');}}
 this.projectiles=this.projectiles.filter(p=>p.life>0).slice(-120);this.zones=this.zones.filter(z=>z.life>0).slice(-30);for(const e of this.effects)e.t+=dt;this.effects=this.effects.filter(e=>e.t<e.life).slice(-80);for(const t of this.damageText){t.life-=dt;t.y-=dt*35;}this.damageText=this.damageText.filter(t=>t.life>0).slice(-40);
 const alive=[0,1].map(team=>this.entities.some(b=>b.team===team&&b.hp>0));if(!alive[0]||!alive[1]||this.time>=60){this.done=true;if(alive[0]&&!alive[1])this.result=0;else if(alive[1]&&!alive[0])this.result=1;else{const hp=[0,1].map(team=>this.entities.filter(b=>b.team===team).reduce((a,b)=>a+b.hp/b.max,0));this.result=Math.abs(hp[0]-hp[1])<.001?-1:hp[0]>hp[1]?0:1;}this.emit('end',{winner:this.result});}
 }
}
class Profile{
 constructor(raw={}){this.save=clean(raw);this.random=()=>{const r=rng(this.save.seed);this.save.seed=(this.save.seed+7919)>>>0||1;return r();};this.match=null;}
 start(mode=this.save.prefs.mode){this.match={mode,hearts:[3,3],round:1,collectionUsed:[false,false],rerolled:false,offers:[this.offer(),this.offer()],selected:[null,null],angles:[0,Math.PI],finished:false,settled:false,roundSettled:false,reward:0,roundWins:[0,0],arena:this.save.prefs.arena==='random'?ARENAS[Math.floor(this.random()*ARENAS.length)].id:this.save.prefs.arena,difficulty:this.save.prefs.difficulty==='random'?['easy','normal','hard'][Math.floor(this.random()*3)]:this.save.prefs.difficulty};return this.match;}
 offer(){const pool=this.save.owned.slice(),out=[];while(out.length<3&&pool.length)out.push(pool.splice(Math.floor(this.random()*pool.length),1)[0]);return out;}
 choose(id,side=0,fromCollection=false){const m=this.match;if(!m||m.finished||m.selected[side]||!this.save.owned.includes(id))return false;if(fromCollection){if(m.collectionUsed[side])return false;m.collectionUsed[side]=true;}else if(!m.offers[side].includes(id))return false;m.selected[side]=id;return true;}
 reroll(){const m=this.match;if(!m||m.rerolled||m.selected[0])return false;m.rerolled=true;m.offers[0]=this.offer();return true;}
 makeRound(){const m=this.match;if(!m||!m.selected[0])return null;if(!m.selected[1])m.selected[1]=m.offers[1][Math.floor(this.random()*m.offers[1].length)];const teamSize=m.mode==='chaos'?4:m.mode==='team'?2:1,types=[m.selected[0],m.selected[1]],angles=[...m.angles];for(let i=1;i<teamSize;i++){types.push(this.save.owned[Math.floor(this.random()*this.save.owned.length)],this.save.owned[Math.floor(this.random()*this.save.owned.length)]);angles.push(m.angles[0],m.angles[1]);}m.roundSettled=false;return new Round({types,teamSize,angles,arena:m.arena,seed:Math.floor(this.random()*4294967295),difficulty:m.mode==='local'?'normal':m.difficulty});}

 settleRound(round){const m=this.match;if(!m||!round?.done||m.roundSettled||m.finished)return false;m.roundSettled=true;const winner=round.result;if(winner<0){m.hearts[0]--;m.hearts[1]--;}else{m.hearts[1-winner]--;m.roundWins[winner]++;}this.save.stats.rounds++;this.save.stats.knockouts+=round.entities.filter(b=>b.team===1&&b.hp<=0).length;m.finished=m.hearts.some(h=>h<=0);if(m.finished){this.settleMatch();}return true;}
 nextRound(){const m=this.match;if(!m||m.finished||!m.roundSettled)return false;m.round++;m.offers=[this.offer(),this.offer()];m.selected=[null,null];m.roundSettled=false;return true;}
 settleMatch(){const m=this.match;if(!m||!m.finished||m.settled)return false;m.settled=true;const win=m.hearts[0]>m.hearts[1];this.save.stats.matches++;if(win){this.save.stats.wins++;this.save.stats.streak++;this.save.stats.bestStreak=Math.max(this.save.stats.bestStreak,this.save.stats.streak);}else{this.save.stats.losses++;this.save.stats.streak=0;}m.reward=(win?140:75)+m.roundWins[0]*25;this.save.coins+=m.reward;return true;}
 buy(id){const b=BALLS.find(b=>b.id===id);if(!b||this.save.owned.includes(id)||this.save.coins<b.price)return false;this.save.coins-=b.price;this.save.owned.push(id);return true;}
 pack(){const cost=150;if(this.save.coins<cost)return null;this.save.coins-=cost;this.save.stats.packs++;const unowned=BALLS.filter(b=>!this.save.owned.includes(b.id));this.save.pity++;let b;if(this.save.pity>=5&&unowned.length){b=unowned[Math.floor(this.random()*unowned.length)];this.save.pity=0;}else{const tier=this.random(),rarity=tier<.46?0:tier<.76?1:tier<.94?2:3,pool=BALLS.filter(b=>b.rarity===rarity);b=pool[Math.floor(this.random()*pool.length)];}const duplicate=this.save.owned.includes(b.id);if(duplicate)this.save.coins+=60;else{this.save.owned.push(b.id);this.save.pity=0;}return{ball:b,duplicate,refund:duplicate?60:0};}
 export(){return clean(this.save)}
}
const API={BALLS,STARTERS,RARITIES,ARENAS,WORLD,EDGE,CENTER,spawn,overtimeMargin,Round,Profile,clean,rng,clamp};if(typeof module!=='undefined'&&module.exports)module.exports=API;globalThis.BallCore=API;
})();
