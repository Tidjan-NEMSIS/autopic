<div align="center">

# 🎨 tdj-undraw

**Universal unDraw.co SVG Illustration Plugin for AI Coding Agents**  
*Google Antigravity IDE • Claude Code • Cursor • DeepSeek IDE • Windsurf*

[![Antigravity](https://img.shields.io/badge/Antigravity-Plugin-6C63FF?style=for-the-badge&logo=google)](https://antigravity.google)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Compatible-D97706?style=for-the-badge&logo=anthropic)](https://anthropic.com)
[![Cursor](https://img.shields.io/badge/Cursor-Rules%20Included-000000?style=for-the-badge)](https://cursor.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![unDraw](https://img.shields.io/badge/unDraw-600%2B%20illustrations-FF6B6B?style=for-the-badge)](https://undraw.co)

</div>

---

## ⚡ Quick Install

### 1. In Google Antigravity IDE
Install in **one command** for all your projects:
```bash
agy plugin install https://github.com/Tidjan-NEMSIS/tdj-undraw
```

### 2. In Claude Code
```bash
claude plugin install https://github.com/Tidjan-NEMSIS/tdj-undraw
```
*(Or clone into `~/.claude/plugins/tdj-undraw`)*

### 3. In Cursor / DeepSeek IDE / Windsurf / Copilot
Clone into your project or global rules:
```bash
# Add to current project:
git clone https://github.com/Tidjan-NEMSIS/tdj-undraw .agents/plugins/tdj-undraw
```
The included `AGENTS.md` and `.cursorrules` are automatically detected by DeepSeek, Cursor, and Windsurf!

---

## 🤖 How It Works

Once installed, your AI agent **proactively recognizes** when you need an illustration and takes care of the whole workflow:

| Need | What the Agent Does Automatically |
|---|---|
| 🚫 **Empty state** (no data, 0 search results) | Searches unDraw, downloads matching SVG |
| 🔴 **404 / 500 error pages** | Integrates error illustration, customizes text |
| 👋 **Onboarding / Welcome screens** | Finds onboarding graphics, adapts brand tone |
| 🏠 **Hero sections** | Downloads illustration, sets responsive sizing |
| 🎨 **Brand match** | Replaces `#6C63FF` with **your project's hex color** |
| ⚛️ **Component ready** | Generates React / Next.js / Vue / Flutter code |

---

## 💬 Example Prompt

```text
You:   "Crée-moi une page 404 propre avec une illustration pour mon app Next.js"

Agent: 🔍 Recherche d'illustrations d'erreur sur unDraw...
       ✅ Trouvé : "page-not-found"
       🎨 Colorisation avec votre couleur primaire (#3B82F6)
       📦 Sauvegardé dans public/illustrations/page-not-found.svg
       ⚛️ Composant React créé dans app/not-found.tsx !
```

---

## 🛠️ Included CLI Scripts

You can also run the scripts directly from the terminal:

### 🔍 Search illustrations (live unDraw API)
```bash
python scripts/undraw_search.py -q "teamwork" -l 5 --json
```

### ⬇️ Search and download
```bash
python scripts/undraw_search.py -q "analytics" -l 1 --download -o ./public/illustrations
```

### 🎨 Colorize SVG with your brand
```bash
python scripts/undraw_colorize.py -i ./public/illustrations/analytics.svg -c "#10B981"
```

### 📦 Build local offline catalog (600+ SVGs)
```bash
python scripts/undraw_search.py --build-catalog --output ./undraw-catalog.json
```

---

## 📂 Multi-IDE Architecture

```
tdj-undraw/
├── plugin.json                 # Google Antigravity manifest
├── .claude-plugin/plugin.json  # Claude Code plugin manifest
├── gemini-extension.json       # Gemini CLI extension manifest
├── AGENTS.md                   # Universal agent rule (DeepSeek, Cursor, Antigravity)
├── CLAUDE.md                   # Claude Code instructions
├── .cursorrules                # Cursor IDE rule
├── assets/logo.svg             # Plugin logo
├── scripts/                    # Portable Python automation
│   ├── undraw_search.py        # Live search & download
│   └── undraw_colorize.py      # SVG color customization
└── skills/undraw/
    └── SKILL.md                # Antigravity skill definition
```

---

## 📜 License & Credits

- Plugin created and maintained by **[Tidjan Sow](https://github.com/Tidjan-NEMSIS)** ([@Tidjan-Sow](https://github.com/Tidjan-Sow)).
- Illustrations by Katerina Limpitsouni on [unDraw.co](https://undraw.co) (Free for commercial and personal use).
- Plugin code licensed under the [MIT License](LICENSE).
