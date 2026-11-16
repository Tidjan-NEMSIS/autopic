---
name: undraw
description: >-
  Search, download, colorize, and integrate unDraw.co open-source SVG
  illustrations into web and mobile projects. Use when the user needs
  illustrations for empty states, error pages, onboarding, hero sections,
  feature showcases, or any decorative UI element. Supports keyword search,
  brand color customization, local catalog caching, and automatic React/Next.js
  component generation.
---

# unDraw SVG Illustrations Skill

## Overview

[unDraw](https://undraw.co) is a collection of 600+ open-source SVG illustrations by Katerina Limpitsouni. All illustrations are:
- **Free** for commercial and personal use (no attribution required)
- **Customizable** — the primary color (#6C63FF by default) can be replaced
- **SVG-native** — scalable, lightweight, and CSS-styleable

> **License restriction:** You may NOT redistribute the illustrations as a competing illustration library or vector pack.

## When to Use This Skill

Activate this skill whenever you need to:
1. Find an illustration for a UI element (empty state, error page, hero, onboarding, etc.)
2. Download and integrate an unDraw SVG into a project
3. Customize the illustration's primary color to match a brand
4. Generate a React/Next.js component wrapping the illustration

## Scripts

This skill includes two Python scripts in the `scripts/` subdirectory:

### 1. `undraw_search.py` — Search & Download

```bash
# Search by keyword (returns top 5 matches)
python scripts/undraw_search.py --query "teamwork" --limit 5 --json

# Search and download SVGs
python scripts/undraw_search.py --query "error" --limit 3 --download --output ./public/illustrations

# Build a local catalog (broad search across many categories)
python scripts/undraw_search.py --build-catalog --output ./undraw-catalog.json
```

**API Endpoint (2026):** `GET https://undraw.co/api/search?q=<keyword>&page=<n>`
- Query must be at least 3 characters
- 40 results per page
- Response: `{ results, total, hasMore, page }`

**Output format (--json):**
```json
[
  {
    "title": "Server Error",
    "slug": "server-error_syuz",
    "media": "https://cdn.undraw.co/illustration/server-error_syuz.svg",
    "id": "67e491b846b2f06a5bc66f55"
  }
]
```

### 2. `undraw_colorize.py` — Color Customization

```bash
# Colorize a single SVG
python scripts/undraw_colorize.py --input illustration.svg --color "#FF6B6B"

# Colorize all SVGs in a directory
python scripts/undraw_colorize.py --input ./public/illustrations/ --color "#FF6B6B"

# Colorize and save to a different file
python scripts/undraw_colorize.py --input input.svg --color "#3B82F6" --output colored.svg
```

## Step-by-Step Workflow

### Step 1: Search for an illustration

Run the search script with a relevant keyword (minimum 3 characters). Use English keywords for best results.

```bash
python <plugin_dir>/skills/undraw/scripts/undraw_search.py -q "<keyword>" -l 5 --json
```

**API Reference:** `GET https://undraw.co/api/search?q=<keyword>&page=<page>`
- Response fields per result: `title`, `newSlug`, `media` (CDN SVG URL), `_id`
- 40 results per page, pagination via `hasMore` and incrementing `page` (starts at 0)

Good keyword strategies:
- **Concept-based:** "teamwork", "success", "error", "security", "analytics"
- **Scene-based:** "reading", "coding", "walking", "meeting"
- **Object-based:** "server", "phone", "envelope", "calendar"

If no results, try synonyms or broader terms.

### Step 2: Download the SVG

```bash
python <plugin_dir>/skills/undraw/scripts/undraw_search.py -q "<keyword>" -l 1 --download -o <project_illustrations_dir>
```

Recommended output directories by framework:
- **Next.js / React:** `./public/illustrations/` or `./src/assets/illustrations/`
- **React Native:** `./src/assets/svg/`
- **Vue / Nuxt:** `./public/illustrations/` or `./src/assets/illustrations/`
- **Static HTML:** `./assets/illustrations/`

### Step 3: Colorize to match brand

```bash
python <plugin_dir>/skills/undraw/scripts/undraw_colorize.py -i <svg_path> -c "<hex_color>"
```

**Always ask the user for their brand/primary color.** If the project has a Tailwind config, design tokens, or CSS variables, read the primary color from there.

### Step 4: Create a React/Next.js Component (if applicable)

For React/Next.js projects, generate a component that wraps the SVG:

**Option A: Inline SVG Component (recommended for customization)**

```tsx
// components/illustrations/TeamWork.tsx
import React from 'react';

interface IllustrationProps {
  className?: string;
  primaryColor?: string;
  width?: number | string;
  height?: number | string;
}

export const TeamWorkIllustration: React.FC<IllustrationProps> = ({
  className = '',
  primaryColor = '#6C63FF',
  width = '100%',
  height = 'auto',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="..."
    width={width}
    height={height}
    className={className}
    role="img"
    aria-label="Team work illustration"
  >
    {/* Paste SVG contents here, replacing #6C63FF with {primaryColor} */}
  </svg>
);
```

**Option B: Image Tag (simpler, no inline SVG)**

```tsx
// components/illustrations/UndrawIllustration.tsx
import Image from 'next/image';

interface Props {
  name: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export const UndrawIllustration: React.FC<Props> = ({
  name,
  alt,
  width = 400,
  height = 300,
  className,
}) => (
  <Image
    src={`/illustrations/${name}.svg`}
    alt={alt}
    width={width}
    height={height}
    className={className}
    priority={false}
  />
);
```

**Usage:**
```tsx
<UndrawIllustration name="team-work" alt="Team collaboration" className="mx-auto" />
```

### Step 5: Integration Patterns

#### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <UndrawIllustration name="no-data" alt="No data found" width={300} height={225} />
  <h3 className="mt-6 text-lg font-semibold text-gray-900">No results found</h3>
  <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters.</p>
</div>
```

#### Error Page (404)
```tsx
<div className="flex min-h-screen flex-col items-center justify-center">
  <UndrawIllustration name="page-not-found" alt="Page not found" width={400} />
  <h1 className="mt-8 text-4xl font-bold">404</h1>
  <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
  <Link href="/" className="mt-6 text-primary hover:underline">Go back home</Link>
</div>
```

#### Hero Section
```tsx
<section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-20">
  <div>
    <h1 className="text-4xl font-bold">Build something amazing</h1>
    <p className="mt-4 text-lg text-gray-600">Description here...</p>
  </div>
  <UndrawIllustration name="building" alt="Building" className="w-full max-w-md mx-auto" />
</section>
```

## Local Catalog (Offline Mode)

For projects that need offline access or faster search:

1. Download the full catalog:
   ```bash
   python <plugin_dir>/skills/undraw/scripts/undraw_search.py --list-all --output ./undraw-catalog.json
   ```

2. Search locally by reading and filtering the JSON catalog file.

3. Download only the needed SVGs by URL from the catalog entries.

## Tips

- **Always use English keywords** for searching — unDraw titles are in English
- **SVG > PNG** for web — SVGs are scalable, smaller, and color-customizable
- **One illustration per concept** — don't overload a page with multiple illustrations
- **Consistent style** — unDraw illustrations share a consistent visual style, so mixing with other illustration libraries looks jarring
- **Accessibility** — always add meaningful `alt` text and `aria-label` to illustrations
- **Dark mode** — for dark backgrounds, consider inverting or adjusting the illustration colors; the primary color swap helps but background elements may need attention
