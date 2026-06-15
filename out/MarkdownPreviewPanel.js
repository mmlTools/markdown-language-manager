"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownPreviewPanel = void 0;
const vscode = __importStar(require("vscode"));
const MarkdownToolbarViewProvider_1 = require("./MarkdownToolbarViewProvider");
function getNonce() {
    let text = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}
function getPreviewHtml(webview, content, title) {
    const nonce = getNonce();
    const csp = [
        `default-src 'none'`,
        `style-src ${webview.cspSource} 'unsafe-inline'`,
        `script-src 'nonce-${nonce}'`,
        `img-src ${webview.cspSource} https: data:`,
    ].join('; ');
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} — Preview</title>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            font-size: 15px;
            line-height: 1.7;
            color: var(--vscode-editor-foreground, #24292f);
            background: var(--vscode-editor-background, #ffffff);
            padding: 32px 48px 64px;
            max-width: 860px;
            margin: 0 auto;
        }
        @media (max-width: 720px) { body { padding: 20px 24px 48px; } }

        /* ── Headings ────────────────────────────────────── */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 600;
            line-height: 1.3;
            margin-top: 1.4em;
            margin-bottom: 0.5em;
            color: var(--vscode-editor-foreground, #1f2328);
        }
        h1 { font-size: 2em;   border-bottom: 1px solid var(--vscode-panel-border, #d8dee4); padding-bottom: 0.25em; }
        h2 { font-size: 1.5em; border-bottom: 1px solid var(--vscode-panel-border, #d8dee4); padding-bottom: 0.2em; }
        h3 { font-size: 1.25em; }
        h4 { font-size: 1.05em; }
        h5 { font-size: 0.95em; opacity: 0.9; }
        h6 { font-size: 0.875em; opacity: 0.75; }

        /* ── Paragraphs & Inline ─────────────────────────── */
        p { margin: 0.7em 0; }
        strong { font-weight: 600; }
        em { font-style: italic; }
        del { text-decoration: line-through; opacity: 0.7; }
        mark { background: #fff3cd; padding: 0 2px; border-radius: 2px; }
        a { color: var(--vscode-textLink-foreground, #0969da); text-decoration: none; }
        a:hover { text-decoration: underline; }
        u { text-decoration: underline; }
        sup { font-size: 0.75em; vertical-align: super; }
        sub { font-size: 0.75em; vertical-align: sub; }

        /* ── Code ────────────────────────────────────────── */
        code {
            font-family: var(--vscode-editor-font-family, "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace);
            font-size: 0.875em;
            background: var(--vscode-textCodeBlock-background, rgba(175,184,193,0.2));
            padding: 0.2em 0.4em;
            border-radius: 4px;
        }
        pre {
            background: var(--vscode-textCodeBlock-background, #f6f8fa);
            border: 1px solid var(--vscode-panel-border, #d8dee4);
            border-radius: 6px;
            padding: 14px 16px;
            overflow-x: auto;
            margin: 1em 0;
            line-height: 1.45;
        }
        pre code {
            background: none;
            padding: 0;
            font-size: 0.9em;
            border-radius: 0;
        }

        /* ── Blockquote ──────────────────────────────────── */
        blockquote {
            border-left: 4px solid var(--vscode-textBlockQuote-border, #d0d7de);
            background: var(--vscode-textBlockQuote-background, rgba(175,184,193,0.1));
            margin: 1em 0;
            padding: 10px 16px;
            border-radius: 0 6px 6px 0;
            color: inherit;
            opacity: 0.9;
        }
        blockquote p { margin: 0.25em 0; }

        /* ── GFM Alerts ──────────────────────────────────── */
        .markdown-alert { border-left: 4px solid; padding: 10px 16px; border-radius: 0 6px 6px 0; margin: 1em 0; }
        .markdown-alert-note     { border-color: #0969da; background: rgba(9,105,218,0.08); }
        .markdown-alert-tip      { border-color: #1a7f37; background: rgba(26,127,55,0.08); }
        .markdown-alert-warning  { border-color: #9a6700; background: rgba(154,103,0,0.08); }
        .markdown-alert-important{ border-color: #8250df; background: rgba(130,80,223,0.08); }
        .markdown-alert-caution  { border-color: #cf222e; background: rgba(207,34,46,0.08); }

        /* ── Lists ───────────────────────────────────────── */
        ul, ol { padding-left: 1.75em; margin: 0.5em 0; }
        li { margin: 0.2em 0; }
        li input[type="checkbox"] { margin-right: 6px; }
        ul ul, ol ol, ul ol, ol ul { margin: 0.1em 0; }

        /* ── Tables ──────────────────────────────────────── */
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            font-size: 0.93em;
            overflow-x: auto;
            display: block;
        }
        th, td {
            border: 1px solid var(--vscode-panel-border, #d8dee4);
            padding: 7px 13px;
            text-align: left;
        }
        th { background: rgba(175,184,193,0.15); font-weight: 600; }
        tr:nth-child(even) { background: rgba(175,184,193,0.06); }

        /* ── Images ──────────────────────────────────────── */
        img { max-width: 100%; height: auto; border-radius: 5px; }

        /* ── HR ──────────────────────────────────────────── */
        hr { border: none; border-top: 1px solid var(--vscode-panel-border, #d8dee4); margin: 1.5em 0; }

        /* ── Header Bar ──────────────────────────────────── */
        .preview-header {
            position: sticky;
            top: 0;
            background: var(--vscode-editor-background, #fff);
            border-bottom: 1px solid var(--vscode-panel-border, #d8dee4);
            padding: 8px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            opacity: 0.8;
            z-index: 100;
            margin: -32px -48px 24px;
        }
        .preview-title { font-weight: 600; }
        .preview-actions button {
            background: none; border: none; cursor: pointer;
            color: inherit; opacity: 0.7; padding: 3px 6px;
            border-radius: 3px; font-size: 13px;
        }
        .preview-actions button:hover { opacity: 1; background: rgba(128,128,128,0.15); }

        /* ── Scroll ──────────────────────────────────────── */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.5); }

        /* ── Footer ──────────────────────────────────────── */
        .preview-footer {
            margin-top: 48px;
            padding-top: 16px;
            border-top: 1px solid var(--vscode-panel-border, #d8dee4);
            font-size: 11px;
            opacity: 0.45;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="preview-header">
        <span class="preview-title">📄 ${title}</span>
        <span class="preview-actions">
            <button onclick="window.scrollTo(0,0)" title="Scroll to top">⬆</button>
        </span>
    </div>
    <div id="content">${content}</div>
    <div class="preview-footer">Rendered by Markdown Language Manager</div>
    <script nonce="${nonce}">
    (function() {
        const vscode = acquireVsCodeApi();
        // Process GFM alerts after render
        document.querySelectorAll('blockquote').forEach(bq => {
            const firstP = bq.querySelector('p');
            if (!firstP) return;
            const txt = firstP.textContent || '';
            const match = txt.match(/^\\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\\]/i);
            if (match) {
                const type = match[1].toLowerCase();
                bq.classList.add('markdown-alert', 'markdown-alert-' + type);
                firstP.textContent = firstP.textContent.replace(/^\\[!\\w+\\]\\s*/, '');
            }
        });
        // Update content
        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.type === 'updateContent') {
                document.getElementById('content').innerHTML = msg.html;
                const titleEl = document.querySelector('.preview-title');
                if (titleEl) titleEl.textContent = '📄 ' + (msg.title || 'Preview');
            }
        });
        vscode.postMessage({ type: 'previewReady' });
    })();
    </script>
</body>
</html>`;
}
/**
 * Standalone live preview panel that tracks the active markdown editor.
 */
class MarkdownPreviewPanel {
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (MarkdownPreviewPanel.currentPanel) {
            MarkdownPreviewPanel.currentPanel._panel.reveal(column === vscode.ViewColumn.One ? vscode.ViewColumn.Two : vscode.ViewColumn.Beside);
            MarkdownPreviewPanel.currentPanel._update();
            return;
        }
        const panel = vscode.window.createWebviewPanel(MarkdownPreviewPanel._viewType, 'Markdown Preview', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [extensionUri],
            retainContextWhenHidden: true,
        });
        MarkdownPreviewPanel.currentPanel = new MarkdownPreviewPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Refresh on editor/document changes
        this._disposables.push(vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'markdown') {
                this._panel.title = `Preview: ${editor.document.fileName.split(/[\\/]/).pop()}`;
                this._update();
            }
        }), vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document &&
                editor.document.languageId === 'markdown') {
                this._updateContent();
            }
        }));
        // Handle messages from webview
        this._panel.webview.onDidReceiveMessage((msg) => {
            if (msg.type === 'previewReady') {
                this._updateContent();
            }
        }, null, this._disposables);
    }
    _update() {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        const title = document?.fileName.split(/[\\/]/).pop() ?? 'Preview';
        let html = '';
        if (document && document.languageId === 'markdown') {
            html = (0, MarkdownToolbarViewProvider_1.renderMarkdownToHtml)(document.getText());
        }
        else {
            html = '<p style="opacity:0.5;text-align:center;margin-top:3em;">Open a <strong>.md</strong> file to see the live preview.</p>';
        }
        this._panel.webview.html = getPreviewHtml(this._panel.webview, html, title);
    }
    _updateContent() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'markdown') {
            return;
        }
        const html = (0, MarkdownToolbarViewProvider_1.renderMarkdownToHtml)(editor.document.getText());
        const title = editor.document.fileName.split(/[\\/]/).pop() ?? 'Preview';
        this._panel.webview.postMessage({ type: 'updateContent', html, title });
    }
    dispose() {
        MarkdownPreviewPanel.currentPanel = undefined;
        this._panel.dispose();
        this._disposables.forEach(d => d.dispose());
    }
}
exports.MarkdownPreviewPanel = MarkdownPreviewPanel;
MarkdownPreviewPanel._viewType = 'markdownManager.preview';
//# sourceMappingURL=MarkdownPreviewPanel.js.map