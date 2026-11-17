const test = require('node:test');
const assert = require('node:assert');
const { StorysetProvider } = require('../src/providers/storyset.provider');
const { DrawKitProvider } = require('../src/providers/drawkit.provider');
const { ManyPixelsProvider } = require('../src/providers/manypixels.provider');

test('StorysetProvider: status is manual_only and attribution required', async () => {
  const provider = new StorysetProvider();
  assert.strictEqual(provider.id, 'storyset');
  assert.strictEqual(provider.status, 'manual_only');
  assert.strictEqual(provider.license.attributionRequired, true);

  const results = await provider.search({ prompt: 'login authentication' });
  assert.ok(results.length > 0);
  assert.ok(results[0].manualUrl.includes('storyset.com/search'));

  await assert.rejects(
    async () => {
      await provider.download('some-id');
    },
    /prohibited by Freepik Company Terms/
  );
});

test('DrawKitProvider: status is manual_only and download guarded', async () => {
  const provider = new DrawKitProvider();
  assert.strictEqual(provider.status, 'manual_only');

  const results = await provider.search({ prompt: 'fintech' });
  assert.ok(results.length > 0);
  assert.ok(results[0].manualUrl.includes('drawkit.com'));

  await assert.rejects(
    async () => {
      await provider.download('some-id');
    },
    /Compliance Guard/
  );
});

test('ManyPixelsProvider: status is manual_only and download guarded', async () => {
  const provider = new ManyPixelsProvider();
  assert.strictEqual(provider.status, 'manual_only');

  const results = await provider.search({ prompt: 'marketing' });
  assert.ok(results.length > 0);
  assert.ok(results[0].manualUrl.includes('manypixels.co'));

  await assert.rejects(
    async () => {
      await provider.download('some-id');
    },
    /prohibited by their terms of service/
  );
});
