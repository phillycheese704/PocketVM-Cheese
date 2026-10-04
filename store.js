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

  function featureArt() {
    return `<div class="store-snake-art" aria-hidden="true">
      <div class="ssa-grid"></div>
      <i style="--x:2;--y:5"></i><i style="--x:3;--y:5"></i><i style="--x:4;--y:5"></i><i style="--x:5;--y:5"></i>
      <i style="--x:6;--y:5"></i><i style="--x:6;--y:4"></i><i style="--x:6;--y:3" class="head"></i>
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
      page.innerHTML = `<section class="store-hero" data-tone="mint">
        <div class="store-hero-copy"><span class="store-kicker" data-feature-kicker></span><h1 data-feature-title></h1><p data-feature-copy></p>
          <div class="store-hero-meta"><span>Snake</span><span>Classic</span><span>${installed ? formatBytes(size) + ' installed' : formatBytes(TOTAL_BYTES)}</span></div>
          <div class="store-actions"><button class="store-primary" data-store-main>${installed ? 'Play' : 'Install'}</button>${installed ? `<button class="store-secondary" data-store-pin>${pinned() ? 'Remove from desktop' : 'Add to desktop'}</button>` : ''}</div>
          <div class="store-progress" data-store-progress hidden><i></i><span></span></div>
        </div>
        <div class="store-hero-visual"><img src="${ctx.escapeHTML(id.icon)}" alt=""><div class="store-icon-glow"></div>${featureArt()}</div>
      </section>
      <section class="store-section"><div class="store-section-head"><div><span>ONLY ON POCKETVM</span><h2>Games</h2></div><small>More later.</small></div>
        <article class="store-game-row"><img src="${ctx.escapeHTML(id.icon)}" alt=""><div><strong>${ctx.escapeHTML(id.name)}</strong><span>Classic arcade · Touch + keyboard</span></div><em>${installed ? 'Installed' : formatBytes(TOTAL_BYTES)}</em><button data-store-row>${installed ? 'Play' : 'Get'}</button></article>
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
            ctx.queryOne('span', progress).textContent = 'Installing · ' + Math.round(pct) + '%';
          });
          await refreshDrive();
          await renderHome();
        } catch (err) {
          ctx.queryOne('span', progress).textContent = err?.message || 'Install failed';
          main.disabled = false; row.disabled = false;
        } finally { busy = false; }
      };
      main.addEventListener('click', runMain); row.addEventListener('click', runMain);
      pin?.addEventListener('click', async () => { await toggleDesktopPin(!pinned()); await renderHome(); });
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
      const [html, musicBlob] = await Promise.all([
        PocketDisk.readText(ROOT + '/game.html'),
        PocketDisk.readBlob(ROOT + '/music.ogg')
      ]);
      const musicData = await blobToDataURL(musicBlob);
      const save = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') || {}; } catch { return {}; } })();
      const bootstrap = '<script>window.__POCKETVM_MUSIC=' + JSON.stringify(musicData) + ';window.__POCKETVM_SAVE=' + JSON.stringify(save) + ';<\\/script>';
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

  window.PocketStoreApp = Object.freeze({ init, syncShell, buildStore, buildSnake, isInstalled, installSnake, uninstallSnake, toggleDesktopPin });
})();