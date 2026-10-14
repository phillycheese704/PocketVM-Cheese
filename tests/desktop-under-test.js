
// QA only: memory storage and an isolated virtual drive; no account access.
const values=new Map(),localMemory={get length(){return values.size},key:i=>[...values.keys()][i],getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};Object.defineProperty(window,'localStorage',{value:localMemory});
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),state={terminalCounter:0,bootedAt:Date.now(),windows:new Map(),user:{name:'Alex',borderStyle:'ring',borderColor:'#8fc6ff'},preferences:{desktopHidden:[]},theme:'blue',wallpaper:{type:'preset',value:'aurora'}},themes={blue:['#65a7ff','#8f7cff'],mint:['#5ee7c4','#4da6ff'],sunset:['#ff9b73','#b276ff']},wallpapers={aurora:'linear-gradient(145deg,#14335a,#28204a)'},nodes=new Map(),data=new Map();
const PocketDisk=window.PocketDisk;const ready=PocketDisk.init().then(async()=>{if(!await PocketDisk.getNode('/home/user/Documents/Welcome.txt'))await PocketDisk.writeText('/home/user/Documents/Welcome.txt','Hello from the existing virtual drive.');});
const saveJSON=(k,v)=>localMemory.setItem(k,JSON.stringify(v)),refreshFS=async()=>{},applyPreferences=()=>{},initDesktopGrid=()=>{},notify=()=>{},applyWallpaper=()=>{},setAuthWallpaper=()=>{},paintAvatar=el=>el.textContent='A',applyTheme=t=>{state.theme=t;document.documentElement.style.setProperty('--accent',themes[t][0]);},renderUserChrome=()=>{for(const w of state.windows.values())w.term?.updatePrompt();};let tutorialForNewProfile=false;
  function shellUser() {
    const cleaned = String(state.user.name || 'guest').toLowerCase().replace(/[^a-z0-9_-]+/g, '').slice(0, 18);
    return cleaned || 'guest';
  }
  function buildTerminal(win) {
    state.terminalCounter++;
    win.term = PocketTerminal.mount(win, {
      disk:PocketDisk, storage:localStorage, username:shellUser,
      refresh:async()=>{await refreshFS();window.dispatchEvent(new CustomEvent('pocketdiskchange',{detail:{action:'terminal'}}));},
      info:()=>({runtime:matchMedia('(display-mode: standalone)').matches?'Home Screen web app':'Browser tab',uptime:(Date.now()-state.bootedAt)/1000,display:innerWidth+' × '+innerHeight,online:navigator.onLine}),
      reset:async()=>{
        await PocketDisk.destroy();
        for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key?.startsWith('pocketvm.'))localStorage.removeItem(key);}
        location.reload();
      }
    });
    win.cleanup=()=>win.term.dispose();
  }
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
        ['notes','Notes'],['pocketcode','Pocket Code'],['monitor','System'],['taskmanager','Task Manager'],['settings','Settings']
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
      page.innerHTML = pageHead('System', 'Your browser-based virtual desktop.') + virtualDesktopInfo() + `<div class="setting-group"><div class="setting-row stack-on-small"><div><strong>A quick tour of PocketVM</strong><small>Explore the desktop, apps, Files, Store, personalisation and Terminal.</small></div><button class="soft-btn" id="replay-tutorial">Replay Tutorial</button></div></div>` + `
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
      $('#replay-tutorial',page).onclick=openTutorial;
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
        <p class="privacy-note">Files are stored in IndexedDB; account preferences and game saves use local browser storage. Data can persist after closing the browser. Clearing site data or private browsing may remove it. The Terminal command <code>null.user</code> asks for confirmation before resetting PocketVM data.</p>`;
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
            if (['editor','preview','imageviewer','pocketcode','snake','deadwave','blockblast','crumbclicker','pvz','flappy','penguinpull','apexrush','wobblebay','gradeschool','ballvsball','stickwar','boostleague','knockout','shoot','matchsurvival','subwaysurfers','avengefps','footyphysics','swarmsim','bouncemasters'].includes(w.appId)) closeWindow(w.id, { force:true });
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
  function virtualDesktopInfo(){
    return `<section class="virtual-desktop-info"><span class="info-eyebrow">UNDER THE DESKTOP</span><h3>A desktop experience, inside your browser.</h3><p>PocketVM is a browser-based virtual desktop, rather than a hardware virtual machine. Everything runs inside the browser; it does not install or boot an operating system.</p><div class="virtual-info-grid"><div><b>Local browser storage</b><p>Files live in IndexedDB. Your local account, preferences and game saves use browser storage. Data can persist after you close the browser.</p></div><div><b>Your browser manages the data</b><p>Clearing site data, private browsing or browser storage cleanup can remove local data. Export important files to keep a copy.</p></div><div><b>Built for familiar everyday apps</b><p>The desktop, Terminal and virtual drive are web interfaces. PocketVM is not a secure sandbox for untrusted software.</p></div></div></section>`;
  }
  function buildAbout(win) {
    win.content.innerHTML = `<div class="app-pad about-pocketvm"><div class="about-mast"><div class="about-logo">PV</div><div><span class="info-eyebrow">BROWSER-BASED VIRTUAL DESKTOP</span><h2>PocketVM 2.1</h2><p>Your desktop. Your browser. Your space.</p></div></div>${virtualDesktopInfo()}<div class="setting-group"><div class="setting-row"><span>Desktop shell</span><strong>2.1</strong></div><div class="setting-row"><span>Terminal</span><strong>PocketVM Shell 2.0</strong></div><div class="setting-row"><span>Virtual drive</span><strong>Up to 1 GB · browser quota applies</strong></div><div class="setting-row"><span>Offline</span><strong>Cached apps and local files</strong></div></div><button class="soft-btn" id="about-tour">Take the PocketVM tour →</button></div>`;
    $('#about-tour',win.el).onclick=openTutorial;
  }
  function openTutorial(){
    PocketWelcome.open({desktop:$('#desktop'),disk:PocketDisk,username:shellUser,onFinish:()=>{tutorialForNewProfile=false;try{localStorage.removeItem('pocketvm.tutorial.pending');}catch{}}});
  }
const host=document.getElementById('qa-content'),win={id:'qa',el:document.getElementById('qa-window'),content:host};state.windows.set(win.id,win);
function openApp(id){win.cleanup?.();delete win.cleanup;delete win.term;if(id==='terminal')buildTerminal(win);else if(id==='settings')buildSettings(win);else if(id==='about')buildAbout(win);else host.textContent='Open Files from the real desktop to browse user files.';document.getElementById('qa-title').textContent=id==='settings'?'Settings':id==='about'?'About PocketVM':'Terminal';}
document.querySelectorAll('[data-qa-view]').forEach(b=>b.onclick=()=>openApp(b.dataset.qaView));document.getElementById('qa-tour').onclick=openTutorial;document.getElementById('qa-username').onchange=e=>{state.user.name=e.target.value;renderUserChrome()};ready.then(()=>openApp('terminal'));
