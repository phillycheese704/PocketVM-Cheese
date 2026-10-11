from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
p=root/'store/matchsurvival/core.js'
p.write_text(p.read_text().replace('if(this.day>=25){','if(this.day===25){'))
p=root/'tools/game-series-progress.json'
d=json.loads(p.read_text())
d['completed']['shoot']={'commit':'4d6fcc22e8da2cba08064407536ab4c935aa9860','url':'https://phillycheese704.github.io/PocketVM-Cheese/store/shoot/game.html?v=shoot-v2','checks':31,'layouts':6,'proof':'tests/shoot-live-1791754336067.jpg'}
d['active']='matchsurvival'
p.write_text(json.dumps(d,indent=2)+'\n')
cfg=root/'tools/game-series.json'
d=json.loads(cfg.read_text())
d['matchsurvival']={'name':'Match Survival','symbol':'▦','revision':'matchsurvival-v1','package':['game.html','core.js','render.js','game.js'],'category':'Match-three survival','summary':'Build by day · survive the night · cascades and bosses','controls':'Tap neighbours · swipe · keyboard grid','variants':[{'kicker':'A LITTLE WORLD','title':'Grid- Match- Survive','copy':'Match three to gather resources and build a village. When night falls, the very same tiles become weapons, shields and creatures.','tone':'night'},{'kicker':'DAYLIGHT IS PRECIOUS','title':'A village by day. A fight by night.','copy':'Daylight advances with your swaps. Night runs in real time. Equip your survivor and choose your battles.','tone':'night'},{'kicker':'GROW YOUR SETTLEMENT','title':'Six workshops. One survivor.','copy':'Upgrade your homestead, forge, sawmill, brickworks, weaver and arcane tower. Every new resource changes the grid.','tone':'night'},{'kicker':'AN EXPEDITION THAT LASTS','title':'Face the fifth-night creatures.','copy':'Boss nights, magic, potions, bombs and resumable expeditions. Survive 25 nights, then keep exploring endlessly.','tone':'night'}],'features':[['Make every match matter','Swap, cascade, collect and construct. Daylight lasts twelve successful moves.'],['Hold the night','Wood becomes shields, stone becomes swords and other resources summon creatures.'],['Your little world','Animated original village art, three difficulties, resumable progress and three mods.']],'mods':[['matchharvest','Double Harvest','✿','Daytime matches gather twice as many resources.'],['matchlongnight','Long Night','☾','Nights last 100 seconds, giving more time to fight and collect magic.'],['matchberserk','Berserker','⚔','Swords deal 80% more damage per equipment charge.']]}
cfg.write_text(json.dumps(d,indent=2)+'\n')
