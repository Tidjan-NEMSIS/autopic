/**
 * unDraw Provider (Historical connector)
 * Connects to unDraw illustration search and CDN.
 * @module providers/undraw.provider
 */

const fs = require('fs');
const path = require('path');
const { BaseIllustrationProvider } = require('./base-provider');

const UNDRAW_SEARCH_API = 'https://undraw.co/api/search';

class UndrawProvider extends BaseIllustrationProvider {
  constructor() {
    super({
      id: 'undraw',
      name: 'unDraw',
      description: 'Curated 600+ flat vector illustrations by Katerina Limpitsouni with brand color customization',
      capabilities: {
        search: true,
        directDownload: true,
        colorCustomization: true,
        gradientCustomization: false,
        composition: false,
        darkLightAdaptation: true,
        formats: ['svg'],
      },
    });
    this.defaultPrimaryColor = '#6C63FF';
  }

  /**
   * Search unDraw catalog
   * @param {import('../core/types').IllustrationQuery} query
   * @returns {Promise<import('../core/types').IllustrationResult[]>}
   */
  async search(query) {
    const term = (query.prompt || (query.keywords && query.keywords[0]) || '').trim();
    if (!term || term.length < 3) {
      return [];
    }

    const url = `${UNDRAW_SEARCH_API}?q=${encodeURIComponent(term)}&page=0`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 tidjan-undraw-v2',
          'Accept': 'application/json',
          'Referer': 'https://undraw.co/illustrations',
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      const items = Array.isArray(data.results) ? data.results : [];
      const limit = query.limit || 5;

      return items.slice(0, limit).map((item) =>
        this.normalizeResult({
          id: item.newSlug || item._id,
          title: item.title,
          slug: item.newSlug || item.title.toLowerCase().replace(/\s+/g, '-'),
          media: item.media,
          svgUrl: item.media,
          tags: [item.title.toLowerCase()],
        })
      );
    } catch (err) {
      // Isolate error so fallback manager can engage other providers
      return [];
    }
  }

  /**
   * Fetch illustration details
   * @param {string} id
   * @param {string} [knownUrl]
   * @returns {Promise<import('../core/types').IllustrationDetails>}
   */
  async getIllustration(id, knownUrl = null) {
    const rawId = id.replace(/^undraw:/, '');
    
    // Candidate CDN URLs to try in order (handles both /illustrations/ and /illustration/ paths)
    const candidateUrls = [];
    if (knownUrl && typeof knownUrl === 'string' && knownUrl.startsWith('http')) {
      candidateUrls.push(knownUrl);
    }
    candidateUrls.push(`https://cdn.undraw.co/illustrations/${rawId}.svg`);
    candidateUrls.push(`https://cdn.undraw.co/illustration/${rawId}.svg`);
    candidateUrls.push(`https://42f2671d685f51e10fc6-b97432242619da7e9ee49640879d8cd8.ssl.cf2.rackcdn.com/${rawId}.svg`);

    let rawSvg = null;
    let successfulUrl = null;
    let lastStatus = 404;

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 tidjan-autopic',
            'Referer': 'https://undraw.co/illustrations',
          },
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          rawSvg = await res.text();
          successfulUrl = url;
          break;
        } else {
          lastStatus = res.status;
        }
      } catch (_) {}
    }

    if (!rawSvg) {
      throw new Error(`Illustration not found on unDraw CDN (${lastStatus}): ${rawId}`);
    }

    return {
      ...this.normalizeResult({
        id: rawId,
        title: rawId.split('_')[0].replace(/-/g, ' '),
        slug: rawId,
        svgUrl: successfulUrl,
      }),
      rawSvg,
      defaultPrimaryColor: this.defaultPrimaryColor,
      attributionRequired: this.license.attributionRequired,
      attributionSnippet: this.license.attributionSnippet,
    };
  }

  /**
   * Download and customize an unDraw SVG
   * @param {string} id
   * @param {import('../core/types').DownloadOptions} [options]
   * @returns {Promise<import('../core/types').IllustrationAsset>}
   */
  async download(id, options = {}) {
    const rawId = id.replace(/^undraw:/, '');
    const outDir = options.outputDir || path.join(process.cwd(), 'public', 'illustrations');
    const fileName = options.customFileName || `${rawId}.svg`;
    const targetPath = path.join(outDir, fileName);

    // Anti-duplicate check
    if (fs.existsSync(targetPath) && !options.force) {
      const content = fs.readFileSync(targetPath, 'utf8');
      return {
        id: `undraw:${rawId}`,
        providerId: this.id,
        fileName,
        filePath: targetPath,
        content,
        format: 'svg',
        cached: true,
        license: this.license,
      };
    }

    const details = await this.getIllustration(rawId, options.url || options.svgUrl || options.media);
    let svg = details.rawSvg || '';

    // Color customization
    if (options.primaryColor) {
      svg = svg
        .replace(/#6c63ff/gi, options.primaryColor)
        .replace(/rgb\(108\s*,\s*99\s*,\s*255\)/gi, options.primaryColor);
    }

    if (options.isDarkMode) {
      svg = svg
        .replace(/#2f2e41/gi, '#94A3B8')
        .replace(/#3f3d56/gi, '#CBD5E1');
    }

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(targetPath, svg, 'utf8');

    return {
      id: `undraw:${rawId}`,
      providerId: this.id,
      fileName,
      filePath: targetPath,
      content: svg,
      format: 'svg',
      cached: false,
      license: this.license,
      appliedColors: {
        primary: options.primaryColor || this.defaultPrimaryColor,
        isDarkMode: Boolean(options.isDarkMode),
      },
    };
  }
}

module.exports = {
  UndrawProvider,
};
