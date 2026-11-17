const test = require('node:test');
const assert = require('node:assert');
const { ProviderRegistry } = require('../src/core/registry');

test('ProviderRegistry: registers and retrieves providers', () => {
  const registry = new ProviderRegistry();
  const mockProvider = {
    id: 'test-prov',
    name: 'Test Provider',
    description: 'Mock',
    license: { type: 'MIT', name: 'MIT', commercialUse: true, attributionRequired: false },
    status: 'approved',
    getCapabilities: () => ({ search: true, directDownload: true, colorCustomization: true, formats: ['svg'] }),
    search: async () => [],
    getIllustration: async () => ({}),
    download: async () => ({}),
  };

  registry.register(mockProvider);
  assert.strictEqual(registry.has('test-prov'), true);
  assert.strictEqual(registry.get('test-prov').name, 'Test Provider');
  assert.strictEqual(registry.isEnabled('test-prov'), true);

  // Toggle
  registry.setEnabled('test-prov', false);
  assert.strictEqual(registry.isEnabled('test-prov'), false);
  assert.strictEqual(registry.list({ enabledOnly: true }).length, 0);
  assert.strictEqual(registry.list().length, 1);
});

test('ProviderRegistry: filters by capability and status', () => {
  const registry = new ProviderRegistry();
  registry.register({
    id: 'prov-a',
    status: 'approved',
    getCapabilities: () => ({ search: true, directDownload: true, composition: false }),
  });
  registry.register({
    id: 'prov-b',
    status: 'manual_only',
    getCapabilities: () => ({ search: true, directDownload: false, composition: true }),
  });

  assert.strictEqual(registry.list({ status: 'approved' }).length, 1);
  assert.strictEqual(registry.list({ status: 'manual_only' }).length, 1);
  assert.strictEqual(registry.list({ capability: 'composition' }).length, 1);
  assert.strictEqual(registry.list({ capability: 'directDownload' })[0].id, 'prov-a');
});
