(() => {
  'use strict';

  const GAME_ID = 'snake';
  const ROOT = '/home/user/Downloads/Snake';
  const SOURCE = './store/snake/';
  const PIN_KEY = 'pocketvm.store.snake.desktop';
  const SAVE_KEY = 'pocketvm.game.snake';
  const PACKAGE = [
    { name:'game.html', url:SOURCE + 'game.html', mime:'text/html', size:20779 },
    { name:'music.ogg', url:'https://raw.githubusercontent.com/Anubhav9/Yellow-Olive/main/media/resources/music_files/sakura_harbour_prologue_end.ogg', mime:'audio/ogg', size:1724097 }
  ];
  const DEFAULT_ICON_URL = SOURCE + 'icon.svg';
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
  const DEADWAVE_PIN_KEY = 'pocketvm.store.deadwave.desktop';
  const DEADWAVE_SAVE_KEY = 'pocketvm.game.deadwave';
  const DEADWAVE_NAME = 'Deadwave';
  const DEADWAVE_NAME_FILE = 'name.txt';
  const DEADWAVE_ICON_URL = DEADWAVE_SOURCE + 'icon.svg';
  const DEADWAVE_ICON_ESTIMATE = 48000;
  const DEADWAVE_PACKAGE = [
    { name:'game.html', url:DEADWAVE_SOURCE + 'game.html', mime:'text/html', size:58908 },
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
    {kicker:'FEATURED',title:'Twenty-five seconds. Then choose.',copy:'Survive each wave and pick one of three permanent upgrades before the next crowd arrives.',tone:'violet'},
    {kicker:'ENDLESS',title:'How broken can your build get?',copy:'Stack multishot, crits, pierce, armour, regen and more while twelve zombie types pile into the arena.',tone:'toxic'},
    {kicker:'BUILT FOR TOUCH',title:'One thumb. A lot of zombies.',copy:'Virtual joystick movement with automatic targeting and firing, designed around iPad play.',tone:'night'}
  ];

  const BLOCKBLAST_ID = 'blockblast';
  const BLOCKBLAST_ROOT = '/home/user/Downloads/Block Blast';
  const BLOCKBLAST_SOURCE = './store/blockblast/';
  const BLOCKBLAST_PIN_KEY = 'pocketvm.store.blockblast.desktop';
  const BLOCKBLAST_SAVE_KEY = 'pocketvm.game.blockblast';
  const BLOCKBLAST_NAME = 'Block Blast';
  const BLOCKBLAST_NAME_FILE = 'name.txt';
  const BLOCKBLAST_ICON_URL = BLOCKBLAST_SOURCE + 'icon.svg';
  const BLOCKBLAST_ICON_ESTIMATE = 26000;
  const BLOCKBLAST_PACKAGE = [
    { name:'game.html', url:BLOCKBLAST_SOURCE + 'game.html', mime:'text/html', size:14523 }
  ];
  const BLOCKBLAST_TOTAL_BYTES = BLOCKBLAST_PACKAGE.reduce((n,file)=>n+file.size,0) + BLOCKBLAST_ICON_ESTIMATE + BLOCKBLAST_NAME.length;
  const blockBlastFeatureVariants = [
    {kicker:'NEW & TINY',title:'Make the board disappear.',copy:'Drop three pieces at a time, clear full rows and columns, and keep making room.',tone:'blocks'},
    {kicker:'QUICK PLAY',title:'One more piece.',copy:'Simple placement, satisfying clears and no loading screen. Built for quick iPad sessions.',tone:'blocks'},
    {kicker:'PUZZLE',title:'Eight by eight. No excuses.',copy:'Think ahead, protect your space and chase a bigger combo before the board locks up.',tone:'blocks'},
    {kicker:'UNDER 50 KB',title:'Tiny game. Dangerous time sink.',copy:'No soundtrack download, no framework and no filler — just the puzzle loop.',tone:'blocks'}
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

  async function identity() {
    let name = DEFAULT_NAME;
    let icon = DEFAULT_ICON_URL;
    if (await isInstalled()) {
      try { name = cleanDisplayName(await PocketDisk.readText(ROOT + '/' + NAME_FILE)); } catch {}
      try { icon = await blobToDataURL(await PocketDisk.readBlob(ROOT + '/icon.png')); } catch {}
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
      try { icon = await blobToDataURL(await PocketDisk.readBlob(DEADWAVE_ROOT + '/icon.png')); } catch {}
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
      try{icon=await blobToDataURL(await PocketDisk.readBlob(BLOCKBLAST_ROOT+'/icon.png'));}catch{}
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
    const snakeInstalled=await isInstalled().catch(()=>false),deadInstalled=await deadwaveInstalled().catch(()=>false);
    const snakeCards=[];
    for(const mod of Object.values(MODS)){
      const status=await modStatus(mod.id),state=status.installed?'Active':status.downloaded?'Ready to move':'Available';
      const button=status.installed||status.downloaded?'<button class="m-btn remove" data-action="uninstall-snake" data-id="'+mod.id+'">Remove</button>':'<button class="m-btn get" data-action="download-snake" data-id="'+mod.id+'">Download</button>';
      snakeCards.push('<article class="m-card"><div class="m-art snake-art">'+mod.icon+'</div><div class="m-copy"><div class="m-top"><div><small>SNAKE MOD</small><h3>'+mod.name+'</h3></div><em class="'+(status.installed?'active':status.downloaded?'ready':'')+'">'+state+'</em></div><p>'+mod.description+'</p><code>'+(status.installed?'Snake/':status.downloaded?'Downloads/':'')+mod.file+'</code></div><div>'+button+'</div></article>');
    }
    const deadwaveModCards=[];
    for(const mod of Object.values(DEADWAVE_MODS)){
      const status=await deadwaveModStatus(mod.id),state=status.installed?'Active':status.downloaded?'Ready to move':'Available';
      const button=status.installed||status.downloaded?'<button class="m-btn remove" data-action="uninstall-deadwave" data-id="'+mod.id+'">Remove</button>':'<button class="m-btn get" data-action="download-deadwave" data-id="'+mod.id+'">Download</button>';
      deadwaveModCards.push('<article class="m-card"><div class="m-art snake-art">AI</div><div class="m-copy"><div class="m-top"><div><small>DEADWAVE GAMEPLAY MOD</small><h3>'+mod.name+'</h3></div><em class="'+(status.installed?'active':status.downloaded?'ready':'')+'">'+state+'</em></div><p>'+mod.description+'</p><code>'+(status.installed?'Deadwave/':status.downloaded?'Downloads/':'')+mod.file+'</code></div><div>'+button+'</div></article>');
    }
    const skinCards=[];
    for(const pack of Object.values(DEADWAVE_SKIN_PACKS)){
      const status=await deadwaveSkinStatus(pack.id),state=status.installed?'Active':status.downloaded?'Ready to move':'Available';
      const swatches=pack.skins.map(x=>'<i style="background:'+x.body+'"></i>').join('');
      const button=status.installed||status.downloaded?'<button class="m-btn remove" data-action="uninstall-skin" data-id="'+pack.id+'">Remove</button>':'<button class="m-btn get" data-action="download-skin" data-id="'+pack.id+'">Download</button>';
      skinCards.push('<article class="m-card"><div class="m-art skin-art"><div>'+swatches+'</div><b>SKINS</b></div><div class="m-copy"><div class="m-top"><div><small>DEADWAVE SKIN PACK</small><h3>'+pack.name+'</h3></div><em class="'+(status.installed?'active':status.downloaded?'ready':'')+'">'+state+'</em></div><p>'+pack.tagline+' '+pack.skins.length+' cosmetic survivor skins. No stat changes.</p><code>'+(status.installed?'Deadwave/':status.downloaded?'Downloads/':'')+pack.file+'</code></div><div>'+button+'</div></article>');
    }
    const status=(ok,name)=>'<div class="game-status"><i class="'+(ok?'on':'')+'"></i><div><strong>'+name+'</strong><span>'+(ok?'Installed package detected':'Not installed')+'</span></div></div>';
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+
    '*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#06080b;color:#edf3f8;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body{padding:20px;background:radial-gradient(circle at 88% 0,rgba(255,55,75,.13),transparent 27%),radial-gradient(circle at 5% 100%,rgba(96,225,137,.07),transparent 30%),#06080b}.shell{max-width:980px;margin:auto}.route{height:38px;display:flex;align-items:center;gap:8px;padding:0 11px;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:rgba(255,255,255,.025)}.route i{width:7px;height:7px;border-radius:50%;background:#ff5365;box-shadow:0 0 13px #ff536577}.route code{font:9px ui-monospace,monospace;color:#778598}.route span{margin-left:auto;color:#465364;font:700 7px ui-monospace,monospace;letter-spacing:.14em}.hero{padding:30px 4px 22px}.hero small{color:#ff6072;font-size:8px;font-weight:900;letter-spacing:.18em}.hero h1{margin:6px 0;font-size:39px;letter-spacing:-.05em}.hero p{max-width:690px;margin:0;color:#7d8b9d;font-size:10px;line-height:1.65}.toolbar{display:flex;gap:7px;margin-bottom:16px}.game-status{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.018)}.game-status>i{width:7px;height:7px;border-radius:50%;background:#4e5968}.game-status>i.on{background:#67e18c;box-shadow:0 0 11px #67e18c66}.game-status div{display:flex;flex-direction:column}.game-status strong{font-size:8px}.game-status span{color:#586678;font-size:7px;margin-top:1px}.toolbar button{margin-left:auto;height:36px;padding:0 11px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(255,255,255,.04);color:#dce5ef;font-size:8px;font-weight:800}.section{margin-top:20px}.section-head{display:flex;justify-content:space-between;align-items:end;margin:0 3px 8px}.section-head div{display:flex;flex-direction:column}.section-head span{color:#536173;font-size:7px;font-weight:900;letter-spacing:.14em}.section-head h2{margin:3px 0 0;font-size:18px}.section-head small{color:#435061;font-size:7px}.list{display:grid;gap:8px}.m-card{display:grid;grid-template-columns:112px 1fr auto;gap:14px;align-items:center;padding:11px;border:1px solid rgba(255,255,255,.07);border-radius:15px;background:linear-gradient(145deg,rgba(255,255,255,.03),rgba(255,255,255,.012));box-shadow:0 16px 45px rgba(0,0,0,.13)}.m-art{height:88px;border:1px solid rgba(255,255,255,.06);border-radius:11px;background:#0b0f14;display:grid;place-items:center;overflow:hidden}.snake-art{font-size:31px;color:#ffd45c;background:radial-gradient(circle at 65% 25%,rgba(98,225,137,.12),transparent 45%),#0b100d}.skin-art{background:radial-gradient(circle at 70% 20%,rgba(126,105,255,.12),transparent 45%),#0a0d12}.skin-art>div{display:flex;gap:5px}.skin-art i{width:21px;height:36px;border-radius:7px;box-shadow:inset 0 1px rgba(255,255,255,.18)}.skin-art b{margin-top:-14px;color:#465466;font-size:7px;letter-spacing:.14em}.m-copy{min-width:0}.m-top{display:flex;justify-content:space-between;gap:10px}.m-top small{color:#526174;font-size:6.5px;font-weight:900;letter-spacing:.13em}.m-top h3{margin:3px 0 0;font-size:14px}.m-top em{height:22px;padding:0 7px;display:grid;place-items:center;border-radius:999px;background:rgba(255,255,255,.04);color:#667486;font-size:7px;font-style:normal;font-weight:800;white-space:nowrap}.m-top em.ready{color:#ddbd69;background:rgba(255,204,78,.07)}.m-top em.active{color:#78e49a;background:rgba(92,225,133,.08)}.m-copy p{margin:7px 0;color:#718094;font-size:8.5px;line-height:1.5}.m-copy code{color:#536174;font:7px ui-monospace,monospace}.m-btn{min-width:84px;height:34px;border-radius:9px;font-size:8px;font-weight:850}.m-btn.get{border:0;background:#edf3f9;color:#090c10}.m-btn.remove{border:1px solid rgba(255,88,103,.16);background:rgba(255,88,103,.055);color:#ff9aa5}.flow{margin-top:18px;padding:13px;border:1px dashed rgba(255,255,255,.075);border-radius:13px;color:#607083;font-size:8px;line-height:1.65}.flow strong{color:#aab6c4}.foot{margin:24px 0 6px;text-align:center;color:#343e4d;font:7px ui-monospace,monospace}@media(max-width:650px){body{padding:12px}.hero h1{font-size:32px}.toolbar{flex-wrap:wrap}.toolbar button{margin-left:0}.m-card{grid-template-columns:76px 1fr}.m-art{height:74px}.m-card>div:last-child{grid-column:2}.m-top{flex-direction:column}.m-top em{width:max-content}}</style></head><body><main class="shell"><div class="route"><i></i><code>pocket:mods</code><span>LOCAL PACKAGE LAB</span></div><section class="hero"><small>POCKETVM / MOD LAB</small><h1>Change what is installed.</h1><p>Mods are ordinary files on the virtual drive. Download one here, move the .pvmod file into its game folder, then relaunch the game. Deadwave supports its Auto Bot gameplay mod plus cosmetic skin packs.</p></section><div class="toolbar">'+status(snakeInstalled,'Snake')+status(deadInstalled,'Deadwave')+'<button data-action="open-files">Open Downloads</button></div><section class="section"><div class="section-head"><div><span>GAMEPLAY MODS</span><h2>Snake</h2></div><small>2 packages</small></div><div class="list">'+snakeCards.join('')+'</div></section><section class="section"><div class="section-head"><div><span>GAMEPLAY MOD</span><h2>Deadwave Auto Bot</h2></div><small>1 package</small></div><div class="list">'+deadwaveModCards.join('')+'</div></section><section class="section"><div class="section-head"><div><span>COSMETIC</span><h2>Deadwave skin packs</h2></div><small>3 packs · 9 skins</small></div><div class="list">'+skinCards.join('')+'</div></section><div class="flow"><strong>Install:</strong> Download → open Downloads → drag the .pvmod onto the matching game folder → relaunch the game. &nbsp; <strong>Remove:</strong> use Remove here or delete the .pvmod from the game folder in Files.</div><div class="foot">PocketVM local extension index · files stay in your browser</div></main><script>document.addEventListener("click",function(e){var b=e.target.closest("[data-action]");if(!b||b.disabled)return;b.disabled=true;parent.postMessage({type:"pocketvm-mods-action",action:b.dataset.action,id:b.dataset.id||""},"*")});<\/script></body></html>';
  }

  async function handleModAction(action, id) {
    if(action==='download-snake') await downloadMod(id);
    else if(action==='uninstall-snake') await uninstallMod(id);
    else if(action==='download-deadwave') await downloadDeadwaveMod(id);
    else if(action==='uninstall-deadwave') await uninstallDeadwaveMod(id);
    else if(action==='download-skin') await downloadDeadwaveSkin(id);
    else if(action==='uninstall-skin') await uninstallDeadwaveSkin(id);
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
    const featureIds=['snake','deadwave','blockblast'];let featured=featureIds[Math.floor(Math.random()*featureIds.length)];
    let variant=Math.floor(Math.random()*4),busy=false,progressState=null;
    win.content.innerHTML=`<div class="store-app"><header class="store-topbar"><div class="store-wordmark"><span>▣</span><div><strong>Store</strong><small>PocketVM games</small></div></div><nav class="store-tabs"><button data-store-tab="home">Home</button><button data-store-tab="library">Library</button></nav><div class="store-space"></div><div class="store-drive" data-store-drive>Checking storage…</div></header><main class="store-page" data-store-page></main></div>`;
    const page=ctx.queryOne('[data-store-page]',win.el),drive=ctx.queryOne('[data-store-drive]',win.el);

    async function refreshDrive(){try{const stats=await PocketDisk.stats();drive.textContent=formatBytes(stats.free)+' free';}catch{drive.textContent='Storage unavailable';}}
    async function gameState(id){
      if(id==='deadwave'){const installed=await deadwaveInstalled(),ident=await deadwaveIdentity();return{id,app:'deadwave',name:ident.name,icon:ident.icon,installed,pinned:deadwavePinned(),size:installed?await deadwaveBytes():DEADWAVE_TOTAL_BYTES,category:'Endless survival',summary:'Auto-fire arena survival · 3-card upgrades · 12 zombie types',install:installDeadwave,pin:toggleDeadwavePin,uninstall:uninstallDeadwave};}
      if(id==='blockblast'){const installed=await blockBlastInstalled(),ident=await blockBlastIdentity();return{id,app:'blockblast',name:ident.name,icon:ident.icon,installed,pinned:blockBlastPinned(),size:installed?await blockBlastBytes():BLOCKBLAST_TOTAL_BYTES,category:'Puzzle',summary:'8×8 block puzzle · Row & column clears · Tiny install',install:installBlockBlast,pin:toggleBlockBlastPin,uninstall:uninstallBlockBlast};}
      const installed=await isInstalled(),ident=await identity();return{id:'snake',app:'snake',name:ident.name,icon:ident.icon,installed,pinned:pinned(),size:installed?await installedBytes():TOTAL_BYTES,category:'Arcade',summary:'Classic Snake · Smooth touch controls · Original soundtrack',install:installSnake,pin:toggleDesktopPin,uninstall:uninstallSnake};
    }
    function featureCopy(id){const arr=id==='deadwave'?deadwaveFeatureVariants:id==='blockblast'?blockBlastFeatureVariants:featureVariants;return arr[variant%arr.length];}
    function deadwavePreview(){return '<div class="deadwave-preview"><div class="dw-grid"></div><i class="survivor"></i><b class="z z1"></b><b class="z z2"></b><b class="z z3"></b><b class="z z4"></b><b class="z z5"></b><span class="shot s1"></span><span class="shot s2"></span></div>';}
    function snakePreview(){return '<div class="store-game-preview"><div class="preview-grid"></div><b class="preview-apple"></b><i style="--px:36%;--py:64%"></i><i style="--px:44%;--py:64%"></i><i style="--px:52%;--py:64%"></i><i style="--px:60%;--py:64%"></i><i style="--px:60%;--py:50%" class="head"></i></div>';}
    function blockBlastPreview(){return '<div class="blockblast-preview"><div class="bb-mini-grid">'+Array.from({length:64},(_,i)=>'<i class="'+([10,11,12,18,26,34,42,50,51,52,53,54].includes(i)?'on b'+(i%4):'')+'"></i>').join('')+'</div><div class="bb-mini-pieces"><b></b><b></b><b></b></div></div>';}

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
      const control=f.id==='deadwave'?'Joystick + auto-fire':f.id==='blockblast'?'Drag + tap':'Touch + keys';
      const visual=f.id==='deadwave'?deadwavePreview():f.id==='blockblast'?blockBlastPreview():snakePreview();
      const features=f.id==='deadwave'
        ?'<article><span>01</span><div><strong>Endless waves</strong><p>Survive the pressure, then pick exactly one of three upgrade cards.</p></div></article><article><span>02</span><div><strong>Twelve zombie types</strong><p>Regular enemies and three rotating bosses keep later rounds changing.</p></div></article><article><span>03</span><div><strong>Built around touch</strong><p>A virtual joystick handles movement while your weapon automatically tracks targets.</p></div></article>'
        :f.id==='blockblast'
          ?'<article><span>01</span><div><strong>Three pieces</strong><p>Place the full tray before the next three pieces arrive.</p></div></article><article><span>02</span><div><strong>Clear the grid</strong><p>Complete any full row or column to open space and build your combo.</p></div></article><article><span>03</span><div><strong>Tiny by design</strong><p>No soundtrack or framework download. It starts almost immediately.</p></div></article>'
          :'<article><span>01</span><div><strong>Classic rules</strong><p>Apple, walls, your own tail. Nothing extra unless you put it there.</p></div></article><article><span>02</span><div><strong>Built for iPad</strong><p>Swipe controls, touch D-pad, keyboard support and responsive rendering.</p></div></article><article><span>03</span><div><strong>Actually installed</strong><p>The game, icon and soundtrack consume real space on PocketVM’s 1 GB drive.</p></div></article>';
      page.innerHTML=`<section class="store-hero store-featured" data-feature-kind="${f.id}" data-tone="${ctx.escapeHTML(v.tone)}"><div class="store-hero-copy"><div class="store-feature-label"><span class="live-dot"></span><span>${ctx.escapeHTML(v.kicker)}</span><em>${f.id==='snake'?'Featured game':'New in Store'}</em></div><h1>${ctx.escapeHTML(v.title)}</h1><p>${ctx.escapeHTML(v.copy)}</p><div class="store-scoreline"><div><strong>${ctx.escapeHTML(f.name)}</strong><span>${ctx.escapeHTML(f.category)}</span></div><i></i><div><strong>${ctx.escapeHTML(control)}</strong><span>Controls</span></div><i></i><div><strong>Offline</strong><span>After install</span></div></div><div class="store-actions"><button class="store-primary store-main-cta" data-feature-main>${f.installed?'▶ Play '+ctx.escapeHTML(f.name):'↓ Install '+ctx.escapeHTML(f.name)}</button>${f.installed?`<button class="store-secondary" data-feature-pin>${f.pinned?'Remove from desktop':'Add to desktop'}</button>`:''}</div><div class="store-progress" data-store-progress hidden><i></i><span></span></div><div class="store-install-note"><span>${f.installed?'Installed locally':formatBytes(f.size)+' download'}</span><span>•</span><span>${stats?formatBytes(stats.free)+' free on drive':'Local install'}</span></div></div><div class="store-hero-visual"><div class="store-feature-chip">POCKETVM ORIGINAL</div>${visual}<img src="${ctx.escapeHTML(f.icon)}" alt=""><div class="store-icon-glow"></div></div></section>
      <section class="store-feature-grid">${features}</section>
      <section class="store-section"><div class="store-section-head"><div><span>GAME LIBRARY</span><h2>Available now</h2></div><small>3 titles</small></div>
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
    const diskListener=event=>{const path=String(event.detail?.path||'');if(!path.startsWith(ROOT)&&!path.startsWith(DEADWAVE_ROOT)&&!path.startsWith(BLOCKBLAST_ROOT))return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>{syncShell();syncDeadwaveShell();syncBlockBlastShell();render();},80);};
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
      frame.srcdoc = srcdoc;
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
      const [html,musicBlob,skins,mods]=await Promise.all([PocketDisk.readText(DEADWAVE_ROOT+'/game.html'),PocketDisk.readBlob(DEADWAVE_ROOT+'/music.mp3'),installedDeadwaveSkins(),installedDeadwaveMods()]);
      const musicData=await blobToDataURL(musicBlob);
      const save=(()=>{try{return JSON.parse(localStorage.getItem(DEADWAVE_SAVE_KEY)||'{}')||{};}catch{return{};}})();
      const bootstrap='<script>window.__POCKETVM_MUSIC='+JSON.stringify(musicData)+';window.__POCKETVM_SAVE='+JSON.stringify(save)+';window.__POCKETVM_SKINS='+JSON.stringify(skins)+';window.__POCKETVM_MODS='+JSON.stringify(mods)+';</'+'script>';
      frame.srcdoc=/<head[^>]*>/i.test(html)?html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap):bootstrap+html;
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
      const html=await PocketDisk.readText(BLOCKBLAST_ROOT+'/game.html'),save=(()=>{try{return JSON.parse(localStorage.getItem(BLOCKBLAST_SAVE_KEY)||'{}')||{};}catch{return{};}})();
      const bootstrap='<script>window.__POCKETVM_SAVE='+JSON.stringify(save)+';</'+'script>';
      frame.srcdoc=/<head[^>]*>/i.test(html)?html.replace(/<head([^>]*)>/i,'<head$1>'+bootstrap):bootstrap+html;
    }catch(err){loading.innerHTML=`<strong>Could not start ${ctx.escapeHTML(id.name)}</strong><small>${ctx.escapeHTML(err?.message||'The installed files could not be read.')}</small>`;return;}
    const onMessage=event=>{if(event.source!==frame.contentWindow||!event.data||typeof event.data!=='object')return;if(event.data.type==='pocketvm-blockblast-ready')loading.classList.add('done');if(event.data.type==='pocketvm-blockblast-save'){const d=event.data.data||{},safe={best:Math.max(0,Math.floor(Number(d.best)||0))};localStorage.setItem(BLOCKBLAST_SAVE_KEY,JSON.stringify(safe));}};
    window.addEventListener('message',onMessage);win.cleanup=()=>window.removeEventListener('message',onMessage);
  }

  function init(ctx) {
    shellCtx=ctx;
    syncShell(ctx).catch(()=>{}); syncDeadwaveShell(ctx).catch(()=>{}); syncBlockBlastShell(ctx).catch(()=>{});
    window.addEventListener('pocketdiskchange',event=>{
      const path=String(event.detail?.path||'');
      if(path&&!path.startsWith(ROOT)&&!path.startsWith(DEADWAVE_ROOT)&&!path.startsWith(BLOCKBLAST_ROOT))return;
      clearTimeout(syncTimer);
      syncTimer=setTimeout(()=>{syncShell(ctx).catch(()=>{});syncDeadwaveShell(ctx).catch(()=>{});syncBlockBlastShell(ctx).catch(()=>{});},90);
    });
  }

  window.PocketStoreApp = Object.freeze({ init, syncShell, syncDeadwaveShell, syncBlockBlastShell, buildStore, buildSnake, buildDeadwave, buildBlockBlast, isInstalled, deadwaveInstalled, blockBlastInstalled, installSnake, installDeadwave, installBlockBlast, uninstallSnake, uninstallDeadwave, uninstallBlockBlast, toggleDesktopPin, toggleDeadwavePin, toggleBlockBlastPin, modsPage, handleModAction, installedMods, installedDeadwaveMods, installedDeadwaveSkins });
})();