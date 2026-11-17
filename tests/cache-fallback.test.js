const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { CacheManager } = require('../src/core/cache-manager.js');
const { FallbackManager } = require('../src/core/fallback-manager.js');
const { ProviderRegistry } = require('../src/core/registry.js');

test('CacheManager - memory and TTL', async () => {
  const tmpDir = path.join(os.tmpdir(), `cache-test-${Date.now()}`);
  const cache = new CacheManager({
    cacheDir: tmpDir,
    defaultTTL: 50, // 50ms for test
  });

  try {
    cache.set('foo', { bar: 123 }, 50);
    assert.equal(cache.has('foo'), true);
    assert.deepEqual(cache.get('foo'), { bar: 123 });

    // Wait 70ms for TTL expiry
    await new Promise((resolve) => setTimeout(resolve, 70));

    assert.equal(cache.get('foo'), null);
    assert.equal(cache.has('foo'), false);
  } finally {
    cache.clear();
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('FallbackManager - cascades to second provider when first returns empty', async () => {
  const registry = new ProviderRegistry();

  const providerA = {
    id: 'provA',
    name: 'Provider A',
    status: 'approved',
    getCapabilities: () => ({ search: true, download: true }),
    search: async () => [], // returns empty
    download: async () => ({ content: '', mimeType: 'image/svg+xml' }),
  };

  const providerB = {
    id: 'provB',
    name: 'Provider B',
    status: 'approved',
    getCapabilities: () => ({ search: true, download: true }),
    search: async () => [
      { id: 'item1', title: 'Found in B', provider: 'provB', url: 'https://example.com' },
    ],
    download: async () => ({ content: '<svg></svg>', mimeType: 'image/svg+xml' }),
  };

  registry.register(providerA);
  registry.register(providerB);

  const fallback = new FallbackManager({
    registry,
    defaultPriority: ['provA', 'provB'],
  });

  const res = await fallback.search('anything', { noCache: true });

  assert.equal(res.providerUsed, 'provB', 'Should use provider B');
  assert.equal(res.results.length, 1);
  assert.deepEqual(res.fallbacksTriggered, ['provA'], 'Provider A should be marked as triggered fallback');

  const health = fallback.getHealth();
  assert.equal(health.prova.attempts, 1);
  assert.equal(health.provb.attempts, 1);
  assert.equal(health.provb.successes, 1);
});

test('FallbackManager - blocks download on manual_only providers', async () => {
  const registry = new ProviderRegistry();
  const manualProvider = {
    id: 'manualProv',
    name: 'Manual Prov',
    status: 'manual_only',
    url: 'https://manual.example.com',
    getCapabilities: () => ({ search: false, download: false }),
    search: async () => [],
    download: async () => {},
  };

  registry.register(manualProvider);

  const fallback = new FallbackManager({ registry });

  await assert.rejects(
    async () => {
      await fallback.download('manualProv', 'some-id');
    },
    /has status "manual_only". Automated download is forbidden/
  );
});
