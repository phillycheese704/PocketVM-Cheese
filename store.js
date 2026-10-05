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
  const MOD_DOWNLOAD_ROOT = '/home/user/Downloads/Snake Mods';
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
    if (!mod) return { downloaded:false, installed:false };
    const [downloaded, installed] = await Promise.all([
      PocketDisk.getNode(MOD_DOWNLOAD_ROOT + '/' + mod.file).catch(() => null),
      PocketDisk.getNode(ROOT + '/' + mod.file).catch(() => null)
    ]);
    return { downloaded:!!downloaded, installed:!!installed };
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
    await PocketDisk.writeText(
      MOD_DOWNLOAD_ROOT + '/' + mod.file,
      JSON.stringify(mod.payload, null, 2) + '\n',
      'application/x-pocketvm-mod+json'
    );
    await shellCtx?.refreshFS?.();
    shellCtx?.notify?.(mod.name + ' downloaded', 'Find it in Downloads → Snake Mods.', '↓');
  }

  async function uninstallMod(id) {
    const mod = MODS[id];
    if (!mod) return;
    const paths = [MOD_DOWNLOAD_ROOT + '/' + mod.file, ROOT + '/' + mod.file];
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
    const cards = [];
    for (const mod of Object.values(MODS)) {
      const status = await modStatus(mod.id);
      const state = status.installed ? 'Installed' : status.downloaded ? 'Downloaded' : 'Not downloaded';
      const button = status.installed || status.downloaded
        ? '<button class="danger" data-action="uninstall" data-id="' + mod.id + '">Uninstall</button>'
        : '<button class="primary" data-action="download" data-id="' + mod.id + '">Download</button>';
      cards.push(
        '<article class="mod-card"><div class="mod-icon">' + mod.icon + '</div><div class="mod-copy"><div class="mod-head"><div><strong>' + mod.name + '</strong><span>' + mod.tagline + '</span></div><em class="' + (status.installed ? 'on' : status.downloaded ? 'ready' : '') + '">' + state + '</em></div><p>' + mod.description + '</p><div class="mod-file"><span>' + mod.file + '</span><small>' + (status.installed ? 'Snake folder' : status.downloaded ? 'Downloads / Snake Mods' : 'PocketVM mod file') + '</small></div></div><div class="mod-actions">' + button + '</div></article>'
      );
    }
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' +
      '*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#07090d;color:#e9eef7;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body{padding:34px 24px 52px;background:radial-gradient(circle at 82% 8%,rgba(255,55,75,.13),transparent 28%),radial-gradient(circle at 10% 80%,rgba(94,231,133,.06),transparent 31%),#07090d}.wrap{max-width:900px;margin:auto}.eyebrow{font-size:10px;letter-spacing:.18em;color:#ff6273;font-weight:850}.title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin:8px 0 6px}.title-row h1{margin:0;font-size:38px;letter-spacing:-.045em}.ghost{font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace;color:#5d697c;padding-top:10px}.lead{max-width:650px;margin:0 0 24px;color:#8896a8;font-size:13px;line-height:1.65}.notice{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 0 12px;padding:13px 14px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.028)}.notice div{display:flex;flex-direction:column;gap:2px}.notice strong{font-size:11px}.notice span{color:#738196;font-size:9px}.notice button{height:34px;padding:0 11px;border:1px solid rgba(255,255,255,.09);border-radius:9px;background:rgba(255,255,255,.045);color:#d8e0eb;font-size:9px;font-weight:750}.mods{display:grid;gap:10px}.mod-card{display:grid;grid-template-columns:54px 1fr auto;gap:14px;align-items:center;padding:15px;border:1px solid rgba(255,255,255,.075);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.015));box-shadow:0 18px 50px rgba(0,0,0,.14)}.mod-icon{width:54px;height:54px;display:grid;place-items:center;border-radius:15px;background:linear-gradient(145deg,#1d2028,#10131a);border:1px solid rgba(255,255,255,.08);font-size:22px;color:#ffd55c}.mod-copy{min-width:0}.mod-head{display:flex;justify-content:space-between;gap:14px}.mod-head>div{display:flex;flex-direction:column;gap:2px}.mod-head strong{font-size:13px}.mod-head span{font-size:9px;color:#7c899c}.mod-head em{height:23px;padding:0 8px;display:grid;place-items:center;border-radius:999px;background:rgba(255,255,255,.045);color:#6f7c8d;font-size:8px;font-style:normal;font-weight:750;white-space:nowrap}.mod-head em.on{background:rgba(92,225,132,.09);color:#7ee8a0}.mod-head em.ready{background:rgba(255,205,82,.08);color:#e4c26e}.mod-copy p{margin:8px 0;color:#8290a3;font-size:10px;line-height:1.55}.mod-file{display:flex;gap:8px;align-items:center}.mod-file span{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;color:#a8b4c4}.mod-file small{font-size:8px;color:#59677a}.mod-actions button{min-width:84px;height:35px;border-radius:9px;font-size:9px;font-weight:800}.primary{border:0;background:#edf2f8;color:#0b0d11}.danger{border:1px solid rgba(255,91,106,.18);background:rgba(255,91,106,.07);color:#ff9ca7}.steps{margin-top:16px;padding:15px;border:1px dashed rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.015)}.steps strong{display:block;font-size:10px;margin-bottom:7px}.steps p{margin:0;color:#708095;font-size:9px;line-height:1.7}.status-dot{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:5px;background:' + (snakeInstalled ? '#65dc88' : '#596476') + '}.footer{margin-top:28px;color:#3f4857;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;text-align:center}@media(max-width:650px){body{padding:24px 14px}.title-row h1{font-size:31px}.ghost{display:none}.mod-card{grid-template-columns:46px 1fr}.mod-icon{width:46px;height:46px}.mod-actions{grid-column:2}.mod-head{flex-direction:column;gap:5px;align-items:flex-start}.mod-head em{width:max-content}.notice{align-items:flex-start;flex-direction:column}}</style></head><body><main class="wrap"><span class="eyebrow">POCKET://MODS</span><div class="title-row"><h1>Snake Mods</h1><span class="ghost">unsupported on purpose.</span></div><p class="lead">Small local add-ons for the installed Snake package. Download a mod file, then move it into the Snake folder. Snake checks its own folder every time it starts.</p><div class="notice"><div><strong><i class="status-dot"></i>' + (snakeInstalled ? 'Snake is installed' : 'Snake is not installed') + '</strong><span>Mod files live entirely inside PocketVM storage.</span></div><button data-action="open-files">Open Downloads</button></div><section class="mods">' + cards.join('') + '</section><section class="steps"><strong>Install manually</strong><p>1. Download a mod here. &nbsp; 2. Open Downloads. &nbsp; 3. Drag the .pvmod file from “Snake Mods” into the “Snake” folder. &nbsp; 4. Restart Snake. To remove it, uninstall here or delete the .pvmod file from the Snake folder.</p></section><div class="footer">PocketVM local package index · nothing here leaves your browser</div></main><script>document.addEventListener("click",function(e){var b=e.target.closest("[data-action]");if(!b)return;b.disabled=true;parent.postMessage({type:"pocketvm-mods-action",action:b.dataset.action,id:b.dataset.id||""},"*")});<\/script></body></html>';
  }

  async function handleModAction(action, id) {
    if (action === 'download') await downloadMod(id);
    else if (action === 'uninstall') await uninstallMod(id);
    else if (action === 'open-files') shellCtx?.openApp?.('files', { path:'/home/user/Downloads' });
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
      const freeText = stats ? formatBytes(stats.free) + ' free after install space' : 'Local install';
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