/**
 * Cache Manager for Illustration Search & Asset Caching
 * Provides memory caching and optional persistent disk cache with TTL.
 * @module core/cache-manager
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

class CacheManager {
  /**
   * @param {Object} [options]
   * @param {number} [options.defaultTTL=3600000] - Default TTL in ms (1 hour)
   * @param {string} [options.cacheDir] - Directory for disk cache
   * @param {boolean} [options.diskEnabled=true]
   */
  constructor(options = {}) {
    this.defaultTTL = options.defaultTTL || 3600000; // 1h
    this.diskEnabled = options.diskEnabled !== false;
    this.cacheDir = options.cacheDir || path.join(os.tmpdir(), 'tidjan-undraw-cache');
    this.memoryCache = new Map();

    if (this.diskEnabled) {
      try {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      } catch (_) {}
    }
  }

  /**
   * Generate safe cache key from arguments
   * @param {string} prefix
   * @param {any} data
   * @returns {string}
   */
  static hashKey(prefix, data) {
    const raw = typeof data === 'string' ? data : JSON.stringify(data || {});
    const hash = crypto.createHash('md5').update(raw).digest('hex').slice(0, 16);
    return `${prefix}_${hash}`;
  }

  /**
   * Get cached item
   * @param {string} key
   * @returns {any|null}
   */
  get(key) {
    const now = Date.now();

    // 1. Check memory
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key);
      if (entry.expiresAt > now) {
        return entry.value;
      }
      this.memoryCache.delete(key);
    }

    // 2. Check disk
    if (this.diskEnabled) {
      const filePath = path.join(this.cacheDir, `${key}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf8');
          const entry = JSON.parse(raw);
          if (entry.expiresAt > now) {
            // Restore to memory
            this.memoryCache.set(key, entry);
            return entry.value;
          }
          fs.unlinkSync(filePath);
        } catch (_) {}
      }
    }

    return null;
  }

  /**
   * Store item in cache
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlMs]
   */
  set(key, value, ttlMs) {
    const ttl = typeof ttlMs === 'number' ? ttlMs : this.defaultTTL;
    const entry = {
      value,
      expiresAt: Date.now() + ttl,
    };

    this.memoryCache.set(key, entry);

    if (this.diskEnabled) {
      try {
        const filePath = path.join(this.cacheDir, `${key}.json`);
        fs.writeFileSync(filePath, JSON.stringify(entry), 'utf8');
      } catch (_) {}
    }
  }

  /**
   * Check if cache has key
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete entry
   * @param {string} key
   */
  delete(key) {
    this.memoryCache.delete(key);
    if (this.diskEnabled) {
      try {
        const filePath = path.join(this.cacheDir, `${key}.json`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (_) {}
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear();
    if (this.diskEnabled && fs.existsSync(this.cacheDir)) {
      try {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            fs.unlinkSync(path.join(this.cacheDir, file));
          }
        }
      } catch (_) {}
    }
  }
}

// Global shared singleton
const defaultCache = new CacheManager();

module.exports = {
  CacheManager,
  defaultCache,
};
