#!/usr/bin/env node

/**
 * tdj-undraw — Universal unDraw SVG Plugin & CLI for AI Coding Agents
 * Author: Tidjan Sow (https://github.com/Tidjan-NEMSIS)
 * License: MIT
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_ROOT = path.resolve(__dirname, '..');
const UNDRAW_API = 'https://undraw.co/api/search';

const args = process.argv.slice(2);
const command = args[0] || 'install';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function banner() {
  console.log(`
${colors.magenta}${colors.bold}🎨 tdj-undraw${colors.reset} — ${colors.cyan}Universal unDraw SVG Plugin for AI Coding Agents${colors.reset}
${colors.blue}Google Antigravity • Claude Code • Cursor • DeepSeek IDE${colors.reset}
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

async function searchUndraw(query, limit = 5) {
  if (!query || query.length < 3) {
    console.error(`${colors.red}Erreur: La recherche doit comporter au moins 3 caractères.${colors.reset}`);
    return [];
  }
  const url = `${UNDRAW_API}?q=${encodeURIComponent(query)}&page=0`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 tdj-undraw-cli',
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

function colorizeSvg(svgContent, newColor) {
  return svgContent
    .replace(/#6c63ff/gi, newColor)
    .replace(/rgb\(108\s*,\s*99\s*,\s*255\)/gi, newColor);
}

async function downloadSvg(url, outputPath, color = null) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download SVG: ${res.status}`);
  let content = await res.text();
  if (color) {
    content = colorizeSvg(content, color);
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf8');
  return outputPath;
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
    const claudePluginDir = path.join(claudeDir, 'plugins', 'tdj-undraw');
    try {
      copyRecursiveSync(PKG_ROOT, claudePluginDir);
      console.log(`${colors.green}✔ Claude Code (Global)${colors.reset} : Installé dans ${colors.cyan}${claudePluginDir}${colors.reset}`);
      installedCount++;
    } catch (err) {}
  }

  // 3. Projet local courant (si dans un projet git ou node)
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, 'package.json')) || fs.existsSync(path.join(cwd, '.git'))) {
    // Project .agents rules
    const agentDir = path.join(cwd, '.agents', 'plugins', 'tdj-undraw');
    try {
      copyRecursiveSync(PKG_ROOT, agentDir);
      console.log(`${colors.green}✔ Projet local (.agents)${colors.reset} : Installé dans ${colors.cyan}.agents/plugins/tdj-undraw${colors.reset}`);
      installedCount++;
    } catch (err) {}

    // .cursorrules for Cursor / Windsurf
    const cursorRulesSrc = path.join(PKG_ROOT, '.cursorrules');
    const cursorRulesDest = path.join(cwd, '.cursorrules');
    if (!fs.existsSync(cursorRulesDest) && fs.existsSync(cursorRulesSrc)) {
      fs.copyFileSync(cursorRulesSrc, cursorRulesDest);
      console.log(`${colors.green}✔ Cursor / Windsurf${colors.reset} : Règle ${colors.cyan}.cursorrules${colors.reset} ajoutée au projet`);
    }
  }

  console.log(`\n${colors.bold}${colors.green}🎉 Installation terminée avec succès ! (${installedCount} environnements configurés)${colors.reset}\n`);
  console.log(`Votre agent IA (Antigravity, Claude, Cursor) sait désormais :
  • Détecter automatiquement quand vous avez besoin d'une illustration
  • Télécharger le SVG officiel sur unDraw.co
  • Appliquer la couleur primaire de votre marque
  • Générer le composant React / Next.js / Vue / Flutter adapté\n`);
}

// Command: search
async function handleSearch() {
  const query = args[1];
  if (!query) {
    console.log(`Usage: npx tdj-undraw search <keyword>`);
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
  const color = args[3] || null;

  if (!query) {
    console.log(`Usage: npx tdj-undraw download <keyword> [output_dir] [hex_color]`);
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

  try {
    await downloadSvg(item.media, target, color);
    console.log(`${colors.green}✔ SVG téléchargé :${colors.reset} ${target}`);
    if (color) console.log(`${colors.green}✔ Couleur appliquée :${colors.reset} ${color}`);
  } catch (err) {
    console.error(`${colors.red}Erreur :${colors.reset}`, err.message);
  }
}

// Router
switch (command) {
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
