/* Fisch: Horizon — original, deterministic fishing and world simulation. */
(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0)),dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const ISLANDS=[
 {id:'harbor',name:'Willow Harbor',x:0,z:0,r:32,color:'#79a66d',sand:'#ead3a2',accent:'#d87553',biome:'harbor',hint:'A gentle beginning. Sprats love worms; carp come out at dusk.'},
 {id:'reef',name:'Sunveil Reef',x:150,z:65,r:27,color:'#78b986',sand:'#f1dfb0',accent:'#f2ac68',biome:'tropical',hint:'Warm shallows, bright coral and fish with expensive taste.'},
 {id:'marsh',name:'Murkwood',x:-155,z:30,r:30,color:'#6e8c71',sand:'#aca985',accent:'#b798df',biome:'swamp',hint:'Mist hides the rarest inhabitants. Grubs make excellent bait.'},
 {id:'ice',name:'Frostglass Isle',x:70,z:-180,r:31,color:'#dfedf0',sand:'#a9cfdf',accent:'#6ccbd8',biome:'snow',hint:'Night, snow and crystal bait bring the frozen depths to life.'},
 {id:'ember',name:'Ember Reach',x:-150,z:-165,r:28,color:'#686675',sand:'#948477',accent:'#f69a55',biome:'volcano',hint:'Strong rods tame heavy fish. Storms stir something ancient.'},
 {id:'ruins',name:'Astral Sanctuary',x:20,z:205,r:29,color:'#87a4a0',sand:'#d7d1ad',accent:'#bba1ef',biome:'ruins',hint:'The moon awakens this sanctuary. Complete collections to earn the Horizon Rod.'}
];
const RARITIES=['Common','Uncommon','Rare','Legendary','Mythic'];
const PALETTES=['#8dc0c9','#8bd391','#e4b26c','#91a0f1','#e48faf','#64d8cc','#ce814f','#bccfdc','#939edd','#f3c667'];
const names=[
 ['Silver Sprat','Dock Goby','Pebble Perch','Willow Carp','Bluefin Bream','Harbor Bass','Golden Koi','Moon Catfish','Royal Sturgeon','Willow Guardian'],
 ['Reef Damsel','Sunfish','Clownfish','Parrotfish','Coral Grouper','Lionfish','Sailfin Ray','Pearl Marlin','Sunveil Manta','Prismatic Serpent'],
 ['Mud Minnow','Bog Loach','Moss Perch','Bullhead','Spotted Gar','Swamp Eel','Ghost Pike','Witchfin','Murkwood Gatorfish','Ancient Mire Wyrm'],
 ['Snow Herring','Ice Goby','Frost Trout','Crystal Char','Arctic Cod','Glacier Salmon','Aurora Pike','Glassfin Ray','Frozen Narwhal','Boreal Leviathan'],
 ['Ash Anchovy','Cinder Goby','Ember Snapper','Obsidian Eel','Lava Grouper','Coalfin Tuna','Inferno Shark','Molten Swordfish','Cinder Colossus','Volcanic Drake'],
 ['Star Sardine','Rune Wrasse','Lunar Bream','Temple Tang','Celestial Bass','Astral Ray','Moonstone Koi','Starlight Whale','Eclipse Serpent','Horizon Leviathan']
];
const BAITS=[{id:'none',name:'No bait',cost:0,luck:0,speed:0},
 {id:'worm',name:'Worms',cost:35,luck:.12,speed:.18},{id:'grub',name:'Grubs',cost:55,luck:.18,speed:.1},
 {id:'shrimp',name:'Shrimp',cost:85,luck:.25,speed:.14},{id:'crystal',name:'Crystal larvae',cost:160,luck:.4,speed:.18},
 {id:'squid',name:'Squid',cost:210,luck:.55,speed:.2},{id:'stardust',name:'Stardust',cost:390,luck:.85,speed:.25}];
