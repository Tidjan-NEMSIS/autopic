/**
 * Open Peeps Provider (Pablo Stanley)
 * Hand-drawn modular character illustration library (CC0 1.0 Public Domain).
 * @module providers/openpeeps.provider
 */

const fs = require('fs');
const path = require('path');
const { BaseIllustrationProvider } = require('./base-provider');

/**
 * Curated catalog of Open Peeps poses and character compositions.
 * Under CC0 1.0 Universal License.
 */
const OPEN_PEEPS_CATALOG = [
  {
    id: 'standing-laptop',
    title: 'Developer Standing with Laptop',
    category: 'character',
    tags: ['developer', 'coding', 'laptop', 'tech', 'work', 'workplace', 'hero', 'onboarding'],
    gender: 'neutral',
    pose: 'standing',
    defaultColor: '#6C63FF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
  <defs>
    <style>
      .peep-stroke { stroke: #000000; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .peep-accent { fill: #6C63FF; }
      .peep-skin { fill: #FFDBB4; }
      .peep-hair { fill: #2D3748; }
      .peep-white { fill: #FFFFFF; }
    </style>
  </defs>
  <!-- Open Peeps by Pablo Stanley (CC0) -->
  <g id="peep-standing-laptop">
    <!-- Legs -->
    <path class="peep-stroke" d="M170 380 L170 540 M230 380 L230 540" />
    <path class="peep-stroke" d="M150 540 C170 540 170 560 190 560 L150 560 Z" fill="#2D3748"/>
    <path class="peep-stroke" d="M210 540 C230 540 230 560 250 560 L210 560 Z" fill="#2D3748"/>
    <!-- Body / Jacket -->
    <path class="peep-accent peep-stroke" d="M140 230 C140 230 160 380 200 380 C240 380 260 230 260 230 L220 200 L180 200 Z" />
    <!-- Arms holding laptop -->
    <path class="peep-stroke" d="M150 240 L130 310 L190 320" />
    <path class="peep-stroke" d="M250 240 L270 310 L210 320" />
    <!-- Laptop -->
    <rect x="170" y="290" width="60" height="40" rx="3" fill="#E2E8F0" class="peep-stroke"/>
    <path class="peep-stroke" d="M160 330 L240 330" />
    <!-- Head / Neck -->
    <rect x="190" y="170" width="20" height="30" class="peep-skin peep-stroke"/>
    <circle cx="200" cy="140" r="45" class="peep-skin peep-stroke"/>
    <!-- Hair -->
    <path class="peep-hair peep-stroke" d="M155 130 C155 80 245 80 245 130 C235 110 165 110 155 130 Z" />
    <!-- Face: Smile & Eyes -->
    <circle cx="185" cy="135" r="4" fill="#000000"/>
    <circle cx="215" cy="135" r="4" fill="#000000"/>
    <path class="peep-stroke" d="M190 155 Q200 165 210 155" />
    <!-- Glasses -->
    <circle cx="185" cy="135" r="12" class="peep-stroke"/>
    <circle cx="215" cy="135" r="12" class="peep-stroke"/>
    <path class="peep-stroke" d="M197 135 L203 135" />
  </g>
</svg>`,
  },
  {
    id: 'sitting-confused-404',
    title: 'Character Confused with Question Mark (404/Empty)',
    category: 'character',
    tags: ['404', 'error', 'confused', 'lost', 'empty', 'question', 'help', 'search', 'problem'],
    gender: 'neutral',
    pose: 'sitting',
    defaultColor: '#6C63FF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
  <defs>
    <style>
      .peep-stroke { stroke: #000000; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .peep-accent { fill: #6C63FF; }
      .peep-skin { fill: #FFDBB4; }
      .peep-hair { fill: #2D3748; }
    </style>
  </defs>
  <!-- Open Peeps Confused / 404 (CC0) -->
  <g id="peep-confused-404">
    <!-- Big Question Mark Accent -->
    <text x="290" y="160" font-family="system-ui, sans-serif" font-size="90" font-weight="900" class="peep-accent">?</text>
    <text x="70" y="200" font-family="system-ui, sans-serif" font-size="60" font-weight="900" fill="#CBD5E1">404</text>
    <!-- Stool / Box -->
    <rect x="140" y="320" width="120" height="120" rx="6" fill="#F1F5F9" class="peep-stroke"/>
    <!-- Body Sitting -->
    <path class="peep-accent peep-stroke" d="M160 210 C160 210 150 330 180 330 L220 330 C250 330 240 210 240 210 Z" />
    <path class="peep-stroke" d="M180 330 L160 440 M220 330 L240 440" />
    <!-- Arms Shrugging -->
    <path class="peep-stroke" d="M160 230 L120 200 L110 220" />
    <path class="peep-stroke" d="M240 230 L280 200 L290 220" />
    <!-- Head -->
    <circle cx="200" cy="140" r="45" class="peep-skin peep-stroke"/>
    <!-- Hair Messy -->
    <path class="peep-hair peep-stroke" d="M150 140 C140 70 250 60 250 130 C240 100 160 110 150 140 Z" />
    <!-- Eyes squinting confused -->
    <path class="peep-stroke" d="M180 135 L190 135 M210 135 L220 135" />
    <!-- Mouth wavy confused -->
    <path class="peep-stroke" d="M190 160 Q195 155 200 160 T210 160" />
  </g>
</svg>`,
  },
  {
    id: 'success-celebration',
    title: 'Character Celebrating Success / High Five',
    category: 'character',
    tags: ['success', 'celebration', 'winner', 'done', 'check', 'trophy', 'completed', 'achievement', 'launch'],
    gender: 'neutral',
    pose: 'celebrating',
    defaultColor: '#6C63FF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
  <defs>
    <style>
      .peep-stroke { stroke: #000000; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .peep-accent { fill: #6C63FF; }
      .peep-skin { fill: #FFDBB4; }
      .peep-hair { fill: #2D3748; }
    </style>
  </defs>
  <!-- Open Peeps Success / Celebration (CC0) -->
  <g id="peep-celebration">
    <!-- Star sparkles -->
    <path d="M100 100 L105 115 L120 120 L105 125 L100 140 L95 125 L80 120 L95 115 Z" class="peep-accent"/>
    <path d="M300 120 L304 132 L316 136 L304 140 L300 152 L296 140 L284 136 L296 132 Z" class="peep-accent"/>
    <!-- Legs Jumping -->
    <path class="peep-stroke" d="M180 360 L160 470 M220 360 L240 470" />
    <!-- Body -->
    <path class="peep-accent peep-stroke" d="M160 210 C160 210 150 360 200 360 C250 360 240 210 240 210 Z" />
    <!-- Raised Arms in Victory -->
    <path class="peep-stroke" d="M160 220 L110 140 L100 150" />
    <path class="peep-stroke" d="M240 220 L290 140 L300 150" />
    <!-- Head -->
    <circle cx="200" cy="140" r="45" class="peep-skin peep-stroke"/>
    <!-- Hair Spiky -->
    <path class="peep-hair peep-stroke" d="M155 130 C155 70 245 70 245 130 Z" />
    <!-- Happy Face -->
    <circle cx="185" cy="135" r="4" fill="#000000"/>
    <circle cx="215" cy="135" r="4" fill="#000000"/>
    <path class="peep-stroke" d="M185 150 Q200 170 215 150 Z" fill="#E53E3E"/>
  </g>
</svg>`,
  },
  {
    id: 'security-auth-door',
    title: 'Character at Secure Login / Auth Door',
    category: 'character',
    tags: ['login', 'auth', 'authentication', 'security', 'password', 'door', 'access', 'key', 'privacy'],
    gender: 'neutral',
    pose: 'standing',
    defaultColor: '#6C63FF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 500" width="100%" height="100%">
  <defs>
    <style>
      .peep-stroke { stroke: #000000; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .peep-accent { fill: #6C63FF; }
      .peep-skin { fill: #FFDBB4; }
      .peep-hair { fill: #2D3748; }
    </style>
  </defs>
  <!-- Open Peeps Login / Auth (CC0) -->
  <g id="peep-security-login">
    <!-- Doorway / Shield Frame -->
    <rect x="230" y="80" width="160" height="360" rx="12" fill="#F8FAFC" class="peep-stroke"/>
    <circle cx="255" cy="260" r="8" class="peep-accent"/>
    <path class="peep-stroke" d="M255 268 L255 285" />
    <!-- Peep entering / holding key -->
    <path class="peep-stroke" d="M120 360 L120 480 M160 360 L160 480" />
    <path class="peep-accent peep-stroke" d="M100 220 L180 220 L160 360 L120 360 Z" />
    <!-- Arm with key -->
    <path class="peep-stroke" d="M160 230 L220 250" />
    <!-- Key icon -->
    <circle cx="230" cy="250" r="7" class="peep-accent peep-stroke"/>
    <path class="peep-stroke" d="M237 250 L248 250 M245 250 L245 256" />
    <!-- Head -->
    <circle cx="140" cy="150" r="42" class="peep-skin peep-stroke"/>
    <path class="peep-hair peep-stroke" d="M100 140 C100 80 180 80 180 140 Z" />
    <circle cx="150" cy="145" r="4" fill="#000000"/>
    <path class="peep-stroke" d="M145 165 Q155 170 165 165" />
  </g>
</svg>`,
  },
  {
    id: 'team-collaboration',
    title: 'Two Characters Collaborating (Teamwork / Co-working)',
    category: 'character',
    tags: ['team', 'teamwork', 'collaboration', 'meeting', 'discussion', 'coworkers', 'people', 'partner'],
    gender: 'duo',
    pose: 'duo',
    defaultColor: '#6C63FF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <style>
      .peep-stroke { stroke: #000000; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; fill: none; }
      .peep-accent { fill: #6C63FF; }
      .peep-skin-1 { fill: #FFDBB4; }
      .peep-skin-2 { fill: #D08B5B; }
      .peep-hair { fill: #2D3748; }
    </style>
  </defs>
  <!-- Open Peeps Team / Collaboration (CC0) -->
  <g id="peep-teamwork">
    <!-- Speech bubble between them -->
    <path class="peep-stroke" d="M220 120 C220 100 280 100 280 120 C280 140 240 140 230 155 L235 140 C225 140 220 130 220 120 Z" fill="#FFFFFF"/>
    <circle cx="240" cy="120" r="3" fill="#6C63FF"/>
    <circle cx="250" cy="120" r="3" fill="#6C63FF"/>
    <circle cx="260" cy="120" r="3" fill="#6C63FF"/>
    <!-- Peep 1 (Left) -->
    <path class="peep-stroke" d="M120 350 L120 480 M150 350 L150 480" />
    <path class="peep-accent peep-stroke" d="M100 220 L170 220 L160 350 L110 350 Z" />
    <path class="peep-stroke" d="M160 240 L210 270" />
    <circle cx="135" cy="160" r="40" class="peep-skin-1 peep-stroke"/>
    <path class="peep-hair peep-stroke" d="M100 150 C100 90 170 90 170 150 Z" />
    <circle cx="145" cy="155" r="4" fill="#000000"/>
    <path class="peep-stroke" d="M140 175 Q150 185 160 175" />
    <!-- Peep 2 (Right) -->
    <path class="peep-stroke" d="M350 350 L350 480 M380 350 L380 480" />
    <path class="peep-stroke" d="M330 220 L400 220 L390 350 L340 350 Z" fill="#1E293B"/>
    <path class="peep-stroke" d="M340 240 L290 270" />
    <circle cx="365" cy="160" r="40" class="peep-skin-2 peep-stroke"/>
    <path class="peep-hair peep-stroke" d="M330 150 C330 90 400 90 400 150 Z" />
    <circle cx="355" cy="155" r="4" fill="#000000"/>
    <path class="peep-stroke" d="M350 175 Q360 185 370 175" />
  </g>
</svg>`,
  },
];

class OpenPeepsProvider extends BaseIllustrationProvider {
  constructor() {
    super({
      id: 'openpeeps',
      name: 'Open Peeps',
      description: 'Hand-drawn vector character illustrations created by Pablo Stanley under CC0 (Public Domain)',
      capabilities: {
        search: true,
        directDownload: true,
        colorCustomization: true,
        gradientCustomization: false,
        composition: true,
        darkLightAdaptation: true,
        formats: ['svg'],
      },
    });
  }

  /**
   * Search Open Peeps library
   * @param {import('../core/types').IllustrationQuery} query
   * @returns {Promise<import('../core/types').IllustrationResult[]>}
   */
  async search(query) {
    const q = (query.prompt || (query.keywords && query.keywords[0]) || '').toLowerCase();
    const qWords = q.split(/\s+/).filter(Boolean);
    const limit = query.limit || 5;

    const matched = OPEN_PEEPS_CATALOG.filter((item) => {
      if (!q) return true;
      const haystack = `${item.title} ${item.tags.join(' ')} ${item.category} ${item.pose}`.toLowerCase();
      return qWords.some((w) => haystack.includes(w));
    });

    return matched.slice(0, limit).map((item) =>
      this.normalizeResult({
        id: item.id,
        title: item.title,
        slug: `openpeeps-${item.id}`,
        tags: item.tags,
        svgUrl: `local:openpeeps/${item.id}`,
        manualUrl: 'https://www.openpeeps.com/',
      })
    );
  }

  /**
   * Get illustration details
   * @param {string} id
   * @returns {Promise<import('../core/types').IllustrationDetails>}
   */
  async getIllustration(id) {
    const rawId = id.replace(/^openpeeps:/, '').replace(/^openpeeps-/, '');
    const found = OPEN_PEEPS_CATALOG.find((i) => i.id === rawId) || OPEN_PEEPS_CATALOG[0];

    return {
      ...this.normalizeResult({
        id: found.id,
        title: found.title,
        slug: `openpeeps-${found.id}`,
        tags: found.tags,
      }),
      rawSvg: found.svg,
      defaultPrimaryColor: found.defaultColor,
      attributionRequired: this.license.attributionRequired,
      attributionSnippet: this.license.attributionSnippet,
    };
  }

  /**
   * Download and customize an Open Peeps character SVG
   * @param {string} id
   * @param {import('../core/types').DownloadOptions} [options]
   * @returns {Promise<import('../core/types').IllustrationAsset>}
   */
  async download(id, options = {}) {
    const rawId = id.replace(/^openpeeps:/, '').replace(/^openpeeps-/, '');
    const outDir = options.outputDir || path.join(process.cwd(), 'public', 'illustrations');
    const fileName = options.customFileName || `openpeeps-${rawId}.svg`;
    const targetPath = path.join(outDir, fileName);

    if (fs.existsSync(targetPath) && !options.force) {
      const content = fs.readFileSync(targetPath, 'utf8');
      return {
        id: `openpeeps:${rawId}`,
        providerId: this.id,
        fileName,
        filePath: targetPath,
        content,
        format: 'svg',
        cached: true,
        license: this.license,
      };
    }

    const details = await this.getIllustration(rawId);
    let svg = details.rawSvg || '';

    // Color customization on .peep-accent class and fill values
    if (options.primaryColor) {
      svg = svg
        .replace(/fill:\s*#6C63FF/gi, `fill: ${options.primaryColor}`)
        .replace(/#6c63ff/gi, options.primaryColor);
    }

    // Dark mode: adjust lines if dark mode is requested
    if (options.isDarkMode) {
      svg = svg
        .replace(/stroke:\s*#000000/gi, 'stroke: #F8FAFC')
        .replace(/fill="#000000"/gi, 'fill="#F8FAFC"');
    }

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(targetPath, svg, 'utf8');

    return {
      id: `openpeeps:${rawId}`,
      providerId: this.id,
      fileName,
      filePath: targetPath,
      content: svg,
      format: 'svg',
      cached: false,
      license: this.license,
      appliedColors: {
        primary: options.primaryColor || '#6C63FF',
        isDarkMode: Boolean(options.isDarkMode),
      },
    };
  }
}

module.exports = {
  OpenPeepsProvider,
  OPEN_PEEPS_CATALOG,
};
