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
exports.MarkdownHoverProvider = void 0;
const vscode = __importStar(require("vscode"));
const SYNTAX_PATTERNS = [
    {
        regex: /^#{1,6}\s/,
        label: 'Heading',
        syntax: '# Heading 1  through  ###### Heading 6',
        description: 'Creates a heading. The number of `#` symbols (1–6) determines the heading level.',
        example: '# My Title\n## Section\n### Subsection',
        spec: 'ATX Heading — CommonMark §4.2'
    },
    {
        regex: /\*\*[^*]+\*\*/,
        label: 'Bold',
        syntax: '**bold text**',
        description: 'Renders text in **bold** (strong emphasis).',
        example: 'This is **very important** text.',
        spec: 'Strong emphasis — CommonMark §6.4'
    },
    {
        regex: /\*[^*]+\*/,
        label: 'Italic',
        syntax: '*italic text*  or  _italic text_',
        description: 'Renders text in *italic* (emphasis).',
        example: 'This is *emphasized* text.',
        spec: 'Emphasis — CommonMark §6.4'
    },
    {
        regex: /\*\*\*[^*]+\*\*\*/,
        label: 'Bold + Italic',
        syntax: '***bold italic***',
        description: 'Renders text as both **bold** and *italic*.',
        example: '***critically important***',
        spec: 'Combined emphasis — CommonMark §6.4'
    },
    {
        regex: /~~[^~]+~~/,
        label: 'Strikethrough',
        syntax: '~~strikethrough~~',
        description: 'Renders text with a strikethrough line.',
        example: '~~outdated content~~',
        spec: 'GitHub Flavored Markdown extension'
    },
    {
        regex: /==[^=]+==/,
        label: 'Highlight',
        syntax: '==highlighted==',
        description: 'Highlights text (supported by many markdown renderers).',
        example: '==important note==',
    },
    {
        regex: /`[^`]+`/,
        label: 'Inline Code',
        syntax: '`code`',
        description: 'Renders text as inline monospace code.',
        example: 'Use `console.log()` to debug.',
        spec: 'Code span — CommonMark §6.1'
    },
    {
        regex: /^```/m,
        label: 'Fenced Code Block',
        syntax: '```language\ncode\n```',
        description: 'A block of code with optional syntax highlighting. Specify the language after the opening backticks.',
        example: '```typescript\nconst x = 42;\n```',
        spec: 'Fenced code block — CommonMark §4.5'
    },
    {
        regex: /^>/m,
        label: 'Blockquote',
        syntax: '> quoted text',
        description: 'Creates a blockquote. Can be nested with multiple `>` characters.',
        example: '> "All that glitters is not gold."\n> — Shakespeare',
        spec: 'Block quote — CommonMark §5.1'
    },
    {
        regex: /^\s*[-*+]\s/m,
        label: 'Unordered List',
        syntax: '- item  or  * item  or  + item',
        description: 'Creates a bulleted unordered list item.',
        example: '- Apple\n- Banana\n- Cherry',
        spec: 'List items — CommonMark §5.3'
    },
    {
        regex: /^\s*\d+\.\s/m,
        label: 'Ordered List',
        syntax: '1. item',
        description: 'Creates a numbered ordered list. Numbers do not need to be sequential.',
        example: '1. First step\n2. Second step\n3. Third step',
        spec: 'Ordered list — CommonMark §5.3'
    },
    {
        regex: /^\s*-\s\[[ x]\]/m,
        label: 'Task List',
        syntax: '- [ ] unchecked  /  - [x] checked',
        description: 'Creates a GitHub-flavored task/checkbox list item.',
        example: '- [x] Done\n- [ ] Pending',
        spec: 'Task list items — GFM §5.3'
    },
    {
        regex: /\[[^\]]+\]\([^)]+\)/,
        label: 'Link',
        syntax: '[link text](url "optional title")',
        description: 'Creates a hyperlink. The title attribute is optional and shown as a tooltip.',
        example: '[Visit GitHub](https://github.com)',
        spec: 'Inline link — CommonMark §6.6'
    },
    {
        regex: /!\[[^\]]*\]\([^)]+\)/,
        label: 'Image',
        syntax: '![alt text](image-url "optional title")',
        description: 'Embeds an image. The alt text is shown when the image cannot be displayed.',
        example: '![Logo](https://example.com/logo.png)',
        spec: 'Image — CommonMark §6.6'
    },
    {
        regex: /^\|.+\|/m,
        label: 'Table',
        syntax: '| Header | Header |\n|--------|--------|\n| Cell   | Cell   |',
        description: 'Creates a table. The second row defines column alignment: `---` (default), `:---` (left), `---:` (right), `:---:` (center).',
        example: '| Name | Age |\n|------|-----|\n| Bob  | 25  |',
        spec: 'Tables — GFM §4.10'
    },
    {
        regex: /^---+$|^\*\*\*+$|^___+$/m,
        label: 'Horizontal Rule',
        syntax: '---  or  ***  or  ___',
        description: 'Creates a horizontal thematic break / rule.',
        example: 'Section 1\n\n---\n\nSection 2',
        spec: 'Thematic break — CommonMark §4.1'
    },
    {
        regex: /\[\^[^\]]+\]/,
        label: 'Footnote',
        syntax: 'text[^ref]  and  [^ref]: definition',
        description: 'Creates a footnote reference. Define the footnote anywhere in the document with `[^ref]: text`.',
        example: 'According to research[^1].\n\n[^1]: Smith, 2023.',
    },
    {
        regex: /^\^[^^]/m,
        label: 'Superscript',
        syntax: '^superscript^',
        description: 'Renders text as superscript (supported by many renderers).',
        example: 'E = mc^2^',
    },
    {
        regex: /~[^~]+~/,
        label: 'Subscript',
        syntax: '~subscript~',
        description: 'Renders text as subscript (supported by many renderers).',
        example: 'H~2~O',
    },
    {
        regex: /\$[^$]+\$/,
        label: 'Inline Math',
        syntax: '$LaTeX formula$',
        description: 'Renders an inline LaTeX math expression (supported by many renderers).',
        example: 'The formula $E = mc^2$ is famous.',
    },
    {
        regex: /^\$\$$/m,
        label: 'Block Math',
        syntax: '$$\nformula\n$$',
        description: 'Renders a block LaTeX math expression on its own line.',
        example: '$$\n\\int_0^\\infty e^{-x} dx = 1\n$$',
    },
    {
        regex: /^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/m,
        label: 'GFM Callout / Alert',
        syntax: '> [!NOTE]\n> content',
        description: 'A GitHub Flavored Markdown alert callout. Types: NOTE, TIP, WARNING, IMPORTANT, CAUTION.',
        example: '> [!TIP]\n> Use this pattern for better performance.',
        spec: 'GitHub alert extensions'
    },
];
class MarkdownHoverProvider {
    provideHover(document, position) {
        const line = document.lineAt(position.line).text;
        const offset = position.character;
        // Find the word/token at position — get surrounding context
        const contextLine = line;
        for (const pattern of SYNTAX_PATTERNS) {
            // Test if the pattern matches anywhere on the line
            const match = contextLine.match(pattern.regex);
            if (match && match.index !== undefined) {
                // Check if the cursor is near the match
                const start = match.index;
                const end = match.index + match[0].length;
                if (offset >= Math.max(0, start - 2) && offset <= end + 2) {
                    return this.buildHover(pattern);
                }
            }
        }
        // Check for specific inline patterns at cursor position
        const inlinePatterns = [
            { regex: /\*\*[^*]*\*\*/g, pattern: SYNTAX_PATTERNS.find(p => p.label === 'Bold') },
            { regex: /\*[^*]+\*/g, pattern: SYNTAX_PATTERNS.find(p => p.label === 'Italic') },
            { regex: /`[^`]+`/g, pattern: SYNTAX_PATTERNS.find(p => p.label === 'Inline Code') },
            { regex: /~~[^~]+~~/g, pattern: SYNTAX_PATTERNS.find(p => p.label === 'Strikethrough') },
            { regex: /\[[^\]]+\]\([^)]+\)/g, pattern: SYNTAX_PATTERNS.find(p => p.label === 'Link') },
            { regex: /!\[[^\]]*\]\([^)]+\)/g, pattern: SYNTAX_PATTERNS.find(p => p.label === 'Image') },
        ];
        for (const { regex, pattern } of inlinePatterns) {
            if (!pattern) {
                continue;
            }
            let m;
            while ((m = regex.exec(line)) !== null) {
                if (offset >= m.index && offset <= m.index + m[0].length) {
                    return this.buildHover(pattern);
                }
            }
        }
        return undefined;
    }
    buildHover(pattern) {
        const md = new vscode.MarkdownString();
        md.isTrusted = true;
        md.supportHtml = false;
        md.appendMarkdown(`**${pattern.label}**\n\n`);
        md.appendMarkdown(`${pattern.description}\n\n`);
        md.appendMarkdown(`**Syntax:**\n`);
        md.appendCodeblock(pattern.syntax, 'markdown');
        if (pattern.example) {
            md.appendMarkdown(`**Example:**\n`);
            md.appendCodeblock(pattern.example, 'markdown');
        }
        if (pattern.spec) {
            md.appendMarkdown(`\n*${pattern.spec}*`);
        }
        return new vscode.Hover(md);
    }
}
exports.MarkdownHoverProvider = MarkdownHoverProvider;
//# sourceMappingURL=MarkdownHoverProvider.js.map