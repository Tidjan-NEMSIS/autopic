/**
 * Multi-framework Code Generation & Asset Integration Engine
 * Generates type-safe components for React, Next.js, Vue 3, Svelte, Flutter, and HTML/CSS.
 * Handles anti-duplicate verification and safe disk operations.
 * @module core/integration-engine
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class IntegrationEngine {
  /**
   * Format title/slug into a PascalCase component name
   * @param {string} name
   * @returns {string}
   */
  static formatComponentName(name) {
    if (!name || typeof name !== 'string') return 'Illustration';

    // Insert space before uppercase letters if preceded by lowercase
    const spaced = name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9\s-_]/g, ' ')
      .trim();

    const parts = spaced
      .split(/[\s-_]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());

    let base = parts.join('') || 'Custom';
    if (!/illustration$/i.test(base)) {
      base = `${base}Illustration`;
    } else {
      base = base.replace(/illustration$/i, 'Illustration');
    }
    return base;
  }

  /**
   * Detect framework used in the target project directory
   * @param {string} [cwd=process.cwd()]
   * @returns {'next'|'react'|'vue'|'svelte'|'flutter'|'html'}
   */
  static detectFramework(cwd = process.cwd()) {
    // 1. Flutter detection
    if (fs.existsSync(path.join(cwd, 'pubspec.yaml'))) {
      return 'flutter';
    }

    // 2. Node package.json detection
    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps['next']) return 'next';
        if (deps['nuxt'] || deps['vue']) return 'vue';
        if (deps['svelte'] || deps['@sveltejs/kit']) return 'svelte';
        if (deps['react']) return 'react';
      } catch (_) {}
    }

    return 'html';
  }

  /**
   * Determine the best destination directory for assets and components
   * @param {string} framework
   * @param {string} [cwd=process.cwd()]
   * @returns {{ assetDir: string, componentDir: string, publicAssetPrefix: string }}
   */
  static resolveProjectPaths(framework, cwd = process.cwd()) {
    let assetDir = path.join(cwd, 'public', 'illustrations');
    let componentDir = path.join(cwd, 'components', 'illustrations');
    let publicAssetPrefix = '/illustrations';

    if (framework === 'flutter') {
      assetDir = path.join(cwd, 'assets', 'illustrations');
      componentDir = path.join(cwd, 'lib', 'widgets', 'illustrations');
      publicAssetPrefix = 'assets/illustrations';
      return { assetDir, componentDir, publicAssetPrefix };
    }

    const hasSrc = fs.existsSync(path.join(cwd, 'src'));

    if (framework === 'svelte') {
      componentDir = hasSrc
        ? path.join(cwd, 'src', 'lib', 'illustrations')
        : path.join(cwd, 'components', 'illustrations');
    } else if (hasSrc && !fs.existsSync(path.join(cwd, 'components'))) {
      componentDir = path.join(cwd, 'src', 'components', 'illustrations');
    }

    // If no public/ directory exists (e.g. standard Vite or vanilla)
    if (!fs.existsSync(path.join(cwd, 'public')) && hasSrc) {
      assetDir = path.join(cwd, 'src', 'assets', 'illustrations');
      publicAssetPrefix = '@/assets/illustrations';
    }

    return { assetDir, componentDir, publicAssetPrefix };
  }

  /**
   * Check if a file already exists and whether its content is identical
   * @param {string} filePath
   * @param {string} content
   * @returns {{ exists: boolean, identical: boolean, hash: string }}
   */
  static checkDuplicate(filePath, content) {
    const currentHash = crypto.createHash('sha256').update(content || '').digest('hex');

    if (!fs.existsSync(filePath)) {
      return { exists: false, identical: false, hash: currentHash };
    }

    try {
      const existingContent = fs.readFileSync(filePath, 'utf8');
      const existingHash = crypto.createHash('sha256').update(existingContent).digest('hex');
      return {
        exists: true,
        identical: existingHash === currentHash,
        hash: currentHash,
      };
    } catch (_) {
      return { exists: true, identical: false, hash: currentHash };
    }
  }

  /**
   * Safely write content to disk with anti-duplicate prevention
   * @param {string} filePath
   * @param {string} content
   * @param {Object} [options]
   * @param {boolean} [options.force=false]
   * @returns {{ written: boolean, existed: boolean, identical: boolean, path: string }}
   */
  static writeFileSafe(filePath, content, options = {}) {
    const { force = false } = options;
    const dupCheck = this.checkDuplicate(filePath, content);

    if (dupCheck.exists && !force) {
      return {
        written: false,
        existed: true,
        identical: dupCheck.identical,
        path: filePath,
        reason: dupCheck.identical
          ? 'Identical file already exists'
          : 'File already exists with different content (pass force: true to overwrite)',
      };
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');

    return {
      written: true,
      existed: dupCheck.exists,
      identical: dupCheck.identical,
      path: filePath,
    };
  }

  /**
   * Generate React Component Code (TSX)
   */
  static generateReact(options = {}) {
    const compName = this.formatComponentName(options.title || options.slug || 'Illustration');
    const slug = options.slug || 'illustration';
    const title = options.title || slug;
    const assetPath = options.assetPath || `/illustrations/${slug}.svg`;

    return `import React from 'react';

export interface ${compName}Props {
  width?: number | string;
  height?: number | string;
  className?: string;
  alt?: string;
}

export const ${compName}: React.FC<${compName}Props> = ({
  width = '100%',
  height = 'auto',
  className = '',
  alt = '${title.replace(/'/g, "\\'")} illustration',
}) => {
  return (
    <img
      src="${assetPath}"
      alt={alt}
      style={{ width, height }}
      className={\`object-contain \${className}\`}
    />
  );
};

export default ${compName};
`;
  }

  /**
   * Generate Next.js Component Code (TSX with next/image)
   */
  static generateNext(options = {}) {
    const compName = this.formatComponentName(options.title || options.slug || 'Illustration');
    const slug = options.slug || 'illustration';
    const title = options.title || slug;
    const assetPath = options.assetPath || `/illustrations/${slug}.svg`;
    const width = options.width || 400;
    const height = options.height || 300;

    return `import React from 'react';
import Image from 'next/image';

export interface ${compName}Props {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}

export const ${compName}: React.FC<${compName}Props> = ({
  width = ${width},
  height = ${height},
  className = '',
  alt = '${title.replace(/'/g, "\\'")} illustration',
  priority = false,
}) => {
  return (
    <div className={\`relative inline-block \${className}\`}>
      <Image
        src="${assetPath}"
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="w-full h-auto object-contain dark:brightness-110"
      />
    </div>
  );
};

export default ${compName};
`;
  }

  /**
   * Generate Vue 3 Component Code (SFC)
   */
  static generateVue(options = {}) {
    const compName = this.formatComponentName(options.title || options.slug || 'Illustration');
    const slug = options.slug || 'illustration';
    const title = options.title || slug;
    const assetPath = options.assetPath || `/illustrations/${slug}.svg`;
    const width = options.width || 400;
    const height = options.height || 300;

    return `<template>
  <div class="inline-block" :class="customClass">
    <img
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      class="w-full h-auto object-contain dark:brightness-110"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    customClass?: string;
  }>(),
  {
    src: '${assetPath}',
    alt: '${title.replace(/'/g, "\\'")} illustration',
    width: ${width},
    height: ${height},
    customClass: '',
  }
);
</script>
`;
  }

  /**
   * Generate Svelte Component Code
   */
  static generateSvelte(options = {}) {
    const slug = options.slug || 'illustration';
    const title = options.title || slug;
    const assetPath = options.assetPath || `/illustrations/${slug}.svg`;
    const width = options.width || 400;
    const height = options.height || 300;

    return `<script lang="ts">
  export let src: string = '${assetPath}';
  export let alt: string = '${title.replace(/'/g, "\\'")} illustration';
  export let width: number | string = ${width};
  export let height: number | string = ${height};
  export let className: string = '';
</script>

<div class="inline-block {className}">
  <img
    {src}
    {alt}
    {width}
    {height}
    class="w-full h-auto object-contain dark:brightness-110"
  />
</div>
`;
  }

  /**
   * Generate Flutter Widget Code
   */
  static generateFlutter(options = {}) {
    const compName = this.formatComponentName(options.title || options.slug || 'Illustration');
    const slug = options.slug || 'illustration';
    const title = options.title || slug;
    const width = options.width || 400;
    const height = options.height || 300;

    return `import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class ${compName} extends StatelessWidget {
  final double? width;
  final double? height;
  final BoxFit fit;

  const ${compName}({
    Key? key,
    this.width = ${width}.0,
    this.height = ${height}.0,
    this.fit = BoxFit.contain,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      'assets/illustrations/${slug}.svg',
      width: width,
      height: height,
      fit: fit,
      semanticsLabel: '${title.replace(/'/g, "\\'")} illustration',
    );
  }
}
`;
  }

  /**
   * Generate HTML/CSS Snippet
   */
  static generateHtml(options = {}) {
    const slug = options.slug || 'illustration';
    const title = options.title || slug;
    const assetPath = options.assetPath || `/illustrations/${slug}.svg`;

    if (options.svgContent) {
      return `<div class="illustration-container illustration-${slug}" style="display:inline-block; max-width:100%; height:auto;">\n${options.svgContent}\n</div>`;
    }

    return `<img src="${assetPath}" alt="${title.replace(/"/g, '&quot;')} illustration" class="illustration illustration-${slug}" style="max-width:100%; height:auto;" />`;
  }

  /**
   * Dispatch generator by framework name
   * @param {'next'|'react'|'vue'|'svelte'|'flutter'|'html'} framework
   * @param {Object} options
   * @returns {string}
   */
  static generateComponent(framework, options = {}) {
    switch (framework) {
      case 'next':
        return this.generateNext(options);
      case 'react':
        return this.generateReact(options);
      case 'vue':
        return this.generateVue(options);
      case 'svelte':
        return this.generateSvelte(options);
      case 'flutter':
        return this.generateFlutter(options);
      case 'html':
      default:
        return this.generateHtml(options);
    }
  }

  /**
   * High-level integration helper: saves SVG and generates component file
   * @param {Object} params
   * @param {string} params.slug
   * @param {string} params.title
   * @param {string} params.svgContent
   * @param {string} [params.framework]
   * @param {string} [params.cwd=process.cwd()]
   * @param {boolean} [params.force=false]
   * @returns {{ svgResult: Object, componentResult: Object, compName: string }}
   */
  static integrate(params) {
    const cwd = params.cwd || process.cwd();
    const framework = params.framework || this.detectFramework(cwd);
    const paths = this.resolveProjectPaths(framework, cwd);
    const compName = this.formatComponentName(params.title || params.slug);

    const svgFile = path.join(paths.assetDir, `${params.slug}.svg`);
    const svgResult = this.writeFileSafe(svgFile, params.svgContent, {
      force: params.force,
    });

    const extMap = {
      next: '.tsx',
      react: '.tsx',
      vue: '.vue',
      svelte: '.svelte',
      flutter: '.dart',
      html: '.html',
    };
    const compFile = path.join(paths.componentDir, `${compName}${extMap[framework] || '.tsx'}`);

    const assetPath = `${paths.publicAssetPrefix}/${params.slug}.svg`;
    const componentCode = this.generateComponent(framework, {
      compName,
      slug: params.slug,
      title: params.title,
      assetPath,
      svgContent: params.svgContent,
    });

    const componentResult = this.writeFileSafe(compFile, componentCode, {
      force: params.force,
    });

    return {
      framework,
      compName,
      svgResult,
      componentResult,
      assetPath,
    };
  }
}

module.exports = {
  IntegrationEngine,
};
