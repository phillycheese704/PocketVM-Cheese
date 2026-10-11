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
      tab.title = 'Mods';
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

