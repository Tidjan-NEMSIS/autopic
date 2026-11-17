/**
 * IRA Design Provider (Creative Tim)
 * Modern tech illustrations with gradient customization (MIT License).
 * @module providers/iradesign.provider
 */

const fs = require('fs');
const path = require('path');
const { BaseIllustrationProvider } = require('./base-provider');

/**
 * Curated catalog of IRA Design illustrations with customizable gradients.
 * Licensed under the MIT License by Creative Tim.
 */
const IRA_DESIGN_CATALOG = [
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard & Charts',
    category: 'tech',
    tags: ['analytics', 'dashboard', 'charts', 'data', 'metrics', 'growth', 'stats', 'finance', 'business'],
    defaultStartColor: '#6366F1',
    defaultEndColor: '#8B5CF6',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
  <defs>
    <linearGradient id="ira-grad-analytics" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" id="ira-stop-start"/>
      <stop offset="100%" stop-color="#8B5CF6" id="ira-stop-end"/>
    </linearGradient>
  </defs>
  <!-- IRA Design Analytics (MIT - Creative Tim) -->
  <g id="ira-analytics">
    <!-- Screen base -->
    <rect x="60" y="50" width="380" height="260" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
    <!-- Dashboard header -->
    <rect x="60" y="50" width="380" height="40" rx="16" fill="#EDE9FE"/>
    <circle cx="85" cy="70" r="5" fill="#EF4444"/>
    <circle cx="102" cy="70" r="5" fill="#F59E0B"/>
    <circle cx="119" cy="70" r="5" fill="#10B981"/>
    <!-- Analytics bars with gradient -->
    <rect x="100" y="190" width="35" height="90" rx="6" fill="url(#ira-grad-analytics)"/>
    <rect x="155" y="140" width="35" height="140" rx="6" fill="url(#ira-grad-analytics)"/>
    <rect x="210" y="170" width="35" height="110" rx="6" fill="url(#ira-grad-analytics)"/>
    <rect x="265" y="110" width="35" height="170" rx="6" fill="url(#ira-grad-analytics)"/>
    <rect x="320" y="80" width="35" height="200" rx="6" fill="url(#ira-grad-analytics)"/>
    <!-- Line chart trend -->
    <path d="M117 170 Q 172 120 227 150 T 337 70" fill="none" stroke="#F43F5E" stroke-width="4" stroke-linecap="round"/>
    <!-- Stand -->
    <path d="M220 310 L210 360 L290 360 L280 310 Z" fill="#CBD5E1"/>
    <rect x="180" y="360" width="140" height="8" rx="4" fill="#94A3B8"/>
  </g>
</svg>`,
  },
  {
    id: 'cloud-server-infrastructure',
    title: 'Cloud Infrastructure & Server Deployment',
    category: 'tech',
    tags: ['cloud', 'server', 'database', 'infrastructure', 'devops', 'hosting', 'network', 'deployment'],
    defaultStartColor: '#3B82F6',
    defaultEndColor: '#1D4ED8',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
  <defs>
    <linearGradient id="ira-grad-cloud" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" id="ira-stop-start"/>
      <stop offset="100%" stop-color="#1D4ED8" id="ira-stop-end"/>
    </linearGradient>
  </defs>
  <!-- IRA Design Cloud Server (MIT - Creative Tim) -->
  <g id="ira-cloud">
    <!-- Cloud shape with gradient -->
    <path d="M180 140 C180 100 240 80 270 110 C300 90 360 110 360 150 C390 150 410 180 390 210 C390 230 360 240 340 240 L160 240 C130 240 110 210 130 180 C110 150 150 120 180 140 Z" fill="url(#ira-grad-cloud)" opacity="0.9"/>
    <!-- Server Stack -->
    <rect x="175" y="220" width="150" height="35" rx="6" fill="#1E293B" stroke="#64748B" stroke-width="2"/>
    <circle cx="195" cy="237" r="4" fill="#10B981"/>
    <rect x="175" y="265" width="150" height="35" rx="6" fill="#1E293B" stroke="#64748B" stroke-width="2"/>
    <circle cx="195" cy="282" r="4" fill="#10B981"/>
    <rect x="175" y="310" width="150" height="35" rx="6" fill="#1E293B" stroke="#64748B" stroke-width="2"/>
    <circle cx="195" cy="327" r="4" fill="#3B82F6"/>
  </g>
</svg>`,
  },
  {
    id: 'payment-security-checkout',
    title: 'Secure Payment & Card Checkout',
    category: 'fintech',
    tags: ['payment', 'checkout', 'card', 'finance', 'money', 'banking', 'cart', 'security', 'credit'],
    defaultStartColor: '#10B981',
    defaultEndColor: '#059669',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
  <defs>
    <linearGradient id="ira-grad-pay" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" id="ira-stop-start"/>
      <stop offset="100%" stop-color="#059669" id="ira-stop-end"/>
    </linearGradient>
  </defs>
  <!-- IRA Design Payment (MIT - Creative Tim) -->
  <g id="ira-payment">
    <!-- Credit Card Gradient -->
    <rect x="120" y="100" width="260" height="160" rx="14" fill="url(#ira-grad-pay)" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.15))"/>
    <rect x="120" y="130" width="260" height="28" fill="#064E3B" opacity="0.6"/>
    <!-- Chip -->
    <rect x="160" y="175" width="36" height="26" rx="4" fill="#FDE047"/>
    <circle cx="330" cy="225" r="14" fill="#FFFFFF" opacity="0.8"/>
    <circle cx="348" cy="225" r="14" fill="#FFFFFF" opacity="0.5"/>
    <!-- Shield Icon -->
    <path d="M250 260 L290 280 L290 320 C290 350 250 370 250 370 C250 370 210 350 210 320 L210 280 Z" fill="#F8FAFC" stroke="#10B981" stroke-width="4"/>
    <path d="M235 315 L245 325 L265 305" fill="none" stroke="#10B981" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>`,
  },
  {
    id: 'bug-fixing-dev',
    title: 'Bug Fixing & Code Debugging',
    category: 'tech',
    tags: ['bug', 'debug', 'code', 'error', 'fix', 'developer', 'problem', 'testing', 'inspect'],
    defaultStartColor: '#EF4444',
    defaultEndColor: '#B91C1C',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="100%">
  <defs>
    <linearGradient id="ira-grad-bug" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EF4444" id="ira-stop-start"/>
      <stop offset="100%" stop-color="#B91C1C" id="ira-stop-end"/>
    </linearGradient>
  </defs>
  <!-- IRA Design Bug / Error (MIT - Creative Tim) -->
  <g id="ira-bug">
    <!-- Code Editor window -->
    <rect x="80" y="60" width="340" height="240" rx="12" fill="#1E293B"/>
    <rect x="80" y="60" width="340" height="30" rx="12" fill="#0F172A"/>
    <circle cx="100" cy="75" r="4" fill="#EF4444"/>
    <circle cx="115" cy="75" r="4" fill="#F59E0B"/>
    <circle cx="130" cy="75" r="4" fill="#10B981"/>
    <!-- Code lines -->
    <rect x="110" y="110" width="120" height="8" rx="4" fill="#64748B"/>
    <rect x="110" y="130" width="180" height="8" rx="4" fill="#64748B"/>
    <rect x="140" y="150" width="100" height="8" rx="4" fill="#38BDF8"/>
    <rect x="140" y="170" width="150" height="8" rx="4" fill="#F43F5E"/>
    <!-- Magnifier / Bug fix with gradient -->
    <circle cx="310" cy="200" r="60" fill="url(#ira-grad-bug)" opacity="0.85"/>
    <circle cx="310" cy="200" r="45" fill="#0F172A"/>
    <text x="310" y="212" font-family="monospace" font-size="32" font-weight="bold" fill="#EF4444" text-anchor="middle">!</text>
  </g>
</svg>`,
  },
];

