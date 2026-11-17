const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { OpenPeepsProvider } = require('../src/providers/openpeeps.provider');
const { IraDesignProvider } = require('../src/providers/iradesign.provider');

test('OpenPeepsProvider: capabilities and search', async () => {
  const provider = new OpenPeepsProvider();
  assert.strictEqual(provider.id, 'openpeeps');
  assert.strictEqual(provider.status, 'approved');
  assert.strictEqual(provider.license.type, 'CC0-1.0');
  assert.strictEqual(provider.getCapabilities().composition, true);

  const results = await provider.search({ prompt: 'developer coding laptop' });
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].slug, 'openpeeps-standing-laptop');
});

test('OpenPeepsProvider: downloads and applies custom colors', async () => {
  const provider = new OpenPeepsProvider();
  const tmpDir = path.join(os.tmpdir(), `peeps-test-${Date.now()}`);

  try {
    const asset = await provider.download('standing-laptop', {
      outputDir: tmpDir,
      primaryColor: '#059669',
      isDarkMode: true,
    });

    assert.strictEqual(asset.cached, false);
    assert.strictEqual(fs.existsSync(asset.filePath), true);
    assert.ok(asset.content.includes('#059669'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('IraDesignProvider: capabilities, search and gradient customization', async () => {
  const provider = new IraDesignProvider();
  assert.strictEqual(provider.id, 'iradesign');
  assert.strictEqual(provider.status, 'approved');
  assert.strictEqual(provider.license.type, 'MIT');
  assert.strictEqual(provider.getCapabilities().gradientCustomization, true);

  const results = await provider.search({ prompt: 'analytics charts data' });
  assert.ok(results.length > 0);
  assert.strictEqual(results[0].slug, 'ira-analytics-dashboard');

  const tmpDir = path.join(os.tmpdir(), `ira-test-${Date.now()}`);
  try {
    const asset = await provider.download('analytics-dashboard', {
      outputDir: tmpDir,
      primaryColor: '#F43F5E',
      accentColor: '#FB7185',
    });

    assert.strictEqual(asset.cached, false);
    assert.ok(asset.content.includes('#F43F5E'));
    assert.ok(asset.content.includes('#FB7185'));
    assert.ok(asset.attributionText.includes('Creative Tim'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
