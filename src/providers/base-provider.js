/**
 * Base Abstract Provider
 * Standardizes result normalization, error isolation, and licensing.
 * @module providers/base-provider
 */

const { LicenseManager } = require('../core/license-manager');

/**
 * @implements {import('../core/types').IllustrationProvider}
 */
class BaseIllustrationProvider {
  /**
   * @param {Object} options
   * @param {string} options.id - Unique ID
   * @param {string} options.name - Human-readable name
   * @param {string} options.description - Provider description
   * @param {import('../core/types').ProviderCapabilities} options.capabilities - Capability map
   */
  constructor({ id, name, description, capabilities }) {
    if (!id || !name) {
      throw new Error('BaseIllustrationProvider requires id and name');
    }
    this.id = id.toLowerCase();
    this.name = name;
    this.description = description || '';
    this.capabilities = capabilities || {
      search: true,
      directDownload: true,
      colorCustomization: false,
      gradientCustomization: false,
      composition: false,
      darkLightAdaptation: false,
      formats: ['svg'],
    };
  }

  get license() {
    return LicenseManager.getLicense(this.id);
  }

  get status() {
    return LicenseManager.getStatus(this.id);
  }

  getCapabilities() {
    return { ...this.capabilities };
  }

  /**
   * Standardize illustration result object
   * @param {Object} raw
   * @returns {import('../core/types').IllustrationResult}
   */
  normalizeResult(raw) {
    const slug = raw.slug || (raw.title ? raw.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'illustration');
    const id = raw.id ? `${this.id}:${raw.id}` : `${this.id}:${slug}`;

    return {
      id,
      title: raw.title || 'Untitled Illustration',
      slug,
      providerId: this.id,
      providerName: this.name,
      thumbnailUrl: raw.thumbnailUrl || raw.svgUrl || raw.media || '',
      svgUrl: raw.svgUrl || raw.media || '',
      manualUrl: raw.manualUrl || this.license.licenseUrl,
      license: this.license,
      status: this.status,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      relevanceScore: raw.relevanceScore || 50,
      scoreBreakdown: raw.scoreBreakdown,
    };
  }

  /**
   * Abstract search
   * @param {import('../core/types').IllustrationQuery} query
   * @returns {Promise<import('../core/types').IllustrationResult[]>}
   */
  async search(query) {
    throw new Error(`search() not implemented in ${this.name}`);
  }

  /**
   * Abstract getIllustration
   * @param {string} id
   * @returns {Promise<import('../core/types').IllustrationDetails>}
   */
  async getIllustration(id) {
    throw new Error(`getIllustration() not implemented in ${this.name}`);
  }

  /**
   * Abstract download
   * @param {string} id
   * @param {import('../core/types').DownloadOptions} [options]
   * @returns {Promise<import('../core/types').IllustrationAsset>}
   */
  async download(id, options) {
    throw new Error(`download() not implemented in ${this.name}`);
  }
}

module.exports = {
  BaseIllustrationProvider,
};
