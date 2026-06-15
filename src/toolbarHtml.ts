import * as vscode from 'vscode';
import { getElementsByGroup, MarkdownElement } from './markdownElements';

function getNonce(): string {
    let text = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderGroup(group: string, elements: MarkdownElement[]): string {
    const buttons = elements.map(el => {
        const shortcutHtml = el.shortcut ? `<span class="shortcut">${escapeHtml(el.shortcut)}</span>` : '';
        return `<button class="md-btn" data-id="${escapeHtml(el.id)}"
            title="${escapeHtml(el.description)}${el.shortcut ? ' (' + el.shortcut + ')' : ''}"
            aria-label="${escapeHtml(el.label)}">
            <span class="btn-icon">${escapeHtml(el.icon)}</span>
            <span class="btn-label">${escapeHtml(el.label)}</span>
            ${shortcutHtml}
        </button>`;
    }).join('\n');

    return `
    <section class="toolbar-section">
        <button class="section-header" data-section="${escapeHtml(group)}" aria-expanded="true">
            <span class="section-title">${escapeHtml(group)}</span>
            <span class="section-chevron">▾</span>
        </button>
        <div class="section-body" data-body="${escapeHtml(group)}">
            <div class="btn-grid">${buttons}</div>
        </div>
    </section>`;
}

export function getToolbarHtml(webview: vscode.Webview, _extensionUri: vscode.Uri): string {
    const nonce = getNonce();
    const csp = [
        `default-src 'none'`,
        `style-src ${webview.cspSource} 'unsafe-inline'`,
        `script-src 'nonce-${nonce}'`,
        `img-src ${webview.cspSource} data:`,
        `font-src ${webview.cspSource}`
    ].join('; ');

    const groupMap = getElementsByGroup();
    const sectionsHtml = Array.from(groupMap.entries())
        .map(([group, elements]) => renderGroup(group, elements))
        .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Manager</title>
    <style>
        /* ── Reset & Base ─────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { height: 100%; }
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* ── Header ──────────────────────────────────────── */
        .toolbar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 10px;
            background: var(--vscode-titleBar-activeBackground, var(--vscode-editor-background));
            border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-widget-border));
            flex-shrink: 0;
            gap: 6px;
        }
        .header-title {
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 0.04em;
            color: var(--vscode-titleBar-activeForeground, var(--vscode-foreground));
            white-space: nowrap;
        }
        .header-actions {
            display: flex;
            gap: 2px;
            flex-shrink: 0;
        }
        .icon-btn {
            background: none;
            border: none;
            color: var(--vscode-foreground);
            opacity: 0.7;
            cursor: pointer;
            padding: 3px 5px;
            border-radius: 3px;
            font-size: 12px;
            line-height: 1;
            transition: opacity .15s, background .15s;
        }
        .icon-btn:hover { opacity: 1; background: var(--vscode-toolbar-hoverBackground); }
        .icon-btn.active { opacity: 1; background: var(--vscode-toolbar-activeBackground, var(--vscode-button-secondaryBackground)); }

        /* ── Tabs ────────────────────────────────────────── */
        .tabs {
            display: flex;
            background: var(--vscode-editorGroupHeader-tabsBackground, var(--vscode-tab-inactiveBackground));
            border-bottom: 1px solid var(--vscode-panel-border);
            flex-shrink: 0;
        }
        .tab-btn {
            flex: 1;
            padding: 6px 8px;
            border: none;
            background: transparent;
            color: var(--vscode-tab-inactiveForeground, var(--vscode-foreground));
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.03em;
            transition: background .15s, color .15s;
            border-bottom: 2px solid transparent;
        }
        .tab-btn:hover {
            background: var(--vscode-tab-hoverBackground);
            color: var(--vscode-foreground);
        }
        .tab-btn.active {
            color: var(--vscode-tab-activeForeground, var(--vscode-foreground));
            border-bottom-color: var(--vscode-focusBorder, #007acc);
            background: var(--vscode-tab-activeBackground, var(--vscode-editor-background));
        }

        /* ── Tab Panes ───────────────────────────────────── */
        .tab-pane { display: none; flex: 1; overflow: hidden; flex-direction: column; }
        .tab-pane.active { display: flex; }

        /* ── Search Bar ──────────────────────────────────── */
        .search-bar {
            padding: 6px 8px;
            border-bottom: 1px solid var(--vscode-panel-border);
            flex-shrink: 0;
        }
        .search-input {
            width: 100%;
            padding: 4px 8px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border, transparent);
            border-radius: 3px;
            font-size: 12px;
            outline: none;
        }
        .search-input:focus { border-color: var(--vscode-focusBorder); }
        .search-input::placeholder { color: var(--vscode-input-placeholderForeground); }

        /* ── Toolbar Scroll Area ─────────────────────────── */
        .toolbar-scroll {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 4px 0 8px;
        }
        .toolbar-scroll::-webkit-scrollbar { width: 6px; }
        .toolbar-scroll::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 3px;
        }

        /* ── Sections ────────────────────────────────────── */
        .toolbar-section { margin-bottom: 2px; }
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 5px 10px 4px;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--vscode-sideBarSectionHeader-foreground, var(--vscode-foreground));
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            opacity: 0.8;
            transition: opacity .15s;
        }
        .section-header:hover { opacity: 1; background: var(--vscode-list-hoverBackground); }
        .section-chevron { font-size: 10px; transition: transform .2s; }
        .section-header[aria-expanded="false"] .section-chevron { transform: rotate(-90deg); }
        .section-body { padding: 3px 8px 6px; }
        .section-body.collapsed { display: none; }

        /* ── Button Grid ─────────────────────────────────── */
        .btn-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
        }
        .md-btn {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 38px;
            padding: 5px 6px 4px;
            background: var(--vscode-button-secondaryBackground, rgba(128,128,128,0.1));
            color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
            border: 1px solid transparent;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            gap: 2px;
            transition: background .12s, border-color .12s, transform .08s;
            position: relative;
        }
        .md-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground, var(--vscode-toolbar-hoverBackground));
            border-color: var(--vscode-focusBorder, rgba(128,128,128,0.3));
            transform: translateY(-1px);
        }
        .md-btn:active { transform: translateY(0); }
        .md-btn:focus-visible { outline: 1px solid var(--vscode-focusBorder); outline-offset: 1px; }
        .btn-icon {
            font-size: 13px;
            line-height: 1;
            font-style: normal;
            font-weight: 600;
        }
        .btn-label {
            font-size: 9px;
            opacity: 0.75;
            white-space: nowrap;
            max-width: 52px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .shortcut {
            display: none; /* shown in tooltip only */
        }
        .md-btn.hidden { display: none; }

        /* ── No Editor Message ───────────────────────────── */
        .no-editor {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            padding: 24px 16px;
            text-align: center;
            opacity: 0.6;
            gap: 8px;
        }
        .no-editor-icon { font-size: 36px; }
        .no-editor-msg { font-size: 12px; line-height: 1.5; }

        /* ── Preview Tab ─────────────────────────────────── */
        .preview-pane {
            flex: 1;
            overflow-y: auto;
            padding: 12px 14px;
            font-size: 13px;
            line-height: 1.7;
        }
        .preview-pane::-webkit-scrollbar { width: 6px; }
        .preview-pane::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 3px;
        }
        .preview-pane h1 { font-size: 1.8em; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: .3em; margin: .6em 0 .4em; }
        .preview-pane h2 { font-size: 1.4em; border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: .2em; margin: .6em 0 .4em; }
        .preview-pane h3 { font-size: 1.2em; margin: .6em 0 .3em; }
        .preview-pane h4, .preview-pane h5, .preview-pane h6 { margin: .5em 0 .3em; }
        .preview-pane p { margin: .4em 0; }
        .preview-pane code {
            background: var(--vscode-textCodeBlock-background, rgba(128,128,128,0.15));
            padding: .1em .35em;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.88em;
        }
        .preview-pane pre {
            background: var(--vscode-textCodeBlock-background, rgba(128,128,128,0.15));
            border: 1px solid var(--vscode-panel-border);
            border-radius: 5px;
            padding: 10px 12px;
            overflow-x: auto;
            margin: .6em 0;
        }
        .preview-pane pre code { background: none; padding: 0; }
        .preview-pane blockquote {
            border-left: 3px solid var(--vscode-textBlockQuote-border, #007acc);
            background: var(--vscode-textBlockQuote-background, rgba(128,128,128,0.08));
            margin: .6em 0;
            padding: 6px 12px;
            border-radius: 0 4px 4px 0;
        }
        .preview-pane table { border-collapse: collapse; width: 100%; margin: .6em 0; }
        .preview-pane th, .preview-pane td {
            border: 1px solid var(--vscode-panel-border);
            padding: 5px 10px;
            text-align: left;
        }
        .preview-pane th { background: rgba(128,128,128,0.15); font-weight: 600; }
        .preview-pane tr:nth-child(even) { background: rgba(128,128,128,0.05); }
        .preview-pane ul, .preview-pane ol { padding-left: 1.5em; margin: .3em 0; }
        .preview-pane li { margin: .15em 0; }
        .preview-pane a { color: var(--vscode-textLink-foreground, #007acc); }
        .preview-pane hr { border: none; border-top: 1px solid var(--vscode-panel-border); margin: .8em 0; }
        .preview-pane img { max-width: 100%; border-radius: 4px; }
        .preview-placeholder {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            height: 100%; opacity: 0.5; gap: 8px; text-align: center;
        }
        .preview-placeholder-icon { font-size: 32px; }

        /* ── Stats Tab ───────────────────────────────────── */
        .stats-pane {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
        }
        .stat-card {
            background: rgba(128,128,128,0.08);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 8px;
        }
        .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; opacity: .65; margin-bottom: 3px; }
        .stat-value { font-size: 22px; font-weight: 600; color: var(--vscode-charts-blue, #007acc); }
        .stat-sub { font-size: 11px; opacity: 0.6; margin-top: 2px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .heading-list { list-style: none; padding: 0; margin: 0; }
        .heading-list li {
            padding: 3px 6px;
            font-size: 11px;
            border-left: 2px solid var(--vscode-focusBorder, #007acc);
            margin-bottom: 3px;
            cursor: pointer;
            border-radius: 0 3px 3px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .heading-list li:hover { background: var(--vscode-list-hoverBackground); }
        .heading-level-1 { padding-left: 6px; font-weight: 600; }
        .heading-level-2 { padding-left: 14px; }
        .heading-level-3 { padding-left: 22px; opacity: 0.85; }
        .heading-level-4 { padding-left: 30px; opacity: 0.75; }
        .heading-level-5 { padding-left: 38px; opacity: 0.65; }
        .heading-level-6 { padding-left: 46px; opacity: 0.6; }
        .section-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; opacity: .6; margin: 10px 0 5px; }

        /* ── Position Controls ───────────────────────────── */
        .position-bar {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 8px;
            border-top: 1px solid var(--vscode-panel-border);
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            flex-shrink: 0;
        }
        .pos-label { font-size: 10px; opacity: 0.6; margin-right: 2px; flex-shrink: 0; }
        .pos-btn {
            font-size: 11px;
            padding: 3px 7px;
            border: 1px solid var(--vscode-button-border, transparent);
            background: var(--vscode-button-secondaryBackground, rgba(128,128,128,0.12));
            color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
            border-radius: 3px;
            cursor: pointer;
            transition: background .12s;
            white-space: nowrap;
        }
        .pos-btn:hover { background: var(--vscode-button-secondaryHoverBackground, var(--vscode-toolbar-hoverBackground)); }
    </style>
</head>
<body>
    <!-- ── Header ─────────────────────────────────────────────────────── -->
    <div class="toolbar-header">
        <span class="header-title">⌥ Markdown Manager</span>
        <div class="header-actions">
            <button class="icon-btn" id="btn-preview-toggle" title="Open Live Preview (Ctrl+Alt+P)">👁</button>
            <button class="icon-btn" id="btn-format" title="Format Document">⊞</button>
            <button class="icon-btn" id="btn-wordcount-header" title="Show Statistics">📊</button>
        </div>
    </div>

    <!-- ── Tabs ───────────────────────────────────────────────────────── -->
    <div class="tabs" role="tablist">
        <button class="tab-btn active" data-tab="toolbar" role="tab" aria-selected="true">Toolbar</button>
        <button class="tab-btn" data-tab="preview" role="tab" aria-selected="false">Preview</button>
        <button class="tab-btn" data-tab="stats" role="tab" aria-selected="false">Stats</button>
    </div>

    <!-- ── Tab: Toolbar ───────────────────────────────────────────────── -->
    <div class="tab-pane active" id="pane-toolbar">
        <div id="no-editor-msg" class="no-editor" style="display:none">
            <span class="no-editor-icon">📄</span>
            <span class="no-editor-msg">Open a <strong>.md</strong> file to<br>activate the toolbar</span>
        </div>
        <div id="toolbar-content" class="tab-pane active" style="flex-direction:column; display:flex; flex:1; overflow:hidden;">
            <div class="search-bar">
                <input class="search-input" id="search-input" type="text" placeholder="🔍  Filter elements…" autocomplete="off" spellcheck="false">
            </div>
            <div class="toolbar-scroll" id="toolbar-scroll">
                ${sectionsHtml}
            </div>
        </div>
    </div>

    <!-- ── Tab: Preview ───────────────────────────────────────────────── -->
    <div class="tab-pane" id="pane-preview">
        <div class="preview-pane" id="preview-content">
            <div class="preview-placeholder">
                <span class="preview-placeholder-icon">✍️</span>
                <span>Start typing in a .md file<br>to see a live preview here</span>
            </div>
        </div>
    </div>

    <!-- ── Tab: Stats ─────────────────────────────────────────────────── -->
    <div class="tab-pane" id="pane-stats">
        <div class="stats-pane" id="stats-content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Words</div>
                    <div class="stat-value" id="stat-words">—</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Characters</div>
                    <div class="stat-value" id="stat-chars">—</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Lines</div>
                    <div class="stat-value" id="stat-lines">—</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Read Time</div>
                    <div class="stat-value" id="stat-readtime">—</div>
                    <div class="stat-sub">min</div>
                </div>
            </div>
            <div class="stat-card" style="margin-top:8px;">
                <div class="stat-label">Headings</div>
                <div class="stat-value" id="stat-headings">—</div>
                <div class="stat-sub" id="stat-links-count">— links · — images</div>
            </div>
            <div class="section-label" style="margin-top:12px">Document Outline</div>
            <ul class="heading-list" id="heading-list">
                <li style="opacity:0.5;font-style:italic">No headings found</li>
            </ul>
        </div>
    </div>

    <!-- ── Position Bar ───────────────────────────────────────────────── -->
    <div class="position-bar">
        <span class="pos-label">Move:</span>
        <button class="pos-btn" data-pos="sidebar" title="Show in Sidebar">← Left</button>
        <button class="pos-btn" data-pos="panel" title="Show in Bottom Panel">↓ Bottom</button>
        <button class="pos-btn" data-pos="editor" title="Open as Editor Panel">→ Right</button>
    </div>

    <script nonce="${nonce}">
    (function() {
        const vscode = acquireVsCodeApi();
        let hasMarkdownEditor = false;

        // ── Tab switching ───────────────────────────────────────────────
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.tab === tab);
                    b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false');
                });
                document.querySelectorAll('.tab-pane').forEach(p => {
                    p.classList.toggle('active', p.id === 'pane-' + tab);
                });
                if (tab === 'stats') { vscode.postMessage({ type: 'requestStats' }); }
                if (tab === 'preview') { vscode.postMessage({ type: 'requestPreview' }); }
            });
        });

        // ── Section collapsing ──────────────────────────────────────────
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.dataset.section;
                const body = document.querySelector('[data-body="' + section + '"]');
                const expanded = header.getAttribute('aria-expanded') === 'true';
                header.setAttribute('aria-expanded', (!expanded).toString());
                if (body) { body.classList.toggle('collapsed', expanded); }
            });
        });

        // ── Search / filter ─────────────────────────────────────────────
        const searchInput = document.getElementById('search-input');
        searchInput && searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.md-btn').forEach(btn => {
                const id = btn.dataset.id || '';
                const label = btn.querySelector('.btn-label')?.textContent?.toLowerCase() || '';
                const title = (btn.getAttribute('title') || '').toLowerCase();
                const match = !q || id.includes(q) || label.includes(q) || title.includes(q);
                btn.classList.toggle('hidden', !match);
            });
            // Show/hide sections based on visible buttons
            document.querySelectorAll('.toolbar-section').forEach(section => {
                const anyVisible = Array.from(section.querySelectorAll('.md-btn'))
                    .some(b => !b.classList.contains('hidden'));
                section.style.display = anyVisible ? '' : 'none';
                if (q) {
                    // Expand all matching sections
                    const header = section.querySelector('.section-header');
                    const body = section.querySelector('.section-body');
                    if (header && body && anyVisible) {
                        header.setAttribute('aria-expanded', 'true');
                        body.classList.remove('collapsed');
                    }
                }
            });
        });

        // ── Toolbar button clicks ───────────────────────────────────────
        document.getElementById('toolbar-scroll').addEventListener('click', (e) => {
            const btn = e.target.closest('.md-btn');
            if (!btn) return;
            vscode.postMessage({ type: 'command', id: btn.dataset.id });
        });

        // ── Header action buttons ───────────────────────────────────────
        document.getElementById('btn-preview-toggle').addEventListener('click', () => {
            vscode.postMessage({ type: 'command', id: 'showPreview' });
        });
        document.getElementById('btn-format').addEventListener('click', () => {
            vscode.postMessage({ type: 'command', id: 'formatDocument' });
        });
        document.getElementById('btn-wordcount-header').addEventListener('click', () => {
            // Switch to stats tab
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.tab === 'stats');
                b.setAttribute('aria-selected', b.dataset.tab === 'stats' ? 'true' : 'false');
            });
            document.querySelectorAll('.tab-pane').forEach(p => {
                p.classList.toggle('active', p.id === 'pane-stats');
            });
            vscode.postMessage({ type: 'requestStats' });
        });

        // ── Position buttons ────────────────────────────────────────────
        document.querySelectorAll('.pos-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                vscode.postMessage({ type: 'setPosition', position: btn.dataset.pos });
            });
        });

        // ── Messages from extension ─────────────────────────────────────
        window.addEventListener('message', (event) => {
            const msg = event.data;
            switch (msg.type) {
                case 'editorState': {
                    hasMarkdownEditor = !!msg.hasMarkdown;
                    const noEditorEl = document.getElementById('no-editor-msg');
                    const contentEl  = document.getElementById('toolbar-content');
                    if (noEditorEl) noEditorEl.style.display = hasMarkdownEditor ? 'none' : 'flex';
                    if (contentEl)  contentEl.style.display  = hasMarkdownEditor ? 'flex' : 'none';
                    break;
                }
                case 'updatePreview': {
                    const el = document.getElementById('preview-content');
                    if (el) el.innerHTML = msg.html || '<div class="preview-placeholder"><span class="preview-placeholder-icon">✍️</span><span>Start typing in a .md file</span></div>';
                    break;
                }
                case 'updateStats': {
                    const s = msg.stats;
                    setText('stat-words',    s.words   ?? '—');
                    setText('stat-chars',    s.chars   ?? '—');
                    setText('stat-lines',    s.lines   ?? '—');
                    setText('stat-readtime', s.readTime ?? '—');
                    setText('stat-headings', s.headings ?? '—');
                    setText('stat-links-count', (s.links ?? '—') + ' links · ' + (s.images ?? '—') + ' images');

                    // Outline
                    const list = document.getElementById('heading-list');
                    if (list && s.outline && s.outline.length > 0) {
                        list.innerHTML = s.outline.map((h) =>
                            '<li class="heading-level-' + h.level + '" data-line="' + h.line + '" title="' + escHtml(h.text) + '">' +
                            escHtml(h.text) + '</li>'
                        ).join('');
                        list.querySelectorAll('li').forEach(li => {
                            li.addEventListener('click', () => {
                                vscode.postMessage({ type: 'goToLine', line: parseInt(li.dataset.line || '0') });
                            });
                        });
                    } else if (list) {
                        list.innerHTML = '<li style="opacity:0.5;font-style:italic">No headings found</li>';
                    }
                    break;
                }
            }
        });

        function setText(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = String(val);
        }
        function escHtml(s) {
            return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }

        // Request initial state
        vscode.postMessage({ type: 'ready' });
    })();
    </script>
</body>
</html>`;
}
