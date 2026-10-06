(() => {
  'use strict';

  const WORKSPACE = '/home/user/Documents/Pocket Code';
  const LANGS = Object.freeze({
    py: { id:'python', label:'Python', ext:'.py', mime:'text/x-python', icon:'PY' },
    html: { id:'html', label:'HTML', ext:'.html', mime:'text/html', icon:'<> ' },
    java: { id:'java', label:'Java', ext:'.java', mime:'text/x-java-source', icon:'J' },
    css: { id:'css', label:'CSS', ext:'.css', mime:'text/css', icon:'#' },
    cs: { id:'csharp', label:'C#', ext:'.cs', mime:'text/x-csharp', icon:'C#' },
    json: { id:'json', label:'JSON', ext:'.json', mime:'application/json', icon:'{}' }
  });

  const KEYWORDS = {
    python: ['and','as','assert','async','await','break','class','continue','def','del','elif','else','except','False','finally','for','from','global','if','import','in','is','lambda','None','nonlocal','not','or','pass','raise','return','True','try','while','with','yield'],
    java: ['abstract','assert','boolean','break','byte','case','catch','char','class','const','continue','default','do','double','else','enum','extends','final','finally','float','for','goto','if','implements','import','instanceof','int','interface','long','native','new','package','private','protected','public','return','short','static','strictfp','super','switch','synchronized','this','throw','throws','transient','try','void','volatile','while','true','false','null'],
    csharp: ['abstract','as','base','bool','break','byte','case','catch','char','checked','class','const','continue','decimal','default','delegate','do','double','else','enum','event','explicit','extern','false','finally','fixed','float','for','foreach','goto','if','implicit','in','int','interface','internal','is','lock','long','namespace','new','null','object','operator','out','override','params','private','protected','public','readonly','ref','return','sbyte','sealed','short','sizeof','stackalloc','static','string','struct','switch','this','throw','true','try','typeof','uint','ulong','unchecked','unsafe','ushort','using','virtual','void','volatile','while','async','await','var','record'],
    css: ['@media','@supports','@keyframes','@import','@font-face','var','calc','clamp','min','max'],
    json: ['true','false','null']
  };

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function languageFor(path) {
    const match = String(path || '').toLowerCase().match(/\.([a-z0-9]+)$/);
    return match && LANGS[match[1]] ? LANGS[match[1]] : null;
  }

  function starter(lang, name) {
    if (lang.id === 'python') return 'def main():\n    print("Hello from Pocket Code")\n\n\nif __name__ == "__main__":\n    main()\n';
    if (lang.id === 'html') return '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>' + escapeHTML(name.replace(/\.html$/i,'')) + '</title>\n</head>\n<body>\n  <h1>Hello from Pocket Code</h1>\n</body>\n</html>\n';
    if (lang.id === 'java') return 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Pocket Code");\n    }\n}\n';
    if (lang.id === 'css') return ':root {\n  color-scheme: dark;\n}\n\nbody {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n';
    if (lang.id === 'csharp') return 'using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine("Hello from Pocket Code");\n    }\n}\n';
    if (lang.id === 'json') return '{\n  "name": "Pocket Code",\n  "version": 1\n}\n';
    return '';
  }

  function balanced(text, pairs, hashComments) {
    const stack = [];
    const opening = Object.keys(pairs);
    const closing = Object.values(pairs);
    let quote = '', escaped = false, lineComment = false, blockComment = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], next = text[i + 1] || '';
      if (lineComment) { if (ch === '\n') lineComment = false; continue; }
      if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
      if (quote) {
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (ch === quote) quote = '';
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
      if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
      if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
      if (hashComments && ch === '#') { lineComment = true; continue; }
      if (opening.includes(ch)) stack.push(ch);
      else if (closing.includes(ch)) {
        const expected = opening[closing.indexOf(ch)];
        if (stack.pop() !== expected) return 'Unexpected ' + ch + ' near character ' + (i + 1) + '.';
      }
    }
    return stack.length ? 'Unclosed ' + stack[stack.length - 1] + '.' : '';
  }

  function validate(text, lang) {
    if (!lang) return { ok:false, message:'Unsupported language.' };
    if (lang.id === 'json') {
      try { JSON.parse(text); return { ok:true, message:'Valid JSON.' }; }
      catch (err) { return { ok:false, message:err.message || 'Invalid JSON.' }; }
    }
    const issue = balanced(text, {'(':')','[':']','{':'}'}, lang.id === 'python');
    if (issue) return { ok:false, message:issue };
    if (lang.id === 'python') {
      const mixed = text.split('\n').findIndex(line => /^ +\t|^\t+ /.test(line));
      if (mixed >= 0) return { ok:false, message:'Mixed tabs and spaces on line ' + (mixed + 1) + '.' };
      return { ok:true, message:'Python structure looks good. Runtime execution is not bundled.' };
    }
    if (lang.id === 'html') return { ok:true, message:'HTML structure looks good. Use Preview to run it.' };
    if (lang.id === 'css') return { ok:true, message:'CSS braces and strings look balanced.' };
    if (lang.id === 'java') return { ok:true, message:'Java structure looks balanced. Compiler runtime is not bundled.' };
    if (lang.id === 'csharp') return { ok:true, message:'C# structure looks balanced. Compiler runtime is not bundled.' };
    return { ok:true, message:'No structural issues found.' };
  }

  function highlight(text, lang) {
    if (!lang) return escapeHTML(text) + '\n';
    if (text.length > 120000) return escapeHTML(text) + '\n';
    const stash = [];
    const hold = (cls, value) => {
      const key = '§§' + stash.length + '§§';
      stash.push('<span class="' + cls + '">' + escapeHTML(value) + '</span>');
      return key;
    };
    let work = String(text);
    if (lang.id === 'html') {
      work = work.replace(/<!--[\s\S]*?-->/g, v => hold('pc-tok-comment', v));
      work = work.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, v => hold('pc-tok-string', v));
      let out = escapeHTML(work);
      out = out.replace(/&lt;\/?[A-Za-z][^&]*?&gt;/g, v => '<span class="pc-tok-tag">' + v + '</span>');
      stash.forEach((v, i) => { out = out.split('§§' + i + '§§').join(v); });
      return out + '\n';
    }
    const slashComments = lang.id === 'java' || lang.id === 'csharp' || lang.id === 'css';
    if (slashComments) {
      work = work.replace(/\/\*[\s\S]*?\*\//g, v => hold('pc-tok-comment', v));
      work = work.replace(/\/\/[^\n]*/g, v => hold('pc-tok-comment', v));
    }
    if (lang.id === 'python') work = work.replace(/#[^\n]*/g, v => hold('pc-tok-comment', v));
    work = work.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, v => hold('pc-tok-string', v));
    let out = escapeHTML(work);
    const words = KEYWORDS[lang.id] || [];
    if (words.length) {
      const rx = new RegExp('\\b(' + words.map(w => w.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&')).join('|') + ')\\b', 'g');
      out = out.replace(rx, '<span class="pc-tok-key">$1</span>');
    }
    out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="pc-tok-number">$1</span>');
    stash.forEach((v, i) => { out = out.split('§§' + i + '§§').join(v); });
    return out + '\n';
  }

  function buildCode(win, options, ctx) {
    options = options || {};
    const q = selector => ctx.queryOne(selector, win.el);
    const qa = selector => ctx.queryAll(selector, win.el);
    const tabs = [];
    let activePath = '';
    let renderToken = 0;

    ctx.setWindowTitle(win, 'Pocket Code', '<>');
    win.content.innerHTML =
      '<div class="pocket-code">' +
        '<aside class="pc-sidebar">' +
          '<div class="pc-brand"><span class="pc-logo">&lt;&gt;</span><div><strong>Pocket Code</strong><small>Local workspace</small></div></div>' +
          '<div class="pc-explorer-head"><span>EXPLORER</span><button data-pc-new title="New file">＋</button></div>' +
          '<div class="pc-workspace-title"><span>▾</span><strong>Pocket Code</strong></div>' +
          '<div class="pc-tree"></div>' +
          '<div class="pc-new-menu" hidden></div>' +
        '</aside>' +
        '<section class="pc-main">' +
          '<div class="pc-topbar">' +
            '<div class="pc-tabs"></div>' +
            '<div class="pc-actions"><button data-pc-save title="Save">Save</button><button data-pc-check title="Check syntax">Check</button><button data-pc-preview title="Preview HTML" hidden>▶ Preview</button></div>' +
          '</div>' +
          '<div class="pc-editor-shell">' +
            '<div class="pc-empty"><div class="pc-empty-logo">&lt;/&gt;</div><strong>Pocket Code</strong><span>Create or open a Python, HTML, Java, CSS, C# or JSON file.</span></div>' +
            '<div class="pc-editor" hidden>' +
              '<pre class="pc-lines" aria-hidden="true"></pre>' +
              '<div class="pc-code-layer"><pre class="pc-highlight" aria-hidden="true"></pre><textarea class="pocket-code-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" wrap="off" aria-label="Code editor"></textarea></div>' +
            '</div>' +
          '</div>' +
          '<footer class="pc-status"><span data-pc-lang>No file</span><span data-pc-message>Ready</span><span class="pc-spacer"></span><span data-pc-pos>Ln 1, Col 1</span><span>UTF-8</span></footer>' +
        '</section>' +
      '</div>';

    const editor = q('.pc-editor');
    const empty = q('.pc-empty');
    const input = q('.pocket-code-input');
    const highlightEl = q('.pc-highlight');
    const linesEl = q('.pc-lines');
    const tabsEl = q('.pc-tabs');
    const treeEl = q('.pc-tree');
    const menuEl = q('.pc-new-menu');
    const previewBtn = q('[data-pc-preview]');
    const statusLang = q('[data-pc-lang]');
    const statusMsg = q('[data-pc-message]');
    const statusPos = q('[data-pc-pos]');

    function activeTab() { return tabs.find(tab => tab.path === activePath) || null; }

    function syncCurrent() {
      const tab = activeTab();
      if (!tab) return;
      if (tab.text !== input.value) {
        tab.text = input.value;
        tab.dirty = true;
      }
    }

    function setStatus(message, bad) {
      statusMsg.textContent = message;
      statusMsg.classList.toggle('bad', !!bad);
    }

    function updatePosition() {
      const before = input.value.slice(0, input.selectionStart || 0);
      const rows = before.split('\n');
      statusPos.textContent = 'Ln ' + rows.length + ', Col ' + (rows[rows.length - 1].length + 1);
    }

    function paintEditor() {
      const tab = activeTab();
      if (!tab) {
        editor.hidden = true;
        empty.hidden = false;
        statusLang.textContent = 'No file';
        previewBtn.hidden = true;
        return;
      }
      editor.hidden = false;
      empty.hidden = true;
      const lang = languageFor(tab.path);
      const count = Math.max(1, input.value.split('\n').length);
      linesEl.textContent = Array.from({length:count}, (_, i) => i + 1).join('\n');
      highlightEl.innerHTML = highlight(input.value, lang);
      statusLang.textContent = lang ? lang.label : 'Text';
      previewBtn.hidden = !lang || lang.id !== 'html';
      updatePosition();
      syncScroll();
    }

    function renderTabs() {
      tabsEl.innerHTML = '';
      tabs.forEach(tab => {
        const button = document.createElement('button');
        button.className = 'pc-tab' + (tab.path === activePath ? ' active' : '');
        button.dataset.path = tab.path;
        const lang = languageFor(tab.path);
        button.innerHTML = '<span class="pc-tab-lang">' + escapeHTML(lang ? lang.icon : '•') + '</span><span class="pc-tab-name">' + escapeHTML(ctx.basename(tab.path)) + (tab.dirty ? ' •' : '') + '</span><span class="pc-tab-close">×</span>';
        button.addEventListener('click', event => {
          if (event.target.closest('.pc-tab-close')) { closeTab(tab.path); return; }
          switchTab(tab.path);
        });
        tabsEl.appendChild(button);
      });
    }

    async function renderTree() {
      const token = ++renderToken;
      await ctx.refreshFS();
      if (token !== renderToken) return;
      treeEl.innerHTML = '';
      const snapshot = ctx.state.fs;
      const children = parent => Object.keys(snapshot).filter(path => path !== parent && ctx.parentPath(path) === parent).sort((a,b) => {
        const an=snapshot[a], bn=snapshot[b];
        if (an.type !== bn.type) return an.type === 'dir' ? -1 : 1;
        return ctx.basename(a).localeCompare(ctx.basename(b), undefined, {numeric:true,sensitivity:'base'});
      });
      const add = (parent, depth) => {
        children(parent).forEach(path => {
          const node = snapshot[path];
          const lang = languageFor(path);
          if (node.type === 'file' && !lang) return;
          const row = document.createElement('button');
          row.className = 'pc-tree-row' + (path === activePath ? ' active' : '');
          row.style.paddingLeft = (12 + depth * 14) + 'px';
          row.innerHTML = node.type === 'dir'
            ? '<span class="pc-tree-icon">▾</span><span>' + escapeHTML(ctx.basename(path)) + '</span>'
            : '<span class="pc-tree-icon pc-file-' + escapeHTML(lang.id) + '">' + escapeHTML(lang.icon) + '</span><span>' + escapeHTML(ctx.basename(path)) + '</span>';
          if (node.type === 'file') row.addEventListener('click', () => openFile(path));
          treeEl.appendChild(row);
          if (node.type === 'dir' && depth < 5) add(path, depth + 1);
        });
      };
      add(WORKSPACE, 0);
      if (!treeEl.children.length) treeEl.innerHTML = '<div class="pc-tree-empty">No code files yet.<br>Create one with ＋</div>';
    }

    function switchTab(path) {
      if (path === activePath) return;
      syncCurrent();
      const next = tabs.find(tab => tab.path === path);
      if (!next) return;
      activePath = path;
      input.value = next.text;
      ctx.setWindowTitle(win, ctx.basename(path) + ' — Pocket Code', '<>');
      renderTabs();
      paintEditor();
      renderTree();
      input.focus();
    }

    async function closeTab(path) {
      syncCurrent();
      const index = tabs.findIndex(tab => tab.path === path);
      if (index < 0) return;
      const tab = tabs[index];
      if (tab.dirty && !confirm('Close ' + ctx.basename(path) + ' without saving?')) return;
      tabs.splice(index, 1);
      if (activePath === path) {
        const next = tabs[index] || tabs[index - 1] || null;
        activePath = next ? next.path : '';
        input.value = next ? next.text : '';
      }
      renderTabs();
      paintEditor();
      renderTree();
      ctx.setWindowTitle(win, activePath ? ctx.basename(activePath) + ' — Pocket Code' : 'Pocket Code', '<>');
    }

    async function openFile(path) {
      const lang = languageFor(path);
      if (!lang) { setStatus('Pocket Code supports Python, HTML, Java, CSS, C# and JSON.', true); return; }
      syncCurrent();
      let tab = tabs.find(item => item.path === path);
      if (!tab) {
        try {
          const text = await PocketDisk.readText(path);
          tab = { path, text, dirty:false };
          tabs.push(tab);
        } catch (err) {
          setStatus(err.message || 'Could not open file.', true);
          return;
        }
      }
      activePath = path;
      input.value = tab.text;
      ctx.setWindowTitle(win, ctx.basename(path) + ' — Pocket Code', '<>');
      renderTabs();
      paintEditor();
      renderTree();
      setStatus('Opened ' + ctx.basename(path) + '.', false);
      input.focus();
    }

    async function saveActive() {
      const tab = activeTab();
      if (!tab) return false;
      syncCurrent();
      const lang = languageFor(tab.path);
      try {
        await PocketDisk.writeText(tab.path, tab.text, lang ? lang.mime : 'text/plain');
        tab.dirty = false;
        await ctx.refreshFS();
        renderTabs();
        renderTree();
        setStatus('Saved ' + ctx.basename(tab.path) + '.', false);
        ctx.notify('Pocket Code', ctx.basename(tab.path) + ' saved.', '<>');
        return true;
      } catch (err) {
        setStatus(err.message || 'Could not save file.', true);
        return false;
      }
    }

    function checkActive() {
      const tab = activeTab();
      if (!tab) return;
      syncCurrent();
      const result = validate(tab.text, languageFor(tab.path));
      setStatus(result.message, !result.ok);
    }

    async function previewActive() {
      const tab = activeTab();
      if (!tab || languageFor(tab.path)?.id !== 'html') return;
      if (await saveActive()) ctx.openApp('preview', { file:tab.path });
    }

    async function createFile(lang) {
      menuEl.hidden = true;
      let name = prompt('New ' + lang.label + ' file', 'main' + lang.ext);
      if (!name) return;
      name = String(name).trim().replace(/[\\/:*?"<>|]/g, '').slice(0, 90);
      if (!name) return;
      if (!name.toLowerCase().endsWith(lang.ext)) name += lang.ext;
      const path = ctx.norm(name, WORKSPACE);
      await ctx.refreshFS();
      if (ctx.state.fs[path]) { alert('That file already exists.'); return; }
      try {
        await PocketDisk.writeText(path, starter(lang, name), lang.mime);
        await ctx.refreshFS();
        await renderTree();
        await openFile(path);
      } catch (err) {
        setStatus(err.message || 'Could not create file.', true);
      }
    }

    function renderNewMenu() {
      menuEl.innerHTML = '';
      Object.values(LANGS).forEach(lang => {
        const button = document.createElement('button');
        button.innerHTML = '<span>' + escapeHTML(lang.icon) + '</span><div><strong>' + escapeHTML(lang.label) + '</strong><small>' + escapeHTML(lang.ext) + '</small></div>';
        button.addEventListener('click', () => createFile(lang));
        menuEl.appendChild(button);
      });
    }

    function syncScroll() {
      highlightEl.scrollTop = input.scrollTop;
      highlightEl.scrollLeft = input.scrollLeft;
      linesEl.scrollTop = input.scrollTop;
    }

    input.addEventListener('input', () => {
      syncCurrent();
      renderTabs();
      paintEditor();
    });
    input.addEventListener('scroll', syncScroll);
    input.addEventListener('click', updatePosition);
    input.addEventListener('keyup', updatePosition);
    input.addEventListener('keydown', event => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === 's') { event.preventDefault(); saveActive(); return; }
      if (event.key === 'Tab') {
        event.preventDefault();
        const start=input.selectionStart,end=input.selectionEnd,value=input.value;
        input.value=value.slice(0,start)+'  '+value.slice(end);
        input.selectionStart=input.selectionEnd=start+2;
        input.dispatchEvent(new Event('input'));
      }
    });

    q('[data-pc-save]').addEventListener('click', saveActive);
    q('[data-pc-check]').addEventListener('click', checkActive);
    previewBtn.addEventListener('click', previewActive);
    q('[data-pc-new]').addEventListener('click', event => {
      event.stopPropagation();
      menuEl.hidden = !menuEl.hidden;
    });
    win.content.addEventListener('pointerdown', event => {
      if (!event.target.closest('.pc-new-menu,[data-pc-new]')) menuEl.hidden = true;
    });

    win.beforeClose = () => {
      syncCurrent();
      if (!tabs.some(tab => tab.dirty)) return true;
      return confirm('Close Pocket Code with unsaved changes?');
    };

    renderNewMenu();
    Promise.resolve().then(async () => {
      await PocketDisk.ensureDir(WORKSPACE);
      await ctx.refreshFS();
      await renderTree();
      if (options.file) await openFile(options.file);
    });
  }

  window.PocketCodeApp = Object.freeze({
    buildCode,
    languageFor,
    languages: Object.values(LANGS).map(lang => ({...lang}))
  });
})();
