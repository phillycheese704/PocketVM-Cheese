(() => {
  'use strict';

  const cleanName = value => String(value || '').trim().replace(/[\\/:*?"<>|]/g, '').slice(0, 100);

  function fileContext(ctx, path) {
    const node = ctx.state.fs[path];
    const mime = node && (node.mime || PocketDisk.mimeFromName(path));
    return {
      node,
      mime,
      image: !!node && node.type === 'file' && PocketDisk.isImageMime(mime),
      html: !!node && node.type === 'file' && /\.html$/i.test(path),
      text: !!node && node.type === 'file' && /\.txt$/i.test(path)
    };
  }

  function iconFor(ctx, path) {
    const info = fileContext(ctx, path);
    if (info.node && info.node.type === 'dir') {
      if (path.endsWith('/Pictures')) return '▧';
      if (path.endsWith('/Downloads')) return '↓';
      if (path.endsWith('/Desktop')) return '▦';
      if (path.endsWith('/Documents')) return '▤';
      return '📁';
    }
    if (info.image) return '▧';
    if (info.html) return '◎';
    return '📄';
  }

  function kindFor(ctx, path) {
    const info = fileContext(ctx, path);
    if (!info.node) return 'File';
    if (info.node.type === 'dir') return 'Folder';
    if (info.image) return 'Image';
    if (info.html) return 'HTML document';
    if (info.text) return 'Text document';
    return info.mime || 'File';
  }

  async function uniqueTarget(ctx, candidate, destination) {
    await ctx.refreshFS();
    if (!ctx.state.fs[candidate]) return candidate;
    const name = ctx.basename(candidate);
    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    let i = 2;
    let target = candidate;
    while (ctx.state.fs[target]) {
      target = ctx.norm(stem + ' (' + i + ')' + ext, destination);
      i++;
    }
    return target;
  }

  function buildFiles(win, options, ctx) {
    options = options || {};
    let current = options.path || '/home/user';
    let view = localStorage.getItem('pocketvm.files.view') || 'grid';
    let sort = localStorage.getItem('pocketvm.files.sort') || 'name';
    let selectMode = false;
    const selected = new Set();
    const history = [current];
    let historyIndex = 0;
    let thumbUrls = [];
    let holdTimer = null;
    let holdTriggered = false;
    let suppressNextClick = false;
    let holdX = 0;
    let holdY = 0;
    let touchMoved = false;

    ctx.setWindowTitle(win, 'Files', '▤');
    win.content.innerHTML =
      '<div class="files-v3">' +
        '<aside class="files-nav-v3">' +
          '<div class="files-nav-title"><span>▤</span><div><strong>Files</strong><small>This PC</small></div></div>' +
          '<nav class="files-locations">' +
            '<button data-files-path="/home/user"><span>⌂</span><div><strong>Home</strong><small>Your folders</small></div></button>' +
            '<button data-files-path="/home/user/Desktop"><span>▦</span><div><strong>Desktop</strong><small>Desktop files</small></div></button>' +
            '<button data-files-path="/home/user/Documents"><span>▤</span><div><strong>Documents</strong><small>Text & HTML</small></div></button>' +
            '<button data-files-path="/home/user/Downloads"><span>↓</span><div><strong>Downloads</strong><small>Downloaded files</small></div></button>' +
            '<button data-files-path="/home/user/Pictures"><span>▧</span><div><strong>Pictures</strong><small>Images</small></div></button>' +
          '</nav>' +
          '<div class="drive-mini"><div><span>Local Disk</span><strong data-drive-mini-used>—</strong></div><div class="drive-mini-track"><i data-drive-mini-bar></i></div><small data-drive-mini-free>1 GB virtual drive</small></div>' +
        '</aside>' +
        '<section class="files-workspace">' +
          '<div class="files-commandbar">' +
            '<button class="file-command icon-only files-nav-toggle" data-files-nav title="Folders">☰</button>' +
            '<button class="file-command icon-only" data-files-back title="Back">←</button>' +
            '<button class="file-command icon-only" data-files-up title="Up">↑</button>' +
            '<span class="command-sep"></span>' +
            '<button class="file-command" data-files-new-folder>＋ Folder</button>' +
            '<button class="file-command" data-files-new-text>＋ Text</button>' +
            '<button class="file-command" data-files-new-html>＋ HTML</button>' +
            '<button class="file-command" data-files-import>↓ Import</button>' +
            '<button class="file-command" data-files-paste hidden>Paste</button>' +
            '<span class="files-spacer"></span>' +
            '<button class="file-command" data-files-select>Select</button>' +
            '<button class="file-command icon-only" data-files-view title="Change view">▦</button>' +
            '<select class="files-sort" aria-label="Sort files"><option value="name">Name</option><option value="modified">Date modified</option><option value="size">Size</option><option value="type">Type</option></select>' +
          '</div>' +
          '<div class="files-breadcrumbs" aria-label="Current folder"></div>' +
          '<div class="files-selectionbar" hidden><strong data-selection-count>0 selected</strong><button data-selection-open>Open</button><button data-selection-copy>Copy</button><button data-selection-cut>Cut</button><button data-selection-delete>Delete</button><button data-selection-properties>Properties</button><button data-selection-clear>Clear</button></div>' +
          '<div class="files-view-v3"></div>' +
          '<div class="files-statusbar"><span data-files-count>0 items</span><span class="files-spacer"></span><span data-files-status>Ready</span></div>' +
          '<div class="files-context-menu" hidden></div>' +
          '<input class="hidden-file-input" id="files-import-v3" type="file" accept=".txt,.html,.png,.jpg,.jpeg,.webp,.gif,.svg,text/plain,text/html,image/png,image/jpeg,image/webp,image/gif,image/svg+xml" multiple />' +
        '</section>' +
      '</div>';

    const q = selector => ctx.queryOne(selector, win.el);
    const qa = selector => ctx.queryAll(selector, win.el);
    const fileView = q('.files-view-v3');
    const contextMenu = q('.files-context-menu');
    q('.files-sort').value = sort;

    function revokeThumbs() {
      thumbUrls.forEach(url => URL.revokeObjectURL(url));
      thumbUrls = [];
    }

    async function updateDriveMeter() {
      try {
        const stats = await PocketDisk.stats();
        const pct = Math.min(100, stats.used / stats.max * 100);
        q('[data-drive-mini-used]').textContent = PocketDisk.formatBytes(stats.used);
        q('[data-drive-mini-bar]').style.width = pct + '%';
        q('[data-drive-mini-free]').textContent = PocketDisk.formatBytes(stats.free) + ' free of 1 GB';
      } catch {
        q('[data-drive-mini-used]').textContent = '—';
        q('[data-drive-mini-bar]').style.width = '0%';
        q('[data-drive-mini-free]').textContent = 'Storage unavailable';
      }
    }

    function sortItems(items) {
      return items.sort((a, b) => {
        const an = ctx.state.fs[a];
        const bn = ctx.state.fs[b];
        if (an.type !== bn.type) return an.type === 'dir' ? -1 : 1;
        if (sort === 'modified') return Number(bn.modifiedAt || 0) - Number(an.modifiedAt || 0);
        if (sort === 'size') return Number(bn.size || 0) - Number(an.size || 0);
        if (sort === 'type') return kindFor(ctx, a).localeCompare(kindFor(ctx, b)) || ctx.basename(a).localeCompare(ctx.basename(b));
        return ctx.basename(a).localeCompare(ctx.basename(b), undefined, { numeric:true, sensitivity:'base' });
      });
    }

    function renderBreadcrumbs() {
      const root = '/home/user';
      const relative = current === root ? [] : current.slice(root.length + 1).split('/').filter(Boolean);
      const crumbs = [{ label:'Home', path:root }];
      let built = root;
      relative.forEach(part => {
        built += '/' + part;
        crumbs.push({ label:part, path:built });
      });
      const el = q('.files-breadcrumbs');
      el.innerHTML = '';
      crumbs.forEach((crumb, i) => {
        const button = document.createElement('button');
        button.textContent = crumb.label;
        button.addEventListener('click', () => go(crumb.path));
        el.appendChild(button);
        if (i < crumbs.length - 1) {
          const sep = document.createElement('span');
          sep.textContent = '›';
          el.appendChild(sep);
        }
      });
    }

    function selectedPaths() {
      return Array.from(selected).filter(path => ctx.state.fs[path]);
    }

    function updateSelectionUI() {
      const bar = q('.files-selectionbar');
      const count = selected.size;
      bar.hidden = !count;
      q('[data-selection-count]').textContent = count + ' selected';
      qa('[data-file-path]').forEach(el => el.classList.toggle('selected', selected.has(el.dataset.filePath)));
      q('[data-files-select]').classList.toggle('active', selectMode);
    }

    function toggleSelection(path, additive) {
      if (!additive && !selectMode) selected.clear();
      if (selected.has(path) && (additive || selectMode)) selected.delete(path);
      else selected.add(path);
      updateSelectionUI();
    }

    async function go(path, push) {
      if (push === undefined) push = true;
      await ctx.refreshFS();
      current = ctx.state.fs[path] && ctx.state.fs[path].type === 'dir' ? path : '/home/user';
      selected.clear();
      if (push) {
        history.splice(historyIndex + 1);
        history.push(current);
        historyIndex = history.length - 1;
      }
      await render();
    }

    async function render() {
      revokeThumbs();
      await ctx.refreshFS();
      if (!ctx.state.fs[current] || ctx.state.fs[current].type !== 'dir') current = '/home/user';
      renderBreadcrumbs();
      qa('[data-files-path]').forEach(button => button.classList.toggle('active', button.dataset.filesPath === current));
      q('[data-files-back]').disabled = historyIndex <= 0;
      q('[data-files-up]').disabled = current === '/home/user';
      q('[data-files-paste]').hidden = !(ctx.state.fileClipboard && ctx.state.fileClipboard.paths && ctx.state.fileClipboard.paths.length);
      q('[data-files-view]').textContent = view === 'grid' ? '☷' : '▦';
      fileView.dataset.view = view;
      q('.files-sort').value = sort;

      const items = sortItems(ctx.children(current));
      q('[data-files-count]').textContent = items.length + (items.length === 1 ? ' item' : ' items');
      q('[data-files-status]').textContent = current.replace('/home/user', 'Home') || 'Home';
      fileView.innerHTML = '';

      if (!items.length) {
        fileView.innerHTML = '<div class="files-empty-v3"><div>◇</div><strong>This folder is empty</strong><span>Import something or create a file or folder.</span></div>';
        updateSelectionUI();
        updateDriveMeter();
        return;
      }

      items.forEach(path => {
        const node = ctx.state.fs[path];
        const entry = document.createElement('button');
        entry.type = 'button';
        entry.className = 'file-entry-v3';
        entry.dataset.filePath = path;
        const date = node.modifiedAt || node.createdAt;
        const dateText = date ? new Date(date).toLocaleString([], { dateStyle:'medium', timeStyle:'short' }) : '—';
        entry.innerHTML =
          '<span class="file-preview-v3"><span class="file-fallback-icon">' + iconFor(ctx, path) + '</span></span>' +
          '<span class="file-name-v3">' + ctx.escapeHTML(ctx.basename(path)) + '</span>' +
          '<span class="file-type-v3">' + ctx.escapeHTML(kindFor(ctx, path)) + '</span>' +
          '<span class="file-date-v3">' + ctx.escapeHTML(dateText) + '</span>' +
          '<span class="file-size-v3">' + (node.type === 'dir' ? '' : ctx.escapeHTML(PocketDisk.formatBytes(node.size || 0))) + '</span>';

        const info = fileContext(ctx, path);
        if (info.image) {
          PocketDisk.readBlob(path).then(blob => {
            if (!entry.isConnected) return;
            const url = URL.createObjectURL(blob);
            thumbUrls.push(url);
            const img = document.createElement('img');
            img.src = url;
            img.alt = '';
            img.className = 'file-thumb-v3';
            ctx.queryOne('.file-preview-v3', entry).replaceChildren(img);
          }).catch(() => {});
        }

        entry.addEventListener('click', event => {
          if (suppressNextClick) {
            suppressNextClick = false;
            return;
          }
          if (holdTriggered) {
            holdTriggered = false;
            return;
          }
          toggleSelection(path, event.metaKey || event.ctrlKey || event.shiftKey || selectMode);
        });
        entry.addEventListener('dblclick', event => {
          event.preventDefault();
          if (!selectMode) openItem(path);
        });
        entry.addEventListener('contextmenu', event => {
          event.preventDefault();
          selected.clear();
          selected.add(path);
          updateSelectionUI();
          showContext(path, event.clientX, event.clientY);
        });
        entry.addEventListener('pointerdown', event => {
          if (event.pointerType !== 'touch') return;
          holdTriggered = false;
          touchMoved = false;
          holdX = event.clientX;
          holdY = event.clientY;
          holdTimer = setTimeout(() => {
            holdTriggered = true;
            selected.clear();
            selected.add(path);
            updateSelectionUI();
            showContext(path, holdX, holdY);
            if (navigator.vibrate) navigator.vibrate(18);
          }, 600);
        });
        entry.addEventListener('pointerup', event => {
          if (event.pointerType !== 'touch') return;
          clearTimeout(holdTimer);
          suppressNextClick = true;
          if (holdTriggered) {
            holdTriggered = false;
            return;
          }
          if (touchMoved) {
            touchMoved = false;
            return;
          }
          if (selectMode) toggleSelection(path, true);
          else openItem(path);
        });
        entry.addEventListener('pointercancel', () => clearTimeout(holdTimer));
        entry.addEventListener('pointermove', event => {
          if (Math.hypot(event.clientX - holdX, event.clientY - holdY) > 12) {
            touchMoved = true;
            clearTimeout(holdTimer);
          }
        });
        fileView.appendChild(entry);
      });

      updateSelectionUI();
      updateDriveMeter();
    }

    async function openItem(path) {
      const info = fileContext(ctx, path);
      if (!info.node) return;
      if (info.node.type === 'dir') {
        await go(path);
        return;
      }
      if (info.image) {
        ctx.openApp('imageviewer', { file:path });
        return;
      }
      if (info.html || info.text) ctx.openApp('editor', { file:path });
    }

    async function createFolder() {
      const name = cleanName(prompt('Folder name'));
      if (!name) return;
      const path = ctx.norm(name, current);
      if (ctx.state.fs[path]) {
        alert('That name already exists.');
        return;
      }
      try {
        await PocketDisk.ensureDir(path);
        await ctx.refreshFS();
        ctx.notify('Folder created', name, '📁');
        render();
      } catch (err) {
        alert(err.message || 'Could not create the folder.');
      }
    }

    async function createText(kind) {
      const ext = kind === 'html' ? '.html' : '.txt';
      let name = cleanName(prompt(kind === 'html' ? 'HTML file name' : 'Text file name'));
      if (!name) return;
      if (!name.toLowerCase().endsWith(ext)) name += ext;
      const path = ctx.norm(name, current);
      if (ctx.state.fs[path]) {
        alert('That name already exists.');
        return;
      }
      try {
        await PocketDisk.writeText(path, kind === 'html' ? htmlStarter(name) : '', kind === 'html' ? 'text/html' : 'text/plain');
        await ctx.refreshFS();
        ctx.notify('File created', name, kind === 'html' ? '◎' : '📄');
        render();
        ctx.openApp('editor', { file:path });
      } catch (err) {
        alert(err.message || 'Could not create the file.');
      }
    }

    async function importFiles(files) {
      let added = 0;
      let skipped = 0;
      for (const file of files) {
        const name = cleanName(file.name);
        if (!name || !/\.(txt|html|png|jpe?g|webp|gif|svg)$/i.test(name)) {
          skipped++;
          continue;
        }
        const path = await uniqueTarget(ctx, ctx.norm(name, current), current);
        try {
          await PocketDisk.importFile(path, file);
          added++;
        } catch (err) {
          alert(err.message || ('Could not import ' + name));
          break;
        }
      }
      await ctx.refreshFS();
      render();
      if (added) ctx.notify('Files imported', added + ' file' + (added === 1 ? '' : 's') + ' added.', '↓');
      if (skipped) ctx.notify('Some files were skipped', 'Supported: TXT, HTML, PNG, JPG, WebP, GIF and SVG.', '!');
    }

    async function renameItem(path) {
      const info = fileContext(ctx, path);
      if (!info.node) return;
      const name = cleanName(prompt('Rename', ctx.basename(path)));
      if (!name || name === ctx.basename(path)) return;
      if (info.node.type === 'file' && !/\.(txt|html|png|jpe?g|webp|gif|svg)$/i.test(name)) {
        alert('Supported files: TXT, HTML, PNG, JPG, WebP, GIF and SVG.');
        return;
      }
      const target = ctx.norm(name, ctx.parentPath(path));
      if (ctx.state.fs[target]) {
        alert('That name already exists.');
        return;
      }
      try {
        await PocketDisk.move(path, target);
        await ctx.refreshFS();
        selected.delete(path);
        selected.add(target);
        ctx.notify('Renamed', ctx.basename(path) + ' → ' + name, '✎');
        render();
      } catch (err) {
        alert(err.message || 'Could not rename the item.');
      }
    }

    async function deleteItems(paths) {
      const existing = paths.filter(path => ctx.state.fs[path]);
      if (!existing.length) return;
      if (!confirm('Delete ' + existing.length + ' item' + (existing.length === 1 ? '' : 's') + '? Folders are deleted with their contents.')) return;
      for (const path of existing) {
        try {
          await PocketDisk.remove(path);
        } catch (err) {
          alert(err.message || ('Could not delete ' + ctx.basename(path)));
        }
      }
      selected.clear();
      await ctx.refreshFS();
      render();
      ctx.notify('Deleted', existing.length + ' item' + (existing.length === 1 ? '' : 's'), '×');
    }

    async function downloadItem(path) {
      const info = fileContext(ctx, path);
      if (!info.node || info.node.type !== 'file') return;
      const blob = await PocketDisk.readBlob(path);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = ctx.basename(path);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1200);
    }

    function showProperties(paths) {
      const items = paths.map(path => ({ path, node:ctx.state.fs[path] })).filter(item => item.node);
      if (!items.length) return;
      const total = items.reduce((sum, item) => sum + Number(item.node.size || 0), 0);
      const single = items.length === 1 ? items[0] : null;
      const overlay = document.createElement('div');
      overlay.className = 'dialog-backdrop';
      let rows = '';
      if (single) {
        rows += '<div><span>Type</span><strong>' + ctx.escapeHTML(kindFor(ctx, single.path)) + '</strong></div>';
        rows += '<div><span>Location</span><strong>' + ctx.escapeHTML(ctx.parentPath(single.path).replace('/home/user','Home')) + '</strong></div>';
      }
      rows += '<div><span>Size</span><strong>' + ctx.escapeHTML(PocketDisk.formatBytes(total)) + '</strong></div>';
      if (single) {
        const value = single.node.modifiedAt || single.node.createdAt;
        const modified = value ? new Date(value).toLocaleString() : '—';
        rows += '<div><span>Modified</span><strong>' + ctx.escapeHTML(modified) + '</strong></div>';
      }
      overlay.innerHTML = '<div class="mini-dialog file-properties-dialog"><h3>' + (single ? ctx.escapeHTML(ctx.basename(single.path)) : items.length + ' items') + '</h3><div class="property-list">' + rows + '</div><div class="dialog-actions"><button class="primary-btn" data-close-props>OK</button></div></div>';
      win.content.appendChild(overlay);
      ctx.queryOne('[data-close-props]', overlay).addEventListener('click', () => overlay.remove());
      overlay.addEventListener('pointerdown', event => {
        if (event.target === overlay) overlay.remove();
      });
    }

    function setClipboard(mode, paths) {
      if (!paths.length) return;
      ctx.state.fileClipboard = { mode, paths:Array.from(paths) };
      q('[data-files-paste]').hidden = false;
      ctx.notify(mode === 'cut' ? 'Ready to move' : 'Copied', paths.length + ' item' + (paths.length === 1 ? '' : 's'), mode === 'cut' ? '✂' : '□');
    }

    async function pasteClipboard() {
      const clip = ctx.state.fileClipboard;
      if (!clip || !clip.paths || !clip.paths.length) return;
      await ctx.refreshFS();
      for (const source of clip.paths) {
        if (!ctx.state.fs[source]) continue;
        const target = await uniqueTarget(ctx, ctx.norm(ctx.basename(source), current), current);
        try {
          if (clip.mode === 'cut') await PocketDisk.move(source, target);
          else await PocketDisk.copy(source, target);
          await ctx.refreshFS();
        } catch (err) {
          alert(err.message || ('Could not paste ' + ctx.basename(source)));
          break;
        }
      }
      if (clip.mode === 'cut') ctx.state.fileClipboard = null;
      selected.clear();
      await ctx.refreshFS();
      render();
    }

    function showContext(path, x, y) {
      const info = fileContext(ctx, path);
      if (!info.node) return;
      contextMenu.innerHTML =
        '<button data-fctx="open"><span>↗</span>Open</button>' +
        (info.html ? '<button data-fctx="run"><span>▶</span>Run HTML</button>' : '') +
        (info.image ? '<button data-fctx="wallpaper"><span>▧</span>Set as wallpaper</button>' : '') +
        '<hr><button data-fctx="copy"><span>□</span>Copy</button><button data-fctx="cut"><span>✂</span>Cut</button><button data-fctx="rename"><span>✎</span>Rename</button>' +
        (info.node.type === 'file' ? '<button data-fctx="download"><span>↓</span>Download</button>' : '') +
        '<hr><button data-fctx="properties"><span>ⓘ</span>Properties</button><button data-fctx="delete" class="danger"><span>×</span>Delete</button>';
      const rootRect = win.content.getBoundingClientRect();
      contextMenu.style.left = Math.max(6, Math.min(x - rootRect.left, rootRect.width - 225)) + 'px';
      contextMenu.style.top = Math.max(6, Math.min(y - rootRect.top, rootRect.height - 340)) + 'px';
      contextMenu.hidden = false;
      ctx.queryAll('[data-fctx]', contextMenu).forEach(button => button.addEventListener('click', async () => {
        contextMenu.hidden = true;
        const action = button.dataset.fctx;
        if (action === 'open') openItem(path);
        if (action === 'run') ctx.openApp('preview', { file:path });
        if (action === 'wallpaper') await ctx.setWallpaperFromFile(path);
        if (action === 'copy') setClipboard('copy', [path]);
        if (action === 'cut') setClipboard('cut', [path]);
        if (action === 'rename') await renameItem(path);
        if (action === 'download') await downloadItem(path);
        if (action === 'properties') showProperties([path]);
        if (action === 'delete') await deleteItems([path]);
      }));
    }

    qa('[data-files-path]').forEach(button => button.addEventListener('click', () => go(button.dataset.filesPath)));
    q('[data-files-nav]').addEventListener('click', () => {
      win.content.querySelector('.files-v3')?.classList.toggle('files-nav-open');
    });
    qa('[data-files-path]').forEach(button => button.addEventListener('click', () => {
      win.content.querySelector('.files-v3')?.classList.remove('files-nav-open');
    }));

    q('[data-files-back]').addEventListener('click', async () => {
      if (historyIndex <= 0) return;
      historyIndex--;
      current = history[historyIndex];
      selected.clear();
      await render();
    });
    q('[data-files-up]').addEventListener('click', () => go(ctx.parentPath(current)));
    q('[data-files-new-folder]').addEventListener('click', createFolder);
    q('[data-files-new-text]').addEventListener('click', () => createText('txt'));
    q('[data-files-new-html]').addEventListener('click', () => createText('html'));
    q('[data-files-import]').addEventListener('click', () => q('#files-import-v3').click());
    q('#files-import-v3').addEventListener('change', event => {
      importFiles(Array.from(event.target.files || []));
      event.target.value = '';
    });
    q('[data-files-paste]').addEventListener('click', pasteClipboard);
    q('[data-files-select]').addEventListener('click', () => {
      selectMode = !selectMode;
      if (!selectMode) selected.clear();
      updateSelectionUI();
    });
    q('[data-files-view]').addEventListener('click', () => {
      view = view === 'grid' ? 'list' : 'grid';
      localStorage.setItem('pocketvm.files.view', view);
      render();
    });
    q('.files-sort').addEventListener('change', event => {
      sort = event.target.value;
      localStorage.setItem('pocketvm.files.sort', sort);
      render();
    });
    q('[data-selection-clear]').addEventListener('click', () => {
      selected.clear();
      updateSelectionUI();
    });
    q('[data-selection-open]').addEventListener('click', () => {
      const path = selectedPaths()[0];
      if (path) openItem(path);
    });
    q('[data-selection-copy]').addEventListener('click', () => setClipboard('copy', selectedPaths()));
    q('[data-selection-cut]').addEventListener('click', () => setClipboard('cut', selectedPaths()));
    q('[data-selection-delete]').addEventListener('click', () => deleteItems(selectedPaths()));
    q('[data-selection-properties]').addEventListener('click', () => showProperties(selectedPaths()));
    win.content.addEventListener('pointerdown', event => {
      if (!event.target.closest('.files-context-menu,.file-entry-v3')) contextMenu.hidden = true;
      const shell = win.content.querySelector('.files-v3');
      if (shell?.classList.contains('files-nav-open') &&
          !event.target.closest('.files-nav-v3,[data-files-nav]')) {
        shell.classList.remove('files-nav-open');
      }
    });

    const showRenderFailure = err => {
      fileView.innerHTML = '<div class="files-empty-v3"><div>!</div><strong>Files unavailable</strong><span>' + ctx.escapeHTML(err?.message || 'Could not read the virtual drive.') + '</span></div>';
      q('[data-files-status]').textContent = 'Storage error';
    };
    const diskListener = () => { render().catch(showRenderFailure); };
    window.addEventListener('pocketdiskchange', diskListener);
    win.cleanup = () => {
      revokeThumbs();
      clearTimeout(holdTimer);
      window.removeEventListener('pocketdiskchange', diskListener);
    };
    render().catch(showRenderFailure);
  }

  function htmlStarter(filename) {
    const title = String(filename || 'PocketVM Page').replace(/\.html$/i, '');
    return '<!doctype html>\\n<html lang="en">\\n<head>\\n  <meta charset="utf-8">\\n  <meta name="viewport" content="width=device-width, initial-scale=1">\\n  <title>' + title + '</title>\\n  <style>body{font-family:system-ui,sans-serif;padding:32px}</style>\\n</head>\\n<body>\\n  <h1>Hello from PocketVM 👋</h1>\\n  <p>Edit this file, then tap Run.</p>\\n  <button onclick="document.body.append(\' It works!\')">Test JavaScript</button>\\n</body>\\n</html>';
  }

  async function buildEditor(win, options, ctx) {
    options = options || {};
    const file = options.file;
    const node = file && ctx.state.fs[file];
    if (!file || !node || node.type !== 'file' || !PocketDisk.isTextMime(node.mime || PocketDisk.mimeFromName(file))) {
      win.content.innerHTML = '<div class="app-pad"><h2>File not found</h2><p style="color:var(--muted)">The editor supports TXT and HTML files.</p></div>';
      return;
    }
    const isHTML = /\.html$/i.test(file);
    ctx.setWindowTitle(win, ctx.basename(file), isHTML ? '◎' : '📄');
    win.content.innerHTML =
      '<div class="editor-app ' + (isHTML ? 'html-editor' : '') + '">' +
        '<div class="editor-toolbar"><strong>' + ctx.escapeHTML(ctx.basename(file)) + '</strong><span class="editor-location">' + ctx.escapeHTML(ctx.parentPath(file).replace('/home/user','Home')) + '</span><span class="files-spacer"></span><span class="editor-state">Loading…</span>' +
        (isHTML ? '<button class="soft-btn" data-editor-run>▶ Run</button>' : '') +
        '<button class="soft-btn" data-editor-save>Save</button></div>' +
        '<textarea class="editor-area" ' + (isHTML ? 'spellcheck="false" autocapitalize="off" autocorrect="off"' : 'spellcheck="true"') + '></textarea>' +
      '</div>';

    const area = ctx.queryOne('.editor-area', win.el);
    const status = ctx.queryOne('.editor-state', win.el);
    try {
      area.value = await PocketDisk.readText(file);
      status.textContent = 'Saved';
    } catch (err) {
      status.textContent = 'Could not read file';
      area.disabled = true;
      return;
    }

    let timer = null;
    let dirty = false;
    const save = async () => {
      clearTimeout(timer);
      if (!ctx.state.fs[file]) return;
      status.textContent = 'Saving…';
      try {
        await PocketDisk.writeText(file, area.value, isHTML ? 'text/html' : 'text/plain');
        await ctx.refreshFS();
        dirty = false;
        status.textContent = 'Saved';
      } catch (err) {
        status.textContent = 'Save failed';
        ctx.notify('Could not save', err.message || ctx.basename(file), '!');
      }
    };

    area.addEventListener('input', () => {
      dirty = true;
      status.textContent = 'Saving…';
      clearTimeout(timer);
      timer = setTimeout(save, 450);
    });
    area.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        save();
      }
    });
    ctx.queryOne('[data-editor-save]', win.el).addEventListener('click', save);
    const run = ctx.queryOne('[data-editor-run]', win.el);
    if (run) run.addEventListener('click', async () => {
      await save();
      ctx.openApp('preview', { file });
    });
    win.cleanup = () => {
      clearTimeout(timer);
      if (dirty) save();
    };
  }

  async function buildPreview(win, options, ctx) {
    options = options || {};
    const file = options.file;
    if (!file || !ctx.state.fs[file] || ctx.state.fs[file].type !== 'file' || !/\.html$/i.test(file)) {
      win.content.innerHTML = '<div class="app-pad"><h2>HTML file not found</h2></div>';
      return;
    }
    ctx.setWindowTitle(win, ctx.basename(file) + ' — Preview', '◉');
    win.content.innerHTML =
      '<div class="browser-app">' +
        '<div class="browser-toolbar"><div class="browser-address"><span>local://</span>' + ctx.escapeHTML(ctx.basename(file)) + '</div><button class="soft-btn" data-preview-edit>Edit</button><button class="soft-btn" data-preview-refresh>↻ Refresh</button></div>' +
        '<div class="browser-safety">Sandboxed local HTML preview · scripts can run, but the page cannot access PocketVM storage.</div>' +
        '<iframe class="html-preview" title="HTML preview" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads"></iframe>' +
      '</div>';

    const frame = ctx.queryOne('.html-preview', win.el);
    const refresh = async () => {
      if (!ctx.state.fs[file]) return;
      try {
        frame.srcdoc = await PocketDisk.readText(file);
      } catch {
        frame.srcdoc = '<h1>Could not load this file.</h1>';
      }
    };
    await refresh();
    ctx.queryOne('[data-preview-refresh]', win.el).addEventListener('click', refresh);
    ctx.queryOne('[data-preview-edit]', win.el).addEventListener('click', () => ctx.openApp('editor', { file }));
  }

  async function buildImageViewer(win, options, ctx) {
    options = options || {};
    const file = options.file;
    const info = file && fileContext(ctx, file);
    if (!file || !info || !info.node || !info.image) {
      win.content.innerHTML = '<div class="app-pad"><h2>Image not found</h2></div>';
      return;
    }
    ctx.setWindowTitle(win, ctx.basename(file) + ' — Photos', '▧');
    win.content.innerHTML =
      '<div class="photos-app">' +
        '<div class="photos-toolbar"><strong>' + ctx.escapeHTML(ctx.basename(file)) + '</strong><span class="files-spacer"></span><button class="soft-btn" data-photo-zoom-out>−</button><button class="soft-btn" data-photo-fit>Fit</button><button class="soft-btn" data-photo-zoom-in>＋</button><button class="soft-btn" data-photo-wallpaper>Set wallpaper</button><button class="soft-btn" data-photo-download>Download</button></div>' +
        '<div class="photos-stage"><div class="photos-canvas"><img alt="' + ctx.escapeHTML(ctx.basename(file)) + '" /></div></div>' +
        '<div class="photos-status"><span>' + ctx.escapeHTML(info.mime) + '</span><span>' + ctx.escapeHTML(PocketDisk.formatBytes(info.node.size || 0)) + '</span><span data-photo-dimensions>Loading…</span></div>' +
      '</div>';

    const img = ctx.queryOne('.photos-canvas img', win.el);
    const canvas = ctx.queryOne('.photos-canvas', win.el);
    const blob = await PocketDisk.readBlob(file);
    const url = URL.createObjectURL(blob);
    let zoom = 1;
    const applyZoom = () => {
      img.style.transform = 'scale(' + zoom + ')';
      canvas.dataset.zoomed = zoom !== 1 ? '1' : '0';
    };
    img.onload = () => {
      ctx.queryOne('[data-photo-dimensions]', win.el).textContent = img.naturalWidth + ' × ' + img.naturalHeight;
    };
    img.src = url;
    ctx.queryOne('[data-photo-zoom-in]', win.el).addEventListener('click', () => {
      zoom = Math.min(4, zoom + .25);
      applyZoom();
    });
    ctx.queryOne('[data-photo-zoom-out]', win.el).addEventListener('click', () => {
      zoom = Math.max(.25, zoom - .25);
      applyZoom();
    });
    ctx.queryOne('[data-photo-fit]', win.el).addEventListener('click', () => {
      zoom = 1;
      applyZoom();
    });
    ctx.queryOne('[data-photo-wallpaper]', win.el).addEventListener('click', () => ctx.setWallpaperFromFile(file));
    ctx.queryOne('[data-photo-download]', win.el).addEventListener('click', () => {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = ctx.basename(file);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    });
    win.cleanup = () => URL.revokeObjectURL(url);
  }

  window.PocketFilesApp = Object.freeze({
    buildFiles,
    buildEditor,
    buildPreview,
    buildImageViewer,
    htmlStarter
  });
})();
