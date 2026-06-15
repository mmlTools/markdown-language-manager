# Markdown Language Manager

A complete **Markdown Language Management** extension for VS Code, providing an interactive toolbar, live preview, intelligent code completion, and rich hover insights for `.md` files.

---

## Features

### 🛠 Interactive Toolbar
- Appears automatically when you open a `.md` file
- **Movable**: dock it in the **Activity Bar sidebar** (left), the **bottom panel**, or pop it out as an **editor-side panel** (right)
- **Filter/search** toolbar elements by name
- All sections are **collapsible**

### ✏️ Complete Markdown Element Coverage

| Group        | Elements |
|--------------|----------|
| **Headings** | H1 – H6 |
| **Formatting** | Bold, Italic, Bold+Italic, Strikethrough, Highlight, Inline Code, Superscript, Subscript, Underline |
| **Blocks** | Blockquote, Code Block, Horizontal Rule, Details/Summary |
| **Lists** | Bullet, Numbered, Task/Checklist, Definition |
| **Links** | Hyperlink, Image, Auto Link, Reference Link |
| **Tables** | 2×2, 3×3, 4×4 |
| **Callouts** | Note, Tip, Warning, Important, Caution (GFM) |
| **Special** | Footnote, Inline Math, Block Math, Table of Contents |

### 👁 Live Preview Tab
- Real-time HTML preview inside the toolbar panel
- **Standalone preview panel** (opens beside the editor)
- GitHub-like rendering with proper table, code, and blockquote styles

### 📊 Document Statistics
- Word count, character count, line count, estimated reading time
- Heading count, link count, image count
- **Interactive document outline** — click a heading to jump to it in the editor

### 💡 Intelligent Code Completion
- Triggered automatically with Markdown syntax characters
- Type `md:` to browse all elements via IntelliSense
- Snippet-based insertions with tab stops

### 🔍 Hover Insights
- Hover over any Markdown syntax element for:
  - Description of the syntax
  - Usage example
  - Specification reference (CommonMark / GFM)

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+\`` | Inline Code |
| `Ctrl+Shift+K` | Insert Link |
| `Ctrl+Alt+P` | Open Live Preview |
| `Ctrl+Alt+M` | Focus Toolbar |

---

## Toolbar Positioning

Use the **Move** buttons at the bottom of the toolbar:

- **← Left** — Focus the Activity Bar sidebar panel
- **↓ Bottom** — Focus the bottom panel view
- **→ Right** — Open a companion preview panel on the right side

You can also drag and drop views within VS Code's standard layout system.

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `markdownManager.autoShowToolbar` | `true` | Auto-focus toolbar when a `.md` file opens |
| `markdownManager.enableCompletion` | `true` | Enable markdown code completion |
| `markdownManager.enableHover` | `true` | Enable hover syntax information |
| `markdownManager.autoPreview` | `false` | Auto-open preview when a `.md` file opens |

---

## Usage

1. Open any `.md` file — the toolbar appears in the sidebar automatically
2. **Select text** then click a toolbar button to **wrap** it
3. Click a toolbar button with **no selection** to **insert** a template at cursor
4. Switch to the **Preview** tab for a live rendered view
5. Switch to the **Stats** tab for document analytics and outline navigation

---

## Requirements

- VS Code 1.74.0+
- No other dependencies required
