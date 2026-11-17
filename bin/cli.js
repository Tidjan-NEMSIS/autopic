#!/usr/bin/env node

/**
 * tidjan-undraw — Universal unDraw SVG Plugin & CLI for AI Coding Agents
 * Author: Tidjan Sow (https://github.com/Tidjan-NEMSIS)
 * Version: 1.1.0 (Smart Match, Auto-Palette, Anti-Duplicate & Dark Mode)
 * License: MIT
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_ROOT = path.resolve(__dirname, '..');
const UNDRAW_API = 'https://undraw.co/api/search';

const args = process.argv.slice(2);
const command = args[0] || 'install';

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

function banner() {
  console.log(`
${colors.magenta}${colors.bold}🎨 tidjan-undraw v1.1.0${colors.reset} — ${colors.cyan}Universal unDraw SVG Plugin for AI Coding Agents${colors.reset}
${colors.gray}Google Antigravity • Claude Code • Cursor • DeepSeek IDE • Windsurf${colors.reset}
`);
}

function copyRecursiveSync(src, dest) {
  const srcResolved = path.resolve(src);
  const destResolved = path.resolve(dest);
  if (destResolved.startsWith(srcResolved + path.sep)) return; // Prevent infinite loop copying into self

  const base = path.basename(src);
  if (base === '.git' || base === 'node_modules' || base === '.agents' || base === '.antigravity_memory.md') return;

  const exists = fs.existsSync(src);
  if (!exists) return;

  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      if (childItemName === '.git' || childItemName === 'node_modules' || childItemName === '.agents') return;
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// -------------------------------------------------------------
// 1. AUTO-DÉTECTION COULEUR & THEME DU PROJET (CSS / TAILWIND)
// -------------------------------------------------------------
function detectProjectContext(cwd = process.cwd()) {
  let primaryColor = '#6C63FF'; // Default unDraw purple
  let colorSource = 'défaut unDraw';
  let hasDarkMode = false;
  let framework = 'Inconnu';

  // Detect Framework
  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['next']) {
        const hasAppDir = fs.existsSync(path.join(cwd, 'app')) || fs.existsSync(path.join(cwd, 'src', 'app'));
        framework = hasAppDir ? 'Next.js (App Router)' : 'Next.js (Pages Router)';
      } else if (deps['react']) {
        framework = deps['vite'] ? 'React (Vite)' : 'React';
      } else if (deps['vue'] || deps['nuxt']) {
        framework = deps['nuxt'] ? 'Nuxt' : 'Vue';
      } else if (deps['svelte']) {
        framework = 'Svelte';
      }
    } catch (_) {}
  }

  // 1. Check Tailwind configs
  const tailwindFiles = [
    'tailwind.config.ts',
    'tailwind.config.js',
    'tailwind.config.mjs',
    'tailwind.config.cjs',
  ];
  for (const f of tailwindFiles) {
    const fullPath = path.join(cwd, f);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("darkMode") || content.includes("'class'") || content.includes('"class"')) {
        hasDarkMode = true;
      }
      // Look for primary hex code
      const hexMatch = content.match(/primary['"]?\s*:\s*['"](#[0-9a-fA-F]{6})['"]/i)
        || content.match(/['"]primary['"]?\s*:\s*\{[^}]*['"]DEFAULT['"]?\s*:\s*['"](#[0-9a-fA-F]{6})['"]/i)
        || content.match(/brand['"]?\s*:\s*['"](#[0-9a-fA-F]{6})['"]/i);
      if (hexMatch && hexMatch[1]) {
        primaryColor = hexMatch[1].toUpperCase();
        colorSource = `${f} (Tailwind)`;
        break;
      }
    }
  }

  // 2. Check CSS files (variables --primary or --brand)
  if (colorSource === 'défaut unDraw') {
    const cssCandidates = [
      'app/globals.css',
      'src/app/globals.css',
      'styles/globals.css',
      'src/index.css',
      'src/App.css',
    ];
    for (const cssFile of cssCandidates) {
      const fullPath = path.join(cwd, cssFile);
      if (fs.existsSync(fullPath)) {
        const cssContent = fs.readFileSync(fullPath, 'utf8');
        if (cssContent.includes('.dark') || cssContent.includes('@media (prefers-color-scheme: dark)')) {
          hasDarkMode = true;
        }
        const match = cssContent.match(/--(?:primary|brand|color-primary)\s*:\s*(#[0-9a-fA-F]{6})/i);
        if (match && match[1]) {
          primaryColor = match[1].toUpperCase();
          colorSource = `${cssFile} (CSS variable)`;
          break;
        }
      }
    }
  }

  return { primaryColor, colorSource, hasDarkMode, framework };
}

// -------------------------------------------------------------
// 2. SEARCH UNDRAW API
// -------------------------------------------------------------
async function searchUndraw(query, limit = 5) {
  if (!query || query.length < 3) {
    console.error(`${colors.red}Erreur: La recherche doit comporter au moins 3 caractères.${colors.reset}`);
    return [];
  }
  const url = `${UNDRAW_API}?q=${encodeURIComponent(query)}&page=0`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 tidjan-undraw-cli',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.results || []).slice(0, limit);
  } catch (err) {
    console.error(`${colors.red}Erreur lors de la recherche unDraw:${colors.reset}`, err.message);
    return [];
  }
}

// -------------------------------------------------------------
// 3. COLORIZATION & THEME ADAPTATION (DARK / LIGHT)
// -------------------------------------------------------------
function colorizeSvg(svgContent, newColor, isDarkMode = false) {
  let content = svgContent
    .replace(/#6c63ff/gi, newColor)
    .replace(/rgb\(108\s*,\s*99\s*,\s*255\)/gi, newColor);

  // If dark mode is explicitly enabled, soften unDraw's heavy dark charcoal elements (#2f2e41 / #3f3d56)
  if (isDarkMode) {
    content = content
      .replace(/#2f2e41/gi, '#94A3B8')
      .replace(/#3f3d56/gi, '#CBD5E1');
  }

  return content;
}

// -------------------------------------------------------------
// 4. DOWNLOAD WITH ANTI-DUPLICATE CACHE
// -------------------------------------------------------------
async function downloadSvg(url, outputPath, color = null, isDarkMode = false, force = false) {
  if (fs.existsSync(outputPath) && !force) {
    return { path: outputPath, cached: true };
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download SVG: ${res.status}`);
  let content = await res.text();
  if (color) {
    content = colorizeSvg(content, color, isDarkMode);
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf8');
  return { path: outputPath, cached: false };
}

// -------------------------------------------------------------
// 5. REACT / NEXT.JS COMPONENT GENERATOR
// -------------------------------------------------------------
function generateReactComponent(slug, title, isNext = true) {
  const compName = slug
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') + 'Illustration';

  if (isNext) {
    return `import Image from 'next/image';
import React from 'react';

interface Props {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export const ${compName}: React.FC<Props> = ({
  width = 400,
  height = 300,
  className = '',
  alt = "${title} illustration",
  priority = false,
}) => (
  <div className={\`relative inline-block \${className}\`}>
    <Image
      src="/illustrations/${slug}.svg"
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className="w-full h-auto object-contain dark:brightness-110"
    />
  </div>
);

export default ${compName};
`;
  }

  return `import React from 'react';

interface Props {
  width?: number | string;
  height?: number | string;
  className?: string;
  alt?: string;
}

export const ${compName}: React.FC<Props> = ({
  width = '100%',
  height = 'auto',
  className = '',
  alt = "${title} illustration",
}) => (
  <img
    src="/illustrations/${slug}.svg"
    alt={alt}
    style={{ width, height }}
    className={\`object-contain dark:brightness-110 \${className}\`}
  />
);

export default ${compName};
`;
}

// -------------------------------------------------------------
// 6. SCORING SÉMANTIQUE CANDIDATS (SMART MATCH)
// -------------------------------------------------------------
function computeRelevanceScore(query, candidateTitle, candidateSlug) {
  const qWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const target = `${candidateTitle} ${candidateSlug}`.toLowerCase();
  let matches = 0;

  for (const w of qWords) {
    if (target.includes(w)) matches++;
  }

  // Synonym / Context boosts
  const syns = {
    '404': ['not found', 'error', 'lost', 'empty', 'missing'],
    'error': ['warning', 'failure', 'bug', 'lost', 'problem'],
    'empty': ['no data', 'void', 'search', 'folder', 'box'],
    'team': ['coworkers', 'collaboration', 'people', 'meeting', 'together'],
    'login': ['auth', 'security', 'password', 'door', 'profile'],
    'hero': ['launch', 'startup', 'rocket', 'build', 'future'],
    'success': ['done', 'celebration', 'winner', 'trophy', 'check'],
  };

  for (const [key, list] of Object.entries(syns)) {
    if (query.toLowerCase().includes(key)) {
      for (const s of list) {
        if (target.includes(s)) matches += 1.5;
      }
    }
  }

  const base = Math.min(99, Math.round((matches / (qWords.length || 1)) * 50) + 40);
  return Math.max(45, base);
}

// -------------------------------------------------------------
// COMMAND HANDLERS
// -------------------------------------------------------------

// Command: smart (Flagship feature)
async function handleSmart() {
  const query = args[1] || 'page not found';
  const force = args.includes('--force');
  const customColor = args.find((a, i) => args[i - 1] === '--color');
  const forceDark = args.includes('--dark');

  banner();
  console.log(`${colors.magenta}${colors.bold}🧠 [Smart Match]${colors.reset} Analyse du contexte visuel et sémantique...`);

  const ctx = detectProjectContext();
  const primary = customColor || ctx.primaryColor;
  const isDark = forceDark || ctx.hasDarkMode;

  console.log(`\n${colors.bold}📊 Diagnostic du Projet :${colors.reset}`);
  console.log(`  ${colors.gray}├── Framework :${colors.reset} ${colors.cyan}${ctx.framework}${colors.reset}`);
  console.log(`  ${colors.gray}├── Palette   :${colors.reset} ${colors.green}${primary}${colors.reset} ${colors.gray}(détecté via ${ctx.colorSource})${colors.reset}`);
  console.log(`  ${colors.gray}└── Thème     :${colors.reset} ${isDark ? colors.magenta + 'Dark Mode Adaptatif' : colors.blue + 'Standard Light'}${colors.reset}\n`);

  console.log(`🔍 ${colors.bold}Recherche de candidats unDraw pour :${colors.reset} "${colors.yellow}${query}${colors.reset}"...`);
  const candidates = await searchUndraw(query, 5);

  if (candidates.length === 0) {
    console.log(`${colors.red}Aucune illustration trouvée pour "${query}".${colors.reset}`);
    return;
  }

  // Score candidates
  const scored = candidates.map((c) => ({
    ...c,
    score: computeRelevanceScore(query, c.title, c.newSlug),
  })).sort((a, b) => b.score - a.score);

  console.log(`\n${colors.bold}🎯 Candidats évalués :${colors.reset}`);
  scored.forEach((s, idx) => {
    const isWinner = idx === 0;
    const badge = isWinner ? `${colors.green}[RECOMMANDÉ - Score ${s.score}%]${colors.reset}` : `${colors.gray}[Score ${s.score}%]${colors.reset}`;
    console.log(`  ${idx + 1}. ${isWinner ? colors.bold : ''}${s.title}${colors.reset} ${badge}`);
    console.log(`     Slug : ${colors.cyan}${s.newSlug}${colors.reset}`);
  });

  // Pick winner
  const winner = scored[0];
  console.log(`\n${colors.bold}✨ Sélection retenue :${colors.reset} ${colors.green}${colors.bold}${winner.title}${colors.reset} (${winner.newSlug})`);

  // Download with anti-duplicate
  const outDir = path.join(process.cwd(), 'public', 'illustrations');
  const targetPath = path.join(outDir, `${winner.newSlug}.svg`);

  try {
    const dl = await downloadSvg(winner.media, targetPath, primary, isDark, force);
    if (dl.cached) {
      console.log(`  ${colors.yellow}✔ [Anti-doublon] SVG déjà en cache local :${colors.reset} ${targetPath}`);
    } else {
      console.log(`  ${colors.green}✔ SVG téléchargé & colorisé :${colors.reset} ${targetPath}`);
    }

    // Generate component
    const compDir = path.join(process.cwd(), 'components', 'illustrations');
    fs.mkdirSync(compDir, { recursive: true });
    const isNext = ctx.framework.includes('Next');
    const compCode = generateReactComponent(winner.newSlug, winner.title, isNext);
    const compName = winner.newSlug
      .split(/[-_]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('') + 'Illustration';
    const compPath = path.join(compDir, `${compName}.tsx`);
    fs.writeFileSync(compPath, compCode, 'utf8');

    console.log(`  ${colors.green}✔ Composant React généré :${colors.reset} ${compPath}\n`);
    console.log(`${colors.bold}${colors.green}🎉 Terminé !${colors.reset} Importez-le dans votre page :`);
    console.log(`${colors.cyan}import { ${compName} } from '@/components/illustrations/${compName}';${colors.reset}\n`);
  } catch (err) {
    console.error(`${colors.red}Erreur :${colors.reset}`, err.message);
  }
}

// Command: install
async function handleInstall() {
  banner();
  console.log(`${colors.bold}🔍 Détection des environnements IA...${colors.reset}\n`);

  let installedCount = 0;
  const homeDir = os.homedir();

  // 1. Google Antigravity (Global)
  const antigravityGlobal = path.join(homeDir, '.gemini', 'config', 'plugins', 'undraw');
  try {
    copyRecursiveSync(PKG_ROOT, antigravityGlobal);
    console.log(`${colors.green}✔ Google Antigravity (Global)${colors.reset} : Installé dans ${colors.cyan}${antigravityGlobal}${colors.reset}`);
    installedCount++;
  } catch (err) {
    console.log(`${colors.yellow}⚠ Antigravity Global non configuré : ${err.message}${colors.reset}`);
  }

  // 2. Claude Code (Global si ~/.claude existe)
  const claudeDir = path.join(homeDir, '.claude');
  if (fs.existsSync(claudeDir)) {
    const claudePluginDir = path.join(claudeDir, 'plugins', 'tidjan-undraw');
    try {
      copyRecursiveSync(PKG_ROOT, claudePluginDir);
      console.log(`${colors.green}✔ Claude Code (Global)${colors.reset} : Installé dans ${colors.cyan}${claudePluginDir}${colors.reset}`);
      installedCount++;
    } catch (err) {}
  }

  // 3. Projet local courant (si dans un projet git ou node)
  const cwd = process.cwd();
  if (path.resolve(cwd) !== path.resolve(PKG_ROOT)) {
    if (fs.existsSync(path.join(cwd, 'package.json')) || fs.existsSync(path.join(cwd, '.git'))) {
      const agentDir = path.join(cwd, '.agents', 'plugins', 'tidjan-undraw');
      try {
        copyRecursiveSync(PKG_ROOT, agentDir);
        console.log(`${colors.green}✔ Projet local (.agents)${colors.reset} : Installé dans ${colors.cyan}.agents/plugins/tidjan-undraw${colors.reset}`);
        installedCount++;
      } catch (err) {}

      const cursorRulesSrc = path.join(PKG_ROOT, '.cursorrules');
      const cursorRulesDest = path.join(cwd, '.cursorrules');
      if (!fs.existsSync(cursorRulesDest) && fs.existsSync(cursorRulesSrc)) {
        fs.copyFileSync(cursorRulesSrc, cursorRulesDest);
        console.log(`${colors.green}✔ Cursor / Windsurf${colors.reset} : Règle ${colors.cyan}.cursorrules${colors.reset} ajoutée au projet`);
      }
    }
  }

  console.log(`\n${colors.bold}${colors.green}🎉 Installation terminée avec succès ! (${installedCount} environnements configurés)${colors.reset}\n`);
  console.log(`Votre agent IA sait désormais :
  • Analyser automatiquement la palette Tailwind / CSS de votre projet
  • Choisir et noter les meilleures illustrations candidates (Smart Match)
  • Éviter les téléchargements de doublons
  • Générer des composants React / Next.js prêts à l'emploi avec Dark Mode\n`);
}

// Command: search
async function handleSearch() {
  const query = args[1];
  if (!query) {
    console.log(`Usage: npx tidjan-undraw search <keyword>`);
    return;
  }
  banner();
  console.log(`🔍 Recherche sur unDraw.co pour "${colors.bold}${query}${colors.reset}"...\n`);
  const results = await searchUndraw(query, 10);
  if (results.length === 0) {
    console.log(`${colors.yellow}Aucune illustration trouvée pour "${query}".${colors.reset}`);
    return;
  }
  results.forEach((r, idx) => {
    console.log(`  ${colors.green}${idx + 1}.${colors.reset} ${colors.bold}${r.title}${colors.reset}`);
    console.log(`     Slug : ${colors.cyan}${r.newSlug}${colors.reset}`);
    console.log(`     SVG  : ${r.media}\n`);
  });
}

// Command: download
async function handleDownload() {
  const query = args[1];
  const outDir = args[2] || './public/illustrations';
  const customColor = args[3] || null;
  const force = args.includes('--force');

  if (!query) {
    console.log(`Usage: npx tidjan-undraw download <keyword> [output_dir] [hex_color] [--force]`);
    return;
  }
  banner();
  console.log(`⬇️ Recherche et téléchargement pour "${query}"...`);
  const results = await searchUndraw(query, 1);
  if (results.length === 0) {
    console.log(`${colors.yellow}Aucune illustration trouvée.${colors.reset}`);
    return;
  }
  const item = results[0];
  const filename = `${item.newSlug}.svg`;
  const target = path.join(outDir, filename);

  // Auto-detect project color if not provided
  const ctx = detectProjectContext();
  const color = customColor || ctx.primaryColor;

  try {
    const dl = await downloadSvg(item.media, target, color, ctx.hasDarkMode, force);
    if (dl.cached) {
      console.log(`${colors.yellow}✔ [Anti-doublon] SVG déjà en cache local :${colors.reset} ${target}`);
      console.log(`  (Utilisez --force pour forcer le retéléchargement)`);
    } else {
      console.log(`${colors.green}✔ SVG téléchargé :${colors.reset} ${target}`);
      console.log(`${colors.green}✔ Couleur appliquée :${colors.reset} ${color} ${colors.gray}(${ctx.colorSource})${colors.reset}`);
    }
  } catch (err) {
    console.error(`${colors.red}Erreur :${colors.reset}`, err.message);
  }
}

// Router
switch (command) {
  case 'smart':
  case 'match':
    handleSmart();
    break;
  case 'search':
    handleSearch();
    break;
  case 'download':
  case 'get':
    handleDownload();
    break;
  case 'install':
  default:
    handleInstall();
    break;
}
