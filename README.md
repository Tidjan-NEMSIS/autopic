<div align="center">

# 🎯 Autopik v2.0

**Intelligent Multi-Provider Illustration Platform & CLI for AI Coding Agents**  
*Google Antigravity IDE • Claude Code • Cursor • Windsurf • DeepSeek IDE*

[![npm version](https://img.shields.io/npm/v/tidjan-autopik.svg?style=for-the-badge&color=CB3837&logo=npm)](https://www.npmjs.com/package/tidjan-autopik)
[![Tests Passing](https://img.shields.io/badge/Tests-40%2F40%20Pass-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20External-blue?style=for-the-badge)](package.json)
[![Antigravity](https://img.shields.io/badge/Antigravity-v2.0_Ready-6C63FF?style=for-the-badge&logo=google)](https://antigravity.google)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br/>

<!-- ANIMATED DEMO MOCKUP -->
<img src="assets/demo.svg" alt="Autopik Multi-Provider Smart Match Demo" width="100%" />

</div>

---

## ⚡ Quick Start (1 commande universelle)

Installe et configure automatiquement **Autopik** pour **tous vos IDE** :

```bash
npx tidjan-autopik
```

*(Ou via l'alias court : `npx autopik`)*

---

## 🚀 Pourquoi Autopik ?

**Autopik** (« Auto-Pick ») est un **moteur intelligent, modulaire et conforme au droit d'auteur**, capable de comprendre le contexte d'une interface, d'interroger plusieurs catalogues d'illustrations de référence (unDraw, Open Peeps, IRA Design, Storyset, DrawKit, ManyPixels), de calculer un score de pertinence multi-critères, et de générer instantanément les composants dans votre framework cible (**React**, **Next.js**, **Vue 3**, **Svelte**, **Flutter**).

### 🏛️ Matrice des Fournisseurs

| Fournisseur | Statut Juridique | Licence | Mode d'Intégration | Styles & Forces |
|---|---|---|---|---|
| **unDraw** | ✅ Approved | unDraw Open License | Automatisé via API | Flat design, scènes modernes, conceptuel |
| **Open Peeps** | ✅ Approved | CC0 1.0 (Public Domain) | Automatisé & Modulaire | Personnages, avatars, expressions, équipe |
| **IRA Design** | ✅ Approved | MIT License (Creative Tim) | Automatisé avec Dégradés | Tech, devops, fintech, scènes dégradées |
| **Storyset (Freepik)** | ⚖️ Manual Only | Storyset / Freepik Terms | Conformité stricte (Pas de scraping) | Amico, Pana, Bro, Rafiki, Cuate |
| **DrawKit** | ⚖️ Manual Only | DrawKit Free License | Conformité stricte (Recherche guidée) | Packs thématiques, 2D/3D |
| **ManyPixels** | ⚖️ Manual Only | ManyPixels License | Conformité stricte (Recherche guidée) | Monochromatic, Two-color, Isometric |

> [!IMPORTANT]
> **Éthique & Conformité Stricte** : Storyset, DrawKit et ManyPixels interdisent explicitement le scraping ou la redistribution automatisée en masse dans leurs CGU. Conformément aux règles d'ingénierie responsable, Autopik applique le statut `manual_only` pour ces fournisseurs : il fournit les liens officiels de recherche et les snippets d'attribution légale obligatoires sans jamais contourner les protections techniques.

---

## 🧠 Les 6 Moteurs Cœurs d'Autopik

1. **`SearchEngine` (Analyseur Sémantique Contextuel)** :
   - Détecte automatiquement le composant cible (`auth`, `404`, `empty`, `hero`, `team`, `dashboard`).
   - Infère le mood (`playful`, `serious`, `tech`) et le domaine applicatif (`fintech`, `devops`, `ecommerce`).
   - Analyse la palette depuis `tailwind.config.*` ou vos variables CSS `--primary`.
2. **`ScoringEngine` (Score Multi-Critères 0-100)** :
   - Évalue chaque candidat sur 6 axes : Sémantique (30 pts), Composant (25 pts), Style visuel (15 pts), Palette (10 pts), Format (10 pts), et Licence (10 pts).
3. **`CustomizationEngine` (Adaptateur SVG Sécurisé)** :
   - Remplacement précis de la couleur primaire et des dégradés (`stop-color`).
   - **Dark Mode Adaptatif** : adoucit les charbons et adapte les fonds pour un contraste parfait.
   - **Sanitisation SVG** : élimine les balises `<script>`, `onclick`, et protocoles `javascript:`.
4. **`IntegrationEngine` (Générateur Multi-Frameworks)** :
   - Génération de composants avec typage strict TypeScript pour **React (TSX)**, **Next.js (`next/image`)**, **Vue 3 SFC (`<script setup lang="ts">`)**, **Svelte**, **Flutter (`SvgPicture.asset`)**, et **HTML/CSS**.
   - Détection d'anti-doublon par empreinte SHA256 pour éviter les fichiers dupliqués.
5. **`LicenseManager` (Conformité Légale)** :
   - Valide les droits de modification, d'usage commercial, et injecte les mentions d'attribution obligatoires.
6. **`FallbackManager` & `CacheManager`** :
   - Bascule transparente en cascade (unDraw ➔ Open Peeps ➔ IRA Design) en cas d'indisponibilité réseau ou de résultat nul.
   - Cache mémoire + disque avec TTL pour des performances sub-millisecondes.

---

## 🛠️ Commandes CLI

### 1. 🧠 Smart Match Multi-Fournisseurs
Analyse le projet, évalue les candidats des catalogues approuvés et génère le composant clé en main :
```bash
# Recherche multi-catalogue intelligente
npx tidjan-autopik smart "page not found"

# Spécifier un fournisseur (ex: Open Peeps pour un personnage)
npx tidjan-autopik smart "secure login" --provider openpeeps

# Forcer un framework et une couleur
npx tidjan-autopik smart "analytics dashboard" --framework vue --color "#3B82F6"

# Forcer le mode sombre et écraser si existant
npx tidjan-autopik smart "server crash" --dark --force
```

### 2. 🔍 Recherche & Mode JSON pour Agents IA
```bash
# Recherche avec scores de pertinence
npx tidjan-autopik search "teamwork"

# Sortie structurée JSON consommable par les agents IA
npx tidjan-autopik search "payment" --json
```

### 3. 📦 Liste des Fournisseurs & Capacités
```bash
npx tidjan-autopik providers
```

### 4. ⚖️ Audit Légal de Conformité
```bash
npx tidjan-autopik audit
```

### 5. ⬇️ Téléchargement Direct
```bash
npx tidjan-autopik download "launch rocket" ./public/illustrations --provider iradesign
```

---

## 💻 API Programmatique (Node.js & TypeScript)

Installez le package dans votre projet :
```bash
npm install tidjan-autopik
```

Utilisez l'API typée :
```typescript
import {
  searchIllustrations,
  integrateIllustration,
  auditLicenses,
  getProviders
} from 'tidjan-autopik';

// 1. Recherche sémantique multi-fournisseurs avec scoring
const results = await searchIllustrations('connexion sécurisée', {
  providers: ['undraw', 'openpeeps', 'iradesign'],
  limit: 5
});

console.log(results[0].title); // "Character at Secure Login / Auth Door"
console.log(results[0].score); // 95
console.log(results[0].scoreBreakdown); // { semantic: 30, component: 25, ... }

// 2. Intégration complète (Téléchargement, Colorisation & Composant)
const result = await integrateIllustration({
  providerId: 'openpeeps',
  id: 'security-auth-door',
  framework: 'next',
  primaryColor: '#10B981',
  isDarkMode: true,
});

console.log(`Composant généré : ${result.componentResult.path}`);
```

---

## 🧪 Tests & Qualité de Code

Le projet intègre une suite de tests automatisés native avec le runner Node.js (`node:test`), exécutée en moins de 3 secondes avec **0 dépendance externe** :

```bash
npm test
```

```
✔ CacheManager (memory, disk, TTL)
✔ FallbackManager (cascade, health metrics, blocking)
✔ CustomizationEngine (sanitization, gradients, dark mode, a11y)
✔ IntegrationEngine (React, Next.js, Vue, Svelte, Flutter, HTML, anti-duplicate)
✔ LicenseManager (evaluations, statuses, attributions)
✔ Providers (unDraw, Open Peeps, IRA Design, Storyset, DrawKit, ManyPixels)
✔ Programmatic API (search, integrate, audit)

Total : 40 tests validés (100% pass)
```

---

## 📜 Licences & Crédits

- Conçu et développé par **[Tidjan Sow](https://github.com/Tidjan-NEMSIS)**.
- **unDraw** : Illustrations par Katerina Limpitsouni ([unDraw License](https://undraw.co/license)).
- **Open Peeps** : Illustrations de personnages par Pablo Stanley ([CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)).
- **IRA Design** : Illustrations par Creative Tim ([MIT License](https://github.com/creativetimofficial/ira-design)).
- **Storyset** : Propriété de Freepik Company ([Storyset Terms](https://storyset.com/terms-of-use)).
- **DrawKit** : Propriété de DrawKit ([DrawKit License](https://www.drawkit.com/license)).
- **ManyPixels** : Propriété de ManyPixels ([ManyPixels License](https://www.manypixels.co/license)).
- Code sous licence **[MIT](LICENSE)**.
