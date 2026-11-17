const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { UndrawProvider } = require('../src/providers/undraw.provider');

test('UndrawProvider: metadata and capabilities', () => {
  const provider = new UndrawProvider();
  assert.strictEqual(provider.id, 'undraw');
  assert.strictEqual(provider.name, 'unDraw');
  assert.strictEqual(provider.status, 'approved');
  assert.strictEqual(provider.license.commercialUse, true);

  const caps = provider.getCapabilities();
  assert.strictEqual(caps.search, true);
  assert.strictEqual(caps.directDownload, true);
  assert.strictEqual(caps.colorCustomization, true);
});

test('UndrawProvider: handles short/empty query safely', async () => {
  const provider = new UndrawProvider();
  const res1 = await provider.search({ prompt: '' });
  assert.deepStrictEqual(res1, []);

  const res2 = await provider.search({ prompt: 'ab' });
  assert.deepStrictEqual(res2, []);
});

test('UndrawProvider: searches live API and normalizes results', async () => {
  const provider = new UndrawProvider();
  const results = await provider.search({ prompt: 'teamwork', limit: 2 });
  assert.ok(Array.isArray(results));
  if (results.length > 0) {
    const item = results[0];
    assert.ok(item.id.startsWith('undraw:'));
    assert.strictEqual(item.providerId, 'undraw');
    assert.strictEqual(item.status, 'approved');
    assert.ok(item.svgUrl.includes('cdn.undraw.co'));
  }
});

test('UndrawProvider: downloads, applies brand color and caches', async () => {
  const provider = new UndrawProvider();
  const tmpDir = path.join(os.tmpdir(), `undraw-test-${Date.now()}`);

  try {
    const asset = await provider.download('teamwork_zplp', {
      outputDir: tmpDir,
      primaryColor: '#E11D48',
    });

    assert.strictEqual(asset.cached, false);
    assert.strictEqual(fs.existsSync(asset.filePath), true);
    assert.ok(asset.content.includes('#E11D48'));
    assert.ok(!asset.content.includes('#6c63ff'));

    // Anti-duplicate test
    const cachedAsset = await provider.download('teamwork_zplp', {
      outputDir: tmpDir,
      primaryColor: '#000000',
    });
    assert.strictEqual(cachedAsset.cached, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
