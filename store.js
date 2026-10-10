(() => {
  'use strict';

  const GAME_ID = 'snake';
  const ROOT = '/home/user/Downloads/Snake';
  const SOURCE = './store/snake/';
  const PIN_KEY = 'pocketvm.store.snake.desktop';
  const SAVE_KEY = 'pocketvm.game.snake';
  const PACKAGE = [
    { name:'game.html', url:SOURCE + 'game.html', mime:'text/html', size:26916 },
    { name:'music.ogg', url:'https://raw.githubusercontent.com/Anubhav9/Yellow-Olive/main/media/resources/music_files/sakura_harbour_prologue_end.ogg', mime:'audio/ogg', size:1724097 }
  ];
  const DEFAULT_ICON_URL = SOURCE + 'icon.svg?v=illustrated-v1';
  const DEFAULT_ICON_ESTIMATE = 48000;
  const NAME_FILE = 'name.txt';
  const DEFAULT_NAME = 'Snake';
  const TOTAL_BYTES = PACKAGE.reduce((n, file) => n + file.size, 0) + DEFAULT_ICON_ESTIMATE + DEFAULT_NAME.length;
  const MOD_DOWNLOAD_ROOT = '/home/user/Downloads';
  const LEGACY_MOD_DOWNLOAD_ROOT = '/home/user/Downloads/Snake Mods';
  const MODS = Object.freeze({
    autobot: {
      id:'autobot',
      name:'Auto Bot',
      file:'auto-bot.pvmod',
      icon:'◇',
      tagline:'Let Snake drive itself.',
      description:'Adds a toggleable pathfinding bot that plans safe routes toward food while avoiding walls and its own body.',
      payload:{ pocketvmMod:1, game:'snake', id:'autobot', version:'1.0.0', name:'Auto Bot' }
    },
    cheese: {
      id:'cheese',
      name:'Cheese Mod',
      file:'cheese-mod.pvmod',
      icon:'▰',
      tagline:'A little extra temptation.',
      description:'Adds cheese alongside the apple. Cheese is worth 2 points and gives Snake a short one-second speed boost.',
      payload:{ pocketvmMod:1, game:'snake', id:'cheese', version:'1.0.0', name:'Cheese Mod' }
    }
  });
    const DEADWAVE_ID = 'deadwave';
  const DEADWAVE_ROOT = '/home/user/Downloads/Deadwave';
  const DEADWAVE_SOURCE = './store/deadwave/';
  const DEADWAVE_GAME_REVISION = 'arsenal-v4';
  const DEADWAVE_PIN_KEY = 'pocketvm.store.deadwave.desktop';
  const DEADWAVE_SAVE_KEY = 'pocketvm.game.deadwave';
  const DEADWAVE_NAME = 'Deadwave';
  const DEADWAVE_NAME_FILE = 'name.txt';
  const DEADWAVE_ICON_URL = DEADWAVE_SOURCE + 'icon.svg?v=illustrated-v1';
  const DEADWAVE_ICON_ESTIMATE = 48000;
  const DEADWAVE_PACKAGE = [
    { name:'game.html', url:DEADWAVE_SOURCE + 'game.html', mime:'text/html', size:111047 },
    { name:'music.mp3', url:'https://raw.githubusercontent.com/VincentLinta/Joc-practica-Lava-Adventure/f965d167f6ed2d72d4c3f3e9e50737f3f690590a/alex-morgan-video-game-pixel-chiptune-music-583271.mp3', mime:'audio/mpeg', size:4700160 }
  ];
  const DEADWAVE_TOTAL_BYTES = DEADWAVE_PACKAGE.reduce((n,file)=>n+file.size,0) + DEADWAVE_ICON_ESTIMATE + DEADWAVE_NAME.length;
  const DEADWAVE_SKIN_PACKS = Object.freeze({
    toxic: {
      id:'toxic', name:'Toxic Cleanup Pack', file:'deadwave-toxic-skins.pvmod',
      tagline:'Hazmat colours for ugly situations.',
      skins:[
        {id:'hazmat',name:'Hazmat',body:'#f4d85e',accent:'#30321d',bullet:'#fff0a0',glow:'#f5d95f'},
        {id:'bio-lime',name:'Bio Lime',body:'#a6ff6b',accent:'#183522',bullet:'#dcff9c',glow:'#86ff62'},
        {id:'cleanup-orange',name:'Cleanup Orange',body:'#ff9c52',accent:'#3b2115',bullet:'#ffd09b',glow:'#ff8a43'}
      ]
    },
    nightops: {
      id:'nightops', name:'Night Ops Pack', file:'deadwave-night-ops.pvmod',
      tagline:'Low-light survivor suits with sharper glow.',
      skins:[
        {id:'crimson',name:'Crimson',body:'#ff5365',accent:'#351018',bullet:'#ffb1b9',glow:'#ff4054'},
        {id:'void',name:'Void',body:'#9b82ff',accent:'#1e1937',bullet:'#d7ceff',glow:'#8f70ff'},
        {id:'ice',name:'Ice',body:'#8edcff',accent:'#132e3a',bullet:'#d2f4ff',glow:'#73d4ff'}
      ]
    },
    arcade: {
      id:'arcade', name:'Arcade Survivors Pack', file:'deadwave-arcade-skins.pvmod',
      tagline:'Bright throwback colours for the apocalypse.',
      skins:[
        {id:'hot-pink',name:'Hot Pink',body:'#ff6fc8',accent:'#3b1730',bullet:'#ffc2e7',glow:'#ff5cbb'},
        {id:'cyan-chip',name:'Cyan Chip',body:'#5ce8e8',accent:'#113333',bullet:'#c7ffff',glow:'#45dede'},
        {id:'gold-bit',name:'Gold Bit',body:'#ffd65d',accent:'#382d12',bullet:'#fff0ae',glow:'#ffc83d'}
      ]
    }
  });
  const DEADWAVE_MODS = Object.freeze({
    autobot: {
      id:'autobot',
      name:'Deadwave Auto Bot',
      file:'deadwave-auto-bot.pvmod',
      tagline:'A survival AI that plays the arena for you.',
      description:'Predicts projectiles and missile impacts, avoids dense zombie paths and arena edges, keeps safe firing distance, and evaluates upgrade cards between waves.',
      payload:{pocketvmMod:1,game:'deadwave',kind:'gameplay',id:'autobot',version:'1.0.0',name:'Deadwave Auto Bot'}
    }
  });
  const deadwaveFeatureVariants = [
    {kicker:'NEW RELEASE',title:'The dead do not stop.',copy:'Endless arena survival. Move, let the gun work, then rebuild your survivor one card at a time.',tone:'blood'},
    {kicker:'FEATURED',title:'Build your own apocalypse.',copy:'Choose from 136 upgrade cards, discover 13 weapons, and defeat every boss before advancing.',tone:'violet'},
    {kicker:'ENDLESS',title:'How broken can your build get?',copy:'Stack multishot, crits, pierce, armour, regen and more while 19 zombie breeds and eight bosses test your build.',tone:'toxic'},
    {kicker:'BUILT FOR TOUCH',title:'One thumb. A lot of zombies.',copy:'Virtual joystick movement with automatic targeting and firing, designed around iPad play.',tone:'night'}
  ];

  const BLOCKBLAST_ID = 'blockblast';
  const BLOCKBLAST_ROOT = '/home/user/Downloads/Block Blast';
  const BLOCKBLAST_SOURCE = './store/blockblast/';
  const BLOCKBLAST_PIN_KEY = 'pocketvm.store.blockblast.desktop';
  const BLOCKBLAST_SAVE_KEY = 'pocketvm.game.blockblast';
  const BLOCKBLAST_NAME = 'Block Blast';
  const BLOCKBLAST_NAME_FILE = 'name.txt';
  const BLOCKBLAST_ICON_URL = BLOCKBLAST_SOURCE + 'icon.svg?v=illustrated-v1';
  const BLOCKBLAST_ICON_ESTIMATE = 26000;
  const BLOCKBLAST_PACKAGE = [
    { name:'game.html', url:BLOCKBLAST_SOURCE + 'game.html', mime:'text/html', size:20670 }
  ];
  const BLOCKBLAST_TOTAL_BYTES = BLOCKBLAST_PACKAGE.reduce((n,file)=>n+file.size,0) + BLOCKBLAST_ICON_ESTIMATE + BLOCKBLAST_NAME.length;
  const BLOCKBLAST_MODS = Object.freeze({
    themes:{
      id:'themes',name:'Theme Packs',file:'blockblast-theme-packs.pvmod',kind:'cosmetic',icon:'◫',
      tagline:'Four extra looks for the board.',
      description:'Adds Neon, Red / Black, Pastel and Mono themes with matching block palettes. Cycle them from the in-game THEME button.',
      payload:{pocketvmMod:1,game:'blockblast',kind:'cosmetic',id:'themes',version:'1.0.0',name:'Theme Packs',themes:['neon','red','pastel','mono']}
    },
    chaos:{
      id:'chaos',name:'Chaos Shapes',file:'blockblast-chaos-shapes.pvmod',kind:'gameplay',icon:'✣',
      tagline:'Make the tray considerably less polite.',
      description:'Expands the normal piece pool with long bars, crosses, stairs, chunky corners and other awkward shapes.',
      payload:{pocketvmMod:1,game:'blockblast',kind:'gameplay',id:'chaos',version:'1.0.0',name:'Chaos Shapes'}
    },
    undo:{
      id:'undo',name:'Undo Mod',file:'blockblast-undo.pvmod',kind:'gameplay',icon:'↶',
      tagline:'One second chance per tray.',
      description:'Adds an UNDO button that can restore the board, score and tray to before your last placement once per three-piece tray.',
      payload:{pocketvmMod:1,game:'blockblast',kind:'gameplay',id:'undo',version:'1.0.0',name:'Undo Mod'}
    }
  });
  const blockBlastFeatureVariants = [
    {kicker:'NEW & TINY',title:'Make the board disappear.',copy:'Drop three pieces at a time, clear full rows and columns, and keep making room.',tone:'blocks'},
    {kicker:'QUICK PLAY',title:'One more piece.',copy:'Simple placement, satisfying clears and no loading screen. Built for quick iPad sessions.',tone:'blocks'},
    {kicker:'PUZZLE',title:'Eight by eight. No excuses.',copy:'Think ahead, protect your space and chase a bigger combo before the board locks up.',tone:'blocks'},
    {kicker:'UNDER 50 KB',title:'Tiny game. Dangerous time sink.',copy:'No soundtrack download, no framework and no filler — just the puzzle loop.',tone:'blocks'}
  ];


  const CRUMBCLICKER_ID='crumbclicker',CRUMBCLICKER_ROOT='/home/user/Downloads/Crumb Clicker',CRUMBCLICKER_SOURCE='./store/crumbclicker/',CRUMBCLICKER_GAME_REVISION='v1',CRUMBCLICKER_PIN_KEY='pocketvm.store.crumbclicker.desktop',CRUMBCLICKER_SAVE_KEY='pocketvm.game.crumbclicker',CRUMBCLICKER_NAME='Crumb Clicker',CRUMBCLICKER_NAME_FILE='name.txt',CRUMBCLICKER_ICON_URL=CRUMBCLICKER_SOURCE+'icon.svg?v=illustrated-v1',CRUMBCLICKER_ICON_ESTIMATE=24000;
  const CRUMBCLICKER_BUILDING_IDS=['finger','baker','oven','farm','mill','line','market','royal','time','portal','moon'];
  const CRUMBCLICKER_PACKAGE=[{name:'game.html',url:CRUMBCLICKER_SOURCE+'game.html',mime:'text/html',size:1778815}];
  const CRUMBCLICKER_TOTAL_BYTES=CRUMBCLICKER_PACKAGE.reduce((n,file)=>n+file.size,0)+CRUMBCLICKER_ICON_ESTIMATE+CRUMBCLICKER_NAME.length;
  const CRUMBCLICKER_CANDY_ICON=CRUMBCLICKER_SOURCE+'candy-icon.svg?v=illustrated-v1';
  const CRUMBCLICKER_MODS=Object.freeze({"hyperclicker":{"id":"hyperclicker","name":"Hyperclicker","file":"crumbclicker-hyperclicker.pvmod","kind":"gameplay","icon":"⚡","tagline":"Five thousand clicks a second.","description":"Adds a simple HYPER toggle. Turn it on and the game generates roughly 5,000 manual clicks every second using your current click power.","payload":{"pocketvmMod":1,"game":"crumbclicker","kind":"gameplay","id":"hyperclicker","version":"1.0.0","name":"Hyperclicker","clicksPerSecond":5000}},"opbuildings":{"id":"opbuildings","name":"OP Buildings","file":"crumbclicker-op-buildings.pvmod","kind":"gameplay","icon":"1","tagline":"Every building costs one.","description":"Makes every individual building cost exactly 1. Buying 10 costs 10, buying 100 costs 100, and MAX buys as many as your current currency allows.","payload":{"pocketvmMod":1,"game":"crumbclicker","kind":"gameplay","id":"opbuildings","version":"1.0.0","name":"OP Buildings","buildingUnitCost":1}},"candy":{"id":"candy","name":"Candy Clicker","file":"crumbclicker-candy-clicker.pvmod","kind":"cosmetic","icon":"🍬","tagline":"Same addiction. More sugar.","description":"Turns the biscuit into candy, changes the bakery into a candy shop, swaps the currency to candies, and reskins names, messages and colours.","payload":{"pocketvmMod":1,"game":"crumbclicker","kind":"cosmetic","id":"candy","version":"1.0.0","name":"Candy Clicker"}}});
  const crumbClickerFeatureVariants=[
    {kicker:'NEW RELEASE',title:'One biscuit becomes an empire.',copy:'Tap the biscuit, hire production, buy upgrades and watch the numbers stop behaving normally.',tone:'crumb'},
    {kicker:'IDLE',title:'Your bakery does not sleep.',copy:'Build a production chain that keeps baking while you play — and earns offline progress when you leave.',tone:'crumb'},
    {kicker:'INCREMENTAL',title:'The dangerous number-go-up game.',copy:'Bulk buying, rare lucky crumbs, achievements and permanent Bakery Stars keep the loop growing.',tone:'crumb'},
    {kicker:'BUILT TO CLICK',title:'Start with one tap.',copy:'A familiar idle-clicker loop rebuilt with original PocketVM art, writing and progression.',tone:'crumb'}
  ];
  const PVZ_ID='pvz';
  const PVZ_ROOT='/home/user/Downloads/Plants vs Zombies';
  const PVZ_SOURCE='./store/pvz/';
  const PVZ_GAME_REVISION='adventure-v15';
  const PVZ_PIN_KEY='pocketvm.store.pvz.desktop';
  const PVZ_SAVE_KEY='pocketvm.game.pvz';
  const PVZ_NAME='Plants vs Zombies';
  const PVZ_NAME_FILE='name.txt';
  const PVZ_ICON_URL=PVZ_SOURCE+'icon.svg?v=illustrated-v1';
  const PVZ_ICON_ESTIMATE=32000;
  const PVZ_GAME_BYTES=9842978;
  const PVZ_TRACKS=Object.freeze([
    {id:'02',name:'02.mp3',url:'https://raw.githubusercontent.com/terriblepepper/PVZ/ac128d3b927810c44ffe1fc95eea5f114d7987ba/sound/02CrazyDave.mp3',mime:'audio/mpeg',size:1403422},
    {id:'03',name:'03.mp3',url:'https://raw.githubusercontent.com/terriblepepper/PVZ/ac128d3b927810c44ffe1fc95eea5f114d7987ba/sound/03chooseYourSeeds.mp3',mime:'audio/mpeg',size:554551},
    {id:'04',name:'04.mp3',url:'https://raw.githubusercontent.com/terriblepepper/PVZ/ac128d3b927810c44ffe1fc95eea5f114d7987ba/sound/04Grasswalk.mp3',mime:'audio/mpeg',size:1186955},
    {id:'05',name:'05.mp3',url:'https://raw.githubusercontent.com/terriblepepper/PVZ/ac128d3b927810c44ffe1fc95eea5f114d7987ba/sound/05LoonBoon.mp3',mime:'audio/mpeg',size:1717727},
    {id:'06',name:'06.mp3',url:'https://raw.githubusercontent.com/terriblepepper/PVZ/ac128d3b927810c44ffe1fc95eea5f114d7987ba/sound/06Moongrains.mp3',mime:'audio/mpeg',size:2339233},
    {id:'09',name:'09.mp3',url:'https://raw.githubusercontent.com/terriblepepper/PVZ/ac128d3b927810c44ffe1fc95eea5f114d7987ba/sound/09WaterGraves.mp3',mime:'audio/mpeg',size:1864013},
    {id:'10',name:'10.mp3',url:'https://raw.githubusercontent.com/nmhienbn/PVZ-Kaito-NMH-Edition/a61577b19ca69eb3ae1f1ec1023d8ae5ff5f2d8c/resources/audio/UltimateBattle.mp3',mime:'audio/mpeg',size:1856554},
    {id:'11',name:'11.mp3',url:'https://raw.githubusercontent.com/terriblepepper/PVZ/ac128d3b927810c44ffe1fc95eea5f114d7987ba/sound/11RigorMormist.mp3',mime:'audio/mpeg',size:1805499},
    {id:'13',name:'13.mp3',url:'https://raw.githubusercontent.com/terriblepepper/PVZ/ac128d3b927810c44ffe1fc95eea5f114d7987ba/sound/13Grazetheroof.mp3',mime:'audio/mpeg',size:2949453}
  ]);
  const PVZ_TOTAL_BYTES=PVZ_GAME_BYTES+PVZ_TRACKS.reduce((n,file)=>n+file.size,0)+PVZ_ICON_ESTIMATE+PVZ_NAME.length;
  const PVZ_UPGRADE_IDS=new Set(['gatlingpea','twinsunflower','gloomshroom','cattail','wintermelon','goldmagnet','spikerock','cobcannon','imitater']);
  const pvzFeatureVariants=[
    {kicker:'FULL ADVENTURE',title:'Defend fifty lawns.',copy:'Five worlds, fifty Adventure stages, forty-nine plants, world gimmicks and a final rooftop showdown.',tone:'garden'},
    {kicker:'LANE DEFENSE',title:'Build the right lawn.',copy:'Sun economy, seed cooldowns, graves, water support, fog, roof pots and specialized plant roles all matter.',tone:'garden'},
    {kicker:'ENDLESS',title:'Day becomes night.',copy:'After Adventure, Endless keeps the same defense alive while Day and Night swap every three minutes.',tone:'garden'},
    {kicker:'FLAGSHIP',title:'PocketVM goes gardening.',copy:'A large touch-friendly strategy campaign with progression, almanac, upgrade shop, bosses and an original ending.',tone:'garden'}
  ];


  const APEX_ID='apexrush';
  const APEX_ROOT='/home/user/Downloads/Apex Rush';
  const APEX_SOURCE='./store/apexrush/';
  const APEX_GAME_REVISION='race-v2-ipad';
  const APEX_PIN_KEY='pocketvm.store.apexrush.desktop';
  const APEX_SAVE_KEY='pocketvm.game.apexrush';
  const APEX_NAME='Apex Rush';
  const APEX_NAME_FILE='name.txt';
  const APEX_ICON_URL=APEX_SOURCE+'icon.svg?v=illustrated-v1';
  const APEX_ICON_ESTIMATE=28000;
  const APEX_GAME_BYTES=69354;
  const APEX_MUSIC={name:'music.mp3',mime:'audio/mpeg',size:3387141,urls:[APEX_SOURCE+'music.mp3']};
  const APEX_TOTAL_BYTES=APEX_GAME_BYTES+APEX_MUSIC.size+APEX_ICON_ESTIMATE+APEX_NAME.length;
  const apexFeatureVariants=[
    {kicker:'NEW RACING GAME',title:'Find your line. Own the next apex.',copy:'Five circuits, four AI difficulties and real car collisions. Build a custom grid, paint your car and race with your uploaded soundtrack.',tone:'sky'},
    {kicker:'MOTORSPORT',title:'Every corner is a conversation.',copy:'Steer, brake, drift and boost through coastal, desert, alpine, city and garden circuits. Wet roads change the grip.',tone:'sky'},
    {kicker:'YOUR GRID',title:'Paint it. Race it. Randomise it.',copy:'Choose car colours, rivals, weather and laps, or let Random build the next race. A live map keeps every rival in view.',tone:'sky'},
    {kicker:'REAL CONTACT',title:'The barrier always wins the argument.',copy:'Collisions transfer momentum, spin cars and leave damage and skid marks. Recover with a two-second hold, then find your rhythm.',tone:'sky'}
  ];


  const GRADE_ID='gradeschool',GRADE_NAME='Grade School',GRADE_ROOT='/home/user/Downloads/Grade School',GRADE_SOURCE='./store/gradeschool/',GRADE_ICON_URL=GRADE_SOURCE+'icon.svg?v=illustrated-v1',GRADE_GAME_REVISION='school-v3',GRADE_SAVE_KEY='pocketvm.game.gradeschool',GRADE_PIN_KEY='pocketvm.store.gradeschool.desktop';
  const GRADE_FILES=[{"name":"game.html","size":27253,"mime":"text/html"},{"name":"core.js","size":23056,"mime":"text/javascript"},{"name":"game.js","size":47440,"mime":"text/javascript"}];
  const GRADE_TOTAL_BYTES=GRADE_FILES.reduce((n,f)=>n+f.size,0)+72277+GRADE_NAME.length;
  const gradeFeatureVariants=[
    {kicker:'NEW CLASSROOM SIM',title:'Tiny brains. Big confidence.',copy:'A teacher’s desk, twelve expressive students and a stack of spectacular answers. Choose red or green ink, draw a grade on the paper and hand it back — then spend your coins on a classroom glow-up.',tone:'sky'},
    {kicker:'SIX SUBJECTS',title:'The homework is in your hands.',copy:'A class that thinks bananas are phones and potatoes can fly. Eighty absurd prompts, generated snack maths, suspicious doodles and twelve completely confident students.',tone:'sky'},
    {kicker:'QUICK CHALLENGES',title:'Beat the bell.',copy:'Career days, a 60-second Bell Rush, a three-mistake marathon and a seeded daily class. Mark accurately to earn your upgrades.',tone:'sky'},
    {kicker:'BUILT FOR IPAD',title:'Draw the grade. Judge the chaos.',copy:'Red/green ink, freehand finger or pencil drawing, undo/clear, large tablet buttons and saved unfinished doodles. Every timer waits when you pause.',tone:'sky'}
  ];

  const WOBBLE_ID='wobblebay',WOBBLE_NAME='Wobble Bay',WOBBLE_ROOT='/home/user/Downloads/Wobble Bay',WOBBLE_SOURCE='./store/wobblebay/',WOBBLE_ICON_URL=WOBBLE_SOURCE+'icon.svg?v=illustrated-v1',WOBBLE_GAME_REVISION='bay-v4',WOBBLE_SAVE_KEY='pocketvm.game.wobblebay',WOBBLE_PIN_KEY='pocketvm.store.wobblebay.desktop';
  const WOBBLE_FILES=[{"name":"game.html","size":19793,"mime":"text/html"},{"name":"engine.js","size":31149,"mime":"text/javascript"},{"name":"game.js","size":48828,"mime":"text/javascript"},{"name":"three.min.js","size":669885,"mime":"text/javascript"},{"name":"software-renderer.js","size":7682,"mime":"text/javascript"},{"name":"THREE-LICENSE.txt","size":1082,"mime":"text/plain"}];
  const WOBBLE_TOTAL_BYTES=WOBBLE_FILES.reduce((n,f)=>n+f.size,0)+61832+WOBBLE_NAME.length;
  const wobbleFeatureVariants=[
    {kicker:'NEW 3D SANDBOX',title:'A little work. A lot of wobble.',copy:'An original physics island: eight paid jobs, floppy characters, cars, boats, a helicopter and real cargo. Earn a new hat, call a ride and buy your first home.',tone:'sky'},
    {kicker:'YOUR LITTLE WORLD',title:'Borrow the keys. Explore the bay.',copy:'Drive, sail or fly between a pastel town, hilltop homes, a park, a pier and an offshore island. Discover sixteen golden stars and meet your neighbours.',tone:'sky'},
    {kicker:'GRAB. FLOP. PLAY.',title:'Physics with a sense of humour.',copy:'Grab and throw objects, load a pickup, tumble through crashes and shoot a basket. Eight jobs pay for your next outfit, home or cheerful dog.',tone:'sky'},
    {kicker:'MADE FOR IPAD',title:'Room for both thumbs.',copy:'Large touch controls, a camera you can swipe, portrait and landscape layouts, keyboard and Xbox controller support. Your cash and purchases stay saved.',tone:'sky'}
  ];

  const FLAPPY_ID='flappy';
  const FLAPPY_ROOT='/home/user/Downloads/Flappy Bird';
  const FLAPPY_SOURCE='./store/flappy/';
  const FLAPPY_GAME_REVISION='flight-v3';
  const FLAPPY_PIN_KEY='pocketvm.store.flappy.desktop';
  const FLAPPY_SAVE_KEY='pocketvm.game.flappy';
  const FLAPPY_NAME='Flappy Bird';
  const FLAPPY_NAME_FILE='name.txt';
  const FLAPPY_ICON_URL=FLAPPY_SOURCE+'icon.svg?v=illustrated-v1';
  const FLAPPY_ICON_ESTIMATE=28000;
  const FLAPPY_GAME_BYTES=35062;
  const FLAPPY_MUSIC={name:'music.mp3',mime:'audio/mpeg',size:1493465,urls:[
    'https://od.lk/s/ODdfMzQxNjQ0MTRf/03.%20Main%20Theme.mp3',
    'https://downloads.khinsider.com/game-soundtracks/album/flappy-bird-crypto-android-ios-online-gamerip-2024/03.%2520Main%2520Theme.mp3'
  ]};
  const FLAPPY_TOTAL_BYTES=FLAPPY_GAME_BYTES+FLAPPY_MUSIC.size+FLAPPY_ICON_ESTIMATE+FLAPPY_NAME.length;
  const flappyFeatureVariants=[
    {kicker:'FLIGHT UPDATE',title:'Find your rhythm. Find your flock.',copy:'Smooth flight, animated birds and three changing skies. Chase a Classic best or learn the gaps with Practice checkpoints.',tone:'sky'},
    {kicker:'CLASSIC',title:'One pipe. One point. One more flight.',copy:'Bounded pipe layouts and gently capped difficulty reward steady timing. Earn medals, clean streaks and five bird colours.',tone:'sky'},
    {kicker:'PRACTICE',title:'Every gap is a fresh start.',copy:'Wider gaps, slower pipes and a checkpoint after every pass. Practice scores stay separate from your Classic record.',tone:'sky'},
    {kicker:'BUILT FOR TOUCH',title:'A little bird. A long way home.',copy:'Tap or use Space to flap. Pause anywhere, retry quickly, and keep your old best score and supplied Main Theme.',tone:'sky'}
  ];

  const PENGUIN_ID='penguinpull';
  const PENGUIN_ROOT='/home/user/Downloads/Penguin Pull';
  const PENGUIN_SOURCE='./store/penguinpull/';
  const PENGUIN_GAME_REVISION='endless-v4';
  const PENGUIN_PIN_KEY='pocketvm.store.penguinpull.desktop';
  const PENGUIN_SAVE_KEY='pocketvm.game.penguinpull';
  const PENGUIN_NAME='Penguin Pull';
  const PENGUIN_NAME_FILE='name.txt';
  const PENGUIN_ICON_URL=PENGUIN_SOURCE+'icon.svg?v=illustrated-v1';
  const PENGUIN_ICON_ESTIMATE=28000;
  const PENGUIN_GAME_BYTES=43036;
  const PENGUIN_TOTAL_BYTES=PENGUIN_GAME_BYTES+PENGUIN_ICON_ESTIMATE+PENGUIN_NAME.length;
  const penguinFeatureVariants=[
    {kicker:'NEW RELEASE',title:'Pull carefully. Save everybody.',copy:'Drag little penguins out of an icy tower and get them into the sea without dunking the sleeping royal.',tone:'ice'},
    {kicker:'TENSION PHYSICS',title:'Feel the tower fight back.',copy:'Loaded penguins resist pulls, the tower now has real wobble momentum, and centred cleared layers settle onto the next sheet.',tone:'ice'},
    {kicker:'BUILT FOR TOUCH',title:'One finger. Questionable engineering.',copy:'Drag, reconsider, settle a penguin back into place, or commit to the sea. Touch and mouse use the same physical rules.',tone:'ice'},
    {kicker:'ENDLESS RESCUE',title:'A new coast after every tower.',copy:'Every penguin that splashes scores once. Clear a tower to sail into a different random stage; keep going for an endless high score.',tone:'ice'}
  ];

  const FEATURE_ROTATE_MS = 15 * 60 * 1000;
  const featureVariants = [
    { kicker:'FEATURED', title:'The classic, done properly.', copy:'Fast, clean Snake built for keyboard and touch. No power-ups. No nonsense.', tone:'mint' },
    { kicker:'PLAY SOMETHING', title:'One apple. One more run.', copy:'Simple rules, smooth movement, instant restarts. The dangerous kind of simple.', tone:'lime' },
    { kicker:'BUILT FOR POCKETVM', title:'Swipe. Turn. Grow.', copy:'A polished classic with responsive controls, persistent high scores and bundled music.', tone:'forest' },
    { kicker:'QUICK PLAY', title:'Easy to start. Hard to stop.', copy:'Classic wall-and-body Snake with a gradually rising pace and zero gimmicks.', tone:'night' }
  ];

  let shellCtx = null;
  let syncTimer = null;

  const formatBytes = value => PocketDisk.formatBytes(Number(value || 0));
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  async function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Could not read image.'));
      reader.readAsDataURL(blob);
    });
  }

  function cleanDisplayName(value) {
    const name = String(value || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, 30);
    return name || DEFAULT_NAME;
  }

  async function isInstalled() {
    const needed = ['game.html', 'music.ogg', 'icon.png'];
    for (const name of needed) {
      const node = await PocketDisk.getNode(ROOT + '/' + name).catch(() => null);
      if (!node || node.type !== 'file') return false;
    }
    return true;
  }

  async function installedBytes() {
    const snap = await PocketDisk.snapshot();
    return Object.entries(snap)
      .filter(([path, node]) => node?.type === 'file' && path.startsWith(ROOT + '/'))
      .reduce((sum, [, node]) => sum + Number(node.size || 0), 0);
  }


  const ICON_REVISION='illustrated-v1',iconRefreshes=new Map();
  async function validGameIcon(blob){if(blob.size<100)return false;const a=new Uint8Array(await blob.slice(0,24).arrayBuffer()),v=new DataView(a.buffer);return a.length===24&&[137,80,78,71,13,10,26,10].every((n,i)=>a[i]===n)&&v.getUint32(16)===512&&v.getUint32(20)===512;}
  async function refreshGameIcon(root,source){if(iconRefreshes.has(root))return iconRefreshes.get(root);const task=(async()=>{try{if(await PocketDisk.readText(root+'/icon-version.txt').catch(()=>null)===ICON_REVISION)return;const response=await fetch(source+'icon-512.png',{cache:'no-cache'});if(!response.ok)throw new Error('Icon offline');const blob=await response.blob();if(!await validGameIcon(blob))throw new Error('Icon incomplete');await PocketDisk.writeBlob(root+'/icon.png',blob,'image/png');await PocketDisk.writeText(root+'/icon-version.txt',ICON_REVISION,'text/plain');}catch{iconRefreshes.delete(root);}})();iconRefreshes.set(root,task);return task;}
  function gameFavicons(html,id){const candy=id==='candyclicker',source=new URL('./store/'+(candy?'crumbclicker':id)+'/',location.href).href,prefix=candy?'candy-':'',links='<link rel="icon" type="image/png" sizes="32x32" href="'+source+'favicon-32.png"><link rel="icon" type="image/svg+xml" href="'+source+'icon.svg"><link rel="apple-touch-icon" sizes="180x180" href="'+source+'icon-180.png">';html=html.replace(/<link\b[^>]*rel=["'][^"']*(?:icon)[^"']*["'][^>]*>/gi,'');return html.replace(/<head([^>]*)>/i,'<head$1>'+links);}

  async function identity() {
    let name = DEFAULT_NAME;
    let icon = DEFAULT_ICON_URL;
    if (await isInstalled()) {
      try { name = cleanDisplayName(await PocketDisk.readText(ROOT + '/' + NAME_FILE)); } catch {}
      await refreshGameIcon(ROOT,SOURCE);try { icon = await blobToDataURL(await PocketDisk.readBlob(ROOT + '/icon.png')); } catch {}
    }
    return { name, icon };
  }

  function pinned() {
    return localStorage.getItem(PIN_KEY) === '1';
  }

  function setPinned(value) {
    if (value) localStorage.setItem(PIN_KEY, '1');
    else localStorage.removeItem(PIN_KEY);
  }

  function makeIconSlot(icon, className) {
    const slot = document.createElement('span');
    slot.className = className || 'store-shell-icon';
    const img = document.createElement('img');
    img.src = icon;
    img.alt = '';
    slot.appendChild(img);
    return slot;
  }

  function fillLauncher(button, name, icon, desktop = false) {
    button.replaceChildren();
    if (desktop) {
      const glyph = makeIconSlot(icon, 'desktop-glyph store-game-glyph');
      const label = document.createElement('span');
      label.className = 'store-game-label';
      label.textContent = name;
      button.append(glyph, label);
    } else {
      button.append(makeIconSlot(icon, 'store-start-icon'), document.createTextNode(name));
    }
  }

  async function syncShell(ctx = shellCtx) {
    if (!ctx) return;
    const installed = await isInstalled().catch(() => false);
    const startGrid = document.querySelector('.start-grid');
    const desktop = document.getElementById('desktop-icons');
    let start = document.querySelector('[data-store-launch="snake-start"]');
    let desk = document.querySelector('[data-store-launch="snake-desktop"]');

    if (!installed) {
      start?.remove();
      desk?.remove();
      setPinned(false);
      ctx.initDesktopGrid?.();
      return;
    }

    const id = await identity();
    if (startGrid) {
      if (!start) {
        start = document.createElement('button');
        start.dataset.open = GAME_ID;
        start.dataset.storeLaunch = 'snake-start';
        startGrid.appendChild(start);
      }
      fillLauncher(start, id.name, id.icon, false);
    }

    if (desktop) {
      if (pinned()) {
        if (!desk) {
          desk = document.createElement('button');
          desk.className = 'desktop-icon store-game-desktop';
          desk.dataset.open = GAME_ID;
          desk.dataset.storeLaunch = 'snake-desktop';
          desktop.appendChild(desk);
        }
        fillLauncher(desk, id.name, id.icon, true);
      } else {
        desk?.remove();
      }
    }

    for (const win of ctx.state.windows.values()) {
      if (win.appId !== GAME_ID) continue;
      ctx.setWindowTitle(win, id.name, '🐍');
      applyWindowIcon(win, id.icon, ctx);
    }
    ctx.initDesktopGrid?.();
  }

  function applyWindowIcon(win, icon, ctx) {
    const windowIcon = ctx.queryOne('.window-icon', win.el);
    if (windowIcon) {
      const img = document.createElement('img');
      img.src = icon;
      img.alt = '';
      img.className = 'store-window-icon';
      windowIcon.replaceChildren(img);
    }
    const taskIcon = document.querySelector(`.task-app[data-window-id="${CSS.escape(win.id)}"] > span:first-child`);
    if (taskIcon) {
      const img = document.createElement('img');
      img.src = icon;
      img.alt = '';
      img.className = 'store-task-icon';
      taskIcon.replaceChildren(img);
    }
  }

  async function createDefaultIconBlob() {
    const response = await fetch(DEFAULT_ICON_URL, { cache:'no-cache' });
    if (!response.ok) throw new Error('Could not prepare the Snake icon.');
    const svg = await response.text();
    const source = URL.createObjectURL(new Blob([svg], { type:'image/svg+xml' }));
    try {
      const img = new Image();
      img.decoding = 'async';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Could not render the Snake icon.'));
        img.src = source;
      });
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, 512, 512);
      const png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!png) throw new Error('Could not encode the Snake icon.');
      return png;
    } finally { URL.revokeObjectURL(source); }
  }

  async function fetchAsset(file, progress, baseLoaded = 0) {
    const response = await fetch(file.url, { cache:'no-cache' });
    if (!response.ok) throw new Error('Download failed: ' + file.name);
    if (!response.body?.getReader) {
      const blob = await response.blob();
      progress?.(baseLoaded + blob.size, TOTAL_BYTES, file.name);
      return blob;
    }
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      progress?.(baseLoaded + Math.min(loaded, file.size), TOTAL_BYTES, file.name);
    }
    return new Blob(chunks, { type:file.mime });
  }

  async function installSnake(progress) {
    if (await isInstalled()) return;
    await PocketDisk.ensureDir(ROOT);
    let completed = 0;
    const created = [];
    try {
      for (const file of PACKAGE) {
        const blob = await fetchAsset(file, progress, completed);
        await PocketDisk.writeBlob(ROOT + '/' + file.name, blob, file.mime);
        created.push(ROOT + '/' + file.name);
        completed += blob.size;
        progress?.(completed, TOTAL_BYTES, file.name);
      }
      const iconBlob = await createDefaultIconBlob();
      await PocketDisk.writeBlob(ROOT + '/icon.png', iconBlob, 'image/png');
      created.push(ROOT + '/icon.png');
      completed += iconBlob.size;
      progress?.(Math.min(completed, TOTAL_BYTES), TOTAL_BYTES, 'icon.png');

      await PocketDisk.writeText(ROOT + '/' + NAME_FILE, DEFAULT_NAME, 'text/plain');
      created.push(ROOT + '/' + NAME_FILE);
      progress?.(TOTAL_BYTES, TOTAL_BYTES, 'Finishing');
      await shellCtx?.refreshFS?.();
      await syncShell();
      shellCtx?.notify?.('Snake installed', 'Ready to play from the Store or Start.', '🐍');
    } catch (err) {
      for (const path of created.reverse()) await PocketDisk.remove(path).catch(() => {});
      throw err;
    }
  }

  async function uninstallSnake() {
    if (!await isInstalled()) return;
    for (const win of [...(shellCtx?.state?.windows?.values?.() || [])]) {
      if (win.appId === GAME_ID) shellCtx.closeWindow?.(win.id);
    }
    await PocketDisk.remove(ROOT);
    setPinned(false);
    await shellCtx?.refreshFS?.();
    await syncShell();
    shellCtx?.notify?.('Snake uninstalled', 'Its files were removed from the virtual drive.', '×');
  }

  async function toggleDesktopPin(value) {
    setPinned(value);
    await syncShell();
    shellCtx?.notify?.(value ? 'Added to desktop' : 'Removed from desktop', DEFAULT_NAME, value ? '＋' : '−');
  }

  async function deadwaveInstalled() {
    for (const name of ['game.html','music.mp3','icon.png']) {
      const node = await PocketDisk.getNode(DEADWAVE_ROOT + '/' + name).catch(() => null);
      if (!node || node.type !== 'file') return false;
    }
    return true;
  }

  async function deadwaveBytes() {
    const snap = await PocketDisk.snapshot();
    return Object.entries(snap).filter(([path,node]) => node?.type === 'file' && path.startsWith(DEADWAVE_ROOT + '/')).reduce((sum,[,node]) => sum + Number(node.size||0),0);
  }

  async function deadwaveIdentity() {
    let name = DEADWAVE_NAME, icon = DEADWAVE_ICON_URL;
    if (await deadwaveInstalled()) {
      try { name = cleanDisplayName(await PocketDisk.readText(DEADWAVE_ROOT + '/' + DEADWAVE_NAME_FILE)); } catch {}
      await refreshGameIcon(DEADWAVE_ROOT,DEADWAVE_SOURCE);try { icon = await blobToDataURL(await PocketDisk.readBlob(DEADWAVE_ROOT + '/icon.png')); } catch {}
    }
    return {name,icon};
  }

  function deadwavePinned() { return localStorage.getItem(DEADWAVE_PIN_KEY) === '1'; }
  function setDeadwavePinned(value) { if (value) localStorage.setItem(DEADWAVE_PIN_KEY,'1'); else localStorage.removeItem(DEADWAVE_PIN_KEY); }

  async function createDeadwaveIconBlob() {
    const response = await fetch(DEADWAVE_ICON_URL,{cache:'no-cache'});
    if (!response.ok) throw new Error('Could not prepare the Deadwave icon.');
    const svg = await response.text();
    const source = URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
    try {
      const img = new Image(); img.decoding='async';
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Could not render the Deadwave icon.'));img.src=source;});
      const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=512;
      canvas.getContext('2d').drawImage(img,0,0,512,512);
      const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      if(!png) throw new Error('Could not encode the Deadwave icon.');
      return png;
    } finally { URL.revokeObjectURL(source); }
  }

  async function fetchDeadwaveAsset(file, progress, baseLoaded=0) {
    const response = await fetch(new URL(file.url,location.href).href,{cache:'no-cache'});
    if(!response.ok) throw new Error('Download failed: '+file.name);
    if(!response.body?.getReader){
      const blob=await response.blob(); progress?.(baseLoaded+blob.size,DEADWAVE_TOTAL_BYTES,file.name); return blob;
    }
    const reader=response.body.getReader(),chunks=[]; let loaded=0;
    while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);loaded+=value.byteLength;progress?.(baseLoaded+Math.min(loaded,file.size),DEADWAVE_TOTAL_BYTES,file.name);}
    return new Blob(chunks,{type:file.mime});
  }

  async function loadDeadwaveGameHTML() {
    const path=DEADWAVE_ROOT+'/game.html';
    let html=await PocketDisk.readText(path);
    const marker='name="pocketvm-deadwave-build" content="'+DEADWAVE_GAME_REVISION+'"';
    if(html.includes(marker)) return html;
    try {
      const file=DEADWAVE_PACKAGE.find(item=>item.name==='game.html');
      const response=await fetch(new URL(file.url,location.href).href,{cache:'no-cache'});
      if(response.ok){
        const fresh=await response.text();
        if(fresh.includes(marker)){
          await PocketDisk.writeText(path,fresh,'text/html');
          await shellCtx?.refreshFS?.();
          html=fresh;
          shellCtx?.notify?.('Deadwave updated','13 weapons, 136 cards, 19 zombie breeds and 8 bosses are ready.','☣');
        }
      }
    } catch {}
    return html;
  }

  async function installDeadwave(progress) {
    if(await deadwaveInstalled()) return;
    await PocketDisk.ensureDir(DEADWAVE_ROOT);
    let completed=0;
    try {
      for(const file of DEADWAVE_PACKAGE){
        const blob=await fetchDeadwaveAsset(file,progress,completed);
        await PocketDisk.writeBlob(DEADWAVE_ROOT+'/'+file.name,blob,file.mime);
        completed+=blob.size; progress?.(completed,DEADWAVE_TOTAL_BYTES,file.name);
      }
      const iconBlob=await createDeadwaveIconBlob();
      await PocketDisk.writeBlob(DEADWAVE_ROOT+'/icon.png',iconBlob,'image/png');
      completed+=iconBlob.size; progress?.(Math.min(completed,DEADWAVE_TOTAL_BYTES),DEADWAVE_TOTAL_BYTES,'icon.png');
      await PocketDisk.writeText(DEADWAVE_ROOT+'/'+DEADWAVE_NAME_FILE,DEADWAVE_NAME,'text/plain');
      progress?.(DEADWAVE_TOTAL_BYTES,DEADWAVE_TOTAL_BYTES,'Finishing');
      await shellCtx?.refreshFS?.(); await syncDeadwaveShell();
      shellCtx?.notify?.('Deadwave installed','Ready to survive.','☣');
    } catch(err) {
      if(await PocketDisk.getNode(DEADWAVE_ROOT).catch(()=>null)) await PocketDisk.remove(DEADWAVE_ROOT).catch(()=>{});
      throw err;
    }
  }

  async function uninstallDeadwave() {
    if(!await deadwaveInstalled()) return;
    for(const win of [...(shellCtx?.state?.windows?.values?.()||[])]) if(win.appId===DEADWAVE_ID) shellCtx.closeWindow?.(win.id);
    await PocketDisk.remove(DEADWAVE_ROOT); setDeadwavePinned(false);
    await shellCtx?.refreshFS?.(); await syncDeadwaveShell();
    shellCtx?.notify?.('Deadwave uninstalled','Its files were removed from the virtual drive.','×');
  }

  async function toggleDeadwavePin(value) {
    setDeadwavePinned(value); await syncDeadwaveShell();
    shellCtx?.notify?.(value?'Added to desktop':'Removed from desktop',DEADWAVE_NAME,value?'＋':'−');
  }

  async function syncDeadwaveShell(ctx=shellCtx) {
    if(!ctx) return;
    const installed=await deadwaveInstalled().catch(()=>false);
    const startGrid=document.querySelector('.start-grid'),desktop=document.getElementById('desktop-icons');
    let start=document.querySelector('[data-store-launch="deadwave-start"]'),desk=document.querySelector('[data-store-launch="deadwave-desktop"]');
    if(!installed){start?.remove();desk?.remove();setDeadwavePinned(false);ctx.initDesktopGrid?.();return;}
    const id=await deadwaveIdentity();
    if(startGrid){if(!start){start=document.createElement('button');start.dataset.open=DEADWAVE_ID;start.dataset.storeLaunch='deadwave-start';startGrid.appendChild(start);}fillLauncher(start,id.name,id.icon,false);}
    if(desktop){if(deadwavePinned()){if(!desk){desk=document.createElement('button');desk.className='desktop-icon store-game-desktop';desk.dataset.open=DEADWAVE_ID;desk.dataset.storeLaunch='deadwave-desktop';desktop.appendChild(desk);}fillLauncher(desk,id.name,id.icon,true);}else desk?.remove();}
    for(const win of ctx.state.windows.values()){if(win.appId!==DEADWAVE_ID)continue;ctx.setWindowTitle(win,id.name,'☣');applyWindowIcon(win,id.icon,ctx);}
    ctx.initDesktopGrid?.();
  }

  async function blockBlastInstalled() {
    for (const name of ['game.html','icon.png']) {
      const node = await PocketDisk.getNode(BLOCKBLAST_ROOT + '/' + name).catch(() => null);
      if (!node || node.type !== 'file') return false;
    }
    return true;
  }

  async function blockBlastBytes() {
    const snap = await PocketDisk.snapshot();
    return Object.entries(snap).filter(([path,node]) => node?.type === 'file' && path.startsWith(BLOCKBLAST_ROOT + '/')).reduce((sum,[,node]) => sum + Number(node.size||0),0);
  }

  async function blockBlastIdentity() {
    let name=BLOCKBLAST_NAME,icon=BLOCKBLAST_ICON_URL;
    if(await blockBlastInstalled()){
      try{name=cleanDisplayName(await PocketDisk.readText(BLOCKBLAST_ROOT+'/'+BLOCKBLAST_NAME_FILE));}catch{}
      await refreshGameIcon(BLOCKBLAST_ROOT,BLOCKBLAST_SOURCE);try{icon=await blobToDataURL(await PocketDisk.readBlob(BLOCKBLAST_ROOT+'/icon.png'));}catch{}
    }
    return{name,icon};
  }

  function blockBlastPinned(){return localStorage.getItem(BLOCKBLAST_PIN_KEY)==='1';}
  function setBlockBlastPinned(value){if(value)localStorage.setItem(BLOCKBLAST_PIN_KEY,'1');else localStorage.removeItem(BLOCKBLAST_PIN_KEY);}

  async function createBlockBlastIconBlob(){
    const response=await fetch(BLOCKBLAST_ICON_URL,{cache:'no-cache'});
    if(!response.ok)throw new Error('Could not prepare the Block Blast icon.');
    const svg=await response.text(),source=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
    try{
      const img=new Image();img.decoding='async';
      await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Could not render the Block Blast icon.'));img.src=source;});
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;canvas.getContext('2d').drawImage(img,0,0,512,512);
      const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('Could not encode the Block Blast icon.');return png;
    }finally{URL.revokeObjectURL(source);}
  }

  async function installBlockBlast(progress){
    if(await blockBlastInstalled())return;
    await PocketDisk.ensureDir(BLOCKBLAST_ROOT);let completed=0;
    try{
      for(const file of BLOCKBLAST_PACKAGE){
        const response=await fetch(new URL(file.url,location.href).href,{cache:'no-cache'});if(!response.ok)throw new Error('Download failed: '+file.name);
        const blob=await response.blob();await PocketDisk.writeBlob(BLOCKBLAST_ROOT+'/'+file.name,blob,file.mime);completed+=blob.size;progress?.(completed,BLOCKBLAST_TOTAL_BYTES,file.name);
      }
      const iconBlob=await createBlockBlastIconBlob();await PocketDisk.writeBlob(BLOCKBLAST_ROOT+'/icon.png',iconBlob,'image/png');completed+=iconBlob.size;progress?.(Math.min(completed,BLOCKBLAST_TOTAL_BYTES),BLOCKBLAST_TOTAL_BYTES,'icon.png');
      await PocketDisk.writeText(BLOCKBLAST_ROOT+'/'+BLOCKBLAST_NAME_FILE,BLOCKBLAST_NAME,'text/plain');progress?.(BLOCKBLAST_TOTAL_BYTES,BLOCKBLAST_TOTAL_BYTES,'Finishing');
      await shellCtx?.refreshFS?.();await syncBlockBlastShell();shellCtx?.notify?.('Block Blast installed','Ready to play.','▦');
    }catch(err){if(await PocketDisk.getNode(BLOCKBLAST_ROOT).catch(()=>null))await PocketDisk.remove(BLOCKBLAST_ROOT).catch(()=>{});throw err;}
  }

  async function uninstallBlockBlast(){
    if(!await blockBlastInstalled())return;
    for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===BLOCKBLAST_ID)shellCtx.closeWindow?.(win.id);
    await PocketDisk.remove(BLOCKBLAST_ROOT);setBlockBlastPinned(false);await shellCtx?.refreshFS?.();await syncBlockBlastShell();shellCtx?.notify?.('Block Blast uninstalled','Its files were removed from the virtual drive.','×');
  }

  async function toggleBlockBlastPin(value){
    setBlockBlastPinned(value);await syncBlockBlastShell();shellCtx?.notify?.(value?'Added to desktop':'Removed from desktop',BLOCKBLAST_NAME,value?'＋':'−');
  }

  async function syncBlockBlastShell(ctx=shellCtx){
    if(!ctx)return;
    const installed=await blockBlastInstalled().catch(()=>false),startGrid=document.querySelector('.start-grid'),desktop=document.getElementById('desktop-icons');
    let start=document.querySelector('[data-store-launch="blockblast-start"]'),desk=document.querySelector('[data-store-launch="blockblast-desktop"]');
    if(!installed){start?.remove();desk?.remove();setBlockBlastPinned(false);ctx.initDesktopGrid?.();return;}
    const id=await blockBlastIdentity();
    if(startGrid){if(!start){start=document.createElement('button');start.dataset.open=BLOCKBLAST_ID;start.dataset.storeLaunch='blockblast-start';startGrid.appendChild(start);}fillLauncher(start,id.name,id.icon,false);}
    if(desktop){if(blockBlastPinned()){if(!desk){desk=document.createElement('button');desk.className='desktop-icon store-game-desktop';desk.dataset.open=BLOCKBLAST_ID;desk.dataset.storeLaunch='blockblast-desktop';desktop.appendChild(desk);}fillLauncher(desk,id.name,id.icon,true);}else desk?.remove();}
    for(const win of ctx.state.windows.values()){if(win.appId!==BLOCKBLAST_ID)continue;ctx.setWindowTitle(win,id.name,'▦');applyWindowIcon(win,id.icon,ctx);}
    ctx.initDesktopGrid?.();
  }


  async function crumbClickerInstalled(){for(const name of ['game.html','icon.png']){const node=await PocketDisk.getNode(CRUMBCLICKER_ROOT+'/'+name).catch(()=>null);if(!node||node.type!=='file')return false;}return true;}
  async function crumbClickerBytes(){const snap=await PocketDisk.snapshot();return Object.entries(snap).filter(([path,node])=>node?.type==='file'&&path.startsWith(CRUMBCLICKER_ROOT+'/')).reduce((sum,[,node])=>sum+Number(node.size||0),0);}
  async function crumbClickerIdentity(){let name=CRUMBCLICKER_NAME,icon=CRUMBCLICKER_ICON_URL;if(await crumbClickerInstalled()){try{name=cleanDisplayName(await PocketDisk.readText(CRUMBCLICKER_ROOT+'/'+CRUMBCLICKER_NAME_FILE));}catch{}await refreshGameIcon(CRUMBCLICKER_ROOT,CRUMBCLICKER_SOURCE);try{icon=await blobToDataURL(await PocketDisk.readBlob(CRUMBCLICKER_ROOT+'/icon.png'));}catch{}const mods=await installedCrumbClickerMods().catch(()=>({}));if(mods.candy){name='Candy Clicker';icon=CRUMBCLICKER_CANDY_ICON;}}return{name,icon};}
  function crumbClickerPinned(){return localStorage.getItem(CRUMBCLICKER_PIN_KEY)==='1';}
  function setCrumbClickerPinned(v){if(v)localStorage.setItem(CRUMBCLICKER_PIN_KEY,'1');else localStorage.removeItem(CRUMBCLICKER_PIN_KEY);}
  async function createCrumbClickerIconBlob(){const response=await fetch(CRUMBCLICKER_ICON_URL,{cache:'no-cache'});if(!response.ok)throw new Error('Could not prepare the Crumb Clicker icon.');const svg=await response.text(),source=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{const img=new Image();img.decoding='async';await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Could not render the Crumb Clicker icon.'));img.src=source;});const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;canvas.getContext('2d').drawImage(img,0,0,512,512);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('Could not encode the Crumb Clicker icon.');return png;}finally{URL.revokeObjectURL(source);}}
  async function loadCrumbClickerGameHTML(){const path=CRUMBCLICKER_ROOT+'/game.html';let html=await PocketDisk.readText(path),marker='name="pocketvm-crumbclicker-build" content="'+CRUMBCLICKER_GAME_REVISION+'"';if(html.includes(marker))return html;try{const file=CRUMBCLICKER_PACKAGE[0],response=await fetch(new URL(file.url,location.href).href,{cache:'no-cache'});if(response.ok){const fresh=await response.text();if(fresh.includes(marker)){await PocketDisk.writeText(path,fresh,'text/html');await shellCtx?.refreshFS?.();html=fresh;shellCtx?.notify?.('Crumb Clicker updated','The bakery is running the latest build.','◉');}}}catch{}return html;}
  async function installCrumbClicker(progress){if(await crumbClickerInstalled())return;await PocketDisk.ensureDir(CRUMBCLICKER_ROOT);let completed=0;try{for(const file of CRUMBCLICKER_PACKAGE){const response=await fetch(new URL(file.url,location.href).href,{cache:'no-cache'});if(!response.ok)throw new Error('Download failed: '+file.name);const blob=await response.blob();await PocketDisk.writeBlob(CRUMBCLICKER_ROOT+'/'+file.name,blob,file.mime);completed+=blob.size;progress?.(completed,CRUMBCLICKER_TOTAL_BYTES,file.name);}const iconBlob=await createCrumbClickerIconBlob();await PocketDisk.writeBlob(CRUMBCLICKER_ROOT+'/icon.png',iconBlob,'image/png');completed+=iconBlob.size;progress?.(Math.min(completed,CRUMBCLICKER_TOTAL_BYTES),CRUMBCLICKER_TOTAL_BYTES,'icon.png');await PocketDisk.writeText(CRUMBCLICKER_ROOT+'/'+CRUMBCLICKER_NAME_FILE,CRUMBCLICKER_NAME,'text/plain');progress?.(CRUMBCLICKER_TOTAL_BYTES,CRUMBCLICKER_TOTAL_BYTES,'Finishing');await shellCtx?.refreshFS?.();await syncCrumbClickerShell();shellCtx?.notify?.('Crumb Clicker installed','The bakery is open.','◉');}catch(err){if(await PocketDisk.getNode(CRUMBCLICKER_ROOT).catch(()=>null))await PocketDisk.remove(CRUMBCLICKER_ROOT).catch(()=>{});throw err;}}
  async function uninstallCrumbClicker(){if(!await crumbClickerInstalled())return;for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===CRUMBCLICKER_ID)shellCtx.closeWindow?.(win.id);await PocketDisk.remove(CRUMBCLICKER_ROOT);setCrumbClickerPinned(false);await shellCtx?.refreshFS?.();await syncCrumbClickerShell();shellCtx?.notify?.('Crumb Clicker uninstalled','Its bakery files were removed from the virtual drive.','×');}
  async function toggleCrumbClickerPin(v){setCrumbClickerPinned(v);await syncCrumbClickerShell();shellCtx?.notify?.(v?'Added to desktop':'Removed from desktop',CRUMBCLICKER_NAME,v?'＋':'−');}
  async function syncCrumbClickerShell(ctx=shellCtx){if(!ctx)return;const installed=await crumbClickerInstalled().catch(()=>false),startGrid=document.querySelector('.start-grid'),desktop=document.getElementById('desktop-icons');let start=document.querySelector('[data-store-launch="crumbclicker-start"]'),desk=document.querySelector('[data-store-launch="crumbclicker-desktop"]');if(!installed){start?.remove();desk?.remove();setCrumbClickerPinned(false);ctx.initDesktopGrid?.();return;}const id=await crumbClickerIdentity();if(startGrid){if(!start){start=document.createElement('button');start.dataset.open=CRUMBCLICKER_ID;start.dataset.storeLaunch='crumbclicker-start';startGrid.appendChild(start);}fillLauncher(start,id.name,id.icon,false);}if(desktop){if(crumbClickerPinned()){if(!desk){desk=document.createElement('button');desk.className='desktop-icon store-game-desktop';desk.dataset.open=CRUMBCLICKER_ID;desk.dataset.storeLaunch='crumbclicker-desktop';desktop.appendChild(desk);}fillLauncher(desk,id.name,id.icon,true);}else desk?.remove();}for(const win of ctx.state.windows.values()){if(win.appId!==CRUMBCLICKER_ID)continue;ctx.setWindowTitle(win,id.name,'◉');applyWindowIcon(win,id.icon,ctx);}ctx.initDesktopGrid?.();}

  async function pvzInstalled(){for(const name of ['game.html','icon.png',...PVZ_TRACKS.map(x=>x.name)]){const node=await PocketDisk.getNode(PVZ_ROOT+'/'+name).catch(()=>null);if(!node||node.type!=='file')return false;}return true;}
  async function pvzBytes(){const snap=await PocketDisk.snapshot();return Object.entries(snap).filter(([path,node])=>node?.type==='file'&&path.startsWith(PVZ_ROOT+'/')).reduce((sum,[,node])=>sum+Number(node.size||0),0);}
  async function pvzIdentity(){let name=PVZ_NAME,icon=PVZ_ICON_URL;if(await pvzInstalled()){try{name=cleanDisplayName(await PocketDisk.readText(PVZ_ROOT+'/'+PVZ_NAME_FILE));}catch{}await refreshGameIcon(PVZ_ROOT,PVZ_SOURCE);try{icon=await blobToDataURL(await PocketDisk.readBlob(PVZ_ROOT+'/icon.png'));}catch{}}return{name,icon};}
  function pvzPinned(){return localStorage.getItem(PVZ_PIN_KEY)==='1';}
  function setPvzPinned(v){if(v)localStorage.setItem(PVZ_PIN_KEY,'1');else localStorage.removeItem(PVZ_PIN_KEY);}
  async function createPvzIconBlob(){const response=await fetch(PVZ_ICON_URL,{cache:'no-cache'});if(!response.ok)throw new Error('Could not prepare the Plants vs Zombies icon.');const svg=await response.text(),source=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{const img=new Image();img.decoding='async';await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Could not render the Plants vs Zombies icon.'));img.src=source;});const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;canvas.getContext('2d').drawImage(img,0,0,512,512);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('Could not encode the Plants vs Zombies icon.');return png;}finally{URL.revokeObjectURL(source);}}
  async function fetchPvzGameHTML(){const response=await fetch(new URL(PVZ_SOURCE+'game.html',location.href).href,{cache:'no-cache'});if(!response.ok)throw new Error('Could not download the Plants vs Zombies game engine.');const html=await response.text();if(!html.includes('name="pocketvm-pvz-build" content="'+PVZ_GAME_REVISION+'"'))throw new Error('Plants vs Zombies package verification failed.');return html;}
  async function loadPvzGameHTML(){const path=PVZ_ROOT+'/game.html';let html=await PocketDisk.readText(path),marker='name="pocketvm-pvz-build" content="'+PVZ_GAME_REVISION+'"';if(html.includes(marker))return html;try{const fresh=await fetchPvzGameHTML();await PocketDisk.writeText(path,fresh,'text/html');await shellCtx?.refreshFS?.();html=fresh;shellCtx?.notify?.('Plants vs Zombies updated','Adventure is running the latest build.','🌻');}catch{}return html;}
  async function installPvz(progress){if(await pvzInstalled())return;await PocketDisk.ensureDir(PVZ_ROOT);let completed=0;try{const html=await fetchPvzGameHTML();await PocketDisk.writeText(PVZ_ROOT+'/game.html',html,'text/html');completed+=PVZ_GAME_BYTES;progress?.(completed,PVZ_TOTAL_BYTES,'game.html');for(const file of PVZ_TRACKS){const response=await fetch(file.url,{cache:'no-cache'});if(!response.ok)throw new Error('Download failed: '+file.name);const blob=await response.blob();await PocketDisk.writeBlob(PVZ_ROOT+'/'+file.name,blob,file.mime);completed+=blob.size;progress?.(Math.min(completed,PVZ_TOTAL_BYTES),PVZ_TOTAL_BYTES,file.name);}const iconBlob=await createPvzIconBlob();await PocketDisk.writeBlob(PVZ_ROOT+'/icon.png',iconBlob,'image/png');completed+=iconBlob.size;progress?.(Math.min(completed,PVZ_TOTAL_BYTES),PVZ_TOTAL_BYTES,'icon.png');await PocketDisk.writeText(PVZ_ROOT+'/'+PVZ_NAME_FILE,PVZ_NAME,'text/plain');progress?.(PVZ_TOTAL_BYTES,PVZ_TOTAL_BYTES,'Finishing');await shellCtx?.refreshFS?.();await syncPvzShell();shellCtx?.notify?.('Plants vs Zombies installed','Fifty Adventure stages are ready.','🌻');}catch(err){if(await PocketDisk.getNode(PVZ_ROOT).catch(()=>null))await PocketDisk.remove(PVZ_ROOT).catch(()=>{});throw err;}}
  async function uninstallPvz(){if(!await pvzInstalled())return;for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===PVZ_ID)shellCtx.closeWindow?.(win.id);await PocketDisk.remove(PVZ_ROOT);setPvzPinned(false);await shellCtx?.refreshFS?.();await syncPvzShell();shellCtx?.notify?.('Plants vs Zombies uninstalled','Adventure files were removed from the virtual drive.','×');}
  async function togglePvzPin(v){setPvzPinned(v);await syncPvzShell();shellCtx?.notify?.(v?'Added to desktop':'Removed from desktop',PVZ_NAME,v?'＋':'−');}
  async function syncPvzShell(ctx=shellCtx){if(!ctx)return;const installed=await pvzInstalled().catch(()=>false),startGrid=document.querySelector('.start-grid'),desktop=document.getElementById('desktop-icons');let start=document.querySelector('[data-store-launch="pvz-start"]'),desk=document.querySelector('[data-store-launch="pvz-desktop"]');if(!installed){start?.remove();desk?.remove();setPvzPinned(false);ctx.initDesktopGrid?.();return;}const id=await pvzIdentity();if(startGrid){if(!start){start=document.createElement('button');start.dataset.open=PVZ_ID;start.dataset.storeLaunch='pvz-start';startGrid.appendChild(start);}fillLauncher(start,id.name,id.icon,false);}if(desktop){if(pvzPinned()){if(!desk){desk=document.createElement('button');desk.className='desktop-icon store-game-desktop';desk.dataset.open=PVZ_ID;desk.dataset.storeLaunch='pvz-desktop';desktop.appendChild(desk);}fillLauncher(desk,id.name,id.icon,true);}else desk?.remove();}for(const win of ctx.state.windows.values()){if(win.appId!==PVZ_ID)continue;ctx.setWindowTitle(win,id.name,'🌻');applyWindowIcon(win,id.icon,ctx);}ctx.initDesktopGrid?.();}
  function sanitizePvzSave(d){const completed=Array.isArray(d?.completed)?[...new Set(d.completed.filter(x=>/^[1-5]-(?:10|[1-9])$/.test(String(x))))].slice(0,50):[],shop=Array.isArray(d?.shop)?[...new Set(d.shop.filter(x=>PVZ_UPGRADE_IDS.has(String(x))))]:[];return{levelUnlocked:Math.max(1,Math.min(50,Math.floor(Number(d?.levelUnlocked)||1))),completed,coins:Math.max(0,Math.min(1e12,Math.floor(Number(d?.coins)||0))),shop,music:d?.music!==false,sfx:d?.sfx!==false,endlessBest:Math.max(0,Math.min(1e9,Math.floor(Number(d?.endlessBest)||0))),adventureWon:d?.adventureWon===true};}


  function sanitizeWobbleSave(d){
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),angle=a=>Math.atan2(Math.sin(a),Math.cos(a)),TAU=Math.PI*2;
const JOBS=[
 {id:'parcel',name:'Parcel Run',tag:'PICK UP & DELIVER',pay:75,time:240,site:{x:36,z:43},description:'Grab the parcel at the depot. Carry it or load it into a vehicle, then deliver three packages.'},
 {id:'pizza',name:'Pizza Express',tag:'HOT FOOD, QUICK FEET',pay:70,time:210,site:{x:-30,z:20},description:'Deliver three hot pizzas from Sunny Slice. A fast finish earns a warm-pizza bonus.'},
 {id:'taxi',name:'Taxi, Please!',tag:'THREE HAPPY PASSENGERS',pay:85,time:260,site:{x:-58,z:9},description:'Use a taxi, pick up each passenger and drive them to their destination. Press ACT to board and drop off.'},
 {id:'cleanup',name:'Park Patrol',tag:'GRAB, TOSS, RECYCLE',pay:65,time:210,site:{x:-24,z:-53},description:'Pick up four rubbish bags in the park and drop them into the recycling zone.'},
 {id:'fishing',name:'Gone Fishing',tag:'WAIT FOR THE BITE',pay:60,time:240,site:{x:174,z:66},description:'Reach the pier. Press ACT to cast, then GRAB when a fish bites. Catch three fish.'},
 {id:'builder',name:'Builder Buddy',tag:'DELIVER THE MATERIALS',pay:90,time:240,site:{x:-93,z:-18},description:'Move three heavy material crates from the yard to the orange foundation. Grabbing and throwing both work.'},
 {id:'rally',name:'Island Rally',tag:'EIGHT CHECKPOINTS',pay:95,time:150,site:{x:0,z:-80},description:'Use a road vehicle and pass all eight rings in order. Corners, crashes and shortcuts are part of the fun.'},
 {id:'rescue',name:'Coastal Rescue',tag:'FLY, LAND, HELP',pay:120,time:300,site:{x:84,z:120},description:'Take a helicopter to the little offshore island. Land, press ACT to board the castaway, then return to the hospital.'}
];
const RIDES={runabout:{name:'Sunny Runabout',price:0,max:16,acc:10,colour:'#ed8068',size:1.45},pickup:{name:'Cargo Pickup',price:150,max:15,acc:8,colour:'#79a6ca',size:1.7},taxi:{name:'Bay Taxi',price:180,max:17,acc:9,colour:'#f6c963',size:1.55},van:{name:'Parcel Van',price:210,max:14,acc:7.8,colour:'#96c2b0',size:1.75},buggy:{name:'Beach Buggy',price:270,max:21,acc:13,colour:'#ecad72',size:1.35},boat:{name:'Seabreeze Boat',price:340,max:20,acc:9,colour:'#eae8d3',size:1.9},heli:{name:'Bumble Helicopter',price:550,max:22,acc:8,colour:'#f3c75f',size:1.7}};
const HATS={none:{name:'No hat',price:0},cap:{name:'Bay baseball cap',price:0},hardhat:{name:'Builder hard hat',price:70},beanie:{name:'Cosy beanie',price:80},cowboy:{name:'Explorer hat',price:100},crown:{name:'Very important crown',price:180},propeller:{name:'Propeller cap',price:130}};
const HOMES=[{id:'cottage',name:'Seabreeze Cottage',price:220,x:-86,z:44},{id:'townhouse',name:'Peach Townhouse',price:450,x:99,z:-42},{id:'hillhouse',name:'Hilltop Hideaway',price:850,x:-117,z:-117}];
const LANDMARKS=[{id:'board',name:'Town Square',x:0,z:25,type:'jobs'},{id:'shop',name:'Threads & Things',x:-18,z:-18,type:'shop'},{id:'garage',name:'Bay Motors',x:24,z:-17,type:'garage'},{id:'parcel',name:'Parcel Depot',x:36,z:43,type:'jobs'},{id:'pizza',name:'Sunny Slice',x:-30,z:20,type:'jobs'},{id:'taxi',name:'Taxi Rank',x:-58,z:9,type:'jobs'},{id:'cleanup',name:'Seaglass Park',x:-24,z:-53,type:'jobs'},{id:'builder',name:'Build Yard',x:-93,z:-18,type:'jobs'},{id:'fishing',name:'Bluewater Pier',x:174,z:66,type:'jobs'},{id:'airport',name:'Bumble Airfield',x:84,z:120,type:'jobs'},{id:'hospital',name:'Bay Clinic',x:42,z:-67,type:'npc'},...HOMES.map(h=>({...h,type:'home'}))];
const BUILDINGS=[
 {x:-18,z:-29,w:15,d:15,h:7,colour:'#ecacb7',roof:'#767ea8',name:'THREADS'}, {x:24,z:-29,w:19,d:15,h:7,colour:'#8caebe',roof:'#557580',name:'BAY MOTORS'},
 {x:36,z:54,w:20,d:15,h:8,colour:'#a6c5b3',roof:'#e4b776',name:'PARCEL POST'}, {x:-30,z:31,w:18,d:15,h:7,colour:'#efc79f',roof:'#d77e68',name:'SUNNY SLICE'},
 {x:42,z:-80,w:24,d:19,h:9,colour:'#e8e7d5',roof:'#91b9c0',name:'CLINIC'}, {x:105,z:125,w:34,d:26,h:10,colour:'#a9bdc4',roof:'#7797a1',name:'BUMBLE AIR'},
 {x:-86,z:54,w:16,d:14,h:6,colour:'#eac59e',roof:'#87a9a8',name:'COTTAGE'}, {x:99,z:-53,w:17,d:15,h:9,colour:'#e8a893',roof:'#9ba39f',name:'TOWNHOUSE'}, {x:-117,z:-129,w:22,d:16,h:8,colour:'#efd8b4',roof:'#bb8474',name:'HILLTOP'},
 ...[-47,47].flatMap((x,k)=>[-103,-32,99].map((z,i)=>({x,z,w:14+(i%2)*3,d:15,h:7+(i%2)*2,colour:['#d3b6c9','#aec9b7','#efcf91','#a8c2d6'][(i+k)%4],roof:['#928499','#96a7a2','#cb947b'][i%3],name:''}))),
 {x:89,z:36,w:16,d:16,h:7,colour:'#b5c5b0',roof:'#8b9f9b',name:''},{x:-106,z:99,w:18,d:15,h:8,colour:'#efc993',roof:'#aa8f85',name:''}
];
const STARS=[[-15,12,0],[47,89,0],[-77,68,0],[114,-78,0],[136,24,0],[187,66,0],[-146,-84,0],[-111,-148,0],[76,144,0],[-118,117,0],[121,99,0],[25,-120,0],[-258,88,0],[-111,-24,3],[38,53,10],[-37,-69,0]].map((p,i)=>({id:'star'+i,x:p[0],z:p[1],y:p[2]}));
const ROUTE=[{x:0,z:-65},{x:65,z:-65},{x:65,z:0},{x:65,z:65},{x:0,z:65},{x:-65,z:65},{x:-65,z:0},{x:-65,z:-65}];
const DOORS=[{x:46,z:88},{x:100,z:-42},{x:-47,z:-90},{x:-86,z:44},{x:89,z:25}];
function terrain(x,z){const islet=Math.hypot(x+258,z-88);if(islet<25)return clamp((25-islet)*.35-1.5,-2,1.5);if(x>154&&x<202&&z>60&&z<73)return 1;const coast=(Math.abs(x)/203)**4+(Math.abs(z)/176)**4;if(coast>1.22)return-5;if(coast>.92)return lerp(1,-5,(coast-.92)/.3);return 1+20*Math.exp(-(((x+119)/43)**2+((z+120)/43)**2))}
function safePosition(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&Math.abs(p.x)<300&&Math.abs(p.z)<190&&terrain(p.x,p.z)>0?p:{x:0,z:27}}
function sanitize(d={}){const p=d.prefs||{},n=(v,a,b,f)=>Number.isFinite(Number(v))?clamp(Number(v),a,b):f,hex=(v,f)=>/^#[0-9a-f]{6}$/i.test(String(v))?v:f,allowed=(v,keys,f)=>keys.includes(v)?v:f,list=(a,keys)=>Array.isArray(a)?[...new Set(a.filter(v=>keys.includes(v)))]:[],jobs={};for(const j of JOBS)jobs[j.id]=Math.floor(n(d.jobs?.[j.id],0,1e6,0));return{cash:Math.floor(n(d.cash,0,1e9,80)),earned:Math.floor(n(d.earned,0,1e9,0)),jobs,stars:list(d.stars,STARS.map(s=>s.id)),hats:[...new Set(['none','cap',...list(d.hats,Object.keys(HATS))])],rides:[...new Set(['runabout',...list(d.rides,Object.keys(RIDES))])],homes:list(d.homes,HOMES.map(h=>h.id)),pet:d.pet===true,skin:hex(d.skin,'#f4d16b'),shirt:hex(d.shirt,'#ed896e'),hat:allowed(d.hat,Object.keys(HATS),'cap'),carColour:hex(d.carColour,'#ed8068'),prefs:{sound:p.sound!==false,volume:n(p.volume,0,1,.45),graphics:allowed(p.graphics,['auto','low','high'],'auto'),touchSize:allowed(p.touchSize,['large','xl'],'large'),touchControls:p.touchControls===true,time:allowed(p.time,['day','golden','night','cycle','random'],'day'),camera:allowed(p.camera,['near','standard','wide'],'standard')},position:safePosition(d.position)}}

return sanitize(d&&typeof d==='object'?d:{});
  }
  function sanitizeGradeSave(d){
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),SHOP=[{"id":"room-mint","type":"room"},{"id":"room-peach","type":"room"},{"id":"room-blue","type":"room"},{"id":"room-lavender","type":"room"},{"id":"desk-oak","type":"desk"},{"id":"desk-walnut","type":"desk"},{"id":"desk-cream","type":"desk"},{"id":"stamp-red","type":"stamp"},{"id":"stamp-purple","type":"stamp"},{"id":"stamp-gold","type":"stamp"},{"id":"plant","type":"decor"},{"id":"globe","type":"decor"},{"id":"books","type":"decor"},{"id":"hamster","type":"decor"},{"id":"clock","type":"decor"},{"id":"bunting","type":"decor"}];
function sanitiseDrawing(d={}){const ink=['A+','F'].includes(d?.ink)?d.ink:null,strokes=ink&&Array.isArray(d.strokes)?d.strokes.slice(0,24).filter(a=>Array.isArray(a)&&a.length>=2).map(a=>{const step=Math.max(1,Math.ceil(a.length/180));return a.filter((_,i)=>i%step===0||i===a.length-1).slice(0,181).filter(p=>Array.isArray(p)&&Number.isFinite(p[0])&&Number.isFinite(p[1])).map(p=>[clamp(p[0],0,1),clamp(p[1],0,1),clamp(Number(p[2])||.5,.1,1)])}).filter(a=>a.length>=2):[];return{ink,strokes}}
function sanitiseSession(d){if(!d||!['career','endless','rush','daily'].includes(d.mode)||!Number.isFinite(d.seed))return null;const day=clamp(Math.floor(Number(d.day)||1),1,9999),limit=d.mode==='career'?(day<3?6:8):d.mode==='daily'?12:150,marks=Array.isArray(d.marks)?d.marks.slice(0,limit).map(v=>typeof v==='string'&&/^(A\+|B|C|D|F|[0-2]|timeout)$/.test(v)?v:'timeout'):[];return{mode:d.mode,day,seed:d.seed>>>0,marks,hinted:Array.isArray(d.hinted)?[...new Set(d.hinted.filter(v=>Number.isInteger(v)&&v>=0&&v<limit))]:[],timeLeft:clamp(Number(d.timeLeft)||0,0,60),paperTime:clamp(Number.isFinite(Number(d.paperTime))?Number(d.paperTime):15,0,15),date:/^\d{4}-\d{2}-\d{2}$/.test(d.date||'')?d.date:'',settled:d.settled===true,drawing:sanitiseDrawing(d.drawing)};}
function sanitise(d={}){
 if(!d||typeof d!=='object')d={};const n=(k,max,def=0)=>clamp(Number.isFinite(Number(d[k]))?Math.floor(Number(d[k])):def,0,max),owned=[...new Set(['room-mint','desk-oak','stamp-red',...(Array.isArray(d.owned)?d.owned.filter(v=>SHOP.some(x=>x.id===v)):[])])],p=d.prefs&&typeof d.prefs==='object'?d.prefs:{};const equipped={};for(const [key,def]of [['room','room-mint'],['desk','desk-oak'],['stamp','stamp-red']])equipped[key]=owned.includes(d.equipped?.[key])&&SHOP.find(i=>i.id===d.equipped[key])?.type===key?d.equipped[key]:def;
 return{version:2,day:Math.max(1,n('day',9999,1)),coins:n('coins',1e8),reputation:n('reputation',100,70),total:n('total',1e7),correct:Math.min(n('correct',1e7),n('total',1e7)),bestStreak:n('bestStreak',150),bestRush:n('bestRush',150),bestEndless:n('bestEndless',150),stars:n('stars',30000),owned,equipped,prefs:{sound:p.sound!==false,timers:p.timers!==false,motion:p.motion!==false,large:p.large!==false},daily:{date:/^\d{4}-\d{2}-\d{2}$/.test(d.daily?.date||'')?d.daily.date:'',score:clamp(Math.floor(Number(d.daily?.score)||0),0,12)},session:d.version===2?sanitiseSession(d.session):null};
}
return sanitise(d);
  }
  async function gradeInstalled(){for(const file of ['game.html','core.js','game.js','icon.png']){const node=await PocketDisk.getNode(GRADE_ROOT+'/'+file).catch(()=>null);if(!node||node.type!=='file')return false;}return true;}
  async function gradeBytes(){const snap=await PocketDisk.snapshot();return Object.entries(snap).filter(([p,n])=>n?.type==='file'&&p.startsWith(GRADE_ROOT+'/')).reduce((a,[,n])=>a+Number(n.size||0),0);}
  async function gradeIdentity(){let name=GRADE_NAME,icon=GRADE_ICON_URL;if(await gradeInstalled()){await refreshGameIcon(GRADE_ROOT,GRADE_SOURCE);try{name=String(await PocketDisk.readText(GRADE_ROOT+'/name.txt')||GRADE_NAME).replace(/[\r\n\t]+/g,' ').trim().slice(0,30)||GRADE_NAME;}catch{}try{icon=await blobToDataURL(await PocketDisk.readBlob(GRADE_ROOT+'/icon.png'));}catch{}}return{name,icon};}
  function gradePinned(){return localStorage.getItem(GRADE_PIN_KEY)==='1';}
  function setGradePinned(v){if(v)localStorage.setItem(GRADE_PIN_KEY,'1');else localStorage.removeItem(GRADE_PIN_KEY);}
  function verifyGradeFile(file,text){if(new Blob([text]).size!==file.size)throw new Error('Grade School download is incomplete: '+file.name);if(file.name==='game.html'&&!text.includes('name="pocketvm-grade-build" content="'+GRADE_GAME_REVISION+'"'))throw new Error('Grade School package verification failed.');return text;}
  async function fetchGradeFiles(){return Promise.all(GRADE_FILES.map(async file=>{const r=await fetch(new URL(GRADE_SOURCE+file.name+'?v='+GRADE_GAME_REVISION,location.href).href,{cache:'no-cache'});if(!r.ok)throw new Error('Could not download '+file.name);return[file,verifyGradeFile(file,await r.text())];}));}
  async function fetchGradeIcon(){const r=await fetch(GRADE_SOURCE+'icon-512.png',{cache:'no-cache'});if(!r.ok)throw new Error('Could not download the Grade School icon.');const b=await r.blob();if(!await validGameIcon(b))throw new Error('Grade School icon download is incomplete.');return b;}
  async function installGrade(progress){if(await gradeInstalled())return;const [files,icon]=await Promise.all([fetchGradeFiles(),fetchGradeIcon()]);await PocketDisk.ensureDir(GRADE_ROOT);let bytes=0;try{for(const [file,text]of files){await PocketDisk.writeText(GRADE_ROOT+'/'+file.name,text,file.mime);bytes+=file.size;progress?.(bytes,GRADE_TOTAL_BYTES,file.name);}await PocketDisk.writeBlob(GRADE_ROOT+'/icon.png',icon,'image/png');await PocketDisk.writeText(GRADE_ROOT+'/icon-version.txt',ICON_REVISION,'text/plain');await PocketDisk.writeText(GRADE_ROOT+'/name.txt',GRADE_NAME,'text/plain');progress?.(GRADE_TOTAL_BYTES,GRADE_TOTAL_BYTES,'Ready');await shellCtx?.refreshFS?.();await syncGradeShell();shellCtx?.notify?.('Grade School installed','Six subjects. Twelve students. One teacher.','✎');}catch(e){await PocketDisk.remove(GRADE_ROOT).catch(()=>{});throw e;}}
  async function uninstallGrade(){if(!await gradeInstalled())return;for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===GRADE_ID)shellCtx.closeWindow?.(win.id);await PocketDisk.remove(GRADE_ROOT);setGradePinned(false);await shellCtx?.refreshFS?.();await syncGradeShell();shellCtx?.notify?.('Grade School uninstalled','Your career and classroom purchases are saved for your next visit.','×');}
  async function toggleGradePin(v){setGradePinned(v);await syncGradeShell();}
  async function syncGradeShell(ctx=shellCtx){if(!ctx)return;const installed=await gradeInstalled().catch(()=>false),startGrid=document.querySelector('.start-grid'),desktop=document.getElementById('desktop-icons');let start=document.querySelector('[data-store-launch="grade-start"]'),desk=document.querySelector('[data-store-launch="grade-desktop"]');if(!installed){start?.remove();desk?.remove();setGradePinned(false);ctx.initDesktopGrid?.();return;}const id=await gradeIdentity();if(startGrid){if(!start){start=document.createElement('button');start.dataset.open=GRADE_ID;start.dataset.storeLaunch='grade-start';startGrid.appendChild(start);}fillLauncher(start,id.name,id.icon,false);}if(desktop){if(gradePinned()){if(!desk){desk=document.createElement('button');desk.className='desktop-icon store-game-desktop';desk.dataset.open=GRADE_ID;desk.dataset.storeLaunch='grade-desktop';desktop.appendChild(desk);}fillLauncher(desk,id.name,id.icon,true);}else desk?.remove();}for(const win of ctx.state.windows.values()){if(win.appId!==GRADE_ID)continue;ctx.setWindowTitle(win,id.name,'✎');applyWindowIcon(win,id.icon,ctx);}ctx.initDesktopGrid?.();}
  async function buildGrade(win,options={},ctx){
    shellCtx=ctx;if(!await gradeInstalled()){ctx.setWindowTitle(win,GRADE_NAME,'✎');win.content.innerHTML='<div class="store-not-installed"><div>✎</div><h2>Grade School isn\'t installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>';ctx.queryOne('button',win.content).addEventListener('click',()=>ctx.openApp('store'));return;}
    const id=await gradeIdentity();ctx.setWindowTitle(win,id.name,'✎');applyWindowIcon(win,id.icon,ctx);win.content.innerHTML=`<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Opening ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts" allow="autoplay; fullscreen; gamepad" allowfullscreen></iframe></div>`;
    const frame=ctx.queryOne('iframe',win.content),loading=ctx.queryOne('.store-game-loading',win.content);
    try{
      let files;
      try{files=await Promise.all(GRADE_FILES.map(async f=>[f,await PocketDisk.readText(GRADE_ROOT+'/'+f.name)]));for(const [file,text]of files)verifyGradeFile(file,text);}catch{files=await fetchGradeFiles();for(const [file,text]of files)await PocketDisk.writeText(GRADE_ROOT+'/'+file.name,text,file.mime);}
      let html=files.find(([f])=>f.name==='game.html')[1];
      for(const [file,text]of files.filter(([f])=>f.mime==='text/javascript')){const data=await blobToDataURL(new Blob([text],{type:'text/javascript'}));html=html.replace('src="./'+file.name+'?v='+GRADE_GAME_REVISION+'"','src="'+data+'"').replace('src="./'+file.name+'"','src="'+data+'"');}
      const save=(()=>{try{return sanitizeGradeSave(JSON.parse(localStorage.getItem(GRADE_SAVE_KEY)||'{}'));}catch{return sanitizeGradeSave({});}})(),bootstrap='<script>window.__POCKETVM_SAVE='+JSON.stringify(save)+';</'+'script>';
      frame.srcdoc=gameFavicons(html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap),GRADE_ID);
    }catch(e){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(e?.message||'Reinstall Grade School from the Store.')}</small>`;return;}
    const onMessage=e=>{if(e.source!==frame.contentWindow||!e.data||typeof e.data!=='object')return;if(e.data.type==='pocketvm-grade-ready')loading.classList.add('done');if(e.data.type==='pocketvm-grade-save')localStorage.setItem(GRADE_SAVE_KEY,JSON.stringify(sanitizeGradeSave(e.data.data||{})));};window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }

  async function wobbleInstalled(){for(const file of ['game.html','engine.js','game.js','three.min.js','icon.png']){const node=await PocketDisk.getNode(WOBBLE_ROOT+'/'+file).catch(()=>null);if(!node||node.type!=='file')return false;}return true;}
  async function wobbleBytes(){const snap=await PocketDisk.snapshot();return Object.entries(snap).filter(([p,n])=>n?.type==='file'&&p.startsWith(WOBBLE_ROOT+'/')).reduce((a,[,n])=>a+Number(n.size||0),0);}
  async function wobbleIdentity(){let name=WOBBLE_NAME,icon=WOBBLE_ICON_URL;if(await wobbleInstalled()){await refreshGameIcon(WOBBLE_ROOT,WOBBLE_SOURCE);try{name=String(await PocketDisk.readText(WOBBLE_ROOT+'/name.txt')||WOBBLE_NAME).replace(/[\r\n\t]+/g,' ').trim().slice(0,30)||WOBBLE_NAME;}catch{}try{icon=await blobToDataURL(await PocketDisk.readBlob(WOBBLE_ROOT+'/icon.png'));}catch{}}return{name,icon};}
  function wobblePinned(){return localStorage.getItem(WOBBLE_PIN_KEY)==='1';}
  function setWobblePinned(v){if(v)localStorage.setItem(WOBBLE_PIN_KEY,'1');else localStorage.removeItem(WOBBLE_PIN_KEY);}
  function verifyWobbleFile(file,text){if(new Blob([text]).size!==file.size)throw new Error('Wobble Bay download is incomplete: '+file.name);if(file.name==='game.html'&&!text.includes('name="pocketvm-wobble-build" content="'+WOBBLE_GAME_REVISION+'"'))throw new Error('Wobble Bay package verification failed.');return text;}
  async function fetchWobbleFiles(){return Promise.all(WOBBLE_FILES.map(async file=>{const r=await fetch(new URL(WOBBLE_SOURCE+file.name+'?v='+WOBBLE_GAME_REVISION,location.href).href,{cache:'no-cache'});if(!r.ok)throw new Error('Could not download '+file.name);return[file,verifyWobbleFile(file,await r.text())];}));}
  async function fetchWobbleIcon(){const r=await fetch(WOBBLE_SOURCE+'icon-512.png',{cache:'no-cache'});if(!r.ok)throw new Error('Could not download the Wobble Bay icon.');const b=await r.blob();if(!await validGameIcon(b))throw new Error('Wobble Bay icon download is incomplete.');return b;}
  async function installWobble(progress){if(await wobbleInstalled())return;const [files,icon]=await Promise.all([fetchWobbleFiles(),fetchWobbleIcon()]);await PocketDisk.ensureDir(WOBBLE_ROOT);let bytes=0;try{for(const [file,text]of files){await PocketDisk.writeText(WOBBLE_ROOT+'/'+file.name,text,file.mime);bytes+=file.size;progress?.(bytes,WOBBLE_TOTAL_BYTES,file.name);}await PocketDisk.writeBlob(WOBBLE_ROOT+'/icon.png',icon,'image/png');await PocketDisk.writeText(WOBBLE_ROOT+'/icon-version.txt',ICON_REVISION,'text/plain');await PocketDisk.writeText(WOBBLE_ROOT+'/name.txt',WOBBLE_NAME,'text/plain');progress?.(WOBBLE_TOTAL_BYTES,WOBBLE_TOTAL_BYTES,'Ready');await shellCtx?.refreshFS?.();await syncWobbleShell();syncGradeShell();shellCtx?.notify?.('Wobble Bay installed','Eight jobs. One world. Lots of wobble.','☀');}catch(e){await PocketDisk.remove(WOBBLE_ROOT).catch(()=>{});throw e;}}
  async function uninstallWobble(){if(!await wobbleInstalled())return;for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===WOBBLE_ID)shellCtx.closeWindow?.(win.id);await PocketDisk.remove(WOBBLE_ROOT);setWobblePinned(false);await shellCtx?.refreshFS?.();await syncWobbleShell();syncGradeShell();shellCtx?.notify?.('Wobble Bay uninstalled','Your cash and purchases are saved for your next visit.','×');}
  async function toggleWobblePin(v){setWobblePinned(v);await syncWobbleShell();syncGradeShell();}
  async function syncWobbleShell(ctx=shellCtx){if(!ctx)return;const installed=await wobbleInstalled().catch(()=>false),startGrid=document.querySelector('.start-grid'),desktop=document.getElementById('desktop-icons');let start=document.querySelector('[data-store-launch="wobble-start"]'),desk=document.querySelector('[data-store-launch="wobble-desktop"]');if(!installed){start?.remove();desk?.remove();setWobblePinned(false);ctx.initDesktopGrid?.();return;}const id=await wobbleIdentity();if(startGrid){if(!start){start=document.createElement('button');start.dataset.open=WOBBLE_ID;start.dataset.storeLaunch='wobble-start';startGrid.appendChild(start);}fillLauncher(start,id.name,id.icon,false);}if(desktop){if(wobblePinned()){if(!desk){desk=document.createElement('button');desk.className='desktop-icon store-game-desktop';desk.dataset.open=WOBBLE_ID;desk.dataset.storeLaunch='wobble-desktop';desktop.appendChild(desk);}fillLauncher(desk,id.name,id.icon,true);}else desk?.remove();}for(const win of ctx.state.windows.values()){if(win.appId!==WOBBLE_ID)continue;ctx.setWindowTitle(win,id.name,'☀');applyWindowIcon(win,id.icon,ctx);}ctx.initDesktopGrid?.();}
  async function buildWobble(win,options={},ctx){
    shellCtx=ctx;if(!await wobbleInstalled()){ctx.setWindowTitle(win,WOBBLE_NAME,'☀');win.content.innerHTML='<div class="store-not-installed"><div>☀</div><h2>Wobble Bay isn\'t installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>';ctx.queryOne('button',win.content).addEventListener('click',()=>ctx.openApp('store'));return;}
    const id=await wobbleIdentity();ctx.setWindowTitle(win,id.name,'☀');applyWindowIcon(win,id.icon,ctx);win.content.innerHTML=`<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Opening ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts" allow="autoplay; fullscreen; gamepad" allowfullscreen></iframe></div>`;
    const frame=ctx.queryOne('iframe',win.content),loading=ctx.queryOne('.store-game-loading',win.content);
    try{
      let files;
      try{files=await Promise.all(WOBBLE_FILES.map(async f=>[f,await PocketDisk.readText(WOBBLE_ROOT+'/'+f.name)]));for(const [file,text]of files)verifyWobbleFile(file,text);}catch{files=await fetchWobbleFiles();for(const [file,text]of files)await PocketDisk.writeText(WOBBLE_ROOT+'/'+file.name,text,file.mime);}
      let html=files.find(([f])=>f.name==='game.html')[1];
      for(const [file,text]of files.filter(([f])=>f.mime==='text/javascript')){const data=await blobToDataURL(new Blob([text],{type:'text/javascript'}));html=html.replace('src="./'+file.name+'?v='+WOBBLE_GAME_REVISION+'"','src="'+data+'"').replace('src="./'+file.name+'"','src="'+data+'"');}
      const save=(()=>{try{return sanitizeWobbleSave(JSON.parse(localStorage.getItem(WOBBLE_SAVE_KEY)||'{}'));}catch{return sanitizeWobbleSave({});}})(),bootstrap='<script>window.__POCKETVM_SAVE='+JSON.stringify(save)+';</'+'script>';
      frame.srcdoc=gameFavicons(html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap),WOBBLE_ID);
    }catch(e){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(e?.message||'Reinstall Wobble Bay from the Store.')}</small>`;return;}
    const onMessage=e=>{if(e.source!==frame.contentWindow||!e.data||typeof e.data!=='object')return;if(e.data.type==='pocketvm-wobble-ready')loading.classList.add('done');if(e.data.type==='pocketvm-wobble-save')localStorage.setItem(WOBBLE_SAVE_KEY,JSON.stringify(sanitizeWobbleSave(e.data.data||{})));};window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }

  async function apexInstalled(){for(const name of ['game.html','icon.png','music.mp3']){const node=await PocketDisk.getNode(APEX_ROOT+'/'+name).catch(()=>null);if(!node||node.type!=='file')return false;}return true;}
  async function apexBytes(){const snap=await PocketDisk.snapshot();return Object.entries(snap).filter(([path,node])=>node?.type==='file'&&path.startsWith(APEX_ROOT+'/')).reduce((sum,[,node])=>sum+Number(node.size||0),0);}
  async function apexIdentity(){let name=APEX_NAME,icon=APEX_ICON_URL;if(await apexInstalled()){try{name=String(await PocketDisk.readText(APEX_ROOT+'/'+APEX_NAME_FILE)||APEX_NAME).replace(/[\r\n\t]+/g,' ').trim().slice(0,30)||APEX_NAME;}catch{}await refreshGameIcon(APEX_ROOT,APEX_SOURCE);try{icon=await blobToDataURL(await PocketDisk.readBlob(APEX_ROOT+'/icon.png'));}catch{}}return{name,icon};}
  function apexPinned(){return localStorage.getItem(APEX_PIN_KEY)==='1';}
  function setApexPinned(v){if(v)localStorage.setItem(APEX_PIN_KEY,'1');else localStorage.removeItem(APEX_PIN_KEY);}
  async function createApexIconBlob(){const response=await fetch(APEX_ICON_URL,{cache:'no-cache'});if(!response.ok)throw new Error('Could not prepare the Apex Rush icon.');const svg=await response.text(),source=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{const img=new Image();img.decoding='async';await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Could not render the Apex Rush icon.'));img.src=source;});const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;canvas.getContext('2d').drawImage(img,0,0,512,512);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('Could not encode the Apex Rush icon.');return png;}finally{URL.revokeObjectURL(source);}}
  async function fetchApexGameHTML(){const response=await fetch(new URL(APEX_SOURCE+'game.html',location.href).href,{cache:'no-cache'});if(!response.ok)throw new Error('Could not download the Apex Rush game engine.');const html=await response.text();if(!html.includes('name="pocketvm-apex-build" content="'+APEX_GAME_REVISION+'"'))throw new Error('Apex Rush package verification failed.');return html;}
  async function fetchApexMusic(){let last=null;for(const url of APEX_MUSIC.urls){try{const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw new Error('HTTP '+response.status);const blob=await response.blob();if(blob.size!==APEX_MUSIC.size)throw new Error('Music file was unexpectedly small.');return blob;}catch(err){last=err;}}throw new Error('Could not download the Apex Rush soundtrack'+(last?.message?' · '+last.message:''));}
  async function loadApexGameHTML(){const path=APEX_ROOT+'/game.html';let html=await PocketDisk.readText(path),marker='name="pocketvm-apex-build" content="'+APEX_GAME_REVISION+'"';if(html.includes(marker))return html;try{const fresh=await fetchApexGameHTML();await PocketDisk.writeText(path,fresh,'text/html');await shellCtx?.refreshFS?.();html=fresh;shellCtx?.notify?.('Apex Rush updated','The latest race package is installed.','🏎');}catch{}return html;}
  async function installApex(progress){if(await apexInstalled())return;await PocketDisk.ensureDir(APEX_ROOT);let completed=0;try{const html=await fetchApexGameHTML();await PocketDisk.writeText(APEX_ROOT+'/game.html',html,'text/html');completed+=APEX_GAME_BYTES;progress?.(completed,APEX_TOTAL_BYTES,'game.html');const music=await fetchApexMusic();await PocketDisk.writeBlob(APEX_ROOT+'/music.mp3',music,APEX_MUSIC.mime);completed+=music.size;progress?.(Math.min(completed,APEX_TOTAL_BYTES),APEX_TOTAL_BYTES,'music.mp3');const iconBlob=await createApexIconBlob();await PocketDisk.writeBlob(APEX_ROOT+'/icon.png',iconBlob,'image/png');completed+=iconBlob.size;progress?.(Math.min(completed,APEX_TOTAL_BYTES),APEX_TOTAL_BYTES,'icon.png');await PocketDisk.writeText(APEX_ROOT+'/'+APEX_NAME_FILE,APEX_NAME,'text/plain');progress?.(APEX_TOTAL_BYTES,APEX_TOTAL_BYTES,'Finishing');await shellCtx?.refreshFS?.();await syncApexShell();shellCtx?.notify?.('Apex Rush installed','Five circuits. Find your line.','🏎');}catch(err){if(await PocketDisk.getNode(APEX_ROOT).catch(()=>null))await PocketDisk.remove(APEX_ROOT).catch(()=>{});throw err;}}
  async function uninstallApex(){if(!await apexInstalled())return;for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===APEX_ID)shellCtx.closeWindow?.(win.id);await PocketDisk.remove(APEX_ROOT);setApexPinned(false);await shellCtx?.refreshFS?.();await syncApexShell();shellCtx?.notify?.('Apex Rush uninstalled','Race files were removed from the virtual drive.','×');}
  async function toggleApexPin(v){setApexPinned(v);await syncApexShell();shellCtx?.notify?.(v?'Added to desktop':'Removed from desktop',APEX_NAME,v?'＋':'−');}
  async function syncApexShell(ctx=shellCtx){if(!ctx)return;const installed=await apexInstalled().catch(()=>false),startGrid=document.querySelector('.start-grid'),desktop=document.getElementById('desktop-icons');let start=document.querySelector('[data-store-launch="apex-start"]'),desk=document.querySelector('[data-store-launch="apex-desktop"]');if(!installed){start?.remove();desk?.remove();setApexPinned(false);ctx.initDesktopGrid?.();return;}const id=await apexIdentity();if(startGrid){if(!start){start=document.createElement('button');start.dataset.open=APEX_ID;start.dataset.storeLaunch='apex-start';startGrid.appendChild(start);}fillLauncher(start,id.name,id.icon,false);}if(desktop){if(apexPinned()){if(!desk){desk=document.createElement('button');desk.className='desktop-icon store-game-desktop';desk.dataset.open=APEX_ID;desk.dataset.storeLaunch='apex-desktop';desktop.appendChild(desk);}fillLauncher(desk,id.name,id.icon,true);}else desk?.remove();}for(const win of ctx.state.windows.values()){if(win.appId!==APEX_ID)continue;ctx.setWindowTitle(win,id.name,'🏎');applyWindowIcon(win,id.icon,ctx);}ctx.initDesktopGrid?.();}
  function sanitizeApexSave(d){const p=d?.prefs||{},one=(v,a,f)=>a.includes(String(v))?String(v):f,n=(v,a,b,f)=>Number.isFinite(Number(v))?Math.max(a,Math.min(b,Number(v))):f,hex=(v,f)=>/^#[0-9a-f]{6}$/i.test(String(v))?v:f,bestLaps={};for(const [k,v]of Object.entries(d?.bestLaps||{}))if(/^(harbour|canyon|alpine|metro|grandprix)-(clear|rain)$/.test(k)&&Number.isFinite(Number(v))&&Number(v)>=5&&Number(v)<=3600)bestLaps[k]=Number(v);return{prefs:{track:one(p.track,['harbour','canyon','alpine','metro','grandprix','random'],'harbour'),difficulty:one(p.difficulty,['rookie','club','pro','elite','random'],'club'),laps:one(p.laps,['1','2','3','4','5','6','7','8','random'],'3'),rivals:one(p.rivals,['3','5','7','random'],'5'),weather:one(p.weather,['clear','rain','random'],'clear'),paint:hex(p.paint,'#ff684f'),stripe:hex(p.stripe,'#fff3d4'),autoThrottle:p.autoThrottle===true,touchSize:one(p.touchSize,['large','xl'],'large'),touchControls:p.touchControls===true,music:p.music!==false,sfx:p.sfx!==false,volume:n(p.volume,0,1,.42)},races:Math.floor(n(d?.races,0,1e9,0)),wins:Math.floor(n(d?.wins,0,1e9,0)),bestLaps};}

  async function flappyInstalled(){for(const name of ['game.html','icon.png']){const node=await PocketDisk.getNode(FLAPPY_ROOT+'/'+name).catch(()=>null);if(!node||node.type!=='file')return false;}return true;}
  async function flappyBytes(){const snap=await PocketDisk.snapshot();return Object.entries(snap).filter(([path,node])=>node?.type==='file'&&path.startsWith(FLAPPY_ROOT+'/')).reduce((sum,[,node])=>sum+Number(node.size||0),0);}
  async function flappyIdentity(){let name=FLAPPY_NAME,icon=FLAPPY_ICON_URL;if(await flappyInstalled()){try{name=String(await PocketDisk.readText(FLAPPY_ROOT+'/'+FLAPPY_NAME_FILE)||FLAPPY_NAME).replace(/[\r\n\t]+/g,' ').trim().slice(0,30)||FLAPPY_NAME;}catch{}await refreshGameIcon(FLAPPY_ROOT,FLAPPY_SOURCE);try{icon=await blobToDataURL(await PocketDisk.readBlob(FLAPPY_ROOT+'/icon.png'));}catch{}}return{name,icon};}
  function flappyPinned(){return localStorage.getItem(FLAPPY_PIN_KEY)==='1';}
  function setFlappyPinned(v){if(v)localStorage.setItem(FLAPPY_PIN_KEY,'1');else localStorage.removeItem(FLAPPY_PIN_KEY);}
  async function createFlappyIconBlob(){const response=await fetch(FLAPPY_ICON_URL,{cache:'no-cache'});if(!response.ok)throw new Error('Could not prepare the Flappy Bird icon.');const svg=await response.text(),source=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{const img=new Image();img.decoding='async';await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Could not render the Flappy Bird icon.'));img.src=source;});const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;canvas.getContext('2d').drawImage(img,0,0,512,512);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('Could not encode the Flappy Bird icon.');return png;}finally{URL.revokeObjectURL(source);}}
  async function fetchFlappyGameHTML(){const response=await fetch(new URL(FLAPPY_SOURCE+'game.html',location.href).href,{cache:'no-cache'});if(!response.ok)throw new Error('Could not download the Flappy Bird game engine.');const html=await response.text();if(!html.includes('name="pocketvm-flappy-build" content="'+FLAPPY_GAME_REVISION+'"'))throw new Error('Flappy Bird package verification failed.');return html;}
  async function fetchFlappyMusic(){let last=null;for(const url of FLAPPY_MUSIC.urls){try{const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw new Error('HTTP '+response.status);const blob=await response.blob();if(blob.size<100000)throw new Error('Music file was unexpectedly small.');return blob;}catch(err){last=err;}}throw new Error('Could not download the Flappy Bird soundtrack'+(last?.message?' · '+last.message:''));}
  async function loadFlappyGameHTML(){const path=FLAPPY_ROOT+'/game.html';let html=await PocketDisk.readText(path),marker='name="pocketvm-flappy-build" content="'+FLAPPY_GAME_REVISION+'"';if(html.includes(marker))return html;try{const fresh=await fetchFlappyGameHTML();await PocketDisk.writeText(path,fresh,'text/html');await shellCtx?.refreshFS?.();html=fresh;shellCtx?.notify?.('Flappy Bird updated','Smooth flight, new skies and checkpoint practice are ready.','🐦');}catch{}return html;}
  async function installFlappy(progress){if(await flappyInstalled())return;await PocketDisk.ensureDir(FLAPPY_ROOT);let completed=0;try{const html=await fetchFlappyGameHTML();await PocketDisk.writeText(FLAPPY_ROOT+'/game.html',html,'text/html');completed+=FLAPPY_GAME_BYTES;progress?.(completed,FLAPPY_TOTAL_BYTES,'game.html');let music=null;try{music=await fetchFlappyMusic();await PocketDisk.writeBlob(FLAPPY_ROOT+'/music.mp3',music,FLAPPY_MUSIC.mime);completed+=music.size;progress?.(Math.min(completed,FLAPPY_TOTAL_BYTES),FLAPPY_TOTAL_BYTES,'music.mp3');}catch{progress?.(Math.min(completed,FLAPPY_TOTAL_BYTES),FLAPPY_TOTAL_BYTES,'Music will stream when online');}const iconBlob=await createFlappyIconBlob();await PocketDisk.writeBlob(FLAPPY_ROOT+'/icon.png',iconBlob,'image/png');completed+=iconBlob.size;progress?.(Math.min(completed,FLAPPY_TOTAL_BYTES),FLAPPY_TOTAL_BYTES,'icon.png');await PocketDisk.writeText(FLAPPY_ROOT+'/'+FLAPPY_NAME_FILE,FLAPPY_NAME,'text/plain');progress?.(FLAPPY_TOTAL_BYTES,FLAPPY_TOTAL_BYTES,'Finishing');await shellCtx?.refreshFS?.();await syncFlappyShell();shellCtx?.notify?.('Flappy Bird installed','Tap to fly.','🐦');}catch(err){if(await PocketDisk.getNode(FLAPPY_ROOT).catch(()=>null))await PocketDisk.remove(FLAPPY_ROOT).catch(()=>{});throw err;}}
  async function uninstallFlappy(){if(!await flappyInstalled())return;for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===FLAPPY_ID)shellCtx.closeWindow?.(win.id);await PocketDisk.remove(FLAPPY_ROOT);setFlappyPinned(false);await shellCtx?.refreshFS?.();await syncFlappyShell();shellCtx?.notify?.('Flappy Bird uninstalled','Its files were removed from the virtual drive.','×');}
  async function toggleFlappyPin(v){setFlappyPinned(v);await syncFlappyShell();shellCtx?.notify?.(v?'Added to desktop':'Removed from desktop',FLAPPY_NAME,v?'＋':'−');}
  async function syncFlappyShell(ctx=shellCtx){if(!ctx)return;const installed=await flappyInstalled().catch(()=>false),startGrid=document.querySelector('.start-grid'),desktop=document.getElementById('desktop-icons');let start=document.querySelector('[data-store-launch="flappy-start"]'),desk=document.querySelector('[data-store-launch="flappy-desktop"]');if(!installed){start?.remove();desk?.remove();setFlappyPinned(false);ctx.initDesktopGrid?.();return;}const id=await flappyIdentity();if(startGrid){if(!start){start=document.createElement('button');start.dataset.open=FLAPPY_ID;start.dataset.storeLaunch='flappy-start';startGrid.appendChild(start);}fillLauncher(start,id.name,id.icon,false);}if(desktop){if(flappyPinned()){if(!desk){desk=document.createElement('button');desk.className='desktop-icon store-game-desktop';desk.dataset.open=FLAPPY_ID;desk.dataset.storeLaunch='flappy-desktop';desktop.appendChild(desk);}fillLauncher(desk,id.name,id.icon,true);}else desk?.remove();}for(const win of ctx.state.windows.values()){if(win.appId!==FLAPPY_ID)continue;ctx.setWindowTitle(win,id.name,'🐦');applyWindowIcon(win,id.icon,ctx);}ctx.initDesktopGrid?.();}
  function sanitizeFlappySave(d){const n=v=>Math.max(0,Math.min(1e9,Math.floor(Number(v)||0))),best=n(d?.best),skins={sunny:0,mint:5,berry:10,azure:20,midnight:35},skin=Object.hasOwn(skins,d?.skin)&&skins[d.skin]<=best?d.skin:'sunny';return{best,practiceBest:n(d?.practiceBest),bestStreak:n(d?.bestStreak),runs:n(d?.runs),totalPipes:n(d?.totalPipes),skin,mode:d?.mode==='practice'?'practice':'classic',music:d?.music!==false,sfx:d?.sfx!==false};}

  async function penguinInstalled(){for(const name of ['game.html','icon.png']){const node=await PocketDisk.getNode(PENGUIN_ROOT+'/'+name).catch(()=>null);if(!node||node.type!=='file')return false;}return true;}
  async function penguinBytes(){const snap=await PocketDisk.snapshot();return Object.entries(snap).filter(([path,node])=>node?.type==='file'&&path.startsWith(PENGUIN_ROOT+'/')).reduce((sum,[,node])=>sum+Number(node.size||0),0);}
  async function penguinIdentity(){let name=PENGUIN_NAME,icon=PENGUIN_ICON_URL;if(await penguinInstalled()){try{name=String(await PocketDisk.readText(PENGUIN_ROOT+'/'+PENGUIN_NAME_FILE)||PENGUIN_NAME).replace(/[\r\n\t]+/g,' ').trim().slice(0,30)||PENGUIN_NAME;}catch{}await refreshGameIcon(PENGUIN_ROOT,PENGUIN_SOURCE);try{icon=await blobToDataURL(await PocketDisk.readBlob(PENGUIN_ROOT+'/icon.png'));}catch{}}return{name,icon};}
  function penguinPinned(){return localStorage.getItem(PENGUIN_PIN_KEY)==='1';}
  function setPenguinPinned(v){if(v)localStorage.setItem(PENGUIN_PIN_KEY,'1');else localStorage.removeItem(PENGUIN_PIN_KEY);}
  async function createPenguinIconBlob(){const response=await fetch(PENGUIN_ICON_URL,{cache:'no-cache'});if(!response.ok)throw new Error('Could not prepare the Penguin Pull icon.');const svg=await response.text(),source=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{const img=new Image();img.decoding='async';await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Could not render the Penguin Pull icon.'));img.src=source;});const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;canvas.getContext('2d').drawImage(img,0,0,512,512);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('Could not encode the Penguin Pull icon.');return png;}finally{URL.revokeObjectURL(source);}}
  async function fetchPenguinGameHTML(){const response=await fetch(new URL(PENGUIN_SOURCE+'game.html',location.href).href,{cache:'no-cache'});if(!response.ok)throw new Error('Could not download the Penguin Pull game engine.');const html=await response.text();if(!html.includes('name="pocketvm-penguin-build" content="'+PENGUIN_GAME_REVISION+'"'))throw new Error('Penguin Pull package verification failed.');return html;}
  async function loadPenguinGameHTML(){const path=PENGUIN_ROOT+'/game.html';let html=await PocketDisk.readText(path),marker='name="pocketvm-penguin-build" content="'+PENGUIN_GAME_REVISION+'"';if(html.includes(marker))return html;try{const fresh=await fetchPenguinGameHTML();await PocketDisk.writeText(path,fresh,'text/html');await shellCtx?.refreshFS?.();html=fresh;shellCtx?.notify?.('Penguin Pull updated','Endless random stages and reliable splash scoring are ready.','🐧');}catch{}return html;}
  async function installPenguin(progress){if(await penguinInstalled())return;await PocketDisk.ensureDir(PENGUIN_ROOT);let completed=0;try{const html=await fetchPenguinGameHTML();await PocketDisk.writeText(PENGUIN_ROOT+'/game.html',html,'text/html');completed+=PENGUIN_GAME_BYTES;progress?.(completed,PENGUIN_TOTAL_BYTES,'game.html');const iconBlob=await createPenguinIconBlob();await PocketDisk.writeBlob(PENGUIN_ROOT+'/icon.png',iconBlob,'image/png');completed+=iconBlob.size;progress?.(Math.min(completed,PENGUIN_TOTAL_BYTES),PENGUIN_TOTAL_BYTES,'icon.png');await PocketDisk.writeText(PENGUIN_ROOT+'/'+PENGUIN_NAME_FILE,PENGUIN_NAME,'text/plain');progress?.(PENGUIN_TOTAL_BYTES,PENGUIN_TOTAL_BYTES,'Finishing');await shellCtx?.refreshFS?.();await syncPenguinShell();syncApexShell();shellCtx?.notify?.('Penguin Pull installed','An endless rescue adventure is ready.','🐧');}catch(err){if(await PocketDisk.getNode(PENGUIN_ROOT).catch(()=>null))await PocketDisk.remove(PENGUIN_ROOT).catch(()=>{});throw err;}}
  async function uninstallPenguin(){if(!await penguinInstalled())return;for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===PENGUIN_ID)shellCtx.closeWindow?.(win.id);await PocketDisk.remove(PENGUIN_ROOT);setPenguinPinned(false);await shellCtx?.refreshFS?.();await syncPenguinShell();syncApexShell();shellCtx?.notify?.('Penguin Pull uninstalled','Its files were removed from the virtual drive.','×');}
  async function togglePenguinPin(v){setPenguinPinned(v);await syncPenguinShell();syncApexShell();shellCtx?.notify?.(v?'Added to desktop':'Removed from desktop',PENGUIN_NAME,v?'＋':'−');}
  async function syncPenguinShell(ctx=shellCtx){if(!ctx)return;const installed=await penguinInstalled().catch(()=>false),startGrid=document.querySelector('.start-grid'),desktop=document.getElementById('desktop-icons');let start=document.querySelector('[data-store-launch="penguinpull-start"]'),desk=document.querySelector('[data-store-launch="penguinpull-desktop"]');if(!installed){start?.remove();desk?.remove();setPenguinPinned(false);ctx.initDesktopGrid?.();return;}const id=await penguinIdentity();if(startGrid){if(!start){start=document.createElement('button');start.dataset.open=PENGUIN_ID;start.dataset.storeLaunch='penguinpull-start';startGrid.appendChild(start);}fillLauncher(start,id.name,id.icon,false);}if(desktop){if(penguinPinned()){if(!desk){desk=document.createElement('button');desk.className='desktop-icon store-game-desktop';desk.dataset.open=PENGUIN_ID;desk.dataset.storeLaunch='penguinpull-desktop';desktop.appendChild(desk);}fillLauncher(desk,id.name,id.icon,true);}else desk?.remove();}for(const win of ctx.state.windows.values()){if(win.appId!==PENGUIN_ID)continue;ctx.setWindowTitle(win,id.name,'🐧');applyWindowIcon(win,id.icon,ctx);}ctx.initDesktopGrid?.();}
  function sanitizePenguinSave(d){return{bestTowers:Math.max(0,Math.min(1e9,Math.floor(Number(d?.bestTowers)||0))),best:Math.max(0,Math.min(1e9,Math.floor(Number(d?.best)||0))),perfects:Math.max(0,Math.min(1e9,Math.floor(Number(d?.perfects)||0))),crownPerfects:Math.max(0,Math.min(1e9,Math.floor(Number(d?.crownPerfects)||0))),sound:d?.sound!==false};}

  async function installedCrumbClickerMods(){
    const result={},snap=await PocketDisk.snapshot().catch(()=>({})),prefix=CRUMBCLICKER_ROOT+'/';
    const paths=Object.entries(snap).filter(([path,node])=>node?.type==='file'&&path.startsWith(prefix)&&!path.slice(prefix.length).includes('/')&&/\.pvmod$/i.test(path)).map(([path])=>path);
    for(const path of paths){
      try{
        const data=JSON.parse(await PocketDisk.readText(path));
        if(data?.pocketvmMod===1&&data?.game==='crumbclicker'&&CRUMBCLICKER_MODS[data.id])result[data.id]=true;
      }catch{}
    }
    return result;
  }

  async function crumbClickerModStatus(id){
    const mod=CRUMBCLICKER_MODS[id];if(!mod)return{downloaded:false,installed:false};
    const [downloaded,installed]=await Promise.all([PocketDisk.getNode(MOD_DOWNLOAD_ROOT+'/'+mod.file).catch(()=>null),PocketDisk.getNode(CRUMBCLICKER_ROOT+'/'+mod.file).catch(()=>null)]);
    return{downloaded:!!downloaded,installed:!!installed};
  }

  async function downloadCrumbClickerMod(id){
    const mod=CRUMBCLICKER_MODS[id];if(!mod)throw new Error('Unknown Crumb Clicker mod.');
    await PocketDisk.ensureDir(MOD_DOWNLOAD_ROOT);
    await PocketDisk.writeText(MOD_DOWNLOAD_ROOT+'/'+mod.file,JSON.stringify(mod.payload,null,2)+'\n','application/x-pocketvm-mod+json');
    await shellCtx?.refreshFS?.();
    shellCtx?.notify?.(mod.name+' downloaded','Move it into the Crumb Clicker folder to activate it.','↓');
  }

  async function uninstallCrumbClickerMod(id){
    const mod=CRUMBCLICKER_MODS[id];if(!mod)return;let changed=false;
    for(const path of [MOD_DOWNLOAD_ROOT+'/'+mod.file,CRUMBCLICKER_ROOT+'/'+mod.file]){
      if(await PocketDisk.getNode(path).catch(()=>null)){await PocketDisk.remove(path);changed=true;}
    }
    if(id==='hyperclicker'){
      try{const saved=JSON.parse(localStorage.getItem(CRUMBCLICKER_SAVE_KEY)||'{}')||{};saved.hyperOn=false;localStorage.setItem(CRUMBCLICKER_SAVE_KEY,JSON.stringify(saved));}catch{}
    }
    if(changed){
      for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===CRUMBCLICKER_ID)shellCtx.closeWindow?.(win.id);
      await shellCtx?.refreshFS?.();await syncCrumbClickerShell();
      shellCtx?.notify?.(mod.name+' removed','Relaunch Crumb Clicker to continue without it.','×');
    }
  }

  function applyCrumbClickerModsToHTML(html,mods){
    let out=String(html||'');const active=mods||{};
    if(active.opbuildings){
      out=out.replace("function priceOne(b,owned=state.buildings[b.id]||0){return b.base*Math.pow(1.15,owned)}","function priceOne(b,owned=state.buildings[b.id]||0){return 1}");
      out=out.replace("function bulkPrice(b,count,owned=state.buildings[b.id]||0){if(count<=0)return 0;const first=priceOne(b,owned);return first*(Math.pow(1.15,count)-1)/.15}","function bulkPrice(b,count,owned=state.buildings[b.id]||0){return Math.max(0,count)}");
      out=out.replace("function maxAffordable(b){let cash=state.biscuits,owned=state.buildings[b.id]||0,n=0;while(n<10000){const p=priceOne(b,owned+n);if(p>cash)break;cash-=p;n++}return n}","function maxAffordable(b){return Math.min(10000,Math.floor(state.biscuits))}");
    }
    if(active.hyperclicker){
      out=out.replace('<button class="top-btn" id="sfxBtn" aria-pressed="true">◉ SFX</button></header>','<button class="top-btn" id="sfxBtn" aria-pressed="true">◉ SFX</button><button class="top-btn hyper-toggle" id="hyperBtn" aria-pressed="false">⚡ HYPER OFF</button></header>');
      out=out.replace('</style>','.hyper-toggle[aria-pressed="true"]{color:#1b1104;background:linear-gradient(135deg,#ffe56b,#ff9f38);border-color:rgba(255,215,82,.45);box-shadow:0 0 24px rgba(255,183,59,.22)}@media(max-width:620px){.hyper-toggle{position:fixed;right:10px;bottom:10px;z-index:25;box-shadow:0 10px 30px rgba(0,0,0,.35)}}</style>');
      out=out.replace("let state={biscuits:0,runBaked:0,allTime:0,clicks:0,buildings:blankBuildings(),upgrades:[],achievements:[],stars:0,lucky:0,music:injected.music!==false,sfx:injected.sfx!==false,lastSeen:Date.now(),startedAt:Date.now(),...injected};","let state={biscuits:0,runBaked:0,allTime:0,clicks:0,buildings:blankBuildings(),upgrades:[],achievements:[],stars:0,lucky:0,music:injected.music!==false,sfx:injected.sfx!==false,hyperOn:injected.hyperOn===true,lastSeen:Date.now(),startedAt:Date.now(),...injected};");
      out=out.replace("function safeState(){return{biscuits:state.biscuits,runBaked:state.runBaked,allTime:state.allTime,clicks:state.clicks,buildings:state.buildings,upgrades:state.upgrades,achievements:state.achievements,stars:state.stars,lucky:state.lucky,music:state.music,sfx:state.sfx,lastSeen:Date.now(),startedAt:state.startedAt}}","function safeState(){return{biscuits:state.biscuits,runBaked:state.runBaked,allTime:state.allTime,clicks:state.clicks,buildings:state.buildings,upgrades:state.upgrades,achievements:state.achievements,stars:state.stars,lucky:state.lucky,music:state.music,sfx:state.sfx,hyperOn:!!state.hyperOn,lastSeen:Date.now(),startedAt:state.startedAt}}");
      out=out.replace("cookieEl.addEventListener('pointerdown',bake);","const hyperBtn=$('hyperBtn');function syncHyper(){hyperBtn.setAttribute('aria-pressed',String(!!state.hyperOn));hyperBtn.textContent=state.hyperOn?'⚡ HYPER ON':'⚡ HYPER OFF'}hyperBtn.addEventListener('click',()=>{state.hyperOn=!state.hyperOn;syncHyper();showToast(state.hyperOn?'Hyperclicker engaged':'Hyperclicker stopped',state.hyperOn?'5,000 clicks per second. This is wildly unfair.':'Back to normal clicking.');tone(state.hyperOn?760:220,.08,'square',.025,state.hyperOn?180:-80);save()});syncHyper();cookieEl.addEventListener('pointerdown',bake);");
      out=out.replace("function tick(now){const dt=Math.min(.25,(now-last)/1000||0);last=now;const cps=calcCps();","function tick(now){const dt=Math.min(.25,(now-last)/1000||0);last=now;if(state.hyperOn){const hyperClicks=5000*dt;addBiscuits(clickValue()*hyperClicks);state.clicks+=hyperClicks;}const cps=calcCps();");
    }
    if(active.candy){
      out=out.replace('<title>Crumb Clicker</title>','<title>Candy Clicker</title>');
      out=out.replace('<div class="app" id="app">','<div class="app candy-mode" id="app">');
      out=out.replace('<div class="brand"><div class="logo">◉</div><div><strong>Crumb Clicker</strong><small>POCKETVM BAKERY</small></div></div>','<div class="brand"><div class="logo">🍬</div><div><strong>Candy Clicker</strong><small>POCKETVM CANDY SHOP</small></div></div>');
      out=out.replace('aria-label="Bake biscuit"','aria-label="Make candy"').replace('TAP THE BISCUIT · BUILD THE BAKERY','TAP THE CANDY · BUILD THE CANDY SHOP').replace('aria-label="Lucky crumb"','aria-label="Lucky candy"');
      out=out.replace('<div><span>BAKERY DATA</span><h2>Stats</h2></div>','<div><span>CANDY DATA</span><h2>Stats</h2></div>');
      out=out.replace('<strong>Bakery Stars</strong><p>Restart your current bakery to bank permanent stars. Every star gives +5% total production forever.</p>','<strong>Sugar Stars</strong><p>Restart your current candy shop to bank permanent stars. Every star gives +5% total production forever.</p>');
      out=out.replace('<div class="shop-title"><h2>Bakery</h2>','<div class="shop-title"><h2>Candy Shop</h2>');
      const candyCss='.candy-mode{--bg:#17091b;--panel:#24102a;--panel2:#301437;--line:rgba(255,217,250,.13);--text:#fff2fc;--muted:#c28bbd;--gold:#ff88d8;--cream:#ffe1f8;--brown:#954f9c}.candy-mode .top{background:rgba(21,8,25,.92)}.candy-mode .logo{background:linear-gradient(145deg,#ff83d1,#936dff);box-shadow:0 8px 22px rgba(210,87,255,.2)}.candy-mode .cookie-stage{background:radial-gradient(circle at 50% 46%,rgba(255,109,214,.11),transparent 36%)}.candy-mode .big-cookie{background:conic-gradient(from 15deg,#ff79c8,#ffd36b,#71ddff,#a67cff,#ff79c8);box-shadow:inset 0 7px 0 rgba(255,255,255,.2),inset 0 -14px 28px rgba(79,25,94,.22),0 28px 80px rgba(0,0,0,.34),0 0 58px rgba(255,107,221,.16)}.candy-mode .big-cookie:before{inset:12%;background:repeating-radial-gradient(circle at 48% 48%,rgba(255,255,255,.34) 0 5%,transparent 6% 13%);transform:rotate(18deg)}.candy-mode .big-cookie:after{inset:8%;border:3px solid rgba(255,255,255,.18);border-style:solid}.candy-mode .crumb-particle{background:#ff71ca}.candy-mode .lucky{background:radial-gradient(circle at 35% 30%,#fff,#ff9ae0 42%,#ba7cff 72%,#5d2e88)}.candy-mode .building,.candy-mode .upgrade{background:linear-gradient(145deg,#311637,#211028)}';
      out=out.replace('</style>',candyCss+'</style>');
      const swaps=[
        ['Night Baker','Candy Maker'],['Bakes while you do literally anything else.','Makes sweets while you do literally anything else.'],
        ['Smart Oven','Candy Cooker'],['Warm metal. Serious output.','Hot sugar. Serious output.'],
        ['Dough Farm','Sugar Farm'],['Grows suspiciously efficient dough.','Grows suspiciously efficient sugar.'],
        ['Sugar Mill','Candy Mill'],['Turns raw sweetness into industrial fuel.','Turns raw sweetness into industrial candy.'],
        ['Bakery Line','Candy Line'],['Conveyors, mixers and zero patience.','Conveyors, wrappers and zero patience.'],
        ['Crumb Market','Candy Market'],['Turns demand into more demand.','Turns sugar demand into more demand.'],
        ['Royal Kitchen','Royal Candy Lab'],['Unreasonably ornate ovens.','Unreasonably ornate candy vats.'],
        ['Time Mixer','Time Taffy'],['Borrows tomorrow’s dough today.','Borrows tomorrow’s sugar today.'],
        ['Crumb Portal','Candy Portal'],['Imports baked goods from somewhere else.','Imports sweets from somewhere else.'],
        ['Moon Bakery','Moon Candyworks'],['Low gravity. High margins.','Low gravity. High sugar.'],
        ['Baker Reflex','Candy Reflex'],['Crumb Impact','Sugar Impact'],['Warm Kitchen','Warm Candy Shop'],
        ['Cookie Jar','Candy Jar'],['First Crumb','First Candy'],['This bakery','This candy shop'],['Bakery','Candy Shop'],['Runaway Oven','Runaway Candy Cooker'],['Lucky crumb!','Lucky candy!'],
        ['Lucky crumbs','Lucky candies'],['Bakery stars','Sugar stars'],['Second Bakery','Second Candy Shop'],['New bakery legacy','New candy legacy']
      ];
      for(const [a,b] of swaps)out=out.split(a).join(b);
      out=out.split(' biscuits').join(' candies');
    out=out.replace("const txt=fmt(state.biscuits)+' candies';","const txt=fmt(state.biscuits)+' candies';");
      out=out.replace("showToast('Lucky candy!','+'+fmt(reward)+' biscuits');","showToast('Lucky candy!','+'+fmt(reward)+' candies');");
      out=out.replace("showToast('Welcome back','Your bakery made '+fmt(gain)+' biscuits while you were away.')","showToast('Welcome back','Your candy shop made '+fmt(gain)+' candies while you were away.')");
      out=out.replace("prestigeBtn.textContent=gain>0?'Restart & gain '+gain+' star'+(gain===1?'':'s'):'Next star at '+fmt(Math.pow(state.stars+1,3)*1e8)+' all-time'","prestigeBtn.textContent=gain>0?'Restart & gain '+gain+' star'+(gain===1?'':'s'):'Next sugar star at '+fmt(Math.pow(state.stars+1,3)*1e8)+' candies all-time'");
      out=out.replace("modalCopy.textContent='This resets candies, buildings and regular upgrades. You will keep achievements and gain '+gain+' Candy Shop Star'+(gain===1?'':'s')+', permanently boosting all production.'","modalCopy.textContent='This resets candies, buildings and regular upgrades. You will keep achievements and gain '+gain+' Sugar Star'+(gain===1?'':'s')+', permanently boosting all production.'");
      out=out.replace("showToast('New candy legacy','Banked '+gain+' permanent star'+(gain===1?'':'s')+'.')","showToast('New candy legacy','Banked '+gain+' permanent Sugar Star'+(gain===1?'':'s')+'.')");
    }
    return out;
  }

  async function installedBlockBlastMods() {
    const result={},snap=await PocketDisk.snapshot().catch(()=>({})),prefix=BLOCKBLAST_ROOT+'/';
    const paths=Object.entries(snap).filter(([path,node])=>node?.type==='file'&&path.startsWith(prefix)&&!path.slice(prefix.length).includes('/')&&/\.pvmod$/i.test(path)).map(([path])=>path);
    for(const path of paths){
      try{
        const data=JSON.parse(await PocketDisk.readText(path));
        if(data?.pocketvmMod===1&&data?.game==='blockblast'&&BLOCKBLAST_MODS[data.id])result[data.id]=true;
      }catch{}
    }
    return result;
  }

  async function blockBlastModStatus(id) {
    const mod=BLOCKBLAST_MODS[id];if(!mod)return{downloaded:false,installed:false};
    const [downloaded,installed]=await Promise.all([
      PocketDisk.getNode(MOD_DOWNLOAD_ROOT+'/'+mod.file).catch(()=>null),
      PocketDisk.getNode(BLOCKBLAST_ROOT+'/'+mod.file).catch(()=>null)
    ]);
    return{downloaded:!!downloaded,installed:!!installed};
  }

  async function downloadBlockBlastMod(id) {
    const mod=BLOCKBLAST_MODS[id];if(!mod)throw new Error('Unknown Block Blast mod.');
    await PocketDisk.ensureDir(MOD_DOWNLOAD_ROOT);
    await PocketDisk.writeText(MOD_DOWNLOAD_ROOT+'/'+mod.file,JSON.stringify(mod.payload,null,2)+'\n','application/x-pocketvm-mod+json');
    await shellCtx?.refreshFS?.();
    shellCtx?.notify?.(mod.name+' downloaded','Move it into the Block Blast folder to activate it.','↓');
  }

  async function uninstallBlockBlastMod(id) {
    const mod=BLOCKBLAST_MODS[id];if(!mod)return;let changed=false;
    for(const path of [MOD_DOWNLOAD_ROOT+'/'+mod.file,BLOCKBLAST_ROOT+'/'+mod.file]){
      if(await PocketDisk.getNode(path).catch(()=>null)){await PocketDisk.remove(path);changed=true;}
    }
    if(changed){
      for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===BLOCKBLAST_ID)shellCtx.closeWindow?.(win.id);
      await shellCtx?.refreshFS?.();
      shellCtx?.notify?.(mod.name+' removed','Relaunch Block Blast to continue without it.','×');
    }
  }

  async function installedDeadwaveMods() {
    const result={},snap=await PocketDisk.snapshot().catch(()=>({})),prefix=DEADWAVE_ROOT+'/';
    const paths=Object.entries(snap).filter(([path,node])=>node?.type==='file'&&path.startsWith(prefix)&&!path.slice(prefix.length).includes('/')&&/\.pvmod$/i.test(path)).map(([path])=>path);
    for(const path of paths){try{const data=JSON.parse(await PocketDisk.readText(path));if(data?.pocketvmMod===1&&data?.game==='deadwave'&&data?.kind==='gameplay'&&DEADWAVE_MODS[data.id])result[data.id]=true;}catch{}}
    return result;
  }

  async function deadwaveModStatus(id) {
    const mod=DEADWAVE_MODS[id];if(!mod)return{downloaded:false,installed:false};
    const [downloaded,installed]=await Promise.all([PocketDisk.getNode(MOD_DOWNLOAD_ROOT+'/'+mod.file).catch(()=>null),PocketDisk.getNode(DEADWAVE_ROOT+'/'+mod.file).catch(()=>null)]);
    return{downloaded:!!downloaded,installed:!!installed};
  }

  async function downloadDeadwaveMod(id) {
    const mod=DEADWAVE_MODS[id];if(!mod)throw new Error('Unknown Deadwave mod.');
    await PocketDisk.ensureDir(MOD_DOWNLOAD_ROOT);
    await PocketDisk.writeText(MOD_DOWNLOAD_ROOT+'/'+mod.file,JSON.stringify(mod.payload,null,2)+'\n','application/x-pocketvm-mod+json');
    await shellCtx?.refreshFS?.();shellCtx?.notify?.(mod.name+' downloaded','Move it into the Deadwave folder to activate it.','↓');
  }

  async function uninstallDeadwaveMod(id) {
    const mod=DEADWAVE_MODS[id];if(!mod)return;let changed=false;
    for(const path of [MOD_DOWNLOAD_ROOT+'/'+mod.file,DEADWAVE_ROOT+'/'+mod.file]){if(await PocketDisk.getNode(path).catch(()=>null)){await PocketDisk.remove(path);changed=true;}}
    if(changed){for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===DEADWAVE_ID)shellCtx.closeWindow?.(win.id);await shellCtx?.refreshFS?.();shellCtx?.notify?.(mod.name+' removed','Deadwave will return to manual movement.','×');}
  }

  async function installedDeadwaveSkins() {
    const out=[],snap=await PocketDisk.snapshot().catch(()=>({})),prefix=DEADWAVE_ROOT+'/';
    const paths=Object.entries(snap).filter(([path,node])=>node?.type==='file'&&path.startsWith(prefix)&&!path.slice(prefix.length).includes('/')&&/\.pvmod$/i.test(path)).map(([path])=>path);
    for(const path of paths){try{const data=JSON.parse(await PocketDisk.readText(path));if(data?.pocketvmMod===1&&data?.game==='deadwave'&&data?.kind==='skin-pack'&&Array.isArray(data.skins))out.push({id:data.id,name:data.name,skins:data.skins});}catch{}}
    return out;
  }

  async function deadwaveSkinStatus(id) {
    const pack=DEADWAVE_SKIN_PACKS[id]; if(!pack)return{downloaded:false,installed:false};
    const [downloaded,installed]=await Promise.all([PocketDisk.getNode(MOD_DOWNLOAD_ROOT+'/'+pack.file).catch(()=>null),PocketDisk.getNode(DEADWAVE_ROOT+'/'+pack.file).catch(()=>null)]);
    return{downloaded:!!downloaded,installed:!!installed};
  }

  async function downloadDeadwaveSkin(id) {
    const pack=DEADWAVE_SKIN_PACKS[id];if(!pack)throw new Error('Unknown skin pack.');
    const payload={pocketvmMod:1,game:'deadwave',kind:'skin-pack',id:pack.id,version:'1.0.0',name:pack.name,skins:pack.skins};
    await PocketDisk.ensureDir(MOD_DOWNLOAD_ROOT);
    await PocketDisk.writeText(MOD_DOWNLOAD_ROOT+'/'+pack.file,JSON.stringify(payload,null,2)+'\n','application/x-pocketvm-mod+json');
    await shellCtx?.refreshFS?.(); shellCtx?.notify?.(pack.name+' downloaded','Move it into the Deadwave folder to unlock the skins.','↓');
  }

  async function uninstallDeadwaveSkin(id) {
    const pack=DEADWAVE_SKIN_PACKS[id];if(!pack)return;
    let changed=false;
    for(const path of [MOD_DOWNLOAD_ROOT+'/'+pack.file,DEADWAVE_ROOT+'/'+pack.file]){if(await PocketDisk.getNode(path).catch(()=>null)){await PocketDisk.remove(path);changed=true;}}
    if(changed){for(const win of [...(shellCtx?.state?.windows?.values?.()||[])])if(win.appId===DEADWAVE_ID)shellCtx.closeWindow?.(win.id);await shellCtx?.refreshFS?.();shellCtx?.notify?.(pack.name+' removed','Deadwave will use the remaining skins.','×');}
  }

  async function modStatus(id) {
    const mod = MODS[id];
    if (!mod) return { downloaded:false, installed:false, downloadPath:'' };
    const currentPath = MOD_DOWNLOAD_ROOT + '/' + mod.file;
    const legacyPath = LEGACY_MOD_DOWNLOAD_ROOT + '/' + mod.file;
    const [current, legacy, installed] = await Promise.all([
      PocketDisk.getNode(currentPath).catch(() => null),
      PocketDisk.getNode(legacyPath).catch(() => null),
      PocketDisk.getNode(ROOT + '/' + mod.file).catch(() => null)
    ]);
    return {
      downloaded:!!(current || legacy),
      installed:!!installed,
      downloadPath:current ? currentPath : legacy ? legacyPath : currentPath
    };
  }

  async function installedMods() {
    const result = {};
    const snapshot = await PocketDisk.snapshot().catch(() => ({}));
    const prefix = ROOT + '/';
    const candidates = Object.entries(snapshot)
      .filter(([path,node]) => node?.type === 'file' && path.startsWith(prefix) && !path.slice(prefix.length).includes('/') && /\.pvmod$/i.test(path))
      .map(([path]) => path);
    for (const path of candidates) {
      try {
        const data = JSON.parse(await PocketDisk.readText(path));
        if (data?.pocketvmMod === 1 && data?.game === 'snake' && MODS[data.id]) result[data.id] = true;
      } catch {}
    }
    return result;
  }

  async function downloadMod(id) {
    const mod = MODS[id];
    if (!mod) throw new Error('Unknown mod.');
    await PocketDisk.ensureDir(MOD_DOWNLOAD_ROOT);
    const currentPath = MOD_DOWNLOAD_ROOT + '/' + mod.file;
    const legacyPath = LEGACY_MOD_DOWNLOAD_ROOT + '/' + mod.file;
    await PocketDisk.writeText(
      currentPath,
      JSON.stringify(mod.payload, null, 2) + '\n',
      'application/x-pocketvm-mod+json'
    );
    if (await PocketDisk.getNode(legacyPath).catch(() => null)) {
      await PocketDisk.remove(legacyPath).catch(() => {});
    }
    await shellCtx?.refreshFS?.();
    shellCtx?.notify?.(mod.name + ' downloaded', 'Ready in Downloads, beside the Snake folder.', '↓');
  }

  async function uninstallMod(id) {
    const mod = MODS[id];
    if (!mod) return;
    const paths = [
      MOD_DOWNLOAD_ROOT + '/' + mod.file,
      LEGACY_MOD_DOWNLOAD_ROOT + '/' + mod.file,
      ROOT + '/' + mod.file
    ];
    let changed = false;
    for (const path of paths) {
      if (await PocketDisk.getNode(path).catch(() => null)) {
        await PocketDisk.remove(path);
        changed = true;
      }
    }
    if (changed) {
      for (const win of [...(shellCtx?.state?.windows?.values?.() || [])]) {
        if (win.appId === GAME_ID) shellCtx.closeWindow?.(win.id);
      }
      await shellCtx?.refreshFS?.();
      shellCtx?.notify?.(mod.name + ' removed', 'Snake will run without that mod.', '×');
    }
  }

  async function modsPage() {
    const [snakeInstalled,deadInstalled,blockInstalled,crumbInstalled]=await Promise.all([isInstalled().catch(()=>false),deadwaveInstalled().catch(()=>false),blockBlastInstalled().catch(()=>false),crumbClickerInstalled().catch(()=>false)]);
    const cards=[];
    const bytes=payload=>formatBytes(new Blob([JSON.stringify(payload,null,2)+'\n']).size);
    const stateOf=status=>status.installed?'Active':status.downloaded?'Ready to move':'Available';
    const buttonFor=(status,download,remove,id)=>status.installed||status.downloaded?'<button class="m-btn remove" data-action="'+remove+'" data-id="'+id+'">Remove</button>':'<button class="m-btn get" data-action="'+download+'" data-id="'+id+'">Download</button>';
    const pushCard=({game,kind,name,desc,file,version='1.0.0',size,status,actionDownload,actionRemove,art})=>{
      const state=stateOf(status),path=status.installed?(game==='snake'?'Snake/':game==='deadwave'?'Deadwave/':game==='blockblast'?'Block Blast/':'Crumb Clicker/'):(status.downloaded?'Downloads/':'');
      cards.push('<article class="m-card" data-game="'+game+'"><div class="m-art '+game+'-art">'+art+'</div><div class="m-copy"><div class="m-top"><div class="badges"><span>'+game.toUpperCase()+'</span><span class="kind '+kind+'">'+kind.toUpperCase()+'</span></div><em class="'+(status.installed?'active':status.downloaded?'ready':'')+'">'+state+'</em></div><h3>'+name+'</h3><p>'+desc+'</p><div class="meta"><span>v'+version+'</span><span>'+size+'</span><code>'+path+file+'</code></div></div><div class="m-action">'+buttonFor(status,actionDownload,actionRemove,file.replace(/\.pvmod$/,''))+'</div></article>');
    };
    for(const mod of Object.values(MODS)){const status=await modStatus(mod.id);pushCard({game:'snake',kind:'gameplay',name:mod.name,desc:mod.description,file:mod.file,version:mod.payload.version,size:bytes(mod.payload),status,actionDownload:'download-snake',actionRemove:'uninstall-snake',art:'<strong>'+mod.icon+'</strong><small>SNAKE</small>'});cards[cards.length-1]=cards[cards.length-1].replace('data-id="'+mod.file.replace(/\.pvmod$/,'')+'"','data-id="'+mod.id+'"');}
    for(const mod of Object.values(DEADWAVE_MODS)){const status=await deadwaveModStatus(mod.id);pushCard({game:'deadwave',kind:'gameplay',name:mod.name,desc:mod.description,file:mod.file,version:mod.payload.version,size:bytes(mod.payload),status,actionDownload:'download-deadwave',actionRemove:'uninstall-deadwave',art:'<strong>AI</strong><small>AUTOPILOT</small>'});cards[cards.length-1]=cards[cards.length-1].replace('data-id="'+mod.file.replace(/\.pvmod$/,'')+'"','data-id="'+mod.id+'"');}
    for(const pack of Object.values(DEADWAVE_SKIN_PACKS)){const status=await deadwaveSkinStatus(pack.id),payload={pocketvmMod:1,game:'deadwave',kind:'skin-pack',id:pack.id,version:'1.0.0',name:pack.name,skins:pack.skins},swatches=pack.skins.map(x=>'<i style="background:'+x.body+'"></i>').join('');pushCard({game:'deadwave',kind:'cosmetic',name:pack.name,desc:pack.tagline+' '+pack.skins.length+' survivor skins. No stat changes.',file:pack.file,size:bytes(payload),status,actionDownload:'download-skin',actionRemove:'uninstall-skin',art:'<div class="swatches">'+swatches+'</div><small>SKIN PACK</small>'});cards[cards.length-1]=cards[cards.length-1].replace('data-id="'+pack.file.replace(/\.pvmod$/,'')+'"','data-id="'+pack.id+'"');}
    for(const mod of Object.values(BLOCKBLAST_MODS)){const status=await blockBlastModStatus(mod.id);pushCard({game:'blockblast',kind:mod.kind,name:mod.name,desc:mod.description,file:mod.file,version:mod.payload.version,size:bytes(mod.payload),status,actionDownload:'download-blockblast',actionRemove:'uninstall-blockblast',art:'<strong>'+mod.icon+'</strong><small>'+mod.tagline+'</small>'});cards[cards.length-1]=cards[cards.length-1].replace('data-id="'+mod.file.replace(/\.pvmod$/,'')+'"','data-id="'+mod.id+'"');}
    for(const mod of Object.values(CRUMBCLICKER_MODS)){const status=await crumbClickerModStatus(mod.id);pushCard({game:'crumbclicker',kind:mod.kind,name:mod.name,desc:mod.description,file:mod.file,version:mod.payload.version,size:bytes(mod.payload),status,actionDownload:'download-crumbclicker',actionRemove:'uninstall-crumbclicker',art:'<strong>'+mod.icon+'</strong><small>'+mod.tagline+'</small>'});cards[cards.length-1]=cards[cards.length-1].replace('data-id="'+mod.file.replace(/\.pvmod$/,'')+'"','data-id="'+mod.id+'"');}
    const activeCount=cards.filter(x=>x.includes('class="active"')).length;
    const gameStatus=(id,name,ok)=>'<div class="game-state"><i class="'+(ok?'on':'')+'"></i><div><strong>'+name+'</strong><span>'+(ok?'Game installed':'Game not installed')+'</span></div></div>';
    const css=`*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#07090d;color:#eef3f8;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body{padding:18px;background:radial-gradient(circle at 88% 0,rgba(255,65,83,.12),transparent 28%),radial-gradient(circle at 5% 100%,rgba(69,159,255,.08),transparent 30%),#07090d}.shell{max-width:1080px;margin:auto}.route{height:38px;display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:rgba(255,255,255,.025)}.route i{width:7px;height:7px;border-radius:50%;background:#ff5365;box-shadow:0 0 13px #ff536577}.route code{font:9px ui-monospace,monospace;color:#8794a6}.route span{margin-left:auto;color:#465364;font:700 7px ui-monospace,monospace;letter-spacing:.14em}.hero{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:end;padding:30px 4px 19px}.hero small{color:#ff6576;font-size:8px;font-weight:900;letter-spacing:.18em}.hero h1{margin:6px 0;font-size:40px;letter-spacing:-.05em}.hero p{max-width:700px;margin:0;color:#8190a3;font-size:10px;line-height:1.65}.hero-stat{display:flex;gap:7px}.hero-stat div{min-width:76px;padding:9px 11px;border:1px solid rgba(255,255,255,.06);border-radius:11px;background:rgba(255,255,255,.02)}.hero-stat span{display:block;color:#5d6b7d;font-size:7px;letter-spacing:.1em}.hero-stat strong{display:block;margin-top:2px;font-size:16px}.games{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}.game-state{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.018)}.game-state>i{width:7px;height:7px;border-radius:50%;background:#4c5664}.game-state>i.on{background:#6ae38d;box-shadow:0 0 11px #6ae38d66}.game-state strong,.game-state span{display:block}.game-state strong{font-size:8px}.game-state span{margin-top:1px;color:#596779;font-size:7px}.games button{margin-left:auto;height:36px;padding:0 12px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(255,255,255,.04);color:#dce5ef;font-size:8px;font-weight:800}.filters{position:sticky;top:8px;z-index:5;display:flex;gap:5px;padding:7px;margin:4px 0 14px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(10,13,18,.88);backdrop-filter:blur(16px)}.filters button{height:30px;padding:0 11px;border:0;border-radius:8px;background:transparent;color:#697789;font-size:8px;font-weight:850}.filters button.active{background:#edf3f8;color:#090c10}.list{display:grid;grid-template-columns:1fr 1fr;gap:9px}.m-card{display:grid;grid-template-columns:105px 1fr;gap:12px;padding:11px;border:1px solid rgba(255,255,255,.07);border-radius:15px;background:linear-gradient(145deg,rgba(255,255,255,.032),rgba(255,255,255,.012));box-shadow:0 16px 45px rgba(0,0,0,.12)}.m-card[hidden]{display:none}.m-art{height:105px;border:1px solid rgba(255,255,255,.06);border-radius:11px;background:#0b0f14;display:flex;flex-direction:column;gap:7px;align-items:center;justify-content:center;overflow:hidden;text-align:center}.m-art strong{font-size:29px}.m-art small{max-width:90px;color:#647386;font-size:6px;font-weight:850;letter-spacing:.1em}.snake-art{color:#ffd45c;background:radial-gradient(circle at 60% 20%,rgba(89,230,131,.13),transparent 48%),#0a100d}.deadwave-art{color:#ff6678;background:radial-gradient(circle at 60% 20%,rgba(153,104,255,.14),transparent 48%),#0d0b12}.blockblast-art{color:#69b4ff;background:radial-gradient(circle at 65% 18%,rgba(78,161,255,.16),transparent 48%),#09101b}.crumbclicker-art{color:#ff9bd9;background:radial-gradient(circle at 65% 18%,rgba(255,123,210,.16),transparent 48%),#160b18}.swatches{display:flex;gap:5px}.swatches i{width:18px;height:34px;border-radius:6px;box-shadow:inset 0 1px rgba(255,255,255,.18)}.m-copy{min-width:0}.m-top{display:flex;align-items:start;justify-content:space-between;gap:8px}.badges{display:flex;gap:4px;flex-wrap:wrap}.badges span{padding:4px 6px;border-radius:999px;background:rgba(255,255,255,.045);color:#697789;font-size:6px;font-weight:900;letter-spacing:.09em}.badges .gameplay{color:#ffb56f;background:rgba(255,160,75,.07)}.badges .cosmetic{color:#9fc5ff;background:rgba(87,157,255,.07)}.m-top em{height:21px;padding:0 7px;display:grid;place-items:center;border-radius:999px;background:rgba(255,255,255,.04);color:#667486;font-size:7px;font-style:normal;font-weight:850;white-space:nowrap}.m-top em.ready{color:#e4be62;background:rgba(255,204,78,.07)}.m-top em.active{color:#77e397;background:rgba(92,225,133,.08)}.m-copy h3{margin:8px 0 0;font-size:14px}.m-copy p{margin:6px 0;color:#758498;font-size:8.5px;line-height:1.5}.meta{display:flex;align-items:center;gap:7px;min-width:0;color:#526174;font-size:7px}.meta code{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:7px ui-monospace,monospace}.m-action{grid-column:1/-1;display:flex;justify-content:flex-end;border-top:1px solid rgba(255,255,255,.045);padding-top:8px}.m-btn{min-width:88px;height:32px;border-radius:8px;font-size:8px;font-weight:850}.m-btn.get{border:0;background:#edf3f8;color:#090c10}.m-btn.remove{border:1px solid rgba(255,88,103,.16);background:rgba(255,88,103,.055);color:#ff9aa5}.flow{margin-top:14px;padding:14px 16px;border:1px dashed rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.012);color:#667689;font-size:8px;line-height:1.7}.flow strong{color:#b6c1cf}.foot{margin:22px 0 5px;text-align:center;color:#343e4d;font:7px ui-monospace,monospace}@media(max-width:760px){body{padding:11px}.hero{grid-template-columns:1fr}.hero h1{font-size:32px}.hero-stat{display:none}.games button{margin-left:0}.list{grid-template-columns:1fr}.filters{overflow:auto}.m-card{grid-template-columns:82px 1fr}.m-art{height:88px}}`;
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body><main class="shell"><div class="route"><i></i><code>pocket:mods</code><span>LOCAL MOD INDEX</span></div><section class="hero"><div><small>POCKETVM / MODS</small><h1>Extensions, without the bloat.</h1><p>Mods are real files on PocketVM’s virtual drive. Download one, move the .pvmod into the matching game folder, then relaunch that game. Removing the file removes the feature.</p></div><div class="hero-stat"><div><span>PACKAGES</span><strong>'+cards.length+'</strong></div><div><span>ACTIVE</span><strong>'+activeCount+'</strong></div></div></section><div class="games">'+gameStatus('snake','Snake',snakeInstalled)+gameStatus('deadwave','Deadwave',deadInstalled)+gameStatus('blockblast','Block Blast',blockInstalled)+gameStatus('crumbclicker','Crumb Clicker',crumbInstalled)+'<button data-action="open-files">Open Downloads</button></div><nav class="filters"><button class="active" data-filter="all">All</button><button data-filter="snake">Snake</button><button data-filter="deadwave">Deadwave</button><button data-filter="blockblast">Block Blast</button><button data-filter="crumbclicker">Crumb Clicker</button></nav><section class="list">'+cards.join('')+'</section><div class="flow"><strong>Install:</strong> Download → Files → Downloads → drag the .pvmod onto the matching game folder → relaunch. &nbsp; <strong>Remove:</strong> use Remove here, or delete the .pvmod directly in Files.</div><div class="foot">PocketVM local extension index · packages remain inside your browser storage</div></main><script>document.addEventListener("click",function(e){var f=e.target.closest("[data-filter]");if(f){document.querySelectorAll("[data-filter]").forEach(function(x){x.classList.toggle("active",x===f)});var id=f.dataset.filter;document.querySelectorAll(".m-card").forEach(function(c){c.hidden=id!=="all"&&c.dataset.game!==id});return}var b=e.target.closest("[data-action]");if(!b||b.disabled)return;b.disabled=true;b.textContent=b.dataset.action==="open-files"?"Opening…":"Working…";parent.postMessage({type:"pocketvm-mods-action",action:b.dataset.action,id:b.dataset.id||""},"*")});<\/script></body></html>';
  }

  async function handleModAction(action, id) {
    if(action==='download-snake') await downloadMod(id);
    else if(action==='uninstall-snake') await uninstallMod(id);
    else if(action==='download-deadwave') await downloadDeadwaveMod(id);
    else if(action==='uninstall-deadwave') await uninstallDeadwaveMod(id);
    else if(action==='download-skin') await downloadDeadwaveSkin(id);
    else if(action==='uninstall-skin') await uninstallDeadwaveSkin(id);
    else if(action==='download-blockblast') await downloadBlockBlastMod(id);
    else if(action==='uninstall-blockblast') await uninstallBlockBlastMod(id);
    else if(action==='download-crumbclicker') await downloadCrumbClickerMod(id);
    else if(action==='uninstall-crumbclicker') await uninstallCrumbClickerMod(id);
    else if(action==='open-files') shellCtx?.openApp?.('files',{path:'/home/user/Downloads'});
    else if(action==='open-store') shellCtx?.openApp?.('store');
  }

  function featureArt() {
    return `<div class="store-snake-art" aria-hidden="true">
      <div class="ssa-grid"></div>
      <i style="--x:48px;--y:120px"></i><i style="--x:72px;--y:120px"></i><i style="--x:96px;--y:120px"></i><i style="--x:120px;--y:120px"></i>
      <i style="--x:144px;--y:120px"></i><i style="--x:144px;--y:96px"></i><i style="--x:144px;--y:72px" class="head"></i>
      <b class="apple"></b>
    </div>`;
  }

  async function buildStore(win, options = {}, ctx) {
    shellCtx=ctx; ctx.setWindowTitle(win,'Store','▣');
    let active=options.tab==='library'?'library':'home';
    const featureIds=['snake','deadwave','blockblast','crumbclicker','pvz','flappy','penguinpull','apexrush','wobblebay','gradeschool'];let featured='gradeschool';
    let variant=Math.floor(Math.random()*4),busy=false,progressState=null;
    win.content.innerHTML=`<div class="store-app"><header class="store-topbar"><div class="store-wordmark"><span>▣</span><div><strong>Store</strong><small>PocketVM games</small></div></div><nav class="store-tabs"><button data-store-tab="home">Home</button><button data-store-tab="library">Library</button></nav><div class="store-space"></div><div class="store-drive" data-store-drive>Checking storage…</div></header><main class="store-page" data-store-page></main></div>`;
    const page=ctx.queryOne('[data-store-page]',win.el),drive=ctx.queryOne('[data-store-drive]',win.el);

    async function refreshDrive(){try{const stats=await PocketDisk.stats();drive.textContent=formatBytes(stats.free)+' free';}catch{drive.textContent='Storage unavailable';}}
    async function gameState(id){
      if(id==='deadwave'){const installed=await deadwaveInstalled(),ident=await deadwaveIdentity();return{id,app:'deadwave',name:ident.name,icon:ident.icon,installed,pinned:deadwavePinned(),size:installed?await deadwaveBytes():DEADWAVE_TOTAL_BYTES,category:'Endless survival',summary:'13 weapons · 136 cards · 19 zombie breeds · 8 bosses',install:installDeadwave,pin:toggleDeadwavePin,uninstall:uninstallDeadwave};}
      if(id==='blockblast'){const installed=await blockBlastInstalled(),ident=await blockBlastIdentity();return{id,app:'blockblast',name:ident.name,icon:ident.icon,installed,pinned:blockBlastPinned(),size:installed?await blockBlastBytes():BLOCKBLAST_TOTAL_BYTES,category:'Puzzle',summary:'8×8 block puzzle · Ghost clear helper · Tiny install',install:installBlockBlast,pin:toggleBlockBlastPin,uninstall:uninstallBlockBlast};}
      if(id==='crumbclicker'){const installed=await crumbClickerInstalled(),ident=await crumbClickerIdentity();return{id,app:'crumbclicker',name:ident.name,icon:ident.icon,installed,pinned:crumbClickerPinned(),size:installed?await crumbClickerBytes():CRUMBCLICKER_TOTAL_BYTES,category:'Incremental',summary:'Idle bakery · upgrades · offline earnings · prestige',install:installCrumbClicker,pin:toggleCrumbClickerPin,uninstall:uninstallCrumbClicker};}
      if(id==='pvz'){const installed=await pvzInstalled(),ident=await pvzIdentity();return{id,app:'pvz',name:ident.name,icon:ident.icon,installed,pinned:pvzPinned(),size:installed?await pvzBytes():PVZ_TOTAL_BYTES,category:'Lane defense',summary:'50-stage Adventure · 49 plants · Endless mode',install:installPvz,pin:togglePvzPin,uninstall:uninstallPvz};}
      if(id==='flappy'){const installed=await flappyInstalled(),ident=await flappyIdentity();return{id,app:'flappy',name:ident.name,icon:ident.icon,installed,pinned:flappyPinned(),size:installed?await flappyBytes():FLAPPY_TOTAL_BYTES,category:'Arcade',summary:'Smooth flight · checkpoint practice · unlockable flock',install:installFlappy,pin:toggleFlappyPin,uninstall:uninstallFlappy};}
      if(id==='gradeschool'){const installed=await gradeInstalled(),ident=await gradeIdentity();return{id,app:GRADE_ID,name:ident.name,icon:ident.icon,installed,pinned:gradePinned(),size:installed?await gradeBytes():GRADE_TOTAL_BYTES,category:'Classroom simulation',summary:'Red/green drawing · absurd answers · 4 modes · classroom upgrades',install:installGrade,pin:toggleGradePin,uninstall:uninstallGrade};}
      if(id==='wobblebay'){const installed=await wobbleInstalled(),ident=await wobbleIdentity();return{id,app:WOBBLE_ID,name:ident.name,icon:ident.icon,installed,pinned:wobblePinned(),size:installed?await wobbleBytes():WOBBLE_TOTAL_BYTES,category:'3D physics sandbox',summary:'8 jobs · 7 vehicles · ragdolls · homes · 16 secrets',install:installWobble,pin:toggleWobblePin,uninstall:uninstallWobble};}
      if(id==='apexrush'){const installed=await apexInstalled(),ident=await apexIdentity();return{id,app:'apexrush',name:ident.name,icon:ident.icon,installed,pinned:apexPinned(),size:installed?await apexBytes():APEX_TOTAL_BYTES,category:'Racing',summary:'5 circuits · crash physics · custom colours · random grids',install:installApex,pin:toggleApexPin,uninstall:uninstallApex};}
      if(id==='penguinpull'){const installed=await penguinInstalled(),ident=await penguinIdentity();return{id,app:'penguinpull',name:ident.name,icon:ident.icon,installed,pinned:penguinPinned(),size:installed?await penguinBytes():PENGUIN_TOTAL_BYTES,category:'Physics',summary:'Endless random stages · every splash scores · reactive physics',install:installPenguin,pin:togglePenguinPin,uninstall:uninstallPenguin};}
      const installed=await isInstalled(),ident=await identity();return{id:'snake',app:'snake',name:ident.name,icon:ident.icon,installed,pinned:pinned(),size:installed?await installedBytes():TOTAL_BYTES,category:'Arcade',summary:'Classic Snake · Smooth touch controls · Original soundtrack',install:installSnake,pin:toggleDesktopPin,uninstall:uninstallSnake};
    }
    function featureCopy(id){const arr=id==='deadwave'?deadwaveFeatureVariants:id==='blockblast'?blockBlastFeatureVariants:id==='crumbclicker'?crumbClickerFeatureVariants:id==='pvz'?pvzFeatureVariants:id==='flappy'?flappyFeatureVariants:id==='penguinpull'?penguinFeatureVariants:id==='apexrush'?apexFeatureVariants:id==='wobblebay'?wobbleFeatureVariants:id==='gradeschool'?gradeFeatureVariants:featureVariants;return arr[variant%arr.length];}
    function deadwavePreview(){return '<div class="deadwave-preview"><div class="dw-grid"></div><i class="survivor"></i><b class="z z1"></b><b class="z z2"></b><b class="z z3"></b><b class="z z4"></b><b class="z z5"></b><span class="shot s1"></span><span class="shot s2"></span></div>';}
    function snakePreview(){return '<div class="store-game-preview"><div class="preview-grid"></div><b class="preview-apple"></b><i style="--px:36%;--py:64%"></i><i style="--px:44%;--py:64%"></i><i style="--px:52%;--py:64%"></i><i style="--px:60%;--py:64%"></i><i style="--px:60%;--py:50%" class="head"></i></div>';}
    function blockBlastPreview(){return '<div class="blockblast-preview"><div class="bb-mini-grid">'+Array.from({length:64},(_,i)=>'<i class="'+([10,11,12,18,26,34,42,50,51,52,53,54].includes(i)?'on b'+(i%4):'')+'"></i>').join('')+'</div><div class="bb-mini-pieces"><b></b><b></b><b></b></div></div>';}
    function crumbClickerPreview(){return '<div class="crumbclicker-preview"><div class="cc-number">12.48 M biscuits</div><div class="cc-cookie"><i></i><i></i><i></i><i></i><i></i></div><div class="cc-shop"><b></b><b></b><b></b><b></b></div></div>';}
    function pvzPreview(){return '<div class="pvz-preview"><div class="pvz-sun">☀ 325</div><div class="pvz-lawn">'+Array.from({length:45},(_,i)=>'<i class="'+([1,9,18,27,36].includes(i)?'sunflower':([3,12,21,30,39].includes(i)?'pea':''))+'"></i>').join('')+'</div><b class="pvz-z z1">🧟</b><b class="pvz-z z2">🧟‍♂️</b><span class="pvz-shot"></span></div>';}
    function flappyPreview(){return '<div class="flappy-preview"><span class="fp-sun"></span><i class="fp-cloud c1"></i><i class="fp-cloud c2"></i><b class="fp-pipe p1"></b><b class="fp-pipe p2"></b><div class="fp-bird"><i></i></div><strong>12</strong><em></em></div>';}
    function gradePreview(){return '<div style="width:100%;height:100%;min-height:260px;display:grid;place-items:center;background:linear-gradient(150deg,#e1ebc5,#85b6a2);border-radius:20px"><img src="./store/gradeschool/icon.svg?v=illustrated-v1" alt="Grade School paper and pencil" style="width:70%;max-width:270px;filter:drop-shadow(0 18px 25px #0003)"></div>';}
    function wobblePreview(){return '<div style="width:100%;height:100%;min-height:260px;display:grid;place-items:center;background:linear-gradient(150deg,#cdece5,#58aab4);border-radius:20px"><img src="./store/wobblebay/icon.svg?v=illustrated-v1" alt="Wobble Bay explorer" style="width:70%;max-width:270px;filter:drop-shadow(0 18px 25px #0003)"></div>';}
    function apexPreview(){return '<div style="width:100%;height:100%;min-height:260px;display:grid;place-items:center;background:linear-gradient(150deg,#274b43,#10232d);border-radius:20px"><img src="./store/apexrush/icon.svg?v=illustrated-v1" alt="Apex Rush race car" style="width:70%;max-width:270px;filter:drop-shadow(0 18px 25px #0005)"></div>';}
    function penguinPreview(){return '<div class="penguin-preview"><div class="pp-water"></div><div class="pp-stack">'+Array.from({length:20},(_,i)=>'<i style="--c:'+(i%5-2)+';--r:'+Math.floor(i/5)+'"></i>').join('')+'<b class="pp-king"><u></u></b></div><strong>7</strong><span>rescued</span></div>';}

    async function runAction(id,button,progress){
      if(busy)return;const g=await gameState(id);if(g.installed){ctx.openApp(g.app);return;}
      busy=true;if(button)button.disabled=true;if(progress)progress.hidden=false;
      try{await g.install((loaded,total,file)=>{progressState={id,loaded,total,file};if(progress){const pct=Math.max(0,Math.min(100,loaded/total*100));ctx.queryOne('i',progress).style.width=pct+'%';ctx.queryOne('span',progress).textContent='Installing '+file+' · '+Math.round(pct)+'%';}});await refreshDrive();await renderHome();}
      catch(err){if(progress)ctx.queryOne('span',progress).textContent=err?.message||'Install failed';if(button)button.disabled=false;}
      finally{busy=false;progressState=null;}
    }

    async function renderHome(){
      const games=await Promise.all(featureIds.map(gameState)),f=games.find(g=>g.id===featured)||games[0],others=games.filter(g=>g.id!==f.id),v=featureCopy(featured);
      const stats=await PocketDisk.stats().catch(()=>null);
      const control=f.id==='deadwave'?'Joystick + auto-fire':f.id==='blockblast'?'Drag + tap':f.id==='crumbclicker'?'Tap / click':f.id==='pvz'?'Tap + drag':f.id==='flappy'?'Tap / Space':f.id==='penguinpull'?'Drag + release':f.id==='apexrush'?'WASD / arrows + touch':f.id==='wobblebay'?'Touch · keys · Xbox pad':f.id==='gradeschool'?'Draw · red/green ink · touch':'Touch + keys';
      const visual=f.id==='deadwave'?deadwavePreview():f.id==='blockblast'?blockBlastPreview():f.id==='crumbclicker'?crumbClickerPreview():f.id==='pvz'?pvzPreview():f.id==='flappy'?flappyPreview():f.id==='penguinpull'?penguinPreview():f.id==='apexrush'?apexPreview():f.id==='wobblebay'?wobblePreview():f.id==='gradeschool'?gradePreview():snakePreview();
      const features=f.id==='gradeschool'
        ?'<article><span>01</span><div><strong>Be the teacher</strong><p>Pick red or green ink and draw your grade directly on the paper. Eighty absurd questions, generated snack maths and suspicious doodles.</p></div></article><article><span>02</span><div><strong>Career + three challenges</strong><p>Progress through school days, beat the 60-second bell, survive three mistakes or try today’s class.</p></div></article><article><span>03</span><div><strong>Your classroom</strong><p>Spend earned coins on colours, desks, pens, books and a hamster. Big iPad ink controls and saved unfinished drawings.</p></div></article>'
        :f.id==='wobblebay'
        ?'<article><span>01</span><div><strong>Your physics playground</strong><p>Explore a real 3D island. Grab cargo, throw a ball, tumble in a ragdoll and drive, sail or fly.</p></div></article><article><span>02</span><div><strong>Eight ways to earn</strong><p>Deliver parcels and pizzas, drive fares, recycle, build, fish, rally and rescue a castaway.</p></div></article><article><span>03</span><div><strong>A life of your own</strong><p>Buy hats, vehicles, homes and a dog. Saved progress, sixteen golden stars and large iPad controls.</p></div></article>'
        :f.id==='deadwave'
        ?'<article><span>01</span><div><strong>Endless waves</strong><p>Survive the pressure, then pick exactly one of three upgrade cards.</p></div></article><article><span>02</span><div><strong>19 zombie breeds, 8 bosses</strong><p>Shielded husks, grave divers and storm revenants join bosses with distinct attacks and escalating phases.</p></div></article><article><span>03</span><div><strong>13 weapons, 136 cards</strong><p>Build around flame, ice, lightning, homing plasma and piercing beams. Browse every weapon and card in the field guide.</p></div></article>'
        :f.id==='blockblast'
          ?'<article><span>01</span><div><strong>Three pieces</strong><p>Place the full tray before the next three pieces arrive.</p></div></article><article><span>02</span><div><strong>Clear the grid</strong><p>Complete any full row or column to open space and build your combo.</p></div></article><article><span>03</span><div><strong>Tiny by design</strong><p>No soundtrack or framework download. It starts almost immediately.</p></div></article>'
          :f.id==='crumbclicker'
            ?'<article><span>01</span><div><strong>Build the bakery</strong><p>Tap for your first biscuits, then buy eleven production tiers that bake automatically.</p></div></article><article><span>02</span><div><strong>Keep scaling</strong><p>Unlock upgrades, achievements, bulk buying and rare Lucky Crumbs as production climbs.</p></div></article><article><span>03</span><div><strong>Leave and return</strong><p>Offline earnings and permanent Bakery Stars make every return stronger than the last.</p></div></article>'
            :f.id==='pvz'
              ?'<article><span>01</span><div><strong>Five worlds, fifty stages</strong><p>Day, Night, Pool, Fog and Roof keep their own planting rules and Adventure gimmicks.</p></div></article><article><span>02</span><div><strong>Forty-nine plants</strong><p>Campaign rewards and shop purchases determine which plants you own and can bring into battle.</p></div></article><article><span>03</span><div><strong>Endless after Wall-nut Bowling</strong><p>Beat 1-5 to unlock Endless. Day and Night swap every three minutes; music changes randomly with each shift.</p></div></article>'
              :f.id==='flappy'
                ?'<article><span>01</span><div><strong>Smooth, fair flight</strong><p>Tap, click, Space or Arrow Up. Consistent physics, matching pipe collisions and bounded gaps keep each flight fair.</p></div></article><article><span>02</span><div><strong>Classic + checkpoint practice</strong><p>Chase medals and a Classic best, or retry each gap in Practice. Five bird colours unlock through Classic scores.</p></div></article><article><span>03</span><div><strong>Three skies, your soundtrack</strong><p>Morning, sunset and moonlight fade in as you progress. The supplied Main Theme loops during play; effects mute separately.</p></div></article>'
                :f.id==='apexrush'
                  ?'<article><span>01</span><div><strong>Contact has consequences</strong><p>Cars trade momentum, spin and take visible damage. Drift, brake and use limited nitro to stay competitive.</p></div></article><article><span>02</span><div><strong>Your circuit, your grid</strong><p>Five maps, four AI levels, one to eight laps, dry or wet roads, custom paint and Random options.</p></div></article><article><span>03</span><div><strong>Race the real lap</strong><p>A live map, standings and twelve sectors per lap keep every race honest. Your uploaded Racing soundtrack installs with the game.</p></div></article>'
                :f.id==='penguinpull'
                  ?'<article><span>01</span><div><strong>Pulls have weight</strong><p>Lower penguins resist more, partial pulls keep partial support, and slow recovery can save a dangerous tower.</p></div></article><article><span>02</span><div><strong>Loose things collide</strong><p>Released penguins bounce off ice, bump the remaining stack and can turn a clean rescue into a cascade.</p></div></article><article><span>03</span><div><strong>Endless random stages</strong><p>Every splash counts. Clear twenty penguins, keep your score, and sail into one of six different stage themes.</p></div></article>'
                  :'<article><span>01</span><div><strong>Classic rules</strong><p>Apple, walls, your own tail. Nothing extra unless you put it there.</p></div></article><article><span>02</span><div><strong>Built for iPad</strong><p>Swipe controls, touch D-pad, keyboard support and responsive rendering.</p></div></article><article><span>03</span><div><strong>Actually installed</strong><p>The game, icon and soundtrack consume real space on PocketVM’s 1 GB drive.</p></div></article>';
      page.innerHTML=`<section class="store-hero store-featured" data-feature-kind="${f.id}" data-tone="${ctx.escapeHTML(v.tone)}"><div class="store-hero-copy"><div class="store-feature-label"><span class="live-dot"></span><span>${ctx.escapeHTML(v.kicker)}</span><em>${f.id==='snake'?'Featured game':'New in Store'}</em></div><h1>${ctx.escapeHTML(v.title)}</h1><p>${ctx.escapeHTML(v.copy)}</p><div class="store-scoreline"><div><strong>${ctx.escapeHTML(f.name)}</strong><span>${ctx.escapeHTML(f.category)}</span></div><i></i><div><strong>${ctx.escapeHTML(control)}</strong><span>Controls</span></div><i></i><div><strong>Offline</strong><span>After install</span></div></div><div class="store-actions"><button class="store-primary store-main-cta" data-feature-main>${f.installed?'▶ Play '+ctx.escapeHTML(f.name):'↓ Install '+ctx.escapeHTML(f.name)}</button>${f.installed?`<button class="store-secondary" data-feature-pin>${f.pinned?'Remove from desktop':'Add to desktop'}</button>`:''}</div><div class="store-progress" data-store-progress hidden><i></i><span></span></div><div class="store-install-note"><span>${f.installed?'Installed locally':formatBytes(f.size)+' download'}</span><span>•</span><span>${stats?formatBytes(stats.free)+' free on drive':'Local install'}</span></div></div><div class="store-hero-visual"><div class="store-feature-chip">POCKETVM ORIGINAL</div>${visual}<img src="${ctx.escapeHTML(f.icon)}" alt=""><div class="store-icon-glow"></div></div></section>
      <section class="store-feature-grid">${features}</section>
      <section class="store-section"><div class="store-section-head"><div><span>GAME LIBRARY</span><h2>Available now</h2></div><small>9 titles</small></div>
      ${[f,...others].map(g=>`<article class="store-game-row store-game-row-rich"><img src="${ctx.escapeHTML(g.icon)}" alt=""><div><strong>${ctx.escapeHTML(g.name)}</strong><span>${ctx.escapeHTML(g.summary)}</span><small>${g.installed?'Installed and ready':'Local virtual-drive install'}</small></div><em>${g.installed?'Installed':formatBytes(g.size)}</em><button data-store-game="${g.id}">${g.installed?'Play':'Get'}</button></article>`).join('')}</section>`;
      const main=ctx.queryOne('[data-feature-main]',page),progress=ctx.queryOne('[data-store-progress]',page),pinBtn=ctx.queryOne('[data-feature-pin]',page);
      main.addEventListener('click',()=>runAction(f.id,main,progress));
      pinBtn?.addEventListener('click',async()=>{await f.pin(!f.pinned);await renderHome();});
      ctx.queryAll('[data-store-game]',page).forEach(btn=>btn.addEventListener('click',()=>runAction(btn.dataset.storeGame,btn,null)));
    }

    async function renderLibrary(){
      const states=await Promise.all(featureIds.map(gameState)),installed=states.filter(g=>g.installed);
      if(!installed.length){page.innerHTML='<section class="store-library-empty"><div>◇</div><h2>Your library is empty</h2><p>Install a game from Home and it will appear here.</p><button class="store-primary" data-library-home>Browse Store</button></section>';ctx.queryOne('[data-library-home]',page).addEventListener('click',()=>{active='home';render();});return;}
      page.innerHTML=`<section class="store-library"><div class="store-section-head"><div><span>YOUR GAMES</span><h2>Library</h2></div><small>${installed.length} installed</small></div>${installed.map(g=>`<article class="library-card"><img src="${ctx.escapeHTML(g.icon)}" alt=""><div class="library-copy"><strong>${ctx.escapeHTML(g.name)}</strong><span>${ctx.escapeHTML(g.category)} · ${formatBytes(g.size)}</span><small>Installed in Downloads/${ctx.escapeHTML(g.name)}</small></div><div class="library-actions"><button class="store-primary" data-lib-play="${g.id}">Play</button><button class="store-secondary" data-lib-pin="${g.id}">${g.pinned?'Remove from desktop':'Add to desktop'}</button><button class="store-danger" data-lib-uninstall="${g.id}">Uninstall</button></div></article>`).join('')}</section>`;
      ctx.queryAll('[data-lib-play]',page).forEach(b=>b.addEventListener('click',async()=>{const g=await gameState(b.dataset.libPlay);ctx.openApp(g.app);}));
      ctx.queryAll('[data-lib-pin]',page).forEach(b=>b.addEventListener('click',async()=>{const g=await gameState(b.dataset.libPin);await g.pin(!g.pinned);await renderLibrary();}));
      ctx.queryAll('[data-lib-uninstall]',page).forEach(b=>b.addEventListener('click',async()=>{const g=await gameState(b.dataset.libUninstall);if(!confirm('Uninstall '+g.name+' and delete its downloaded files?'))return;b.disabled=true;b.textContent='Uninstalling…';try{await g.uninstall();await refreshDrive();await renderLibrary();}catch(err){alert(err?.message||'Could not uninstall '+g.name+'.');b.disabled=false;b.textContent='Uninstall';}}));
    }

    async function render(){ctx.queryAll('[data-store-tab]',win.el).forEach(b=>b.classList.toggle('active',b.dataset.storeTab===active));if(active==='library')await renderLibrary();else await renderHome();await refreshDrive();}
    ctx.queryAll('[data-store-tab]',win.el).forEach(button=>button.addEventListener('click',()=>{active=button.dataset.storeTab;render();}));
    const featureTimer=setInterval(()=>{if(active!=='home')return;featured=featureIds[(featureIds.indexOf(featured)+1)%featureIds.length];variant=Math.floor(Math.random()*4);renderHome();},FEATURE_ROTATE_MS);
    const diskListener=event=>{const path=String(event.detail?.path||'');if(!path.startsWith(ROOT)&&!path.startsWith(DEADWAVE_ROOT)&&!path.startsWith(BLOCKBLAST_ROOT)&&!path.startsWith(CRUMBCLICKER_ROOT)&&!path.startsWith(PVZ_ROOT)&&!path.startsWith(FLAPPY_ROOT)&&!path.startsWith(PENGUIN_ROOT)&&!path.startsWith(APEX_ROOT)&&!path.startsWith(WOBBLE_ROOT)&&!path.startsWith(GRADE_ROOT))return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>{syncShell();syncDeadwaveShell();syncBlockBlastShell();syncCrumbClickerShell();syncPvzShell();syncFlappyShell();syncPenguinShell();syncApexShell();syncWobbleShell();syncGradeShell();render();},80);};
    window.addEventListener('pocketdiskchange',diskListener);
    win.cleanup=()=>{clearInterval(featureTimer);window.removeEventListener('pocketdiskchange',diskListener);};
    await render();
  }

  async function buildSnake(win, options = {}, ctx) {
    shellCtx = ctx;
    if (!await isInstalled()) {
      ctx.setWindowTitle(win, 'Snake', '🐍');
      win.content.innerHTML = `<div class="store-not-installed"><div>🐍</div><h2>Snake isn't installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>`;
      ctx.queryOne('button', win.content).addEventListener('click', () => ctx.openApp('store'));
      return;
    }

    const id = await identity();
    ctx.setWindowTitle(win, id.name, '🐍');
    applyWindowIcon(win, id.icon, ctx);
    win.content.innerHTML = `<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Starting ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts" allow="autoplay"></iframe></div>`;
    const frame = ctx.queryOne('iframe', win.content);
    const loading = ctx.queryOne('.store-game-loading', win.content);

    try {
      const [html, musicBlob, mods] = await Promise.all([
        PocketDisk.readText(ROOT + '/game.html'),
        PocketDisk.readBlob(ROOT + '/music.ogg'),
        installedMods()
      ]);
      const musicData = await blobToDataURL(musicBlob);
      const save = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch { return {}; } })();
      const bootstrap = '<script>window.__POCKETVM_MUSIC=' + JSON.stringify(musicData) + ';window.__POCKETVM_SAVE=' + JSON.stringify(save) + ';window.__POCKETVM_MODS=' + JSON.stringify(mods) + ';</' + 'script>';
      const srcdoc = /<head[^>]*>/i.test(html) ? html.replace(/<head([^>]*)>/i, '<head$1>' + bootstrap) : bootstrap + html;
      frame.srcdoc = gameFavicons(srcdoc,'snake');
    } catch (err) {
      loading.innerHTML = `<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(err?.message || 'The installed files could not be read.')}</small>`;
      return;
    }

    const onMessage = event => {
      if (event.source !== frame.contentWindow || !event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'pocketvm-snake-ready') loading.classList.add('done');
      if (event.data.type === 'pocketvm-snake-save') {
        const data = event.data.data || {};
        const safe = { highScore:Math.max(0,Math.floor(Number(data.highScore)||0)), music:data.music !== false, sfx:data.sfx !== false };
        localStorage.setItem(SAVE_KEY, JSON.stringify(safe));
      }
    };
    window.addEventListener('message', onMessage);
    win.cleanup = () => window.removeEventListener('message', onMessage);
  }

  async function buildDeadwave(win, options = {}, ctx) {
    shellCtx=ctx;
    if(!await deadwaveInstalled()){
      ctx.setWindowTitle(win,'Deadwave','☣');
      win.content.innerHTML='<div class="store-not-installed"><div>☣</div><h2>Deadwave isn\'t installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>';
      ctx.queryOne('button',win.content).addEventListener('click',()=>ctx.openApp('store')); return;
    }
    const id=await deadwaveIdentity();ctx.setWindowTitle(win,id.name,'☣');applyWindowIcon(win,id.icon,ctx);
    win.content.innerHTML=`<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Starting ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts" allow="autoplay"></iframe></div>`;
    const frame=ctx.queryOne('iframe',win.content),loading=ctx.queryOne('.store-game-loading',win.content);
    try{
      const [html,musicBlob,skins,mods]=await Promise.all([loadDeadwaveGameHTML(),PocketDisk.readBlob(DEADWAVE_ROOT+'/music.mp3'),installedDeadwaveSkins(),installedDeadwaveMods()]);
      const musicData=await blobToDataURL(musicBlob);
      const save=(()=>{try{return JSON.parse(localStorage.getItem(DEADWAVE_SAVE_KEY)||'{}')||{};}catch{return{};}})();
      const bootstrap='<script>window.__POCKETVM_MUSIC='+JSON.stringify(musicData)+';window.__POCKETVM_SAVE='+JSON.stringify(save)+';window.__POCKETVM_SKINS='+JSON.stringify(skins)+';window.__POCKETVM_MODS='+JSON.stringify(mods)+';</'+'script>';
      frame.srcdoc=gameFavicons(/<head[^>]*>/i.test(html)?html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap):bootstrap+html,'deadwave');
    }catch(err){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(err?.message||'The installed files could not be read.')}</small>`;return;}
    const onMessage=event=>{if(event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;if(event.data.type==='pocketvm-deadwave-ready')loading.classList.add('done');if(event.data.type==='pocketvm-deadwave-save'){const d=event.data.data||{},safe={bestWave:Math.max(0,Math.floor(Number(d.bestWave)||0)),bestKills:Math.max(0,Math.floor(Number(d.bestKills)||0)),music:d.music!==false,sfx:d.sfx!==false,skin:String(d.skin||'default').slice(0,40),autoBot:d.autoBot===true};localStorage.setItem(DEADWAVE_SAVE_KEY,JSON.stringify(safe));}};
    window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }

  async function buildBlockBlast(win, options = {}, ctx) {
    shellCtx=ctx;
    if(!await blockBlastInstalled()){
      ctx.setWindowTitle(win,'Block Blast','▦');
      win.content.innerHTML='<div class="store-not-installed"><div>▦</div><h2>Block Blast isn\'t installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>';
      ctx.queryOne('button',win.content).addEventListener('click',()=>ctx.openApp('store'));return;
    }
    const id=await blockBlastIdentity();ctx.setWindowTitle(win,id.name,'▦');applyWindowIcon(win,id.icon,ctx);
    win.content.innerHTML=`<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Starting ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts"></iframe></div>`;
    const frame=ctx.queryOne('iframe',win.content),loading=ctx.queryOne('.store-game-loading',win.content);
    try{
      const [html,mods]=await Promise.all([PocketDisk.readText(BLOCKBLAST_ROOT+'/game.html'),installedBlockBlastMods()]);
      const save=(()=>{try{return JSON.parse(localStorage.getItem(BLOCKBLAST_SAVE_KEY)||'{}')||{};}catch{return{};}})();
      const bootstrap='<script>window.__POCKETVM_SAVE='+JSON.stringify(save)+';window.__POCKETVM_MODS='+JSON.stringify(mods)+';</'+'script>';
      frame.srcdoc=gameFavicons(/<head[^>]*>/i.test(html)?html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap):bootstrap+html,'blockblast');
    }catch(err){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(err?.message||'The installed files could not be read.')}</small>`;return;}
    const onMessage=event=>{if(event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;if(event.data.type==='pocketvm-blockblast-ready')loading.classList.add('done');if(event.data.type==='pocketvm-blockblast-save'){const d=event.data.data||{},safe={best:Math.max(0,Math.floor(Number(d.best)||0)),theme:String(d.theme||'default').slice(0,20)};localStorage.setItem(BLOCKBLAST_SAVE_KEY,JSON.stringify(safe));}};
    window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }


  function sanitizeCrumbClickerSave(d){const n=v=>Math.min(1e300,Math.max(0,Number(v)||0)),buildings={};for(const id of CRUMBCLICKER_BUILDING_IDS)buildings[id]=Math.min(10000000,Math.floor(n(d?.buildings?.[id])));return{biscuits:n(d?.biscuits),runBaked:n(d?.runBaked),allTime:n(d?.allTime),clicks:n(d?.clicks),buildings,upgrades:Array.isArray(d?.upgrades)?d.upgrades.filter(x=>typeof x==='string').slice(0,100):[],achievements:Array.isArray(d?.achievements)?d.achievements.filter(x=>typeof x==='string').slice(0,100):[],stars:Math.min(1000000,Math.floor(n(d?.stars))),lucky:Math.min(1e9,Math.floor(n(d?.lucky))),music:d?.music!==false,sfx:d?.sfx!==false,hyperOn:d?.hyperOn===true,lastSeen:n(d?.lastSeen)||Date.now(),startedAt:n(d?.startedAt)||Date.now()};}
  async function buildCrumbClicker(win,options={},ctx){
    shellCtx=ctx;
    if(!await crumbClickerInstalled()){
      ctx.setWindowTitle(win,'Crumb Clicker','◉');
      win.content.innerHTML='<div class="store-not-installed"><div>◉</div><h2>Crumb Clicker isn\'t installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>';
      ctx.queryOne('button',win.content).addEventListener('click',()=>ctx.openApp('store'));return;
    }
    const [id,mods]=await Promise.all([crumbClickerIdentity(),installedCrumbClickerMods()]);
    ctx.setWindowTitle(win,id.name,mods.candy?'🍬':'◉');applyWindowIcon(win,id.icon,ctx);
    win.content.innerHTML=`<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Opening ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts" allow="autoplay"></iframe></div>`;
    const frame=ctx.queryOne('iframe',win.content),loading=ctx.queryOne('.store-game-loading',win.content);
    try{
      const raw=await loadCrumbClickerGameHTML(),html=applyCrumbClickerModsToHTML(raw,mods),save=(()=>{try{return sanitizeCrumbClickerSave(JSON.parse(localStorage.getItem(CRUMBCLICKER_SAVE_KEY)||'{}')||{});}catch{return sanitizeCrumbClickerSave({});}})(),bootstrap='<script>window.__POCKETVM_SAVE='+JSON.stringify(save)+';window.__POCKETVM_MODS='+JSON.stringify(mods)+';</'+'script>';
      frame.srcdoc=gameFavicons(/<head[^>]*>/i.test(html)?html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap):bootstrap+html,mods.candy?'candyclicker':'crumbclicker');
    }catch(err){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(err?.message||'The installed files could not be read.')}</small>`;return;}
    const onMessage=event=>{if(event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;if(event.data.type==='pocketvm-crumbclicker-ready')loading.classList.add('done');if(event.data.type==='pocketvm-crumbclicker-save')localStorage.setItem(CRUMBCLICKER_SAVE_KEY,JSON.stringify(sanitizeCrumbClickerSave(event.data.data||{})));};
    window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }
  async function buildPvz(win,options={},ctx){
    shellCtx=ctx;if(!await pvzInstalled()){ctx.setWindowTitle(win,'Plants vs Zombies','🌻');win.content.innerHTML='<div class="store-not-installed"><div>🌻</div><h2>Plants vs Zombies isn\'t installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>';ctx.queryOne('button',win.content).addEventListener('click',()=>ctx.openApp('store'));return;}
    const id=await pvzIdentity();ctx.setWindowTitle(win,id.name,'🌻');applyWindowIcon(win,id.icon,ctx);win.content.innerHTML=`<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Opening ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts" allow="autoplay"></iframe></div>`;
    const frame=ctx.queryOne('iframe',win.content),loading=ctx.queryOne('.store-game-loading',win.content);
    try{const [html,...musicBlobs]=await Promise.all([loadPvzGameHTML(),...PVZ_TRACKS.map(file=>PocketDisk.readBlob(PVZ_ROOT+'/'+file.name))]),trackPairs=await Promise.all(musicBlobs.map(async(blob,i)=>[PVZ_TRACKS[i].id,await blobToDataURL(blob)])),tracks=Object.fromEntries(trackPairs),save=(()=>{try{return sanitizePvzSave(JSON.parse(localStorage.getItem(PVZ_SAVE_KEY)||'{}')||{});}catch{return sanitizePvzSave({});}})(),bootstrap='<script>window.__POCKETVM_TRACKS='+JSON.stringify(tracks)+';window.__POCKETVM_SAVE='+JSON.stringify(save)+';</'+'script>';frame.srcdoc=gameFavicons(/<head[^>]*>/i.test(html)?html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap):bootstrap+html,'pvz');}catch(err){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(err?.message||'The installed files could not be read.')}</small>`;return;}
    const onMessage=event=>{if(event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;if(event.data.type==='pocketvm-pvz-ready')loading.classList.add('done');if(event.data.type==='pocketvm-pvz-save')localStorage.setItem(PVZ_SAVE_KEY,JSON.stringify(sanitizePvzSave(event.data.data||{})));};window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }


  async function buildApex(win,options={},ctx){
    shellCtx=ctx;if(!await apexInstalled()){ctx.setWindowTitle(win,'Apex Rush','🏎');win.content.innerHTML='<div class="store-not-installed"><div>🏎</div><h2>Apex Rush isn\'t installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>';ctx.queryOne('button',win.content).addEventListener('click',()=>ctx.openApp('store'));return;}
    const id=await apexIdentity();ctx.setWindowTitle(win,id.name,'🏎');applyWindowIcon(win,id.icon,ctx);win.content.innerHTML=`<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Opening ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts" allow="autoplay"></iframe></div>`;
    const frame=ctx.queryOne('iframe',win.content),loading=ctx.queryOne('.store-game-loading',win.content);
    try{const html=await loadApexGameHTML();let music=APEX_MUSIC.urls[0];try{const musicBlob=await PocketDisk.readBlob(APEX_ROOT+'/music.mp3');music=await blobToDataURL(musicBlob);}catch{}const save=(()=>{try{return sanitizeApexSave(JSON.parse(localStorage.getItem(APEX_SAVE_KEY)||'{}')||{});}catch{return sanitizeApexSave({});}})(),bootstrap='<script>window.__POCKETVM_MUSIC='+JSON.stringify(music)+';window.__POCKETVM_SAVE='+JSON.stringify(save)+';</'+'script>';frame.srcdoc=gameFavicons(/<head[^>]*>/i.test(html)?html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap):bootstrap+html,'apexrush');}catch(err){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(err?.message||'The installed files could not be read.')}</small>`;return;}
    const onMessage=event=>{if(event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;if(event.data.type==='pocketvm-apex-ready')loading.classList.add('done');if(event.data.type==='pocketvm-apex-save')localStorage.setItem(APEX_SAVE_KEY,JSON.stringify(sanitizeApexSave(event.data.data||{})));};window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }

  async function buildFlappy(win,options={},ctx){
    shellCtx=ctx;if(!await flappyInstalled()){ctx.setWindowTitle(win,'Flappy Bird','🐦');win.content.innerHTML='<div class="store-not-installed"><div>🐦</div><h2>Flappy Bird isn\'t installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>';ctx.queryOne('button',win.content).addEventListener('click',()=>ctx.openApp('store'));return;}
    const id=await flappyIdentity();ctx.setWindowTitle(win,id.name,'🐦');applyWindowIcon(win,id.icon,ctx);win.content.innerHTML=`<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Opening ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts" allow="autoplay"></iframe></div>`;
    const frame=ctx.queryOne('iframe',win.content),loading=ctx.queryOne('.store-game-loading',win.content);
    try{const html=await loadFlappyGameHTML();let music=FLAPPY_MUSIC.urls[0];try{const musicBlob=await PocketDisk.readBlob(FLAPPY_ROOT+'/music.mp3');music=await blobToDataURL(musicBlob);}catch{}const save=(()=>{try{return sanitizeFlappySave(JSON.parse(localStorage.getItem(FLAPPY_SAVE_KEY)||'{}')||{});}catch{return sanitizeFlappySave({});}})(),bootstrap='<script>window.__POCKETVM_MUSIC='+JSON.stringify(music)+';window.__POCKETVM_SAVE='+JSON.stringify(save)+';</'+'script>';frame.srcdoc=gameFavicons(/<head[^>]*>/i.test(html)?html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap):bootstrap+html,'flappy');}catch(err){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(err?.message||'The installed files could not be read.')}</small>`;return;}
    const onMessage=event=>{if(event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;if(event.data.type==='pocketvm-flappy-ready')loading.classList.add('done');if(event.data.type==='pocketvm-flappy-save')localStorage.setItem(FLAPPY_SAVE_KEY,JSON.stringify(sanitizeFlappySave(event.data.data||{})));};window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }

  async function buildPenguin(win,options={},ctx){
    shellCtx=ctx;if(!await penguinInstalled()){ctx.setWindowTitle(win,'Penguin Pull','🐧');win.content.innerHTML='<div class="store-not-installed"><div>🐧</div><h2>Penguin Pull isn\'t installed</h2><p>Get it from the PocketVM Store first.</p><button class="store-primary">Open Store</button></div>';ctx.queryOne('button',win.content).addEventListener('click',()=>ctx.openApp('store'));return;}
    const id=await penguinIdentity();ctx.setWindowTitle(win,id.name,'🐧');applyWindowIcon(win,id.icon,ctx);win.content.innerHTML=`<div class="store-game-host"><div class="store-game-loading"><span></span><strong>Opening ${ctx.escapeHTML(id.name)}…</strong></div><iframe title="${ctx.escapeHTML(id.name)}" sandbox="allow-scripts"></iframe></div>`;
    const frame=ctx.queryOne('iframe',win.content),loading=ctx.queryOne('.store-game-loading',win.content);
    try{const html=await loadPenguinGameHTML(),save=(()=>{try{return sanitizePenguinSave(JSON.parse(localStorage.getItem(PENGUIN_SAVE_KEY)||'{}')||{});}catch{return sanitizePenguinSave({});}})(),bootstrap='<script>window.__POCKETVM_SAVE='+JSON.stringify(save)+';<'+'/script>';frame.srcdoc=gameFavicons(/<head[^>]*>/i.test(html)?html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap):bootstrap+html,'penguinpull');}catch(err){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(err?.message||'The installed files could not be read.')}</small>`;return;}
    const onMessage=event=>{if(event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;if(event.data.type==='pocketvm-penguin-ready')loading.classList.add('done');if(event.data.type==='pocketvm-penguin-save')localStorage.setItem(PENGUIN_SAVE_KEY,JSON.stringify(sanitizePenguinSave(event.data.data||{})));};window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }

  function init(ctx) {
    shellCtx=ctx;
    syncShell(ctx).catch(()=>{}); syncDeadwaveShell(ctx).catch(()=>{}); syncBlockBlastShell(ctx).catch(()=>{}); syncCrumbClickerShell(ctx).catch(()=>{}); syncPvzShell(ctx).catch(()=>{}); syncFlappyShell(ctx).catch(()=>{}); syncPenguinShell(ctx).catch(()=>{});syncApexShell(ctx).catch(()=>{});syncWobbleShell(ctx).catch(()=>{});syncGradeShell(ctx).catch(()=>{});
    window.addEventListener('pocketdiskchange',event=>{
      const path=String(event.detail?.path||'');
      if(path&&!path.startsWith(ROOT)&&!path.startsWith(DEADWAVE_ROOT)&&!path.startsWith(BLOCKBLAST_ROOT)&&!path.startsWith(CRUMBCLICKER_ROOT)&&!path.startsWith(PVZ_ROOT)&&!path.startsWith(FLAPPY_ROOT)&&!path.startsWith(PENGUIN_ROOT)&&!path.startsWith(APEX_ROOT)&&!path.startsWith(WOBBLE_ROOT)&&!path.startsWith(GRADE_ROOT))return;
      clearTimeout(syncTimer);
      syncTimer=setTimeout(()=>{syncShell(ctx).catch(()=>{});syncDeadwaveShell(ctx).catch(()=>{});syncBlockBlastShell(ctx).catch(()=>{});syncCrumbClickerShell(ctx).catch(()=>{});syncPvzShell(ctx).catch(()=>{});syncFlappyShell(ctx).catch(()=>{});syncPenguinShell(ctx).catch(()=>{});syncApexShell(ctx).catch(()=>{});syncWobbleShell(ctx).catch(()=>{});syncGradeShell(ctx).catch(()=>{});},90);
    });
  }

  window.PocketStoreApp = Object.freeze({ init, syncShell, syncDeadwaveShell, syncBlockBlastShell, syncCrumbClickerShell, syncPvzShell, syncFlappyShell, syncPenguinShell, syncApexShell, syncWobbleShell, syncGradeShell, buildGrade, gradeInstalled, installGrade, uninstallGrade, toggleGradePin, buildWobble, wobbleInstalled, installWobble, uninstallWobble, toggleWobblePin, buildStore, buildSnake, buildDeadwave, buildBlockBlast, buildCrumbClicker, buildPvz, buildFlappy, buildPenguin, buildApex, isInstalled, deadwaveInstalled, blockBlastInstalled, crumbClickerInstalled, pvzInstalled, flappyInstalled, penguinInstalled, apexInstalled, installSnake, installDeadwave, installBlockBlast, installCrumbClicker, installPvz, installFlappy, installPenguin, installApex, uninstallSnake, uninstallDeadwave, uninstallBlockBlast, uninstallCrumbClicker, uninstallPvz, uninstallFlappy, uninstallPenguin, uninstallApex, toggleDesktopPin, toggleDeadwavePin, toggleBlockBlastPin, toggleCrumbClickerPin, togglePvzPin, toggleFlappyPin, togglePenguinPin, toggleApexPin, modsPage, handleModAction, installedMods, installedDeadwaveMods, installedDeadwaveSkins, installedBlockBlastMods, installedCrumbClickerMods });
})();
