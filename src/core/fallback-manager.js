/**
 * Multi-Provider Fallback & Orchestration Manager
 * Provides resilient illustration retrieval, health tracking, and cascading fallbacks across providers.
 * @module core/fallback-manager
 */

const { defaultCache } = require('./cache-manager');

class FallbackManager {
  /**
   * @param {Object} options
   * @param {import('./registry').ProviderRegistry} options.registry
   * @param {import('./cache-manager').CacheManager} [options.cache]
   * @param {string[]} [options.defaultPriority=['undraw', 'openpeeps', 'iradesign']]
   */
  constructor(options = {}) {
    if (!options.registry) {
      throw new Error('FallbackManager requires a ProviderRegistry instance');
    }
    this.registry = options.registry;
    this.cache = options.cache || defaultCache;
    this.defaultPriority = options.defaultPriority || ['undraw', 'openpeeps', 'iradesign'];

    /** @type {Map<string, { attempts: number, successes: number, failures: number, lastError: string|null, latencyMs: number }>} */
    this.metrics = new Map();
  }

  /**
   * Record health metrics for a provider
   */
  _recordMetric(providerId, success, error = null, latencyMs = 0) {
    const id = providerId.toLowerCase();
    const curr = this.metrics.get(id) || {
      attempts: 0,
      successes: 0,
      failures: 0,
      lastError: null,
      latencyMs: 0,
    };

    curr.attempts += 1;
    curr.latencyMs = latencyMs;
    if (success) {
      curr.successes += 1;
      curr.lastError = null;
    } else {
      curr.failures += 1;
      curr.lastError = error ? (error.message || String(error)) : 'Unknown error';
    }

    this.metrics.set(id, curr);
  }

  /**
   * Search across providers with resilient fallback or multi-query aggregation
   * @param {string} query
   * @param {Object} [options]
   * @param {'auto'|'all'|string} [options.provider='auto'] - Specific ID, 'all' for multi-search, or 'auto' for cascade
   * @param {number} [options.limit=10]
   * @param {boolean} [options.noCache=false]
   * @returns {Promise<{ results: import('./types').Illustration[], providerUsed: string, fallbacksTriggered: string[] }>}
   */
  async search(query, options = {}) {
    const providerOption = (options.provider || 'auto').toLowerCase();
    const cacheKey = `search_${query}_${providerOption}_${options.limit || 10}`;

    if (!options.noCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    // 1. Multi-provider aggregation ('all')
    if (providerOption === 'all') {
      const approvedProviders = this.registry.list({ status: 'approved', enabledOnly: true });
      const settled = await Promise.allSettled(
        approvedProviders.map(async (p) => {
          const start = Date.now();
          try {
            const results = await p.search({ term: query, limit: options.limit || 10 });
            this._recordMetric(p.id, true, null, Date.now() - start);
            return results;
          } catch (err) {
            this._recordMetric(p.id, false, err, Date.now() - start);
            return [];
          }
        })
      );

      const combined = [];
      settled.forEach((res) => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          combined.push(...res.value);
        }
      });

      const response = {
        results: combined,
        providerUsed: 'all',
        fallbacksTriggered: [],
      };

      if (!options.noCache) this.cache.set(cacheKey, response, 300000); // 5 min
      return response;
    }

    // 2. Specific single provider
    if (providerOption !== 'auto') {
      const p = this.registry.get(providerOption);
      if (!p) {
        throw new Error(`Provider "${providerOption}" is not registered`);
      }
      if (!this.registry.isEnabled(providerOption)) {
        throw new Error(`Provider "${providerOption}" is disabled`);
      }

      const start = Date.now();
      try {
        const results = await p.search({ term: query, limit: options.limit || 10 });
        this._recordMetric(p.id, true, null, Date.now() - start);
        const response = {
          results,
          providerUsed: p.id,
          fallbacksTriggered: [],
        };
        if (!options.noCache) this.cache.set(cacheKey, response, 300000);
        return response;
      } catch (err) {
        this._recordMetric(p.id, false, err, Date.now() - start);
        throw err;
      }
    }

    // 3. 'auto' mode: Cascading fallback across defaultPriority
    const fallbacksTriggered = [];
    let lastError = null;

    for (const pid of this.defaultPriority) {
      const p = this.registry.get(pid);
      if (!p || !this.registry.isEnabled(pid)) continue;

      const start = Date.now();
      try {
        const results = await p.search({ term: query, limit: options.limit || 10 });
        this._recordMetric(p.id, true, null, Date.now() - start);

        if (results && results.length > 0) {
          const response = {
            results,
            providerUsed: p.id,
            fallbacksTriggered,
          };
          if (!options.noCache) this.cache.set(cacheKey, response, 300000);
          return response;
        }

        // 0 results -> record fallback and continue chain
        fallbacksTriggered.push(p.id);
      } catch (err) {
        this._recordMetric(p.id, false, err, Date.now() - start);
        fallbacksTriggered.push(p.id);
        lastError = err;
      }
    }

    // If all providers returned 0 or errored
    const finalResponse = {
      results: [],
      providerUsed: 'none',
      fallbacksTriggered,
      error: lastError ? lastError.message : null,
    };
    return finalResponse;
  }

  /**
   * Download asset with provider check
   * @param {string} providerId
   * @param {string} id
   * @param {Object} [options]
   * @returns {Promise<import('./types').IllustrationAsset>}
   */
  async download(providerId, id, options = {}) {
    const p = this.registry.get(providerId);
    if (!p) {
      throw new Error(`Provider "${providerId}" not found`);
    }

    if (p.status !== 'approved') {
      throw new Error(
        `Provider "${providerId}" has status "${p.status}". Automated download is forbidden. Please visit ${p.url || 'the official website'} directly.`
      );
    }

    const start = Date.now();
    try {
      const asset = await p.download(id, options);
      this._recordMetric(providerId, true, null, Date.now() - start);
      return asset;
    } catch (err) {
      this._recordMetric(providerId, false, err, Date.now() - start);
      throw err;
    }
  }

  /**
   * Get health metrics for all providers
   * @returns {Object.<string, { attempts: number, successes: number, failures: number, lastError: string|null, latencyMs: number }>}
   */
  getHealth() {
    const out = {};
    for (const [id, metric] of this.metrics.entries()) {
      out[id] = { ...metric };
    }
    return out;
  }
}

module.exports = {
  FallbackManager,
};