const FISH=ISLANDS.flatMap((island,i)=>names[i].map((name,j)=>({id:island.id+'-'+j,name,island:island.id,rarity:j<3?0:j<5?1:j<7?2:j<9?3:4,
 color:name==='Clownfish'?'#ee9867':name==='Golden Koi'?'#edbd67':name.includes('Ghost')?'#c7e0d0':name.includes('Whale')?'#809dbf':PALETTES[(i+j)%10],shape:/Ray|Manta/.test(name)?'ray':/Narwhal/.test(name)?'narwhal':/Whale|Boreal Leviathan/.test(name)?'whale':/Shark/.test(name)?'shark':/Swordfish|Marlin/.test(name)?'sword':/Eel|Serpent|Wyrm|Drake/.test(name)?'eel':/Gator/.test(name)?'gator':'fish',
 weight:[.4,.7,1.2,2,3.5,5,8,16,35,75][j]*(1+i*.3),value:[18,24,34,50,70,110,200,430,700,1600][j]*(1+i*.25),
 bait:BAITS[1+(i+j)%6].id,time:j===7||j===9?'night':'any',weather:j===8?'rain':j===9?(i===3?'aurora':i===4?'storm':i===2?'fog':'any'):'any',difficulty:.18+j*.072,
 lore:['A familiar flash beneath the dock.','A small fish with a big attitude.','A patient hunter in the shallows.','It changes colour in the evening light.','A favourite of local fishers.','Watch its sudden changes of direction.','An elusive prize with brilliant scales.','It follows the glow of the moon.','A giant whispered about in taverns.','A living legend from the deepest water.'][j]})));