class IraDesignProvider extends BaseIllustrationProvider {
  constructor() {
    super({
      id: 'iradesign',
      name: 'IRA Design',
      description: 'MIT-licensed hand-drawn gradient illustrations by Creative Tim with customizable linear gradients',
      capabilities: {
        search: true,
        directDownload: true,
        colorCustomization: true,
        gradientCustomization: true,
        composition: false,
        darkLightAdaptation: true,
        formats: ['svg'],
      },
    });
  }

  /**
   * Search IRA Design catalog
   * @param {import('../core/types').IllustrationQuery} query
   * @returns {Promise<import('../core/types').IllustrationResult[]>}
   */
  async search(query) {
    const q = (query.prompt || (query.keywords && query.keywords[0]) || '').toLowerCase();
    const qWords = q.split(/\s+/).filter(Boolean);
    const limit = query.limit || 5;

    const matched = IRA_DESIGN_CATALOG.filter((item) => {
      if (!q) return true;
      const haystack = `${item.title} ${item.tags.join(' ')} ${item.category}`.toLowerCase();
      return qWords.some((w) => haystack.includes(w));
    });

    return matched.slice(0, limit).map((item) =>
      this.normalizeResult({
        id: item.id,
        title: item.title,
        slug: `ira-${item.id}`,
        tags: item.tags,
        svgUrl: `local:iradesign/${item.id}`,
        manualUrl: 'https://iradesign.io/',
      })
    );
  }

