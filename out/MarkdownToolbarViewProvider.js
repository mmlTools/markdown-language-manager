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
exports.MarkdownToolbarViewProvider = void 0;
exports.applyMarkdownElement = applyMarkdownElement;
exports.computeStats = computeStats;
exports.renderMarkdownToHtml = renderMarkdownToHtml;
const vscode = __importStar(require("vscode"));
const marked_1 = require("marked");
const markdownElements_1 = require("./markdownElements");
const toolbarHtml_1 = require("./toolbarHtml");
/**
 * Shared logic for applying a markdown element to the active editor.
 */
async function applyMarkdownElement(id) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'markdown') {
        vscode.window.showInformationMessage('Open a Markdown (.md) file to use this command.');
        return;
    }
    const element = (0, markdownElements_1.getElementById)(id);
    if (!element) {
        return;
    }
    await editor.edit(editBuilder => {
        for (const selection of editor.selections) {
            if (selection.isEmpty) {
                // No selection — insert template at cursor
                const insertPos = selection.active;
                const lineStart = new vscode.Position(insertPos.line, 0);
                const lineText = editor.document.lineAt(insertPos.line).text;
                const isEmptyLine = lineText.trim() === '';
                if (element.isBlock && !isEmptyLine) {
                    editBuilder.insert(insertPos, '\n' + element.insertText + '\n');
                }
                else {
                    editBuilder.insert(insertPos, element.insertText);
                }
            }
            else {
                const selectedText = editor.document.getText(selection);
                const lines = selectedText.split('\n');
                if (element.isBlock && element.wrapBefore !== undefined) {
                    // For block elements, prepend each line
                    if (element.wrapBefore && !element.wrapAfter) {
                        const wrapped = lines.map(l => element.wrapBefore + l).join('\n');
                        editBuilder.replace(selection, wrapped);
                    }
                    else {
                        const wrapped = (element.wrapBefore || '') + selectedText + (element.wrapAfter || '');
                        editBuilder.replace(selection, wrapped);
                    }
                }
                else if (element.wrapBefore !== undefined) {
                    const wrapped = element.wrapBefore + selectedText + (element.wrapAfter || '');
                    editBuilder.replace(selection, wrapped);
                }
                else {
                    editBuilder.insert(selection.start, element.insertText);
                }
            }
        }
    });
}
function computeStats(document) {
    const text = document.getText();
    const lines = document.lineCount;
    // Words: split by whitespace, filter empty
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // avg 200 WPM
    // Headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const outline = [];
    let headingCount = 0;
    let m;
    const docLines = text.split('\n');
    while ((m = headingRegex.exec(text)) !== null) {
        headingCount++;
        const level = m[1].length;
        const headingText = m[2].replace(/[*_`~]/g, '').trim();
        // Find line number
        const beforeMatch = text.substring(0, m.index);
        const lineNum = beforeMatch.split('\n').length - 1;
        outline.push({ level, text: headingText, line: lineNum });
    }
    // Links & images
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let linkCount = 0;
    let imageCount = 0;
    while (linkRegex.exec(text) !== null) {
        linkCount++;
    }
    while (imageRegex.exec(text) !== null) {
        imageCount++;
    }
    // Images are a subset of links pattern, adjust
    linkCount = Math.max(0, linkCount - imageCount);
    return {
        words, chars, lines,
        readTime,
        headings: headingCount,
        links: linkCount,
        images: imageCount,
        outline
    };
}
function renderMarkdownToHtml(markdown) {
    try {
        marked_1.marked.setOptions({ breaks: true, gfm: true });
        return marked_1.marked.parse(markdown);
    }
    catch {
        return '<p><em>Preview unavailable</em></p>';
    }
}
/**
 * WebviewViewProvider that powers both the sidebar and panel toolbar views.
 */
class MarkdownToolbarViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this._disposables = [];
    }
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = (0, toolbarHtml_1.getToolbarHtml)(webviewView.webview, this._extensionUri);
        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(msg => this._handleMessage(msg), undefined, this._disposables);
        // Listen to editor changes
        this._disposables.push(vscode.window.onDidChangeActiveTextEditor(editor => {
            this._notifyEditorState(editor);
            if (editor && editor.document.languageId === 'markdown') {
                this._sendPreview(editor.document);
                this._sendStats(editor.document);
            }
        }), vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document && editor.document.languageId === 'markdown') {
                this._sendPreview(editor.document);
                this._sendStats(editor.document);
            }
        }));
        // Notify current state
        this._notifyEditorState(vscode.window.activeTextEditor);
    }
    _notifyEditorState(editor) {
        if (!this._view) {
            return;
        }
        const hasMarkdown = !!(editor && editor.document.languageId === 'markdown');
        this._view.webview.postMessage({ type: 'editorState', hasMarkdown });
    }
    _sendPreview(document) {
        if (!this._view) {
            return;
        }
        const html = renderMarkdownToHtml(document.getText());
        this._view.webview.postMessage({ type: 'updatePreview', html });
    }
    _sendStats(document) {
        if (!this._view) {
            return;
        }
        const stats = computeStats(document);
        this._view.webview.postMessage({ type: 'updateStats', stats });
    }
    _handleMessage(msg) {
        switch (msg.type) {
            case 'ready': {
                const editor = vscode.window.activeTextEditor;
                this._notifyEditorState(editor);
                if (editor && editor.document.languageId === 'markdown') {
                    this._sendPreview(editor.document);
                    this._sendStats(editor.document);
                }
                break;
            }
            case 'command': {
                const id = msg.id ?? '';
                if (id === 'showPreview') {
                    vscode.commands.executeCommand('markdownManager.showPreview');
                }
                else if (id === 'formatDocument') {
                    vscode.commands.executeCommand('markdownManager.formatDocument');
                }
                else if (id === 'wordCount') {
                    vscode.commands.executeCommand('markdownManager.wordCount');
                }
                else {
                    vscode.commands.executeCommand(`markdownManager.${id}`);
                }
                break;
            }
            case 'requestPreview': {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document.languageId === 'markdown') {
                    this._sendPreview(editor.document);
                }
                break;
            }
            case 'requestStats': {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document.languageId === 'markdown') {
                    this._sendStats(editor.document);
                }
                break;
            }
            case 'setPosition': {
                const pos = msg.position;
                if (pos === 'sidebar') {
                    vscode.commands.executeCommand('workbench.view.extension.markdownManagerContainer');
                }
                else if (pos === 'panel') {
                    vscode.commands.executeCommand('workbench.panel.markdownManagerPanel.view.focus');
                }
                else if (pos === 'editor') {
                    vscode.commands.executeCommand('markdownManager.toolbar.moveToEditor');
                }
                break;
            }
            case 'goToLine': {
                const editor = vscode.window.activeTextEditor;
                if (editor && msg.line !== undefined) {
                    const position = new vscode.Position(msg.line, 0);
                    editor.selection = new vscode.Selection(position, position);
                    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                    vscode.window.showTextDocument(editor.document, { viewColumn: editor.viewColumn });
                }
                break;
            }
        }
    }
    /** Push updated preview/stats to the view (called externally). */
    refresh() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this._view) {
            return;
        }
        if (editor.document.languageId === 'markdown') {
            this._sendPreview(editor.document);
            this._sendStats(editor.document);
        }
    }
    dispose() {
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];
    }
}
exports.MarkdownToolbarViewProvider = MarkdownToolbarViewProvider;
MarkdownToolbarViewProvider.sidebarViewId = 'markdownManager.toolbar';
MarkdownToolbarViewProvider.panelViewId = 'markdownManager.panelToolbar';
//# sourceMappingURL=MarkdownToolbarViewProvider.js.map