const RODS=[
 {id:'twig',name:'Driftwood Rod',price:0,luck:0,control:.31,resilience:.65,speed:1,max:140,color:'#aa805d',level:1},
 {id:'steady',name:'Steady Rod',price:380,luck:.15,control:.36,resilience:.78,speed:1.1,max:250,color:'#66c8b8',level:1},
 {id:'carbon',name:'Carbon Rod',price:1100,luck:.32,control:.32,resilience:.84,speed:1.2,max:400,color:'#677995',level:3},
 {id:'coral',name:'Coral Rod',price:2600,luck:.55,control:.37,resilience:.9,speed:1.25,max:550,color:'#ed977d',level:5},
 {id:'glacier',name:'Glacier Rod',price:5500,luck:.8,control:.4,resilience:1.08,speed:1.3,max:850,color:'#b3e9f5',level:8},
 {id:'obsidian',name:'Obsidian Rod',price:9500,luck:1.15,control:.35,resilience:1.2,speed:1.4,max:1300,color:'#ad83d5',level:11},
 {id:'astral',name:'Astral Rod',price:18000,luck:1.65,control:.43,resilience:1.3,speed:1.5,max:2200,color:'#f1ce79',level:15},
 {id:'horizon',name:'Horizon Rod',price:0,luck:2.2,control:.47,resilience:1.5,speed:1.65,max:5000,color:'#71f1dc',level:1,collection:35}
];
const BOATS=[{id:'skiff',name:'Harbor Skiff',price:0,speed:22,color:'#ae805f'}, {id:'cutter',name:'Reef Cutter',price:1800,speed:33,color:'#64b8ae'},{id:'voyager',name:'Star Voyager',price:7000,speed:47,color:'#a594d5'}];
const ENCHANTS=[{id:'none',name:'Unenchanted',cost:0},{id:'lucky',name:'Lucky',cost:1,luck:.65},{id:'steady',name:'Steady',cost:1,control:.08},{id:'swift',name:'Swift',cost:1,speed:.3},{id:'treasure',name:'Prosperous',cost:2,value:.4}];
const MUTATIONS=[{id:'normal',name:'',multi:1,color:null},{id:'shiny',name:'Shiny',multi:1.8,color:'#fcf5c2'},{id:'golden',name:'Golden',multi:2.8,color:'#ffcf50'},{id:'lunar',name:'Lunar',multi:3.3,color:'#9fc5ff'},{id:'abyssal',name:'Abyssal',multi:4,color:'#c486f3'}];
const WEATHER=['clear','rain','fog','storm','aurora'];
const QUESTS=[
 {id:'first',name:'A line in the water',text:'Land your first fish.',type:'catches',goal:1,coins:90,xp:45},
 {id:'five',name:'Find your rhythm',text:'Land five fish.',type:'catches',goal:5,coins:220,xp:90},
 {id:'sell',name:'A fisher’s living',text:'Earn 250 coins from selling fish.',type:'sold',goal:250,coins:180,xp:100},
 {id:'sail',name:'Beyond the harbor',text:'Visit a second island.',type:'visited',goal:2,coins:200,xp:100},
 {id:'ten',name:'Pocket naturalist',text:'Discover ten different fish.',type:'unique',goal:10,coins:650,xp:230},
 {id:'rare',name:'Something special',text:'Catch three Rare or better fish.',type:'rare',goal:3,coins:500,xp:180},
 {id:'all',name:'Island hopper',text:'Visit all six islands.',type:'visited',goal:6,coins:950,xp:300},
 {id:'twenty',name:'Born to fish',text:'Land twenty fish.',type:'catches',goal:20,coins:700,xp:200},
 {id:'mutation',name:'More than scales',text:'Catch a mutated fish.',type:'mutations',goal:1,coins:550,xp:160},
 {id:'treasure',name:'Forgotten riches',text:'Open three island treasure chests.',type:'chests',goal:3,coins:750,xp:220},
 {id:'legend',name:'Tavern stories',text:'Land a Legendary or Mythic fish.',type:'legendary',goal:1,coins:1200,xp:400},
 {id:'collector',name:'The Horizon',text:'Discover 35 species to unlock the Horizon Rod.',type:'unique',goal:35,coins:2500,xp:1000}
];
const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
function clean(raw={}){
 const d=raw&&typeof raw==='object'?raw:{},ints=(v,a,b,f=0)=>Math.floor(clamp(finite(v,f),a,b));
 const ids=(a,allowed)=>[...new Set((Array.isArray(a)?a:[]).filter(x=>allowed.includes(x)))];
 const owned=ids(d.rods,RODS.map(x=>x.id));if(!owned.includes('twig'))owned.unshift('twig');
 const boats=ids(d.boats,BOATS.map(x=>x.id));if(!boats.includes('skiff'))boats.unshift('skiff');
 const seen={};for(const f of FISH){const x=d.seen?.[f.id];if(x&&typeof x==='object')seen[f.id]={count:ints(x.count,1,999999),weight:clamp(x.weight,0,5000)};}
 const bag=(Array.isArray(d.bag)?d.bag:[]).slice(-240).filter(x=>FISH.some(f=>f.id===x?.fish)).map((x,i)=>({uid:String(x.uid||'restore'+i).replace(/[^a-z0-9_-]/gi,'').slice(0,50),fish:x.fish,weight:clamp(x.weight,.01,5000),mutation:MUTATIONS.some(m=>m.id===x.mutation)?x.mutation:'normal',value:ints(x.value,1,1000000,20),locked:!!x.locked}));
 const bait={};for(const b of BAITS.slice(1))bait[b.id]=ints(d.bait?.[b.id],0,9999);
 const stats={};for(const k of ['catches','sold','rare','legendary','mutations','chests','escaped','perfect'])stats[k]=ints(d.stats?.[k],0,999999999);
 const prefs=d.prefs||{},p=d.position||{};
 return{version:1,coins:ints(d.coins,0,999999999,120),xp:ints(d.xp,0,99999999),rods:owned,rod:owned.includes(d.rod)?d.rod:'twig',boats,boat:boats.includes(d.boat)?d.boat:'skiff',enchant:ENCHANTS.some(e=>e.id===d.enchant)?d.enchant:'none',relics:ints(d.relics,0,9999),bag,seen,bait,baitId:BAITS.some(b=>b.id===d.baitId)?d.baitId:'none',visited:[...new Set(['harbor',...ids(d.visited,ISLANDS.map(i=>i.id))])],claimed:ids(d.claimed,QUESTS.map(q=>q.id).concat(['daily'])),chests:ids(d.chests,ISLANDS.map(i=>i.id)),stats,
 position:{x:clamp(finite(p.x,0),-350,350),z:clamp(finite(p.z,46),-350,350)},clock:clamp(finite(d.clock,110),0,720),weather:WEATHER.includes(d.weather)?d.weather:'clear',weatherClock:clamp(finite(d.weatherClock,0),0,180),seed:ints(d.seed,1,4294967295,1739423),dayKey:typeof d.dayKey==='string'?d.dayKey.slice(0,10):'',dailyCount:ints(d.dailyCount,0,30),
 prefs:{sound:prefs.sound!==false,assist:prefs.assist!==false,quality:['high','balanced','low'].includes(prefs.quality)?prefs.quality:'balanced',touch:['auto','on','off'].includes(prefs.touch)?prefs.touch:'auto',color:/^#[0-9a-f]{6}$/i.test(prefs.color)?prefs.color:'#e8a068',sensitivity:clamp(finite(prefs.sensitivity,1),.4,2)}};
}
class Game{
 constructor(raw={},rng){this.save=clean(raw);this.rng=rng||(()=>{let t=this.save.seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);this.save.seed>>>=0;return((t^t>>>14)>>>0)/4294967296});this.player={x:this.save.position.x,z:this.save.position.z,y:2.5,vy:0,heading:Math.PI,moving:0,swimming:false};this.boat=null;this.fishing={state:'idle'};this.events=[];this.time=0;this.colliders=[];this.lastSafe={x:0,z:44};this.updateDaily();this.player.y=this.ground(this.player.x,this.player.z)+1.25;}
 random(){return clamp(this.rng(),0,.999999999)}
 event(type,data={}){this.events.push({type,...data});}
 level(){return Math.floor(Math.sqrt(this.save.xp/90))+1;}
 isNight(){return this.save.clock<90||this.save.clock>455;}
 island(x=this.player.x,z=this.player.z){return ISLANDS.reduce((a,i)=>Math.hypot(x-i.x,z-i.z)<Math.hypot(x-a.x,z-a.z)?i:a,ISLANDS[0]);}
 dock(i){return{x:i.x,z:i.z+i.r+10};}
 ground(x,z){for(const i of ISLANDS){if(Math.hypot(x-i.x,z-i.z)<i.r)return 2;if(Math.abs(x-i.x)<3&&z>=i.z+i.r-5&&z<=i.z+i.r+16)return 2.3;}return-.75;}
 nearPort(){const i=this.island();return dist(this.player,this.dock(i))<23||dist(this.player,{x:i.x,z:i.z+i.r-8})<18;}
 rod(){const r=RODS.find(r=>r.id===this.save.rod),e=ENCHANTS.find(e=>e.id===this.save.enchant);return{...r,luck:r.luck+(e.luck||0),control:clamp(r.control+(e.control||0)+(this.save.prefs.assist?.07:0),.1,.58),speed:r.speed+(e.speed||0)};}
 updateDaily(date=new Date()){const day=date.toISOString().slice(0,10);if(day!==this.save.dayKey){this.save.dayKey=day;this.save.dailyCount=0;this.save.claimed=this.save.claimed.filter(id=>id!=='daily');}}
 step(dt,input={}){
 dt=clamp(dt,0,.05);this.time+=dt;this.save.clock=(this.save.clock+dt)%720;this.save.weatherClock+=dt;
 if(this.save.weatherClock>180){this.save.weatherClock=0;this.save.weather=WEATHER[Math.floor(this.random()*WEATHER.length)];this.event('weather',{weather:this.save.weather});}
 const p=this.player,f=this.fishing,locked=f.state!=='idle';
 if(!locked){if(this.boat){const b=this.boat,def=BOATS.find(x=>x.id===this.save.boat),throttle=clamp(input.forward,-1,1);b.heading-=clamp(input.turn,-1,1)*dt*(.65+Math.abs(b.speed)/35);b.speed+=((throttle*def.speed)-b.speed)*dt*1.5;const nx=b.x+Math.sin(b.heading)*b.speed*dt,nz=b.z+Math.cos(b.heading)*b.speed*dt;if(this.ground(nx,nz)<0&&Math.hypot(nx,nz)<365){b.x=nx;b.z=nz;}else{if(Math.abs(b.speed)>8)this.event('bump');b.speed*=-.15;}p.x=b.x;p.z=b.z;p.y=1.2;p.heading=b.heading;p.moving=Math.abs(b.speed);}
 else{let dx=clamp(input.x,-1,1),dz=clamp(input.z,-1,1),len=Math.hypot(dx,dz);if(len>1){dx/=len;dz/=len;}const speed=p.swimming?4.8:input.sprint?11:7.5;let nx=p.x+dx*speed*dt,nz=p.z+dz*speed*dt;for(const c of this.colliders){const d=Math.hypot(nx-c.x,nz-c.z),r=c.r+.6;if(d<r&&p.y<6){const angle=Math.atan2(nx-c.x,nz-c.z);nx=c.x+Math.sin(angle)*r;nz=c.z+Math.cos(angle)*r;}}
 if(Math.hypot(nx,nz)<365){p.x=nx;p.z=nz;}p.moving=len*speed;if(len>.05)p.heading=Math.atan2(dx,dz);const g=this.ground(p.x,p.z);p.swimming=g<0;p.vy-=20*dt;p.y+=p.vy*dt;if(p.y<g+1.25){p.y=g+1.25;p.vy=0;}if(input.jump&&!p.swimming&&p.vy===0)p.vy=8;if(g>0)this.lastSafe={x:p.x,z:p.z};}}
 const i=this.island();if(dist(p,i)<i.r+30&&!this.save.visited.includes(i.id)){this.save.visited.push(i.id);this.save.xp+=80;this.event('island',{island:i});}
 if(f.state==='casting'){f.power=(f.power+dt*.62)%1;}
 if(f.state==='waiting'){f.wait-=dt;if(f.wait<=0){f.state='reeling';f.progress=.24;f.bar=.5;f.velocity=0;f.fish=.5;f.elapsed=0;f.phase=this.random()*6;f.target=.5;f.next=1.2;f.overlap=0;this.event('bite');}}
 if(f.state==='reeling'){
 const rod=this.rod();f.elapsed+=dt;f.next-=dt;if(f.next<=0){f.target=.14+this.random()*.72;f.next=.7+this.random()*1.6;}
 const d=f.species.difficulty;f.fish+=(f.target-f.fish)*dt*(.7+d*1.7);f.fish=clamp(f.fish+Math.sin(f.elapsed*(1.4+d*3)+f.phase)*dt*.08*d,.03,.97);
 const force=input.reel?1:-1;f.velocity+=force*dt*1.7;f.velocity*=Math.exp(-dt*4);f.bar=clamp(f.bar+f.velocity*dt,.02, .98);if(f.bar===.02||f.bar===.98)f.velocity=0;
 const overlap=Math.abs(f.bar-f.fish)<=rod.control/2;f.overlap+=overlap?dt:0;f.progress+=dt*(overlap?.15*rod.speed/(.85+d*.5):-.065/rod.resilience);f.inside=overlap;
 if(f.progress>=1)this.land();else if(f.progress<=0||f.elapsed>65){this.save.stats.escaped++;this.fishing={state:'idle'};this.event('escape');}
 }
 this.save.position={x:p.x,z:p.z};
 }
 startCast(){if(this.fishing.state!=='idle')return false;if(this.save.bag.length>=240){this.event('notice',{text:'Your creel is full. Sell a few catches at a port.'});return false;}if(this.player.swimming&&!this.boat){this.event('notice',{text:'Climb onto a dock or summon your boat before casting.'});return false;}const i=this.island();if(!this.boat&&this.ground(this.player.x,this.player.z)>0&&dist(this.player,i)<i.r-6&&this.player.z<i.z+i.r-3){this.event('notice',{text:'Head to the shore or a dock to cast into water.'});return false;}this.player.heading=this.boat?this.boat.heading:Math.atan2(this.player.x-i.x,this.player.z-i.z);this.fishing={state:'casting',power:0};return true;}
 releaseCast(){const f=this.fishing;if(f.state!=='casting')return false;const rod=this.rod(),bait=BAITS.find(x=>x.id===this.save.baitId),active=bait.id!=='none'&&this.save.bait[bait.id]>0?bait:BAITS[0];f.cast=f.power;f.perfect=Math.abs(f.power-.82)<.13;f.state='waiting';f.wait=(3+this.random()*3.5)/(rod.speed*(1+active.speed));f.species=this.chooseFish(this.island().id,active);f.bait=active.id;if(active.id!=='none')this.save.bait[active.id]--;this.event('cast',{perfect:f.perfect});return true;}
 shake(){if(this.fishing.state==='waiting'){this.fishing.wait=Math.max(.2,this.fishing.wait-.6);this.event('shake');}}
 cancel(){if(this.fishing.state!=='idle'){this.fishing={state:'idle'};this.event('notice',{text:'Line reeled in.'});}}
 chooseFish(island,bait=BAITS[0]){
 const rod=this.rod(),pool=FISH.filter(f=>f.island===island&&f.weight<=rod.max&&(f.time==='any'||this.isNight())&&(f.weather==='any'||f.weather===this.save.weather||(f.weather==='rain'&&this.save.weather==='storm')));
 const weights=pool.map(f=>[40,20,8,2.8,.65][f.rarity]*Math.pow(1+rod.luck+bait.luck+(this.save.weather==='aurora'?.8:0),f.rarity*.8)*(f.bait===bait.id?2.8:1));
 let roll=this.random()*weights.reduce((a,b)=>a+b,0);for(let n=0;n<pool.length;n++){roll-=weights[n];if(roll<=0)return pool[n];}return pool[0];
 }
 land(){const f=this.fishing,s=f.species,roll=this.random(),night=this.isNight();let mutation=roll<.025?'abyssal':roll<.06&&night?'lunar':roll<.1?'golden':roll<.22?'shiny':'normal';const m=MUTATIONS.find(x=>x.id===mutation),weight=Math.round(Math.min(this.rod().max,s.weight*(.55+this.random()*1.1))*100)/100,e=ENCHANTS.find(x=>x.id===this.save.enchant),value=Math.round(s.value*(weight/s.weight)*m.multi*(f.perfect?1.15:1)*(1+(e.value||0)));
 const catchData={uid:'f'+this.save.stats.catches+'-'+Math.floor(this.random()*1e9),fish:s.id,weight,mutation,value,locked:false};this.save.bag.push(catchData);const fresh=!this.save.seen[s.id],seen=this.save.seen[s.id]||{count:0,weight:0};seen.count++;seen.weight=Math.max(seen.weight,weight);this.save.seen[s.id]=seen;this.save.stats.catches++;if(s.rarity>=2)this.save.stats.rare++;if(s.rarity>=3)this.save.stats.legendary++;if(mutation!=='normal')this.save.stats.mutations++;if(f.perfect)this.save.stats.perfect++;this.save.xp+=Math.round(22+s.rarity*25+(fresh?55:0));this.save.dailyCount++;if(this.random()<.1+s.rarity*.025){this.save.relics++;this.event('relic');}if(Object.keys(this.save.seen).length>=35&&!this.save.rods.includes('horizon')){this.save.rods.push('horizon');this.event('unlock',{text:'Horizon Rod unlocked — equip it in the Outfitters.'});}
 this.fishing={state:'idle'};this.event('catch',{catch:catchData,species:s,fresh,perfect:f.perfect});return catchData;
 }
 sell(uid){if(!this.nearPort())return{ok:false,text:'Trade at an island port. Open the chart to find a dock.'};const toSell=this.save.bag.filter(x=>!x.locked&&(!uid||x.uid===uid));if(!toSell.length)return{ok:false,text:'No unlocked catches to sell.'};const coins=toSell.reduce((a,b)=>a+b.value,0),ids=new Set(toSell.map(x=>x.uid));this.save.bag=this.save.bag.filter(x=>!ids.has(x.uid));this.save.coins+=coins;this.save.stats.sold+=coins;return{ok:true,text:'Sold '+toSell.length+' fish for '+coins.toLocaleString()+' coins.',coins};}
 toggleLock(uid){const f=this.save.bag.find(x=>x.uid===uid);if(f)f.locked=!f.locked;}
 buyRod(id){const r=RODS.find(x=>x.id===id);if(!r)return false;if(this.save.rods.includes(id)){this.save.rod=id;return true;}if(r.collection||this.level()<r.level||this.save.coins<r.price||!this.nearPort())return false;this.save.coins-=r.price;this.save.rods.push(id);this.save.rod=id;return true;}
 buyBoat(id){const b=BOATS.find(x=>x.id===id);if(!b)return false;if(this.save.boats.includes(id)){this.save.boat=id;return true;}if(this.save.coins<b.price||!this.nearPort())return false;this.save.coins-=b.price;this.save.boats.push(id);this.save.boat=id;return true;}
 buyBait(id){const b=BAITS.find(x=>x.id===id);if(!b||id==='none'||this.save.coins<b.cost||!this.nearPort())return false;this.save.coins-=b.cost;this.save.bait[id]+=10;this.save.baitId=id;return true;}
 enchant(id){const e=ENCHANTS.find(x=>x.id===id);if(!e||this.save.relics<e.cost||!this.nearPort())return false;this.save.relics-=e.cost;this.save.enchant=id;return true;}
 launchBoat(){if(this.fishing.state!=='idle')return false;if(this.boat){const i=this.island(),dock=this.dock(i);if(dist(this.boat,dock)>22){this.event('notice',{text:'Bring your boat close to a dock to disembark.'});return false;}this.boat=null;this.player.x=dock.x;this.player.z=dock.z;this.player.y=3.55;return true;}if(!this.nearPort()&&!this.player.swimming){this.event('notice',{text:'Summon your boat at a dock.'});return false;}const i=this.island(),dock=this.dock(i);this.boat={x:this.player.swimming?this.player.x:dock.x+9,z:this.player.swimming?this.player.z:dock.z+8,heading:0,speed:0};this.player.x=this.boat.x;this.player.z=this.boat.z;return true;}
 travel(id){const i=ISLANDS.find(x=>x.id===id);if(!i||!this.save.visited.includes(id)||this.fishing.state!=='idle')return false;this.boat=null;const d=this.dock(i);Object.assign(this.player,{x:d.x,z:d.z,y:3.55,vy:0});this.save.position={x:d.x,z:d.z};this.event('notice',{text:'Arrived at '+i.name+'.'});return true;}
 respawn(){this.cancel();this.boat=null;const i=this.island(),d=this.dock(i);Object.assign(this.player,{x:d.x,z:d.z,y:3.55,vy:0});this.event('notice',{text:'Back at '+i.name+' dock.'});}
 openChest(){const i=this.island(),chest={x:i.x+12,z:i.z-8};if(dist(this.player,chest)>4)return false;if(this.save.chests.includes(i.id)){this.event('notice',{text:'You already found this island’s treasure.'});return false;}this.save.chests.push(i.id);this.save.coins+=180+ISLANDS.indexOf(i)*90;this.save.relics++;this.save.stats.chests++;this.save.xp+=80;this.event('treasure',{coins:180+ISLANDS.indexOf(i)*90});return true;}
 progress(q){return q.type==='unique'?Object.keys(this.save.seen).length:q.type==='visited'?this.save.visited.length:this.save.stats[q.type]||0;}
 claim(id){if(this.save.claimed.includes(id))return false;const q=QUESTS.find(q=>q.id===id);if(id==='daily'){if(this.save.dailyCount<8)return false;this.save.coins+=450;this.save.xp+=160;this.save.relics++;}else{if(!q||this.progress(q)<q.goal)return false;this.save.coins+=q.coins;this.save.xp+=q.xp;}this.save.claimed.push(id);return true;}
 export(){return clean(this.save);}
}
const API={Game,clean,ISLANDS,FISH,RODS,BAITS,BOATS,ENCHANTS,MUTATIONS,QUESTS,RARITIES,WEATHER,clamp,dist};if(typeof module!=='undefined'&&module.exports)module.exports=API;globalThis.FischCore=API;
})();
