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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const markdownElements_1 = require("./markdownElements");
const MarkdownToolbarViewProvider_1 = require("./MarkdownToolbarViewProvider");
const MarkdownPreviewPanel_1 = require("./MarkdownPreviewPanel");
const MarkdownCompletionProvider_1 = require("./MarkdownCompletionProvider");
const MarkdownHoverProvider_1 = require("./MarkdownHoverProvider");
function activate(context) {
    // ── Register Toolbar WebviewView Providers ─────────────────────────────────
    const sidebarProvider = new MarkdownToolbarViewProvider_1.MarkdownToolbarViewProvider(context.extensionUri);
    const panelProvider = new MarkdownToolbarViewProvider_1.MarkdownToolbarViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(MarkdownToolbarViewProvider_1.MarkdownToolbarViewProvider.sidebarViewId, sidebarProvider, { webviewOptions: { retainContextWhenHidden: true } }), vscode.window.registerWebviewViewProvider(MarkdownToolbarViewProvider_1.MarkdownToolbarViewProvider.panelViewId, panelProvider, { webviewOptions: { retainContextWhenHidden: true } }));
    // ── Register Code Completion Provider ─────────────────────────────────────
    const config = vscode.workspace.getConfiguration('markdownManager');
    if (config.get('enableCompletion', true)) {
        context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: 'markdown', scheme: '*' }, new MarkdownCompletionProvider_1.MarkdownCompletionProvider(), '#', '*', '_', '`', '[', '!', '>', '-', '|', '^', '~', '$', 'm'));
    }
    // ── Register Hover Provider ────────────────────────────────────────────────
    if (config.get('enableHover', true)) {
        context.subscriptions.push(vscode.languages.registerHoverProvider({ language: 'markdown', scheme: '*' }, new MarkdownHoverProvider_1.MarkdownHoverProvider()));
    }
    // ── Register per-element commands ─────────────────────────────────────────
    for (const element of markdownElements_1.MARKDOWN_ELEMENTS) {
        context.subscriptions.push(vscode.commands.registerCommand(`markdownManager.${element.id}`, async () => {
            await (0, MarkdownToolbarViewProvider_1.applyMarkdownElement)(element.id);
        }));
    }
    // ── Register utility commands ──────────────────────────────────────────────
    // Show / focus toolbar in sidebar
    context.subscriptions.push(vscode.commands.registerCommand('markdownManager.showToolbar', async () => {
        await vscode.commands.executeCommand('workbench.view.extension.markdownManagerContainer');
    }));
    // Show live preview panel (beside editor)
    context.subscriptions.push(vscode.commands.registerCommand('markdownManager.showPreview', () => {
        MarkdownPreviewPanel_1.MarkdownPreviewPanel.createOrShow(context.extensionUri);
    }));
    // Move toolbar to editor panel (right side)
    context.subscriptions.push(vscode.commands.registerCommand('markdownManager.toolbar.moveToEditor', async () => {
        await vscode.commands.executeCommand('workbench.action.focusSecondEditorGroup');
        // Fall through to show the preview panel as a companion
        MarkdownPreviewPanel_1.MarkdownPreviewPanel.createOrShow(context.extensionUri);
    }));
    // Word count command
    context.subscriptions.push(vscode.commands.registerCommand('markdownManager.wordCount', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'markdown') {
            vscode.window.showInformationMessage('Open a Markdown file to see word count.');
            return;
        }
        const stats = (0, MarkdownToolbarViewProvider_1.computeStats)(editor.document);
        vscode.window.showInformationMessage(`📊 ${stats.words} words · ${stats.chars} chars · ${stats.lines} lines · ` +
            `~${stats.readTime} min read · ${stats.headings} headings · ` +
            `${stats.links} links · ${stats.images} images`);
    }));
    // Format document command (normalise markdown)
    context.subscriptions.push(vscode.commands.registerCommand('markdownManager.formatDocument', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'markdown') {
            vscode.window.showInformationMessage('Open a Markdown file to format it.');
            return;
        }
        // Delegate to VS Code's built-in formatter if available, otherwise no-op
        await vscode.commands.executeCommand('editor.action.formatDocument');
    }));
    // ── Auto-show toolbar when a .md file is activated ─────────────────────────
    const autoShow = vscode.workspace.getConfiguration('markdownManager').get('autoShowToolbar', true);
    async function onActiveEditorChange(editor) {
        if (!editor) {
            return;
        }
        if (editor.document.languageId === 'markdown') {
            if (autoShow) {
                // Reveal the sidebar container (non-disruptive: only if already visible area)
                try {
                    await vscode.commands.executeCommand(`${MarkdownToolbarViewProvider_1.MarkdownToolbarViewProvider.sidebarViewId}.focus`);
                }
                catch {
                    // View may not be loaded yet — ignore
                }
            }
            // Auto-open preview if configured
            const autoPreview = vscode.workspace.getConfiguration('markdownManager').get('autoPreview', false);
            if (autoPreview && !MarkdownPreviewPanel_1.MarkdownPreviewPanel.currentPanel) {
                MarkdownPreviewPanel_1.MarkdownPreviewPanel.createOrShow(context.extensionUri);
            }
        }
    }
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(onActiveEditorChange));
    // Handle active editor at extension activation time
    onActiveEditorChange(vscode.window.activeTextEditor);
    // ── Status bar item ────────────────────────────────────────────────────────
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'markdownManager.wordCount';
    statusBarItem.tooltip = 'Markdown Manager: click for document stats';
    context.subscriptions.push(statusBarItem);
    function updateStatusBar(editor) {
        if (editor && editor.document.languageId === 'markdown') {
            const stats = (0, MarkdownToolbarViewProvider_1.computeStats)(editor.document);
            statusBarItem.text = `$(book) ${stats.words}w · ${stats.readTime}m`;
            statusBarItem.show();
        }
        else {
            statusBarItem.hide();
        }
    }
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBar), vscode.workspace.onDidChangeTextDocument(event => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            updateStatusBar(editor);
        }
    }));
    updateStatusBar(vscode.window.activeTextEditor);
}
function deactivate() {
    // Cleanup is handled via context.subscriptions
}
//# sourceMappingURL=extension.js.map