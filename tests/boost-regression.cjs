const assert=require('node:assert/strict'),fs=require('node:fs'),B=require('../store/boostleague/core.js'),{createCanvas}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas'),Renderer=require('../store/boostleague/render.js');const tests=[];const pass=n=>{tests.push(n);console.log('PASS '+n)},step=(m,n,input={})=>{for(let i=0;i<n;i++)m.step(1/120,input)},playing=(options={})=>{const m=new B.Match(options,17);m.phase='playing';return m};
{
 const m=playing({teamSize:1});step(m,120,{throttle:1});const normal=m.player.speed;assert.ok(normal>18&&normal<35);const n=playing({teamSize:1});n.pads=[];step(n,120,{throttle:1,boost:true});assert.ok(n.player.speed>normal*1.4);assert.ok(n.player.boost<5);const f=playing({freeplay:true});step(f,600,{boost:true,throttle:1});assert.equal(f.player.boost,100);pass('Throttle and limited boost have distinct speeds; free play has unlimited boost');
}
{
 const m=playing({freeplay:true}),p=m.player;p.z=-20;step(m,1,{jump:true});assert.equal(p.jumps,1);step(m,28,{throttle:1});const before=p.vz;step(m,1,{throttle:1,jump:true});assert.equal(p.jumps,2);assert.ok(p.vz>before+10);assert.ok(p.flip>0);step(m,5,{jump:false});step(m,1,{jump:true});assert.equal(p.jumps,2);step(m,360);assert.equal(p.grounded,true);assert.equal(p.jumps,0);pass('Jump, directional dodge, two-jump limit and landing reset operate in actual physics');
}
{
 const m=playing({freeplay:true}),p=m.player;p.x=38;p.z=-20;p.y=B.ground(p.x,p.z)+.85;p.vx=-8;p.vz=0;p.yaw=-Math.PI/2;step(m,70,{throttle:1});assert.ok(p.y<1);assert.equal(p.grounded,true);assert.ok(p.y>=.85);pass('Banked-wall height returns cleanly to the floor without floating');
}
{
 const m=playing({freeplay:true}),p=m.player,orb=m.pads.find(p=>p.big);p.x=orb.x;p.z=orb.z;p.boost=1;m.options.freeplay=false;m.updateCar(p,{},1/120);assert.equal(p.boost,100);assert.equal(orb.cool,10);p.boost=12;m.updateCar(p,{},1/120);assert.equal(p.boost,12);const small=m.pads.find(p=>!p.big);p.x=small.x;p.z=small.z;m.updateCar(p,{},1/120);assert.equal(p.boost,24);assert.equal(small.cool,4);pass('Large and small pads refill correctly and respect respawn cooldowns');
}
{
 const m=playing({teamSize:1}),p=m.player;Object.assign(p,{x:0,y:.85,z:-5,vz:30,vx:0,yaw:0});Object.assign(m.ball,{x:0,y:2.15,z:-1.2,vx:0,vz:0,vy:0});m.carBall(p);assert.ok(m.ball.vz>20);assert.ok(m.ball.vy>3);assert.equal(m.lastTouch.id,0);assert.equal(p.touches,1);pass('Car hull contact transfers momentum, lifts the ball and records the toucher');
}
{
 const m=playing({teamSize:1});Object.assign(m.ball,{x:0,y:B.FIELD.ball,z:57,vz:0});m.updateBall(1/120);assert.deepEqual(m.score,[0,0]);m.ball.z=59;m.updateBall(1/120);assert.deepEqual(m.score,[1,0]);m.updateBall(1/120);assert.deepEqual(m.score,[1,0]);const high=playing();Object.assign(high.ball,{x:0,y:15,z:58,vz:20});high.updateBall(1/120);assert.equal(high.score[0],0);assert.ok(high.ball.vz<0);const wide=playing();Object.assign(wide.ball,{x:16,y:2.15,z:58,vz:20});wide.updateBall(1/120);assert.equal(wide.score[0],0);pass('Only a whole ball inside the goal aperture scores, once; high and wide shots rebound');
}
{
 const m=playing();m.time=.001;m.score=[1,0];m.ball.y=14;step(m,1);assert.equal(m.time,0);assert.equal(m.phase,'playing');step(m,250);assert.equal(m.phase,'finished');assert.equal(m.winner,0);const tie=playing();tie.time=.001;step(tie,1);assert.equal(tie.overtime,true);assert.equal(tie.phase,'kickoff');step(tie,361);assert.equal(tie.phase,'playing');Object.assign(tie.ball,{x:0,y:2.15,z:59});tie.updateBall(1/120);assert.equal(tie.phase,'finished');assert.equal(tie.winner,0);pass('Zero-second airborne play and tied sudden-death overtime finish by the correct rules');
}
{
 const m=playing({teamSize:1}),[a,b]=m.cars;Object.assign(a,{x:0,z:0,vx:0,vz:51,speed:51,boosting:true});Object.assign(b,{x:0,z:2,vx:0,vz:0,speed:0});m.carCars();assert.equal(b.respawn,3);assert.equal(a.demos,1);step(m,361);assert.ok(b.respawn<=0);assert.ok(Number.isFinite(b.x));pass('Boosted high-speed car impacts demolish and respawn the opponent');
}
{
 const configs=new Set();for(let i=0;i<60;i++){const m=new B.Match({teamSize:'random',difficulty:'random',arena:'random',minutes:'random'},i);configs.add([m.options.teamSize,m.options.difficulty,m.options.arena,m.options.minutes].join(':'));assert.equal(m.cars.length,m.options.teamSize*2);assert.ok(B.ARENAS.includes(m.arena));}assert.ok(configs.size>35);assert.equal(B.clean({matches:3,wins:99,goals:Infinity,prefs:{color:'bad'}}).wins,3);assert.equal(B.clean({goals:Infinity}).goals,0);pass('Random setups are varied and valid; forged statistics and garage values sanitize');
}
for(const difficulty of ['rookie','pro','allstar'])for(const size of [1,2,3]){
 const m=playing({difficulty,teamSize:size,minutes:3,arena:['champions','neon','frost'][size-1]});let maxBall=0;for(let i=0;i<120*180;i++){const ai=m.bot(m.player,1/120);m.step(1/120,ai);maxBall=Math.max(maxBall,Math.hypot(m.ball.vx,m.ball.vz));for(const c of m.cars)for(const key of ['x','y','z','vx','vy','vz','boost'])assert.ok(Number.isFinite(c[key]),difficulty+' '+size+' '+key);assert.ok(Number.isFinite(m.ball.y));assert.ok(m.player.boost>=0&&m.player.boost<=100);}
 assert.ok(m.cars.reduce((n,c)=>n+c.touches,0)>10);assert.ok(maxBall>20);assert.ok(m.score[0]+m.score[1]>0,'AI should be able to score: '+difficulty+' '+size);pass(difficulty+' '+size+'v'+size+' runs 180 seconds with contacts, goals and bounded physics');
 const c=createCanvas(960,540),r=new Renderer(c);r.resize(960,540);r.draw(m,.016,false,true);fs.writeFileSync(__dirname+'/boost-'+difficulty+'-'+size+'.png',c.toBuffer('image/png'));
}
{
 const m=playing({teamSize:3}),c=createCanvas(800,450),r=new Renderer(c);r.resize(800,450);for(const arena of B.ARENAS){m.arena=arena;for(const pose of [{x:0,y:8,z:-50},{x:38,y:9,z:50},{x:-39,y:19,z:-51}]){r.camera={...pose};r.low=true;r.draw(m,.016);r.low=false;r.draw(m,.016,true);}}pass('All stadiums render in both quality modes, including near-wall camera poses');
}
fs.writeFileSync(__dirname+'/boost-regression-results.json',JSON.stringify({checks:tests.length,tests},null,2)+'\n');
