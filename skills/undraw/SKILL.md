---
name: undraw
description: >-
  Smart unDraw SVG illustration skill with automatic CSS/Tailwind brand palette
  detection, candidate ranking, anti-duplicate caching, dark mode adaptation,
  and React/Next.js component generation.
---

# unDraw SVG Illustrations Skill (v1.1.0 Smart Match)

## Overview

[unDraw](https://undraw.co) is a curated collection of 600+ open-source SVG illustrations by Katerina Limpitsouni.
The **tidjan-undraw** plugin empowers the AI agent to:
1. **Analyze visual context**: Automatically extract the project's primary brand color from `tailwind.config.*` or CSS variables (`--primary`).
2. **Smart-rank candidates**: Search and score multiple illustrations, picking the most semantically fitting one.
3. **Anti-duplicate caching**: Prevent redundant downloads by inspecting existing assets in `./public/illustrations`.
4. **Dark / Light adaptation**: Soften charcoal tones for dark mode and produce accessible responsive components.

---

## 🚀 Recommended Agent Workflow: Smart Match

Whenever a user asks for an illustration, error page (404), empty state, hero section, or onboarding:

```bash
npx tidjan-undraw smart "<concept or page description>"
```

### What `smart` executes automatically:
- 🎨 **Palette detection**: Detects `#HEX` code from Tailwind/CSS without asking the user.
- 🎯 **Candidate scoring**: Finds top 5 illustrations and computes semantic fit.
- ⬇️ **Download & Colorize**: Replaces `#6C63FF` with the detected brand color.
- ⚛️ **Component creation**: Emits a typed Next.js / React component in `components/illustrations/`.

---

## 🛠️ Individual CLI Commands

```bash
# 1. Search illustrations
npx tidjan-undraw search "<query>"

# 2. Download with automatic brand color detection & anti-duplicate
npx tidjan-undraw download "<query>" ./public/illustrations

# 3. Force overwrite existing file
npx tidjan-undraw download "<query>" ./public/illustrations "#3B82F6" --force

# 4. Smart match with custom color override
npx tidjan-undraw smart "dashboard analytics" --color "#10B981"
```

---

## 📁 Generated Component Pattern

```tsx
// components/illustrations/NotFoundIllustration.tsx
import Image from 'next/image';
import React from 'react';

export const NotFoundIllustration = ({ width = 400, height = 300, className = '' }) => (
  <div className={`relative inline-block ${className}`}>
    <Image
      src="/illustrations/page-not-found.svg"
      alt="Not found"
      width={width}
      height={height}
      className="w-full h-auto object-contain dark:brightness-110"
    />
  </div>
);
```
