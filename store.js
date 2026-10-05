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
    const snakeInstalled = await isInstalled().catch(() => false);
    const statuses = {};
    for (const mod of Object.values(MODS)) statuses[mod.id] = await modStatus(mod.id);
    const activeCount = Object.values(statuses).filter(value => value.installed).length;
    const readyCount = Object.values(statuses).filter(value => value.downloaded && !value.installed).length;

    const modVisual = id => id === 'autobot'
      ? '<div class="auto-visual"><i class="n1"></i><i class="n2"></i><i class="n3"></i><i class="n4"></i><b class="route r1"></b><b class="route r2"></b><b class="route r3"></b><span>AI</span></div>'
      : '<div class="cheese-visual"><div class="wedge"><i></i><i></i><i></i></div><span>+2</span></div>';

    const cards = Object.values(MODS).map(mod => {
      const status = statuses[mod.id];
      const state = status.installed ? 'Active' : status.downloaded ? 'Ready to move' : 'Available';
      const stateClass = status.installed ? 'active' : status.downloaded ? 'ready' : '';
      const button = status.installed || status.downloaded
        ? '<button class="mod-btn remove" data-action="uninstall" data-id="' + mod.id + '">Remove</button>'
        : '<button class="mod-btn get" data-action="download" data-id="' + mod.id + '">Download</button>';
      const location = status.installed ? 'Snake/' + mod.file : status.downloaded ? 'Downloads/' + mod.file : mod.file;
      return '<article class="mod-card mod-' + mod.id + '">' +
        '<div class="mod-visual">' + modVisual(mod.id) + '</div>' +
        '<div class="mod-body"><div class="mod-title-row"><div><span class="mod-type">SNAKE MOD</span><h2>' + mod.name + '</h2></div><em class="state ' + stateClass + '">' + state + '</em></div>' +
        '<p class="tagline">' + mod.tagline + '</p><p class="desc">' + mod.description + '</p>' +
        '<div class="mod-file"><span class="file-dot"></span><code>' + location + '</code></div></div>' +
        '<div class="mod-cta">' + button + '</div></article>';
    }).join('');

    const installState = snakeInstalled
      ? '<span class="status-live"></span><div><strong>Snake detected</strong><small>Installed package is ready for mods</small></div>'
      : '<span class="status-off"></span><div><strong>Snake is not installed</strong><small>Install Snake before activating mods</small></div>';

    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' +
      '*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#06080b;color:#edf2f8;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button{font:inherit}body{padding:22px;background:radial-gradient(circle at 82% -4%,rgba(255,50,70,.16),transparent 30%),radial-gradient(circle at 5% 98%,rgba(57,214,118,.07),transparent 29%),linear-gradient(180deg,#080b10,#05070a)}.shell{max-width:960px;margin:auto}.routebar{height:38px;display:flex;align-items:center;gap:8px;padding:0 11px;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:rgba(255,255,255,.025);box-shadow:0 16px 50px rgba(0,0,0,.15)}.routebar>i{width:7px;height:7px;border-radius:50%;background:#ff4b5f;box-shadow:0 0 14px rgba(255,75,95,.5)}.routebar code{color:#78879b;font:9px ui-monospace,SFMono-Regular,Menlo,monospace}.routebar span{margin-left:auto;padding:4px 7px;border:1px solid rgba(255,255,255,.06);border-radius:999px;color:#566477;font:700 7px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em}.hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:26px;align-items:end;padding:32px 4px 24px}.hero .eyebrow{display:flex;align-items:center;gap:7px;color:#ff6072;font-size:8px;font-weight:900;letter-spacing:.18em}.hero .eyebrow:before{content:"";width:18px;height:1px;background:#ff6072}.hero h1{margin:8px 0 7px;font-size:42px;line-height:.98;letter-spacing:-.052em}.hero p{max-width:610px;margin:0;color:#8290a2;font-size:11px;line-height:1.65}.hero-stats{display:grid;grid-template-columns:repeat(2,minmax(84px,1fr));gap:7px}.hero-stats div{min-width:92px;padding:10px;border:1px solid rgba(255,255,255,.065);border-radius:11px;background:rgba(255,255,255,.022)}.hero-stats strong{display:block;font-size:15px}.hero-stats span{display:block;margin-top:2px;color:#5c697a;font-size:7px;text-transform:uppercase;letter-spacing:.11em}.controlbar{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:10px 11px;border:1px solid rgba(255,255,255,.075);border-radius:13px;background:linear-gradient(90deg,rgba(255,255,255,.032),rgba(255,255,255,.017))}.package-state{display:flex;align-items:center;gap:9px;min-width:0}.status-live,.status-off{width:8px;height:8px;flex:0 0 auto;border-radius:50%}.status-live{background:#65e28b;box-shadow:0 0 14px rgba(101,226,139,.48)}.status-off{background:#576274}.package-state div{display:flex;flex-direction:column}.package-state strong{font-size:9px}.package-state small{margin-top:2px;color:#617083;font-size:7.5px}.controlbar .spacer{flex:1}.open-files{height:34px;padding:0 11px;border:1px solid rgba(255,255,255,.085);border-radius:9px;background:rgba(255,255,255,.04);color:#dbe4ef;font-size:8px;font-weight:800}.mods{display:grid;gap:9px}.mod-card{position:relative;min-height:155px;display:grid;grid-template-columns:145px minmax(0,1fr) auto;gap:18px;align-items:center;padding:14px;border:1px solid rgba(255,255,255,.07);border-radius:17px;overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.032),rgba(255,255,255,.012));box-shadow:0 18px 55px rgba(0,0,0,.16)}.mod-card:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,rgba(255,255,255,.02),transparent 34%)}.mod-visual{position:relative;height:125px;border-radius:13px;overflow:hidden;border:1px solid rgba(255,255,255,.065);background:#090d12}.mod-autobot .mod-visual{background:radial-gradient(circle at 70% 25%,rgba(86,208,255,.13),transparent 38%),linear-gradient(145deg,#0b161b,#080c11)}.mod-cheese .mod-visual{background:radial-gradient(circle at 70% 25%,rgba(255,201,67,.14),transparent 40%),linear-gradient(145deg,#181309,#0b0a08)}.auto-visual{position:absolute;inset:0}.auto-visual i{position:absolute;width:8px;height:8px;border-radius:50%;background:#72dcff;box-shadow:0 0 15px rgba(114,220,255,.45)}.auto-visual .n1{left:20%;top:66%}.auto-visual .n2{left:42%;top:48%}.auto-visual .n3{left:65%;top:58%}.auto-visual .n4{left:76%;top:27%}.auto-visual .route{position:absolute;height:1px;transform-origin:left center;background:linear-gradient(90deg,rgba(114,220,255,.2),#72dcff)}.auto-visual .r1{left:22%;top:66%;width:34%;transform:rotate(-35deg)}.auto-visual .r2{left:44%;top:49%;width:30%;transform:rotate(19deg)}.auto-visual .r3{left:66%;top:57%;width:37%;transform:rotate(-56deg)}.auto-visual span{position:absolute;right:11px;bottom:8px;color:#5b7181;font:900 24px ui-monospace,SFMono-Regular,Menlo,monospace}.cheese-visual{position:absolute;inset:0;display:grid;place-items:center}.cheese-visual .wedge{position:relative;width:74px;height:54px;clip-path:polygon(0 22%,100% 0,84% 100%,0 82%);background:linear-gradient(145deg,#ffe072,#dca632);filter:drop-shadow(0 15px 20px rgba(0,0,0,.22))}.cheese-visual .wedge i{position:absolute;border-radius:50%;background:#b87e24}.cheese-visual .wedge i:nth-child(1){width:10px;height:10px;left:18px;top:15px}.cheese-visual .wedge i:nth-child(2){width:8px;height:8px;right:19px;top:9px}.cheese-visual .wedge i:nth-child(3){width:12px;height:12px;right:25px;bottom:9px}.cheese-visual span{position:absolute;right:10px;bottom:8px;color:#7b632b;font:900 19px ui-monospace,SFMono-Regular,Menlo,monospace}.mod-body{min-width:0;z-index:1}.mod-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.mod-type{display:block;color:#526176;font-size:7px;font-weight:900;letter-spacing:.14em}.mod-title-row h2{margin:3px 0 0;font-size:19px;letter-spacing:-.025em}.state{height:23px;display:grid;place-items:center;padding:0 8px;border-radius:999px;background:rgba(255,255,255,.04);color:#677587;font-size:7px;font-style:normal;font-weight:850;white-space:nowrap}.state.ready{background:rgba(255,203,74,.07);color:#dfbe68}.state.active{background:rgba(92,225,133,.08);color:#7be59b}.tagline{margin:8px 0 3px;color:#bcc7d4;font-size:9px;font-weight:700}.desc{max-width:580px;margin:0;color:#728095;font-size:9px;line-height:1.55}.mod-file{display:flex;align-items:center;gap:6px;margin-top:11px}.file-dot{width:5px;height:5px;border-radius:50%;background:#4c5969}.mod-file code{min-width:0;overflow:hidden;text-overflow:ellipsis;color:#59687a;font:7.5px ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}.mod-cta{z-index:1}.mod-btn{min-width:92px;height:37px;border-radius:10px;font-size:8px;font-weight:850}.mod-btn.get{border:0;background:#edf3fa;color:#090c10;box-shadow:0 8px 25px rgba(0,0,0,.16)}.mod-btn.remove{border:1px solid rgba(255,91,105,.16);background:rgba(255,91,105,.055);color:#ff96a2}.flow{margin-top:10px;padding:15px;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:rgba(255,255,255,.018)}.flow-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}.flow-head strong{font-size:9px}.flow-head span{color:#4e5b6d;font:7px ui-monospace,SFMono-Regular,Menlo,monospace}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.step{display:grid;grid-template-columns:26px 1fr;gap:8px;align-items:start;padding:10px;border-radius:11px;background:rgba(255,255,255,.018)}.step>span{width:26px;height:26px;display:grid;place-items:center;border-radius:8px;background:rgba(255,255,255,.04);color:#8997a9;font-size:8px;font-weight:900}.step strong{display:block;font-size:8px}.step p{margin:3px 0 0;color:#5f6e81;font-size:7.5px;line-height:1.45}.footer{margin-top:22px;color:#353e4c;text-align:center;font:7px ui-monospace,SFMono-Regular,Menlo,monospace}@media(max-width:700px){body{padding:14px}.hero{grid-template-columns:1fr;padding-top:24px}.hero h1{font-size:34px}.hero-stats{width:max-content}.mod-card{grid-template-columns:92px 1fr}.mod-visual{height:100px}.mod-cta{grid-column:2}.steps{grid-template-columns:1fr}.controlbar{align-items:flex-start}.package-state small{max-width:210px}.mod-title-row{flex-direction:column}.state{width:max-content}}</style></head><body><main class="shell"><div class="routebar"><i></i><code>pocket:mods</code><span>LOCAL INDEX</span></div><section class="hero"><div><span class="eyebrow">SNAKE / MOD LAB</span><h1>Change the rules.</h1><p>Small local extensions for Snake. Download the file, drop it onto the Snake folder, then launch the game. Nothing is injected unless its .pvmod file is physically inside the package.</p></div><div class="hero-stats"><div><strong>' + activeCount + '</strong><span>Active</span></div><div><strong>' + readyCount + '</strong><span>Ready</span></div></div></section><div class="controlbar"><div class="package-state">' + installState + '</div><div class="spacer"></div><button class="open-files" data-action="open-files">Open Downloads</button></div><section class="mods">' + cards + '</section><section class="flow"><div class="flow-head"><strong>Manual install flow</strong><span>NO RESTART OF POCKETVM REQUIRED</span></div><div class="steps"><div class="step"><span>01</span><div><strong>Download</strong><p>The .pvmod file appears directly in Downloads beside the Snake folder.</p></div></div><div class="step"><span>02</span><div><strong>Drop onto Snake</strong><p>Drag the mod file onto the Snake folder. Sidebar destinations work too.</p></div></div><div class="step"><span>03</span><div><strong>Launch Snake</strong><p>The game scans its folder on startup and enables the mods it finds.</p></div></div></div></section><div class="footer">PocketVM package extension index · local virtual drive only</div></main><script>document.addEventListener("click",function(e){var b=e.target.closest("[data-action]");if(!b||b.disabled)return;b.disabled=true;parent.postMessage({type:"pocketvm-mods-action",action:b.dataset.action,id:b.dataset.id||""},"*")});<\/script></body></html>';
  }

  async function handleModAction(action, id) {
    if (action === 'download') await downloadMod(id);
    else if (action === 'uninstall') await uninstallMod(id);
    else if (action === 'open-files') shellCtx?.openApp?.('files', { path:'/home/user/Downloads' });
    else if (action === 'open-store') shellCtx?.openApp?.('store');
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
    shellCtx = ctx;
    ctx.setWindowTitle(win, 'Store', '▣');
    let active = options.tab === 'library' ? 'library' : 'home';
    let variant = Math.floor(Math.random() * featureVariants.length);
    let busy = false;
    let progressState = null;

    win.content.innerHTML = `<div class="store-app">
      <header class="store-topbar">
        <div class="store-wordmark"><span>▣</span><div><strong>Store</strong><small>PocketVM apps & games</small></div></div>
        <nav class="store-tabs"><button data-store-tab="home">Home</button><button data-store-tab="library">Library</button></nav>
        <div class="store-space"></div><div class="store-drive" data-store-drive>Checking storage…</div>
      </header>
      <main class="store-page" data-store-page></main>
    </div>`;

    const page = ctx.queryOne('[data-store-page]', win.el);
    const drive = ctx.queryOne('[data-store-drive]', win.el);

    async function refreshDrive() {
      try {
        const stats = await PocketDisk.stats();
        drive.textContent = formatBytes(stats.free) + ' free';
      } catch { drive.textContent = 'Storage unavailable'; }
    }

    function heroVariant() {
      const v = featureVariants[variant];
      const hero = ctx.queryOne('.store-hero', page);
      if (!hero) return;
      hero.dataset.tone = v.tone;
      ctx.queryOne('[data-feature-kicker]', hero).textContent = v.kicker;
      ctx.queryOne('[data-feature-title]', hero).textContent = v.title;
      ctx.queryOne('[data-feature-copy]', hero).textContent = v.copy;
    }

    async function renderHome() {
      const installed = await isInstalled();
      const id = await identity();
      const size = installed ? await installedBytes() : TOTAL_BYTES;
      const stats = await PocketDisk.stats().catch(() => null);
      const freeText = stats ? formatBytes(stats.free) + ' free on drive' : 'Local install';
      page.innerHTML = `<section class="store-hero store-featured" data-tone="mint">
        <div class="store-hero-copy">
          <div class="store-feature-label"><span class="live-dot"></span><span data-feature-kicker></span><em>Featured game</em></div>
          <h1 data-feature-title></h1><p data-feature-copy></p>
          <div class="store-scoreline"><div><strong>Snake</strong><span>Arcade</span></div><i></i><div><strong>Touch + keys</strong><span>Controls</span></div><i></i><div><strong>Offline</strong><span>After install</span></div></div>
          <div class="store-actions"><button class="store-primary store-main-cta" data-store-main>${installed ? '▶ Play Snake' : '↓ Install Snake'}</button>${installed ? `<button class="store-secondary" data-store-pin>${pinned() ? 'Remove from desktop' : 'Add to desktop'}</button>` : ''}</div>
          <div class="store-progress" data-store-progress hidden><i></i><span></span></div>
          <div class="store-install-note"><span>${installed ? 'Installed locally' : formatBytes(TOTAL_BYTES) + ' download'}</span><span>•</span><span>${installed ? formatBytes(size) + ' on drive' : freeText}</span></div>
        </div>
        <div class="store-hero-visual">
          <div class="store-feature-chip">POCKETVM ORIGINAL</div>
          <div class="store-game-preview">
            <div class="preview-grid"></div><b class="preview-apple"></b>
            <i style="--px:36%;--py:64%"></i><i style="--px:44%;--py:64%"></i><i style="--px:52%;--py:64%"></i><i style="--px:60%;--py:64%"></i><i style="--px:60%;--py:50%" class="head"></i>
          </div>
          <img src="${ctx.escapeHTML(id.icon)}" alt=""><div class="store-icon-glow"></div>
        </div>
      </section>
      <section class="store-feature-grid">
        <article><span>01</span><div><strong>Classic rules</strong><p>Apple, walls, your own tail. Nothing extra unless you put it there.</p></div></article>
        <article><span>02</span><div><strong>Built for iPad</strong><p>Swipe controls, touch D-pad, keyboard support and responsive rendering.</p></div></article>
        <article><span>03</span><div><strong>Actually installed</strong><p>The game, icon and soundtrack consume real space on PocketVM's 1 GB drive.</p></div></article>
      </section>
      <section class="store-section"><div class="store-section-head"><div><span>GAME LIBRARY</span><h2>Available now</h2></div><small>1 title</small></div>
        <article class="store-game-row store-game-row-rich"><img src="${ctx.escapeHTML(id.icon)}" alt=""><div><strong>${ctx.escapeHTML(id.name)}</strong><span>Classic Snake · Smooth animation · Original soundtrack</span><small>${installed ? 'Installed and ready' : 'Instant local install'}</small></div><em>${installed ? 'Installed' : formatBytes(TOTAL_BYTES)}</em><button data-store-row>${installed ? 'Play' : 'Get'}</button></article>
      </section>`;
      heroVariant();
      const main = ctx.queryOne('[data-store-main]', page);
      const row = ctx.queryOne('[data-store-row]', page);
      const pin = ctx.queryOne('[data-store-pin]', page);
      const progress = ctx.queryOne('[data-store-progress]', page);

      const runMain = async () => {
        if (busy) return;
        if (await isInstalled()) { ctx.openApp('snake'); return; }
        busy = true;
        main.disabled = true; row.disabled = true;
        progress.hidden = false;
        try {
          await installSnake((loaded, total, file) => {
            progressState = { loaded,total,file };
            const pct = Math.max(0, Math.min(100, loaded / total * 100));
            ctx.queryOne('i', progress).style.width = pct + '%';
            ctx.queryOne('span', progress).textContent = 'Installing ' + file + ' · ' + Math.round(pct) + '%';
          });
          await refreshDrive();
          await renderHome();
        } catch (err) {
          ctx.queryOne('span', progress).textContent = err?.message || 'Install failed';
          main.disabled = false; row.disabled = false; busy = false;
        } finally {
          busy = false;
        }
      };
      main.addEventListener('click', runMain);
      row.addEventListener('click', runMain);
      pin?.addEventListener('click', async () => { await toggleDesktopPin(!pinned()); await renderHome(); });
      if (progressState && busy) {
        progress.hidden = false;
        const pct = Math.max(0, Math.min(100, progressState.loaded / progressState.total * 100));
        ctx.queryOne('i', progress).style.width = pct + '%';
        ctx.queryOne('span', progress).textContent = 'Installing ' + progressState.file + ' · ' + Math.round(pct) + '%';
      }
    }

    async function renderLibrary() {
      const installed = await isInstalled();
      if (!installed) {
        page.innerHTML = `<section class="store-library-empty"><div>◇</div><h2>Your library is empty</h2><p>Install Snake from Home and it will appear here.</p><button class="store-primary" data-library-home>Browse Store</button></section>`;
        ctx.queryOne('[data-library-home]', page).addEventListener('click', () => { active='home'; render(); });
        return;
      }
      const id = await identity();
      const size = await installedBytes();
      page.innerHTML = `<section class="store-library"><div class="store-section-head"><div><span>YOUR GAMES</span><h2>Library</h2></div><small>1 installed</small></div>
        <article class="library-card"><img src="${ctx.escapeHTML(id.icon)}" alt=""><div class="library-copy"><strong>${ctx.escapeHTML(id.name)}</strong><span>Snake · ${formatBytes(size)}</span><small>Installed in Downloads</small></div><div class="library-actions"><button class="store-primary" data-lib-play>Play</button><button class="store-secondary" data-lib-pin>${pinned() ? 'Remove from desktop' : 'Add to desktop'}</button><button class="store-danger" data-lib-uninstall>Uninstall</button></div></article>
      </section>`;
      ctx.queryOne('[data-lib-play]', page).addEventListener('click', () => ctx.openApp('snake'));
      ctx.queryOne('[data-lib-pin]', page).addEventListener('click', async () => { await toggleDesktopPin(!pinned()); await renderLibrary(); });
      ctx.queryOne('[data-lib-uninstall]', page).addEventListener('click', async () => {
        if (!confirm('Uninstall Snake and delete its downloaded files?')) return;
        const button = ctx.queryOne('[data-lib-uninstall]', page); button.disabled = true; button.textContent = 'Uninstalling…';
        try { await uninstallSnake(); await refreshDrive(); await renderLibrary(); } catch (err) { alert(err?.message || 'Could not uninstall Snake.'); button.disabled=false; button.textContent='Uninstall'; }
      });
    }

    async function render() {
      ctx.queryAll('[data-store-tab]', win.el).forEach(b => b.classList.toggle('active', b.dataset.storeTab === active));
      if (active === 'library') await renderLibrary(); else await renderHome();
      await refreshDrive();
    }

    ctx.queryAll('[data-store-tab]', win.el).forEach(button => button.addEventListener('click', () => { active = button.dataset.storeTab; render(); }));
    const featureTimer = setInterval(() => {
      if (active !== 'home') return;
      let next = variant;
      while (next === variant && featureVariants.length > 1) next = Math.floor(Math.random() * featureVariants.length);
      variant = next; heroVariant();
    }, FEATURE_ROTATE_MS);
    const diskListener = event => {
      if (!String(event.detail?.path || '').startsWith(ROOT)) return;
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => { syncShell(); render(); }, 80);
    };
    window.addEventListener('pocketdiskchange', diskListener);
    win.cleanup = () => { clearInterval(featureTimer); window.removeEventListener('pocketdiskchange', diskListener); };
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

  function init(ctx) {
    shellCtx = ctx;
    syncShell(ctx).catch(() => {});
    window.addEventListener('pocketdiskchange', event => {
      const path = String(event.detail?.path || '');
      if (path && !path.startsWith(ROOT)) return;
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => syncShell(ctx).catch(() => {}), 90);
    });
  }

  window.PocketStoreApp = Object.freeze({ init, syncShell, buildStore, buildSnake, isInstalled, installSnake, uninstallSnake, toggleDesktopPin, modsPage, handleModAction, installedMods });
})();