const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { IntegrationEngine } = require('../src/core/integration-engine.js');

test('IntegrationEngine - formatComponentName', () => {
  assert.equal(IntegrationEngine.formatComponentName('page-not-found'), 'PageNotFoundIllustration');
  assert.equal(IntegrationEngine.formatComponentName('login_screen'), 'LoginScreenIllustration');
  assert.equal(IntegrationEngine.formatComponentName('HeroIllustration'), 'HeroIllustration');
  assert.equal(IntegrationEngine.formatComponentName(''), 'Illustration');
});

test('IntegrationEngine - generates React TSX component', () => {
  const code = IntegrationEngine.generateReact({
    slug: 'team-work',
    title: 'Team Work',
    assetPath: '/illustrations/team-work.svg',
  });

  assert.ok(code.includes("export const TeamWorkIllustration: React.FC"), 'Should export named React component');
  assert.ok(code.includes("src=\"/illustrations/team-work.svg\""), 'Should link correct asset path');
  assert.ok(code.includes("export default TeamWorkIllustration;"), 'Should export default');
});

test('IntegrationEngine - generates Next.js Image component', () => {
  const code = IntegrationEngine.generateNext({
    slug: 'cloud-hosting',
    title: 'Cloud Hosting',
    assetPath: '/illustrations/cloud-hosting.svg',
  });

  assert.ok(code.includes("import Image from 'next/image';"), 'Should import Image from next/image');
  assert.ok(code.includes("priority={priority}"), 'Should have priority prop');
  assert.ok(code.includes("export const CloudHostingIllustration"), 'Should export Next.js component');
});

test('IntegrationEngine - generates Vue 3 SFC', () => {
  const code = IntegrationEngine.generateVue({
    slug: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    assetPath: '/illustrations/analytics.svg',
  });

  assert.ok(code.includes("<template>"), 'Should have Vue template');
  assert.ok(code.includes("<script setup lang=\"ts\">"), 'Should use script setup TypeScript');
  assert.ok(code.includes("withDefaults("), 'Should have withDefaults for props');
});

test('IntegrationEngine - generates Svelte component', () => {
  const code = IntegrationEngine.generateSvelte({
    slug: 'empty-cart',
    title: 'Empty Cart',
    assetPath: '/illustrations/empty-cart.svg',
  });

  assert.ok(code.includes("<script lang=\"ts\">"), 'Should have Svelte TypeScript script');
  assert.ok(code.includes("export let src: string = '/illustrations/empty-cart.svg';"), 'Should have exported props');
});

test('IntegrationEngine - generates Flutter widget', () => {
  const code = IntegrationEngine.generateFlutter({
    slug: 'secure-login',
    title: 'Secure Login',
  });

  assert.ok(code.includes("import 'package:flutter_svg/flutter_svg.dart';"), 'Should import flutter_svg');
  assert.ok(code.includes("class SecureLoginIllustration extends StatelessWidget"), 'Should create StatelessWidget');
  assert.ok(code.includes("SvgPicture.asset"), 'Should use SvgPicture.asset');
});

test('IntegrationEngine - anti-duplicate and writeFileSafe', () => {
  const tmpDir = path.join(os.tmpdir(), `undraw-test-${Date.now()}`);
  const targetFile = path.join(tmpDir, 'test-illustration.svg');
  const sampleContent = '<svg><circle cx="50" cy="50" r="40"/></svg>';

  try {
    // 1. Initial write
    const res1 = IntegrationEngine.writeFileSafe(targetFile, sampleContent);
    assert.equal(res1.written, true, 'First write should succeed');
    assert.equal(res1.existed, false, 'File did not exist previously');

    // 2. Second write with identical content without force
    const res2 = IntegrationEngine.writeFileSafe(targetFile, sampleContent);
    assert.equal(res2.written, false, 'Second write without force should be skipped');
    assert.equal(res2.existed, true, 'File already existed');
    assert.equal(res2.identical, true, 'Content is identical');

    // 3. Third write with force=true
    const res3 = IntegrationEngine.writeFileSafe(targetFile, sampleContent, { force: true });
    assert.equal(res3.written, true, 'Write with force should succeed');
    assert.equal(res3.existed, true, 'File existed');
  } finally {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
});
