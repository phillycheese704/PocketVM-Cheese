(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const escapeHTML = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const state = {
    z: 20,
    windows: new Map(),
    terminalCounter: 0,
    theme: localStorage.getItem('pocketvm.theme') || 'blue',
    history: JSON.parse(localStorage.getItem('pocketvm.history') || '[]'),
    fs: JSON.parse(localStorage.getItem('pocketvm.fs') || 'null') || {
      '/': { type: 'dir' },
      '/home': { type: 'dir' },
      '/home/guest': { type: 'dir' },
      '/home/guest/Documents': { type: 'dir' },
      '/home/guest/Downloads': { type: 'dir' },
      '/home/guest/Desktop': { type: 'dir' },
      '/home/guest/readme.txt': { type: 'file', content: 'Welcome to PocketVM!\n\nTry: help\nTry: neofetch\nTry: curl.exe ascii.live/rick\n' },
      '/home/guest/Documents/ideas.txt': { type: 'file', content: 'Things to build next:\n- Proper terminal commands\n- Optional WASM Linux backend\n- More tiny desktop apps\n' },
      '/etc': { type: 'dir' },
      '/etc/hostname': { type: 'file', content: 'pocketvm' },
    }
  };

  const themes = {
    blue: ['#65a7ff', '#8f7cff'],
    mint: ['#5ee7c4', '#4da6ff'],
    sunset: ['#ff9b73', '#b276ff'],
    mono: ['#e7edf6', '#8794a8']
  };

  function applyTheme(name) {
    const t = themes[name] || themes.blue;
    state.theme = name;
    localStorage.setItem('pocketvm.theme', name);
    document.documentElement.style.setProperty('--accent', t[0]);
    document.documentElement.style.setProperty('--accent-2', t[1]);
  }
  applyTheme(state.theme);

  function persistFS() { localStorage.setItem('pocketvm.fs', JSON.stringify(state.fs)); }
  function norm(path, cwd='/home/guest') {
    if (!path) return cwd;
    const full = path.startsWith('/') ? path : `${cwd}/${path}`;
    const parts = [];
    for (const p of full.split('/')) {
      if (!p || p === '.') continue;
      if (p === '..') parts.pop(); else parts.push(p);
    }
    return '/' + parts.join('/');
  }
  function parentPath(path) { const n = norm(path); return n === '/' ? '/' : n.slice(0, n.lastIndexOf('/')) || '/'; }
  function basename(path) { const n = norm(path); return n === '/' ? '/' : n.slice(n.lastIndexOf('/') + 1); }
  function children(path) {
    const p = norm(path);
    return Object.keys(state.fs).filter(k => k !== p && parentPath(k) === p).sort((a,b) => {
      const ad = state.fs[a].type === 'dir', bd = state.fs[b].type === 'dir';
      return ad === bd ? a.localeCompare(b) : ad ? -1 : 1;
    });
  }

  const apps = {
    terminal: { name: 'Terminal', icon: '›_', width: 790, height: 500, singleton: false, build: buildTerminal },
    files: { name: 'Files', icon: '▤', width: 760, height: 500, singleton: true, build: buildFiles },
    notes: { name: 'Notes', icon: '✎', width: 680, height: 480, singleton: true, build: buildNotes },
    monitor: { name: 'System Monitor', icon: '⌁', width: 620, height: 470, singleton: true, build: buildMonitor },
    settings: { name: 'Settings', icon: '⚙', width: 570, height: 460, singleton: true, build: buildSettings },
    about: { name: 'About PocketVM', icon: 'ⓘ', width: 500, height: 390, singleton: true, build: buildAbout }
  };

  function openApp(appId, options={}) {
    const app = apps[appId];
    if (!app) return;
    if (app.singleton) {
      const existing = [...state.windows.values()].find(w => w.appId === appId);
      if (existing) { restoreWindow(existing.id); focusWindow(existing.id); return existing; }
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
    app.build(win, options);
    addTaskbarButton(win);
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
      e.preventDefault(); focusWindow(id);
      const rect = el.getBoundingClientRect();
      const startX = e.clientX, startY = e.clientY;
      const left = rect.left, top = rect.top;
      el.style.transform = 'none'; el.style.left = `${left}px`; el.style.top = `${top}px`;
      bar.setPointerCapture(e.pointerId);
      const move = ev => {
        const maxX = innerWidth - Math.min(160, el.offsetWidth);
        const maxY = innerHeight - 100;
        el.style.left = `${clamp(left + ev.clientX - startX, -el.offsetWidth + 120, maxX)}px`;
        el.style.top = `${clamp(top + ev.clientY - startY, 0, maxY)}px`;
      };
      const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); };
      bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up);
    });

    const handle = $('.resize-handle', el);
    handle.addEventListener('pointerdown', e => {
      if (win.maximized) return;
      e.preventDefault(); e.stopPropagation(); focusWindow(id);
      const rect = el.getBoundingClientRect();
      const sx = e.clientX, sy = e.clientY, sw = rect.width, sh = rect.height;
      handle.setPointerCapture(e.pointerId);
      const move = ev => {
        el.style.width = `${clamp(sw + ev.clientX - sx, 290, innerWidth - rect.left)}px`;
        el.style.height = `${clamp(sh + ev.clientY - sy, 210, innerHeight - 60 - rect.top)}px`;
      };
      const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
      handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up);
    });
  }

  function addTaskbarButton(win) {
    const btn = document.createElement('button');
    btn.className = 'task-app'; btn.dataset.windowId = win.id;
    btn.innerHTML = `<span>${escapeHTML(apps[win.appId].icon)}</span><span class="task-label">${escapeHTML(apps[win.appId].name)}</span>`;
    btn.addEventListener('click', () => {
      if (win.el.classList.contains('minimized')) restoreWindow(win.id);
      else if (win.el.classList.contains('focused')) minimizeWindow(win.id);
      else focusWindow(win.id);
    });
    $('#taskbar-apps').appendChild(btn);
  }
  function focusWindow(id) {
    const win = state.windows.get(id); if (!win) return;
    $$('.window').forEach(w => w.classList.remove('focused'));
    $$('.task-app').forEach(b => b.classList.remove('active'));
    win.el.classList.remove('minimized'); win.el.classList.add('focused'); win.el.style.zIndex = ++state.z;
    $(`.task-app[data-window-id="${CSS.escape(id)}"]`)?.classList.add('active');
    if (win.appId === 'terminal') $('.term-input', win.el)?.focus({preventScroll:true});
  }
  function closeWindow(id) { const win = state.windows.get(id); if (!win) return; win.cleanup?.(); win.el.remove(); $(`.task-app[data-window-id="${CSS.escape(id)}"]`)?.remove(); state.windows.delete(id); }
  function minimizeWindow(id) { const win = state.windows.get(id); if (!win) return; win.el.classList.add('minimized'); win.el.classList.remove('focused'); $(`.task-app[data-window-id="${CSS.escape(id)}"]`)?.classList.remove('active'); }
  function restoreWindow(id) { const win = state.windows.get(id); if (!win) return; win.el.classList.remove('minimized'); focusWindow(id); }
  function toggleMaximize(id) { const w = state.windows.get(id); if (!w) return; w.maximized ? unmaximizeWindow(id) : maximizeWindow(id); }
  function maximizeWindow(id) { const w = state.windows.get(id); if (!w || w.maximized) return; w.beforeMax = {left:w.el.style.left,top:w.el.style.top,width:w.el.style.width,height:w.el.style.height,transform:w.el.style.transform}; w.el.classList.add('maximized'); w.maximized = true; }
  function unmaximizeWindow(id) { const w = state.windows.get(id); if (!w || !w.maximized) return; w.el.classList.remove('maximized'); Object.assign(w.el.style, w.beforeMax || {}); w.maximized = false; }

  // ---------- Terminal ----------
  function buildTerminal(win) {
    state.terminalCounter++;
    win.content.innerHTML = `
      <div class="terminal">
        <div class="term-toolbar">
          <button class="term-chip" data-term="clear">Clear</button>
          <button class="term-chip" data-term="help">Help</button>
          <button class="term-chip" data-term="rick">curl rick</button>
          <span style="flex:1"></span><span class="term-chip">local shell</span>
        </div>
        <div class="term-output" role="log" aria-live="polite"></div>
        <div class="term-promptline"><span class="term-prompt"></span><input class="term-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" /></div>
      </div>`;
    const term = { win, cwd: '/home/guest', env: { USER:'guest', HOME:'/home/guest', SHELL:'pocketsh', TERM:'xterm-256color' }, historyIndex: state.history.length, abortAnimation: false };
    win.term = term;
    print(term, 'PocketVM Terminal 1.0', 'accent');
    print(term, 'Type "help" to see commands. Try: curl.exe ascii.live/rick', 'muted');
    updatePrompt(term);
    const input = $('.term-input', win.el);
    input.focus();
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); const cmd = input.value; input.value=''; runLine(term, cmd); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (state.history.length) { term.historyIndex = Math.max(0, term.historyIndex - 1); input.value = state.history[term.historyIndex] || ''; queueMicrotask(()=>input.setSelectionRange(input.value.length,input.value.length)); } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); term.historyIndex = Math.min(state.history.length, term.historyIndex + 1); input.value = state.history[term.historyIndex] || ''; }
      else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); clearTerm(term); }
      else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) { term.abortAnimation = true; print(term, '^C', 'muted'); }
    });
    win.el.addEventListener('pointerdown', e => { if (!e.target.closest('button')) setTimeout(()=>input.focus({preventScroll:true}),0); });
    $$('[data-term]', win.el).forEach(b => b.addEventListener('click', () => {
      const v = b.dataset.term;
      if (v === 'clear') clearTerm(term);
      if (v === 'help') runLine(term, 'help');
      if (v === 'rick') runLine(term, 'curl.exe ascii.live/rick');
    }));
  }

  function print(term, text='', cls='') {
    const out = $('.term-output', term.win.el); if (!out) return;
    const div = document.createElement('div'); div.className = `term-line ${cls}`; div.textContent = text; out.appendChild(div); out.scrollTop = out.scrollHeight; return div;
  }
  function printHTML(term, html='', cls='') {
    const out = $('.term-output', term.win.el); const div = document.createElement('div'); div.className=`term-line ${cls}`; div.innerHTML=html; out.appendChild(div); out.scrollTop=out.scrollHeight; return div;
  }
  function clearTerm(term) { $('.term-output', term.win.el).innerHTML=''; }
  function updatePrompt(term) { $('.term-prompt', term.win.el).textContent = `guest@pocketvm:${term.cwd.replace('/home/guest','~') || '~'}$`; }
  function tokenize(s) { const m = s.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []; return m.map(x => (x[0] === '"' || x[0] === "'") ? x.slice(1,-1) : x); }
  async function runLine(term, line) {
    const raw = line.trim();
    print(term, `${$('.term-prompt', term.win.el).textContent} ${line}`);
    if (!raw) return;
    state.history.push(raw); state.history = state.history.slice(-100); term.historyIndex = state.history.length; localStorage.setItem('pocketvm.history', JSON.stringify(state.history));
    const parts = tokenize(raw); const cmd = (parts.shift() || '').toLowerCase(); const args = parts;
    term.abortAnimation = true; await sleep(0); term.abortAnimation = false;
    try { await execute(term, cmd, args, raw); } catch (err) { print(term, `error: ${err.message}`, 'error'); }
    updatePrompt(term);
  }

  async function execute(term, cmd, args, raw) {
    const aliases = { 'curl.exe':'curl', 'dir':'ls', 'cls':'clear', 'type':'cat', 'del':'rm', 'md':'mkdir', 'cd.':'pwd', '?':'help' };
    cmd = aliases[cmd] || cmd;
    if (cmd.includes('.exe')) cmd = cmd.replace(/\.exe$/,'');
    const joined = args.join(' ');

    switch (cmd) {
      case 'help':
        print(term, 'PocketVM commands', 'accent');
        print(term, '  help, clear, echo, history, date, time, whoami, hostname, ver');
        print(term, '  pwd, cd, ls/dir, tree, cat/type, mkdir, touch, write, rm/del');
        print(term, '  neofetch, ipconfig, ping, curl/curl.exe, theme, open');
        print(term, '  calc, uname, env, matrix, reboot, shutdown');
        print(term, '');
        print(term, 'Fun: curl.exe ascii.live/rick', 'success');
        break;
      case 'clear': clearTerm(term); break;
      case 'echo': print(term, joined.replace(/%([^%]+)%/g, (_,k)=>term.env[k] ?? '').replace(/\$([A-Za-z_][\w]*)/g,(_,k)=>term.env[k] ?? '')); break;
      case 'history': state.history.forEach((h,i)=>print(term, `${String(i+1).padStart(3,' ')}  ${h}`)); break;
      case 'date': print(term, new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})); break;
      case 'time': print(term, new Date().toLocaleTimeString()); break;
      case 'whoami': print(term, 'guest'); break;
      case 'hostname': print(term, 'pocketvm'); break;
      case 'ver': print(term, 'PocketVM [Version 1.0.0] — browser-native virtual desktop'); break;
      case 'uname': print(term, args.includes('-a') ? `PocketVM pocketvm 1.0.0 WebKit ${navigator.platform || 'Web'} wasm-js` : 'PocketVM'); break;
      case 'env': Object.entries(term.env).forEach(([k,v])=>print(term, `${k}=${v}`)); break;
      case 'pwd': print(term, term.cwd); break;
      case 'cd': {
        const p = norm(args[0] || term.env.HOME, term.cwd);
        if (!state.fs[p]) print(term, `cd: no such file or directory: ${args[0] || ''}`, 'error');
        else if (state.fs[p].type !== 'dir') print(term, `cd: not a directory: ${args[0]}`, 'error');
        else term.cwd = p;
        break;
      }
      case 'ls': {
        let p = term.cwd; const actualArgs = args.filter(a=>!a.startsWith('-')); if (actualArgs[0]) p = norm(actualArgs[0],term.cwd);
        const node = state.fs[p];
        if (!node) { print(term, `ls: cannot access '${actualArgs[0] || p}': No such file or directory`, 'error'); break; }
        if (node.type === 'file') { print(term, basename(p)); break; }
        for (const k of children(p)) print(term, `${state.fs[k].type === 'dir' ? '📁' : '  '} ${basename(k)}${state.fs[k].type === 'dir' ? '/' : ''}`);
        break;
      }
      case 'tree': {
        const root = norm(args[0] || term.cwd, term.cwd);
        if (!state.fs[root] || state.fs[root].type !== 'dir') { print(term, 'tree: directory not found', 'error'); break; }
        print(term, root);
        const walk = (p,prefix='',depth=0) => { if(depth>8)return; const c=children(p); c.forEach((k,i)=>{ const last=i===c.length-1; print(term, `${prefix}${last?'└── ':'├── '}${basename(k)}${state.fs[k].type==='dir'?'/':''}`); if(state.fs[k].type==='dir') walk(k,prefix+(last?'    ':'│   '),depth+1); }); };
        walk(root); break;
      }
      case 'cat': {
        if (!args[0]) { print(term, 'cat: missing file operand', 'error'); break; }
        const p = norm(args[0],term.cwd), node = state.fs[p];
        if (!node) print(term, `cat: ${args[0]}: No such file`, 'error');
        else if (node.type !== 'file') print(term, `cat: ${args[0]}: Is a directory`, 'error');
        else print(term, node.content || '');
        break;
      }
      case 'mkdir': {
        if(!args[0]) { print(term,'mkdir: missing operand','error'); break; }
        const p=norm(args[0],term.cwd); if(state.fs[p]) print(term,`mkdir: ${args[0]}: File exists`,'error');
        else if(!state.fs[parentPath(p)] || state.fs[parentPath(p)].type!=='dir') print(term,'mkdir: parent directory does not exist','error');
        else { state.fs[p]={type:'dir'}; persistFS(); print(term,`created ${p}`,'success'); }
        break;
      }
      case 'touch': {
        if(!args[0]) { print(term,'touch: missing file operand','error'); break; }
        const p=norm(args[0],term.cwd); if(!state.fs[parentPath(p)]) print(term,'touch: parent directory does not exist','error');
        else { state.fs[p]=state.fs[p]||{type:'file',content:''}; persistFS(); }
        break;
      }
      case 'write': {
        if(args.length<2) { print(term,'usage: write <file> <text>','error'); break; }
        const p=norm(args.shift(),term.cwd); if(!state.fs[parentPath(p)]) print(term,'write: parent directory does not exist','error');
        else { state.fs[p]={type:'file',content:args.join(' ')}; persistFS(); print(term,`wrote ${p}`,'success'); }
        break;
      }
      case 'rm': {
        if(!args[0]) { print(term,'rm: missing operand','error'); break; }
        const p=norm(args[0],term.cwd); if(!state.fs[p]) print(term,'rm: target not found','error');
        else if(state.fs[p].type==='dir' && children(p).length) print(term,'rm: directory not empty','error');
        else { delete state.fs[p]; persistFS(); print(term,`removed ${p}`,'success'); }
        break;
      }
      case 'neofetch': neofetch(term); break;
      case 'ipconfig':
        print(term, 'PocketVM Network Adapter', 'accent'); print(term, '   Connection . . . . . . . : Browser sandbox'); print(term, '   IPv4 Address. . . . . . . : 127.0.0.1'); print(term, '   Gateway . . . . . . . . . : managed by browser'); break;
      case 'ping': await fakePing(term,args[0]||'localhost'); break;
      case 'curl': await curlCommand(term, joined); break;
      case 'theme': {
        if (!args[0]) print(term, `themes: ${Object.keys(themes).join(', ')} (current: ${state.theme})`);
        else if (!themes[args[0]]) print(term, 'theme: unknown theme', 'error');
        else { applyTheme(args[0]); print(term, `theme changed to ${args[0]}`, 'success'); }
        break;
      }
      case 'open': if (apps[args[0]]) openApp(args[0]); else print(term,`open: try terminal, files, notes, monitor, settings`,'error'); break;
      case 'calc': {
        if(!joined){print(term,'usage: calc <expression>','error');break;}
        if(!/^[0-9+\-*/().%\s]+$/.test(joined)){print(term,'calc: only numbers and arithmetic operators are allowed','error');break;}
        try{ const v=Function(`"use strict";return (${joined})`)(); print(term,String(v)); }catch{print(term,'calc: invalid expression','error');} break;
      }
      case 'matrix': await matrix(term); break;
      case 'reboot': print(term,'Rebooting PocketVM...','accent'); setTimeout(()=>location.reload(),500); break;
      case 'shutdown': shutdown(); break;
      case 'exit': closeWindow(term.win.id); break;
      default: print(term, `${cmd}: command not found. Type "help".`, 'error');
    }
  }

  function neofetch(term) {
    const ua = navigator.userAgent;
    const mobile = /iPad|iPhone|Android/i.test(ua) ? 'tablet/mobile browser' : 'desktop browser';
    const art = [
      '       ╭────────╮       guest@pocketvm',
      '    ╭──┤  ◈  ◈  ├──╮    --------------',
      '   ╱   │   ▄▄   │   ╲   OS: PocketVM 1.0',
      '  │    ╰────────╯    │  Host: WebKit / Browser',
      '  │   ╭──────────╮   │  Shell: pocketsh',
      '   ╲  ╰──────────╯  ╱   Device: ' + mobile,
      '    ╰──────────────╯    Storage: localStorage'
    ]; art.forEach((l,i)=>print(term,l,i===0?'accent':''));
  }
  async function fakePing(term, host) {
    print(term, `Pinging ${host} with 32 bytes of data:`);
    for(let i=0;i<4;i++){ await sleep(260); if(term.abortAnimation)return; const ms=12+Math.floor(Math.random()*55); print(term, `Reply from ${host}: bytes=32 time=${ms}ms TTL=64`); }
    print(term, `Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`, 'success');
  }

  const asciiFrames = [
`        O/\n       /|\n       / \\\n   never gonna\n   give you up`,
`       \\O\n        |\\\n       / \\\n   never gonna\n   let you down`,
`        O\n       /|\\\n       / \\\n    PocketVM\n      edition`,
`      \\O/\n        |\n       / \\\n      ♪  ♪\n   ascii.live/rick`
  ];
  async function asciiRick(term) {
    const out = $('.term-output', term.win.el);
    const div = document.createElement('div'); div.className='ascii-frame'; out.appendChild(div);
    for(let n=0;n<28;n++){ if(term.abortAnimation) break; div.textContent = asciiFrames[n%asciiFrames.length]; out.scrollTop=out.scrollHeight; await sleep(135); }
    if(!term.abortAnimation) { div.textContent=''; print(term,'[PocketVM local fallback animation — browser-safe 😎]','muted'); }
  }
  async function asciiParrot(term) {
    const frames = ['  🦜\n /|\\\n / \\',' \\🦜\n  |\\\n / \\','  🦜/\n /|\n / \\'];
    const div=print(term,''); div.className='ascii-frame';
    for(let n=0;n<24;n++){if(term.abortAnimation)break;div.textContent=frames[n%frames.length];await sleep(120);}
  }
  async function curlCommand(term, target) {
    if(!target){ print(term,'curl: try curl.exe ascii.live/rick','error'); return; }
    const cleaned = target.replace(/^https?:\/\//,'').replace(/\/$/,'').toLowerCase();
    if(cleaned === 'ascii.live/rick') { await asciiRick(term); return; }
    if(cleaned === 'ascii.live/parrot') { await asciiParrot(term); return; }
    if(cleaned === 'example.com') { print(term,'<!doctype html><title>Example Domain</title><h1>Example Domain</h1>'); return; }
    print(term, `curl: browser mode blocks arbitrary cross-origin requests for safety/CORS.`, 'error');
    print(term, `Built-ins: ascii.live/rick, ascii.live/parrot, example.com`, 'muted');
  }
  async function matrix(term) {
    const chars='01アイウエオカキクケコ$#@*';
    for(let r=0;r<18;r++){ if(term.abortAnimation)break; let s=''; for(let i=0;i<70;i++) s+=chars[Math.floor(Math.random()*chars.length)]; print(term,s,'success'); await sleep(55); }
  }

  // ---------- Files ----------
  function buildFiles(win, options={}) {
    let current = options.path || '/home/guest';
    win.content.innerHTML = `<div class="files-app"><aside class="files-sidebar"></aside><div class="files-main"><div class="files-path"></div><div class="file-grid"></div></div></div>`;
    const side = $('.files-sidebar',win.el);
    [['Home','/home/guest'],['Desktop','/home/guest/Desktop'],['Documents','/home/guest/Documents'],['Downloads','/home/guest/Downloads'],['System','/etc']].forEach(([name,p])=>{
      const b=document.createElement('button');b.textContent=name;b.addEventListener('click',()=>{current=p;render();});side.appendChild(b);
    });
    function render(){
      if(!state.fs[current] || state.fs[current].type!=='dir') current='/home/guest';
      $('.files-path',win.el).textContent=current;
      $$('.files-sidebar button',win.el).forEach((b,i)=>b.classList.toggle('active',[['Home','/home/guest'],['Desktop','/home/guest/Desktop'],['Documents','/home/guest/Documents'],['Downloads','/home/guest/Downloads'],['System','/etc']][i][1]===current));
      const grid=$('.file-grid',win.el);grid.innerHTML='';
      if(current!=='/'){ const up=document.createElement('button');up.className='file-card';up.innerHTML='<span class="ficon">↩</span><span>Up</span>';up.onclick=()=>{current=parentPath(current);render();};grid.appendChild(up); }
      children(current).forEach(p=>{ const n=state.fs[p]; const b=document.createElement('button');b.className='file-card';b.innerHTML=`<span class="ficon">${n.type==='dir'?'📁':'📄'}</span><span>${escapeHTML(basename(p))}</span>`; b.addEventListener('dblclick',()=>openItem(p)); b.addEventListener('click',()=>{ if(matchMedia('(pointer:coarse)').matches) openItem(p); }); grid.appendChild(b); });
    }
    function openItem(p){ const n=state.fs[p]; if(n.type==='dir'){current=p;render();} else { openApp('notes',{file:p}); } }
    render();
  }

  function buildNotes(win, options={}) {
    const file = options.file || '/home/guest/Documents/notes.txt';
    if(!state.fs[file]) state.fs[file]={type:'file',content:localStorage.getItem('pocketvm.notes')||''};
    win.content.innerHTML=`<div class="notes-app"><div class="notes-toolbar"><strong>${escapeHTML(basename(file))}</strong><span style="flex:1"></span><span class="note-state">Saved</span></div><textarea class="notes-area" spellcheck="true" placeholder="Write something..."></textarea></div>`;
    const ta=$('.notes-area',win.el), status=$('.note-state',win.el); ta.value=state.fs[file].content||''; let timer;
    ta.addEventListener('input',()=>{status.textContent='Saving…';clearTimeout(timer);timer=setTimeout(()=>{state.fs[file]={type:'file',content:ta.value};persistFS();if(file.endsWith('notes.txt'))localStorage.setItem('pocketvm.notes',ta.value);status.textContent='Saved';},250);});
  }

  function buildMonitor(win) {
    win.content.innerHTML=`<div class="app-pad"><h2 style="margin-top:0">System Monitor</h2><p style="color:var(--muted)">Live browser-session stats. Values are illustrative where browsers don't expose hardware data.</p><div class="monitor-grid"></div></div>`;
    const grid=$('.monitor-grid',win.el);
    const cards=[['CPU','cpu','%'],['Memory','mem','%'],['FPS','fps',''],['Storage','storage',' KB']];
    cards.forEach(([title,key,unit])=>{const d=document.createElement('div');d.className='metric';d.dataset.metric=key;d.innerHTML=`<small>${title}</small><strong>--${unit}</strong><div class="spark"></div>`;grid.appendChild(d);});
    let last=performance.now(),frames=0,fps=60,alive=true;
    const tick=()=>{ if(!alive)return; frames++; const now=performance.now(); if(now-last>800){fps=Math.round(frames*1000/(now-last));frames=0;last=now;} requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    const interval=setInterval(()=>{
      const usage = Math.round(18+Math.random()*34), mem=Math.round(30+Math.random()*28), kb=Math.round(JSON.stringify(localStorage).length/1024);
      const vals={cpu:[usage,'%'],mem:[mem,'%'],fps:[fps,''],storage:[kb,' KB']};
      for(const [k,[v,u]] of Object.entries(vals)){const c=$(`[data-metric="${k}"]`,win.el);if(!c)continue;$('strong',c).textContent=`${v}${u}`;const spark=$('.spark',c);const i=document.createElement('i');i.style.height=`${clamp(k==='fps'?v: v,8,100)}%`;spark.appendChild(i);while(spark.children.length>18)spark.firstChild.remove();}
    },700);
    win.cleanup=()=>{alive=false;clearInterval(interval);};
  }

  function buildSettings(win) {
    win.content.innerHTML=`<div class="app-pad"><h2 style="margin-top:0">Settings</h2><div class="setting-group"><div class="setting-row"><div><strong>Accent</strong><small>Pick your PocketVM colour</small></div><div class="swatches"></div></div><div class="setting-row"><div><strong>Install as app</strong><small>Safari → Share → Add to Home Screen</small></div><span>↗</span></div></div><div class="setting-group"><div class="setting-row"><div><strong>Reset terminal history</strong><small>Clears saved commands</small></div><button class="term-chip" id="reset-history">Reset</button></div><div class="setting-row"><div><strong>Reset virtual files</strong><small>Refresh the demo filesystem</small></div><button class="term-chip" id="reset-fs">Reset</button></div></div></div>`;
    const sw=$('.swatches',win.el);Object.entries(themes).forEach(([name,c])=>{const b=document.createElement('button');b.className='swatch';b.title=name;b.style.background=`linear-gradient(135deg,${c[0]},${c[1]})`;b.onclick=()=>applyTheme(name);sw.appendChild(b);});
    $('#reset-history',win.el).onclick=()=>{state.history=[];localStorage.removeItem('pocketvm.history');};
    $('#reset-fs',win.el).onclick=()=>{localStorage.removeItem('pocketvm.fs');location.reload();};
  }

  function buildAbout(win) {
    win.content.innerHTML=`<div class="app-pad"><div class="about-logo">PV</div><h2>PocketVM 1.0</h2><p>A touch-first browser computer built for iPad and static hosting.</p><p style="color:var(--muted)">This release is a virtual desktop/shell rather than hardware virtualization. It runs fully client-side, persists files locally, and works offline after first load.</p><div class="setting-group"><div class="setting-row"><span>Desktop shell</span><strong>Ready</strong></div><div class="setting-row"><span>Terminal</span><strong>pocketsh</strong></div><div class="setting-row"><span>Persistence</span><strong>localStorage</strong></div><div class="setting-row"><span>PWA</span><strong>Enabled</strong></div></div></div>`;
  }

  // ---------- Shell ----------
  function updateClock() {
    const d=new Date(); const t=d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); const ds=d.toLocaleDateString([],{day:'2-digit',month:'short'});
    $('#clock').textContent=t;$('#date').textContent=ds;$('#lock-time').textContent=t;$('#lock-date').textContent=d.toLocaleDateString([],{weekday:'long',day:'numeric',month:'long'});
  }
  function shutdown(){
    for(const id of [...state.windows.keys()]) closeWindow(id);
    $('#desktop').hidden=true; $('#boot').hidden=false; $('.boot-title').textContent='PocketVM is off'; $('.boot-subtitle').textContent='Tap anywhere to start'; $('.boot-bar').hidden=true;
    $('#boot').onclick=()=>location.reload();
  }
  function lock(){ $('#lock-screen').hidden=false; }

  $$('[data-open]').forEach(b=>b.addEventListener('click',()=>{openApp(b.dataset.open);$('#start-menu').hidden=true;$('#start-btn').classList.remove('active');}));
  $('#start-about').addEventListener('click',()=>{openApp('about');$('#start-menu').hidden=true;});
  $('#start-btn').addEventListener('click',e=>{e.stopPropagation();const m=$('#start-menu');m.hidden=!m.hidden;$('#start-btn').classList.toggle('active',!m.hidden);});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#start-menu')&&!e.target.closest('#start-btn')){$('#start-menu').hidden=true;$('#start-btn').classList.remove('active');}});
  $('#lock-btn').addEventListener('click',lock); $('#unlock-btn').addEventListener('click',()=>$('#lock-screen').hidden=true); $('#restart-btn').addEventListener('click',()=>location.reload());
  $('#kbd-btn').addEventListener('click',()=>{const active=$('.window.focused .term-input'); if(active)active.focus(); else {const i=$('#mobile-keyboard');i.value='';i.focus();}});
  updateClock(); setInterval(updateClock,1000);

  window.addEventListener('resize',()=>{ for(const w of state.windows.values()){ if(w.maximized)continue; const r=w.el.getBoundingClientRect(); if(r.left>innerWidth-100)w.el.style.left=`${innerWidth-100}px`; if(r.top>innerHeight-100)w.el.style.top=`${innerHeight-100}px`; } });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});

  setTimeout(()=>{
    $('#boot').hidden=true; $('#desktop').hidden=false;
    openApp('terminal');
  }, 900);
})();
