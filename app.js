(async () => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const escapeHTML = (v = '') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const loadJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const initialFS = await PocketDisk.init();

  const state = {
    z: 20,
    windows: new Map(),
    terminalCounter: 0,
    theme: localStorage.getItem('pocketvm.theme') || 'blue',
    auth: loadJSON('pocketvm.auth', null),
    user: loadJSON('pocketvm.user', { name: 'Guest', avatar: '', borderStyle:'ring', borderColor:'#8fc6ff' }),
    wallpaper: loadJSON('pocketvm.wallpaper', { type: 'preset', value: 'aurora', dataUrl: '' }),
    preferences: loadJSON('pocketvm.preferences', { transparency:true, animations:true, taskbarCentered:false, clockSeconds:false, focusMode:false, desktopIconSize:'medium', desktopHidden:[] }),
    notifications: loadJSON('pocketvm.notifications', []),
    browserData: loadJSON('pocketvm.browser', { bookmarks:[], history:[] }),
    bootedAt: Date.now(),
    fileClipboard: null,
    desktopLayout: loadJSON('pocketvm.desktopLayout', {}),
    fs: initialFS
  };

  const asObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  state.user = { name:'Guest', avatar:'', borderStyle:'ring', borderColor:'#8fc6ff', ...asObject(state.user) };
  state.wallpaper = { type:'preset', value:'aurora', dataUrl:'', ...asObject(state.wallpaper) };
  if (!['preset','custom','file'].includes(state.wallpaper.type)) state.wallpaper = { type:'preset', value:'aurora', dataUrl:'' };
  state.preferences = {
    transparency:true, animations:true, taskbarCentered:false, clockSeconds:false, focusMode:false,
    desktopIconSize:'medium', desktopHidden:[], ...asObject(state.preferences)
  };
  if (!['small','medium','large'].includes(state.preferences.desktopIconSize)) state.preferences.desktopIconSize = 'medium';
  if (!Array.isArray(state.preferences.desktopHidden)) state.preferences.desktopHidden = [];
  state.preferences.desktopHidden = state.preferences.desktopHidden.filter(value => typeof value === 'string');
  state.notifications = Array.isArray(state.notifications) ? state.notifications.filter(item => item && typeof item === 'object') : [];
  state.browserData = { bookmarks:[], history:[], ...asObject(state.browserData) };
  if (!Array.isArray(state.browserData.bookmarks)) state.browserData.bookmarks = [];
  if (!Array.isArray(state.browserData.history)) state.browserData.history = [];
  state.desktopLayout = asObject(state.desktopLayout);
  if (!state.auth || typeof state.auth !== 'object' || Array.isArray(state.auth) ||
      typeof state.auth.hash !== 'string' || typeof state.auth.salt !== 'string') state.auth = null;

  const themes = {
    blue: ['#65a7ff', '#8f7cff'],
    mint: ['#5ee7c4', '#4da6ff'],
    sunset: ['#ff9b73', '#b276ff'],
    mono: ['#e7edf6', '#8794a8'],
    rose: ['#ff7aa8', '#9c7cff'],
    lime: ['#b7f36b', '#3dd6a5'],
    amber: ['#ffbf66', '#ff7b72'],
    cobalt: ['#4b8dff', '#38d8ff'],
    crimson: ['#ff4054', '#991827']
  };

  const wallpapers = {
    aurora: 'radial-gradient(circle at 25% 20%, rgba(65,102,255,.48), transparent 34%), radial-gradient(circle at 75% 65%, rgba(80,53,170,.48), transparent 32%), radial-gradient(circle at 60% 20%, rgba(0,190,255,.2), transparent 27%), linear-gradient(145deg,#090f1e 0%,#101a36 55%,#070b15 100%)',
    dusk: 'radial-gradient(circle at 20% 25%, rgba(255,125,105,.34), transparent 32%), radial-gradient(circle at 78% 68%, rgba(139,92,246,.42), transparent 36%), linear-gradient(145deg,#1b1020,#13152e 58%,#080b14)',
    ocean: 'radial-gradient(circle at 30% 22%, rgba(45,212,191,.26), transparent 33%), radial-gradient(circle at 72% 70%, rgba(14,165,233,.36), transparent 35%), linear-gradient(145deg,#06151b,#082f49 55%,#07111a)',
    graphite: 'radial-gradient(circle at 32% 25%, rgba(255,255,255,.11), transparent 28%), radial-gradient(circle at 70% 70%, rgba(148,163,184,.12), transparent 31%), linear-gradient(145deg,#090b0f,#181b21 58%,#07080b)',
    sunrise: 'radial-gradient(circle at 20% 20%, rgba(255,194,116,.48), transparent 31%), radial-gradient(circle at 78% 70%, rgba(255,105,135,.28), transparent 38%), linear-gradient(150deg,#25182b,#55304d 52%,#151529)',
    alpine: 'radial-gradient(circle at 25% 20%, rgba(106,237,203,.25), transparent 34%), radial-gradient(circle at 75% 75%, rgba(80,145,255,.26), transparent 38%), linear-gradient(150deg,#081a1d,#0c3035 50%,#0b1320)',
    neon: 'radial-gradient(circle at 20% 65%, rgba(255,0,153,.32), transparent 30%), radial-gradient(circle at 78% 28%, rgba(0,229,255,.28), transparent 32%), linear-gradient(145deg,#090019,#1a0b31 48%,#050812)',
    ice: 'radial-gradient(circle at 25% 25%, rgba(190,228,255,.28), transparent 35%), radial-gradient(circle at 75% 75%, rgba(100,160,255,.26), transparent 34%), linear-gradient(145deg,#122031,#1b334d 56%,#0c1725)',
    redline: 'radial-gradient(circle at 78% 22%, rgba(255,35,58,.22), transparent 30%), radial-gradient(circle at 18% 78%, rgba(150,10,26,.18), transparent 34%), linear-gradient(154deg, transparent 0 46%, rgba(255,45,65,.10) 46.4%, rgba(255,45,65,.03) 47.2%, transparent 48%), linear-gradient(135deg,#030405 0%,#08090b 38%,#160609 69%,#040405 100%)'
  };

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`PocketVM could not save ${key}`, err);
      return false;
    }
  }

  function applyTheme(name) {
    const t = themes[name] || themes.blue;
    state.theme = name;
    localStorage.setItem('pocketvm.theme', name);
    document.documentElement.style.setProperty('--accent', t[0]);
    document.documentElement.style.setProperty('--accent-2', t[1]);
  }

  function applyPreferences() {
    const p = state.preferences || {};
    p.desktopHidden ||= [];
    p.desktopIconSize ||= 'medium';
    document.body.classList.toggle('solid-ui', p.transparency === false);
    document.body.classList.toggle('reduce-motion', p.animations === false);
    document.body.classList.toggle('center-taskbar', p.taskbarCentered === true);
    document.body.dataset.desktopIconSize = p.desktopIconSize;
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      const id = icon.dataset.open || '';
      icon.hidden = p.desktopHidden.includes(id);
    });
    saveJSON('pocketvm.preferences', p);
  }

  const wallpaperObjectUrls = { desktop:'', auth:'' };

  async function wallpaperCSS(target = 'desktop') {
    if (state.wallpaper.type === 'file' && state.wallpaper.path) {
      try {
        const blob = await PocketDisk.readBlob(state.wallpaper.path);
        if (wallpaperObjectUrls[target]) URL.revokeObjectURL(wallpaperObjectUrls[target]);
        wallpaperObjectUrls[target] = URL.createObjectURL(blob);
        const shade = target === 'auth' ? 'linear-gradient(rgba(3,7,14,.42), rgba(3,7,14,.62)),' : 'linear-gradient(rgba(4,8,16,.12), rgba(4,8,16,.17)),';
        return `${shade} url("${wallpaperObjectUrls[target]}") center / cover no-repeat`;
      } catch {}
    }
    if (state.wallpaper.type === 'custom' && state.wallpaper.dataUrl) {
      const shade = target === 'auth' ? 'linear-gradient(rgba(3,7,14,.42), rgba(3,7,14,.62)),' : 'linear-gradient(rgba(4,8,16,.12), rgba(4,8,16,.17)),';
      return `${shade} url("${state.wallpaper.dataUrl}") center / cover no-repeat`;
    }
    const key = wallpapers[state.wallpaper.value] ? state.wallpaper.value : 'aurora';
    return wallpapers[key];
  }

  async function applyWallpaper() {
    const el = $('#desktop-wallpaper');
    if (!el) return;
    el.classList.toggle('custom-wallpaper', state.wallpaper.type === 'file' || state.wallpaper.type === 'custom');
    el.style.background = await wallpaperCSS('desktop');
  }

  async function setWallpaperFromFile(path) {
    const node = state.fs[path] || await PocketDisk.getNode(path);
    if (!node || !PocketDisk.isImageMime(node.mime)) throw new Error('Choose an image file.');
    state.wallpaper = { type:'file', value:'custom', path };
    saveJSON('pocketvm.wallpaper', state.wallpaper);
    await applyWallpaper();
    await setAuthWallpaper();
    notify('Wallpaper changed', basename(path), '▧');
  }

  function syncWallpaperWithDriveChange(event) {
    if (state.wallpaper.type !== 'file' || !state.wallpaper.path) return;
    const detail = event.detail || {};
    const current = state.wallpaper.path;
    if (detail.action === 'move' && detail.from && detail.path &&
        (current === detail.from || current.startsWith(detail.from + '/'))) {
      state.wallpaper.path = detail.path + current.slice(detail.from.length);
      saveJSON('pocketvm.wallpaper', state.wallpaper);
      return;
    }
    if ((detail.action === 'delete' && detail.path &&
         (current === detail.path || current.startsWith(detail.path + '/'))) ||
        detail.action === 'reset') {
      state.wallpaper = { type:'preset', value:'aurora', dataUrl:'' };
      saveJSON('pocketvm.wallpaper', state.wallpaper);
      applyWallpaper();
      setAuthWallpaper();
    }
  }

  window.addEventListener('pocketdiskchange', syncWallpaperWithDriveChange);

  function initials(name) {
    const parts = String(name || 'Guest').trim().split(/\s+/).filter(Boolean);
    return (parts.slice(0, 2).map(p => p[0]).join('') || 'G').toUpperCase();
  }

  function shellUser() {
    const cleaned = String(state.user.name || 'guest').toLowerCase().replace(/[^a-z0-9_-]+/g, '').slice(0, 18);
    return cleaned || 'guest';
  }

  function paintAvatar(el) {
    if (!el) return;
    const style = state.user.borderStyle || 'ring';
    el.classList.remove('avatar-border-none','avatar-border-ring','avatar-border-double','avatar-border-glow');
    el.classList.add('avatar-border-' + style);
    el.style.setProperty('--avatar-border-color', state.user.borderColor || '#8fc6ff');
    if (state.user.avatar) {
      const img = document.createElement('img');
      img.src = String(state.user.avatar);
      img.alt = '';
      el.replaceChildren(img);
    } else {
      el.textContent = initials(state.user.name);
    }
  }

  function renderUserChrome() {
    $('#start-user-name').textContent = state.user.name || 'Guest';
    paintAvatar($('#start-avatar'));
    paintAvatar($('#auth-avatar'));
    syncOpenTerminalsUser();
  }

  function syncOpenTerminalsUser() {
    for (const win of state.windows.values()) {
      if (!win.term) continue;
      win.term.env.USER = shellUser();
      updatePrompt(win.term);
    }
  }

  applyTheme(state.theme);
  applyPreferences();

  async function refreshFS() {
    state.fs = await PocketDisk.snapshot();
    return state.fs;
  }

  function norm(path, cwd = '/home/user') {
    if (!path) return cwd;
    const full = path.startsWith('/') ? path : `${cwd}/${path}`;
    const parts = [];
    for (const p of full.split('/')) {
      if (!p || p === '.') continue;
      if (p === '..') parts.pop(); else parts.push(p);
    }
    return '/' + parts.join('/');
  }

  function parentPath(path) {
    const n = norm(path);
    return n === '/' ? '/' : n.slice(0, n.lastIndexOf('/')) || '/';
  }

  function basename(path) {
    const n = norm(path);
    return n === '/' ? '/' : n.slice(n.lastIndexOf('/') + 1);
  }

  function children(path) {
    const p = norm(path);
    return Object.keys(state.fs).filter(k => k !== p && parentPath(k) === p).sort((a, b) => {
      const ad = state.fs[a].type === 'dir', bd = state.fs[b].type === 'dir';
      return ad === bd ? a.localeCompare(b) : ad ? -1 : 1;
    });
  }

  function allowedFileName(name) {
    return /\.(txt|html|png|jpe?g|webp|gif|svg)$/i.test(String(name || ''));
  }

  function isImagePath(path) {
    const node = state.fs[path];
    return !!node && PocketDisk.isImageMime(node.mime || PocketDisk.mimeFromName(path));
  }

  function setWindowTitle(win, title, icon) {
    $('.window-name', win.el).textContent = title;
    if (icon) $('.window-icon', win.el).textContent = icon;
    const btn = $(`.task-app[data-window-id="${CSS.escape(win.id)}"]`);
    if (btn) $('.task-label', btn).textContent = title;
  }

  function fileAppContext() {
    return {
      state,
      queryOne: (selector, root = document) => root.querySelector(selector),
      queryAll: (selector, root = document) => Array.from(root.querySelectorAll(selector)),
      escapeHTML, norm, parentPath, basename, children, openApp, notify, refreshFS, setWallpaperFromFile, setWindowTitle
    };
  }

  function systemAppContext() {
    return {
      state,
      queryOne: (selector, root = document) => root.querySelector(selector),
      queryAll: (selector, root = document) => Array.from(root.querySelectorAll(selector)),
      escapeHTML, openApp, closeWindow, setWindowTitle, formatUptime, apps
    };
  }

  function storeAppContext() {
    return {
      state,
      queryOne: (selector, root = document) => root.querySelector(selector),
      queryAll: (selector, root = document) => Array.from(root.querySelectorAll(selector)),
      escapeHTML, openApp, closeWindow, notify, refreshFS, setWindowTitle, initDesktopGrid, applyPreferences
    };
  }

  const apps = {
    terminal: { name: 'Terminal', icon: '›_', width: 790, height: 500, singleton: false, build: buildTerminal },
    files: { name: 'Files', icon: '▤', width: 920, height: 600, singleton: true, build: (win, options) => PocketFilesApp.buildFiles(win, options, fileAppContext()) },
    calculator: { name: 'Calculator', icon: '＋', width: 380, height: 560, singleton: true, build: buildCalculator },
    imageviewer: { name: 'Photos', icon: '▧', width: 860, height: 620, singleton: false, build: (win, options) => PocketFilesApp.buildImageViewer(win, options, fileAppContext()) },
    notes: { name: 'Notes', icon: '✎', width: 680, height: 480, singleton: true, build: buildNotes },
    editor: { name: 'Editor', icon: '⌘', width: 790, height: 560, singleton: false, build: (win, options) => PocketFilesApp.buildEditor(win, options, fileAppContext()) },
    preview: { name: 'HTML Preview', icon: '◉', width: 850, height: 600, singleton: false, build: (win, options) => PocketFilesApp.buildPreview(win, options, fileAppContext()) },
    browser: { name: 'Pocket Browser', icon: '◎', width: 980, height: 650, singleton: true, build: buildWebBrowser },
    store: { name: 'Store', icon: '▣', width: 980, height: 650, singleton: true, build: (win, options) => PocketStoreApp.buildStore(win, options, storeAppContext()) },
    snake: { name: 'Snake', icon: '🐍', width: 1040, height: 720, singleton: true, build: (win, options) => PocketStoreApp.buildSnake(win, options, storeAppContext()) },
    deadwave: { name: 'Deadwave', icon: '☣', width: 1080, height: 740, singleton: true, build: (win, options) => PocketStoreApp.buildDeadwave(win, options, storeAppContext()) },
    monitor: { name: 'System', icon: '⌁', width: 820, height: 610, singleton: true, build: (win, options) => PocketSystemApps.buildSystem(win, options, systemAppContext()) },
    taskmanager: { name: 'Task Manager', icon: '▦', width: 820, height: 600, singleton: true, build: (win, options) => PocketSystemApps.buildTaskManager(win, options, systemAppContext()) },
    settings: { name: 'Settings', icon: '⚙', width: 720, height: 540, singleton: true, build: buildSettings },
    about: { name: 'About PocketVM', icon: 'ⓘ', width: 500, height: 410, singleton: true, build: buildAbout }
  };

  function openApp(appId, options = {}) {
    const app = apps[appId];
    if (!app) return;
    if (app.singleton) {
      const existing = [...state.windows.values()].find(w => w.appId === appId);
      if (existing) {
        restoreWindow(existing.id);
        focusWindow(existing.id);
        return existing;
      }
    }

    const id = `${appId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const el = $('#window-template').content.firstElementChild.cloneNode(true);
    el.dataset.windowId = id;
    el.style.setProperty('--w', `${app.width}px`);
    el.style.setProperty('--h', `${app.height}px`);
    $('.window-icon', el).textContent = app.icon;
    $('.window-name', el).textContent = app.name;
    const content = $('.window-content', el);
    $('#window-layer').appendChild(el);

    const win = { id, appId, el, content, maximized: false, beforeMax: null };
    state.windows.set(id, win);
    wireWindow(win);
    addTaskbarButton(win);
    const showBuildError = err => {
      console.error('PocketVM app failed:', appId, err);
      if (!state.windows.has(id)) return;
      content.innerHTML = '<div class="app-pad"><h2>' + escapeHTML(app.name) + ' could not open</h2><p style="color:var(--muted)">' + escapeHTML(err?.message || 'An unexpected error occurred.') + '</p></div>';
    };
    try {
      const result = app.build(win, options);
      if (result && typeof result.then === 'function') result.catch(showBuildError);
    } catch (err) {
      showBuildError(err);
    }
    focusWindow(id);
    if (matchMedia('(max-width: 620px)').matches) maximizeWindow(id);
    return win;
  }

  function wireWindow(win) {
    const { el, id } = win;
    el.addEventListener('pointerdown', () => focusWindow(id));
    $$('.window-actions button', el).forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === 'close') closeWindow(id);
      if (action === 'minimize') minimizeWindow(id);
      if (action === 'maximize') toggleMaximize(id);
    }));

    const bar = $('.titlebar', el);
    bar.addEventListener('dblclick', () => toggleMaximize(id));
    bar.addEventListener('pointerdown', e => {
      if (e.target.closest('.window-actions') || win.maximized) return;
      e.preventDefault();
      focusWindow(id);
      const rect = el.getBoundingClientRect();
      const startX = e.clientX, startY = e.clientY;
      const left = rect.left, top = rect.top;
      el.style.transform = 'none';
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      bar.setPointerCapture(e.pointerId);
      const move = ev => {
        const maxX = innerWidth - Math.min(160, el.offsetWidth);
        const maxY = innerHeight - 100;
        el.style.left = `${clamp(left + ev.clientX - startX, -el.offsetWidth + 120, maxX)}px`;
        el.style.top = `${clamp(top + ev.clientY - startY, 0, maxY)}px`;
        updateSnapPreview(ev);
      };
      const up = ev => {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        bar.removeEventListener('pointercancel', cancel);
        try { bar.releasePointerCapture(ev.pointerId); } catch {}
        maybeSnapWindow(win, ev);
      };
      const cancel = ev => {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        bar.removeEventListener('pointercancel', cancel);
        $('#snap-preview').hidden = true;
        try { bar.releasePointerCapture(ev.pointerId); } catch {}
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', cancel);
    });

    const handle = $('.resize-handle', el);
    handle.addEventListener('pointerdown', e => {
      if (win.maximized) return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(id);
      const rect = el.getBoundingClientRect();
      const sx = e.clientX, sy = e.clientY, sw = rect.width, sh = rect.height;
      handle.setPointerCapture(e.pointerId);
      const move = ev => {
        el.style.width = `${clamp(sw + ev.clientX - sx, 290, innerWidth - rect.left)}px`;
        el.style.height = `${clamp(sh + ev.clientY - sy, 210, innerHeight - 60 - rect.top)}px`;
      };
      const up = ev => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
        try { handle.releasePointerCapture(ev.pointerId); } catch {}
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
    });
  }

  function addTaskbarButton(win) {
    const btn = document.createElement('button');
    btn.className = 'task-app';
    btn.dataset.windowId = win.id;
    btn.innerHTML = `<span>${escapeHTML(apps[win.appId].icon)}</span><span class="task-label">${escapeHTML(apps[win.appId].name)}</span>`;
    btn.addEventListener('click', () => {
      if (win.el.classList.contains('minimized')) restoreWindow(win.id);
      else if (win.el.classList.contains('focused')) minimizeWindow(win.id);
      else focusWindow(win.id);
    });
    $('#taskbar-apps').appendChild(btn);
  }

  function focusWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    $$('.window').forEach(w => w.classList.remove('focused'));
    $$('.task-app').forEach(b => b.classList.remove('active'));
    win.el.classList.remove('minimized');
    win.el.classList.add('focused');
    win.el.style.zIndex = ++state.z;
    $(`.task-app[data-window-id="${CSS.escape(id)}"]`)?.classList.add('active');
  }

  function focusTopVisibleWindow(excludeId = '') {
    const next = [...state.windows.values()]
      .filter(w => w.id !== excludeId && !w.el.classList.contains('minimized'))
      .sort((a, b) => Number(b.el.style.zIndex || 0) - Number(a.el.style.zIndex || 0))[0];
    if (next) focusWindow(next.id);
  }

  function closeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    const wasFocused = win.el.classList.contains('focused');
    win.cleanup?.();
    win.el.remove();
    $(`.task-app[data-window-id="${CSS.escape(id)}"]`)?.remove();
    state.windows.delete(id);
    if (wasFocused) focusTopVisibleWindow(id);
  }

  function minimizeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    const wasFocused = win.el.classList.contains('focused');
    win.el.classList.add('minimized');
    win.el.classList.remove('focused');
    $(`.task-app[data-window-id="${CSS.escape(id)}"]`)?.classList.remove('active');
    if (wasFocused) focusTopVisibleWindow(id);
  }

  function restoreWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.el.classList.remove('minimized');
    focusWindow(id);
  }

  function toggleMaximize(id) {
    const w = state.windows.get(id);
    if (!w) return;
    w.maximized ? unmaximizeWindow(id) : maximizeWindow(id);
  }

  function maximizeWindow(id) {
    const w = state.windows.get(id);
    if (!w || w.maximized) return;
    w.beforeMax = { left: w.el.style.left, top: w.el.style.top, width: w.el.style.width, height: w.el.style.height, transform: w.el.style.transform };
    w.el.classList.add('maximized');
    w.maximized = true;
  }

  function unmaximizeWindow(id) {
    const w = state.windows.get(id);
    if (!w || !w.maximized) return;
    w.el.classList.remove('maximized');
    Object.assign(w.el.style, w.beforeMax || {});
    w.maximized = false;
  }

  // ---------- Terminal ----------
  function buildTerminal(win) {
    state.terminalCounter++;
    win.content.innerHTML = `
      <div class="terminal">
        <div class="term-toolbar">
          <span class="term-chip">PocketVM shell reset</span>
          <span style="flex:1"></span>
          <span class="term-chip">1 command</span>
        </div>
        <div class="term-output" role="log" aria-live="polite"></div>
        <div class="term-promptline"><span class="term-prompt"></span><input class="term-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" /></div>
      </div>`;

    const term = {
      win,
      env: { USER: shellUser() }
    };
    win.term = term;
    print(term, 'PocketVM Terminal 1.2', 'accent');
    print(term, 'Available command: null.user', 'muted');
    updatePrompt(term);

    const input = $('.term-input', win.el);
    setTimeout(() => input.focus({ preventScroll: true }), 0);
    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const line = input.value;
      input.value = '';
      runLine(term, line);
    });

    win.el.addEventListener('pointerdown', e => {
      if (!e.target.closest('.term-output')) setTimeout(() => input.focus({ preventScroll: true }), 0);
    });
  }

  function print(term, text = '', cls = '') {
    const out = $('.term-output', term.win.el);
    if (!out) return;
    const div = document.createElement('div');
    div.className = `term-line ${cls}`;
    div.textContent = text;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
    return div;
  }

  function updatePrompt(term) {
    $('.term-prompt', term.win.el).textContent = `${term.env.USER}@pocketvm:~$`;
  }

  function runLine(term, line) {
    const raw = line.trim();
    print(term, `${$('.term-prompt', term.win.el).textContent} ${line}`);
    if (!raw) return;

    if (raw.toLowerCase() === 'null.user') {
      print(term, 'Erasing PocketVM local data and virtual drive…', 'error');
      PocketDisk.destroy().catch(() => {}).finally(() => {
        localStorage.clear();
        setTimeout(() => location.reload(), 350);
      });
      return;
    }

    print(term, `${raw}: command not found`, 'error');
  }

  // ---------- Pocket Browser ----------
  function buildWebBrowser(win) {
    setWindowTitle(win, 'Pocket Browser', '◎');
    win.content.innerHTML = `
      <div class="web-browser">
        <div class="web-tabbar">
          <div class="web-tabs" role="tablist" aria-label="Browser tabs"></div>
          <button class="web-icon-btn web-new-tab" type="button" title="New tab" aria-label="New tab">+</button>
        </div>
        <div class="web-nav">
          <button class="web-icon-btn" data-web-back type="button" title="Back" aria-label="Back">←</button>
          <button class="web-icon-btn" data-web-forward type="button" title="Forward" aria-label="Forward">→</button>
          <button class="web-icon-btn" data-web-reload type="button" title="Reload" aria-label="Reload">↻</button>
          <button class="web-icon-btn" data-web-home type="button" title="Home" aria-label="Home">⌂</button>
          <form class="web-address-form">
            <span class="web-site-mark">◎</span>
            <input class="web-address-input" type="text" inputmode="url" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Address or search" placeholder="Search or enter address" />
            <button class="web-go" type="submit">Go</button>
          </form>
          <button class="web-icon-btn" data-web-bookmark type="button" title="Bookmark" aria-label="Bookmark">☆</button>
          <button class="web-icon-btn" data-web-history type="button" title="History" aria-label="History">☷</button>
          <button class="web-icon-btn" data-web-external type="button" title="Open outside PocketVM" aria-label="Open outside PocketVM">↗</button>
        </div>
        <div class="web-status">
          <span class="web-status-dot"></span>
          <span class="web-status-text">Ready</span>
          <span class="web-status-spacer"></span>
          <span class="web-status-hint">Some websites block embedded browsers · use ↗ if needed</span>
        </div>
        <div class="web-bookmarks"></div>
        <div class="web-browser-panel" hidden></div>
        <div class="web-viewport">
          <iframe class="web-frame" title="Pocket Browser page"></iframe>
        </div>
      </div>`;

    const frame = $('.web-frame', win.el);
    const tabsEl = $('.web-tabs', win.el);
    const address = $('.web-address-input', win.el);
    const status = $('.web-status-text', win.el);
    const backBtn = $('[data-web-back]', win.el);
    const forwardBtn = $('[data-web-forward]', win.el);
    const externalBtn = $('[data-web-external]', win.el);
    const bookmarkBtn = $('[data-web-bookmark]', win.el);
    const historyBtn = $('[data-web-history]', win.el);
    const bookmarksBar = $('.web-bookmarks', win.el);
    const browserPanel = $('.web-browser-panel', win.el);

    let tabCounter = 0;
    let activeId = '';
    let navigationToken = 0;
    const tabs = [];

    const activeTab = () => tabs.find(t => t.id === activeId);

    function saveBrowserData() {
      state.browserData.bookmarks = (state.browserData.bookmarks || []).slice(0, 16);
      state.browserData.history = (state.browserData.history || []).slice(0, 60);
      saveJSON('pocketvm.browser', state.browserData);
    }

    function bookmarkLabel(url) {
      if (/^local:\/\//i.test(url)) return url.replace(/^local:\/\//i,'');
      try { return new URL(url).hostname.replace(/^www\./,'') || url; } catch { return url; }
    }

    function renderBookmarksBar() {
      bookmarksBar.innerHTML = '';
      const items = state.browserData.bookmarks || [];
      if (!items.length) {
        bookmarksBar.innerHTML = '<span class="web-bookmarks-empty">☆ Bookmark pages to keep them here</span>';
      } else {
        items.forEach(item => {
          const b=document.createElement('button');
          b.type='button'; b.textContent=bookmarkLabel(item.url); b.title=item.url;
          b.addEventListener('click',()=>navigate(item.url,true));
          bookmarksBar.appendChild(b);
        });
      }
      const tab=activeTab();
      bookmarkBtn.textContent = tab && items.some(x=>x.url===tab.url) ? '★' : '☆';
    }

    function renderBrowserPanel(type) {
      browserPanel.hidden=false;
      const source=type==='history' ? (state.browserData.history||[]) : (state.browserData.bookmarks||[]);
      browserPanel.innerHTML='<div class="web-panel-head"><strong>'+(type==='history'?'History':'Bookmarks')+'</strong><button type="button" data-web-panel-close>×</button></div><div class="web-panel-list"></div>';
      const list=$('.web-panel-list',browserPanel);
      if(!source.length) list.innerHTML='<div class="web-panel-empty">Nothing here yet.</div>';
      source.forEach(item=>{
        const row=document.createElement('button');row.type='button';row.className='web-panel-row';
        row.innerHTML='<span>'+escapeHTML(bookmarkLabel(item.url))+'</span><small>'+escapeHTML(item.url)+'</small>';
        row.addEventListener('click',()=>{browserPanel.hidden=true;navigate(item.url,true);});
        list.appendChild(row);
      });
      $('[data-web-panel-close]',browserPanel)?.addEventListener('click',()=>browserPanel.hidden=true);
    }

    const homePage = () => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{color-scheme:dark;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;min-height:100vh;color:#eff5ff;background:
radial-gradient(circle at 25% 18%,rgba(74,119,255,.28),transparent 34%),
radial-gradient(circle at 78% 75%,rgba(143,86,255,.23),transparent 32%),
linear-gradient(145deg,#07101e,#0d1730 55%,#070b14);display:grid;place-items:center;padding:28px}
main{width:min(700px,100%);text-align:center}.mark{width:78px;height:78px;margin:0 auto 22px;border-radius:24px;
display:grid;place-items:center;font-weight:900;font-size:27px;background:linear-gradient(145deg,#65a7ff,#8f7cff);
box-shadow:0 24px 70px rgba(70,94,230,.33),inset 0 1px rgba(255,255,255,.35)}
h1{font-size:clamp(34px,7vw,58px);letter-spacing:-.05em;margin:0}p{color:#9eb0ca;line-height:1.55;margin:12px auto 0;max-width:560px}
.card{margin:36px auto 0;padding:18px 20px;border:1px solid rgba(255,255,255,.11);border-radius:20px;
background:rgba(255,255,255,.045);text-align:left;max-width:600px;box-shadow:0 22px 70px rgba(0,0,0,.22)}
.card strong{display:block;margin-bottom:5px}.card span{color:#91a4bf;font-size:13px;line-height:1.45}
.pills{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:24px}
.pill{padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);color:#b9cae2;font-size:12px}
</style></head><body><main>
<div class="mark">PV</div><h1>Pocket Browser</h1>
<p>Browse the web, search from the address bar, or open your own PocketVM HTML files with <b>local://filename.html</b>.</p>
<div class="pills"><span class="pill">Private local shell</span><span class="pill">Tab history</span><span class="pill">Local HTML support</span></div>
<div class="card"><strong>About embedded websites</strong><span>Pocket Browser runs inside PocketVM, so websites that forbid iframe embedding may refuse to display. If that happens, use the ↗ button in the toolbar to open the current page directly in Safari.</span></div>
</main></body></html>`;

    const errorPage = (title, detail) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>:root{color-scheme:dark;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}body{margin:0;min-height:100vh;background:#0a101b;color:#edf4ff;display:grid;place-items:center;padding:28px}.box{width:min(520px,100%);padding:28px;border:1px solid rgba(255,255,255,.12);border-radius:22px;background:rgba(255,255,255,.045)}h1{margin:0 0 8px;font-size:24px}p{margin:0;color:#9aacC4;line-height:1.55}</style>
</head><body><div class="box"><h1>${escapeHTML(title)}</h1><p>${escapeHTML(detail)}</p></div></body></html>`;

    function normalizeInput(raw) {
      const value = String(raw || '').trim();
      if (!value || value.toLowerCase() === 'pocket://home') return { kind:'home', url:'pocket://home' };
      if (value.toLowerCase() === 'pocket:mods' || value.toLowerCase() === 'pocket://mods') return { kind:'mods', url:'pocket:mods' };
      if (/^local:\/\//i.test(value)) return { kind:'local', url:value };
      if (/^https?:\/\//i.test(value)) {
        try {
          const u = new URL(value);
          if (u.protocol === 'http:') u.protocol = 'https:';
          return { kind:'web', url:u.href };
        } catch {}
      }
      if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
        return { kind:'error', url:value, message:'Pocket Browser only allows http://, https://, pocket:// and local:// addresses.' };
      }
      if (/\s/.test(value) || !value.includes('.')) {
        return { kind:'web', url:'https://www.google.com/search?igu=1&q=' + encodeURIComponent(value), search:true };
      }
      try {
        return { kind:'web', url:new URL('https://' + value).href };
      } catch {
        return { kind:'web', url:'https://www.google.com/search?igu=1&q=' + encodeURIComponent(value), search:true };
      }
    }

    function localPathFromURL(value) {
      let raw = value.replace(/^local:\/\//i, '').replace(/^\/+/, '');
      try { raw = decodeURIComponent(raw); } catch {}
      if (!raw) return null;
      if (raw.startsWith('home/user/')) return norm('/' + raw);
      return norm(raw, '/home/user');
    }

    function addHistory(tab, url) {
      tab.history = tab.history.slice(0, tab.index + 1);
      tab.history.push(url);
      tab.index = tab.history.length - 1;
    }

    function renderTabs() {
      tabsEl.innerHTML = '';
      for (const tab of tabs) {
        const wrap = document.createElement('div');
        wrap.className = 'web-tab' + (tab.id === activeId ? ' active' : '');
        wrap.dataset.tabId = tab.id;
        wrap.innerHTML = `<button class="web-tab-main" type="button"><span class="web-tab-icon">◎</span><span class="web-tab-title">${escapeHTML(tab.title || 'New tab')}</span></button><button class="web-tab-close" type="button" aria-label="Close tab">×</button>`;
        $('.web-tab-main', wrap).addEventListener('click', () => switchTab(tab.id));
        $('.web-tab-close', wrap).addEventListener('click', e => {
          e.stopPropagation();
          closeTab(tab.id);
        });
        tabsEl.appendChild(wrap);
      }
    }

    function updateControls() {
      const tab = activeTab();
      if (!tab) return;
      address.value = tab.url || 'pocket://home';
      backBtn.disabled = tab.index <= 0;
      forwardBtn.disabled = tab.index >= tab.history.length - 1;
      externalBtn.disabled = tab.kind === 'home' || tab.kind === 'mods' || tab.kind === 'error';
      renderTabs();
      renderBookmarksBar();
      setWindowTitle(win, (tab.title || 'New tab') + ' — Pocket Browser', '◎');
    }

    function showHome(tab) {
      tab.kind = 'home';
      tab.title = 'New tab';
      frame.removeAttribute('src');
      frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals allow-popups');
      frame.srcdoc = homePage();
      status.textContent = 'Pocket Browser home';
    }

    async function showMods(tab, token) {
      tab.kind = 'mods';
      tab.title = 'Snake Mods';
      frame.removeAttribute('src');
      frame.setAttribute('sandbox', 'allow-scripts');
      try {
        const html = await PocketStoreApp.modsPage();
        if (token !== navigationToken || activeId !== tab.id) return false;
        frame.srcdoc = html;
        status.textContent = 'PocketVM local mods index';
      } catch (err) {
        if (token !== navigationToken || activeId !== tab.id) return false;
        frame.setAttribute('sandbox', '');
        frame.srcdoc = errorPage('Mods unavailable', err?.message || 'The local mods page could not be opened.');
        status.textContent = 'Mods unavailable';
      }
      return true;
    }

    async function showLocal(tab, url, token) {
      const path = localPathFromURL(url);
      await refreshFS();
      if (token !== navigationToken || activeId !== tab.id) return false;
      const node = path && state.fs[path];
      tab.kind = 'local';
      if (!node || node.type !== 'file' || !/\.html$/i.test(path)) {
        tab.title = 'File not found';
        frame.removeAttribute('src');
        frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals allow-popups');
        frame.srcdoc = errorPage('Local page not found', 'Use an address like local://website.html for an HTML file stored in PocketVM Home.');
        status.textContent = 'Local page not found';
        return true;
      }
      tab.title = basename(path);
      frame.removeAttribute('src');
      // Deliberately no allow-same-origin: local HTML cannot reach PocketVM storage.
      frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals allow-popups allow-downloads');
      try {
        const html = await PocketDisk.readText(path);
        if (token !== navigationToken || activeId !== tab.id) return false;
        frame.srcdoc = html;
        status.textContent = 'Local PocketVM page · sandboxed';
      } catch {
        if (token !== navigationToken || activeId !== tab.id) return false;
        frame.srcdoc = errorPage('Could not read local page', 'The file may have been moved or deleted.');
        status.textContent = 'Local page unavailable';
      }
      return true;
    }

    function showWeb(tab, url) {
      tab.kind = 'web';
      tab.title = (() => {
        try { return new URL(url).hostname.replace(/^www\./, '') || 'Web'; }
        catch { return 'Web'; }
      })();
      frame.removeAttribute('srcdoc');
      let sandbox = 'allow-scripts allow-forms allow-modals allow-popups allow-downloads';
      try {
        if (new URL(url).origin !== location.origin) sandbox += ' allow-same-origin';
      } catch {}
      frame.setAttribute('sandbox', sandbox);
      frame.src = url;
      status.textContent = 'Loading…';
    }

    async function navigate(raw, push = true) {
      const tab = activeTab();
      if (!tab) return;
      const token = ++navigationToken;
      const target = normalizeInput(raw);
      tab.url = target.url;
      if (push) {
        addHistory(tab, target.url);
        if (target.kind === 'web' || target.kind === 'local') {
          state.browserData.history = [{url:target.url,time:Date.now()}, ...(state.browserData.history||[]).filter(x=>x.url!==target.url)].slice(0,60);
          saveBrowserData();
        }
      }

      if (target.kind === 'home') showHome(tab);
      else if (target.kind === 'mods') {
        const rendered = await showMods(tab, token);
        if (!rendered) return;
      }
      else if (target.kind === 'local') {
        const rendered = await showLocal(tab, target.url, token);
        if (!rendered) return;
      }
      else if (target.kind === 'web') showWeb(tab, target.url);
      else {
        tab.kind = 'error';
        tab.title = 'Unsupported address';
        frame.removeAttribute('src');
        frame.setAttribute('sandbox', '');
        frame.srcdoc = errorPage('Unsupported address', target.message || 'That address cannot be opened.');
        status.textContent = 'Unsupported address';
      }
      if (token !== navigationToken || activeId !== tab.id) return;
      updateControls();
    }

    function createTab(url = 'pocket://home') {
      const tab = { id:'tab-' + (++tabCounter), title:'New tab', url:'pocket://home', kind:'home', history:[], index:-1 };
      tabs.push(tab);
      activeId = tab.id;
      renderTabs();
      navigate(url, true);
      setTimeout(() => address.select(), 0);
    }

    function switchTab(id) {
      if (!tabs.some(t => t.id === id)) return;
      activeId = id;
      const tab = activeTab();
      navigate(tab.url, false);
    }

    function closeTab(id) {
      const idx = tabs.findIndex(t => t.id === id);
      if (idx < 0) return;
      const wasActive = id === activeId;
      tabs.splice(idx, 1);
      if (!tabs.length) {
        createTab();
        return;
      }
      if (wasActive) {
        activeId = tabs[Math.max(0, idx - 1)].id;
        switchTab(activeId);
      } else {
        renderTabs();
        updateControls();
      }
    }

    $('.web-address-form', win.el).addEventListener('submit', e => {
      e.preventDefault();
      navigate(address.value, true);
      address.blur();
    });
    $('.web-new-tab', win.el).addEventListener('click', () => createTab());
    $('[data-web-home]', win.el).addEventListener('click', () => navigate('pocket://home', true));
    $('[data-web-reload]', win.el).addEventListener('click', () => {
      const tab = activeTab();
      if (tab) navigate(tab.url, false);
    });
    backBtn.addEventListener('click', () => {
      const tab = activeTab();
      if (!tab || tab.index <= 0) return;
      tab.index--;
      tab.url = tab.history[tab.index];
      navigate(tab.url, false);
    });
    forwardBtn.addEventListener('click', () => {
      const tab = activeTab();
      if (!tab || tab.index >= tab.history.length - 1) return;
      tab.index++;
      tab.url = tab.history[tab.index];
      navigate(tab.url, false);
    });
    bookmarkBtn.addEventListener('click', () => {
      const tab=activeTab(); if(!tab || tab.kind==='home' || tab.kind==='mods' || tab.kind==='error') return;
      const items=state.browserData.bookmarks||[];
      const i=items.findIndex(x=>x.url===tab.url);
      if(i>=0){items.splice(i,1);notify('Bookmark removed',bookmarkLabel(tab.url),'☆');}
      else{items.unshift({url:tab.url,time:Date.now()});notify('Bookmarked',bookmarkLabel(tab.url),'★');}
      state.browserData.bookmarks=items;saveBrowserData();renderBookmarksBar();
    });
    historyBtn.addEventListener('click',()=>renderBrowserPanel('history'));

    externalBtn.addEventListener('click', () => {
      const tab = activeTab();
      if (!tab) return;
      if (tab.kind === 'web') window.open(tab.url, '_blank', 'noopener,noreferrer');
      else if (tab.kind === 'local') {
        const path = localPathFromURL(tab.url);
        if (path && state.fs[path]) openApp('preview', { file:path });
      }
    });
    address.addEventListener('focus', () => address.select());
    frame.addEventListener('load', () => {
      const tab = activeTab();
      if (tab?.kind === 'web') status.textContent = 'Loaded · if the page is blocked, use ↗';
    });

    const modsMessage = async event => {
      if (event.source !== frame.contentWindow || event.data?.type !== 'pocketvm-mods-action') return;
      try {
        await PocketStoreApp.handleModAction(event.data.action, event.data.id);
        if (event.data.action === 'open-files') return;
        const tab = activeTab();
        if (tab?.kind === 'mods') navigate('pocket:mods', false);
      } catch (err) {
        notify('Mod action failed', err?.message || 'Could not update the mod.', '!');
        const tab = activeTab();
        if (tab?.kind === 'mods') navigate('pocket:mods', false);
      }
    };
    window.addEventListener('message', modsMessage);
    const browserDiskRefresh = event => {
      const tab = activeTab();
      if (tab?.kind !== 'mods') return;
      const path = String(event.detail?.path || '');
      if (!path.startsWith('/home/user/Downloads')) return;
      clearTimeout(tab._modsRefresh);
      tab._modsRefresh = setTimeout(() => navigate('pocket:mods', false), 120);
    };
    window.addEventListener('pocketdiskchange', browserDiskRefresh);

    const browserKeys=e=>{
      if(!win.el.classList.contains('focused'))return;
      const mod=e.metaKey||e.ctrlKey;
      if(!mod)return;
      const k=e.key.toLowerCase();
      if(k==='l'){e.preventDefault();address.focus();address.select();}
      else if(k==='t'){e.preventDefault();createTab();}
      else if(k==='w'){e.preventDefault();const t=activeTab();if(t)closeTab(t.id);}
      else if(k==='r'){e.preventDefault();const t=activeTab();if(t)navigate(t.url,false);}
    };
    document.addEventListener('keydown',browserKeys);
    win.cleanup=()=>{document.removeEventListener('keydown',browserKeys);window.removeEventListener('message',modsMessage);window.removeEventListener('pocketdiskchange',browserDiskRefresh);};

    renderBookmarksBar();
    createTab();
  }

  // ---------- Notes ----------
  function buildNotes(win) {
    win.content.innerHTML = `
      <div class="notes-app">
        <div class="notes-toolbar"><strong>Quick Notes</strong><span style="flex:1"></span><span class="note-state">Saved locally</span></div>
        <textarea class="notes-area" spellcheck="true" placeholder="Write something…"></textarea>
      </div>`;
    const ta = $('.notes-area', win.el), status = $('.note-state', win.el);
    ta.value = localStorage.getItem('pocketvm.notes') || '';
    let timer;
    ta.addEventListener('input', () => {
      status.textContent = 'Saving…';
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem('pocketvm.notes', ta.value);
          status.textContent = 'Saved locally';
        } catch {
          status.textContent = 'Save failed';
        }
      }, 250);
    });
  }

  // ---------- System monitor ----------
  function formatUptime(ms) {
    const total=Math.floor(ms/1000), h=Math.floor(total/3600), m=Math.floor((total%3600)/60), s=total%60;
    return h ? h+'h '+m+'m' : m ? m+'m '+s+'s' : s+'s';
  }

  // ---------- Settings ----------  // ---------- Settings ----------
  function buildSettings(win) {
    win.content.innerHTML = `
      <div class="settings-shell">
        <aside class="settings-tabs" aria-label="Settings sections">
          <button data-settings-tab="appearance" class="active"><span>✦</span>Appearance</button>
          <button data-settings-tab="user"><span>☺</span>User</button>
          <button data-settings-tab="password"><span>●</span>Password</button>
          <button data-settings-tab="wallpaper"><span>▧</span>Wallpaper</button>
          <button data-settings-tab="storage"><span>◫</span>Storage</button>
          <button data-settings-tab="system"><span>⌘</span>System</button>
        </aside>
        <section class="settings-page"></section>
      </div>`;

    const page = $('.settings-page', win.el);
    let active = 'appearance';

    const selectTab = tab => {
      active = tab;
      $$('[data-settings-tab]', win.el).forEach(b => b.classList.toggle('active', b.dataset.settingsTab === tab));
      renderTab();
    };

    $$('[data-settings-tab]', win.el).forEach(btn => btn.addEventListener('click', () => selectTab(btn.dataset.settingsTab)));

    function renderTab() {
      if (active === 'appearance') renderAppearance();
      if (active === 'user') renderUser();
      if (active === 'password') renderPassword();
      if (active === 'wallpaper') renderWallpaper();
      if (active === 'storage') renderStorage();
      if (active === 'system') renderSystem();
    }

    function pageHead(title, subtitle) {
      return `<div class="settings-heading"><h2>${title}</h2><p>${subtitle}</p></div>`;
    }

    function renderAppearance() {
      page.innerHTML = pageHead('Appearance', 'Make the desktop feel like your PC.') + `
        <div class="setting-group">
          <div class="setting-row stack-on-small">
            <div><strong>Accent colour</strong><small>Changes windows, controls and highlights.</small></div>
            <div class="swatches"></div>
          </div>
          <div class="setting-row"><div><strong>Transparency</strong><small>Glass effects on windows and menus.</small></div><label class="switch"><input id="pref-transparency" type="checkbox" ${state.preferences.transparency !== false ? 'checked' : ''}><span></span></label></div>
          <div class="setting-row"><div><strong>Animations</strong><small>Window and menu motion.</small></div><label class="switch"><input id="pref-animations" type="checkbox" ${state.preferences.animations !== false ? 'checked' : ''}><span></span></label></div>
          <div class="setting-row"><div><strong>Centered taskbar</strong><small>Place pinned apps nearer the middle.</small></div><label class="switch"><input id="pref-centered" type="checkbox" ${state.preferences.taskbarCentered ? 'checked' : ''}><span></span></label></div>
          <div class="setting-row"><div><strong>Seconds in clock</strong><small>Show seconds in the taskbar clock.</small></div><label class="switch"><input id="pref-seconds" type="checkbox" ${state.preferences.clockSeconds ? 'checked' : ''}><span></span></label></div>
          <div class="setting-row"><div><strong>Desktop icon size</strong><small>Resize the desktop grid and app icons.</small></div><select id="pref-icon-size" class="settings-select"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div>
          <div class="setting-row stack-on-small"><div><strong>Desktop icons</strong><small>Choose which built-in apps appear on the desktop.</small></div><div class="desktop-icon-toggles"></div></div>
          <div class="setting-row"><div><strong>Install as app</strong><small>Safari → Share → Add to Home Screen</small></div><span>↗</span></div>
        </div>`;
      const sw = $('.swatches', page);
      Object.entries(themes).forEach(([name, c]) => {
        const b = document.createElement('button');
        b.className = `swatch ${state.theme === name ? 'selected' : ''}`;
        b.title = name;
        b.style.background = `linear-gradient(135deg,${c[0]},${c[1]})`;
        b.addEventListener('click', () => { applyTheme(name); renderAppearance(); });
        sw.appendChild(b);
      });
      const bind=(id,key)=>$('#'+id,page)?.addEventListener('change',e=>{state.preferences[key]=e.target.checked;applyPreferences();notify('Setting changed',key.replace(/([A-Z])/g,' $1'),'⚙');});
      bind('pref-transparency','transparency');
      bind('pref-animations','animations');
      bind('pref-centered','taskbarCentered');
      bind('pref-seconds','clockSeconds');

      const iconSize = $('#pref-icon-size', page);
      iconSize.value = state.preferences.desktopIconSize || 'medium';
      iconSize.addEventListener('change', e => {
        state.preferences.desktopIconSize = e.target.value;
        applyPreferences();
        initDesktopGrid();
      });

      const desktopChoices = [
        ['browser','Browser'],['store','Store'],['files','Files'],['calculator','Calculator'],['terminal','Terminal'],
        ['notes','Notes'],['monitor','System'],['taskmanager','Task Manager'],['settings','Settings']
      ];
      const toggleWrap = $('.desktop-icon-toggles', page);
      desktopChoices.forEach(([id,label]) => {
        const item = document.createElement('label');
        item.className = 'icon-toggle-chip';
        item.innerHTML = '<input type="checkbox" ' + (!state.preferences.desktopHidden.includes(id) ? 'checked' : '') + '><span>' + escapeHTML(label) + '</span>';
        $('input', item).addEventListener('change', e => {
          const hidden = new Set(state.preferences.desktopHidden || []);
          if (e.target.checked) hidden.delete(id); else hidden.add(id);
          state.preferences.desktopHidden = [...hidden];
          applyPreferences();
          initDesktopGrid();
        });
        toggleWrap.appendChild(item);
      });
    }

    function renderUser() {
      page.innerHTML = pageHead('User', 'Create a local profile for this PocketVM installation.') + `
        <div class="user-card">
          <div class="settings-avatar avatar"></div>
          <div class="user-card-copy"><strong>${escapeHTML(state.user.name || 'Guest')}</strong><span>Saved only in this browser</span></div>
        </div>
        <div class="setting-group">
          <div class="setting-row user-name-row">
            <label class="field-label"><strong>Name</strong><small>Used by the Start menu and terminal prompt.</small></label>
            <input id="user-name-input" class="settings-input" maxlength="32" value="${escapeHTML(state.user.name || 'Guest')}" />
          </div>
          <div class="setting-row stack-on-small">
            <div><strong>Profile picture</strong><small>JPG, PNG or WebP. PocketVM resizes it before saving.</small></div>
            <div class="inline-actions"><button class="soft-btn" id="choose-avatar">Choose image</button>${state.user.avatar ? '<button class="soft-btn" id="remove-avatar">Remove</button>' : ''}</div>
          </div>
          <div class="setting-row">
            <div><strong>Profile border</strong><small>Change the treatment around your avatar.</small></div>
            <select id="profile-border-style" class="settings-select"><option value="none">None</option><option value="ring">Ring</option><option value="double">Double</option><option value="glow">Glow</option></select>
          </div>
          <div class="setting-row">
            <div><strong>Border colour</strong><small>Used on the Start menu, lock screen and Settings.</small></div>
            <div class="profile-colour-control"><input id="profile-border-color" type="color" value="${escapeHTML(state.user.borderColor || '#8fc6ff')}"><span id="profile-border-hex">${escapeHTML(state.user.borderColor || '#8fc6ff')}</span></div>
          </div>
        </div>
        <div class="settings-footer"><span class="settings-message" aria-live="polite"></span><button class="primary-btn" id="save-user">Save user</button></div>
        <input class="hidden-file-input" id="avatar-input" type="file" accept="image/*" />`;
      paintAvatar($('.settings-avatar', page));
      const msg = $('.settings-message', page);
      const borderStyle = $('#profile-border-style', page);
      borderStyle.value = state.user.borderStyle || 'ring';
      borderStyle.addEventListener('change', e => {
        state.user.borderStyle = e.target.value;
        saveJSON('pocketvm.user', state.user);
        renderUserChrome();
        paintAvatar($('.settings-avatar', page));
      });
      $('#profile-border-color', page).addEventListener('input', e => {
        state.user.borderColor = e.target.value;
        $('#profile-border-hex', page).textContent = e.target.value;
        saveJSON('pocketvm.user', state.user);
        renderUserChrome();
        paintAvatar($('.settings-avatar', page));
      });

      $('#save-user', page).addEventListener('click', () => {
        const value = $('#user-name-input', page).value.trim().slice(0, 32) || 'Guest';
        state.user.name = value;
        saveJSON('pocketvm.user', state.user);
        renderUserChrome();
        msg.textContent = 'Saved.';
        $('.user-card-copy strong', page).textContent = value;
      });

      $('#choose-avatar', page).addEventListener('click', () => $('#avatar-input', page).click());
      $('#avatar-input', page).addEventListener('change', async e => {
        const file = e.target.files?.[0];
        if (!file) return;
        msg.textContent = 'Processing image…';
        try {
          state.user.avatar = await imageFileToDataURL(file, 384, 384, 0.84, true);
          if (!saveJSON('pocketvm.user', state.user)) throw new Error('Not enough browser storage.');
          renderUserChrome();
          renderUser();
        } catch (err) {
          msg.textContent = err.message || 'Could not use that image.';
        }
      });
      $('#remove-avatar', page)?.addEventListener('click', () => {
        state.user.avatar = '';
        saveJSON('pocketvm.user', state.user);
        renderUserChrome();
        renderUser();
      });
    }

    function renderPassword() {
      page.innerHTML = pageHead('Password', 'Change the local password for this PocketVM account.') + `
        <form id="password-form">
          <div class="setting-group">
            <div class="setting-row password-row">
              <label class="field-label"><strong>Current password</strong><small>Required before PocketVM will accept a new password.</small></label>
              <input id="current-password" class="settings-input" type="password" autocomplete="current-password" />
            </div>
            <div class="setting-row password-row">
              <label class="field-label"><strong>New password</strong><small>Use at least 4 characters.</small></label>
              <input id="new-password" class="settings-input" type="password" autocomplete="new-password" minlength="4" />
            </div>
            <div class="setting-row password-row">
              <label class="field-label"><strong>Confirm new password</strong><small>Type the new password again.</small></label>
              <input id="confirm-new-password" class="settings-input" type="password" autocomplete="new-password" minlength="4" />
            </div>
          </div>
          <div class="settings-footer"><span class="settings-message" aria-live="polite"></span><button class="primary-btn" type="submit">Change password</button></div>
        </form>
        <p class="privacy-note">The password is stored as a salted hash in this browser. PocketVM is a client-side project, so this login is for local privacy rather than high-security authentication.</p>`;

      const form = $('#password-form', page);
      const msg = $('.settings-message', page);
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const current = $('#current-password', page).value;
        const next = $('#new-password', page).value;
        const confirm = $('#confirm-new-password', page).value;
        msg.textContent = '';
        if (!state.auth) {
          msg.textContent = 'No local account exists yet.';
          return;
        }
        if (!(await verifyPassword(current))) {
          msg.textContent = 'Current password is incorrect.';
          return;
        }
        if (next.length < 4) {
          msg.textContent = 'Use at least 4 characters.';
          return;
        }
        if (next !== confirm) {
          msg.textContent = 'The new passwords do not match.';
          return;
        }
        try {
          await setPassword(next);
          form.reset();
          msg.textContent = 'Password changed.';
        } catch (err) {
          msg.textContent = err.message || 'Could not save the new password.';
        }
      });
    }

    function renderWallpaper() {
      page.innerHTML = pageHead('Wallpaper', 'Pick a built-in background or upload your own photo.') + `
        <div class="wallpaper-grid"></div>
        <div class="setting-group wallpaper-upload-row">
          <div class="setting-row stack-on-small">
            <div><strong>Custom wallpaper</strong><small>Your image is stored in the PocketVM Pictures folder on the virtual drive.</small></div>
            <div class="inline-actions"><button class="soft-btn" id="upload-wallpaper">Choose image</button>${state.wallpaper.type !== 'preset' ? '<button class="soft-btn" id="reset-wallpaper">Use default</button>' : ''}</div>
          </div>
        </div>
        <div class="settings-message" id="wallpaper-message" aria-live="polite"></div>
        <input class="hidden-file-input" id="wallpaper-input" type="file" accept="image/*" />`;
      const grid = $('.wallpaper-grid', page);
      Object.entries(wallpapers).forEach(([name, bg]) => {
        const b = document.createElement('button');
        b.className = `wallpaper-card ${state.wallpaper.type === 'preset' && state.wallpaper.value === name ? 'selected' : ''}`;
        b.innerHTML = `<span class="wallpaper-thumb"></span><span>${name[0].toUpperCase() + name.slice(1)}</span>`;
        $('.wallpaper-thumb', b).style.background = bg;
        b.addEventListener('click', () => {
          state.wallpaper = { type:'preset', value:name, dataUrl:'' };
          saveJSON('pocketvm.wallpaper', state.wallpaper);
          applyWallpaper();
          renderWallpaper();
        });
        grid.appendChild(b);
      });

      $('#upload-wallpaper', page).addEventListener('click', () => $('#wallpaper-input', page).click());
      $('#wallpaper-input', page).addEventListener('change', async e => {
        const file = e.target.files?.[0];
        if (!file) return;
        const msg = $('#wallpaper-message', page);
        msg.textContent = 'Saving wallpaper to the virtual drive…';
        try {
          const dataUrl = await imageFileToDataURL(file, 2560, 1800, 0.86, false);
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const path = '/home/user/Pictures/PocketVM Wallpaper ' + Date.now() + '.jpg';
          await PocketDisk.writeBlob(path, blob, 'image/jpeg');
          await refreshFS();
          await setWallpaperFromFile(path);
          renderWallpaper();
        } catch (err) {
          msg.textContent = err.message || 'Could not use that wallpaper.';
        }
        e.target.value = '';
      });
      $('#reset-wallpaper', page)?.addEventListener('click', () => {
        state.wallpaper = { type:'preset', value:'aurora', dataUrl:'' };
        saveJSON('pocketvm.wallpaper', state.wallpaper);
        applyWallpaper();
        renderWallpaper();
      });
    }

    function renderSystem() {
      const standalone=matchMedia('(display-mode: standalone)').matches;
      page.innerHTML = pageHead('System', 'PocketVM device information and useful shortcuts.') + `
        <div class="setting-group">
          <div class="setting-row"><div><strong>PocketVM version</strong><small>Current web desktop release.</small></div><strong>2.1</strong></div>
          <div class="setting-row"><div><strong>App mode</strong><small>Whether PocketVM is running from the Home Screen.</small></div><strong>${standalone?'Installed':'Browser tab'}</strong></div>
          <div class="setting-row"><div><strong>Connection</strong><small>Current browser network state.</small></div><strong>${navigator.onLine?'Online':'Offline'}</strong></div>
        </div>
        <div class="shortcut-card"><h3>Keyboard shortcuts</h3>
          <div><kbd>⌘/Ctrl</kbd><kbd>E</kbd><span>Files</span></div>
          <div><kbd>⌘/Ctrl</kbd><kbd>B</kbd><span>Browser</span></div>
          <div><kbd>⌘/Ctrl</kbd><kbd>Alt</kbd><kbd>L</kbd><span>Lock PocketVM</span></div>
          <div><kbd>⌘/Ctrl</kbd><kbd>D</kbd><span>Show desktop</span></div>
          <div><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>Esc</kbd><span>Task Manager</span></div>
          <div><kbd>⌘/Ctrl</kbd><kbd>← / →</kbd><span>Snap focused window</span></div>
        </div>`;
    }

    async function renderStorage() {
      const stats = await PocketDisk.stats();
      if (active !== 'storage') return;
      const pct = Math.min(100, stats.used / stats.max * 100);
      page.innerHTML = pageHead('Storage', 'PocketVM files and images live on a 1 GB IndexedDB virtual drive.') + `
        <div class="storage-hero">
          <div class="storage-disk-icon">◫</div>
          <div class="storage-disk-copy"><span>Local Disk</span><strong>${PocketDisk.formatBytes(stats.used)} used</strong><small>${PocketDisk.formatBytes(stats.free)} free of 1.00 GB</small></div>
          <div class="storage-percent">${pct.toFixed(pct < 1 ? 1 : 0)}%</div>
          <div class="storage-track"><i style="width:${pct}%"></i></div>
        </div>
        <div class="setting-group">
          <div class="setting-row"><div><strong>Virtual capacity</strong><small>PocketVM's own maximum.</small></div><strong>1.00 GB</strong></div>
          <div class="setting-row"><div><strong>Browser quota</strong><small>Safari may enforce a smaller device/browser limit.</small></div><strong>${stats.browserQuota ? PocketDisk.formatBytes(stats.browserQuota) : 'Not exposed'}</strong></div>
          <div class="setting-row"><div><strong>Persistence</strong><small>Whether the browser granted persistent storage.</small></div><strong>${stats.persisted ? 'Granted' : 'Best effort'}</strong></div>
          <div class="setting-row"><div><strong>Open drive</strong><small>Browse Desktop, Documents, Downloads and Pictures.</small></div><button class="soft-btn" id="open-drive">Open Files</button></div>
          <div class="setting-row"><div><strong>Erase virtual drive</strong><small>Deletes user files while keeping the PocketVM account and settings.</small></div><button class="danger-btn" id="reset-fs">Erase files</button></div>
        </div>
        <p class="privacy-note">Files are stored in IndexedDB. Account preferences remain in local browser storage. <code>null.user</code> deletes both and returns PocketVM to first-time setup.</p>`;
      $('#open-drive', page).addEventListener('click', () => openApp('files'));
      $('#reset-fs', page).addEventListener('click', async () => {
        if (!confirm('Erase every file on the PocketVM virtual drive? This cannot be undone.')) return;
        const button = $('#reset-fs', page);
        button.disabled = true;
        button.textContent = 'Erasing…';
        try {
          await PocketDisk.clearDrive();
          await refreshFS();
          if (state.wallpaper.type === 'file') {
            state.wallpaper = { type:'preset', value:'aurora', dataUrl:'' };
            saveJSON('pocketvm.wallpaper', state.wallpaper);
            applyWallpaper();
          }
          for (const w of [...state.windows.values()]) {
            if (w.appId === 'editor' || w.appId === 'preview' || w.appId === 'imageviewer') closeWindow(w.id);
          }
          renderStorage();
          notify('Drive erased', 'PocketVM files were deleted. System folders were recreated.', '◫');
        } catch (err) {
          button.disabled = false;
          button.textContent = 'Erase files';
          alert(err.message || 'Could not erase the drive.');
        }
      });
    }

    renderTab();
  }

  function imageFileToDataURL(file, maxW, maxH, quality = 0.82, squareCrop = false) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please choose an image file.'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read that image.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not decode that image.'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Image processing is unavailable.'));
            return;
          }

          if (squareCrop) {
            const side = Math.min(img.naturalWidth, img.naturalHeight);
            const sx = (img.naturalWidth - side) / 2;
            const sy = (img.naturalHeight - side) / 2;
            const out = Math.min(maxW, maxH, side);
            canvas.width = out;
            canvas.height = out;
            ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);
          } else {
            const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
            canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ---------- Local account / login ----------
  const AUTH_KEY = 'pocketvm.auth';
  const LOCKOUT_MS = 60_000;
  let authTicker = null;
  let currentPuzzle = null;

  function bytesToBase64(bytes) {
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, c => c.charCodeAt(0));
  }

  async function derivePassword(password, saltBase64, algorithm = 'pbkdf2') {
    if (algorithm === 'pbkdf2' && globalThis.crypto?.subtle) {
      const key = await globalThis.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
      );
      const bits = await globalThis.crypto.subtle.deriveBits({
        name: 'PBKDF2',
        salt: base64ToBytes(saltBase64),
        iterations: 120000,
        hash: 'SHA-256'
      }, key, 256);
      return bytesToBase64(new Uint8Array(bits));
    }

    // Fallback for non-secure/local-file contexts where SubtleCrypto is unavailable.
    let h1 = 0x811c9dc5;
    const input = `${saltBase64}:${password}`;
    for (let round = 0; round < 16000; round++) {
      for (let i = 0; i < input.length; i++) {
        h1 ^= input.charCodeAt(i) + round;
        h1 = Math.imul(h1, 0x01000193) >>> 0;
      }
    }
    return `fallback-${h1.toString(16).padStart(8, '0')}`;
  }

  async function setPassword(password) {
    const saltBytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(saltBytes);
    const salt = bytesToBase64(saltBytes);
    const algorithm = globalThis.crypto?.subtle ? 'pbkdf2' : 'fallback';
    const hash = await derivePassword(password, salt, algorithm);
    const nextAuth = {
      version: 1,
      algorithm,
      salt,
      hash,
      failedAttempts: 0,
      lockUntil: 0,
      createdAt: state.auth?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    if (!saveJSON(AUTH_KEY, nextAuth)) throw new Error('PocketVM could not save the password. Browser storage may be full.');
    state.auth = nextAuth;
  }

  async function verifyPassword(password) {
    if (!state.auth?.hash || !state.auth?.salt) return false;
    try {
      const hash = await derivePassword(password, state.auth.salt, state.auth.algorithm || 'pbkdf2');
      return hash === state.auth.hash;
    } catch {
      return false;
    }
  }

  function saveAuthState() {
    if (state.auth) saveJSON(AUTH_KEY, state.auth);
  }

  function authRemainingMs() {
    return Math.max(0, Number(state.auth?.lockUntil || 0) - Date.now());
  }

  function clearExpiredLockout() {
    if (!state.auth) return;
    if (state.auth.lockUntil && authRemainingMs() <= 0) {
      state.auth.lockUntil = 0;
      state.auth.failedAttempts = 0;
      saveAuthState();
    }
  }

  async function setAuthWallpaper() {
    const el = $('.auth-wallpaper');
    if (!el) return;
    el.style.background = await wallpaperCSS('auth');
  }

  function enterDesktop() {
    if (authTicker) clearInterval(authTicker);
    authTicker = null;
    $('#auth-screen').hidden = true;
    $('#desktop').removeAttribute('inert');
    $('#desktop').hidden = false;
    applyWallpaper();
    renderUserChrome();
    requestAnimationFrame(placeDesktopIcons);
  }

  function showAuthScreen(mode = state.auth ? 'login' : 'setup') {
    if (authTicker) clearInterval(authTicker);
    authTicker = null;
    clearExpiredLockout();
    $('#start-menu').hidden = true;
    $('#start-btn').classList.remove('active');
    document.activeElement?.blur?.();
    $('#desktop').setAttribute('inert', '');
    $('#auth-screen').hidden = false;
    setAuthWallpaper();
    renderUserChrome();
    if (mode === 'setup' || !state.auth) renderSetupScreen();
    else if (mode === 'forgot') renderPuzzleScreen();
    else renderLoginScreen();
  }

  function renderSetupScreen() {
    const content = $('#auth-content');
    content.innerHTML = `
      <div class="auth-kicker"><span class="auth-kicker-dot"></span>First-time setup</div>
      <h1>Make PocketVM yours</h1>
      <p class="auth-copy">Create a local profile for this device. Choose a name and a password to get started.</p>
      <form id="setup-form" class="auth-form">
        <label>Name<input id="setup-name" class="auth-input" maxlength="32" autocomplete="name" value="${escapeHTML(state.user.name === 'Guest' ? '' : state.user.name)}" placeholder="Your name" /></label>
        <label>Password<input id="setup-password" class="auth-input" type="password" minlength="4" autocomplete="new-password" placeholder="At least 4 characters" /></label>
        <label>Confirm password<input id="setup-confirm" class="auth-input" type="password" minlength="4" autocomplete="new-password" placeholder="Type it again" /></label>
        <div class="auth-message" aria-live="polite"></div>
        <button class="auth-primary" type="submit">Create account</button>
      </form>
      <p class="auth-note">Stored only on this device. PocketVM never sends this account to a server.</p>`;
    paintAvatar($('#auth-avatar'));
    if (!state.user.avatar && (!state.user.name || state.user.name === 'Guest')) $('#auth-avatar').textContent = 'PV';
    const form = $('#setup-form');
    const msg = $('.auth-message', form);
    setTimeout(() => $('#setup-name')?.focus(), 0);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const name = $('#setup-name').value.trim().slice(0, 32);
      const password = $('#setup-password').value;
      const confirm = $('#setup-confirm').value;
      if (!name) {
        msg.textContent = 'Choose a name.';
        return;
      }
      if (password.length < 4) {
        msg.textContent = 'Use at least 4 characters for the password.';
        return;
      }
      if (password !== confirm) {
        msg.textContent = 'Those passwords do not match.';
        return;
      }
      msg.textContent = 'Creating account…';
      state.user.name = name;
      saveJSON('pocketvm.user', state.user);
      try {
        await setPassword(password);
      } catch (err) {
        msg.textContent = err.message || 'Could not save the account.';
        return;
      }
      renderUserChrome();
      enterDesktop();
    });
  }

  function renderLoginScreen() {
    clearExpiredLockout();
    const content = $('#auth-content');
    content.innerHTML = `
      <div class="auth-kicker"><span class="auth-kicker-dot"></span>Welcome back</div>
      <h1 id="auth-user-name">${escapeHTML(state.user.name || 'Guest')}</h1>
      <p class="auth-copy">Enter your password to unlock your PocketVM.</p>
      <form id="login-form" class="auth-form">
        <label>Password<input id="login-password" class="auth-input" type="password" autocomplete="current-password" placeholder="Password" /></label>
        <div class="auth-message" aria-live="polite"></div>
        <button class="auth-primary" id="login-submit" type="submit">Sign in</button>
        <button class="auth-link" id="forgot-password" type="button">Forgot password?</button>
      </form>`;
    paintAvatar($('#auth-avatar'));
    const form = $('#login-form');
    const input = $('#login-password');
    const submit = $('#login-submit');
    const forgot = $('#forgot-password');
    const msg = $('.auth-message', form);

    const refreshLockout = () => {
      const remaining = authRemainingMs();
      if (remaining <= 0) {
        if (state.auth?.lockUntil) {
          state.auth.lockUntil = 0;
          state.auth.failedAttempts = 0;
          saveAuthState();
        }
        input.disabled = false;
        submit.disabled = false;
        forgot.disabled = false;
        if (msg.dataset.lockout === '1') msg.textContent = '';
        msg.dataset.lockout = '0';
        if (authTicker) clearInterval(authTicker);
        authTicker = null;
        input.focus();
        return;
      }
      const seconds = Math.ceil(remaining / 1000);
      input.disabled = true;
      submit.disabled = true;
      forgot.disabled = true;
      msg.dataset.lockout = '1';
      msg.textContent = `Too many wrong attempts. Try again in ${seconds}s.`;
    };

    refreshLockout();
    if (authRemainingMs() > 0) authTicker = setInterval(refreshLockout, 250);
    else setTimeout(() => input.focus(), 0);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      clearExpiredLockout();
      if (authRemainingMs() > 0) {
        refreshLockout();
        return;
      }
      submit.disabled = true;
      msg.textContent = 'Checking…';
      const ok = await verifyPassword(input.value);
      if (ok) {
        state.auth.failedAttempts = 0;
        state.auth.lockUntil = 0;
        saveAuthState();
        input.value = '';
        enterDesktop();
        return;
      }

      state.auth.failedAttempts = Number(state.auth.failedAttempts || 0) + 1;
      if (state.auth.failedAttempts >= 3) {
        state.auth.failedAttempts = 0;
        state.auth.lockUntil = Date.now() + LOCKOUT_MS;
        saveAuthState();
        refreshLockout();
        if (!authTicker) authTicker = setInterval(refreshLockout, 250);
      } else {
        saveAuthState();
        const left = 3 - state.auth.failedAttempts;
        msg.textContent = `Wrong password. ${left} ${left === 1 ? 'try' : 'tries'} left before a 1 minute lock.`;
        submit.disabled = false;
        input.select();
      }
    });

    forgot.addEventListener('click', () => {
      if (authRemainingMs() > 0) return;
      showAuthScreen('forgot');
    });
  }

  function newPuzzle() {
    const a = 2 + Math.floor(Math.random() * 8);
    const b = 2 + Math.floor(Math.random() * 8);
    const subtract = Math.random() < 0.35;
    if (subtract) {
      const hi = Math.max(a, b);
      const lo = Math.min(a, b);
      currentPuzzle = { question: `${hi} − ${lo}`, answer: hi - lo };
    } else {
      currentPuzzle = { question: `${a} + ${b}`, answer: a + b };
    }
  }

  function renderPuzzleScreen() {
    if (authRemainingMs() > 0) {
      renderLoginScreen();
      return;
    }
    newPuzzle();
    const content = $('#auth-content');
    content.innerHTML = `
      <div class="auth-kicker">Account recovery</div>
      <h1>Quick verification</h1>
      <p class="auth-copy">Solve this easy puzzle to unlock PocketVM.</p>
      <form id="puzzle-form" class="auth-form">
        <div class="puzzle-box"><span>What is</span><strong>${currentPuzzle.question}?</strong></div>
        <label>Answer<input id="puzzle-answer" class="auth-input" inputmode="numeric" autocomplete="off" placeholder="Answer" /></label>
        <div class="auth-message" aria-live="polite"></div>
        <button class="auth-primary" type="submit">Verify and enter</button>
        <button class="auth-link" id="back-to-login" type="button">Back to password</button>
      </form>`;
    paintAvatar($('#auth-avatar'));
    const form = $('#puzzle-form');
    const input = $('#puzzle-answer');
    const msg = $('.auth-message', form);
    setTimeout(() => input.focus(), 0);
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (Number(input.value.trim()) === currentPuzzle.answer) {
        state.auth.failedAttempts = 0;
        state.auth.lockUntil = 0;
        saveAuthState();
        enterDesktop();
      } else {
        msg.textContent = 'Not quite. Here is another one.';
        setTimeout(() => renderPuzzleScreen(), 500);
      }
    });
    $('#back-to-login').addEventListener('click', () => showAuthScreen('login'));
  }

  function buildAbout(win) {
    win.content.innerHTML = `<div class="app-pad"><div class="about-logo">PV</div><h2>PocketVM 2.1</h2><p>A touch-first browser PC built for iPad and static hosting.</p><p style="color:var(--muted)">PocketVM uses a 1 GB IndexedDB virtual drive and includes a windowed desktop, Files, image support, Browser, Store, games, Photos, Calculator, Task Manager, System, notifications and local accounts.</p><div class="setting-group"><div class="setting-row"><span>Desktop shell</span><strong>2.1</strong></div><div class="setting-row"><span>Terminal</span><strong>null.user only</strong></div><div class="setting-row"><span>Virtual drive</span><strong>1 GB max</strong></div><div class="setting-row"><span>Files</span><strong>TXT / HTML / images</strong></div><div class="setting-row"><span>PWA</span><strong>Offline ready</strong></div></div></div>`;
  }

  // ---------- PocketVM desktop layer ----------
  function buildCalculator(win) {
    setWindowTitle(win, 'Calculator', '＋');
    win.content.innerHTML = '<div class="calculator-app"><div class="calc-mode">STANDARD</div><div class="calc-display"><div class="calc-expression"></div><div class="calc-value">0</div></div><div class="calc-grid"></div></div>';
    const valueEl=$('.calc-value',win.el), exprEl=$('.calc-expression',win.el), grid=$('.calc-grid',win.el);
    let expr='';
    const keys=['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','±','0','.','='];
    keys.forEach(k=>{const b=document.createElement('button');b.textContent=k;b.dataset.calc=k;if('÷×−+='.includes(k))b.classList.add('op');if(k==='=')b.classList.add('equals');grid.appendChild(b);});
    const render=()=>{exprEl.textContent=expr||'';valueEl.textContent=expr||'0';};
    const evaluate=()=>{
      if(!expr)return;
      try{
        const safe=expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/%/g,'/100');
        if(!/^[0-9+\-*/().\s]+$/.test(safe)) throw 0;
        const result=Function('"use strict";return ('+safe+')')();
        if(!Number.isFinite(result))throw 0;
        expr=String(Math.round((result+Number.EPSILON)*1e12)/1e12);
        exprEl.textContent='= '+expr; valueEl.textContent=expr;
      }catch{valueEl.textContent='Error';}
    };
    const press=k=>{
      if(k==='C'){expr='';render();return;}
      if(k==='⌫'){expr=expr.slice(0,-1);render();return;}
      if(k==='='){evaluate();return;}
      if(k==='±'){expr=expr? (expr.startsWith('-')?expr.slice(1):'-'+expr):'';render();return;}
      expr+=k;render();
    };
    grid.addEventListener('click',e=>{const b=e.target.closest('[data-calc]');if(b)press(b.dataset.calc);});
    const keydown=e=>{
      if(!win.el.classList.contains('focused'))return;
      const map={Enter:'=',Escape:'C',Backspace:'⌫','*':'×','/':'÷','-':'−'};
      const k=map[e.key]||e.key;
      if(/^[0-9.]$/.test(k)||['+','−','×','÷','%','=','C','⌫'].includes(k)){e.preventDefault();press(k);}
    };
    document.addEventListener('keydown',keydown);
    win.cleanup=()=>document.removeEventListener('keydown',keydown);
  }

  function notify(title, body='', icon='◇') {
    const item={id:Date.now()+Math.random(),title:String(title),body:String(body),icon:String(icon),time:Date.now()};
    state.notifications.unshift(item);
    state.notifications=state.notifications.slice(0,30);
    saveJSON('pocketvm.notifications',state.notifications);
    updateNotificationBadge();
    renderNotificationCenter();
    if(state.preferences.focusMode)return;
    const layer=$('#toast-layer'); if(!layer)return;
    const toast=document.createElement('div'); toast.className='toast';
    toast.innerHTML='<span class="toast-icon">'+escapeHTML(item.icon)+'</span><div><strong>'+escapeHTML(item.title)+'</strong><p>'+escapeHTML(item.body)+'</p></div><button aria-label="Dismiss">×</button>';
    $('button',toast).addEventListener('click',()=>toast.remove());
    layer.appendChild(toast);
    requestAnimationFrame(()=>toast.classList.add('show'));
    setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),250);},4200);
  }

  function updateNotificationBadge(){
    const b=$('#notify-btn'); if(!b)return;
    const n=state.notifications.length;
    b.textContent=n? (n>9?'9+':String(n)) : '○';
    b.classList.toggle('has-notifications',n>0);
  }

  function renderNotificationCenter(){
    const panel=$('#notification-center'); if(!panel)return;
    panel.innerHTML='<div class="flyout-head"><div><strong>Notifications</strong><small>'+state.notifications.length+' saved locally</small></div><button data-clear-notifications>Clear</button></div><div class="notification-list"></div>';
    const list=$('.notification-list',panel);
    if(!state.notifications.length) list.innerHTML='<div class="empty-notifications"><span>✓</span><strong>You’re all caught up</strong><small>No notifications right now.</small></div>';
    state.notifications.forEach(n=>{const d=document.createElement('div');d.className='notification-item';d.innerHTML='<span>'+escapeHTML(n.icon)+'</span><div><strong>'+escapeHTML(n.title)+'</strong><p>'+escapeHTML(n.body)+'</p><small>'+new Date(n.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'</small></div>';list.appendChild(d);});
    $('[data-clear-notifications]',panel)?.addEventListener('click',()=>{state.notifications=[];saveJSON('pocketvm.notifications',state.notifications);updateNotificationBadge();renderNotificationCenter();});
  }

  function renderCalendar(){
    const panel=$('#calendar-panel'); if(!panel)return;
    const now=new Date(), y=now.getFullYear(), m=now.getMonth();
    const first=new Date(y,m,1), start=(first.getDay()+6)%7, days=new Date(y,m+1,0).getDate();
    let cells='';
    for(let i=0;i<start;i++)cells+='<span></span>';
    for(let d=1;d<=days;d++)cells+='<button class="'+(d===now.getDate()?'today':'')+'">'+d+'</button>';
    panel.innerHTML='<div class="calendar-hero"><strong>'+now.toLocaleDateString([],{weekday:'long'})+'</strong><span>'+now.toLocaleDateString([],{day:'numeric',month:'long',year:'numeric'})+'</span></div><div class="calendar-month"><h3>'+now.toLocaleDateString([],{month:'long',year:'numeric'})+'</h3><div class="calendar-week"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div><div class="calendar-grid">'+cells+'</div></div>';
  }

  function renderQuickSettings(){
    const p=$('#quick-panel'); if(!p)return;
    p.innerHTML='<div class="quick-top"><strong>Quick settings</strong><span>'+escapeHTML(navigator.onLine?'Online':'Offline')+'</span></div><div class="quick-grid">'+
      '<button class="quick-tile '+(navigator.onLine?'active':'')+'" data-quick="network"><span>⌁</span><strong>Network</strong><small>'+(navigator.onLine?'Connected':'Offline')+'</small></button>'+
      '<button class="quick-tile '+(state.preferences.focusMode?'active':'')+'" data-quick="focus"><span>◐</span><strong>Focus</strong><small>'+(state.preferences.focusMode?'On':'Off')+'</small></button>'+
      '<button class="quick-tile '+(state.preferences.transparency!==false?'active':'')+'" data-quick="glass"><span>◇</span><strong>Glass</strong><small>'+(state.preferences.transparency!==false?'On':'Off')+'</small></button>'+
      '<button class="quick-tile" data-quick="fullscreen"><span>⛶</span><strong>Full screen</strong><small>Display</small></button></div>'+
      '<div class="quick-footer"><button data-open-settings>⚙ Open Settings</button><span>'+escapeHTML(state.user.name||'Guest')+'</span></div>';
    $('[data-quick="focus"]',p)?.addEventListener('click',()=>{state.preferences.focusMode=!state.preferences.focusMode;applyPreferences();renderQuickSettings();});
    $('[data-quick="glass"]',p)?.addEventListener('click',()=>{state.preferences.transparency=state.preferences.transparency===false;applyPreferences();renderQuickSettings();});
    $('[data-quick="fullscreen"]',p)?.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen?.();}catch{}});
    $('[data-open-settings]',p)?.addEventListener('click',()=>{p.hidden=true;openApp('settings');});
  }

  function hideShellFlyouts(except=null){
    ['#quick-panel','#calendar-panel','#notification-center'].forEach(sel=>{const el=$(sel);if(el&&el!==except)el.hidden=true;});
  }

  function toggleFlyout(el){
    if(!el)return;
    const opening=el.hidden;
    hideShellFlyouts(el);
    el.hidden=!opening;
  }

  function showDesktop(){
    const visible=[...state.windows.values()].filter(w=>!w.el.classList.contains('minimized'));
    if(visible.length){visible.forEach(w=>minimizeWindow(w.id));}
    else [...state.windows.values()].forEach(w=>restoreWindow(w.id));
  }

  function focusedWindow(){ return [...state.windows.values()].find(w=>w.el.classList.contains('focused')); }

  function snapWindow(win,zone){
    if(!win)return;
    if(win.maximized)unmaximizeWindow(win.id);
    const gap=8, task=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h'))||60;
    const h=innerHeight-task-gap*2, half=(innerWidth-gap*3)/2;
    win.el.classList.remove('maximized');
    win.maximized=false;
    win.el.style.transform='none';
    win.el.style.top=gap+'px';
    win.el.style.height=h+'px';
    if(zone==='left'){win.el.style.left=gap+'px';win.el.style.width=half+'px';}
    else if(zone==='right'){win.el.style.left=(half+gap*2)+'px';win.el.style.width=half+'px';}
    else if(zone==='full'){maximizeWindow(win.id);}
  }

  function updateSnapPreview(ev){
    const p=$('#snap-preview'); if(!p || !ev || innerWidth<700)return;
    const task=parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-h'))||60;
    const gap=8, h=innerHeight-task-gap*2, half=(innerWidth-gap*3)/2;
    if(ev.clientY<=22){p.hidden=false;Object.assign(p.style,{left:gap+'px',top:gap+'px',width:(innerWidth-gap*2)+'px',height:h+'px'});}
    else if(ev.clientX<=22){p.hidden=false;Object.assign(p.style,{left:gap+'px',top:gap+'px',width:half+'px',height:h+'px'});}
    else if(ev.clientX>=innerWidth-22){p.hidden=false;Object.assign(p.style,{left:(half+gap*2)+'px',top:gap+'px',width:half+'px',height:h+'px'});}
    else p.hidden=true;
  }

  function maybeSnapWindow(win,ev){
    if(!ev||innerWidth<700)return;
    $('#snap-preview').hidden=true;
    if(ev.clientY<=18){snapWindow(win,'full');return;}
    if(ev.clientX<=18){snapWindow(win,'left');return;}
    if(ev.clientX>=innerWidth-18){snapWindow(win,'right');}
  }

  async function createDesktopItem(kind){
    let name=prompt(kind==='dir'?'Folder name':kind==='html'?'HTML file name':'Text file name');
    if(!name)return;
    name=String(name).trim().replace(/[\\/:*?"<>|]/g,'').slice(0,80);
    if(!name)return;
    if(kind==='txt'&&!/\.txt$/i.test(name))name+='.txt';
    if(kind==='html'&&!/\.html$/i.test(name))name+='.html';
    const p=norm(name,'/home/user/Desktop');
    await refreshFS();
    if(state.fs[p]){alert('That name already exists.');return;}
    try {
      if(kind==='dir') await PocketDisk.ensureDir(p);
      else await PocketDisk.writeText(p,kind==='html'?PocketFilesApp.htmlStarter(name):'',kind==='html'?'text/html':'text/plain');
      await refreshFS();
      notify(kind==='dir'?'Folder created':'File created',name,kind==='dir'?'📁':'📄');
      if(kind!=='dir')openApp('editor',{file:p}); else openApp('files',{path:'/home/user/Desktop'});
    } catch(err) {
      alert(err.message || 'Could not create the item.');
    }
  }

  function renderDesktopContext(x,y){
    const menu=$('#desktop-context'); if(!menu)return;
    menu.innerHTML='<button data-dctx="txt"><span>📄</span>New text file</button><button data-dctx="html"><span>🌐</span>New HTML file</button><button data-dctx="dir"><span>📁</span>New folder</button><hr><button data-dctx="files"><span>▤</span>Open Files</button><button data-dctx="settings"><span>⚙</span>Display settings</button><button data-dctx="refresh"><span>↻</span>Refresh</button>';
    menu.style.left=Math.min(x,innerWidth-220)+'px'; menu.style.top=Math.min(y,innerHeight-300)+'px'; menu.hidden=false;
    menu.querySelectorAll('[data-dctx]').forEach(b=>b.addEventListener('click',()=>{menu.hidden=true;const a=b.dataset.dctx;if(['txt','html','dir'].includes(a))createDesktopItem(a);if(a==='files')openApp('files');if(a==='settings')openApp('settings');if(a==='refresh')applyWallpaper();}));
  }

  function desktopGridMetrics() {
    const size = state.preferences.desktopIconSize || 'medium';
    if (size === 'small') return { cellW:72, cellH:78 };
    if (size === 'large') return { cellW:108, cellH:116 };
    return { cellW:90, cellH:96 };
  }

  function ensureDesktopLayout() {
    const icons = $$('.desktop-icon');
    const used = new Set();
    icons.forEach((icon, index) => {
      const id = icon.dataset.open;
      let slot = Number(state.desktopLayout[id]);
      if (!Number.isInteger(slot) || slot < 0 || used.has(slot)) {
        slot = index;
        while (used.has(slot)) slot++;
        state.desktopLayout[id] = slot;
      }
      used.add(slot);
    });
    saveJSON('pocketvm.desktopLayout', state.desktopLayout);
  }

  function placeDesktopIcons() {
    const host = $('#desktop-icons');
    if (!host) return;
    ensureDesktopLayout();
    const { cellW, cellH } = desktopGridMetrics();
    const rect = host.getBoundingClientRect();
    const cols = Math.max(1, Math.floor(rect.width / cellW));
    $$('.desktop-icon', host).forEach(icon => {
      const slot = Number(state.desktopLayout[icon.dataset.open] || 0);
      const row = Math.floor(slot / cols);
      const col = slot % cols;
      icon.style.gridColumn = String(col + 1);
      icon.style.gridRow = String(row + 1);
    });
  }

  function desktopSlotFromPoint(x, y) {
    const host = $('#desktop-icons');
    if (!host) return 0;
    const rect = host.getBoundingClientRect();
    const { cellW, cellH } = desktopGridMetrics();
    const cols = Math.max(1, Math.floor(rect.width / cellW));
    const col = clamp(Math.floor((x - rect.left) / cellW), 0, cols - 1);
    const row = Math.max(0, Math.floor((y - rect.top) / cellH));
    return row * cols + col;
  }

  function moveDesktopIcon(id, targetSlot) {
    const current = Number(state.desktopLayout[id] || 0);
    const other = Object.entries(state.desktopLayout).find(([otherId, slot]) => otherId !== id && Number(slot) === Number(targetSlot));
    if (other) state.desktopLayout[other[0]] = current;
    state.desktopLayout[id] = targetSlot;
    saveJSON('pocketvm.desktopLayout', state.desktopLayout);
    placeDesktopIcons();
  }

  function renderDesktopIconContext(icon, x, y) {
    const menu = $('#desktop-context');
    if (!menu || !icon) return;
    const id = icon.dataset.open;
    const label = icon.textContent.trim() || id;
    menu.innerHTML =
      '<button data-icon-action="open"><span>↗</span>Open ' + escapeHTML(label) + '</button>' +
      '<button data-icon-action="remove"><span>−</span>Remove from desktop</button>' +
      '<hr><button data-icon-action="settings"><span>⚙</span>Personalization</button>';
    menu.style.left = Math.min(x, innerWidth - 230) + 'px';
    menu.style.top = Math.min(y, innerHeight - 210) + 'px';
    menu.hidden = false;
    $$('[data-icon-action]', menu).forEach(button => button.addEventListener('click', () => {
      menu.hidden = true;
      const action = button.dataset.iconAction;
      if (action === 'open') openApp(id);
      if (action === 'remove') {
        if (icon.dataset.storeLaunch === 'snake-desktop' && window.PocketStoreApp) {
          PocketStoreApp.toggleDesktopPin(false);
        } else if (icon.dataset.storeLaunch === 'deadwave-desktop' && window.PocketStoreApp) {
          PocketStoreApp.toggleDeadwavePin(false);
        } else {
          const hidden = new Set(state.preferences.desktopHidden || []);
          hidden.add(id);
          state.preferences.desktopHidden = [...hidden];
          applyPreferences();
          initDesktopGrid();
          notify('Removed from desktop', label + ' is still available from Start.', '−');
        }
      }
      if (action === 'settings') openApp('settings');
    }));
  }

  function initDesktopGrid() {
    const host = $('#desktop-icons');
    if (!host) return;
    ensureDesktopLayout();
    placeDesktopIcons();

    $$('.desktop-icon', host).forEach(icon => {
      if (icon.dataset.desktopDragReady === '1') return;
      icon.dataset.desktopDragReady = '1';

      let startX = 0, startY = 0, dragging = false, moved = false, holdTimer = null, suppressClick = false;

      icon.addEventListener('contextmenu', e => {
        e.preventDefault();
        e.stopPropagation();
        renderDesktopIconContext(icon, e.clientX, e.clientY);
      });

      icon.addEventListener('pointerdown', e => {
        if (e.button != null && e.button !== 0) return;
        startX = e.clientX;
        startY = e.clientY;
        dragging = false;
        moved = false;
        suppressClick = false;
        if (e.pointerType === 'touch') {
          holdTimer = setTimeout(() => {
            if (!moved) {
              suppressClick = true;
              renderDesktopIconContext(icon, startX, startY);
              navigator.vibrate?.(18);
            }
          }, 650);
        }
        try { icon.setPointerCapture(e.pointerId); } catch {}
      });

      icon.addEventListener('pointermove', e => {
        if (!icon.hasPointerCapture?.(e.pointerId)) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragging && Math.hypot(dx, dy) > 8) {
          dragging = true;
          moved = true;
          clearTimeout(holdTimer);
          icon.classList.add('desktop-icon-dragging');
          icon.style.zIndex = '20';
        }
        if (dragging) {
          e.preventDefault();
          icon.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.04)';
        }
      });

      const finish = (e, commit = true) => {
        clearTimeout(holdTimer);
        if (dragging && commit) {
          const target = desktopSlotFromPoint(e.clientX, e.clientY);
          moveDesktopIcon(icon.dataset.open, target);
          suppressClick = true;
        }
        dragging = false;
        icon.classList.remove('desktop-icon-dragging');
        icon.style.transform = '';
        icon.style.zIndex = '';
        try { icon.releasePointerCapture(e.pointerId); } catch {}
      };

      icon.addEventListener('pointerup', e => finish(e, true));
      icon.addEventListener('pointercancel', e => finish(e, false));
      icon.addEventListener('click', e => {
        if (suppressClick) {
          e.preventDefault();
          e.stopImmediatePropagation();
          suppressClick = false;
        }
      }, true);
    });
  }

  function initDesktopExperience(){
    initDesktopGrid();
    renderQuickSettings(); renderCalendar(); renderNotificationCenter(); updateNotificationBadge();
    $('#quick-btn')?.addEventListener('click',e=>{e.stopPropagation();renderQuickSettings();toggleFlyout($('#quick-panel'));});
    $('#clock-btn')?.addEventListener('click',e=>{e.stopPropagation();renderCalendar();toggleFlyout($('#calendar-panel'));});
    $('#notify-btn')?.addEventListener('click',e=>{e.stopPropagation();renderNotificationCenter();toggleFlyout($('#notification-center'));});
    $('#show-desktop-btn')?.addEventListener('click',showDesktop);
    $('#shutdown-btn')?.addEventListener('click',shutdown);

    const search=$('#start-search-input');
    search?.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();document.querySelectorAll('.start-grid button').forEach(b=>b.hidden=!!q&&!b.textContent.toLowerCase().includes(q));});
    search?.addEventListener('keydown',e=>{if(e.key==='Enter'){const b=[...document.querySelectorAll('.start-grid button')].find(x=>!x.hidden);if(b)b.click();}});

    $('#desktop')?.addEventListener('contextmenu',e=>{if(e.target.closest('.window,.taskbar,.start-menu,.shell-flyout'))return;e.preventDefault();renderDesktopContext(e.clientX,e.clientY);});
    let desktopHoldTimer=null, desktopHoldX=0, desktopHoldY=0;
    $('#desktop')?.addEventListener('pointerdown',e=>{
      if(e.pointerType!=='touch' || e.target.closest('.window,.taskbar,.desktop-icon,.start-menu,.shell-flyout'))return;
      desktopHoldX=e.clientX; desktopHoldY=e.clientY;
      desktopHoldTimer=setTimeout(()=>{renderDesktopContext(desktopHoldX,desktopHoldY);navigator.vibrate?.(20);desktopHoldTimer=null;},650);
    });
    const cancelDesktopHold=()=>{clearTimeout(desktopHoldTimer);desktopHoldTimer=null;};
    $('#desktop')?.addEventListener('pointerup',cancelDesktopHold);
    $('#desktop')?.addEventListener('pointermove',e=>{if(desktopHoldTimer&&Math.hypot(e.clientX-desktopHoldX,e.clientY-desktopHoldY)>12)cancelDesktopHold();});
    $('#desktop')?.addEventListener('pointercancel',cancelDesktopHold);
    document.addEventListener('pointerdown',e=>{
      if(!e.target.closest('#desktop-context'))$('#desktop-context').hidden=true;
      if(!e.target.closest('.shell-flyout,#quick-btn,#clock-btn,#notify-btn'))hideShellFlyouts();
    });

    window.addEventListener('online',()=>{renderQuickSettings();notify('You’re online','Network connection restored.','⌁');});
    window.addEventListener('offline',()=>{renderQuickSettings();notify('You’re offline','PocketVM can still use cached apps and local files.','⌁');});

    document.addEventListener('keydown',e=>{
      const mod=e.metaKey||e.ctrlKey;
      if(e.key==='Escape'){hideShellFlyouts();$('#desktop-context').hidden=true;return;}
      if(e.altKey&&e.key==='F4'){const w=focusedWindow();if(w){e.preventDefault();closeWindow(w.id);}return;}
      if(e.ctrlKey&&e.shiftKey&&e.key==='Escape'){e.preventDefault();openApp('taskmanager');return;}
      if(!mod)return;
      const k=e.key.toLowerCase();
      if(k==='e'){e.preventDefault();openApp('files');}
      else if(k==='b'){e.preventDefault();openApp('browser');}
      else if(k==='d'){e.preventDefault();showDesktop();}
      else if(k==='l'&&e.altKey){e.preventDefault();lock();}
      else if(k===' '){e.preventDefault();$('#start-btn')?.click();setTimeout(()=>$('#start-search-input')?.focus(),0);}
      else if(e.key==='ArrowLeft'){const w=focusedWindow();if(w){e.preventDefault();snapWindow(w,'left');}}
      else if(e.key==='ArrowRight'){const w=focusedWindow();if(w){e.preventDefault();snapWindow(w,'right');}}
      else if(e.key==='ArrowUp'){const w=focusedWindow();if(w){e.preventDefault();snapWindow(w,'full');}}
    });

    if(!localStorage.getItem('pocketvm.welcome21')) setTimeout(()=>{notify('Welcome to PocketVM 2.1','Files, storage, image support and desktop polish are ready.','PV');localStorage.setItem('pocketvm.welcome21','1');},1500);
  }



  // ---------- Shell ----------
  function updateClock() {
    const d = new Date();
    const t = d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', ...(state.preferences.clockSeconds ? {second:'2-digit'} : {}) });
    const ds = d.toLocaleDateString([], { day:'2-digit', month:'short' });
    $('#clock').textContent = t;
    $('#date').textContent = ds;
    $('#auth-time').textContent = t;
    $('#auth-date').textContent = d.toLocaleDateString([], { weekday:'long', day:'numeric', month:'long' });
  }

  function shutdown() {
    for (const id of [...state.windows.keys()]) closeWindow(id);
    $('#desktop').hidden = true;
    $('#auth-screen').hidden = true;
    $('#boot').hidden = false;
    $('.boot-title').textContent = 'PocketVM is off';
    $('.boot-subtitle').textContent = 'Tap anywhere to start';
    $('.boot-bar').hidden = true;
    $('#boot').onclick = () => location.reload();
  }

  function lock() {
    showAuthScreen(state.auth ? 'login' : 'setup');
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-open]');
    if (!b) return;
    openApp(b.dataset.open);
    $('#start-menu').hidden = true;
    $('#start-btn').classList.remove('active');
  });
  $('#start-about').addEventListener('click', () => {
    openApp('about');
    $('#start-menu').hidden = true;
  });
  $('#start-btn').addEventListener('click', e => {
    e.stopPropagation();
    const m = $('#start-menu');
    m.hidden = !m.hidden;
    $('#start-btn').classList.toggle('active', !m.hidden);
  });
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
      $('#start-menu').hidden = true;
      $('#start-btn').classList.remove('active');
    }
  });
  $('#lock-btn').addEventListener('click', lock);
  $('#restart-btn').addEventListener('click', () => location.reload());
  $('#kbd-btn').addEventListener('click', () => {
    const activeTerminal = $('.window.focused .term-input');
    const activeEditor = $('.window.focused .editor-area');
    if (activeTerminal) activeTerminal.focus();
    else if (activeEditor) activeEditor.focus();
    else {
      const i = $('#mobile-keyboard');
      i.value = '';
      i.focus();
    }
  });

  initDesktopExperience();
  PocketStoreApp.init(storeAppContext());
  updateClock();
  setInterval(updateClock, 1000);
  renderUserChrome();

  window.addEventListener('resize', () => {
    placeDesktopIcons();
    for (const w of state.windows.values()) {
      if (w.maximized) continue;
      const r = w.el.getBoundingClientRect();
      if (r.left > innerWidth - 100) w.el.style.left = `${innerWidth - 100}px`;
      if (r.top > innerHeight - 100) w.el.style.top = `${innerHeight - 100}px`;
    }
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  setTimeout(() => {
    $('#boot').hidden = true;
    $('#desktop').hidden = true;
    applyWallpaper();
    renderUserChrome();
    showAuthScreen(state.auth ? 'login' : 'setup');
    // The terminal intentionally never opens automatically.
  }, 900);
})().catch(err => {
  console.error('PocketVM failed to start', err);
  const boot = document.getElementById('boot');
  if (boot) {
    boot.hidden = false;
    const title = boot.querySelector('.boot-title');
    const subtitle = boot.querySelector('.boot-subtitle');
    const bar = boot.querySelector('.boot-bar');
    if (title) title.textContent = 'PocketVM could not start';
    if (subtitle) subtitle.textContent = err?.message || 'Browser storage or a required feature is unavailable.';
    if (bar) bar.hidden = true;
  }
});