/**
 * Semantic Context Analysis and Search Engine
 * Analyzes component context, intent, mood, styling, and framework without requiring external LLM APIs.
 * @module core/search-engine
 */

const fs = require('fs');
const path = require('path');
const { registry } = require('./registry');
const { ScoringEngine } = require('./scoring-engine');

// Context rules and taxonomy
function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const COMPONENT_PATTERNS = {
  'auth': ['login', 'connexion', 'signin', 'sign-in', 'signup', 'register', 'auth', 'password', 'se connecter', 'mot de passe', 'security', 'authentification'],
  '404': ['404', 'not found', 'introuvable', 'perdu', 'lost', 'page not found', 'missing'],
  'error': ['error', 'erreur', 'fail', 'failure', 'warning', 'bug', 'panne', 'server error', '500'],
  'empty-state': ['empty', 'vide', 'aucun', 'no data', 'no results', '0 resultat', 'inbox', 'blank'],
  'hero': ['hero', 'landing', 'welcome', 'bienvenue', 'home', 'vitrine', 'presentation', 'pitch'],
  'onboarding': ['onboarding', 'tour', 'guide', 'tutoriel', 'intro', 'demarrage', 'wizard', 'step'],
  'dashboard': ['dashboard', 'tableau de bord', 'analytics', 'stats', 'statistiques', 'charts', 'kpi'],
  'checkout': ['checkout', 'paiement', 'payment', 'cart', 'panier', 'achat', 'order', 'commande', 'billing'],
  'team': ['team', 'equipe', 'collaborateurs', 'about', 'a propos', 'coworkers', 'people', 'meeting'],
};

const DOMAIN_PATTERNS = {
  'fintech': ['banque', 'bancaire', 'bank', 'argent', 'money', 'crypto', 'finance', 'financier', 'paiement', 'bourse', 'comptabilite'],
  'healthcare': ['sante', 'health', 'medical', 'docteur', 'medecin', 'hopital', 'soin'],
  'devops': ['cloud', 'serveur', 'server', 'docker', 'kubernetes', 'code', 'database', 'deploiement', 'api'],
  'ecommerce': ['boutique', 'shop', 'ecommerce', 'produit', 'article', 'livraison', 'panier'],
  'education': ['ecole', 'formation', 'cours', 'apprendre', 'student', 'eleve', 'education', 'learning'],
};

const MOOD_PATTERNS = {
  'professional': ['pro', 'corporate', 'entreprise', 'serieux', 'rassurant', 'bancaire', 'finance'],
  'playful': ['fun', 'sympa', 'ludique', 'jeu', 'cool', 'amical', 'decontracte'],
  'minimalist': ['minimaliste', 'clean', 'simple', 'sobre', 'epure'],
  'tech': ['technique', 'dev', 'geek', 'terminal', 'cyber', 'futuriste'],
};

