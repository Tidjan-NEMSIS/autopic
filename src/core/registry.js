/**
 * Central Provider Registry
 * Allows dynamic registration, capability introspection, and lifecycle control.
 * @module core/registry
 */

const { LicenseManager } = require('./license-manager');

class ProviderRegistry {
  constructor() {
    /** @type {Map<string, import('./types').IllustrationProvider>} */
    this.providers = new Map();
    /** @type {Map<string, boolean>} */
    this.enabledState = new Map();
  }

  /**
   * Register a new provider
   * @param {import('./types').IllustrationProvider} provider
   */
  register(provider) {
    if (!provider || !provider.id) {
      throw new Error('Provider must have a valid id');
    }
    const id = provider.id.toLowerCase();
    this.providers.set(id, provider);
    if (!this.enabledState.has(id)) {
      this.enabledState.set(id, true);
    }
    return this;
  }

  /**
   * Remove a provider
   * @param {string} id
   */
  unregister(id) {
    const key = id.toLowerCase();
    this.providers.delete(key);
    this.enabledState.delete(key);
    return this;
  }

  /**
   * Get a provider by ID
   * @param {string} id
   * @returns {import('./types').IllustrationProvider | undefined}
   */
  get(id) {
    return this.providers.get(id.toLowerCase());
  }

  /**
   * Check if a provider exists
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    return this.providers.has(id.toLowerCase());
  }

  /**
   * Toggle provider active status
   * @param {string} id
   * @param {boolean} enabled
   */
  setEnabled(id, enabled) {
    const key = id.toLowerCase();
    if (this.providers.has(key)) {
      this.enabledState.set(key, Boolean(enabled));
    }
    return this;
  }

  /**
   * Check if provider is enabled
   * @param {string} id
   * @returns {boolean}
   */
  isEnabled(id) {
    const key = id.toLowerCase();
    return this.enabledState.get(key) !== false;
  }

  /**
   * List providers with optional filtering
   * @param {Object} [filter]
   * @param {'approved' | 'manual_only' | 'blocked'} [filter.status]
   * @param {boolean} [filter.enabledOnly]
   * @param {keyof import('./types').ProviderCapabilities} [filter.capability]
   * @returns {import('./types').IllustrationProvider[]}
   */
  list(filter = {}) {
    const result = [];
    for (const [id, provider] of this.providers.entries()) {
      if (filter.enabledOnly && !this.isEnabled(id)) {
        continue;
      }
      if (filter.status && provider.status !== filter.status) {
        continue;
      }
      if (filter.capability) {
        const caps = provider.getCapabilities();
        if (!caps[filter.capability]) continue;
      }
      result.push(provider);
    }
    return result;
  }

  /**
   * Get all registered provider IDs
   * @returns {string[]}
   */
  getIds() {
    return Array.from(this.providers.keys());
  }
}

// Global default singleton
const globalRegistry = new ProviderRegistry();

module.exports = {
  ProviderRegistry,
  registry: globalRegistry,
};
