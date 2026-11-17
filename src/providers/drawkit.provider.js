/**
 * DrawKit Provider
 * Curated vector illustrations and packs.
 * Status: manual_only (No public API, no automated pack redistribution).
 * @module providers/drawkit.provider
 */

const { BaseIllustrationProvider } = require('./base-provider');

class DrawKitProvider extends BaseIllustrationProvider {
  constructor() {
    super({
      id: 'drawkit',
      name: 'DrawKit',
      description: 'Handcrafted illustration packs and modular icon sets. Manual download recommended.',
      capabilities: {
        search: true,
        directDownload: false,
        colorCustomization: false,
        gradientCustomization: false,
        composition: false,
        darkLightAdaptation: false,
        formats: ['svg', 'png'],
      },
    });
  }

  async search(query) {
    const term = (query.prompt || (query.keywords && query.keywords[0]) || 'illustrations').trim();
    const encoded = encodeURIComponent(term);
    const searchUrl = `https://www.drawkit.com/collections?search=${encoded}`;

    return [
      this.normalizeResult({
        id: `drawkit-${term.toLowerCase().replace(/\s+/g, '-')}`,
        title: `DrawKit Collection for "${term}"`,
        slug: `drawkit-${term.toLowerCase().replace(/\s+/g, '-')}`,
        manualUrl: searchUrl,
        svgUrl: '',
        tags: [term.toLowerCase(), 'pack', 'vector'],
      }),
    ];
  }

  async getIllustration(id) {
    return {
      ...this.normalizeResult({
        id,
        title: 'DrawKit Illustration Pack',
        manualUrl: 'https://www.drawkit.com/',
      }),
      attributionRequired: false,
      attributionSnippet: 'Illustrations by DrawKit (https://drawkit.com)',
    };
  }

  async download(id, options) {
    throw new Error(
      `[Compliance Guard] Automated downloading from DrawKit is not supported.\n` +
      `Please visit the official collection on https://www.drawkit.com/ to download.`
    );
  }
}

module.exports = {
  DrawKitProvider,
};
