const test = require('node:test');
const assert = require('node:assert/strict');
const { CustomizationEngine } = require('../src/core/customization-engine.js');

test('CustomizationEngine - sanitize removes malicious elements', () => {
  const dirtySvg = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Comment to remove -->
      <script>alert("xss")</script>
      <circle cx="50" cy="50" r="40" fill="#6c63ff" onclick="malicious()" onload="evil()" />
      <a href="javascript:alert(1)">
        <path d="M10 10 L90 90" xlink:href="javascript:doEvil()" />
      </a>
    </svg>
  `;

  const clean = CustomizationEngine.sanitize(dirtySvg);

  assert.ok(!clean.includes('<script>'), 'Should remove script tag');
  assert.ok(!clean.includes('alert("xss")'), 'Should remove script content');
  assert.ok(!clean.includes('onclick='), 'Should remove onclick handler');
  assert.ok(!clean.includes('onload='), 'Should remove onload handler');
  assert.ok(!clean.includes('javascript:'), 'Should remove javascript: pseudo-protocol');
  assert.ok(!clean.includes('<!-- Comment'), 'Should remove comments');
  assert.ok(clean.includes('<circle'), 'Should preserve circle element');
  assert.ok(clean.includes('cx="50"'), 'Should preserve valid attributes');
});

test('CustomizationEngine - customize applies brand colors and gradients', () => {
  const undrawSvg = '<svg><path fill="#6c63ff" d="M0 0h10v10H0z"/><circle fill="rgb(108, 99, 255)"/></svg>';
  const customizedUndraw = CustomizationEngine.customize(undrawSvg, {
    primaryColor: '#10B981',
  });

  assert.ok(customizedUndraw.includes('#10B981'), 'Should replace primary hex color');
  assert.ok(!customizedUndraw.includes('#6c63ff'), 'Should not contain old hex');
  assert.ok(!customizedUndraw.includes('rgb(108, 99, 255)'), 'Should not contain old rgb');

  const gradientSvg = `
    <svg>
      <defs>
        <linearGradient id="grad">
          <stop id="ira-stop-start" stop-color="#3B82F6" />
          <stop id="ira-stop-end" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  `;
  const customizedGradient = CustomizationEngine.customize(gradientSvg, {
    primaryColor: '#EC4899',
    accentColor: '#F59E0B',
  });

  assert.ok(customizedGradient.includes('id="ira-stop-start" stop-color="#EC4899"'), 'Should customize gradient start stop');
  assert.ok(customizedGradient.includes('id="ira-stop-end" stop-color="#F59E0B"'), 'Should customize gradient end stop');
});

test('CustomizationEngine - dark mode adaptation', () => {
  const lightSvg = '<svg><rect fill="#2f2e41"/><path fill="#3f3d56"/><path stroke="#000000"/><circle fill="#ffffff"/></svg>';
  const darkAdapted = CustomizationEngine.customize(lightSvg, {
    isDarkMode: true,
  });

  assert.ok(darkAdapted.includes('#94A3B8'), 'Dark charcoal #2f2e41 should be softened to slate-400 #94A3B8');
  assert.ok(darkAdapted.includes('#CBD5E1'), 'Medium charcoal #3f3d56 should be softened to slate-300 #CBD5E1');
  assert.ok(darkAdapted.includes('stroke="#F8FAFC"'), 'Black stroke should be brightened');
  assert.ok(darkAdapted.includes('fill="#1E293B"'), 'White background should be adapted to dark surface');
});

test('CustomizationEngine - accessibility enhancements', () => {
  const svg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
  const accessible = CustomizationEngine.customize(svg, {
    title: 'Connexion sécurisée',
  });

  assert.ok(accessible.includes('role="img"'), 'Should add role="img"');
  assert.ok(accessible.includes('aria-label="Connexion sécurisée"'), 'Should add aria-label');
  assert.ok(accessible.includes('<title>Connexion sécurisée</title>'), 'Should add <title> element');

  // Should not duplicate title if already present
  const alreadyAccessible = CustomizationEngine.customize(accessible, {
    title: 'Connexion sécurisée',
  });
  const matches = (alreadyAccessible.match(/<title>/g) || []).length;
  assert.equal(matches, 1, 'Should not add duplicate <title>');
});
