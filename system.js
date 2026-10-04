(() => {
  'use strict';

  function platformName() {
    return navigator.userAgentData && navigator.userAgentData.platform ? navigator.userAgentData.platform : (navigator.platform || 'Browser');
  }

  function connectionText() {
    if (!navigator.onLine) return 'Offline';
    const c = navigator.connection;
    if (!c) return 'Online';
    const parts = [c.effectiveType || 'Online'];
    if (c.downlink) parts.push(c.downlink + ' Mbps');
    return parts.join(' · ');
  }

  function buildSystem(win, options, ctx) {
    ctx.setWindowTitle(win, 'System', '⌁');
    win.content.innerHTML =
      '<div class="system-v3">' +
        '<div class="system-v3-hero"><div><span class="sys-eyebrow">POCKETVM</span><h2>System</h2><p>Real information available to this browser session.</p></div><div class="sys-live"><i></i> Live</div></div>' +
        '<div class="system-v3-drive">' +
          '<div class="system-drive-top"><div><span>Local Disk</span><strong data-vdisk-used>—</strong></div><div><span>Capacity</span><strong>1.00 GB</strong></div></div>' +
          '<div class="system-drive-track"><i data-vdisk-bar></i></div>' +
          '<div class="system-drive-foot"><span data-vdisk-free>— free</span><span>IndexedDB virtual drive</span></div>' +
        '</div>' +
        '<div class="system-v3-cards">' +
          '<div class="system-v3-card"><span>Frame rate</span><strong data-system-fps>--</strong><small>rendering FPS</small></div>' +
          '<div class="system-v3-card"><span>Open windows</span><strong data-system-windows>0</strong><small>current session</small></div>' +
          '<div class="system-v3-card"><span>Network</span><strong data-system-network>--</strong><small>connection</small></div>' +
          '<div class="system-v3-card"><span>Uptime</span><strong data-system-uptime>--</strong><small>since PocketVM boot</small></div>' +
        '</div>' +
        '<div class="system-v3-columns">' +
          '<section class="system-v3-panel"><h3>Device</h3><div class="system-detail-list" data-system-device></div></section>' +
          '<section class="system-v3-panel"><h3>Storage details</h3><div class="system-detail-list" data-system-storage></div></section>' +
        '</div>' +
        '<div class="system-v3-actions"><button class="soft-btn" data-system-taskmanager>Open Task Manager</button><button class="soft-btn" data-system-files>Open Files</button></div>' +
      '</div>';

    let alive = true;
    let frames = 0;
    let fps = 60;
    let last = performance.now();

    const frameTick = () => {
      if (!alive) return;
      frames++;
      const now = performance.now();
      if (now - last >= 900) {
        fps = Math.round(frames * 1000 / (now - last));
        frames = 0;
        last = now;
      }
      requestAnimationFrame(frameTick);
    };
    requestAnimationFrame(frameTick);

    const render = async () => {
      if (!alive) return;
      const stats = await PocketDisk.stats();
      const pct = Math.min(100, stats.used / stats.max * 100);
      ctx.queryOne('[data-vdisk-used]', win.el).textContent = PocketDisk.formatBytes(stats.used);
      ctx.queryOne('[data-vdisk-free]', win.el).textContent = PocketDisk.formatBytes(stats.free) + ' free';
      ctx.queryOne('[data-vdisk-bar]', win.el).style.width = pct + '%';
      ctx.queryOne('[data-system-fps]', win.el).textContent = String(fps);
      ctx.queryOne('[data-system-windows]', win.el).textContent = String(ctx.state.windows.size);
      ctx.queryOne('[data-system-network]', win.el).textContent = navigator.onLine ? 'Online' : 'Offline';
      ctx.queryOne('[data-system-uptime]', win.el).textContent = ctx.formatUptime(Date.now() - ctx.state.bootedAt);

      const device = ctx.queryOne('[data-system-device]', win.el);
      const deviceRows = [
        ['Platform', platformName()],
        ['CPU threads', navigator.hardwareConcurrency || 'Not exposed'],
        ['Device memory', navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'Not exposed'],
        ['Viewport', innerWidth + ' × ' + innerHeight],
        ['Language', navigator.language || '—'],
        ['Display mode', matchMedia('(display-mode: standalone)').matches ? 'Installed app' : 'Browser tab']
      ];
      device.innerHTML = '';
      deviceRows.forEach(row => {
        const el = document.createElement('div');
        el.innerHTML = '<span>' + ctx.escapeHTML(String(row[0])) + '</span><strong>' + ctx.escapeHTML(String(row[1])) + '</strong>';
        device.appendChild(el);
      });

      const storage = ctx.queryOne('[data-system-storage]', win.el);
      const storageRows = [
        ['Virtual limit', '1.00 GB'],
        ['Virtual used', PocketDisk.formatBytes(stats.used)],
        ['Virtual free', PocketDisk.formatBytes(stats.free)],
        ['Browser quota', stats.browserQuota ? PocketDisk.formatBytes(stats.browserQuota) : 'Not exposed'],
        ['Browser usage', stats.browserUsage ? PocketDisk.formatBytes(stats.browserUsage) : 'Not exposed'],
        ['Persistent storage', stats.persisted ? 'Granted' : 'Best effort']
      ];
      storage.innerHTML = '';
      storageRows.forEach(row => {
        const el = document.createElement('div');
        el.innerHTML = '<span>' + ctx.escapeHTML(String(row[0])) + '</span><strong>' + ctx.escapeHTML(String(row[1])) + '</strong>';
        storage.appendChild(el);
      });
    };

    const timer = setInterval(render, 1000);
    render();
    ctx.queryOne('[data-system-taskmanager]', win.el).addEventListener('click', () => ctx.openApp('taskmanager'));
    ctx.queryOne('[data-system-files]', win.el).addEventListener('click', () => ctx.openApp('files'));
    win.cleanup = () => {
      alive = false;
      clearInterval(timer);
    };
  }

  function buildTaskManager(win, options, ctx) {
    ctx.setWindowTitle(win, 'Task Manager', '▦');
    win.content.innerHTML =
      '<div class="task-manager">' +
        '<div class="task-manager-head"><div><span class="sys-eyebrow">POCKETVM</span><h2>Task Manager</h2></div><div class="task-manager-tabs"><button class="active" data-tm-tab="processes">Processes</button><button data-tm-tab="performance">Performance</button></div></div>' +
        '<section class="task-manager-page" data-tm-page></section>' +
      '</div>';

    const page = ctx.queryOne('[data-tm-page]', win.el);
    let active = 'processes';
    let alive = true;
    let frames = 0;
    let fps = 60;
    let last = performance.now();

    const frameTick = () => {
      if (!alive) return;
      frames++;
      const now = performance.now();
      if (now - last >= 900) {
        fps = Math.round(frames * 1000 / (now - last));
        frames = 0;
        last = now;
      }
      requestAnimationFrame(frameTick);
    };
    requestAnimationFrame(frameTick);

    function appTitle(w) {
      const name = ctx.queryOne('.window-name', w.el);
      return name ? name.textContent : (ctx.apps[w.appId] ? ctx.apps[w.appId].name : w.appId);
    }

    function renderProcesses() {
      page.innerHTML =
        '<div class="tm-process-toolbar"><span><strong data-tm-count>0</strong> running windows</span><small>Per-app RAM/CPU is not exposed by Safari, so PocketVM does not invent those numbers.</small></div>' +
        '<div class="tm-process-list"><div class="tm-process-header"><span>Name</span><span>Status</span><span>Window</span><span></span></div><div data-tm-processes></div></div>';
      const list = ctx.queryOne('[data-tm-processes]', page);
      const windows = Array.from(ctx.state.windows.values());
      ctx.queryOne('[data-tm-count]', page).textContent = String(windows.length);

      windows.forEach(w => {
        const row = document.createElement('div');
        row.className = 'tm-process-row';
        const app = ctx.apps[w.appId] || { name:w.appId, icon:'◇' };
        const status = w.el.classList.contains('minimized') ? 'Suspended' : (w.el.classList.contains('focused') ? 'Active' : 'Running');
        row.innerHTML =
          '<span class="tm-process-app"><i>' + ctx.escapeHTML(app.icon || '◇') + '</i><strong>' + ctx.escapeHTML(app.name || w.appId) + '</strong></span>' +
          '<span><em class="tm-status ' + status.toLowerCase() + '">' + ctx.escapeHTML(status) + '</em></span>' +
          '<span class="tm-window-title">' + ctx.escapeHTML(appTitle(w)) + '</span>' +
          '<span><button class="tm-end-task">End task</button></span>';
        ctx.queryOne('.tm-end-task', row).addEventListener('click', () => {
          if (w.id === win.id) {
            setTimeout(() => ctx.closeWindow(w.id), 0);
            return;
          }
          ctx.closeWindow(w.id);
          renderProcesses();
        });
        list.appendChild(row);
      });

      if (!windows.length) {
        list.innerHTML = '<div class="tm-empty">No application windows are open.</div>';
      }
    }

    async function renderPerformance() {
      const stats = await PocketDisk.stats();
      const pct = Math.min(100, stats.used / stats.max * 100);
      page.innerHTML =
        '<div class="tm-performance-grid">' +
          '<div class="tm-perf-card"><span>Frame rate</span><strong>' + fps + ' FPS</strong><small>Current UI rendering</small></div>' +
          '<div class="tm-perf-card"><span>Virtual drive</span><strong>' + ctx.escapeHTML(PocketDisk.formatBytes(stats.used)) + '</strong><small>of 1.00 GB</small><div class="tm-meter"><i style="width:' + pct + '%"></i></div></div>' +
          '<div class="tm-perf-card"><span>Windows</span><strong>' + ctx.state.windows.size + '</strong><small>Open app windows</small></div>' +
          '<div class="tm-perf-card"><span>Network</span><strong>' + ctx.escapeHTML(navigator.onLine ? 'Online' : 'Offline') + '</strong><small>' + ctx.escapeHTML(connectionText()) + '</small></div>' +
        '</div>' +
        '<div class="tm-performance-details">' +
          '<div><span>Browser quota</span><strong>' + ctx.escapeHTML(stats.browserQuota ? PocketDisk.formatBytes(stats.browserQuota) : 'Not exposed') + '</strong></div>' +
          '<div><span>CPU threads</span><strong>' + ctx.escapeHTML(String(navigator.hardwareConcurrency || 'Not exposed')) + '</strong></div>' +
          '<div><span>Uptime</span><strong>' + ctx.escapeHTML(ctx.formatUptime(Date.now() - ctx.state.bootedAt)) + '</strong></div>' +
          '<div><span>Storage persistence</span><strong>' + (stats.persisted ? 'Granted' : 'Best effort') + '</strong></div>' +
        '</div>';
    }

    const render = () => {
      ctx.queryAll('[data-tm-tab]', win.el).forEach(button => button.classList.toggle('active', button.dataset.tmTab === active));
      if (active === 'processes') renderProcesses();
      else renderPerformance();
    };

    ctx.queryAll('[data-tm-tab]', win.el).forEach(button => button.addEventListener('click', () => {
      active = button.dataset.tmTab;
      render();
    }));

    const timer = setInterval(() => {
      if (!alive) return;
      if (active === 'processes') renderProcesses();
      else renderPerformance();
    }, 1200);
    render();
    win.cleanup = () => {
      alive = false;
      clearInterval(timer);
    };
  }

  window.PocketSystemApps = Object.freeze({
    buildSystem,
    buildTaskManager
  });
})();
