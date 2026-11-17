const test = require('node:test');
const assert = require('node:assert');
const { LicenseManager, PROVIDER_LICENSES } = require('../src/core/license-manager');

test('LicenseManager: validates approved providers', () => {
  assert.strictEqual(LicenseManager.getStatus('openpeeps'), 'approved');
  assert.strictEqual(LicenseManager.getStatus('iradesign'), 'approved');
  assert.strictEqual(LicenseManager.getStatus('undraw'), 'approved');

  assert.strictEqual(LicenseManager.isApproved('openpeeps'), true);
  assert.strictEqual(LicenseManager.isApproved('undraw'), true);
});

test('LicenseManager: validates manual_only providers', () => {
  assert.strictEqual(LicenseManager.getStatus('storyset'), 'manual_only');
  assert.strictEqual(LicenseManager.getStatus('drawkit'), 'manual_only');
  assert.strictEqual(LicenseManager.getStatus('manypixels'), 'manual_only');

  assert.strictEqual(LicenseManager.isApproved('storyset'), false);
  assert.strictEqual(LicenseManager.isAttributionRequired('storyset'), true);
});

test('LicenseManager: blocks unknown providers by default', () => {
  assert.strictEqual(LicenseManager.getStatus('unknown_sketch_site'), 'blocked');
  assert.strictEqual(LicenseManager.isApproved('unknown_sketch_site'), false);
});

test('LicenseManager: formats attribution text correctly', () => {
  const attr = LicenseManager.getAttributionText('storyset', 'Login Screen');
  assert.ok(attr.includes('Storyset'));
  assert.ok(attr.includes('Login Screen'));
});

test('LicenseManager: generates audit report of all providers', () => {
  const audit = LicenseManager.auditAll();
  assert.ok(Array.isArray(audit));
  assert.strictEqual(audit.length, 6);
  assert.ok(audit.some(p => p.providerId === 'openpeeps' && p.status === 'approved'));
  assert.ok(audit.some(p => p.providerId === 'storyset' && p.status === 'manual_only'));
});
