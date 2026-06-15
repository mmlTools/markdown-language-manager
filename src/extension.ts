import * as vscode from 'vscode';
import { MARKDOWN_ELEMENTS } from './markdownElements';
import { MarkdownToolbarViewProvider, applyMarkdownElement, computeStats } from './MarkdownToolbarViewProvider';
import { MarkdownPreviewPanel } from './MarkdownPreviewPanel';
import { MarkdownCompletionProvider } from './MarkdownCompletionProvider';
import { MarkdownHoverProvider } from './MarkdownHoverProvider';

export function activate(context: vscode.ExtensionContext): void {

    // ── Register Toolbar WebviewView Providers ─────────────────────────────────
    const sidebarProvider = new MarkdownToolbarViewProvider(context.extensionUri);
    const panelProvider   = new MarkdownToolbarViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            MarkdownToolbarViewProvider.sidebarViewId,
            sidebarProvider,
            { webviewOptions: { retainContextWhenHidden: true } }
        ),
        vscode.window.registerWebviewViewProvider(
            MarkdownToolbarViewProvider.panelViewId,
            panelProvider,
            { webviewOptions: { retainContextWhenHidden: true } }
        )
    );

    // ── Register Code Completion Provider ─────────────────────────────────────
    const config = vscode.workspace.getConfiguration('markdownManager');

    if (config.get<boolean>('enableCompletion', true)) {
        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                { language: 'markdown', scheme: '*' },
                new MarkdownCompletionProvider(),
                '#', '*', '_', '`', '[', '!', '>', '-', '|', '^', '~', '$', 'm'
            )
        );
    }

    // ── Register Hover Provider ────────────────────────────────────────────────
    if (config.get<boolean>('enableHover', true)) {
        context.subscriptions.push(
            vscode.languages.registerHoverProvider(
                { language: 'markdown', scheme: '*' },
                new MarkdownHoverProvider()
            )
        );
    }

    // ── Register per-element commands ─────────────────────────────────────────
    for (const element of MARKDOWN_ELEMENTS) {
        context.subscriptions.push(
            vscode.commands.registerCommand(`markdownManager.${element.id}`, async () => {
                await applyMarkdownElement(element.id);
            })
        );
    }

    // ── Register utility commands ──────────────────────────────────────────────

    // Show / focus toolbar in sidebar
    context.subscriptions.push(
        vscode.commands.registerCommand('markdownManager.showToolbar', async () => {
            await vscode.commands.executeCommand(
                'workbench.view.extension.markdownManagerContainer'
            );
        })
    );

    // Show live preview panel (beside editor)
    context.subscriptions.push(
        vscode.commands.registerCommand('markdownManager.showPreview', () => {
            MarkdownPreviewPanel.createOrShow(context.extensionUri);
        })
    );

    // Move toolbar to editor panel (right side)
    context.subscriptions.push(
        vscode.commands.registerCommand('markdownManager.toolbar.moveToEditor', async () => {
            await vscode.commands.executeCommand(
                'workbench.action.focusSecondEditorGroup'
            );
            // Fall through to show the preview panel as a companion
            MarkdownPreviewPanel.createOrShow(context.extensionUri);
        })
    );

    // Word count command
    context.subscriptions.push(
        vscode.commands.registerCommand('markdownManager.wordCount', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'markdown') {
                vscode.window.showInformationMessage('Open a Markdown file to see word count.');
                return;
            }
            const stats = computeStats(editor.document);
            vscode.window.showInformationMessage(
                `📊 ${stats.words} words · ${stats.chars} chars · ${stats.lines} lines · ` +
                `~${stats.readTime} min read · ${stats.headings} headings · ` +
                `${stats.links} links · ${stats.images} images`
            );
        })
    );

    // Format document command (normalise markdown)
    context.subscriptions.push(
        vscode.commands.registerCommand('markdownManager.formatDocument', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'markdown') {
                vscode.window.showInformationMessage('Open a Markdown file to format it.');
                return;
            }
            // Delegate to VS Code's built-in formatter if available, otherwise no-op
            await vscode.commands.executeCommand('editor.action.formatDocument');
        })
    );

    // ── Auto-show toolbar when a .md file is activated ─────────────────────────
    const autoShow = vscode.workspace.getConfiguration('markdownManager').get<boolean>('autoShowToolbar', true);

    async function onActiveEditorChange(editor: vscode.TextEditor | undefined): Promise<void> {
        if (!editor) { return; }
        if (editor.document.languageId === 'markdown') {
            if (autoShow) {
                // Reveal the sidebar container (non-disruptive: only if already visible area)
                try {
                    await vscode.commands.executeCommand(
                        `${MarkdownToolbarViewProvider.sidebarViewId}.focus`
                    );
                } catch {
                    // View may not be loaded yet — ignore
                }
            }
            // Auto-open preview if configured
            const autoPreview = vscode.workspace.getConfiguration('markdownManager').get<boolean>('autoPreview', false);
            if (autoPreview && !MarkdownPreviewPanel.currentPanel) {
                MarkdownPreviewPanel.createOrShow(context.extensionUri);
            }
        }
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(onActiveEditorChange)
    );

    // Handle active editor at extension activation time
    onActiveEditorChange(vscode.window.activeTextEditor);

    // ── Status bar item ────────────────────────────────────────────────────────
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'markdownManager.wordCount';
    statusBarItem.tooltip = 'Markdown Manager: click for document stats';
    context.subscriptions.push(statusBarItem);

    function updateStatusBar(editor: vscode.TextEditor | undefined): void {
        if (editor && editor.document.languageId === 'markdown') {
            const stats = computeStats(editor.document);
            statusBarItem.text = `$(book) ${stats.words}w · ${stats.readTime}m`;
            statusBarItem.show();
        } else {
            statusBarItem.hide();
        }
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateStatusBar),
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                updateStatusBar(editor);
            }
        })
    );

    updateStatusBar(vscode.window.activeTextEditor);
}

export function deactivate(): void {
    // Cleanup is handled via context.subscriptions
}
