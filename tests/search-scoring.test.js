const test = require('node:test');
const assert = require('node:assert');
const { SearchEngine } = require('../src/core/search-engine');
const { ScoringEngine } = require('../src/core/scoring-engine');
const { registry } = require('../src/core/registry');
const { OpenPeepsProvider } = require('../src/providers/openpeeps.provider');
const { IraDesignProvider } = require('../src/providers/iradesign.provider');

test('SearchEngine: inspects banking login context correctly', () => {
  const context = SearchEngine.inspectProject(process.cwd(), 'page de connexion dans une application bancaire');
  assert.strictEqual(context.component, 'auth');
  assert.strictEqual(context.mood, 'professional');
  assert.strictEqual(context.style, 'gradient'); // Fintech prefers gradient
});

test('SearchEngine: inspects team avatar context correctly', () => {
  const context = SearchEngine.inspectProject(process.cwd(), 'equipe et collaborateurs');
  assert.strictEqual(context.component, 'team');
  assert.strictEqual(context.style, 'avatar');
});

test('ScoringEngine: computes 6-dimensional score breakdown', () => {
  const mockIllustration = {
    id: 'openpeeps:standing-laptop',
    title: 'Developer Standing with Laptop',
    slug: 'openpeeps-standing-laptop',
    providerId: 'openpeeps',
    status: 'approved',
    license: { type: 'CC0-1.0' },
    tags: ['developer', 'coding', 'laptop', 'hero'],
  };

  const query = { prompt: 'developer coding' };
  const context = { component: 'hero', style: 'avatar' };

  const { total, breakdown } = ScoringEngine.score(mockIllustration, query, context);
  assert.ok(total > 70);
  assert.ok(breakdown.semantic > 0);
  assert.ok(breakdown.component > 0);
  assert.ok(breakdown.style > 0);
  assert.strictEqual(breakdown.license, 10); // CC0 gets max
});

test('SearchEngine: searches registered providers and ranks results', async () => {
  registry.register(new OpenPeepsProvider());
  registry.register(new IraDesignProvider());

  const results = await SearchEngine.search({
    prompt: 'analytics dashboard',
    limit: 2,
  });

  assert.ok(results.length > 0);
  // Highest scored result should be first
  assert.ok(results[0].relevanceScore >= (results[1]?.relevanceScore || 0));
  assert.ok(results[0].slug.includes('analytics'));
});
