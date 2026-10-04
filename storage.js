(() => {
  'use strict';

  const DB_NAME = 'pocketvm-drive';
  const DB_VERSION = 1;
  const MAX_BYTES = 1024 * 1024 * 1024;
  const STANDARD_DIRS = [
    '/',
    '/home',
    '/home/user',
    '/home/user/Desktop',
    '/home/user/Documents',
    '/home/user/Downloads',
    '/home/user/Pictures'
  ];

  let dbPromise = null;

  const request = req => new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB request failed.'));
  });

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('nodes')) db.createObjectStore('nodes', { keyPath: 'path' });
        if (!db.objectStoreNames.contains('data')) db.createObjectStore('data', { keyPath: 'path' });
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Could not open the PocketVM drive.'));
      req.onblocked = () => reject(new Error('PocketVM storage is blocked by another open tab.'));
    });
    return dbPromise;
  }

  async function withStores(names, mode, fn) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(names, mode);
      const stores = Object.fromEntries(names.map(name => [name, tx.objectStore(name)]));
      let result;
      try { result = fn(stores, tx); } catch (err) { tx.abort(); reject(err); return; }
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error || new Error('PocketVM drive transaction failed.'));
      tx.onabort = () => reject(tx.error || new Error('PocketVM drive transaction was aborted.'));
    });
  }

  function cleanPath(value) {
    let path = String(value || '/').replace(/\\/g, '/');
    if (!path.startsWith('/')) path = '/' + path;
    const parts = [];
    for (const part of path.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') parts.pop();
      else parts.push(part);
    }
    return '/' + parts.join('/');
  }

  function parent(path) {
    const p = cleanPath(path);
    return p === '/' ? '/' : p.slice(0, p.lastIndexOf('/')) || '/';
  }

  function nameOf(path) {
    const p = cleanPath(path);
    return p === '/' ? '/' : p.slice(p.lastIndexOf('/') + 1);
  }

  function mimeFromName(name) {
    const lower = String(name || '').toLowerCase();
    if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'text/html';
    if (lower.endsWith('.txt')) return 'text/plain';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    return 'application/octet-stream';
  }

  function isImageMime(mime) {
    return /^image\/(png|jpeg|webp|gif|svg\+xml)$/i.test(String(mime || ''));
  }

  function isTextMime(mime) {
    return /^text\/(plain|html)$/i.test(String(mime || ''));
  }

  function byteLength(value) {
    if (value instanceof Blob) return value.size;
    return new TextEncoder().encode(String(value ?? '')).byteLength;
  }

  async function getMeta(key, fallback = null) {
    const db = await openDB();
    const tx = db.transaction(['meta'], 'readonly');
    const result = await request(tx.objectStore('meta').get(key));
    return result ? result.value : fallback;
  }

  async function setMeta(key, value) {
    await withStores(['meta'], 'readwrite', stores => {
      stores.meta.put({ key, value });
    });
  }

  async function usedBytes() {
    return Number(await getMeta('usedBytes', 0)) || 0;
  }

  async function ensureCapacity(delta) {
    const used = await usedBytes();
    if (used + delta > MAX_BYTES) {
      const err = new Error('PocketVM drive is full. The virtual disk is limited to 1 GB.');
      err.name = 'PocketDiskFullError';
      throw err;
    }
    return used;
  }

  async function getNode(path) {
    const p = cleanPath(path);
    const db = await openDB();
    const tx = db.transaction(['nodes'], 'readonly');
    return (await request(tx.objectStore('nodes').get(p))) || null;
  }

  async function snapshot() {
    const db = await openDB();
    const tx = db.transaction(['nodes'], 'readonly');
    const all = await request(tx.objectStore('nodes').getAll());
    const out = {};
    for (const node of all) {
      out[node.path] = { ...node };
      delete out[node.path].path;
    }
    return out;
  }

  async function ensureDir(path) {
    const p = cleanPath(path);
    const existing = await getNode(p);
    if (existing?.type === 'dir') return existing;
    if (existing) throw new Error('A file already exists at ' + p);
    if (p !== '/') await ensureDir(parent(p));
    const now = Date.now();
    const node = { path: p, type: 'dir', mime: 'inode/directory', size: 0, createdAt: now, modifiedAt: now };
    await withStores(['nodes'], 'readwrite', stores => stores.nodes.put(node));
    return node;
  }

  async function write(path, content, mime = '') {
    const p = cleanPath(path);
    await ensureDir(parent(p));
    const old = await getNode(p);
    if (old?.type === 'dir') throw new Error('A folder already exists with that name.');
    const type = mime || old?.mime || mimeFromName(p);
    const size = byteLength(content);
    const delta = size - Number(old?.size || 0);
    const used = await ensureCapacity(delta);
    const now = Date.now();
    const node = {
      path: p,
      type: 'file',
      mime: type,
      size,
      createdAt: old?.createdAt || now,
      modifiedAt: now
    };
    try {
      await withStores(['nodes', 'data', 'meta'], 'readwrite', stores => {
        stores.nodes.put(node);
        stores.data.put({ path: p, content });
        stores.meta.put({ key: 'usedBytes', value: used + delta });
      });
    } catch (err) {
      if (err?.name === 'QuotaExceededError') {
        throw new Error('Safari/browser storage quota was reached before PocketVM’s 1 GB virtual limit.');
      }
      throw err;
    }
    window.dispatchEvent(new CustomEvent('pocketdiskchange', { detail: { path: p, action: old ? 'change' : 'create' } }));
    return node;
  }

  async function writeText(path, text, mime = '') {
    return write(path, String(text ?? ''), mime || mimeFromName(path));
  }

  async function writeBlob(path, blob, mime = '') {
    const value = blob instanceof Blob ? blob : new Blob([blob], { type: mime || mimeFromName(path) });
    return write(path, value, mime || value.type || mimeFromName(path));
  }

  async function importFile(path, file) {
    const blob = file instanceof Blob ? file : new Blob([file]);
    return writeBlob(path, blob, file.type || mimeFromName(path));
  }

  async function read(path) {
    const p = cleanPath(path);
    const node = await getNode(p);
    if (!node || node.type !== 'file') throw new Error('File not found.');
    const db = await openDB();
    const tx = db.transaction(['data'], 'readonly');
    const row = await request(tx.objectStore('data').get(p));
    return { ...node, content: row?.content ?? '' };
  }

  async function readText(path) {
    const file = await read(path);
    if (file.content instanceof Blob) return file.content.text();
    return String(file.content ?? '');
  }

  async function readBlob(path) {
    const file = await read(path);
    if (file.content instanceof Blob) return file.content;
    return new Blob([String(file.content ?? '')], { type: file.mime || mimeFromName(path) });
  }

  async function descendants(path) {
    const p = cleanPath(path);
    const db = await openDB();
    const tx = db.transaction(['nodes'], 'readonly');
    const all = await request(tx.objectStore('nodes').getAll());
    return all.filter(n => n.path === p || n.path.startsWith(p + '/')).sort((a, b) => a.path.length - b.path.length);
  }

  async function remove(path) {
    const p = cleanPath(path);
    if (STANDARD_DIRS.includes(p)) throw new Error('That system folder cannot be deleted.');
    const nodes = await descendants(p);
    if (!nodes.length) return false;
    const reclaimed = nodes.reduce((sum, n) => sum + Number(n.size || 0), 0);
    const used = await usedBytes();
    await withStores(['nodes', 'data', 'meta'], 'readwrite', stores => {
      for (const node of nodes) {
        stores.nodes.delete(node.path);
        stores.data.delete(node.path);
      }
      stores.meta.put({ key: 'usedBytes', value: Math.max(0, used - reclaimed) });
    });
    window.dispatchEvent(new CustomEvent('pocketdiskchange', { detail: { path: p, action: 'delete' } }));
    return true;
  }

  async function move(from, to) {
    const source = cleanPath(from);
    const target = cleanPath(to);
    if (STANDARD_DIRS.includes(source)) throw new Error('That system folder cannot be moved.');
    if (source === target) return;
    if (target.startsWith(source + '/')) throw new Error('A folder cannot be moved into itself.');
    if (await getNode(target)) throw new Error('An item with that name already exists.');
    await ensureDir(parent(target));
    const nodes = await descendants(source);
    if (!nodes.length) throw new Error('Item not found.');
    const dataRows = [];
    for (const node of nodes) {
      if (node.type === 'file') {
        const db = await openDB();
        const tx = db.transaction(['data'], 'readonly');
        const row = await request(tx.objectStore('data').get(node.path));
        dataRows.push([node.path, row?.content ?? '']);
      }
    }
    const dataMap = new Map(dataRows);
    await withStores(['nodes', 'data'], 'readwrite', stores => {
      for (const node of [...nodes].sort((a, b) => b.path.length - a.path.length)) {
        stores.nodes.delete(node.path);
        if (node.type === 'file') stores.data.delete(node.path);
      }
      for (const node of nodes) {
        const newPath = target + node.path.slice(source.length);
        stores.nodes.put({ ...node, path: newPath, modifiedAt: Date.now() });
        if (node.type === 'file') stores.data.put({ path: newPath, content: dataMap.get(node.path) ?? '' });
      }
    });
    window.dispatchEvent(new CustomEvent('pocketdiskchange', { detail: { path: target, action: 'move', from: source } }));
  }

  async function copy(from, to) {
    const source = cleanPath(from);
    const target = cleanPath(to);
    if (source === target || target.startsWith(source + '/')) throw new Error('Choose a different destination.');
    if (await getNode(target)) throw new Error('An item with that name already exists.');
    await ensureDir(parent(target));
    const nodes = await descendants(source);
    if (!nodes.length) throw new Error('Item not found.');
    const added = nodes.reduce((sum, n) => sum + Number(n.size || 0), 0);
    const used = await ensureCapacity(added);
    const dataMap = new Map();
    for (const node of nodes) {
      if (node.type === 'file') {
        const db = await openDB();
        const tx = db.transaction(['data'], 'readonly');
        const row = await request(tx.objectStore('data').get(node.path));
        dataMap.set(node.path, row?.content ?? '');
      }
    }
    const now = Date.now();
    await withStores(['nodes', 'data', 'meta'], 'readwrite', stores => {
      for (const node of nodes) {
        const newPath = target + node.path.slice(source.length);
        stores.nodes.put({ ...node, path: newPath, createdAt: now, modifiedAt: now });
        if (node.type === 'file') stores.data.put({ path: newPath, content: dataMap.get(node.path) ?? '' });
      }
      stores.meta.put({ key: 'usedBytes', value: used + added });
    });
    window.dispatchEvent(new CustomEvent('pocketdiskchange', { detail: { path: target, action: 'copy', from: source } }));
  }

  async function clearDrive() {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(['nodes', 'data', 'meta'], 'readwrite');
      tx.objectStore('nodes').clear();
      tx.objectStore('data').clear();
      tx.objectStore('meta').put({ key: 'usedBytes', value: 0 });
      tx.objectStore('meta').put({ key: 'migratedLegacy', value: true });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    for (const dir of STANDARD_DIRS) await ensureDir(dir);
    window.dispatchEvent(new CustomEvent('pocketdiskchange', { detail: { path: '/', action: 'reset' } }));
  }

  async function stats() {
    const used = await usedBytes();
    let estimate = null;
    try { estimate = await navigator.storage?.estimate?.(); } catch {}
    return {
      used,
      max: MAX_BYTES,
      free: Math.max(0, MAX_BYTES - used),
      browserUsage: Number(estimate?.usage || 0),
      browserQuota: Number(estimate?.quota || 0),
      persisted: await navigator.storage?.persisted?.().catch?.(() => false) || false
    };
  }

  function formatBytes(bytes) {
    const n = Number(bytes || 0);
    if (n >= 1024 ** 3) return (n / 1024 ** 3).toFixed(n >= 10 * 1024 ** 3 ? 0 : 2) + ' GB';
    if (n >= 1024 ** 2) return (n / 1024 ** 2).toFixed(n >= 10 * 1024 ** 2 ? 0 : 1) + ' MB';
    if (n >= 1024) return (n / 1024).toFixed(n >= 10 * 1024 ? 0 : 1) + ' KB';
    return n + ' B';
  }

  async function migrateLegacy() {
    if (await getMeta('migratedLegacy', false)) return;
    const raw = localStorage.getItem('pocketvm.fs');
    if (raw) {
      try {
        const legacy = JSON.parse(raw);
        const dirs = Object.entries(legacy).filter(([, v]) => v?.type === 'dir').map(([p]) => cleanPath(p)).sort((a, b) => a.length - b.length);
        for (const path of dirs) await ensureDir(path);
        for (const [pathRaw, node] of Object.entries(legacy)) {
          const path = cleanPath(pathRaw);
          if (node?.type !== 'file') continue;
          await writeText(path, node.content || '', mimeFromName(path));
        }
      } catch (err) {
        console.warn('PocketVM legacy file migration failed', err);
      }
    }
    localStorage.removeItem('pocketvm.fs');
    localStorage.removeItem('pocketvm.fs.schema');
    await setMeta('migratedLegacy', true);
  }

  async function init() {
    if (!('indexedDB' in window)) throw new Error('This browser does not support IndexedDB, which PocketVM needs for its virtual drive.');
    await openDB();
    for (const dir of STANDARD_DIRS) await ensureDir(dir);
    await migrateLegacy();
    try { await navigator.storage?.persist?.(); } catch {}
    return snapshot();
  }

  async function destroy() {
    const db = await openDB().catch(() => null);
    db?.close?.();
    dbPromise = null;
    await new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = resolve;
      req.onerror = () => reject(req.error || new Error('Could not erase the PocketVM drive.'));
      req.onblocked = resolve;
    });
  }

  window.PocketDisk = Object.freeze({
    MAX_BYTES,
    STANDARD_DIRS: [...STANDARD_DIRS],
    init,
    snapshot,
    getNode,
    ensureDir,
    writeText,
    writeBlob,
    importFile,
    read,
    readText,
    readBlob,
    remove,
    move,
    copy,
    stats,
    usedBytes,
    clearDrive,
    destroy,
    mimeFromName,
    isImageMime,
    isTextMime,
    formatBytes,
    cleanPath,
    parent,
    nameOf
  });
})();
