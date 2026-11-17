---
name: autopic
description: >-
  Autopic — Universal multi-provider illustration skill (unDraw, Open Peeps CC0, IRA Design MIT) with automatic CSS/Tailwind brand palette detection, candidate ranking, anti-duplicate caching, dark mode adaptation, and React/Next.js/Vue/Svelte/Flutter component generation.
---

# Autopic — Universal Multi-Provider Illustration Skill (v2.0)

## Overview

**Autopic** (`tidjan-autopic`) is an intelligent, multi-provider illustration engine for AI coding agents.
Supported providers:
- **unDraw** (`undraw`): Flat modern illustrations (Approved)
- **Open Peeps** (`openpeeps`): Hand-drawn vector characters & avatars (CC0 1.0 Public Domain, Approved)
- **IRA Design** (`iradesign`): Tech & gradient illustrations (MIT License, Approved)
- **Storyset / DrawKit / ManyPixels**: Full legal compliance mode (`manual_only`) with official URLs & attribution snippets.

The engine empowers the AI agent to:
1. **Analyze visual & semantic context**: Automatically extract component type, mood, domain, style, and brand colors from `tailwind.config.*` or CSS variables (`--primary`).
2. **Multi-criteria ranking (0-100)**: Score candidates across semantic fit, component match, style harmony, palette, and licensing.
3. **Multi-framework code generation**: Generates typed, responsive components for **React**, **Next.js**, **Vue 3 SFC**, **Svelte**, **Flutter**, or **HTML**.
4. **Anti-duplicate caching**: Prevent redundant downloads by inspecting SHA256 hashes in `./public/illustrations`.
5. **Dark mode adaptation & SVG sanitization**: Adjust charcoal tones for dark UI and remove dangerous script tags.

---

## 🚀 Recommended Agent Workflow: Smart Match

Whenever a user asks for an illustration, error page (404), empty state, hero section, or onboarding:

```bash
npx tidjan-autopic smart "<concept or page description>"
```

### Advanced Options:
```bash
# Specific provider (e.g. openpeeps for avatars/characters)
npx tidjan-autopic smart "user profile" --provider openpeeps

# Target framework override
npx tidjan-autopic smart "dashboard analytics" --framework vue

# Custom color & forced dark mode
npx tidjan-autopic smart "payment success" --color "#10B981" --dark

# JSON mode for direct agent parsing
npx tidjan-autopic smart "page 404" --json
```

---

## 🛠️ Individual CLI Commands

```bash
# 1. Multi-provider search with ranking scores
npx tidjan-autopic search "<query>" [--provider <id>] [--json]

# 2. List registered providers and their capabilities
npx tidjan-autopic providers

# 3. Audit legal compliance of all providers
npx tidjan-autopic audit

# 4. Download directly with anti-duplicate prevention
npx tidjan-autopic download "<query>" ./public/illustrations [--provider <id>] [--force]
```

---

## ⚖️ Legal Compliance Rules

- **Approved Providers (`undraw`, `openpeeps`, `iradesign`)**: Automated search, download, and customization are allowed.
- **Manual-Only Providers (`storyset`, `drawkit`, `manypixels`)**: Terms of use forbid scraping/automated mass downloading. When a user requests illustrations from these providers, provide the official search link and the required attribution notice without attempting automated scraping.
