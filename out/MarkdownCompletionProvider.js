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
exports.MarkdownCompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
const markdownElements_1 = require("./markdownElements");
class MarkdownCompletionProvider {
    provideCompletionItems(document, position) {
        const lineText = document.lineAt(position.line).text;
        const textBefore = lineText.substring(0, position.character);
        const items = [];
        // Heading completions: triggered after '#' at start of line
        if (/^#{1,6}\s*$/.test(textBefore)) {
            for (let level = 1; level <= 6; level++) {
                const prefix = '#'.repeat(level);
                if (textBefore.startsWith(prefix)) {
                    const item = this.makeItem(`${prefix} Heading ${level}`, `${prefix} `, vscode.CompletionItemKind.Snippet, `Heading level ${level}`);
                    item.insertText = new vscode.SnippetString(`${prefix} \${1:Heading ${level}}`);
                    item.range = new vscode.Range(position.line, 0, position.line, position.character);
                    items.push(item);
                }
            }
        }
        // Formatting completions
        if (textBefore.endsWith('**')) {
            items.push(this.makeSnippetItem('**bold**', '${1:bold text}**', 'Bold text', vscode.CompletionItemKind.Snippet));
        }
        if (textBefore.endsWith('*') && !textBefore.endsWith('**')) {
            items.push(this.makeSnippetItem('*italic*', '${1:italic text}*', 'Italic text', vscode.CompletionItemKind.Snippet));
        }
        if (textBefore.endsWith('~~')) {
            items.push(this.makeSnippetItem('~~strikethrough~~', '${1:text}~~', 'Strikethrough', vscode.CompletionItemKind.Snippet));
        }
        if (textBefore.endsWith('`')) {
            items.push(this.makeSnippetItem('`code`', '${1:code}`', 'Inline code', vscode.CompletionItemKind.Snippet));
            items.push(this.makeCodeBlockItem());
        }
        if (textBefore.endsWith('```')) {
            items.push(this.makeCodeBlockItem());
        }
        // Link / image
        if (textBefore.endsWith('[')) {
            const linkItem = this.makeSnippetItem('[text](url)', '${1:link text}](${2:https://example.com})', 'Markdown link', vscode.CompletionItemKind.Snippet);
            items.push(linkItem);
        }
        if (textBefore.endsWith('![')) {
            const imgItem = this.makeSnippetItem('![alt](url)', '${1:alt text}](${2:https://example.com/image.png})', 'Markdown image', vscode.CompletionItemKind.Snippet);
            items.push(imgItem);
        }
        // Blockquote
        if (/^>\s?$/.test(textBefore)) {
            const bqItem = this.makeSnippetItem('> blockquote', '${1:Quote text}', 'Blockquote', vscode.CompletionItemKind.Snippet);
            bqItem.range = new vscode.Range(position.line, 0, position.line, position.character);
            items.push(bqItem);
            // GFM callouts
            for (const type of ['NOTE', 'TIP', 'WARNING', 'IMPORTANT', 'CAUTION']) {
                const callout = new vscode.CompletionItem(`> [!${type}]`, vscode.CompletionItemKind.Snippet);
                callout.insertText = new vscode.SnippetString(`[!${type}]\n> \${1:${type.charAt(0) + type.slice(1).toLowerCase()} content here.}`);
                callout.detail = `GFM ${type.charAt(0) + type.slice(1).toLowerCase()} callout`;
                callout.range = new vscode.Range(position.line, 0, position.line, position.character);
                items.push(callout);
            }
        }
        // List continuations
        if (/^-\s$/.test(textBefore)) {
            items.push(this.makeSnippetItem('- [ ] task', '[ ] ${1:Task description}', 'Task list item', vscode.CompletionItemKind.Snippet));
        }
        // Table
        if (textBefore.trim() === '|') {
            items.push(this.makeTableItem(2));
            items.push(this.makeTableItem(3));
            items.push(this.makeTableItem(4));
        }
        // All elements as general completions (triggered with 'md:' prefix)
        if (textBefore.endsWith('md:')) {
            for (const el of markdownElements_1.MARKDOWN_ELEMENTS) {
                const item = new vscode.CompletionItem(`md:${el.id}`, vscode.CompletionItemKind.Snippet);
                item.label = `md:${el.id}`;
                item.detail = el.description;
                item.documentation = new vscode.MarkdownString(`**${el.label}** (${el.group})\n\n\`\`\`\n${el.insertText}\n\`\`\``);
                item.insertText = new vscode.SnippetString(this.toSnippet(el));
                item.filterText = `md:${el.id} ${el.label} ${el.group}`;
                // Replace the 'md:' trigger
                item.additionalTextEdits = [
                    vscode.TextEdit.delete(new vscode.Range(position.line, position.character - 3, position.line, position.character))
                ];
                items.push(item);
            }
        }
        return items;
    }
    makeItem(label, insertText, kind, detail) {
        const item = new vscode.CompletionItem(label, kind);
        item.insertText = insertText;
        if (detail) {
            item.detail = detail;
        }
        return item;
    }
    makeSnippetItem(label, snippet, detail, kind) {
        const item = new vscode.CompletionItem(label, kind);
        item.insertText = new vscode.SnippetString(snippet);
        item.detail = detail;
        return item;
    }
    makeCodeBlockItem() {
        const item = new vscode.CompletionItem('```language\\ncode\\n```', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString('${1:language}\n${2:code here}\n```');
        item.detail = 'Fenced code block';
        item.documentation = new vscode.MarkdownString('Insert a fenced code block with syntax highlighting.');
        return item;
    }
    makeTableItem(cols) {
        const headers = Array.from({ length: cols }, (_, i) => `Header ${i + 1}`).join(' | ');
        const dividers = Array.from({ length: cols }, () => '----------').join(' | ');
        const row = Array.from({ length: cols }, () => 'Cell').join(' | ');
        const table = `| ${headers} |\n| ${dividers} |\n| ${row} |`;
        const item = new vscode.CompletionItem(`| ${cols}-column table`, vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString(table);
        item.detail = `${cols}-column markdown table`;
        return item;
    }
    toSnippet(el) {
        // Convert insertText to a basic snippet
        return el.insertText.replace(/\$([\w]+)/g, '\\$$$1');
    }
}
exports.MarkdownCompletionProvider = MarkdownCompletionProvider;
//# sourceMappingURL=MarkdownCompletionProvider.js.map