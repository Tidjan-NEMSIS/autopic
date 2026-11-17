/**
 * Storyset Provider (Freepik Company)
 * Guided manual integration with mandatory attribution enforcement.
 * Status: manual_only (Automated scraping strictly forbidden by Freepik terms).
 * @module providers/storyset.provider
 */

const { BaseIllustrationProvider } = require('./base-provider');

class StorysetProvider extends BaseIllustrationProvider {
  constructor() {
    super({
      id: 'storyset',
      name: 'Storyset (Freepik)',
      description: 'Customizable illustrations with 5 graphic styles (Amico, Bro, Rafiki, Cuate, Pana). Manual download with mandatory attribution.',
      capabilities: {
        search: true,
        directDownload: false, // Forbidden by terms of use
        colorCustomization: false,
        gradientCustomization: false,
        composition: false,
        darkLightAdaptation: false,
        formats: ['svg'],
      },
    });
  }

  /**
   * Generates guided search results pointing to official Storyset categories and search URLs
   * @param {import('../core/types').IllustrationQuery} query
   * @returns {Promise<import('../core/types').IllustrationResult[]>}
   */
  async search(query) {
    const term = (query.prompt || (query.keywords && query.keywords[0]) || 'illustration').trim();
    const encoded = encodeURIComponent(term);
    const searchUrl = `https://storyset.com/search?q=${encoded}`;

    const styles = ['Amico', 'Bro', 'Rafiki', 'Cuate', 'Pana'];
    const limit = Math.min(query.limit || 5, styles.length);

    return styles.slice(0, limit).map((style) =>
      this.normalizeResult({
        id: `storyset-${term.toLowerCase().replace(/\s+/g, '-')}-${style.toLowerCase()}`,
        title: `${term} (${style} style)`,
        slug: `storyset-${style.toLowerCase()}`,
        manualUrl: `${searchUrl}&style=${style.toLowerCase()}`,
        svgUrl: '',
        tags: [term.toLowerCase(), style.toLowerCase(), 'freepik'],
      })
    );
  }

  /**
   * Illustration details with attribution requirements
   * @param {string} id
   * @returns {Promise<import('../core/types').IllustrationDetails>}
   */
  async getIllustration(id) {
    return {
      ...this.normalizeResult({
        id,
        title: 'Storyset Illustration',
        manualUrl: 'https://storyset.com/',
      }),
      attributionRequired: true,
      attributionSnippet: '<a href="https://storyset.com">Illustration by Storyset</a>',
    };
  }

  /**
   * Refuses unauthorized automated download and provides lawful instructions
   * @param {string} id
   * @param {import('../core/types').DownloadOptions} [options]
   */
  async download(id, options) {
    throw new Error(
      `[Compliance Guard] Automated downloading from Storyset is prohibited by Freepik Company Terms of Use.\n` +
      `Please visit the official illustration page on https://storyset.com/ to download legally.\n` +
      `Mandatory attribution required: "Illustration by Storyset - https://storyset.com"`
    );
  }
}

module.exports = {
  StorysetProvider,
};
