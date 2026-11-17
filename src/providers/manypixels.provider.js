/**
 * ManyPixels Provider
 * Royalty-free illustrations library.
 * Status: manual_only (Automated scraping and compiling prohibited).
 * @module providers/manypixels.provider
 */

const { BaseIllustrationProvider } = require('./base-provider');

class ManyPixelsProvider extends BaseIllustrationProvider {
  constructor() {
    super({
      id: 'manypixels',
      name: 'ManyPixels',
      description: '2,500+ royalty-free illustrations across multiple categories. Manual download recommended.',
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
    const searchUrl = `https://www.manypixels.co/gallery/?search=${encoded}`;

    return [
      this.normalizeResult({
        id: `manypixels-${term.toLowerCase().replace(/\s+/g, '-')}`,
        title: `ManyPixels Gallery for "${term}"`,
        slug: `manypixels-${term.toLowerCase().replace(/\s+/g, '-')}`,
        manualUrl: searchUrl,
        svgUrl: '',
        tags: [term.toLowerCase(), 'gallery'],
      }),
    ];
  }

  async getIllustration(id) {
    return {
      ...this.normalizeResult({
        id,
        title: 'ManyPixels Illustration',
        manualUrl: 'https://www.manypixels.co/gallery/',
      }),
      attributionRequired: false,
      attributionSnippet: 'Illustration by ManyPixels (https://manypixels.co)',
    };
  }

  async download(id, options) {
    throw new Error(
      `[Compliance Guard] Automated mass-downloading from ManyPixels is prohibited by their terms of service.\n` +
      `Please browse and download manually at https://www.manypixels.co/gallery/`
    );
  }
}

module.exports = {
  ManyPixelsProvider,
};
