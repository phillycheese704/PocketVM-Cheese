(() => {
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

  const FS_SCHEMA = '2';
  const makeEmptyFS = () => ({
    '/': { type: 'dir' },
    '/home': { type: 'dir' },
    '/home/user': { type: 'dir' }
  });

  let initialFS;
  if (localStorage.getItem('pocketvm.fs.schema') !== FS_SCHEMA) {
    initialFS = makeEmptyFS();
    localStorage.setItem('pocketvm.fs', JSON.stringify(initialFS));
    localStorage.setItem('pocketvm.fs.schema', FS_SCHEMA);
  } else {
    initialFS = loadJSON('pocketvm.fs', makeEmptyFS());
  }

  const state = {
    z: 20,
    windows: new Map(),
    terminalCounter: 0,
    theme: localStorage.getItem('pocketvm.theme') || 'blue',
    auth: loadJSON('pocketvm.auth', null),
    user: loadJSON('pocketvm.user', { name: 'Guest', avatar: '' }),
    wallpaper: loadJSON('pocketvm.wallpaper', { type: 'preset', value: 'aurora', dataUrl: '' }),
    preferences: loadJSON('pocketvm.preferences', { transparency:true, animations:true, taskbarCentered:false, clockSeconds:false, focusMode:false }),
    notifications: loadJSON('pocketvm.notifications', []),
    browserData: loadJSON('pocketvm.browser', { bookmarks:[], history:[] }),
    bootedAt: Date.now(),
    fs: initialFS
  };

  const themes = {
    blue: ['#65a7ff', '#8f7cff'],
    mint: ['#5ee7c4', '#4da6ff'],
    sunset: ['#ff9b73', '#b276ff'],
    mono: ['#e7edf6', '#8794a8']
  };

  const wallpapers = {
    aurora: 'radial-gradient(circle at 25% 20%, rgba(65,102,255,.48), transparent 34%), radial-gradient(circle at 75% 65%, rgba(80,53,170,.48), transparent 32%), radial-gradient(circle at 60% 20%, rgba(0,190,255,.2), transparent 27%), linear-gradient(145deg,#090f1e 0%,#101a36 55%,#070b15 100%)',
    dusk: 'radial-gradient(circle at 20% 25%, rgba(255,125,105,.34), transparent 32%), radial-gradient(circle at 78% 68%, rgba(139,92,246,.42), transparent 36%), linear-gradient(145deg,#1b1020,#13152e 58%,#080b14)',
    ocean: 'radial-gradient(circle at 30% 22%, rgba(45,212,191,.26), transparent 33%), radial-gradient(circle at 72% 70%, rgba(14,165,233,.36), transparent 35%), linear-gradient(145deg,#06151b,#082f49 55%,#07111a)',
    graphite: 'radial-gradient(circle at 32% 25%, rgba(255,255,255,.11), transparent 28%), radial-gradient(circle at 70% 70%, rgba(148,163,184,.12), transparent 31%), linear-gradient(145deg,#090b0f,#181b21 58%,#07080b)'
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
    document.body.classList.toggle('solid-ui', p.transparency === false);
    document.body.classList.toggle('reduce-motion', p.animations === false);
    document.body.classList.toggle('center-taskbar', p.taskbarCentered === true);
    saveJSON('pocketvm.preferences', p);
  }

  function applyWallpaper() {
    const el = $('#desktop-wallpaper');
    if (!el) return;
    el.classList.toggle('custom-wallpaper', state.wallpaper.type === 'custom' && !!state.wallpaper.dataUrl);
    if (state.wallpaper.type === 'custom' && state.wallpaper.dataUrl) {
      el.style.background = `linear-gradient(rgba(4,8,16,.14), rgba(4,8,16,.18)), url("${state.wallpaper.dataUrl}") center / cover no-repeat`;
    } else {
      const key = wallpapers[state.wallpaper.value] ? state.wallpaper.value : 'aurora';
      el.style.background = wallpapers[key];
    }
  }

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
    if (state.user.avatar) {
      el.innerHTML = `<img src="${state.user.avatar}" alt="" />`;
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

  function persistFS() {
    return saveJSON('pocketvm.fs', state.fs);
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
    return /\.(txt|html)$/i.test(String(name || ''));
  }

  function setWindowTitle(win, title, icon) {
    $('.window-name', win.el).textContent = title;
    if (icon) $('.window-icon', win.el).textContent = icon;
    const btn = $(`.task-app[data-window-id="${CSS.escape(win.id)}"]`);
    if (btn) $('.task-label', btn).textContent = title;
  }

  const apps = {
    terminal: { name: 'Terminal', icon: '›_', width: 790, height: 500, singleton: false, build: buildTerminal },
    files: { name: 'Files', icon: '▤', width: 860, height: 560, singleton: true, build: buildFiles },
    calculator: { name: 'Calculator', icon: '＋', width: 380, height: 560, singleton: true, build: buildCalculator },
    notes: { name: 'Notes', icon: '✎', width: 680, height: 480, singleton: true, build: buildNotes },
    editor: { name: 'Editor', icon: '⌘', width: 790, height: 560, singleton: false, build: buildEditor },
    preview: { name: 'HTML Preview', icon: '◉', width: 850, height: 600, singleton: false, build: buildPreview },
    browser: { name: 'Pocket Browser', icon: '◎', width: 980, height: 650, singleton: true, build: buildWebBrowser },
    monitor: { name: 'System Monitor', icon: '⌁', width: 620, height: 470, singleton: true, build: buildMonitor },
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
    app.build(win, options);
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
      };
      const up = ev => {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        maybeSnapWindow(win, ev);
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
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
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
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

  function closeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.cleanup?.();
    win.el.remove();
    $(`.task-app[data-window-id="${CSS.escape(id)}"]`)?.remove();
    state.windows.delete(id);
  }

  function minimizeWindow(id) {
    const win = state.windows.get(id);
    if (!win) return;
    win.el.classList.add('minimized');
    win.el.classList.remove('focused');
    $(`.task-app[data-window-id="${CSS.escape(id)}"]`)?.classList.remove('active');
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
      print(term, 'Erasing PocketVM local data…', 'error');
      localStorage.clear();
      setTimeout(() => location.reload(), 350);
      return;
    }

    print(term, `${raw}: command not found`, 'error');
  }

  // ---------- Files ----------
  function buildFiles(win, options = {}) {
    let current = options.path || '/home/user';
    win.content.innerHTML = `
      <div class="files-app">
        <aside class="files-sidebar">
          <button class="active" data-path="/home/user">⌂ Home</button>
          <div class="files-side-note"><strong>Your files</strong><span>Stored locally on this device.</span></div>
        </aside>
        <div class="files-main">
          <div class="files-toolbar">
            <div class="files-path"></div>
            <span class="files-spacer"></span>
            <button class="soft-btn" data-new-folder>+ Folder</button>
            <button class="soft-btn" data-new="txt">+ Text</button>
            <button class="soft-btn" data-new="html">+ HTML</button>
            <button class="soft-btn" data-import>Import</button>
            <input class="hidden-file-input" id="files-import" type="file" accept=".txt,.html,text/plain,text/html" multiple />
          </div>
          <div class="file-grid"></div>
        </div>
      </div>`;

    $('[data-path="/home/user"]', win.el).addEventListener('click', () => {
      current = '/home/user';
      render();
    });
    $('[data-new]', win.el).forEach(btn => btn.addEventListener('click', () => showCreateDialog(btn.dataset.new)));

    $('[data-new-folder]', win.el)?.addEventListener('click', () => {
      let name = prompt('Folder name');
      if (!name) return;
      name = name.trim().replace(/[\\/:*?"<>|]/g, '').slice(0, 48);
      if (!name) return;
      const p = norm(name, current);
      if (state.fs[p]) { alert('That name already exists.'); return; }
      state.fs[p] = { type:'dir', createdAt:Date.now() };
      persistFS();
      render();
      notify('Folder created', name, '📁');
    });

    $('[data-import]', win.el)?.addEventListener('click', () => $('#files-import', win.el)?.click());
    $('#files-import', win.el)?.addEventListener('change', async e => {
      const list = [...(e.target.files || [])];
      let added = 0;
      for (const file of list) {
        if (!/\.(txt|html)$/i.test(file.name)) continue;
        const name = file.name.replace(/[\\/:*?"<>|]/g, '').slice(0, 80);
        const p = norm(name, current);
        if (state.fs[p]) continue;
        state.fs[p] = { type:'file', content:await file.text(), createdAt:Date.now(), modifiedAt:Date.now() };
        added++;
      }
      persistFS();
      render();
      if (added) notify('Files imported', added + ' file' + (added === 1 ? '' : 's') + ' added.', '↓');
      e.target.value = '';
    });

    function render() {
      if (!state.fs[current] || state.fs[current].type !== 'dir') current = '/home/user';
      $('.files-path', win.el).textContent = current.replace('/home/user', 'Home') || 'Home';
      const grid = $('.file-grid', win.el);
      grid.innerHTML = '';
      const items = children(current);

      if (current !== '/home/user') {
        const up = document.createElement('button');
        up.className = 'file-card up-card';
        up.innerHTML = '<span class="ficon">↩</span><span>Up</span>';
        up.addEventListener('click', () => {
          current = parentPath(current);
          render();
        });
        grid.appendChild(up);
      }

      if (!items.length && current === '/home/user') {
        const empty = document.createElement('div');
        empty.className = 'files-empty';
        empty.innerHTML = '<div class="empty-icon">◇</div><strong>This folder is empty</strong><span>Create a .txt or .html file to get started.</span>';
        grid.appendChild(empty);
        return;
      }

      items.forEach(p => {
        const node = state.fs[p];
        const card = document.createElement('div');
        card.className = 'file-card-wrap';
        const icon = node.type === 'dir' ? '📁' : /\.html$/i.test(p) ? '🌐' : '📄';
        card.innerHTML = `
          <button class="file-card" aria-label="Open ${escapeHTML(basename(p))}">
            <span class="ficon">${icon}</span><span>${escapeHTML(basename(p))}</span>
          </button>
          <div class="file-mini-actions">
            ${node.type === 'file' && /\.html$/i.test(p) ? '<button class="file-run" title="Run HTML">▶</button>' : ''}
            <button class="file-rename" title="Rename">✎</button>
            ${node.type === 'file' ? '<button class="file-download" title="Download">↓</button>' : ''}
            <button class="file-delete" title="Delete">×</button>
          </div>`;
        $('.file-card', card).addEventListener('click', () => openItem(p));
        $('.file-run', card)?.addEventListener('click', e => {
          e.stopPropagation();
          openApp('preview', { file:p });
        });
        $('.file-rename', card)?.addEventListener('click', e => {
          e.stopPropagation();
          let next = prompt('Rename', basename(p));
          if (!next) return;
          next = next.trim().replace(/[\\/:*?"<>|]/g, '').slice(0, 80);
          if (!next) return;
          if (node.type === 'file' && !allowedFileName(next)) {
            alert('PocketVM currently supports .txt and .html files.');
            return;
          }
          const target = norm(next, parentPath(p));
          if (target !== p && state.fs[target]) { alert('That name already exists.'); return; }
          const moves = Object.keys(state.fs).filter(k => k === p || k.startsWith(p + '/')).sort((a,b) => a.length - b.length);
          const replacements = moves.map(old => [old, target + old.slice(p.length), state.fs[old]]);
          moves.sort((a,b) => b.length-a.length).forEach(old => delete state.fs[old]);
          replacements.forEach(([old,n,val]) => state.fs[n] = val);
          persistFS();
          render();
          notify('Renamed', basename(p) + ' → ' + next, '✎');
        });
        $('.file-download', card)?.addEventListener('click', e => {
          e.stopPropagation();
          if (node.type !== 'file') return;
          const blob = new Blob([node.content || ''], { type:/\.html$/i.test(p) ? 'text/html' : 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = basename(p); document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        $('.file-delete', card).addEventListener('click', e => {
          e.stopPropagation();
          const label = basename(p);
          if (!confirm(`Delete ${label}?`)) return;
          if (node.type === 'dir' && children(p).length) {
            alert('That folder is not empty.');
            return;
          }
          delete state.fs[p];
          persistFS();
          render();
        });
        grid.appendChild(card);
      });
    }

    function openItem(p) {
      const node = state.fs[p];
      if (!node) return;
      if (node.type === 'dir') {
        current = p;
        render();
      } else {
        openApp('editor', { file:p });
      }
    }

    function showCreateDialog(kind) {
      const ext = kind === 'html' ? '.html' : '.txt';
      const overlay = document.createElement('div');
      overlay.className = 'dialog-backdrop';
      overlay.innerHTML = `
        <form class="mini-dialog">
          <h3>New ${kind === 'html' ? 'HTML' : 'text'} file</h3>
          <p>Files are saved to PocketVM on this device.</p>
          <label>File name<input class="dialog-input" type="text" inputmode="text" autocomplete="off" placeholder="${kind === 'html' ? 'website.html' : 'notes.txt'}" /></label>
          <div class="dialog-error" aria-live="polite"></div>
          <div class="dialog-actions"><button type="button" data-cancel>Cancel</button><button type="submit" class="primary-btn">Create</button></div>
        </form>`;
      win.content.appendChild(overlay);
      const input = $('.dialog-input', overlay);
      setTimeout(() => input.focus(), 0);
      $('[data-cancel]', overlay).addEventListener('click', () => overlay.remove());
      overlay.addEventListener('pointerdown', e => {
        if (e.target === overlay) overlay.remove();
      });
      $('form', overlay).addEventListener('submit', e => {
        e.preventDefault();
        let name = input.value.trim();
        const error = $('.dialog-error', overlay);
        if (!name) {
          error.textContent = 'Enter a file name.';
          return;
        }
        if (/[\\/:*?"<>|]/.test(name)) {
          error.textContent = 'That file name contains unsupported characters.';
          return;
        }
        if (!name.toLowerCase().endsWith(ext)) name += ext;
        if (!allowedFileName(name)) {
          error.textContent = 'PocketVM currently supports .txt and .html files.';
          return;
        }
        const p = norm(name, current);
        if (state.fs[p]) {
          error.textContent = 'A file with that name already exists.';
          return;
        }
        state.fs[p] = { type:'file', content: kind === 'html' ? htmlStarter(name) : '', createdAt:Date.now(), modifiedAt:Date.now() };
        persistFS();
        overlay.remove();
        render();
        openApp('editor', { file:p });
      });
    }

    render();
  }

  function htmlStarter(filename) {
    const title = basename(filename).replace(/\.html$/i, '') || 'PocketVM Page';
    return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${title}</title>\n  <style>\n    body { font-family: system-ui, sans-serif; padding: 32px; }\n  </style>\n</head>\n<body>\n  <h1>Hello from PocketVM 👋</h1>\n  <p>Edit this file, then tap Run.</p>\n  <button onclick="document.body.append(' It works!')">Test JavaScript</button>\n</body>\n</html>`;
  }

  // ---------- Editor + HTML preview ----------
  function buildEditor(win, options = {}) {
    const file = options.file;
    if (!file || !state.fs[file] || state.fs[file].type !== 'file') {
      win.content.innerHTML = '<div class="app-pad"><h2>File not found</h2></div>';
      return;
    }
    const isHTML = /\.html$/i.test(file);
    setWindowTitle(win, basename(file), isHTML ? '🌐' : '📄');
    win.content.innerHTML = `
      <div class="editor-app ${isHTML ? 'html-editor' : ''}">
        <div class="editor-toolbar">
          <strong>${escapeHTML(basename(file))}</strong>
          <span class="editor-location">${escapeHTML(parentPath(file).replace('/home/user', 'Home'))}</span>
          <span class="files-spacer"></span>
          <span class="editor-state">Saved</span>
          ${isHTML ? '<button class="soft-btn" data-editor-run>▶ Run</button>' : ''}
          <button class="soft-btn" data-editor-save>Save</button>
        </div>
        <textarea class="editor-area" ${isHTML ? 'spellcheck="false" autocapitalize="off" autocorrect="off"' : 'spellcheck="true"'}></textarea>
      </div>`;

    const area = $('.editor-area', win.el);
    const status = $('.editor-state', win.el);
    area.value = state.fs[file].content || '';
    let timer;

    const save = () => {
      clearTimeout(timer);
      if (!state.fs[file]) return;
      state.fs[file] = { ...state.fs[file], type:'file', content:area.value, modifiedAt:Date.now() };
      if (persistFS()) status.textContent = 'Saved';
      else status.textContent = 'Save failed';
    };

    area.addEventListener('input', () => {
      status.textContent = 'Saving…';
      clearTimeout(timer);
      timer = setTimeout(save, 300);
    });
    area.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    });
    $('[data-editor-save]', win.el).addEventListener('click', save);
    $('[data-editor-run]', win.el)?.addEventListener('click', () => {
      save();
      openApp('preview', { file });
    });
    win.cleanup = save;
  }

  function buildPreview(win, options = {}) {
    const file = options.file;
    if (!file || !state.fs[file] || state.fs[file].type !== 'file' || !/\.html$/i.test(file)) {
      win.content.innerHTML = '<div class="app-pad"><h2>HTML file not found</h2></div>';
      return;
    }
    setWindowTitle(win, `${basename(file)} — Preview`, '◉');
    win.content.innerHTML = `
      <div class="browser-app">
        <div class="browser-toolbar">
          <div class="browser-address"><span>local://</span>${escapeHTML(basename(file))}</div>
          <button class="soft-btn" data-preview-edit>Edit</button>
          <button class="soft-btn" data-preview-refresh>↻ Refresh</button>
        </div>
        <div class="browser-safety">Sandboxed local HTML preview · scripts are allowed, but the page cannot access PocketVM itself.</div>
        <iframe class="html-preview" title="Preview of ${escapeHTML(basename(file))}" sandbox="allow-scripts allow-forms allow-modals allow-popups"></iframe>
      </div>`;

    const frame = $('.html-preview', win.el);
    const refresh = () => {
      if (!state.fs[file]) return;
      frame.srcdoc = state.fs[file].content || '';
    };
    refresh();
    $('[data-preview-refresh]', win.el).addEventListener('click', refresh);
    $('[data-preview-edit]', win.el).addEventListener('click', () => openApp('editor', { file }));
  }


  // ---------- Pocket Browser ----------
  function buildWebBrowser(win) {
    setWindowTitle(win, 'Pocket Browser', '◎');
    win.content.innerHTML = \`
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
          <button class="web-icon-btn" data-web-external type="button" title="Open outside PocketVM" aria-label="Open outside PocketVM">↗</button>
        </div>
        <div class="web-status">
          <span class="web-status-dot"></span>
          <span class="web-status-text">Ready</span>
          <span class="web-status-spacer"></span>
          <span class="web-status-hint">Some websites block embedded browsers · use ↗ if needed</span>
        </div>
        <div class="web-viewport">
          <iframe class="web-frame" title="Pocket Browser page"></iframe>
        </div>
      </div>\`;

    const frame = $('.web-frame', win.el);
    const tabsEl = $('.web-tabs', win.el);
    const address = $('.web-address-input', win.el);
    const status = $('.web-status-text', win.el);
    const backBtn = $('[data-web-back]', win.el);
    const forwardBtn = $('[data-web-forward]', win.el);
    const externalBtn = $('[data-web-external]', win.el);

    let tabCounter = 0;
    let activeId = '';
    const tabs = [];

    const activeTab = () => tabs.find(t => t.id === activeId);

    const homePage = () => \`<!doctype html>
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
</main></body></html>\`;

    const errorPage = (title, detail) => \`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>:root{color-scheme:dark;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}body{margin:0;min-height:100vh;background:#0a101b;color:#edf4ff;display:grid;place-items:center;padding:28px}.box{width:min(520px,100%);padding:28px;border:1px solid rgba(255,255,255,.12);border-radius:22px;background:rgba(255,255,255,.045)}h1{margin:0 0 8px;font-size:24px}p{margin:0;color:#9aacC4;line-height:1.55}</style>
</head><body><div class="box"><h1>\${escapeHTML(title)}</h1><p>\${escapeHTML(detail)}</p></div></body></html>\`;

    function normalizeInput(raw) {
      const value = String(raw || '').trim();
      if (!value || value.toLowerCase() === 'pocket://home') return { kind:'home', url:'pocket://home' };
      if (/^local:\\/\\//i.test(value)) return { kind:'local', url:value };
      if (/^https?:\\/\\//i.test(value)) {
        try {
          const u = new URL(value);
          if (u.protocol === 'http:') u.protocol = 'https:';
          return { kind:'web', url:u.href };
        } catch {}
      }
      if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
        return { kind:'error', url:value, message:'Pocket Browser only allows http://, https://, pocket:// and local:// addresses.' };
      }
      if (/\\s/.test(value) || !value.includes('.')) {
        return { kind:'web', url:'https://www.google.com/search?igu=1&q=' + encodeURIComponent(value), search:true };
      }
      try {
        return { kind:'web', url:new URL('https://' + value).href };
      } catch {
        return { kind:'web', url:'https://www.google.com/search?igu=1&q=' + encodeURIComponent(value), search:true };
      }
    }

    function localPathFromURL(value) {
      let raw = value.replace(/^local:\\/\\//i, '').replace(/^\\/+/, '');
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
        wrap.innerHTML = \`<button class="web-tab-main" type="button"><span class="web-tab-icon">◎</span><span class="web-tab-title">\${escapeHTML(tab.title || 'New tab')}</span></button><button class="web-tab-close" type="button" aria-label="Close tab">×</button>\`;
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
      externalBtn.disabled = tab.kind === 'home' || tab.kind === 'error';
      renderTabs();
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

    function showLocal(tab, url) {
      const path = localPathFromURL(url);
      const node = path && state.fs[path];
      tab.kind = 'local';
      if (!node || node.type !== 'file' || !/\\.html$/i.test(path)) {
        tab.title = 'File not found';
        frame.removeAttribute('src');
        frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals allow-popups');
        frame.srcdoc = errorPage('Local page not found', 'Use an address like local://website.html for an HTML file stored in PocketVM Home.');
        status.textContent = 'Local page not found';
        return;
      }
      tab.title = basename(path);
      frame.removeAttribute('src');
      // Deliberately no allow-same-origin: user HTML must not be able to reach PocketVM storage.
      frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals allow-popups allow-downloads');
      frame.srcdoc = node.content || '';
      status.textContent = 'Local PocketVM page · sandboxed';
    }

    function showWeb(tab, url) {
      tab.kind = 'web';
      tab.title = (() => {
        try { return new URL(url).hostname.replace(/^www\\./, '') || 'Web'; }
        catch { return 'Web'; }
      })();
      frame.removeAttribute('srcdoc');
      frame.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals allow-popups allow-downloads allow-same-origin');
      frame.src = url;
      status.textContent = 'Loading…';
    }

    function navigate(raw, push = true) {
      const tab = activeTab();
      if (!tab) return;
      const target = normalizeInput(raw);
      tab.url = target.url;
      if (push) addHistory(tab, target.url);

      if (target.kind === 'home') showHome(tab);
      else if (target.kind === 'local') showLocal(tab, target.url);
      else if (target.kind === 'web') showWeb(tab, target.url);
      else {
        tab.kind = 'error';
        tab.title = 'Unsupported address';
        frame.removeAttribute('src');
        frame.setAttribute('sandbox', '');
        frame.srcdoc = errorPage('Unsupported address', target.message || 'That address cannot be opened.');
        status.textContent = 'Unsupported address';
      }
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
      if (wasActive) activeId = tabs[Math.max(0, idx - 1)].id;
      switchTab(activeId);
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
  function buildMonitor(win) {
    setWindowTitle(win, 'System Monitor', '⌁');
    win.content.innerHTML = `
      <div class="system-monitor-v2">
        <div class="sys-hero"><div><span class="sys-eyebrow">POCKETVM SYSTEM</span><h2>System Monitor</h2><p>Live information the browser can actually expose.</p></div><div class="sys-live"><i></i> Live</div></div>
        <div class="system-cards">
          <div class="system-card"><span>Frame rate</span><strong data-sys="fps">--</strong><small>rendering FPS</small></div>
          <div class="system-card"><span>Storage</span><strong data-sys="storage">--</strong><small data-sys-sub="storage">local browser data</small></div>
          <div class="system-card"><span>Windows</span><strong data-sys="windows">0</strong><small>open PocketVM windows</small></div>
          <div class="system-card"><span>Network</span><strong data-sys="network">--</strong><small data-sys-sub="network">browser connection</small></div>
        </div>
        <div class="system-panels">
          <div class="system-panel"><h3>Device</h3><div class="system-list" data-device-list></div></div>
          <div class="system-panel"><h3>Running apps</h3><div class="process-list" data-process-list></div></div>
        </div>
      </div>`;

    let alive=true, frames=0, last=performance.now(), fps=60;
    const raf=()=>{ if(!alive)return; frames++; const now=performance.now(); if(now-last>=900){fps=Math.round(frames*1000/(now-last));frames=0;last=now;} requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    const formatBytes=n=>n>=1024*1024 ? (n/1024/1024).toFixed(1)+' MB' : n>=1024 ? Math.round(n/1024)+' KB' : n+' B';
    const refresh=async()=>{
      if(!alive)return;
      $('[data-sys="fps"]',win.el).textContent=String(fps);
      $('[data-sys="windows"]',win.el).textContent=String(state.windows.size);
      $('[data-sys="network"]',win.el).textContent=navigator.onLine?'Online':'Offline';
      $('[data-sys-sub="network"]',win.el).textContent=(navigator.connection?.effectiveType || 'connection') + (navigator.connection?.downlink ? ' · '+navigator.connection.downlink+' Mbps' : '');

      let used=0, quota=0;
      try { const est=await navigator.storage?.estimate?.(); used=est?.usage||0; quota=est?.quota||0; } catch {}
      if(!used){ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i)||''; used += (k.length+(localStorage.getItem(k)||'').length)*2; } }
      $('[data-sys="storage"]',win.el).textContent=formatBytes(used);
      $('[data-sys-sub="storage"]',win.el).textContent=quota ? 'of '+formatBytes(quota)+' browser quota' : 'local browser data';

      const device=$('[data-device-list]',win.el);
      device.innerHTML='';
      const rows=[
        ['Platform', navigator.userAgentData?.platform || navigator.platform || 'Browser'],
        ['CPU threads', navigator.hardwareConcurrency || 'Not exposed'],
        ['Device memory', navigator.deviceMemory ? navigator.deviceMemory+' GB' : 'Not exposed'],
        ['Viewport', innerWidth+' × '+innerHeight],
        ['Language', navigator.language || '—'],
        ['Uptime', formatUptime(Date.now()-state.bootedAt)]
      ];
      rows.forEach(([a,b])=>{const d=document.createElement('div');d.innerHTML='<span>'+escapeHTML(a)+'</span><strong>'+escapeHTML(String(b))+'</strong>';device.appendChild(d);});

      const processes=$('[data-process-list]',win.el);
      processes.innerHTML='';
      [...state.windows.values()].forEach(w=>{const d=document.createElement('div');d.className='process-row';d.innerHTML='<span class="process-icon">'+escapeHTML(apps[w.appId]?.icon||'◇')+'</span><span class="process-name">'+escapeHTML(apps[w.appId]?.name||w.appId)+'</span><small>'+ (w.el.classList.contains('minimized')?'Suspended':'Running') +'</small>'; processes.appendChild(d);});
    };
    const interval=setInterval(refresh,1000); refresh();
    win.cleanup=()=>{alive=false;clearInterval(interval);};
  }

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
    }

    function renderUser() {    function renderUser() {
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
        </div>
        <div class="settings-footer"><span class="settings-message" aria-live="polite"></span><button class="primary-btn" id="save-user">Save user</button></div>
        <input class="hidden-file-input" id="avatar-input" type="file" accept="image/*" />`;
      paintAvatar($('.settings-avatar', page));
      const msg = $('.settings-message', page);

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
            <div><strong>Custom wallpaper</strong><small>Your image is resized and stored locally in this browser.</small></div>
            <div class="inline-actions"><button class="soft-btn" id="upload-wallpaper">Choose image</button>${state.wallpaper.type === 'custom' ? '<button class="soft-btn" id="reset-wallpaper">Use default</button>' : ''}</div>
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
        msg.textContent = 'Processing wallpaper…';
        try {
          const dataUrl = await imageFileToDataURL(file, 1920, 1440, 0.78, false);
          const previous = state.wallpaper;
          state.wallpaper = { type:'custom', value:'custom', dataUrl };
          if (!saveJSON('pocketvm.wallpaper', state.wallpaper)) {
            state.wallpaper = previous;
            throw new Error('That image is too large for browser storage. Try a smaller image.');
          }
          applyWallpaper();
          renderWallpaper();
        } catch (err) {
          msg.textContent = err.message || 'Could not use that wallpaper.';
        }
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
          <div class="setting-row"><div><strong>PocketVM version</strong><small>Current web desktop release.</small></div><strong>2.0</strong></div>
          <div class="setting-row"><div><strong>App mode</strong><small>Whether PocketVM is running from the Home Screen.</small></div><strong>${standalone?'Installed':'Browser tab'}</strong></div>
          <div class="setting-row"><div><strong>Connection</strong><small>Current browser network state.</small></div><strong>${navigator.onLine?'Online':'Offline'}</strong></div>
        </div>
        <div class="shortcut-card"><h3>Keyboard shortcuts</h3>
          <div><kbd>⌘/Ctrl</kbd><kbd>E</kbd><span>Files</span></div>
          <div><kbd>⌘/Ctrl</kbd><kbd>B</kbd><span>Browser</span></div>
          <div><kbd>⌘/Ctrl</kbd><kbd>L</kbd><span>Lock PocketVM</span></div>
          <div><kbd>⌘/Ctrl</kbd><kbd>D</kbd><span>Show desktop</span></div>
          <div><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>Esc</kbd><span>System Monitor</span></div>
          <div><kbd>⌘/Ctrl</kbd><kbd>← / →</kbd><span>Snap focused window</span></div>
        </div>`;
    }

    function renderStorage() {
      page.innerHTML = pageHead('Storage', 'Manage data saved by PocketVM on this device.') + `
        <div class="setting-group">
          <div class="setting-row"><div><strong>Erase virtual files</strong><small>Returns Files to an empty Home folder.</small></div><button class="danger-btn" id="reset-fs">Erase</button></div>
        </div>
        <p class="privacy-note">PocketVM has no account server. Your profile, password hash, wallpaper, notes, files and settings stay in this browser's local storage. The terminal command <code>null.user</code> clears all of it.</p>`;
      $('#reset-fs', page).addEventListener('click', () => {
        if (!confirm('Erase every file in PocketVM? This cannot be undone.')) return;
        state.fs = makeEmptyFS();
        persistFS();
        localStorage.setItem('pocketvm.fs.schema', FS_SCHEMA);
        $('#reset-fs', page).textContent = 'Erased';
        for (const w of [...state.windows.values()]) {
          if (w.appId === 'editor' || w.appId === 'preview') closeWindow(w.id);
        }
        const filesWin = [...state.windows.values()].find(w => w.appId === 'files');
        if (filesWin) {
          closeWindow(filesWin.id);
          openApp('files');
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
    state.auth = {
      version: 1,
      algorithm,
      salt,
      hash,
      failedAttempts: 0,
      lockUntil: 0,
      createdAt: state.auth?.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    if (!saveJSON(AUTH_KEY, state.auth)) throw new Error('PocketVM could not save the password. Browser storage may be full.');
  }

  async function verifyPassword(password) {
    if (!state.auth?.hash || !state.auth?.salt) return false;
    const hash = await derivePassword(password, state.auth.salt, state.auth.algorithm || 'pbkdf2');
    return hash === state.auth.hash;
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

  function setAuthWallpaper() {
    const el = $('.auth-wallpaper');
    if (!el) return;
    if (state.wallpaper.type === 'custom' && state.wallpaper.dataUrl) {
      el.style.background = `linear-gradient(rgba(3,7,14,.44), rgba(3,7,14,.62)), url("${state.wallpaper.dataUrl}") center / cover no-repeat`;
    } else {
      const key = wallpapers[state.wallpaper.value] ? state.wallpaper.value : 'aurora';
      el.style.background = wallpapers[key];
    }
  }

  function enterDesktop() {
    if (authTicker) clearInterval(authTicker);
    authTicker = null;
    $('#auth-screen').hidden = true;
    $('#desktop').removeAttribute('inert');
    $('#desktop').hidden = false;
    applyWallpaper();
    renderUserChrome();
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
    win.content.innerHTML = `<div class="app-pad"><div class="about-logo">PV</div><h2>PocketVM 2.0</h2><p>A touch-first browser PC built for iPad and static hosting.</p><p style="color:var(--muted)">PocketVM now includes a windowed desktop, snapping, taskbar flyouts, Files, Browser, Calculator, notifications and local accounts. It remains fully client-side.</p><div class="setting-group"><div class="setting-row"><span>Desktop shell</span><strong>2.0</strong></div><div class="setting-row"><span>Terminal</span><strong>null.user only</strong></div><div class="setting-row"><span>Files</span><strong>.txt / .html + folders</strong></div><div class="setting-row"><span>Browser</span><strong>Tabs + local pages</strong></div><div class="setting-row"><span>PWA</span><strong>Offline ready</strong></div></div></div>`;
  }

  // ---------- PocketVM 2.0 desktop layer ----------
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

  function maybeSnapWindow(win,ev){
    if(!ev||innerWidth<700)return;
    $('#snap-preview').hidden=true;
    if(ev.clientY<=18){snapWindow(win,'full');return;}
    if(ev.clientX<=18){snapWindow(win,'left');return;}
    if(ev.clientX>=innerWidth-18){snapWindow(win,'right');}
  }

  function createDesktopItem(kind){
    let name=prompt(kind==='dir'?'Folder name':kind==='html'?'HTML file name':'Text file name');
    if(!name)return;
    name=name.trim().replace(/[\\/:*?"<>|]/g,'').slice(0,80);
    if(!name)return;
    if(kind==='txt'&&!/\.txt$/i.test(name))name+='.txt';
    if(kind==='html'&&!/\.html$/i.test(name))name+='.html';
    const p=norm(name,'/home/user');
    if(state.fs[p]){alert('That name already exists.');return;}
    if(kind==='dir')state.fs[p]={type:'dir',createdAt:Date.now()};
    else state.fs[p]={type:'file',content:kind==='html'?htmlStarter(name):'',createdAt:Date.now(),modifiedAt:Date.now()};
    persistFS();
    notify(kind==='dir'?'Folder created':'File created',name,kind==='dir'?'📁':'📄');
    if(kind!=='dir')openApp('editor',{file:p}); else openApp('files',{path:'/home/user'});
  }

  function renderDesktopContext(x,y){
    const menu=$('#desktop-context'); if(!menu)return;
    menu.innerHTML='<button data-dctx="txt"><span>📄</span>New text file</button><button data-dctx="html"><span>🌐</span>New HTML file</button><button data-dctx="dir"><span>📁</span>New folder</button><hr><button data-dctx="files"><span>▤</span>Open Files</button><button data-dctx="settings"><span>⚙</span>Display settings</button><button data-dctx="refresh"><span>↻</span>Refresh</button>';
    menu.style.left=Math.min(x,innerWidth-220)+'px'; menu.style.top=Math.min(y,innerHeight-300)+'px'; menu.hidden=false;
    menu.querySelectorAll('[data-dctx]').forEach(b=>b.addEventListener('click',()=>{menu.hidden=true;const a=b.dataset.dctx;if(['txt','html','dir'].includes(a))createDesktopItem(a);if(a==='files')openApp('files');if(a==='settings')openApp('settings');if(a==='refresh')applyWallpaper();}));
  }

  function initDesktopExperience(){
    renderQuickSettings(); renderCalendar(); renderNotificationCenter(); updateNotificationBadge();
    $('#quick-btn')?.addEventListener('click',e=>{e.stopPropagation();renderQuickSettings();toggleFlyout($('#quick-panel'));});
    $('#clock-btn')?.addEventListener('click',e=>{e.stopPropagation();renderCalendar();toggleFlyout($('#calendar-panel'));});
    $('#notify-btn')?.addEventListener('click',e=>{e.stopPropagation();renderNotificationCenter();toggleFlyout($('#notification-center'));});
    $('#show-desktop-btn')?.addEventListener('click',showDesktop);
    $('#shutdown-btn')?.addEventListener('click',shutdown);

    const search=$('#start-search-input');
    search?.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();$('.start-grid button').forEach(b=>b.hidden=q&&!b.textContent.toLowerCase().includes(q));});
    search?.addEventListener('keydown',e=>{if(e.key==='Enter'){const b=$('.start-grid button').find(x=>!x.hidden);if(b)b.click();}});

    $('#desktop')?.addEventListener('contextmenu',e=>{if(e.target.closest('.window,.taskbar,.start-menu,.shell-flyout'))return;e.preventDefault();renderDesktopContext(e.clientX,e.clientY);});
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
      if(e.ctrlKey&&e.shiftKey&&e.key==='Escape'){e.preventDefault();openApp('monitor');return;}
      if(!mod)return;
      const k=e.key.toLowerCase();
      if(k==='e'){e.preventDefault();openApp('files');}
      else if(k==='b'){e.preventDefault();openApp('browser');}
      else if(k==='d'){e.preventDefault();showDesktop();}
      else if(k==='l'){e.preventDefault();lock();}
      else if(k===' '){e.preventDefault();$('#start-btn')?.click();setTimeout(()=>$('#start-search-input')?.focus(),0);}
      else if(e.key==='ArrowLeft'){const w=focusedWindow();if(w){e.preventDefault();snapWindow(w,'left');}}
      else if(e.key==='ArrowRight'){const w=focusedWindow();if(w){e.preventDefault();snapWindow(w,'right');}}
      else if(e.key==='ArrowUp'){const w=focusedWindow();if(w){e.preventDefault();snapWindow(w,'full');}}
    });

    setTimeout(()=>notify('Welcome to PocketVM 2.0','Desktop upgrades are ready. Right-click the desktop or try the taskbar controls.','PV'),1500);
  }



  // ---------- Shell ----------  // ---------- Shell ----------
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

  $$('[data-open]').forEach(b => b.addEventListener('click', () => {
    openApp(b.dataset.open);
    $('#start-menu').hidden = true;
    $('#start-btn').classList.remove('active');
  }));
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
  updateClock();
  setInterval(updateClock, 1000);
  renderUserChrome();

  window.addEventListener('resize', () => {
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
})();