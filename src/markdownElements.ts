export interface MarkdownElement {
    id: string;
    label: string;
    icon: string;
    description: string;
    group: string;
    shortcut?: string;
    insertText: string;
    wrapBefore?: string;
    wrapAfter?: string;
    isBlock?: boolean;
    completionDetail?: string;
}

export const MARKDOWN_ELEMENTS: MarkdownElement[] = [
    // ── Headings ────────────────────────────────────────────────────────────────
    {
        id: 'h1', label: 'H1', icon: 'H¹', group: 'Headings',
        description: 'Heading level 1', shortcut: 'Ctrl+1',
        insertText: '# Heading 1', wrapBefore: '# ', wrapAfter: '', isBlock: true,
        completionDetail: '# Heading 1'
    },
    {
        id: 'h2', label: 'H2', icon: 'H²', group: 'Headings',
        description: 'Heading level 2', shortcut: 'Ctrl+2',
        insertText: '## Heading 2', wrapBefore: '## ', wrapAfter: '', isBlock: true,
        completionDetail: '## Heading 2'
    },
    {
        id: 'h3', label: 'H3', icon: 'H³', group: 'Headings',
        description: 'Heading level 3', shortcut: 'Ctrl+3',
        insertText: '### Heading 3', wrapBefore: '### ', wrapAfter: '', isBlock: true,
        completionDetail: '### Heading 3'
    },
    {
        id: 'h4', label: 'H4', icon: 'H⁴', group: 'Headings',
        description: 'Heading level 4',
        insertText: '#### Heading 4', wrapBefore: '#### ', wrapAfter: '', isBlock: true,
        completionDetail: '#### Heading 4'
    },
    {
        id: 'h5', label: 'H5', icon: 'H⁵', group: 'Headings',
        description: 'Heading level 5',
        insertText: '##### Heading 5', wrapBefore: '##### ', wrapAfter: '', isBlock: true,
        completionDetail: '##### Heading 5'
    },
    {
        id: 'h6', label: 'H6', icon: 'H⁶', group: 'Headings',
        description: 'Heading level 6',
        insertText: '###### Heading 6', wrapBefore: '###### ', wrapAfter: '', isBlock: true,
        completionDetail: '###### Heading 6'
    },

    // ── Text Formatting ─────────────────────────────────────────────────────────
    {
        id: 'bold', label: 'Bold', icon: 'B', group: 'Formatting',
        description: 'Bold text — **text**', shortcut: 'Ctrl+B',
        insertText: '**bold text**', wrapBefore: '**', wrapAfter: '**',
        completionDetail: '**bold text**'
    },
    {
        id: 'italic', label: 'Italic', icon: 'I', group: 'Formatting',
        description: 'Italic text — *text*', shortcut: 'Ctrl+I',
        insertText: '*italic text*', wrapBefore: '*', wrapAfter: '*',
        completionDetail: '*italic text*'
    },
    {
        id: 'boldItalic', label: 'Bold+Italic', icon: 'BI', group: 'Formatting',
        description: 'Bold and italic — ***text***',
        insertText: '***bold italic***', wrapBefore: '***', wrapAfter: '***',
        completionDetail: '***bold italic***'
    },
    {
        id: 'strikethrough', label: 'Strike', icon: 'S̶', group: 'Formatting',
        description: 'Strikethrough — ~~text~~',
        insertText: '~~strikethrough~~', wrapBefore: '~~', wrapAfter: '~~',
        completionDetail: '~~strikethrough~~'
    },
    {
        id: 'highlight', label: 'Highlight', icon: 'H̲', group: 'Formatting',
        description: 'Highlighted text — ==text==',
        insertText: '==highlighted==', wrapBefore: '==', wrapAfter: '==',
        completionDetail: '==highlighted=='
    },
    {
        id: 'inlineCode', label: 'Code', icon: '`c`', group: 'Formatting',
        description: 'Inline code — `code`', shortcut: 'Ctrl+`',
        insertText: '`code`', wrapBefore: '`', wrapAfter: '`',
        completionDetail: '`code`'
    },
    {
        id: 'superscript', label: 'Super', icon: 'X²', group: 'Formatting',
        description: 'Superscript — ^text^',
        insertText: '^superscript^', wrapBefore: '^', wrapAfter: '^',
        completionDetail: '^superscript^'
    },
    {
        id: 'subscript', label: 'Sub', icon: 'X₂', group: 'Formatting',
        description: 'Subscript — ~text~',
        insertText: '~subscript~', wrapBefore: '~', wrapAfter: '~',
        completionDetail: '~subscript~'
    },
    {
        id: 'underline', label: 'Under', icon: 'U̲', group: 'Formatting',
        description: 'Underline (HTML) — <u>text</u>',
        insertText: '<u>underlined</u>', wrapBefore: '<u>', wrapAfter: '</u>',
        completionDetail: '<u>underlined</u>'
    },

    // ── Blocks ──────────────────────────────────────────────────────────────────
    {
        id: 'blockquote', label: 'Quote', icon: '❝', group: 'Blocks',
        description: 'Blockquote — > text',
        insertText: '> Blockquote text', wrapBefore: '> ', wrapAfter: '', isBlock: true,
        completionDetail: '> quote'
    },
    {
        id: 'codeBlock', label: 'Code Block', icon: '</>', group: 'Blocks',
        description: 'Fenced code block — ``` ```',
        insertText: '```language\ncode here\n```', wrapBefore: '```\n', wrapAfter: '\n```', isBlock: true,
        completionDetail: '```language\ncode\n```'
    },
    {
        id: 'horizontalRule', label: 'H-Rule', icon: '—', group: 'Blocks',
        description: 'Horizontal rule — ---',
        insertText: '\n---\n', wrapBefore: '', wrapAfter: '', isBlock: true,
        completionDetail: '---'
    },
    {
        id: 'details', label: 'Details', icon: '▶', group: 'Blocks',
        description: 'Collapsible details block (HTML)',
        insertText: '<details>\n<summary>Click to expand</summary>\n\nContent here.\n\n</details>',
        wrapBefore: '<details>\n<summary>Click to expand</summary>\n\n',
        wrapAfter: '\n\n</details>', isBlock: true,
        completionDetail: '<details>...</details>'
    },

    // ── Lists ───────────────────────────────────────────────────────────────────
    {
        id: 'unorderedList', label: 'Bullet List', icon: '•', group: 'Lists',
        description: 'Unordered bullet list',
        insertText: '- Item one\n- Item two\n- Item three',
        wrapBefore: '- ', wrapAfter: '', isBlock: true,
        completionDetail: '- item'
    },
    {
        id: 'orderedList', label: 'Numbered List', icon: '1.', group: 'Lists',
        description: 'Ordered numbered list',
        insertText: '1. Item one\n2. Item two\n3. Item three',
        wrapBefore: '1. ', wrapAfter: '', isBlock: true,
        completionDetail: '1. item'
    },
    {
        id: 'taskList', label: 'Task List', icon: '☐', group: 'Lists',
        description: 'GitHub-flavored task / checklist',
        insertText: '- [ ] Task one\n- [ ] Task two\n- [x] Completed task',
        wrapBefore: '- [ ] ', wrapAfter: '', isBlock: true,
        completionDetail: '- [ ] task'
    },
    {
        id: 'definitionList', label: 'Definition', icon: 'DL', group: 'Lists',
        description: 'Definition list — Term\\n:   Definition',
        insertText: 'Term\n:   Definition of the term',
        isBlock: true, completionDetail: 'Term\n:   definition'
    },

    // ── Links & Media ───────────────────────────────────────────────────────────
    {
        id: 'link', label: 'Link', icon: '🔗', group: 'Links',
        description: 'Hyperlink — [text](url)', shortcut: 'Ctrl+Shift+K',
        insertText: '[link text](https://example.com)',
        wrapBefore: '[', wrapAfter: '](https://example.com)',
        completionDetail: '[text](url)'
    },
    {
        id: 'image', label: 'Image', icon: '🖼', group: 'Links',
        description: 'Image — ![alt](url)',
        insertText: '![alt text](https://example.com/image.png)',
        wrapBefore: '![', wrapAfter: '](https://example.com/image.png)',
        completionDetail: '![alt](url)'
    },
    {
        id: 'autoLink', label: 'Auto Link', icon: '<🔗>', group: 'Links',
        description: 'Auto-linked URL — <url>',
        insertText: '<https://example.com>',
        wrapBefore: '<', wrapAfter: '>',
        completionDetail: '<https://url>'
    },
    {
        id: 'refLink', label: 'Ref Link', icon: '[ref]', group: 'Links',
        description: 'Reference-style link',
        insertText: '[link text][ref-id]\n\n[ref-id]: https://example.com "Title"',
        wrapBefore: '[', wrapAfter: '][ref-id]\n\n[ref-id]: https://example.com "Title"',
        isBlock: true, completionDetail: '[text][ref]'
    },

    // ── Tables ──────────────────────────────────────────────────────────────────
    {
        id: 'table2x2', label: '2×2 Table', icon: '⊞²', group: 'Tables',
        description: 'Insert a 2-column table',
        insertText: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |',
        isBlock: true, completionDetail: '2-column table'
    },
    {
        id: 'table', label: '3×3 Table', icon: '⊞³', group: 'Tables',
        description: 'Insert a 3-column table',
        insertText: '| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |',
        isBlock: true, completionDetail: '3-column table'
    },
    {
        id: 'table4x4', label: '4×4 Table', icon: '⊞⁴', group: 'Tables',
        description: 'Insert a 4-column table',
        insertText: '| Header 1 | Header 2 | Header 3 | Header 4 |\n|----------|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   | Cell 4   |\n| Cell 5   | Cell 6   | Cell 7   | Cell 8   |',
        isBlock: true, completionDetail: '4-column table'
    },

    // ── GFM Callouts / Alerts ───────────────────────────────────────────────────
    {
        id: 'calloutNote', label: 'Note', icon: 'ℹ', group: 'Callouts',
        description: 'GitHub Flavored Markdown Note callout',
        insertText: '> [!NOTE]\n> Note content here.', isBlock: true,
        completionDetail: '> [!NOTE]'
    },
    {
        id: 'calloutTip', label: 'Tip', icon: '💡', group: 'Callouts',
        description: 'GitHub Flavored Markdown Tip callout',
        insertText: '> [!TIP]\n> Tip content here.', isBlock: true,
        completionDetail: '> [!TIP]'
    },
    {
        id: 'calloutWarning', label: 'Warning', icon: '⚠', group: 'Callouts',
        description: 'GitHub Flavored Markdown Warning callout',
        insertText: '> [!WARNING]\n> Warning content here.', isBlock: true,
        completionDetail: '> [!WARNING]'
    },
    {
        id: 'calloutImportant', label: 'Important', icon: '❗', group: 'Callouts',
        description: 'GitHub Flavored Markdown Important callout',
        insertText: '> [!IMPORTANT]\n> Important content here.', isBlock: true,
        completionDetail: '> [!IMPORTANT]'
    },
    {
        id: 'calloutCaution', label: 'Caution', icon: '🚫', group: 'Callouts',
        description: 'GitHub Flavored Markdown Caution callout',
        insertText: '> [!CAUTION]\n> Caution content here.', isBlock: true,
        completionDetail: '> [!CAUTION]'
    },

    // ── Special / Advanced ──────────────────────────────────────────────────────
    {
        id: 'footnote', label: 'Footnote', icon: '[^]', group: 'Special',
        description: 'Footnote reference — [^1]',
        insertText: 'text[^1]\n\n[^1]: Footnote definition here.',
        wrapBefore: '', wrapAfter: '[^1]\n\n[^1]: Footnote definition here.', isBlock: true,
        completionDetail: '[^1] footnote'
    },
    {
        id: 'mathInline', label: 'Math', icon: '∑', group: 'Special',
        description: 'Inline LaTeX math — $formula$',
        insertText: '$E = mc^2$', wrapBefore: '$', wrapAfter: '$',
        completionDetail: '$formula$'
    },
    {
        id: 'mathBlock', label: 'Math Block', icon: '∫', group: 'Special',
        description: 'Block LaTeX math — $$formula$$',
        insertText: '$$\n\\frac{d}{dx}f(x) = f\'(x)\n$$',
        wrapBefore: '$$\n', wrapAfter: '\n$$', isBlock: true,
        completionDetail: '$$\nformula\n$$'
    },
    {
        id: 'toc', label: 'TOC', icon: '📑', group: 'Special',
        description: 'Table of contents placeholder',
        insertText: '[[toc]]', isBlock: true,
        completionDetail: '[[toc]]'
    },
];

export function getElementsByGroup(): Map<string, MarkdownElement[]> {
    const map = new Map<string, MarkdownElement[]>();
    for (const el of MARKDOWN_ELEMENTS) {
        if (!map.has(el.group)) {
            map.set(el.group, []);
        }
        map.get(el.group)!.push(el);
    }
    return map;
}

export function getElementById(id: string): MarkdownElement | undefined {
    return MARKDOWN_ELEMENTS.find(el => el.id === id);
}
