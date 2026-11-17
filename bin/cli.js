#!/usr/bin/env node

/**
 * tidjan-undraw — Universal Multi-Provider SVG Illustration Platform & CLI for AI Coding Agents
 * Author: Tidjan Sow (https://github.com/Tidjan-NEMSIS)
 * Version: 2.0.0 (Multi-Provider, Semantic Scoring, Multi-Framework, Anti-Duplicate & Dark Mode)
 * License: MIT
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  registry,
  searchIllustrations,
  downloadIllustration,
  customizeIllustration,
  integrateIllustration,
  getProviders,
  auditLicenses,
  SearchEngine,
  IntegrationEngine,
} = require('../src/index');

const PKG_ROOT = path.resolve(__dirname, '..');
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
${colors.magenta}${colors.bold}🎯 Autopic v2.0.0${colors.reset} (${colors.yellow}tidjan-autopic${colors.reset}) — ${colors.cyan}Intelligent Multi-Provider Illustration Platform for AI Agents${colors.reset}
${colors.gray}Providers: unDraw (Approved) • Open Peeps (CC0) • IRA Design (MIT) • Storyset • DrawKit • ManyPixels${colors.reset}
${colors.gray}Compatible: Google Antigravity • Claude Code • Cursor • Windsurf • DeepSeek IDE${colors.reset}
`);
}

function copyRecursiveSync(src, dest) {
  const srcResolved = path.resolve(src);
  const destResolved = path.resolve(dest);
  if (destResolved.startsWith(srcResolved + path.sep)) return;

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

function getNamedArg(flag, alias) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag || (alias && args[i] === alias)) {
      return args[i + 1] && !args[i + 1].startsWith('-') ? args[i + 1] : true;
    }
    if (args[i].startsWith(`${flag}=`)) {
      return args[i].slice(flag.length + 1);
    }
  }
  return null;
}

// -------------------------------------------------------------
// 1. COMMAND: SMART MATCH (Flagship Feature)
// -------------------------------------------------------------
async function handleSmart() {
  const rawQuery = args[1] && !args[1].startsWith('-') ? args[1] : 'page not found';
  const query = rawQuery.replace(/^<+|>+$/g, '').trim() || 'page not found';
  const force = args.includes('--force');
  const customColor = getNamedArg('--color', '-c');
  const forceDark = args.includes('--dark');
  const requestedProvider = getNamedArg('--provider', '-p');
  const targetFramework = getNamedArg('--framework', '-f');
  const jsonMode = args.includes('--json');

  if (!jsonMode) banner();

  const cwd = process.cwd();
  const ctx = SearchEngine.inspectProject(cwd, query);
  const primary = customColor || ctx.primaryColor || '#6C63FF';
  const isDark = forceDark || ctx.theme === 'dark';
  const framework = targetFramework || ctx.framework;

  if (!jsonMode) {
    console.log(`${colors.magenta}${colors.bold}🧠 [Smart Match]${colors.reset} Analyse du contexte visuel et sémantique...`);
    console.log(`\n${colors.bold}📊 Diagnostic du Projet :${colors.reset}`);
    console.log(`  ${colors.gray}├── Framework :${colors.reset} ${colors.cyan}${framework}${colors.reset}`);
    console.log(`  ${colors.gray}├── Composant :${colors.reset} ${colors.blue}${ctx.component}${colors.reset}`);
    console.log(`  ${colors.gray}├── Mood      :${colors.reset} ${colors.blue}${ctx.mood}${colors.reset}`);
    console.log(`  ${colors.gray}├── Style     :${colors.reset} ${colors.blue}${ctx.style}${colors.reset}`);
    console.log(`  ${colors.gray}├── Palette   :${colors.reset} ${colors.green}${primary}${colors.reset} ${colors.gray}(détecté via ${ctx.colorSource})${colors.reset}`);
    console.log(`  ${colors.gray}└── Thème     :${colors.reset} ${isDark ? colors.magenta + 'Dark Mode Adaptatif' : colors.blue + 'Standard Light'}${colors.reset}\n`);

    console.log(`🔍 ${colors.bold}Recherche de candidats multi-fournisseurs pour :${colors.reset} "${colors.yellow}${query}${colors.reset}"...`);
  }

  const providerFilter = requestedProvider ? [requestedProvider.toLowerCase()] : ['undraw', 'openpeeps', 'iradesign'];
  const candidates = await searchIllustrations(query, {
    providers: providerFilter,
    cwd,
    limit: 6,
  });

  if (candidates.length === 0) {
    if (jsonMode) {
      console.log(JSON.stringify({ error: `No illustrations found for "${query}"`, candidates: [] }));
    } else {
      console.log(`${colors.red}Aucune illustration trouvée pour "${query}".${colors.reset}`);
    }
    return;
  }

  if (jsonMode) {
    console.log(JSON.stringify({ query, context: ctx, candidates }, null, 2));
    return;
  }

  console.log(`\n${colors.bold}🎯 Candidats multi-fournisseurs évalués :${colors.reset}`);
  candidates.forEach((c, idx) => {
    const isWinner = idx === 0;
    const scoreVal = c.score || c.relevanceScore || 50;
    const badge = isWinner
      ? `${colors.green}[RECOMMANDÉ - Score ${scoreVal}/100]${colors.reset}`
      : `${colors.gray}[Score ${scoreVal}/100]${colors.reset}`;
    const pTag = `${colors.magenta}[${c.providerName || c.providerId || 'Provider'}]${colors.reset}`;

    console.log(`  ${idx + 1}. ${isWinner ? colors.bold : ''}${c.title}${colors.reset} ${pTag} ${badge}`);
    console.log(`     Slug : ${colors.cyan}${c.slug}${colors.reset}`);
    if (c.scoreBreakdown) {
      const b = c.scoreBreakdown;
      console.log(`     ${colors.gray}Détails: Sémantique:${b.semantic}/30 • Comp:${b.component}/25 • Style:${b.style}/15 • Couleur:${b.color}/10 • Licence:${b.license}/10${colors.reset}`);
    }
  });

  // Winner selection
  const winner = candidates[0];
  console.log(`\n${colors.bold}✨ Sélection retenue :${colors.reset} ${colors.green}${colors.bold}${winner.title}${colors.reset} (${winner.slug})`);

  try {
    const integrateRes = await integrateIllustration({
      providerId: winner.providerId,
      id: winner.id,
      slug: winner.slug,
      title: winner.title,
      url: winner.svgUrl || winner.media,
      framework,
      cwd,
      primaryColor: primary,
      isDarkMode: isDark,
      force,
    });

    if (integrateRes.svgResult.existed && !force) {
      console.log(`  ${colors.yellow}✔ [Anti-doublon] SVG déjà présent localement :${colors.reset} ${integrateRes.svgResult.path}`);
      console.log(`    ${colors.gray}(utilisez --force pour forcer la réécriture)${colors.reset}`);
    } else {
      console.log(`  ${colors.green}✔ SVG téléchargé & personnalisé :${colors.reset} ${integrateRes.svgResult.path}`);
    }

    console.log(`  ${colors.green}✔ Composant ${framework.toUpperCase()} généré :${colors.reset} ${integrateRes.componentResult.path}\n`);

    if (integrateRes.attribution && integrateRes.attribution.required) {
      console.log(`  ${colors.yellow}⚖ Mention légale obligatoire :${colors.reset} ${integrateRes.attribution.notice}`);
    }

    console.log(`${colors.bold}${colors.green}🎉 Terminé !${colors.reset} Intégrez le composant dans votre interface :`);
    if (framework === 'next' || framework === 'react') {
      console.log(`${colors.cyan}import { ${integrateRes.compName} } from '@/components/illustrations/${integrateRes.compName}';${colors.reset}\n`);
    } else if (framework === 'vue') {
      console.log(`${colors.cyan}import ${integrateRes.compName} from '@/components/illustrations/${integrateRes.compName}.vue';${colors.reset}\n`);
    } else if (framework === 'svelte') {
      console.log(`${colors.cyan}import ${integrateRes.compName} from '$lib/illustrations/${integrateRes.compName}.svelte';${colors.reset}\n`);
    } else if (framework === 'flutter') {
      console.log(`${colors.cyan}import 'package:your_app/widgets/illustrations/${integrateRes.compName}.dart';${colors.reset}\n`);
    }
  } catch (err) {
    console.error(`${colors.red}Erreur d'intégration :${colors.reset}`, err.message);
  }
}

// -------------------------------------------------------------
// 2. COMMAND: SEARCH
// -------------------------------------------------------------
async function handleSearch() {
  const rawQuery = args[1] && !args[1].startsWith('-') ? args[1] : null;
  const query = rawQuery ? rawQuery.replace(/^<+|>+$/g, '').trim() : null;
  const jsonMode = args.includes('--json');
  const requestedProvider = getNamedArg('--provider', '-p');

  if (!query) {
    console.log(`Usage: npx tidjan-undraw search <keyword> [--provider <id>] [--json]`);
    return;
  }

  if (!jsonMode) banner();

  const providerFilter = requestedProvider ? [requestedProvider.toLowerCase()] : ['undraw', 'openpeeps', 'iradesign'];
  const results = await searchIllustrations(query, {
    providers: providerFilter,
    limit: 10,
  });

  if (jsonMode) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log(`🔍 Résultats pour "${colors.bold}${query}${colors.reset}" :\n`);
  if (results.length === 0) {
    console.log(`${colors.yellow}Aucune illustration trouvée pour "${query}".${colors.reset}`);
    return;
  }

  results.forEach((r, idx) => {
    const pTag = `${colors.magenta}[${r.providerName || r.providerId}]${colors.reset}`;
    console.log(`  ${colors.green}${idx + 1}.${colors.reset} ${colors.bold}${r.title}${colors.reset} ${pTag}`);
    console.log(`     Slug : ${colors.cyan}${r.slug}${colors.reset}`);
    console.log(`     ID   : ${r.id}`);
    console.log(`     Score: ${r.score || r.relevanceScore || 50}/100\n`);
  });
}

// -------------------------------------------------------------
// 3. COMMAND: DOWNLOAD
// -------------------------------------------------------------
async function handleDownload() {
  const rawTarget = args[1] && !args[1].startsWith('-') ? args[1] : null;
  const queryOrId = rawTarget ? rawTarget.replace(/^<+|>+$/g, '').trim() : null;
  const outDir = args[2] && !args[2].startsWith('-') ? args[2] : './public/illustrations';
  const customColor = getNamedArg('--color', '-c');
  const requestedProvider = getNamedArg('--provider', '-p') || 'undraw';
  const force = args.includes('--force');

  if (!queryOrId) {
    console.log(`Usage: npx tidjan-undraw download <keyword|id> [output_dir] [--color <hex>] [--provider <id>] [--force]`);
    return;
  }

  banner();
  console.log(`⬇️ Téléchargement pour "${queryOrId}" (Provider: ${requestedProvider})...`);

  try {
    const results = await searchIllustrations(queryOrId, {
      providers: [requestedProvider],
      limit: 1,
    });

    if (results.length === 0) {
      console.log(`${colors.yellow}Aucune illustration trouvée.${colors.reset}`);
      return;
    }

    const item = results[0];
    const ctx = SearchEngine.inspectProject(process.cwd(), queryOrId);
    const color = customColor || ctx.primaryColor;

    const asset = await downloadIllustration(item.providerId, item.id, {
      primaryColor: color,
      isDarkMode: ctx.theme === 'dark',
    });

    const target = path.join(outDir, `${item.slug}.svg`);
    const writeRes = IntegrationEngine.writeFileSafe(target, asset.content, { force });

    if (writeRes.existed && !force) {
      console.log(`${colors.yellow}✔ [Anti-doublon] SVG déjà en cache local :${colors.reset} ${target}`);
      console.log(`  (Utilisez --force pour forcer le retéléchargement)`);
    } else {
      console.log(`${colors.green}✔ SVG sauvegardé :${colors.reset} ${target}`);
      console.log(`${colors.green}✔ Couleur appliquée :${colors.reset} ${color}`);
    }
  } catch (err) {
    console.error(`${colors.red}Erreur :${colors.reset}`, err.message);
  }
}

// -------------------------------------------------------------
// 4. COMMAND: PROVIDERS
// -------------------------------------------------------------
function handleProviders() {
  const jsonMode = args.includes('--json');
  const providers = getProviders();

  if (jsonMode) {
    console.log(JSON.stringify(providers.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      license: p.license,
      capabilities: p.getCapabilities(),
    })), null, 2));
    return;
  }

  banner();
  console.log(`${colors.bold}📦 Fournisseurs d'illustrations enregistrés :${colors.reset}\n`);

  providers.forEach((p) => {
    const isApproved = p.status === 'approved';
    const statusBadge = isApproved
      ? `${colors.green}[Automatisable - Approved]${colors.reset}`
      : `${colors.yellow}[Manuel Uniquement - Compliant]${colors.reset}`;

    console.log(`  ${colors.bold}${p.name}${colors.reset} (${colors.cyan}${p.id}${colors.reset}) ${statusBadge}`);
    console.log(`    Licence     : ${p.license.name} (${p.license.type})`);
    console.log(`    Attribution : ${p.license.attributionRequired ? colors.yellow + 'Requise' : colors.green + 'Optionnelle'}${colors.reset}`);
    const caps = p.getCapabilities();
    const capList = [
      caps.search ? 'Recherche API' : null,
      caps.download ? 'Téléchargement direct' : null,
      caps.colorCustomization ? 'Colorisation SVG' : null,
      caps.gradientCustomization ? 'Dégradés' : null,
      caps.componentComposition ? 'Composition modulaire' : null,
    ].filter(Boolean).join(', ');
    console.log(`    Capacités   : ${colors.gray}${capList}${colors.reset}\n`);
  });
}

// -------------------------------------------------------------
// 5. COMMAND: AUDIT (Legal Compliance)
// -------------------------------------------------------------
function handleAudit() {
  const jsonMode = args.includes('--json');
  const audits = auditLicenses();

  if (jsonMode) {
    console.log(JSON.stringify(audits, null, 2));
    return;
  }

  banner();
  console.log(`${colors.bold}⚖️ Audit de conformité légale et droits d'utilisation :${colors.reset}\n`);

  audits.forEach((a) => {
    const icon = a.status === 'approved' ? `${colors.green}✔` : `${colors.yellow}ℹ`;
    console.log(`  ${icon} ${colors.bold}${a.name}${colors.reset} [${a.status.toUpperCase()}]`);
    console.log(`     Licence        : ${a.license}`);
    console.log(`     Download Auto  : ${a.automatedDownloadAllowed ? colors.green + 'AUTORISÉ' : colors.red + 'INTERDIT (Manuel)'}${colors.reset}`);
    console.log(`     Attribution    : ${a.attributionRequired ? colors.yellow + 'OBLIGATOIRE' : colors.green + 'NON REQUISE'}${colors.reset}`);
    console.log(`     URL officielle : ${colors.cyan}${a.url}${colors.reset}\n`);
  });
}

// -------------------------------------------------------------
// 6. COMMAND: INSTALL (IDE plugins & skills)
// -------------------------------------------------------------
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

  // 3. Projet local courant
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
  • Rechercher sur unDraw, Open Peeps, IRA Design avec scoring sémantique
  • Respecter la conformité légale et les licences (Storyset, DrawKit, ManyPixels)
  • Analyser automatiquement la palette Tailwind / CSS de votre projet
  • Éviter les téléchargements de doublons
  • Générer des composants React, Next.js, Vue 3, Svelte, Flutter prêts à l'emploi\n`);
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
  case 'providers':
  case '--list-providers':
    handleProviders();
    break;
  case 'audit':
  case '--audit-licenses':
    handleAudit();
    break;
  case 'install':
  default:
    handleInstall();
    break;
}