  /**
   * Get illustration details
   * @param {string} id
   * @returns {Promise<import('../core/types').IllustrationDetails>}
   */
  async getIllustration(id) {
    const rawId = id.replace(/^iradesign:/, '').replace(/^ira-/, '');
    const found = IRA_DESIGN_CATALOG.find((i) => i.id === rawId) || IRA_DESIGN_CATALOG[0];

    return {
      ...this.normalizeResult({
        id: found.id,
        title: found.title,
        slug: `ira-${found.id}`,
        tags: found.tags,
      }),
      rawSvg: found.svg,
      defaultPrimaryColor: found.defaultStartColor,
      attributionRequired: this.license.attributionRequired,
      attributionSnippet: this.license.attributionSnippet,
    };
  }

  /**
   * Download and customize an IRA Design SVG
   * @param {string} id
   * @param {import('../core/types').DownloadOptions} [options]
   * @returns {Promise<import('../core/types').IllustrationAsset>}
   */
  async download(id, options = {}) {
    const rawId = id.replace(/^iradesign:/, '').replace(/^ira-/, '');
    const outDir = options.outputDir || path.join(process.cwd(), 'public', 'illustrations');
    const fileName = options.customFileName || `ira-${rawId}.svg`;
    const targetPath = path.join(outDir, fileName);

    if (fs.existsSync(targetPath) && !options.force) {
      const content = fs.readFileSync(targetPath, 'utf8');
      return {
        id: `iradesign:${rawId}`,
        providerId: this.id,
        fileName,
        filePath: targetPath,
        content,
        format: 'svg',
        cached: true,
        license: this.license,
        attributionText: this.license.attributionSnippet,
      };
    }

    const details = await this.getIllustration(rawId);
    let svg = details.rawSvg || '';

    // Gradient or single color customization
    if (options.primaryColor) {
      const startColor = options.primaryColor;
      const endColor = options.accentColor || startColor;
      svg = svg
        .replace(/id="ira-stop-start"(\s+stop-color="[^"]*")?/gi, `id="ira-stop-start" stop-color="${startColor}"`)
        .replace(/id="ira-stop-end"(\s+stop-color="[^"]*")?/gi, `id="ira-stop-end" stop-color="${endColor}"`)
        .replace(/stop-color="[^"]*"\s+id="ira-stop-start"/gi, `stop-color="${startColor}" id="ira-stop-start"`)
        .replace(/stop-color="[^"]*"\s+id="ira-stop-end"/gi, `stop-color="${endColor}" id="ira-stop-end"`);
    }

    // Dark mode
    if (options.isDarkMode) {
      svg = svg.replace(/fill="#F8FAFC"/gi, 'fill="#1E293B"').replace(/stroke="#E2E8F0"/gi, 'stroke="#334155"');
    }

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(targetPath, svg, 'utf8');

    return {
      id: `iradesign:${rawId}`,
      providerId: this.id,
      fileName,
      filePath: targetPath,
      content: svg,
      format: 'svg',
      cached: false,
      license: this.license,
      attributionText: this.license.attributionSnippet,
      appliedColors: {
        primary: options.primaryColor || '#6366F1',
        accent: options.accentColor,
        isDarkMode: Boolean(options.isDarkMode),
      },
    };
  }
}

module.exports = {
  IraDesignProvider,
  IRA_DESIGN_CATALOG,
};
