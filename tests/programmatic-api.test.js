const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  getProviders,
  auditLicenses,
  searchIllustrations,
  integrateIllustration,
  customizeIllustration,
  registry,
} = require('../src/index.js');

test('Programmatic API - getProviders lists 6 registered providers', () => {
  const providers = getProviders();
  assert.equal(providers.length, 6, 'Should have 6 registered providers');
  const ids = providers.map((p) => p.id);
  assert.ok(ids.includes('undraw'), 'Should include undraw');
  assert.ok(ids.includes('openpeeps'), 'Should include openpeeps');
  assert.ok(ids.includes('iradesign'), 'Should include iradesign');
  assert.ok(ids.includes('storyset'), 'Should include storyset');
  assert.ok(ids.includes('drawkit'), 'Should include drawkit');
  assert.ok(ids.includes('manypixels'), 'Should include manypixels');
});

test('Programmatic API - auditLicenses verifies compliance breakdown', () => {
  const audit = auditLicenses();
  assert.equal(audit.length, 6);

  const undraw = audit.find((p) => p.id === 'undraw');
  assert.equal(undraw.status, 'approved');

  const openpeeps = audit.find((p) => p.id === 'openpeeps');
  assert.equal(openpeeps.status, 'approved');

  const storyset = audit.find((p) => p.id === 'storyset');
  assert.equal(storyset.status, 'manual_only');
  assert.equal(storyset.compliance.allowedForAutomatedDownload, false);
});

test('Programmatic API - searchIllustrations ranks candidates with score breakdown', async () => {
  const results = await searchIllustrations('page not found error', {
    providers: ['openpeeps', 'iradesign'],
  });

  assert.ok(Array.isArray(results), 'Should return array of results');
  assert.ok(results.length > 0, 'Should return matching candidates');

  const top = results[0];
  assert.ok(top.score >= 0 && top.score <= 100, 'Score should be between 0 and 100');
  assert.ok(top.scoreBreakdown, 'Should include scoreBreakdown');
  assert.ok(typeof top.scoreBreakdown.semantic === 'number');
  assert.ok(typeof top.scoreBreakdown.component === 'number');
});

test('Programmatic API - customizeIllustration colorizes SVG', () => {
  const raw = '<svg><path fill="#6c63ff"/></svg>';
  const customized = customizeIllustration(raw, {
    primaryColor: '#3B82F6',
  });
  assert.ok(customized.includes('#3B82F6'));
  assert.ok(!customized.includes('#6c63ff'));
});

test('Programmatic API - integrateIllustration creates component and SVG', async () => {
  const tmpDir = path.join(os.tmpdir(), `api-test-${Date.now()}`);

  try {
    const res = await integrateIllustration({
      slug: 'security-badge',
      title: 'Security Badge',
      svgContent: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#6c63ff"/></svg>',
      framework: 'react',
      cwd: tmpDir,
      primaryColor: '#10B981',
      force: true,
    });

    assert.equal(res.framework, 'react');
    assert.equal(res.compName, 'SecurityBadgeIllustration');
    assert.equal(res.svgResult.written, true);
    assert.equal(res.componentResult.written, true);

    const svgOnDisk = fs.readFileSync(res.svgResult.path, 'utf8');
    assert.ok(svgOnDisk.includes('<circle'), 'SVG should be written correctly');

    const compOnDisk = fs.readFileSync(res.componentResult.path, 'utf8');
    assert.ok(compOnDisk.includes('SecurityBadgeIllustration: React.FC'), 'Component should be generated correctly');
  } finally {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
});