class SearchEngine {
  /**
   * Automatically inspect project codebase to build rich contextual profile
   * @param {string} [cwd=process.cwd()]
   * @param {string} [prompt='']
   * @returns {import('./types').ProjectContext}
   */
  static inspectProject(cwd = process.cwd(), prompt = '') {
    let framework = 'html';
    let primaryColor = '#6C63FF';
    let colorSource = 'default';
    let hasDarkMode = false;

    // 1. Detect Framework
    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['next']) {
          const hasAppDir = fs.existsSync(path.join(cwd, 'app')) || fs.existsSync(path.join(cwd, 'src', 'app'));
          framework = hasAppDir ? 'nextjs' : 'nextjs-pages';
        } else if (deps['react']) {
          framework = 'react';
        } else if (deps['vue'] || deps['nuxt']) {
          framework = 'vue';
        } else if (deps['svelte']) {
          framework = 'svelte';
        }
      } catch (_) {}
    } else if (fs.existsSync(path.join(cwd, 'pubspec.yaml'))) {
      framework = 'flutter';
    }

    // 2. Detect Color Palette
    const tailwindFiles = ['tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.mjs', 'tailwind.config.cjs'];
    for (const f of tailwindFiles) {
      const fullPath = path.join(cwd, f);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (/darkMode|'class'|"class"/i.test(content)) hasDarkMode = true;
        const hex = content.match(/primary['"]?\s*:\s*['"](#[0-9a-fA-F]{6})['"]/i)
          || content.match(/brand['"]?\s*:\s*['"](#[0-9a-fA-F]{6})['"]/i)
          || content.match(/['"]primary['"]?\s*:\s*\{[^}]*['"]DEFAULT['"]?\s*:\s*['"](#[0-9a-fA-F]{6})['"]/i);
        if (hex && hex[1]) {
          primaryColor = hex[1].toUpperCase();
          colorSource = `${f} (Tailwind)`;
          break;
        }
      }
    }

    if (colorSource === 'default') {
      const cssCandidates = ['app/globals.css', 'src/app/globals.css', 'styles/globals.css', 'src/index.css'];
      for (const f of cssCandidates) {
        const full = path.join(cwd, f);
        if (fs.existsSync(full)) {
          const css = fs.readFileSync(full, 'utf8');
          if (css.includes('.dark') || css.includes('@media (prefers-color-scheme: dark)')) hasDarkMode = true;
          const match = css.match(/--(?:primary|brand|color-primary)\s*:\s*(#[0-9a-fA-F]{6})/i);
          if (match && match[1]) {
            primaryColor = match[1].toUpperCase();
            colorSource = `${f} (CSS variable)`;
            break;
          }
        }
      }
    }

    // 3. Infer Component, Mood & Tone from prompt
    const pNorm = normalizeText(prompt);
    let detectedComponent = 'general';
    for (const [comp, patterns] of Object.entries(COMPONENT_PATTERNS)) {
      if (patterns.some((w) => pNorm.includes(normalizeText(w)))) {
        detectedComponent = comp;
        break;
      }
    }

    let detectedMood = 'professional';
    for (const [mood, patterns] of Object.entries(MOOD_PATTERNS)) {
      if (patterns.some((w) => pNorm.includes(normalizeText(w)))) {
        detectedMood = mood;
        break;
      }
    }

    let detectedDomain = 'general';
    for (const [dom, patterns] of Object.entries(DOMAIN_PATTERNS)) {
      if (patterns.some((w) => pNorm.includes(normalizeText(w)))) {
        detectedDomain = dom;
        break;
      }
    }

    // Determine style recommendation
    let style = 'flat';
    if (detectedComponent === 'team' || detectedComponent === 'onboarding' || detectedMood === 'playful') {
      style = 'avatar';
    } else if (detectedDomain === 'fintech' || detectedDomain === 'devops' || detectedMood === 'tech') {
      style = 'gradient';
    }

    return {
      component: detectedComponent,
      mood: detectedMood,
      style,
      framework,
      theme: hasDarkMode ? 'dark' : 'light',
      primaryColor,
      colorSource,
    };
  }

  /**
   * Search across all registered and approved providers with semantic scoring
   * @param {import('./types').IllustrationQuery} query
   * @param {Object} [options]
   * @param {string} [options.cwd]
   * @param {boolean} [options.includeManual=false]
   * @returns {Promise<import('./types').IllustrationResult[]>}
   */
  static async search(query, options = {}) {
    const cwd = options.cwd || process.cwd();
    const context = query.context || this.inspectProject(cwd, query.prompt);
    const enrichedQuery = {
      ...query,
      context,
      limit: query.limit || 5,
    };

    // Filter providers
    const targetProviders = registry.list({ enabledOnly: true }).filter((p) => {
      if (query.providerIds && query.providerIds.length > 0) {
        return query.providerIds.includes(p.id);
      }
      if (!options.includeManual && p.status === 'manual_only') {
        return false;
      }
      return true;
    });

    // Run parallel searches with safe error isolation
    const searchPromises = targetProviders.map(async (provider) => {
      try {
        const results = await provider.search(enrichedQuery);
        return Array.isArray(results) ? results : [];
      } catch (err) {
        return [];
      }
    });

    const nestedResults = await Promise.all(searchPromises);
    const allResults = nestedResults.flat();

    // Score and rank results
    return ScoringEngine.rank(allResults, enrichedQuery, context);
  }
}

module.exports = {
  SearchEngine,
  COMPONENT_PATTERNS,
  DOMAIN_PATTERNS,
  MOOD_PATTERNS,
};
