import * as vscode from 'vscode';
import { marked } from 'marked';
import { getElementById, MARKDOWN_ELEMENTS } from './markdownElements';
import { getToolbarHtml } from './toolbarHtml';

/**
 * Shared logic for applying a markdown element to the active editor.
 */
export async function applyMarkdownElement(id: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'markdown') {
        vscode.window.showInformationMessage('Open a Markdown (.md) file to use this command.');
        return;
    }

    const element = getElementById(id);
    if (!element) { return; }

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
                } else {
                    editBuilder.insert(insertPos, element.insertText);
                }
            } else {
                const selectedText = editor.document.getText(selection);
                const lines = selectedText.split('\n');

                if (element.isBlock && element.wrapBefore !== undefined) {
                    // For block elements, prepend each line
                    if (element.wrapBefore && !element.wrapAfter) {
                        const wrapped = lines.map(l => element.wrapBefore + l).join('\n');
                        editBuilder.replace(selection, wrapped);
                    } else {
                        const wrapped = (element.wrapBefore || '') + selectedText + (element.wrapAfter || '');
                        editBuilder.replace(selection, wrapped);
                    }
                } else if (element.wrapBefore !== undefined) {
                    const wrapped = element.wrapBefore + selectedText + (element.wrapAfter || '');
                    editBuilder.replace(selection, wrapped);
                } else {
                    editBuilder.insert(selection.start, element.insertText);
                }
            }
        }
    });
}

interface DocStats {
    words: number;
    chars: number;
    lines: number;
    readTime: number;
    headings: number;
    links: number;
    images: number;
    outline: Array<{ level: number; text: string; line: number }>;
}

export function computeStats(document: vscode.TextDocument): DocStats {
    const text = document.getText();
    const lines = document.lineCount;

    // Words: split by whitespace, filter empty
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // avg 200 WPM

    // Headings
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const outline: Array<{ level: number; text: string; line: number }> = [];
    let headingCount = 0;
    let m: RegExpExecArray | null;
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
    while (linkRegex.exec(text) !== null) { linkCount++; }
    while (imageRegex.exec(text) !== null) { imageCount++; }
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

export function renderMarkdownToHtml(markdown: string): string {
    try {
        marked.setOptions({ breaks: true, gfm: true });
        return marked.parse(markdown) as string;
    } catch {
        return '<p><em>Preview unavailable</em></p>';
    }
}

/**
 * WebviewViewProvider that powers both the sidebar and panel toolbar views.
 */
export class MarkdownToolbarViewProvider implements vscode.WebviewViewProvider {
    public static readonly sidebarViewId = 'markdownManager.toolbar';
    public static readonly panelViewId   = 'markdownManager.panelToolbar';

    private _view?: vscode.WebviewView;
    private _disposables: vscode.Disposable[] = [];

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = getToolbarHtml(webviewView.webview, this._extensionUri);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(
            msg => this._handleMessage(msg),
            undefined,
            this._disposables
        );

        // Listen to editor changes
        this._disposables.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                this._notifyEditorState(editor);
                if (editor && editor.document.languageId === 'markdown') {
                    this._sendPreview(editor.document);
                    this._sendStats(editor.document);
                }
            }),
            vscode.workspace.onDidChangeTextDocument(event => {
                const editor = vscode.window.activeTextEditor;
                if (editor && event.document === editor.document && editor.document.languageId === 'markdown') {
                    this._sendPreview(editor.document);
                    this._sendStats(editor.document);
                }
            })
        );

        // Notify current state
        this._notifyEditorState(vscode.window.activeTextEditor);
    }

    private _notifyEditorState(editor: vscode.TextEditor | undefined): void {
        if (!this._view) { return; }
        const hasMarkdown = !!(editor && editor.document.languageId === 'markdown');
        this._view.webview.postMessage({ type: 'editorState', hasMarkdown });
    }

    private _sendPreview(document: vscode.TextDocument): void {
        if (!this._view) { return; }
        const html = renderMarkdownToHtml(document.getText());
        this._view.webview.postMessage({ type: 'updatePreview', html });
    }

    private _sendStats(document: vscode.TextDocument): void {
        if (!this._view) { return; }
        const stats = computeStats(document);
        this._view.webview.postMessage({ type: 'updateStats', stats });
    }

    private _handleMessage(msg: { type: string; id?: string; position?: string; line?: number }): void {
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
                } else if (id === 'formatDocument') {
                    vscode.commands.executeCommand('markdownManager.formatDocument');
                } else if (id === 'wordCount') {
                    vscode.commands.executeCommand('markdownManager.wordCount');
                } else {
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
                } else if (pos === 'panel') {
                    vscode.commands.executeCommand('workbench.panel.markdownManagerPanel.view.focus');
                } else if (pos === 'editor') {
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
    public refresh(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this._view) { return; }
        if (editor.document.languageId === 'markdown') {
            this._sendPreview(editor.document);
            this._sendStats(editor.document);
        }
    }

    dispose(): void {
        this._disposables.forEach(d => d.dispose());
        this._disposables = [];
    }
}
