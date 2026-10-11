from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'store/subwaysurfers/core.js';s=p.read_text()
s=s.replace('this.revived=false;this.lastGround=0;', 'this.revived=false;this.stumble=0;this.lastGround=0;')
s=s.replace('return 7+(this.upgrades[POWERS.indexOf(type)]||0)*2;', 'return 10+(this.upgrades[POWERS.indexOf(type)]||0)*4;')
s=s.replace('this.x+=(this.lane-1)*2.6-this.x===0?0:(((this.lane-1)*2.6-this.x)*Math.min(1,dt*13));', 'this.x+=((this.lane-1)*2.6-this.x)*Math.min(1,dt*13);this.stumble=Math.max(0,this.stumble-dt);')
s=s.replace("this.done=true;this.emit('crash'", "if(o&&['barrier','arch'].includes(o.type)&&this.stumble<=0){this.stumble=7;this.invincible=1.4;o.cleared=true;this.emit('stumble');return;}this.done=true;this.emit('crash'")
s=s.replace('this.roll=0;for(const o of this.objects)if(o.z<this.distance+65)', 'this.roll=0;this.stumble=0;for(const o of this.objects)if(o.z<this.distance+65)')
s=s.replace('row.push(train);if(pattern', 'if(train.oncoming)train.z+=(z-this.distance)/Math.max(11,this.speed)*8;row.push(train);if(pattern')
p.write_text(s)
p=root/'store/subwaysurfers/game.js';s=p.read_text().replace('pointer=null;acc=0;applyTouch();','pointer=null;lastTap=0;acc=0;applyTouch();')
s=s.replace("if(e.type==='key'){", "if(e.type==='stumble'){notice('Careful! The guard is close.');tone(130,.1);}if(e.type==='key'){")
s=s.replace('(7+level*2)', '(10+level*4)')
p.write_text(s)
